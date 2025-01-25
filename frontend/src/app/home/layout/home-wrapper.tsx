import { Outlet } from "react-router";
import { Separator } from "../../../components/ui/separator";
import {
  SidebarInput,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import FullScreenButton from "../../../components/fulllscreen-button";
import SettingsButton from "./settings-button";
import TitlebarButtons from "@/components/titlebar-buttons";
import React, { use } from "react";
import ConfigContext from "@/context/config.context";
import { SearchIcon } from "lucide-react";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  children?: React.ReactNode;
}
const HomeWrapper: React.FC<Props> = ({ search, setSearch, children }) => {
  const { config } = use(ConfigContext);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <header
          className={`flex shrink-0 items-center gap-2 border-b bg-background pl-4 ${
            config?.userInterface.isUseSystemTitlebar ? "h-16" : "min-h-12"
          }`}
        >
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex-1 text-center">
            <div className="relative max-w-96">
              <SidebarInput
                placeholder="Search Channel..."
                className="pl-8 border-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <SearchIcon className="absolute top-2 left-2 h-4 w-4" />
            </div>
          </div>
          <Separator orientation="vertical" className="ml-2 h-4" />
          <SettingsButton
            variant="ghost"
            size="icon"
            className="h-7 w-7 -mr-1"
          />
          <FullScreenButton variant="ghost" size="icon" className="h-7 w-7" />
          <div className="w-2"></div>
          <TitlebarButtons
            rightComponent={
              <Separator orientation="vertical" className="h-4 -ml-4" />
            }
          />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};
export default HomeWrapper;
