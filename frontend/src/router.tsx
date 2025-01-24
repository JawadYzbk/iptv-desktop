import { createHashRouter, Outlet, RouterProvider } from "react-router";
import HomeWrapper from "./app/home/layout/home-wrapper";
import Home from "./app/home";
import RootNavigator from "./app/root-navigator";
import Watch from "./app/watch";
import PlaylistProvider from "./context/playlist.provider";

const routes = createHashRouter([
  {
    element: (
      <PlaylistProvider>
        <Outlet />
      </PlaylistProvider>
    ),
    children: [
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
    ],
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={routes} />;
};
export default Router;
