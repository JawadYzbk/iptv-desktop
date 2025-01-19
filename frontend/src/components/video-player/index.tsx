import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import VideoPlayerControls from "./controls";
import VideoPlayerProvider from "./provider";

interface Props {
  sources: {
    src: string;
    type?: string;
  }[];
}
export const VideoPlayer: React.FC<Props> = ({ sources }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player>();

  useEffect(() => {
    if (!player) {
      const videoElement = document.createElement("video-js");

      videoRef.current!.appendChild(videoElement);

      const newPlayer = videojs(
        videoElement,
        {
          autoplay: true,
          controls: false,
          fill: true,
          sources,
        },
        () => {
          videojs.log("player is ready");
        }
      );
      newPlayer.addClass("vjs-iptv");
      setPlayer(newPlayer);
    } else {
      player.autoplay("play");
      player.src(sources);
    }
  }, [sources, videoRef]);

  useEffect(() => {
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        setPlayer(undefined);
      }
    };
  }, [player]);

  return (
    <React.Fragment>
      <div data-vjs-player className="absolute inset-0">
        <div ref={videoRef} className="absolute inset-0" />
      </div>
      <VideoPlayerProvider player={player}>
        <VideoPlayerControls />
      </VideoPlayerProvider>
    </React.Fragment>
  );
};

export default VideoPlayer;
