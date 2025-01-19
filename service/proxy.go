package service

import (
	"context"
	"io"
	"net"
	"net/http"
	"net/url"
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
	config := cs.GetApp().Network
	if !config.IsUseDOH {
		client = &http.Client{}
	} else {
		dohUrl := config.DOHResolverUrl
		dohResolver, err := dns.NewDoHResolver(*dohUrl, dns.DoHCache())
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
			p.handleImage(w, r)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (p *Proxy) handleImage(w http.ResponseWriter, r *http.Request) {
	reqUrl := r.URL.Query().Get("url")

	newUrl, err := url.Parse(reqUrl)
	if err != nil {
		p.writeError(w, err)
		return
	}
	newReq, err := http.NewRequest(r.Method, newUrl.String(), r.Body)
	if err != nil {
		p.writeError(w, err)
		return
	}

	for key, values := range r.Header {
		for _, value := range values {
			newReq.Header.Add(key, value)
		}
	}

	resp, err := p.client.Do(newReq)
	if err != nil {
		p.writeError(w, err)
		return
	}
	defer resp.Body.Close()

	for key, value := range resp.Header {
		if key == "Access-Control-Allow-Origin" || key == "Cache-Control" {
			continue
		}
		for _, item := range value {
			w.Header().Add(key, item)
		}
	}

	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Header().Add("Cache-Control", "public, max-age=2592000")

	w.WriteHeader(resp.StatusCode)

	io.Copy(w, resp.Body)
}

func (p *Proxy) writeError(w http.ResponseWriter, err error) {

	runtime.LogError(*p.ctx, err.Error())

	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte(err.Error()))
}
