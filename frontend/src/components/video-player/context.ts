import { createContext } from "react";
import Player from "video.js/dist/types/player";

interface IVideoPlayerContext {
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
}
const VideoPlayerContext = createContext<IVideoPlayerContext>({
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
});
export default VideoPlayerContext;
