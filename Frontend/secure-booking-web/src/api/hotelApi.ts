import apiClient from "./apiClient";
import type { Hotel } from "../types/Hotel";
import type { PagedResult } from "./types";

export interface GetHotelsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  locationId?: string;
}

class HotelApi {
  async getHotels(request: GetHotelsRequest): Promise<PagedResult<Hotel>> {
    const { data } = await apiClient.get<PagedResult<Hotel>>("/public/hotels", {
      params: request,
    });

    return data;
  }

  async getHotel(id: string): Promise<Hotel> {
    const { data } = await apiClient.get<Hotel>(`/public/hotels/${id}`);
    return data;
  }
}

export const hotelApi = new HotelApi();
