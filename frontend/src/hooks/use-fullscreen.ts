import ConfigContext from "@/context/config.context";
import { use } from "react";

export const useFullScreen = () => {
  const { isFullScreen, enterFullScreen, exitFullScreen } = use(ConfigContext);

  return { isFullScreen, enterFullScreen, exitFullScreen };
};
