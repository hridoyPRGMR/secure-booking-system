import type { Room } from "../../types/Room";
import RoomCard from "./RoomCard";

interface Props {
  rooms: Room[];
  onView: (room: Room) => void;
  onBook: (room: Room) => void;
}

export default function RoomGrid({
  rooms,
  onView,
  onBook,
}: Props) {
  if (!rooms.length)
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow">
        No rooms found.
      </div>
    );

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onView={onView}
          onBook={onBook}
        />
      ))}
    </div>
  );
}