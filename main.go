package main

import (
	"embed"
	"iptv-desktop/service"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()
	configStore, err := service.NewConfigStore()
	if err != nil {
		log.Fatalln(err)
	}
	cacheStore, err := service.NewCacheStore(configStore.GetApp().IPTV.CacheDuration)
	if err != nil {
		log.Fatalln(err)
	}
	iptv, err := service.NewIPTV(*configStore.GetApp().IPTV.ApiUrl, cacheStore, &app.ctx)
	if err != nil {
		log.Fatalln(err)
	}

	proxy, err := service.NewProxy(&app.ctx, configStore)
	if err != nil {
		log.Fatalln(err)
	}

	err = wails.Run(&options.App{
		Title:  "IPTV Desktop",
		Width:  1280,
		Height: 720,
		AssetServer: &assetserver.Options{
			Assets:     assets,
			Middleware: proxy.Middleware,
		},
		BackgroundColour: &options.RGBA{R: 9, G: 9, B: 16, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			cacheStore,
			configStore,
			iptv,
		},
		EnumBind: []interface{}{
			service.AllCacheType,
			service.AllIPTVFilter,
		},
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: "0d2b04cc-8332-4ec0-8e40-cc84e6f28299",
		},
		DragAndDrop: &options.DragAndDrop{
			EnableFileDrop:     false,
			DisableWebViewDrop: true,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
