import { Sidebar, SidebarHeader } from "@/components/ui/sidebar";
import React from "react";
import AppNav from "./app-nav";
import FilterSwitcher from "./filter-switcher";

const AppSidebar: React.FC<React.ComponentProps<typeof Sidebar>> = ({
  ...props
}) => {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <FilterSwitcher />
      </SidebarHeader>
      <AppNav />
    </Sidebar>
  );
};
export default AppSidebar;
