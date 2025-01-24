package service

import (
	"runtime"
	"strconv"
)

type AppConfigIPTV struct {
	IsOverrideApi       bool   `json:"isOverrideApi"`
	ApiUrl              string `json:"apiUrl"`
	CacheDuration       int    `json:"cacheDuration"`
	IsUseAltChannelName bool   `json:"isUseAltChannelName"`
	IsHideNSFWChannel   bool   `json:"isHideNSFWChannel"`
}

type AppConfigNetwork struct {
	IsUseDOH       bool   `json:"isUseDOH"`
	DOHResolverUrl string `json:"dohResolverUrl"`
}

type AppConfigCaption struct {
	IsAutoShow bool `json:"isAutoShow"`
}

type AppConfigUserInterface struct {
	IsUseSystemTitlebar bool `json:"isUseSystemTitlebar"`
	IsMaximizeAtStartup bool `json:"isMaximizeAtStartup"`
}

type Config struct {
	IPTV          AppConfigIPTV          `json:"iptv"`
	Network       AppConfigNetwork       `json:"network"`
	Caption       AppConfigCaption       `json:"caption"`
	UserInterface AppConfigUserInterface `json:"userInterface"`
}

type ConfigStore struct {
	db     *DB
	config *Config
}

func NewConfigStore(db *DB) (*ConfigStore, error) {
	newConfigStore := &ConfigStore{
		db: db,
	}
	defaultCfg := newConfigStore.DefaultConfig()
	newConfigStore.config = &defaultCfg

	err := newConfigStore.loadDB()
	if err != nil {
		return nil, err
	}

	return newConfigStore, nil
}

func (cs *ConfigStore) DefaultConfig() Config {
	return Config{
		IPTV: AppConfigIPTV{
			IsOverrideApi:       false,
			ApiUrl:              "https://iptv-org.github.io/api",
			CacheDuration:       60 * 60 * 24,
			IsUseAltChannelName: true,
			IsHideNSFWChannel:   true,
		},
		Network: AppConfigNetwork{
			IsUseDOH:       false,
			DOHResolverUrl: "https://chrome.cloudflare-dns.com/dns-query",
		},
		Caption: AppConfigCaption{
			IsAutoShow: false,
		},
		UserInterface: AppConfigUserInterface{
			IsUseSystemTitlebar: runtime.GOOS != "windows",
			IsMaximizeAtStartup: true,
		},
	}
}

func (c *ConfigStore) loadDB() error {
	dbConfig, err := c.db.GetAllConfig()
	if err != nil {
		return err
	}

	var deletedKeys []any

	for _, config := range *dbConfig {
		switch config.Key {
		case "iptv.isOverrideApi":
			c.config.IPTV.IsOverrideApi = config.Value == "1"
		case "iptv.apiUrl":
			c.config.IPTV.ApiUrl = config.Value
		case "iptv.cacheDuration":
			intVal, err := strconv.Atoi(config.Value)
			if err == nil {
				c.config.IPTV.CacheDuration = intVal
			}
		case "iptv.isUseAltChannelName":
			c.config.IPTV.IsUseAltChannelName = config.Value == "1"
		case "iptv.isHideNSFWChannel":
			c.config.IPTV.IsHideNSFWChannel = config.Value == "1"

		case "network.isUseDOH":
			c.config.Network.IsUseDOH = config.Value == "1"
		case "network.dohResolverUrl":
			c.config.Network.DOHResolverUrl = config.Value

		case "caption.isAutoShow":
			c.config.Caption.IsAutoShow = config.Value == "1"

		case "userInterface.isUseSystemTitlebar":
			c.config.UserInterface.IsUseSystemTitlebar = config.Value == "1"
		case "userInterface.isMaximizeAtStartup":
			c.config.UserInterface.IsMaximizeAtStartup = config.Value == "1"

		default:
			deletedKeys = append(deletedKeys, config.Key)
		}
	}

	if len(deletedKeys) > 0 {
		c.db.DeleteConfigs(deletedKeys)
	}

	return nil
}

func (c *ConfigStore) RefreshConfig() *string {
	err := c.loadDB()
	if err != nil {
		errStr := err.Error()
		return &errStr
	}

	return nil
}

func (c *ConfigStore) SetConfigs(configs map[string]string) *string {
	var dbConfigs []dbConfig
	for key, value := range configs {
		dbConfigs = append(dbConfigs, dbConfig{
			Key:   key,
			Value: value,
		})
	}

	err := c.db.SetMultipleConfig(dbConfigs)
	if err != nil {
		errStr := err.Error()
		return &errStr
	}

	return nil
}

func (c *ConfigStore) DeleteConfigs(keys []any) *string {
	err := c.db.DeleteConfigs(keys)
	if err != nil {
		errStr := err.Error()
		return &errStr
	}

	return nil
}

func (c *ConfigStore) GetConfig() Config {
	return *c.config
}
