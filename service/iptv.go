package service

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"slices"
)

type IPTV struct {
	ctx     *context.Context
	BaseURL string      `json:"baseURL"`
	Cache   *CacheStore `json:"cacheStore"`
}

func NewIPTV(baseURL string, cache *CacheStore, ctx *context.Context) (*IPTV, error) {
	return &IPTV{
		ctx:     ctx,
		BaseURL: baseURL,
		Cache:   cache,
	}, nil
}

func (iptv *IPTV) get(path string, result any) error {
	url := iptv.BaseURL + "/" + path

	client := http.Client{
		Timeout: 0,
	}

	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0")

	res, err := client.Do(req)
	if err != nil {
		return err
	}

	if res.Body != nil {
		defer res.Body.Close()
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}

	err = json.Unmarshal(body, result)
	if err != nil {
		return err
	}

	return nil
}

type Country struct {
	Name      string   `json:"name"`
	Code      string   `json:"code"`
	Languages []string `json:"languages"`
	Flag      string   `json:"flag"`
}

type CountriesResult struct {
	Error *string    `json:"error"`
	Data  *[]Country `json:"data"`
}

func (iptv *IPTV) GetAllCountry() CountriesResult {
	var result []Country
	err := iptv.Cache.GetOrSetCache(COUNTRIES, &result, func() error {
		return iptv.get("countries.json", &result)
	})
	if err != nil {
		errStr := err.Error()
		return CountriesResult{
			Error: &errStr,
		}
	}
	return CountriesResult{
		Data: &result,
	}
}

type Category struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type CategoriesResult struct {
	Error *string     `json:"error"`
	Data  *[]Category `json:"data"`
}

func (iptv *IPTV) GetAllCategory() CategoriesResult {
	var result []Category
	err := iptv.Cache.GetOrSetCache(CATEGORIES, &result, func() error {
		return iptv.get("categories.json", &result)
	})
	if err != nil {
		errStr := err.Error()
		return CategoriesResult{
			Error: &errStr,
		}
	}
	return CategoriesResult{
		Data: &result,
	}
}

type Language struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

type LanguagesResult struct {
	Error *string     `json:"error"`
	Data  *[]Language `json:"data"`
}

func (iptv *IPTV) GetAllLanguage() LanguagesResult {
	var result []Language
	err := iptv.Cache.GetOrSetCache(LANGUAGES, &result, func() error {
		return iptv.get("languages.json", &result)
	})
	if err != nil {
		errStr := err.Error()
		return LanguagesResult{
			Error: &errStr,
		}
	}
	return LanguagesResult{
		Data: &result,
	}
}

type Channel struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	AltNames      []string `json:"alt_names"`
	Network       *string  `json:"network"`
	Owners        []string `json:"owners"`
	Country       string   `json:"country"`
	Subdivision   *string  `json:"subdivision"`
	City          *string  `json:"city"`
	BroadcastArea []string `json:"broadcast_area"`
	Languages     []string `json:"languages"`
	Categories    []string `json:"categories"`
	IsNSFW        bool     `json:"is_nsfw"`
	Launched      *string  `json:"launched"`
	Closed        *string  `json:"closed"`
	ReplacedBy    *string  `json:"replaced_by"`
	Website       *string  `json:"website"`
	Logo          string   `json:"logo"`
}

type ChannelsResult struct {
	Error *string    `json:"error"`
	Data  *[]Channel `json:"data"`
}

func (iptv *IPTV) getAllChannel() ChannelsResult {
	var result []Channel
	err := iptv.Cache.GetOrSetCache(CHANNELS, &result, func() error {
		return iptv.get("channels.json", &result)
	})
	if err != nil {
		errStr := err.Error()
		return ChannelsResult{
			Error: &errStr,
		}
	}
	return ChannelsResult{
		Data: &result,
	}
}

type Stream struct {
	Channel      string  `json:"channel"`
	URL          string  `json:"url"`
	Timeshift    *string `json:"timeshift"`
	HttpReferrer *string `json:"http_referrer"`
	UserAgent    *string `json:"user_agent"`
}

type StreamsResult struct {
	Error *string   `json:"error"`
	Data  *[]Stream `json:"data"`
}

