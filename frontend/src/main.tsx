import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./assets/style.css";
import LoadingScreen from "./components/loading-screen";

const container = document.getElementById("root");

const root = createRoot(container!);

const App = React.lazy(() => import("./app"));

root.render(
  <React.Fragment>
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>
  </React.Fragment>
);
