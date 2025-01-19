import React, { useEffect, useState } from "react";
import Player from "video.js/dist/types/player";
import VideoPlayerContext from "./context";

interface Props {
  player?: Player;
  children?: React.ReactNode;
}
export const VOLUME_KEY = "VOLUME";
export const MUTED_KEY = "MUTED";
const VideoPlayerProvider: React.FC<Props> = ({ player, children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPIP, setIsPIP] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const detectPlayPause = () => {
    if (player!.paused()) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const detectPIPChange = () => {
    if (player!.isInPictureInPicture()) {
      setIsPIP(true);
    } else {
      setIsPIP(false);
    }
  };

  const detectVolumeChange = () => {
    if (player?.muted()) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    const vol = player?.volume();
    if (vol != undefined) {
      setVolume(vol);
    }
  };

  useEffect(() => {
    if (player) {
      player.on(["play", "pause"], detectPlayPause);
      player.on(
        ["enterpictureinpicture", "leavepictureinpicture"],
        detectPIPChange
      );
      player.on("volumechange", detectVolumeChange);

      if (localStorage.getItem(VOLUME_KEY) !== null) {
        player.volume(parseFloat(localStorage.getItem(VOLUME_KEY)!));
      }
      if (localStorage.getItem(MUTED_KEY) == "1") {
        player.muted(true);
      } else {
        player.muted(false);
      }
    }

    return () => {
      if (player) {
        player.off("volumechange", detectVolumeChange);
        player.off(
          ["enterpictureinpicture", "leavepictureinpicture"],
          detectPIPChange
        );
        player.off(["play", "pause"], detectPlayPause);
      }
    };
  }, [player]);

  const doPlay = async () => {
    await player?.play();
  };

  const doPause = async () => {
    player?.pause();
  };

  const doEnterPIP = async () => {
    await player?.requestPictureInPicture();
  };

  const doExitPIP = async () => {
    await player?.exitPictureInPicture();
  };

  const doSetVolume = (vol: number) => {
    player?.volume(vol);
    localStorage.setItem(VOLUME_KEY, vol.toString());
  };

  const doSetIsMuted = (isMuted: boolean) => {
    player?.muted(isMuted);
    localStorage.setItem(MUTED_KEY, isMuted ? "1" : "0");
  };

  return (
    <VideoPlayerContext.Provider
      value={{
        player,
        isPlaying,
        doPlay,
        doPause,
        isPIP,
        doEnterPIP,
        doExitPIP,
        isMuted,
        volume,
        doSetIsMuted,
        doSetVolume,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};
export default VideoPlayerProvider;
