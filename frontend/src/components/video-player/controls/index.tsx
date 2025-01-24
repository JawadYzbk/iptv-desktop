import React, { use, useEffect, useMemo, useRef } from "react";
import { Button } from "../../ui/button";
import { ChevronsLeftIcon, ChevronsRightIcon, Video } from "lucide-react";
import PlayPauseButton from "./play-pause";
import FullScreenButton from "@/components/fulllscreen-button";
import PIPButton from "./pip";
import VolumeControl from "./volume";
import ChannelSelector from "./channel-selector";
import VideoSpinner from "./video-spinner";
import CaptionButton from "./caption";
import VideoPlayerContext from "../context";
import { useDebouncedCallback } from "use-debounce";
import { dispatchCustomEvent, ECustomEvent } from "@/lib/event";
import SourceButton from "./source";

const VideoPlayerControls: React.FC = () => {
  const {
    setIsMouseOverControl,
    isMouseOverControl,
    isUserActive,
    setIsUserActive,
  } = use(VideoPlayerContext);
  const leftSideControlRef = useRef<HTMLDivElement>(null);
  const bottomControlRef = useRef<HTMLDivElement>(null);

  const debouncedIdle = useDebouncedCallback(() => {
    setIsUserActive(false);
  }, 3000);

  const detectMouseOverControl = () => {
    if (
      leftSideControlRef.current?.matches(":hover") ||
      bottomControlRef.current?.matches(":hover")
    ) {
      setIsMouseOverControl(true);
    } else {
      setIsMouseOverControl(false);
    }
  };

  const onMouseMove = () => {
    setIsUserActive(true);
    debouncedIdle();
    detectMouseOverControl();
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseMove);
    window.addEventListener("touchstart", onMouseMove);
    window.addEventListener("click", onMouseMove);
    window.addEventListener("keydown", onMouseMove);
    onMouseMove();

    return () => {
      window.removeEventListener("keydown", onMouseMove);
      window.removeEventListener("click", onMouseMove);
      window.removeEventListener("touchstart", onMouseMove);
      window.removeEventListener("mousedown", onMouseMove);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const isVisible = useMemo(
    () => isMouseOverControl || isUserActive,
    [isMouseOverControl, isUserActive]
  );

  return (
    <React.Fragment>
      <VideoSpinner />
      <ChannelSelector ref={leftSideControlRef} isVisible={isVisible} />
      <div
        ref={bottomControlRef}
        className={`absolute ${
          isVisible ? "bottom-0 opacity-100" : "-bottom-40 opacity-0"
        } transition-all duration-500 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-20 py-20 grid grid-cols-[400px_minmax(0,100fr)_400px] z-10`}
      >
        <div></div>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            className="size-14 rounded-full p-0"
            onClick={() => dispatchCustomEvent(ECustomEvent.prevChannel)}
          >
            <ChevronsLeftIcon className="!size-6" />
          </Button>
          <PlayPauseButton />
          <Button
            variant="outline"
            className="size-14 rounded-full p-0"
            onClick={() => dispatchCustomEvent(ECustomEvent.nextChannel)}
          >
            <ChevronsRightIcon className="!size-6" />
          </Button>
        </div>
        <div className="flex justify-end items-center gap-2 ">
          <VolumeControl />
          <CaptionButton variant="outline" size="icon" className="size-10" />
          <PIPButton variant="outline" size="icon" className="size-10" />
          <SourceButton variant="outline" size="icon" className="size-10" />
          <FullScreenButton variant="outline" size="icon" className="size-10" />
        </div>
      </div>
    </React.Fragment>
  );
};
export default VideoPlayerControls;
