import { Button, ButtonProps } from "@/components/ui/button";
import { PictureInPicture2Icon, PictureInPictureIcon } from "lucide-react";
import React, { use } from "react";
import VideoPlayerContext from "../context";

const PIPButton: React.FC<ButtonProps> = (props) => {
  const { isPIP, doEnterPIP, doExitPIP } = use(VideoPlayerContext);

  return !document.pictureInPictureEnabled ? (
    <React.Fragment />
  ) : (
    <Button
      onClick={() => {
        if (isPIP) {
          doExitPIP();
        } else {
          doEnterPIP();
        }
      }}
      {...props}
    >
      {isPIP ? <PictureInPicture2Icon /> : <PictureInPictureIcon />}
    </Button>
  );
};
export default PIPButton;
