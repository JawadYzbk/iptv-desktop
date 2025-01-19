import { useEffect, useState } from "react";
import { toast } from "sonner";

export const useFullScreen = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    detectFullScreen();
    window.addEventListener("resize", detectFullScreen);
    const query = matchMedia("(display-mode: fullscreen)");
    query.addEventListener("change", detectFullScreen);

    return () => {
      query.removeEventListener("change", detectFullScreen);
      window.removeEventListener("resize", detectFullScreen);
      detectFullScreen();
    };
  }, []);

  const detectFullScreen = () => {
    const fullscreenElement = document.fullscreenElement;
    const query = matchMedia("(display-mode: fullscreen)");
    if (fullscreenElement || query.matches) {
      setIsFullScreen(true);
    } else {
      setIsFullScreen(false);
    }
  };

  const openFullScreen = async () => {
    try {
      const elem = document.documentElement || document;
      await elem.requestFullscreen();
    } catch (error) {
      toast.error("Can't enter fullscreen, try press F11!");
    }
  };

  const exitFullScreen = async () => {
    try {
      const elem = document;
      await elem.exitFullscreen();
    } catch (error) {
      toast.error("Can't exit fullscreen, try press F11!");
    }
  };

  return { isFullScreen, openFullScreen, exitFullScreen };
};
