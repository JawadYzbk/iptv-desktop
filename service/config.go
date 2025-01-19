package service

import "strconv"

type AppConfigIPTV struct {
	IsOverrideApi       bool   `json:"isOverrideApi"`
	ApiUrl              string `json:"apiUrl"`
	CacheDuration       int    `json:"cacheDuration"`
	IsUseAltChannelName bool   `json:"isUseAltChannelName"`
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
		},
		Network: AppConfigNetwork{
			IsUseDOH:       false,
			DOHResolverUrl: "https://chrome.cloudflare-dns.com/dns-query",
		},
		Caption: AppConfigCaption{
			IsAutoShow: false,
		},
		UserInterface: AppConfigUserInterface{
			IsUseSystemTitlebar: true,
		},
	}
}

func (c *ConfigStore) loadDB() error {
	dbConfig, err := c.db.GetAllConfig()
	if err != nil {
		return err
	}

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
		case "network.isUseDOH":
			c.config.Network.IsUseDOH = config.Value == "1"
		case "network.dohResolverUrl":
			c.config.Network.DOHResolverUrl = config.Value
		case "caption.isAutoShow":
			c.config.Caption.IsAutoShow = config.Value == "1"
		case "userInterface.isUseSystemTitlebar":
			c.config.UserInterface.IsUseSystemTitlebar = config.Value == "1"

		default:
			c.db.DeleteConfig(config.Key)
		}
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

func (c *ConfigStore) GetConfig() Config {
	return *c.config
}
