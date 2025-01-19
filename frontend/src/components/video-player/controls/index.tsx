import React from "react";
import { Button } from "../../ui/button";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import PlayPauseButton from "./play-pause";
import FullScreenButton from "@/components/fulllscreen-button";
import PIPButton from "./pip";
import VolumeControl from "./volume";
import ChannelSelector from "./channel-selector";

const VideoPlayerControls: React.FC = () => {
  return (
    <React.Fragment>
      <ChannelSelector />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-20 py-10 grid grid-cols-[400px_minmax(0,100fr)_400px] z-10">
        <div></div>
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" className="size-14 rounded-full p-0">
            <ChevronsLeftIcon className="!size-6" />
          </Button>
          <PlayPauseButton />
          <Button variant="outline" className="size-14 rounded-full p-0">
            <ChevronsRightIcon className="!size-6" />
          </Button>
        </div>
        <div className="flex justify-end items-center gap-2">
          <VolumeControl />
          <PIPButton variant="outline" size="icon" className="size-10" />
          <FullScreenButton variant="outline" size="icon" className="size-10" />
        </div>
      </div>
    </React.Fragment>
  );
};
export default VideoPlayerControls;
