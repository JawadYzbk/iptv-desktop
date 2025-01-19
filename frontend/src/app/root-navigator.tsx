import ConfigContext from "@/context/config.context";
import { use, useMemo } from "react";
import { Navigate } from "react-router";

const RootNavigator: React.FC = () => {
  const { iptvView } = use(ConfigContext);

  const path = useMemo(() => {
    let baseURL = "/home";
    if (!iptvView?.filterType) {
      baseURL += "/country";
      return baseURL;
    }
    baseURL += "/" + iptvView.filterType;
    if (iptvView.code) {
      baseURL += "/" + iptvView.code;
    }

    return baseURL;
  }, [iptvView]);

  return <Navigate to={path} replace={true} />;
};
export default RootNavigator;
