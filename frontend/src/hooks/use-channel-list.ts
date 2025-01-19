import ConfigContext, { IPTVView } from "@/context/config.context";
import { useContext, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { service } from "wailsjs/go/models";
import { GetFilteredChannels } from "wailsjs/go/service/IPTV";

export const useChannelList = (filterType?: string, code?: string) => {
  const { config } = useContext(ConfigContext);
  const [isLoading, startLoading] = useTransition();
  const [channels, setChannels] = useState<service.Channel[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!filterType || !code) return;
    var filter = filterType as service.IPTVFilter;

    startLoading(async () => {
      const res = await GetFilteredChannels(filter, code);
      if (res.error) {
        setChannels([]);
        toast("Something went wrong!", {
          description: res.error,
        });
      } else {
        setChannels(res.data ?? []);
      }
    });
  }, [filterType, code]);

  const [debouncedSearch] = useDebounce(search, 300);

  const filteredList = useMemo(() => {
    if (channels.length === 0 || !debouncedSearch) return channels;

    const loweredQuery = debouncedSearch.toLocaleLowerCase();

    return channels.filter((item) => {
      const chName = config?.iptv.isUseAltChannelName
        ? item.alt_names?.[0] ?? item.name
        : item.name;
      const loweredItem = chName.toLocaleLowerCase();

      return loweredItem.includes(loweredQuery);
    });
  }, [channels, debouncedSearch]);

  return {
    isLoading,
    channels: filteredList,
    originalChannels: channels,
    search,
    setSearch,
  };
};
