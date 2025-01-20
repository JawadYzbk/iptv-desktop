import { createContext } from "react";
import { service } from "wailsjs/go/models";

export interface IPTVView {
  filterType: service.IPTVFilter;
  code?: string;
}

interface IConfigContext {
  config?: service.Config;
  iptvView: IPTVView;
  doSetIptvView: (iptvView: IPTVView) => void;
  isFullScreen: boolean;
  enterFullScreen: () => void;
  exitFullScreen: () => void;
}
const ConfigContext = createContext<IConfigContext>({
  iptvView: {
    filterType: service.IPTVFilter.COUNTRY,
  },
  doSetIptvView: () => {},
  isFullScreen: false,
  enterFullScreen: () => {},
  exitFullScreen: () => {},
});
export default ConfigContext;
