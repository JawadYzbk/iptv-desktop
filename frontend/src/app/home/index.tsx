import Spinner from "@/components/spinner";
import { useEffect } from "react";
import { useParams } from "react-router";
import { service } from "wailsjs/go/models";
import { Save, SetIPTVView } from "wailsjs/go/service/ConfigStore";
import ChannelItem from "@/components/channel-item";
import { GridConfig, useGrid } from "@/hooks/use-grid";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { useChannelList } from "@/hooks/use-channel-list";

const gridConfig: GridConfig = {
  default: 2,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 4,
  "2xl": 5,
};

const Home: React.FC = () => {
  const { filterType, code } = useParams();
  const { isLoading, channels } = useChannelList(filterType, code);

  useEffect(() => {
    if (filterType && code) {
      (async () => {
        const view = new service.IPTVViewConfig();
        view.filter = filterType;
        view.code = code;

        await SetIPTVView(view);
        await Save();
      })();
    }
  }, [filterType, code]);

  const grid = useGrid(channels, gridConfig);

  return (
    <main className="flex-1">
      {isLoading ? (
        <Spinner />
      ) : (
        <AutoSizer>
          {({ height, width }: AutoSizer["state"]) => (
            <FixedSizeList
              width={width}
              height={height}
              itemCount={grid.items.length}
              itemSize={210}
            >
              {({ index, style }) => {
                const item = grid.items[index];
                return (
                  <div
                    className={`grid gap-4 px-4 py-2 ${grid.className}`}
                    style={style}
                  >
                    {item.map((item) => (
                      <ChannelItem
                        key={item.id}
                        to={`/home/${filterType}/${code}/${item.id}`}
                        channel={item}
                      />
                    ))}
                  </div>
                );
              }}
            </FixedSizeList>
          )}
        </AutoSizer>
      )}
    </main>
  );
};
export default Home;
