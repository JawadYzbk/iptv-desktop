import { Button } from "@/components/ui/button";
import { PauseIcon, PlayIcon } from "lucide-react";
import { use } from "react";
import VideoPlayerContext from "../context";

const PlayPauseButton: React.FC = () => {
  const { isPlaying, doPause, doPlay } = use(VideoPlayerContext);

  return (
    <Button
      className="size-16 rounded-full p-0"
      onClick={() => {
        if (isPlaying) {
          doPause();
        } else {
          doPlay();
        }
      }}
    >
      {isPlaying ? (
        <PauseIcon className="!size-8" />
      ) : (
        <PlayIcon className="!size-8" />
      )}
    </Button>
  );
};
export default PlayPauseButton;
