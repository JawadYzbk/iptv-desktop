import React, { useEffect, useState } from "react";
import { service } from "wailsjs/go/models";
import ConfigContext, { IPTVView } from "./config.context";
import { GetConfig } from "wailsjs/go/service/ConfigStore";
import {
  EnterFullScreen,
  ExitFullScreen,
  IsFullScreen,
} from "wailsjs/go/main/App";
import LoadingScreen from "@/components/loading-screen";

interface Props {
  children?: React.ReactNode;
}

const IPTV_VIEW_KEY = "IPTV_VIEW";
const ConfigProvider: React.FC<Props> = ({ children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [config, setConfig] = useState<service.Config>();
  const [iptvView, setIptvView] = useState<IPTVView>({
    filterType: service.IPTVFilter.COUNTRY,
  });

  useEffect(() => {
    (async () => {
      const resIsFullScreen = await IsFullScreen();
      setIsFullScreen(resIsFullScreen);
      const resConfig = await GetConfig();
      setConfig(resConfig);
      const saved = localStorage.getItem(IPTV_VIEW_KEY);
      if (saved) {
        try {
          const decoded = JSON.parse(saved);
          setIptvView(decoded);
        } catch (error) {}
      }
      setIsLoaded(true);
    })();
  }, []);

  const doSetIptvView = (iptvView: IPTVView) => {
    localStorage.setItem(IPTV_VIEW_KEY, JSON.stringify(iptvView));
    setIptvView(iptvView);
  };

  const enterFullScreen = async () => {
    await EnterFullScreen();
    setIsFullScreen(true);
  };

  const exitFullScreen = async () => {
    await ExitFullScreen();
    setIsFullScreen(false);
  };

  return isLoaded ? (
    <ConfigContext.Provider
      value={{
        config,
        iptvView,
        doSetIptvView,
        isFullScreen,
        enterFullScreen,
        exitFullScreen,
      }}
    >
      {children}
    </ConfigContext.Provider>
  ) : (
    <LoadingScreen />
  );
};
export default ConfigProvider;
