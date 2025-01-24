package service

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"slices"
	"strconv"
)

type IPTV struct {
	ctx    *context.Context
	config *ConfigStore
	cache  *CacheStore
	db     *DB
}

func NewIPTV(config *ConfigStore, cache *CacheStore, db *DB, ctx *context.Context) (*IPTV, error) {
	return &IPTV{
		ctx:    ctx,
		config: config,
		cache:  cache,
		db:     db,
	}, nil
}

func (iptv *IPTV) get(path string, result any) error {
	url := iptv.config.config.IPTV.ApiUrl + "/" + path

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
	err := iptv.cache.GetOrSetCache(COUNTRIES, &result, func() error {
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
	err := iptv.cache.GetOrSetCache(CATEGORIES, &result, func() error {
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
	err := iptv.cache.GetOrSetCache(LANGUAGES, &result, func() error {
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
	err := iptv.cache.GetOrSetCache(CHANNELS, &result, func() error {
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
	err := iptv.cache.GetOrSetCache(STREAMS, &result, func() error {
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
	err := iptv.cache.GetOrSetCache(CHANNEL_HAS_STREAM, &results, func() error {
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

	if !iptv.config.config.IPTV.IsHideNSFWChannel {
		return &results, nil
	}

	var newRes []Channel
	for _, item := range results {
		if !item.IsNSFW {
			newRes = append(newRes, item)
		}
	}
	return &newRes, nil
}

type IPTVFilter string

const (
	COUNTRY  IPTVFilter = "COUNTRY"
	CATEGORY IPTVFilter = "CATEGORY"
	LANGUAGE IPTVFilter = "LANGUAGE"
	PLAYLIST IPTVFilter = "PLAYLIST"
)

var AllIPTVFilter = []struct {
	Value  IPTVFilter
	TSName string
}{
	{COUNTRY, "COUNTRY"},
	{CATEGORY, "CATEGORY"},
	{LANGUAGE, "LANGUAGE"},
	{PLAYLIST, "PLAYLIST"},
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
	case PLAYLIST:
		playlistId, err := strconv.Atoi(code)
		if err != nil {
			errStr := err.Error()
			return ChannelsResult{
				Error: &errStr,
			}
		}
		playlistItems, err := iptv.db.ListPlaylistItem(playlistId)
		if err != nil {
			errStr := err.Error()
			return ChannelsResult{
				Error: &errStr,
			}
		}
		var channelIds []string
		for _, item := range *playlistItems {
			channelIds = append(channelIds, item.ChannelID)
		}
		filterFn = func(c Channel) bool {
			return slices.Contains(channelIds, c.ID)
		}
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

type PlaylistsResult struct {
	Error *string     `json:"error"`
	Data  *[]Playlist `json:"data"`
}

func (iptv *IPTV) GetAllPlaylist() PlaylistsResult {
	playlists, err := iptv.db.ListPlaylist()
	if err != nil {
		errStr := err.Error()
		return PlaylistsResult{
			Error: &errStr,
		}
	}

	return PlaylistsResult{
		Data: playlists,
	}
}

type SinglePlaylistResult struct {
	Error *string   `json:"error"`
	Data  *Playlist `json:"data"`
}

func (iptv *IPTV) CreatePlaylist(title string) SinglePlaylistResult {
	result, err := iptv.db.CreatePlaylist(title)
	if err != nil {
		errStr := err.Error()
		return SinglePlaylistResult{
			Error: &errStr,
		}
	}

	return SinglePlaylistResult{
		Data: result,
	}
}

func (iptv *IPTV) UpdatePlaylist(playlistId int, title string) SinglePlaylistResult {
	result, err := iptv.db.UpdatePlaylist(playlistId, title)
	if err != nil {
		errStr := err.Error()
		return SinglePlaylistResult{
			Error: &errStr,
		}
	}

	return SinglePlaylistResult{
		Data: result,
	}
}

func (iptv *IPTV) DeletePlaylist(playlistId int) *string {
	err := iptv.db.DeletePlaylist(playlistId)
	if err != nil {
		errStr := err.Error()
		return &errStr
	}

	return nil
}

type PlaylistItemsResult struct {
	Error *string         `json:"error"`
	Data  *[]PlaylistItem `json:"data"`
}

func (iptv *IPTV) GetAllChannelPlaylistItem(channelId string) PlaylistItemsResult {
	playlists, err := iptv.db.ListChannelPlaylist(channelId)
	if err != nil {
		errStr := err.Error()
		return PlaylistItemsResult{
			Error: &errStr,
		}
	}

	return PlaylistItemsResult{
		Data: playlists,
	}
}

type SinglePlaylistItemResult struct {
	Error *string       `json:"error"`
	Data  *PlaylistItem `json:"data"`
}

func (iptv *IPTV) CreatePlaylistItem(playlistId int, channelId string) SinglePlaylistItemResult {
	result, err := iptv.db.CreatePlaylistItem(playlistId, channelId)
	if err != nil {
		errStr := err.Error()
		return SinglePlaylistItemResult{
			Error: &errStr,
		}
	}

	return SinglePlaylistItemResult{
		Data: result,
	}
}

func (iptv *IPTV) DeletePlaylistItem(playlistId int, channelId string) *string {
	err := iptv.db.DeletePlaylistItem(playlistId, channelId)
	if err != nil {
		errStr := err.Error()
		return &errStr
	}

	return nil
}
