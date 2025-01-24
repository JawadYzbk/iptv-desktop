import ChannelItem from "@/components/channel-item";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInput } from "@/components/ui/sidebar";
import { useChannelList } from "@/hooks/use-channel-list";
import { ECustomEvent } from "@/lib/event";
import { ArrowLeftIcon } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

const HEIGHT = 80;

interface Props {
  ref?: React.Ref<HTMLDivElement>;
  isVisible?: boolean;
}

const ChannelSelector: React.FC<Props> = ({ ref, isVisible }) => {
  const isScrolled = useRef(false);
  const [listRef, setListRef] = useState<FixedSizeList<any> | null>(null);
  const navigate = useNavigate();
  const { filterType, code, channelId } = useParams();
  const { isLoading, channels, search, setSearch, originalChannels } =
    useChannelList(filterType, code);
  const [scrollPos, setScrollPos] = useState<
    "top" | "middle" | "bottom" | "no-scroll"
  >("top");

  const bindListRef = useCallback((node: FixedSizeList<any>) => {
    setListRef(node);
  }, []);

  const totalHeight = useMemo(
    () => HEIGHT * channels.length,
    [HEIGHT, channels]
  );

  useEffect(() => {
    if (channels.length === 0 || isScrolled.current || !listRef) return;
    if (!code) {
      isScrolled.current = true;
      return;
    }

    const idx = channels.findIndex((it) => it.id === channelId);
    listRef!.scrollToItem(idx, "center");
    isScrolled.current = true;
  }, [channels, channelId, listRef]);

  const handlePrev = useCallback(() => {
    if (!channelId || originalChannels.length === 0) return;
    const currentIdx = originalChannels.findIndex((it) => it.id === channelId);
    if (currentIdx === -1) return;
    let newIdx = currentIdx - 1;
    if (newIdx < 0) {
      newIdx = originalChannels.length - 1;
    }
    navigate(`/home/${filterType}/${code}/${originalChannels[newIdx].id}`);
  }, [channelId, originalChannels, filterType, code]);

  const handleNext = useCallback(() => {
    if (!channelId || originalChannels.length === 0) return;
    const currentIdx = originalChannels.findIndex((it) => it.id === channelId);
    if (currentIdx === -1) return;
    let newIdx = currentIdx + 1;
    if (newIdx >= originalChannels.length) {
      newIdx = 0;
    }
    navigate(`/home/${filterType}/${code}/${originalChannels[newIdx].id}`);
  }, [channelId, originalChannels, filterType, code]);

  useEffect(() => {
    window.addEventListener(ECustomEvent.prevChannel, handlePrev);
    window.addEventListener(ECustomEvent.nextChannel, handleNext);

    return () => {
      window.removeEventListener(ECustomEvent.prevChannel, handlePrev);
      window.removeEventListener(ECustomEvent.nextChannel, handleNext);
    };
  }, [handleNext, handlePrev]);

  return (
    <div
      ref={ref}
      className={`absolute ${
        isVisible ? "left-0 opacity-100" : "-left-96 opacity-0"
      } transition-all duration-500 top-0 bottom-0 z-30 w-96 bg-gradient-to-r from-background/90 via-background/70 to-transparent pr-12 flex flex-col`}
    >
      <header className="flex shrink-0 items-center gap-2 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            navigate(`/home/${filterType}/${code}`);
          }}
        >
          <ArrowLeftIcon />
          <span className="sr-only">Back</span>
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <span className="flex-1 font-bold text-primary">Channels</span>
      </header>
      <div className="px-4">
        <SidebarInput
          placeholder="Type to search..."
          className="bg-background/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <Spinner />
        ) : (
          <div
            className={`h-full w-full vertical-list ${
              scrollPos === "top"
                ? "at-top"
                : scrollPos === "bottom"
                ? "at-bottom"
                : scrollPos === "no-scroll"
                ? "no-scroll"
                : ""
            }`}
          >
            <AutoSizer>
              {({ height, width }: AutoSizer["state"]) => (
                <FixedSizeList
                  ref={bindListRef}
                  width={width}
                  height={height}
                  itemCount={channels.length}
                  itemSize={HEIGHT}
                  className="no-scrollbar py-4"
                  itemKey={(idx) => channels[idx].id}
                  onScroll={({ scrollOffset }) => {
                    var pos: typeof scrollPos = "middle";
                    const isAtBottom = totalHeight < scrollOffset + height + 10;
                    if (scrollOffset < 10 && isAtBottom) {
                      pos = "no-scroll";
                    } else if (totalHeight < scrollOffset + height + 10) {
                      pos = "bottom";
                    } else if (scrollOffset < 10) {
                      pos = "top";
                    }
                    setScrollPos(pos);
                  }}
                >
                  {({ index, style }) => {
                    const item = channels[index];
                    return (
                      <div style={style} className="px-4 py-4">
                        <ChannelItem
                          to={`/home/${filterType}/${code}/${item.id}`}
                          key={item.id}
                          channel={item}
                          isActive={channelId === item.id}
                          isVertical={true}
                        />
                      </div>
                    );
                  }}
                </FixedSizeList>
              )}
            </AutoSizer>
          </div>
        )}
      </div>
    </div>
  );
};
export default ChannelSelector;
