import { MinusIcon, SquareIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import React, { use } from "react";
import ConfigContext from "@/context/config.context";
import { cn } from "@/lib/utils";
import { Minimize, Quit, ToggleMaximize } from "wailsjs/go/main/App";

interface Props {
  rightComponent?: React.ReactNode;
  className?: string;
}

const TitlebarButtons: React.FC<Props> = ({ className, rightComponent }) => {
  const { config, isFullScreen } = use(ConfigContext);

  const doMinimize = async () => {
    await Minimize();
  };

  const doToggleMaximize = async () => {
    await ToggleMaximize();
  };

  const doQuit = async () => {
    await Quit();
  };

  return config?.userInterface.isUseSystemTitlebar || isFullScreen ? (
    <React.Fragment />
  ) : (
    <React.Fragment>
      {rightComponent}
      <div className={cn("flex h-12 bg-background", className)}>
        <Button
          size="icon"
          variant="ghost"
          className="h-full w-12 not-draggable rounded-none"
          onClick={doMinimize}
        >
          <MinusIcon />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-full w-12 not-draggable rounded-none"
          onClick={doToggleMaximize}
        >
          <SquareIcon />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-full w-12 not-draggable hover:bg-destructive rounded-none"
          onClick={doQuit}
        >
          <XIcon />
        </Button>
      </div>
    </React.Fragment>
  );
};
export default TitlebarButtons;
