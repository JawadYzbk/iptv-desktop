import React, { useEffect, useState } from "react";
import { service } from "wailsjs/go/models";
import ConfigContext, { IPTVView } from "./config.context";
import Icon from "@/assets/images/icon.png";
import { GetConfig } from "wailsjs/go/service/ConfigStore";

interface Props {
  children?: React.ReactNode;
}

const IPTV_VIEW_KEY = "IPTV_VIEW";
const ConfigProvider: React.FC<Props> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [config, setConfig] = useState<service.Config>();
  const [iptvView, setIptvView] = useState<IPTVView>({
    filterType: service.IPTVFilter.COUNTRY,
  });

  useEffect(() => {
    (async () => {
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

  return isLoaded ? (
    <ConfigContext.Provider value={{ config, iptvView, doSetIptvView }}>
      {children}
    </ConfigContext.Provider>
  ) : (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex items-center flex-col gap-2">
        <img src={Icon} alt="IPTV Desktop" className="size-16" />
        <h1 className="text-primary font-bold">IPTV Desktop</h1>
      </div>
    </div>
  );
};
export default ConfigProvider;
