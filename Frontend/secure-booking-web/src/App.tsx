import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";

import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import RoomDetails from "./components/room/RoomDetails";
import MyBookings from "./pages/MyBookings";
import ProfileSettings from "./components/profile/ProfileSettings";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<Layout />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/rooms"
            element= {<Rooms/>}
          />

          <Route path="/rooms/:id" element={<RoomDetails />} />

          <Route
            path="/bookings"
            element={<MyBookings />}
          />

          <Route
            path="/profile"
            element={<ProfileSettings />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}