import Spinner from "@/components/spinner";
import VideoPlayer from "@/components/video-player";
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
        } else {
          setChannel(res.data);
        }
      });
    }
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
    </div>
  );
};
export default Watch;
