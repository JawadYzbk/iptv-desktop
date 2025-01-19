import ConfigContext from "@/context/config.context";
import { use, useMemo } from "react";
import { Navigate } from "react-router";

const RootNavigator: React.FC = () => {
  const { IPTVView } = use(ConfigContext);

  const path = useMemo(() => {
    let baseURL = "/home";
    if (!IPTVView?.filter) {
      baseURL += "/country";
      return baseURL;
    }
    baseURL += "/" + IPTVView.filter;
    if (IPTVView.code) {
      baseURL += "/" + IPTVView.code;
    }

    return baseURL;
  }, [IPTVView]);

  return <Navigate to={path} replace={true} />;
};
export default RootNavigator;
