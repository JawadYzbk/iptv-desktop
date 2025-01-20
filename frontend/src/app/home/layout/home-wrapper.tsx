import { Outlet } from "react-router";
import { Separator } from "../../../components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import FullScreenButton from "../../../components/fulllscreen-button";
import SettingsButton from "./settings-button";
import TitlebarButtons from "@/components/titlebar-buttons";
import { use } from "react";
import ConfigContext from "@/context/config.context";

const HomeWrapper: React.FC = () => {
  const { config } = use(ConfigContext);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <header
          className={`flex shrink-0 items-center gap-2 border-b bg-background draggable pl-4 ${
            config?.userInterface.isUseSystemTitlebar ? "h-16" : "h-12"
          }`}
        >
          <SidebarTrigger className="-ml-1 not-draggable" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1 font-bold text-primary text-center">
            IPTV Desktop
          </div>
          <Separator orientation="vertical" className="ml-2 h-4" />
          <SettingsButton
            variant="ghost"
            size="icon"
            className="h-7 w-7 -mr-1 not-draggable"
          />
          <FullScreenButton
            variant="ghost"
            size="icon"
            className="h-7 w-7 not-draggable"
          />
          <div className="w-2"></div>
          <TitlebarButtons
            rightComponent={
              <Separator orientation="vertical" className="h-4 -ml-4" />
            }
          />
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};
export default HomeWrapper;
