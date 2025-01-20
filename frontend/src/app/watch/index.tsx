import Spinner from "@/components/spinner";
import TitlebarButtons from "@/components/titlebar-buttons";
import VideoPlayer from "@/components/video-player";
import { dispatchCustomEvent, ECustomEvent } from "@/lib/event";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import { service } from "wailsjs/go/models";
import { GetChannelWithStream } from "wailsjs/go/service/IPTV";

const Watch: React.FC = () => {
  const { channelId } = useParams();

  const [isLoading, startLoading] = useTransition();
  const [channel, setChannel] = useState<service.ChannelWithStreams>();

  useEffect(() => {
    if (channelId) {
      startLoading(async () => {
        const res = await GetChannelWithStream(channelId);
        if (res.error) {
          setChannel(undefined);
          toast("Something went wrong!", {
            description: res.error,
          });
        } else if (res.data) {
          setChannel(res.data);
          navigator.mediaSession.metadata = new MediaMetadata({
            title: res.data.name,
            artist:
              res.data.network || res.data.owners?.join(", ") || "IPTV Desktop",
            artwork: [
              {
                src: res.data.logo,
              },
            ],
          });
          navigator.mediaSession.setActionHandler("previoustrack", () =>
            dispatchCustomEvent(ECustomEvent.prevChannel)
          );
          navigator.mediaSession.setActionHandler("nexttrack", () =>
            dispatchCustomEvent(ECustomEvent.nextChannel)
          );
        }
      });
    }

    return () => {
      navigator.mediaSession.metadata = new MediaMetadata();
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
    };
  }, [channelId]);

  const sources = useMemo(() => {
    return (
      channel?.streams.map((item) => ({
        src: item.url,
      })) ?? []
    );
  }, [channel]);

  return (
    <div className="relative h-screen w-screen">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <VideoPlayer sources={sources} />
      <div className="fixed top-0 right-0 z-30">
        <TitlebarButtons />
      </div>
    </div>
  );
};
export default Watch;
