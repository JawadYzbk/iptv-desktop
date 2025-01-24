package main

import (
	"embed"
	"iptv-desktop/service"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()
	db, err := service.NewDB()
	if err != nil {
		log.Fatalln(err)
	}
	defer db.Close()

	configStore, err := service.NewConfigStore(db)
	if err != nil {
		log.Fatalln(err)
	}
	cacheStore, err := service.NewCacheStore(configStore)
	if err != nil {
		log.Fatalln(err)
	}
	iptv, err := service.NewIPTV(configStore, cacheStore, db, &app.ctx)
	if err != nil {
		log.Fatalln(err)
	}

	proxy, err := service.NewProxy(&app.ctx, configStore)
	if err != nil {
		log.Fatalln(err)
	}

	currentConfig := configStore.GetConfig()

	isCustomTitlebar := !currentConfig.UserInterface.IsUseSystemTitlebar

	var windowStartState options.WindowStartState
	if currentConfig.UserInterface.IsMaximizeAtStartup {
		windowStartState = options.Maximised
	} else {
		windowStartState = options.Normal
	}

	err = wails.Run(&options.App{
		Title:            "IPTV Desktop",
		Width:            1280,
		Height:           720,
		WindowStartState: windowStartState,
		StartHidden:      true,
		AssetServer: &assetserver.Options{
			Assets:     assets,
			Middleware: proxy.Middleware,
		},
		BackgroundColour: &options.RGBA{R: 9, G: 9, B: 16, A: 1},
		Frameless:        isCustomTitlebar,
		OnStartup:        app.startup,
		OnDomReady:       app.onDomReady,
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
		Windows: &windows.Options{
			Theme: windows.Dark,
		},
		Linux: &linux.Options{
			WebviewGpuPolicy: linux.WebviewGpuPolicyAlways,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