func (iptv *IPTV) getAllStream() StreamsResult {
	var result []Stream
	err := iptv.Cache.GetOrSetCache(STREAMS, &result, func() error {
		return iptv.get("streams.json", &result)
	})
	if err != nil {
		errStr := err.Error()
		return StreamsResult{
			Error: &errStr,
		}
	}
	return StreamsResult{
		Data: &result,
	}
}

func (iptv *IPTV) getAllChannelStreamParallel() (*[]Channel, *[]Stream, error) {
	channelChan := make(chan ChannelsResult)
	streamChan := make(chan StreamsResult)

	go func() {
		channelChan <- iptv.getAllChannel()
	}()

	go func() {
		streamChan <- iptv.getAllStream()
	}()

	channelRes, streamRes := <-channelChan, <-streamChan

	if channelRes.Error != nil {
		return nil, nil, errors.New(*channelRes.Error)
	}
	if streamRes.Error != nil {
		return nil, nil, errors.New(*streamRes.Error)
	}

	return channelRes.Data, streamRes.Data, nil
}

func (iptv *IPTV) getChannelsHasStream() (*[]Channel, error) {
	var results []Channel
	err := iptv.Cache.GetOrSetCache(CHANNEL_HAS_STREAM, &results, func() error {
		channels, streams, err := iptv.getAllChannelStreamParallel()
		if err != nil {
			return err
		}

		channelIds := map[string]struct{}{}
		for _, item := range *streams {
			channelIds[item.Channel] = struct{}{}
		}

		for _, channel := range *channels {
			if _, exist := channelIds[channel.ID]; exist {
				results = append(results, channel)
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}
	return &results, nil
}

type IPTVFilter string

const (
	COUNTRY  IPTVFilter = "COUNTRY"
	CATEGORY IPTVFilter = "CATEGORY"
	LANGUAGE IPTVFilter = "LANGUAGE"
)

var AllIPTVFilter = []struct {
	Value  IPTVFilter
	TSName string
}{
	{COUNTRY, "COUNTRY"},
	{CATEGORY, "CATEGORY"},
	{LANGUAGE, "LANGUAGE"},
}

func (iptv *IPTV) GetFilteredChannels(filter IPTVFilter, code string) ChannelsResult {
	var filterFn func(Channel) bool
	switch filter {
	case COUNTRY:
		filterFn = func(c Channel) bool { return c.Country == code }
	case CATEGORY:
		filterFn = func(c Channel) bool { return slices.Contains(c.Categories, code) }
	case LANGUAGE:
		filterFn = func(c Channel) bool { return slices.Contains(c.Languages, code) }
	default:
		return ChannelsResult{}
	}

	channels, err := iptv.getChannelsHasStream()
	if err != nil {
		errStr := err.Error()
		return ChannelsResult{
			Error: &errStr,
		}
	}
	filteredChannels := []Channel{}

	for _, item := range *channels {
		if filterFn(item) {
			filteredChannels = append(filteredChannels, item)
		}
	}

	return ChannelsResult{
		Data: &filteredChannels,
	}
}

type ChannelWithStreams struct {
	Channel
	Streams []Stream `json:"streams"`
}

type ChannelWithStreamsResult struct {
	Error *string             `json:"error"`
	Data  *ChannelWithStreams `json:"data"`
}

func (iptv *IPTV) GetChannelWithStream(channelId string) ChannelWithStreamsResult {
	channels, streams, err := iptv.getAllChannelStreamParallel()
	if err != nil {
		errStr := err.Error()
		return ChannelWithStreamsResult{
			Error: &errStr,
		}
	}
	var channel *Channel
	for _, ch := range *channels {
		if ch.ID == channelId {
			currentItem := ch
			channel = &currentItem
		}
	}
	if channel == nil {
		errStr := "Channel not found!"
		return ChannelWithStreamsResult{
			Error: &errStr,
		}
	}

	var listStream []Stream
	for _, stream := range *streams {
		if stream.Channel == channelId {
			listStream = append(listStream, stream)
		}
	}

	result := ChannelWithStreams{
		Channel: *channel,
		Streams: listStream,
	}
	return ChannelWithStreamsResult{
		Data: &result,
	}
}
