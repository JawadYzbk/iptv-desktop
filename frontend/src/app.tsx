import { useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import ConfigProvider from "./context/config.provider";
import Router from "./router";
import { WindowShow } from "wailsjs/go/main/App";

const App: React.FC = () => {
  useEffect(() => {
    WindowShow();
  }, []);

  return (
    <ConfigProvider>
      <Router />
      <Toaster position="top-center" />
    </ConfigProvider>
  );
};
export default App;
