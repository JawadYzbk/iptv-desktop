import { createHashRouter, RouterProvider } from "react-router";
import HomeWrapper from "./app/home/layout/home-wrapper";
import Home from "./app/home";
import RootNavigator from "./app/root-navigator";
import Watch from "./app/watch";

const routes = createHashRouter([
  {
    index: true,
    element: <RootNavigator />,
  },
  {
    element: <HomeWrapper />,
    children: [
      {
        path: "/home/:filterType/:code?",
        element: <Home />,
      },
    ],
  },
  {
    path: "/home/:filterType/:code/:channelId",
    element: <Watch />,
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={routes} />;
};
export default Router;
