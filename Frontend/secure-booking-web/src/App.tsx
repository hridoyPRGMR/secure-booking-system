import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import RoomDetails from "./components/room/RoomDetails";
import Login from "./pages/Login";

import MyBookings from "./pages/MyBookings";
import ProfileSettings from "./components/profile/ProfileSettings";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/rooms", element: <Rooms /> },
      { path: "/rooms/:id", element: <RoomDetails /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: "/bookings", element: <MyBookings /> },
          { path: "/profile", element: <ProfileSettings /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}