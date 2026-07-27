import apiClient from "./apiClient";
import type { Room } from "../types/Room";
import type { PagedResult } from "./types";

export interface GetRoomsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  hotelId?: string;
  city?: string;
  type?: string;
  minCapacity?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
}

class RoomApi {
  async getRooms(request: GetRoomsRequest): Promise<PagedResult<Room>> {
    const { data } = await apiClient.get<PagedResult<Room>>("/rooms", {
      params: request,
    });

    return data;
  }

  async getRoom(id: string): Promise<Room> {
    const { data } = await apiClient.get<Room>(`/rooms/${id}`);
    return data;
  }
}

export const roomApi = new RoomApi();