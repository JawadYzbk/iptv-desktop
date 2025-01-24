import { createContext } from "react";
import Player from "video.js/dist/types/player";

export interface CaptionItem {
  id: string;
  label: string;
  language: string;
  kind: string;
  isActive: boolean;
}

export interface PlayerSource {
  src: string;
  type?: string;
  headers?: { [key: string]: string };
}

interface IVideoPlayerContext {
  isUserActive: boolean;
  setIsUserActive: (isActive: boolean) => void;
  isMouseOverControl: boolean;
  setIsMouseOverControl: (isMouseOverControl: boolean) => void;
  player?: Player;
  isPlaying: boolean;
  doPlay: () => void;
  doPause: () => void;
  isPIP: boolean;
  doEnterPIP: () => void;
  doExitPIP: () => void;
  isMuted: boolean;
  volume: number;
  doSetIsMuted: (isMuted: boolean) => void;
  doSetVolume: (volume: number) => void;
  isBuffering: boolean;
  captionList: CaptionItem[];
  doSetCaption: (caption?: CaptionItem) => void;
  sources: PlayerSource[];
  sourceIndex: number;
  setSourceIndex: (index: number) => void;
}
const VideoPlayerContext = createContext<IVideoPlayerContext>({
  isUserActive: false,
  setIsUserActive: () => {},
  isMouseOverControl: false,
  setIsMouseOverControl: () => {},
  isPlaying: false,
  doPlay: () => {},
  doPause: () => {},
  isPIP: false,
  doEnterPIP: () => {},
  doExitPIP: () => {},
  isMuted: false,
  volume: 1,
  doSetIsMuted: () => {},
  doSetVolume: () => {},
  isBuffering: false,
  captionList: [],
  doSetCaption: () => {},
  sources: [],
  sourceIndex: 0,
  setSourceIndex: () => {},
});
export default VideoPlayerContext;
