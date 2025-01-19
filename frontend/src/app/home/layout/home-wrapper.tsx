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

const HomeWrapper: React.FC = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <header className="flex shrink-0 items-center gap-2 border-b bg-background p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="flex-1 font-bold text-primary text-center">
            IPTV Desktop
          </span>
          <Separator orientation="vertical" className="ml-2 h-4" />
          <SettingsButton
            variant="ghost"
            size="icon"
            className="h-7 w-7 -mr-1"
          />
          <FullScreenButton variant="ghost" size="icon" className="h-7 w-7" />
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};
export default HomeWrapper;
