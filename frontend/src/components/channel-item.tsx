import React, { use, useState } from "react";
import { service } from "wailsjs/go/models";
import Placeholder from "@/assets/images/logo-placeholder.png";
import { Link } from "react-router";
import { imageProxy } from "@/lib/proxy";
import ConfigContext from "@/context/config.context";
import { Button } from "./ui/button";
import { BookmarkPlusIcon, ListPlusIcon } from "lucide-react";
import PlaylistContext from "@/context/playlist.context";

interface Props {
  to: string;
  channel: service.Channel;
  isVertical?: boolean;
  isActive?: boolean;
}
const ChannelItem: React.FC<Props> = ({
  channel,
  to,
  isVertical,
  isActive,
}) => {
  const { setShowSavePlaylist } = use(PlaylistContext);
  const { config } = use(ConfigContext);
  const [src, setSrc] = useState(imageProxy(channel.logo));

  return (
    <div
      className={`${
        isActive
          ? "bg-primary text-primary-foreground"
          : isVertical
          ? "bg-transparent"
          : "border bg-card"
      } flex ${
        isVertical ? "flex-row items-center gap-4 p-2" : "flex-col gap-3 p-4"
      } hover:bg-primary hover:text-primary-foreground rounded-lg relative`}
    >
      <div
        className={`${
          isVertical ? "h-14 w-24 p-2" : "h-32 w-full p-4"
        } flex items-center justify-center bg-white rounded-md`}
      >
        <img
          loading="lazy"
          onError={() => {
            setSrc(Placeholder);
          }}
          src={src}
          alt={channel.name}
          className="object-contain w-full h-full max-w-36"
        />
      </div>
      <h3
        className={`font-bold ${
          isVertical ? "line-clamp-2" : "truncate"
        } min-w-0 flex-1`}
      >
        {config?.iptv.isUseAltChannelName
          ? channel.alt_names?.[0] ?? channel.name
          : channel.name}
      </h3>
      <Link
        to={to}
        className="absolute inset-0  rounded-lg focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
      ></Link>
      <Button
        size="icon"
        variant="ghost"
        className={`absolute right-1 ${
          isVertical ? "bottom-1/2 translate-y-1/2" : "bottom-2"
        } hover:bg-transparent hover:text-inherit transition-none`}
        onClick={() => setShowSavePlaylist(channel)}
      >
        <BookmarkPlusIcon />
      </Button>
    </div>
  );
};
export default ChannelItem;
