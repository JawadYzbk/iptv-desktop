import React, { useEffect, useMemo, useRef, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import VideoPlayerControls from "./controls";
import VideoPlayerProvider from "./provider";
import { PlayerSource } from "./context";
import { proxy } from "@/lib/proxy";

interface Props {
  sources: PlayerSource[];
}
export const VideoPlayer: React.FC<Props> = ({ sources }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<Player>();
  const [sourceIndex, setSourceIndex] = useState(0);
  const [isUserActive, setIsUserActive] = useState(false);
  const [isMouseOverControl, setIsMouseOverControl] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
  }, [sources]);

  const currentSource = useMemo(() => {
    const current = sources[sourceIndex];
    return current ?? sources[0];
  }, [sources, sourceIndex]);

  const playerRequestHook = (currentSource: PlayerSource) => {
    return (options: any) => {
      options.beforeSend = (xhr: XMLHttpRequest) => {
        if (currentSource.headers) {
          for (const key in currentSource.headers) {
            if (
              Object.prototype.hasOwnProperty.call(currentSource.headers, key)
            ) {
              const value = currentSource.headers[key];
              xhr.setRequestHeader(key, value);
            }
          }
        }
      };
      if (options.uri) {
        options.uri = proxy(options.uri);
      }
      if (options.url) {
        options.url = proxy(options.url);
      }
      return options;
    };
  };

  useEffect(() => {
    if (!player) {
      const videoElement = document.createElement("video-js");

      videoRef.current!.appendChild(videoElement);

      const srcSources = currentSource
        ? [
            {
              src: currentSource.src,
              type: currentSource.type,
            },
          ]
        : [];

      const newPlayer = videojs(
        videoElement,
        {
          autoplay: true,
          controls: false,
          fill: true,
          sources: srcSources,
          html5: {
            nativeTextTracks: false,
          },
        },
        () => {
          setPlayer(newPlayer);
        }
      );
      newPlayer.addClass("vjs-iptv");
      const onHooksReady = () => {
        const vhsTech = newPlayer.tech() as any;
        if (vhsTech.vhs && vhsTech.vhs.xhr) {
          vhsTech.vhs.xhr.offRequest();
          vhsTech.vhs.xhr.onRequest(playerRequestHook(currentSource));
        }
      };
      newPlayer.on("xhr-hooks-ready", onHooksReady);
      return () => {
        newPlayer.off("xhr-hooks-ready", onHooksReady);
      };
    } else {
      player.autoplay(true);
      if (currentSource) {
        player.src({
          src: currentSource.src,
          type: currentSource.type,
        });
      }
      const onHooksReady = () => {
        const vhsTech = player.tech() as any;
        if (vhsTech.vhs && vhsTech.vhs.xhr) {
          vhsTech.vhs.xhr.offRequest();
          vhsTech.vhs.xhr.offResponse();
          vhsTech.vhs.xhr.onRequest(playerRequestHook(currentSource));
        }
      };
      player.on("xhr-hooks-ready", onHooksReady);
      return () => {
        player.off("xhr-hooks-ready", onHooksReady);
      };
    }
  }, [currentSource, videoRef]);

  useEffect(() => {
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        setPlayer(undefined);
      }
    };
  }, [player]);

  const isControlVisible = useMemo(
    () => isUserActive || isMouseOverControl,
    [isUserActive, isMouseOverControl]
  );

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${
        isControlVisible ? "control-visible" : "control-invisible"
      }`}
    >
      <div data-vjs-player className="absolute inset-0">
        <div ref={videoRef} className="absolute inset-0" />
      </div>
      <VideoPlayerProvider
        player={player}
        sources={sources}
        sourceIndex={sourceIndex}
        setSourceIndex={setSourceIndex}
        isUserActive={isUserActive}
        setIsUserActive={setIsUserActive}
        isMouseOverControl={isMouseOverControl}
        setIsMouseOverControl={setIsMouseOverControl}
      >
        <VideoPlayerControls />
      </VideoPlayerProvider>
    </div>
  );
};

export default VideoPlayer;
