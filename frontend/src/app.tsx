import { Toaster } from "./components/ui/sonner";
import ConfigProvider from "./context/config.provider";
import Router from "./router";

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <Router />
      <Toaster position="top-center" />
    </ConfigProvider>
  );
};
export default App;
