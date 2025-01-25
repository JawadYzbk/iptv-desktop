import Spinner from "@/components/spinner";
import { use, useEffect } from "react";
import { useParams } from "react-router";
import { service } from "wailsjs/go/models";
import ChannelItem from "@/components/channel-item";
import { GridConfig, useGrid } from "@/hooks/use-grid";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { useChannelList } from "@/hooks/use-channel-list";
import ConfigContext, { IPTVView } from "@/context/config.context";
import { ArchiveIcon, MilestoneIcon } from "lucide-react";
import HomeWrapper from "./layout/home-wrapper";

const gridConfig: GridConfig = {
  default: 2,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 4,
  "2xl": 5,
};

const Home: React.FC = () => {
  const { doSetIptvView } = use(ConfigContext);
  const { filterType, code } = useParams();
  const { isLoading, channels, search, setSearch } = useChannelList(
    filterType,
    code
  );

  useEffect(() => {
    if (filterType) {
      const view: IPTVView = {
        filterType: filterType as service.IPTVFilter,
        code,
      };
      doSetIptvView(view);
    }
  }, [filterType, code]);

  const grid = useGrid(channels, gridConfig);

  return (
    <HomeWrapper search={search} setSearch={setSearch}>
      <main className="flex-1">
        {code === undefined ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-primary space-y-4">
              <span>
                <MilestoneIcon className="w-12 h-12 inline-block" />
              </span>
              <p className="font-bold">
                Choose a {filterType?.toLowerCase()} first!
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <Spinner />
        ) : channels.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-primary space-y-4">
              <span>
                <ArchiveIcon className="w-12 h-12 inline-block" />
              </span>
              <p className="font-bold">Nothing to show here!</p>
            </div>
          </div>
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
    </HomeWrapper>
  );
};
export default Home;
