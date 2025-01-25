package service

import (
	"context"
	"io"
	"net"
	"net/http"
	"net/url"
	"slices"
	"strings"

	"github.com/ncruces/go-dns"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Proxy struct {
	ctx         *context.Context
	configStore *ConfigStore
	client      *http.Client
}

func NewProxy(ctx *context.Context, cs *ConfigStore) (*Proxy, error) {
	var client *http.Client
	config := cs.config.Network
	if !config.IsUseDOH {
		client = &http.Client{}
	} else {
		dohUrl := config.DOHResolverUrl
		dohResolver, err := dns.NewDoHResolver(dohUrl, dns.DoHCache())
		if err != nil {
			return nil, err
		}
		net.DefaultResolver = dohResolver
		client = &http.Client{}
	}

	newProxy := &Proxy{
		ctx:         ctx,
		configStore: cs,
		client:      client,
	}

	return newProxy, nil
}

func (p *Proxy) Middleware(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/image-proxy") {
			p.handleRequest(w, r, true)
			return
		}
		if strings.HasPrefix(r.URL.Path, "/proxy") {
			p.handleRequest(w, r, false)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (p *Proxy) handleRequest(w http.ResponseWriter, r *http.Request, isWithCacheHeader bool) {
	splittedPath := strings.Split(r.URL.Path, "/")
	scheme := splittedPath[2]
	restPath := splittedPath[3:]

	fullUrl := scheme + "://" + strings.Join(restPath, "/")
	if r.URL.RawQuery != "" {
		fullUrl += "?" + r.URL.RawQuery
	}

	newUrl, err := url.Parse(fullUrl)
	if err != nil {
		p.writeError(w, err)
		return
	}
	newReq, err := http.NewRequest(r.Method, newUrl.String(), r.Body)
	if err != nil {
		p.writeError(w, err)
		return
	}

	var customHeaders = map[string]string{}
	customHeaderPrefix := "X-Custom-"

	for key, values := range r.Header {
		for _, value := range values {
			if strings.HasPrefix(key, customHeaderPrefix) {
				newKey := key[len(customHeaderPrefix):]
				customHeaders[newKey] = value
				continue
			}
			newReq.Header.Add(key, value)
		}
	}
	for key, value := range customHeaders {
		newReq.Header.Del(key)
		newReq.Header.Add(key, value)
	}

	resp, err := p.client.Do(newReq)
	if err != nil {
		p.writeError(w, err)
		return
	}
	defer resp.Body.Close()

	for key, value := range resp.Header {
		if key == "Access-Control-Allow-Origin" || key == "Access-Control-Allow-Headers" || (isWithCacheHeader && key == "Cache-Control") {
			continue
		}
		for _, item := range value {
			w.Header().Add(key, item)
		}
	}

	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Access-Control-Allow-Headers", "*")
	if isWithCacheHeader {
		w.Header().Add("Cache-Control", "public, max-age=2592000")
	}

	var m3u8MimeTypes = []string{
		"application/vnd.apple.mpegurl",
		"application/mpegurl",
		"application/x-mpegurl",
		"audio/mpegurl",
		"audio/x-mpegurl",
		"application/vnd.apple.mpegurl.audio",
	}

	if slices.Contains(m3u8MimeTypes, resp.Header.Get("Content-Type")) {
		w.Header().Del("Cache-Control")
		w.Header().Del("Pragma")
		w.Header().Del("Expires")

		w.Header().Add("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Add("Pragma", "no-cache")
		w.Header().Add("Expires", "0")

		w.WriteHeader(resp.StatusCode)

		p.handleM3U8(w, resp)
		return
	}

	w.WriteHeader(resp.StatusCode)

	io.Copy(w, resp.Body)
}

func (p *Proxy) writeError(w http.ResponseWriter, err error) {

	runtime.LogError(*p.ctx, err.Error())

	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte(err.Error()))
}

func (p *Proxy) handleM3U8(w http.ResponseWriter, remoteResponse *http.Response) {
	content, err := io.ReadAll(remoteResponse.Body)
	if err != nil {
		p.writeError(w, err)
		return
	}
	lines := strings.Split(strings.ReplaceAll(string(content), "\r\n", "\n"), "\n")
	var newLines []string
	originalUrl := remoteResponse.Request.URL

	for _, line := range lines {
		if strings.HasPrefix(line, "#") || line == "" || line == "\n" {
			newLines = append(newLines, line)
			continue
		}
		replacedUrl := p.relativeToAbsoluteUrl(originalUrl, line)
		newLines = append(newLines, replacedUrl)
	}

	fullBody := strings.Join(newLines, "\n")

	w.Write([]byte(fullBody))
}

func (p *Proxy) relativeToAbsoluteUrl(currentUrl *url.URL, targetPath string) string {
	if strings.HasPrefix(targetPath, "http://") || strings.HasPrefix(targetPath, "https://") {
		return targetPath
	}
	absolute := currentUrl.ResolveReference(&url.URL{
		Path: targetPath,
	})
	return absolute.String()
}
