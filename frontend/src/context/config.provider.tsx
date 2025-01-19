import React, { useEffect, useState } from "react";
import { service } from "wailsjs/go/models";
import ConfigContext from "./config.context";
import Icon from "@/assets/images/icon.png";
import { GetApp, GetIPTVView } from "wailsjs/go/service/ConfigStore";

interface Props {
  children?: React.ReactNode;
}

const ConfigProvider: React.FC<Props> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [app, setApp] = useState<service.AppConfig>();
  const [IPTVView, setIPTVView] = useState<service.IPTVViewConfig>();

  useEffect(() => {
    (async () => {
      const [resApp, resIPTVView] = await Promise.all([
        GetApp(),
        GetIPTVView(),
      ]);
      setApp(resApp);
      setIPTVView(resIPTVView);
      setIsLoaded(true);
    })();
  }, []);

  return isLoaded ? (
    <ConfigContext.Provider value={{ app, setApp, IPTVView, setIPTVView }}>
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
