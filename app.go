package main

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) WindowShow() {
	runtime.WindowShow(a.ctx)
}

func (a *App) EnterFullScreen() {
	runtime.WindowFullscreen(a.ctx)
}

func (a *App) IsFullScreen() bool {
	return runtime.WindowIsFullscreen(a.ctx)
}

func (a *App) ExitFullScreen() {
	runtime.WindowUnfullscreen(a.ctx)
}

func (a *App) ToggleMaximize() {
	runtime.WindowToggleMaximise(a.ctx)
}

func (a *App) Minimize() {
	runtime.WindowMinimise(a.ctx)
}

func (a *App) Quit() {
	runtime.Quit(a.ctx)
}
