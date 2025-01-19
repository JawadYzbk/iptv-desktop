import ChannelItem from "@/components/channel-item";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInput } from "@/components/ui/sidebar";
import { useChannelList } from "@/hooks/use-channel-list";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";

const HEIGHT = 80;

const ChannelSelector: React.FC = () => {
  const isScrolled = useRef(false);
  const [listRef, setListRef] = useState<FixedSizeList<any> | null>(null);
  const navigate = useNavigate();
  const { filterType, code, channelId } = useParams();
  const { isLoading, channels, search, setSearch } = useChannelList(
    filterType,
    code
  );
  const [scrollPos, setScrollPos] = useState<"top" | "middle" | "bottom">(
    "top"
  );

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

  return (
    <div className="absolute left-0 top-0 bottom-0 z-20 w-96 bg-gradient-to-r from-background/90 via-background/70 to-transparent pr-12 flex flex-col">
      <header className="flex shrink-0 items-center gap-2 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            navigate(-1);
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
                    if (scrollOffset < 10) {
                      pos = "top";
                    }
                    if (totalHeight < scrollOffset + height + 10) {
                      pos = "bottom";
                    }
                    if (pos !== scrollPos) {
                      setScrollPos(pos);
                    }
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
