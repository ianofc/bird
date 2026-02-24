import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Communities from "./pages/Communities";
import NotFound from "./pages/NotFound";
import Network from "./pages/Network";
import ForgotPassword from "./pages/ForgotPassword";
import Messages from "./pages/Messages";
import PostView from "./pages/PostView";
import ThalamusAdmin from "./pages/ThalamusAdmin";
import Mercurio from "./pages/Mercurio"; 
import Feed from "./pages/Feed";
import News from "./pages/News";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Feed />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/feed",
    element: <Feed />,
  },
  {
    path: "/explore",
    element: <Explore />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "/messages",
    element: <Messages />,
  },
  {
    path: "/communities",
    element: <Communities />,
  },
  {
    path: "/network",
    element: <Network />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/profile/:username",
    element: <Profile />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/post/:id",
    element: <PostView />,
  },
  {
    path: "/thalamus",
    element: <ThalamusAdmin />,
  },
  {
    path: "/mercurio", 
    element: <Mercurio />,
  },
  {
   path: "/mercurio/*",
   element: <Mercurio />
  },
  {
    path: "/news", // 
    element: <Mercurio />,
  },
  {
   path: "/news/*",
   element: <News />
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}