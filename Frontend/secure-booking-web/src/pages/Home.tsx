import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck, DoorOpen, ListChecks, Building2 } from "lucide-react";
import type { Room } from "../types/Room";
import type { Booking } from "../types/Booking";
import { BookingStatus } from "../types/Booking";
import { mockRooms } from "../data/mockRooms";
import { mockBookings } from "../data/mockBookings";
import BookingCard from "../components/booking/BookingCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboardData() {
      setIsLoading(true);
      setError(null);

      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/rooms`, { signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/bookings/mine`, {
            signal: controller.signal,
            credentials: "include",
          }),
        ]);

        if (!roomsRes.ok || !bookingsRes.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        setRooms(await roomsRes.json());
        setBookings(await bookingsRes.json());
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Fallback to mock data so the dashboard still renders during development.
        setRooms(mockRooms);
        setBookings(mockBookings);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();

    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter((r) => r.isActive).length;
    const myBookings = bookings.filter((b) => b.status !== BookingStatus.Cancelled).length;
    const todaysBookings = bookings.filter(
      (b) =>
        b.status !== BookingStatus.Cancelled &&
        (isToday(b.checkInDate) || isToday(b.checkOutDate))
    ).length;

    return { totalRooms, availableRooms, myBookings, todaysBookings };
  }, [rooms, bookings]);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((b) => b.status === BookingStatus.Pending || b.status === BookingStatus.Confirmed)
      .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime())
      .slice(0, 3);
  }, [bookings]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back 👋</h1>
          <p className="mt-2 text-gray-500">Reserve your meeting room in seconds.</p>
        </div>

        <Link
          to="/rooms"
          className="w-fit rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          Book a room
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon={<Building2 className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <DashboardCard
          title="Available"
          value={stats.availableRooms}
          icon={<DoorOpen className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <DashboardCard
          title="My Bookings"
          value={stats.myBookings}
          icon={<ListChecks className="h-5 w-5" />}
          isLoading={isLoading}
        />
        <DashboardCard
          title="Today's Bookings"
          value={stats.todaysBookings}
          icon={<CalendarCheck className="h-5 w-5" />}
          isLoading={isLoading}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming bookings</h2>
          <Link to="/my-bookings" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-4">
          {isLoading && <p className="text-sm text-gray-500">Loading…</p>}

          {!isLoading && upcomingBookings.length === 0 && (
            <div className="rounded-xl border bg-white p-8 text-center text-sm text-gray-500">
              No upcoming bookings. <Link to="/rooms" className="text-indigo-600 hover:underline">Book a room</Link> to get started.
            </div>
          )}

          {!isLoading && upcomingBookings.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function DashboardCard({ title, value, icon, isLoading }: DashboardCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-indigo-500">{icon}</span>
      </div>

      <h2 className="mt-2 text-3xl font-bold">
        {isLoading ? (
          <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-200" />
        ) : (
          value
        )}
      </h2>
    </div>
  );
}