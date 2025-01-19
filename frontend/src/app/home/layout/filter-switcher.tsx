import {
  Check,
  ChevronsUpDown,
  EarthIcon,
  LanguagesIcon,
  TagIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { service } from "wailsjs/go/models";

const filters = [
  {
    title: "Country",
    path: service.IPTVFilter.COUNTRY,
    icon: EarthIcon,
  },
  {
    title: "Category",
    path: service.IPTVFilter.CATEGORY,
    icon: TagIcon,
  },
  {
    title: "Language",
    path: service.IPTVFilter.LANGUAGE,
    icon: LanguagesIcon,
  },
];

const FilterSwitcher: React.FC = () => {
  const { filterType } = useParams();
  const navigate = useNavigate();
  const { isMobile } = useSidebar();

  const activeItem = useMemo(() => {
    return filters.find((it) => it.path === filterType) ?? filters[0];
  }, [filterType]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <activeItem.icon className="size-6" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">{activeItem.title}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align={isMobile ? "end" : "start"}
          >
            {filters.map((item) => (
              <DropdownMenuItem
                key={item.path}
                onSelect={() => navigate(`/home/${item.path}`)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                  <item.icon className="size-4 shrink-0" />
                </div>
                {item.title}
                {item.path === filterType && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
export default FilterSwitcher;
