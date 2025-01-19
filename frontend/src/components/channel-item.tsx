import React, { use, useState } from "react";
import { service } from "wailsjs/go/models";
import Placeholder from "@/assets/images/logo-placeholder.png";
import { Link } from "react-router";
import { imageProxy } from "@/lib/proxy";
import ConfigContext from "@/context/config.context";

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
  const { config } = use(ConfigContext);
  const [src, setSrc] = useState(imageProxy(channel.logo));

  return (
    <Link
      to={to}
      className={`${
        isActive
          ? "bg-primary text-primary-foreground"
          : isVertical
          ? "bg-transparent"
          : "border bg-card"
      } flex ${
        isVertical ? "flex-row items-center gap-4 p-2" : "flex-col gap-2 p-4"
      } hover:bg-primary hover:text-primary-foreground rounded-lg focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none`}
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
          isVertical ? "line-clamp-2" : "truncate text-center"
        } min-w-0`}
      >
        {config?.iptv.isUseAltChannelName
          ? channel.alt_names?.[0] ?? channel.name
          : channel.name}
      </h3>
    </Link>
  );
};
export default ChannelItem;
