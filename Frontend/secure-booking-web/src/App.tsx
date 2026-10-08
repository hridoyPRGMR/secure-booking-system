import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Hotels from "./components/hotel/Hotels";
import HotelDetails from "./pages/HotelDetails";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GoogleCallback from "./pages/GoogleCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import MyBookings from "./pages/MyBookings";
import ProfileSettings from "./components/profile/ProfileSettings";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/auth/google/callback",
    element: <GoogleCallback />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/hotels", element: <Hotels /> },
      { path: "/hotels/:id", element: <HotelDetails /> },

      { path: "/rooms/*", element: <Navigate to="/hotels" replace /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: "/checkout", element: <Checkout /> },
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