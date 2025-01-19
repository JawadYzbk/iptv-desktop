import {
  SidebarContent,
  SidebarInput,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Link, useParams } from "react-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  GetAllCategory,
  GetAllCountry,
  GetAllLanguage,
} from "wailsjs/go/service/IPTV";
import { toast } from "sonner";
import Spinner from "../../../components/spinner";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useDebounce } from "use-debounce";
import { Separator } from "../../../components/ui/separator";

interface SubNavItem {
  label: string;
  code: string;
  icon?: React.ReactNode;
}

const AppNav: React.FC = () => {
  const isScrolled = useRef(false);
  const [listRef, setListRef] = useState<FixedSizeList<any> | null>(null);
  const { filterType, code } = useParams();
  const [isLoading, startLoading] = useTransition();
  const [submenus, setSubmenus] = useState<SubNavItem[]>([]);
  const [search, setSearch] = useState("");

  const doFetch = async () => {
    if (search !== "") {
      setSearch("");
    }
    switch (filterType) {
      case "country":
        let res = await GetAllCountry();
        if (res.error) {
          setSubmenus([]);
          toast("Something went wrong!", {
            description: res.error,
          });
        } else {
          setSubmenus(
            res.data!.map((item) => {
              const code = item.code === "UK" ? "gb" : item.code.toLowerCase();
              return {
                label: item.name,
                code: item.code,
                icon: <span className={`fi fi-${code}`}></span>,
              };
            })
          );
        }
        break;

      case "category":
        const resCat = await GetAllCategory();
        if (resCat.error) {
          setSubmenus([]);
          toast("Something went wrong!", {
            description: resCat.error,
          });
        } else {
          setSubmenus(
            resCat.data!.map((item) => ({
              label: item.name,
              code: item.id,
            }))
          );
        }
        break;

      case "language":
        const resLang = await GetAllLanguage();
        if (resLang.error) {
          setSubmenus([]);
          toast("Something went wrong!", {
            description: resLang.error,
          });
        } else {
          setSubmenus(
            resLang.data!.map((item) => ({
              label: item.name,
              code: item.code,
            }))
          );
        }
        break;

      default:
        setSubmenus([]);
        break;
    }
  };

  useEffect(() => {
    startLoading(doFetch);
  }, [filterType]);

  useEffect(() => {
    if (submenus.length === 0 || isScrolled.current || !listRef) return;
    if (!code) {
      isScrolled.current = true;
      return;
    }

    const idx = submenus.findIndex((it) => it.code === code);
    listRef!.scrollToItem(idx, "center");
    isScrolled.current = true;
  }, [submenus, code, listRef]);

  const bindListRef = useCallback((node: FixedSizeList<any>) => {
    setListRef(node);
  }, []);

  const [debouncedSearch] = useDebounce(search, 300);

  const filteredItems = useMemo(() => {
    if (!debouncedSearch || !submenus) return submenus;

    const searchLowered = debouncedSearch.toLocaleLowerCase();
    return submenus.filter((item) => {
      return (item.code + " " + item.label)
        .toLocaleLowerCase()
        .includes(searchLowered);
    });
  }, [debouncedSearch, submenus]);

  return (
    <SidebarContent className="min-w-0 flex flex-col gap-0">
      <div className="pb-4 pt-1 px-2">
        <SidebarInput
          placeholder="Type to search..."
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </div>
      <Separator />
      <div className="flex-1">
        {isLoading ? (
          <Spinner />
        ) : (
          <AutoSizer>
            {({ height, width }: AutoSizer["state"]) => (
              <FixedSizeList
                ref={bindListRef}
                width={width}
                height={height}
                itemCount={filteredItems.length}
                itemSize={36}
                itemKey={(idx) => filteredItems[idx].code}
              >
                {({ index, style }) => {
                  const item = filteredItems[index];
                  return (
                    <div className="px-2 py-1" style={style}>
                      <SidebarMenuButton
                        asChild
                        isActive={code === item.code}
                        className="min-w-0"
                        tooltip={{
                          children: item.label,
                        }}
                      >
                        <Link to={`/home/${filterType}/${item.code}`}>
                          {item.icon}
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </div>
                  );
                }}
              </FixedSizeList>
            )}
          </AutoSizer>
        )}
      </div>
      <Separator />
    </SidebarContent>
  );
};
export default AppNav;
