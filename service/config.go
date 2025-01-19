package service

import (
	"encoding/gob"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/adrg/xdg"
)

type IPTVViewConfig struct {
	Filter string  `json:"filter"`
	Code   *string `json:"code"`
}

type AppConfigIPTV struct {
	IsOverrideApi       bool    `json:"isOverrideApi"`
	ApiUrl              *string `json:"apiUrl"`
	CacheDuration       int     `json:"cacheDuration"`
	IsUseAltChannelName bool    `json:"isUseAltChannelName"`
}

type AppConfigNetwork struct {
	IsUseDOH       bool    `json:"isUseDOH"`
	DOHResolverUrl *string `json:"dohResolverUrl"`
}

type AppConfigCaption struct {
	IsAutoShow     bool `json:"isAutoShow"`
	IsEnableCEA708 bool `json:"isEnableCEA708"`
}

type AppConfigUserInterface struct {
	IsUseSystemTitlebar bool `json:"isUseSystemTitlebar"`
}

type AppConfig struct {
	IPTV          AppConfigIPTV          `json:"iptv"`
	Network       AppConfigNetwork       `json:"network"`
	Caption       AppConfigCaption       `json:"caption"`
	UserInterface AppConfigUserInterface `json:"userInterface"`
}

type Config struct {
	Version  int            `json:"version"`
	IPTVView IPTVViewConfig `json:"iptvView"`
	App      AppConfig      `json:"app"`
}

func DefaultValues() Config {
	apiUrl := "https://iptv-org.github.io/api"
	dohResolverUrl := "https://chrome.cloudflare-dns.com/dns-query"
	return Config{
		Version: 1,
		IPTVView: IPTVViewConfig{
			Filter: "country",
		},
		App: AppConfig{
			IPTV: AppConfigIPTV{
				IsOverrideApi:       false,
				ApiUrl:              &apiUrl,
				CacheDuration:       60 * 60 * 24,
				IsUseAltChannelName: true,
			},
			Network: AppConfigNetwork{
				IsUseDOH:       false,
				DOHResolverUrl: &dohResolverUrl,
			},
			Caption: AppConfigCaption{
				IsAutoShow:     false,
				IsEnableCEA708: false,
			},
			UserInterface: AppConfigUserInterface{
				IsUseSystemTitlebar: true,
			},
		},
	}
}

type ConfigStore struct {
	configPath string
	config     *Config
}

func NewConfigStore() (*ConfigStore, error) {
	configFilePath, err := xdg.ConfigFile("iptv-desktop/config.gob")
	if err != nil {
		return nil, fmt.Errorf("could not resolve path for config file: %w", err)
	}

	var config Config = DefaultValues()

	dir, _ := filepath.Split(configFilePath)
	_, err = os.Stat(dir)
	if os.IsNotExist(err) {
		os.MkdirAll(dir, 0755)
	}

	buf, err := os.Open(configFilePath)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Fatalln("could not read the configuration file: %w", err)
		}
	} else {
		decoder := gob.NewDecoder(buf)
		_ = decoder.Decode(&config)
	}
	defer buf.Close()

	return &ConfigStore{
		configPath: configFilePath,
		config:     &config,
	}, nil
}

func (s *ConfigStore) GetIPTVView() IPTVViewConfig {
	return s.config.IPTVView
}

func (s *ConfigStore) GetApp() AppConfig {
	return s.config.App
}

func (s *ConfigStore) SetIPTVView(view IPTVViewConfig) {
	s.config.IPTVView = view
}

func (s *ConfigStore) SetApp(app AppConfig) {
	s.config.App = app
}

func (s *ConfigStore) Save() {
	f, err := os.Create(s.configPath)
	if err != nil {
		log.Fatalln("failed create config")
	}
	defer f.Close()
	clonedConfig := *s.config
	if !clonedConfig.App.IPTV.IsOverrideApi {
		clonedConfig.App.IPTV.ApiUrl = nil
	}
	if !clonedConfig.App.Network.IsUseDOH {
		clonedConfig.App.Network.DOHResolverUrl = nil
	}

	encoder := gob.NewEncoder(f)
	_ = encoder.Encode(clonedConfig)
}
