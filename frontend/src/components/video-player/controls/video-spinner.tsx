import Spinner from "@/components/spinner";
import React, { use } from "react";
import VideoPlayerContext from "../context";

const VideoSpinner: React.FC = () => {
  const { isBuffering } = use(VideoPlayerContext);

  return isBuffering ? (
    <div className="absolute inset-0 z-10 flex items-center justify-center draggable">
      <Spinner />
    </div>
  ) : (
    <React.Fragment />
  );
};
export default VideoSpinner;
