package service

import (
	"encoding/gob"
	"os"
	"path/filepath"
	"time"

	"github.com/adrg/xdg"
)

type CacheType string

const (
	COUNTRIES          CacheType = "countries"
	CATEGORIES         CacheType = "categories"
	LANGUAGES          CacheType = "languages"
	CHANNELS           CacheType = "channels"
	STREAMS            CacheType = "stream"
	CHANNEL_HAS_STREAM CacheType = "channel_has_stream"
)

var AllCacheType = []struct {
	Value  CacheType
	TSName string
}{
	{COUNTRIES, "COUNTRIES"},
	{CATEGORIES, "CATEGORIES"},
	{LANGUAGES, "LANGUAGES"},
	{CHANNELS, "CHANNELS"},
	{STREAMS, "STREAMS"},
	{CHANNEL_HAS_STREAM, "CHANNEL_HAS_STREAM"},
}

type CacheStore struct {
	config  *ConfigStore
	BaseDir string
}

func NewCacheStore(config *ConfigStore) (*CacheStore, error) {

	baseDir := filepath.Join(xdg.CacheHome, "iptv-desktop")
	_, err := os.Stat(baseDir)
	if os.IsNotExist(err) {
		os.MkdirAll(baseDir, 0755)
	} else if err != nil {
		return nil, err
	}

	return &CacheStore{
		config:  config,
		BaseDir: baseDir,
	}, nil
}

func (cs *CacheStore) getPath(name CacheType) string {
	finalPath := filepath.Join(cs.BaseDir, string(name)+".gob")

	return finalPath
}

func (cs *CacheStore) getCache(name CacheType, pointer any) (bool, error) {
	fullPath := cs.getPath(name)
	stat, err := os.Stat(fullPath)
	if os.IsNotExist(err) {
		return false, nil
	} else if err != nil {
		return false, err
	}
	now := time.Now()
	fileExp := stat.ModTime().Add(time.Second * time.Duration(cs.config.config.IPTV.CacheDuration))
	if fileExp.Before(now) {
		err := os.Remove(fullPath)
		if err != nil {
			return false, err
		}
		return false, nil
	}

	buf, err := os.Open(fullPath)
	if err != nil {
		return false, err
	}
	defer buf.Close()
	decoder := gob.NewDecoder(buf)

	err = decoder.Decode(pointer)
	if err != nil {
		return false, err
	}

	return true, nil
}

func (cs *CacheStore) saveCache(name CacheType, content any) error {
	fullPath := cs.getPath(name)
	f, err := os.Create(fullPath)
	if err != nil {
		return err
	}
	defer f.Close()

	encoder := gob.NewEncoder(f)
	err = encoder.Encode(content)
	if err != nil {
		return err
	}

	return nil
}

func (cs *CacheStore) GetOrSetCache(name CacheType, pointer any, getContent func() error) error {
	isExist, err := cs.getCache(name, pointer)
	if err != nil {
		return err
	}
	if isExist {
		return nil
	}
	err = getContent()
	if err != nil {
		return err
	}
	err = cs.saveCache(name, pointer)
	if err != nil {
		return err
	}

	return nil
}

func (cs *CacheStore) DeleteAllCache() bool {
	for _, item := range AllCacheType {
		fullPath := cs.getPath(item.Value)
		_, err := os.Stat(fullPath)
		if os.IsNotExist(err) {
			continue
		}

		err = os.Remove(fullPath)
		if err != nil {
			return false
		}
	}

	return true
}
