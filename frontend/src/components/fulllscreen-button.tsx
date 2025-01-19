import { ExpandIcon, ShrinkIcon } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";
import { useFullScreen } from "@/hooks/use-fullscreen";

const FullScreenButton: React.FC<ButtonProps> = ({ ...props }) => {
  const { isFullScreen, openFullScreen, exitFullScreen } = useFullScreen();

  return (
    <Button
      {...props}
      onClick={() => {
        if (isFullScreen) {
          exitFullScreen();
        } else {
          openFullScreen();
        }
      }}
    >
      {isFullScreen ? <ShrinkIcon /> : <ExpandIcon />}
      <span className="sr-only">
        {isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
      </span>
    </Button>
  );
};
export default FullScreenButton;
