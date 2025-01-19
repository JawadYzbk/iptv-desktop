import React, { createContext } from "react";
import { service } from "wailsjs/go/models";

interface IConfigContext {
  app?: service.AppConfig;
  setApp?: React.Dispatch<React.SetStateAction<service.AppConfig | undefined>>;
  IPTVView?: service.IPTVViewConfig;
  setIPTVView?: React.Dispatch<
    React.SetStateAction<service.IPTVViewConfig | undefined>
  >;
}
const ConfigContext = createContext<IConfigContext>({});
export default ConfigContext;
