import React from "react";
import { createRoot } from "react-dom/client";
import Router from "./router";
import "./assets/style.css";
import ConfigProvider from "./context/config.provider";
import { Toaster } from "@/components/ui/sonner";

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.Fragment>
    <ConfigProvider>
      <Router />
    </ConfigProvider>
    <Toaster position="top-center" />
  </React.Fragment>
);
