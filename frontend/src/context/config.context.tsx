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
}
const ConfigContext = createContext<IConfigContext>({
  iptvView: {
    filterType: service.IPTVFilter.COUNTRY,
  },
  doSetIptvView: () => {},
});
export default ConfigContext;
