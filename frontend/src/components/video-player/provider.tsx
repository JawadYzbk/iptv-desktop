import React, { use, useEffect, useState } from "react";
import Player from "video.js/dist/types/player";
import VideoPlayerContext, { CaptionItem, PlayerSource } from "./context";
import ConfigContext from "@/context/config.context";

interface Props {
  player?: Player;
  children?: React.ReactNode;
  sources: PlayerSource[];
  sourceIndex: number;
  setSourceIndex: (index: number) => void;
}
export const VOLUME_KEY = "VOLUME";
export const MUTED_KEY = "MUTED";
const VideoPlayerProvider: React.FC<Props> = ({
  player,
  children,
  sources,
  sourceIndex,
  setSourceIndex,
}) => {
  const { config } = use(ConfigContext);
  const [isUserActive, setIsUserActive] = useState(false);
  const [isMouseOverControl, setIsMouseOverControl] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPIP, setIsPIP] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [captionList, setCaptionList] = useState<CaptionItem[]>([]);

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

  const handleBuffering = () => {
    setIsBuffering(true);
  };

  const handlePlaying = () => {
    setIsBuffering(false);
  };

  const handleLoadedData = () => {
    setIsBuffering(false);

    if (player?.paused()) {
      doPlay();
    }
  };

  const handleLoadedMetadata = () => {
    const tracks = (player as any).textTracks();
    if (tracks.length === 0) return;

    if (config?.caption.isAutoShow) {
      let find = false;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i] as TextTrack;
        if (
          (track.kind === "subtitles" || track.kind === "captions") &&
          track.mode === "showing"
        ) {
          find = true;
          break;
        }
      }
      if (!find) {
        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i] as TextTrack;
          if (track.kind === "subtitles" || track.kind === "captions") {
            track.mode = "showing";
            break;
          }
        }
      }
    } else {
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i] as TextTrack;
        if (
          (track.kind === "subtitles" || track.kind === "captions") &&
          track.mode === "showing"
        ) {
          track.mode = "hidden";
        }
      }
    }
  };

  const handleError = () => {
    setIsBuffering(false);
  };

  const handleTextTrackChange = () => {
    const tracks = (player as any).textTracks();
    const newTracks: CaptionItem[] = [];
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i] as TextTrack;
      if (track.kind === "subtitles" || track.kind === "captions") {
        newTracks.push({
          id: track.id,
          label: track.label,
          language: track.language,
          kind: track.kind,
          isActive: track.mode === "showing",
        });
      }
    }
    setCaptionList(newTracks);
  };

  useEffect(() => {
    if (player) {
      player.on(["play", "pause"], detectPlayPause);
      player.on(
        ["enterpictureinpicture", "leavepictureinpicture"],
        detectPIPChange
      );
      player.on("volumechange", detectVolumeChange);
      player.on("waiting", handleBuffering);
      player.on("playing", handlePlaying);
      player.on("loadeddata", handleLoadedData);
      player.on("loadedmetadata", handleLoadedMetadata);
      player.on("error", handleError);

      if (localStorage.getItem(VOLUME_KEY) !== null) {
        player.volume(parseFloat(localStorage.getItem(VOLUME_KEY)!));
      }
      if (localStorage.getItem(MUTED_KEY) == "1") {
        player.muted(true);
      } else {
        player.muted(false);
      }

      const textTracks = (player as any).textTracks();
      textTracks.addEventListener("change", handleTextTrackChange);
    }

    return () => {
      if (player) {
        player.off("error", handleError);
        player.off("loadedmetadata", handleLoadedMetadata);
        player.off("loadeddata", handleLoadedData);
        player.off("playing", handlePlaying);
        player.off("waiting", handleBuffering);
        player.off("volumechange", detectVolumeChange);
        player.off(
          ["enterpictureinpicture", "leavepictureinpicture"],
          detectPIPChange
        );
        player.off(["play", "pause"], detectPlayPause);

        const textTracks = (player as any).textTracks();
        textTracks.removeEventListener("change", handleTextTrackChange);
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

  const doSetCaption = (caption?: CaptionItem) => {
    const tracks = (player as any).textTracks();
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i] as TextTrack;
      if (
        track.id === caption?.id &&
        track.label === caption?.label &&
        track.language === caption?.language &&
        track.kind === caption?.kind
      ) {
        track.mode = "showing";
      } else {
        track.mode = "hidden";
      }
    }
  };

  return (
    <VideoPlayerContext.Provider
      value={{
        isUserActive,
        setIsUserActive,
        isMouseOverControl,
        setIsMouseOverControl,
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
        isBuffering,
        captionList,
        doSetCaption,
        sources,
        sourceIndex,
        setSourceIndex,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};
export default VideoPlayerProvider;
