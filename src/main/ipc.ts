import { FILTER_TYPE } from '../preload/iptv.type';
import {
  getAllCategory,
  getAllCountry,
  getAllLanguage,
  getFilteredActiveChannel,
  resolveChannelLogo,
  getSingleChannelWithStream
} from './iptv';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { clearAllCache } from './cache';
import config, { defaultAppConifg } from './config';
import { AppConfig } from '../preload/config.type';
import { setupDOH } from './network';
import { spawn } from 'child_process';
import { existsSync } from 'fs';

export class IPCHandler {
  private _mainWindow?: BrowserWindow;
  private _createMainWindow?: (hash: string) => void;

  public setMainWindow(window: BrowserWindow) {
    this._mainWindow = window;
  }
  public setCreateMainWindow(fn: (hasn: string) => void) {
    this._createMainWindow = fn;
  }

  public registerIPC() {
    ipcMain.handle('getAllCountry', getAllCountry);
    ipcMain.handle('getAllCategory', getAllCategory);
    ipcMain.handle('getAllLanguage', getAllLanguage);
    ipcMain.handle('getFilteredActiveChannel', (_e, type, code) =>
      getFilteredActiveChannel(type, code)
    );
    ipcMain.handle('getSingleChannelWithStream', (_e, channel) =>
      getSingleChannelWithStream(channel)
    );
    ipcMain.handle('setIptvView', (_e, type: FILTER_TYPE, code: string) => {
      config.data.iptvView.filter = type;
      config.data.iptvView.code = code;
      config.write();
    });
    ipcMain.handle('getIptvView', () => config.data.iptvView);
    ipcMain.handle('getAppConfig', () =>
      config.chain.get('app').defaultsDeep(defaultAppConifg).value()
    );
    ipcMain.handle('getFavorites', () => config.data.favorites || []);
    ipcMain.handle('toggleFavorite', (_e, channelId: string) => {
      config.data.favorites = config.data.favorites || [];
      const idx = config.data.favorites.indexOf(channelId);
      if (idx > -1) {
        config.data.favorites.splice(idx, 1);
      } else {
        config.data.favorites.push(channelId);
      }
      config.write();
      return config.data.favorites.includes(channelId);
    });
    ipcMain.handle('resolveChannelLogo', (_e, channelId: string, failedLogo?: string) =>
      resolveChannelLogo(channelId, failedLogo)
    );
    ipcMain.handle('openStreamInVlc', (_e, streamUrl: string) => this._openStreamInVlc(streamUrl));

    ipcMain.handle('clearAllCache', () => {
      this._needMainWindow();
      const res = dialog.showMessageBoxSync(this._mainWindow!, {
        title: 'Clear Cache',
        message: 'Are you sure want to delete all cache?',
        type: 'question',
        buttons: ['Cancel', 'Yes'],
        cancelId: 0
      });
      if (res === 1) {
        clearAllCache();
        dialog.showMessageBoxSync(this._mainWindow!, {
          title: 'IPTV Desktop',
          message: 'Cache Cleared!',
          type: 'info'
        });
      }
    });
    ipcMain.handle('setAppConfig', (_e, newCfg: AppConfig['app'], relaunchHash: string) => {
      this._needMainWindow();
      this._needCreateWindow();
      config.data.app = newCfg;
      config.write();
      dialog.showMessageBoxSync(this._mainWindow!, {
        title: 'IPTV Desktop',
        message: 'Settings Saved!',
        type: 'info'
      });
      this._mainWindow!.close();
      setupDOH(app, newCfg);
      this._createMainWindow!(relaunchHash);
    });
  }

  private _needMainWindow() {
    if (this._mainWindow === undefined) {
      throw new Error('Main window not defined!');
    }
  }
  private _needCreateWindow() {
    if (this._createMainWindow === undefined) {
      throw new Error('Create window not defined!');
    }
  }

  private _openStreamInVlc(streamUrl: string) {
    const trySpawn = (command: string, args: string[]) => {
      try {
        const proc = spawn(command, args, { detached: true, stdio: 'ignore' });
        proc.unref();
        return true;
      } catch {
        return false;
      }
    };

    if (process.platform === 'win32') {
      const paths = [
        'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe',
        'C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe'
      ];
      for (const path of paths) {
        if (existsSync(path) && trySpawn(path, [streamUrl])) {
          return true;
        }
      }
    }

    if (trySpawn('vlc', [streamUrl])) {
      return true;
    }

    return false;
  }
}
