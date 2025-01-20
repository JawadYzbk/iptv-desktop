import { use } from "react";
import VideoPlayerContext from "../context";
import { Button } from "@/components/ui/button";
import { Volume2Icon, VolumeOffIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const VolumeControl: React.FC = () => {
  const { volume, doSetVolume, isMuted, doSetIsMuted } =
    use(VideoPlayerContext);

  return (
    <div className="bg-background border border-input flex rounded-md not-draggable">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => doSetIsMuted(!isMuted)}
      >
        {isMuted ? <VolumeOffIcon /> : <Volume2Icon />}
      </Button>
      <div className="py-4 pr-4 pl-1">
        <Slider
          className="w-20"
          value={[volume]}
          max={1}
          step={0.1}
          onValueChange={(v) => doSetVolume(v[0])}
        />
      </div>
    </div>
  );
};
export default VolumeControl;
