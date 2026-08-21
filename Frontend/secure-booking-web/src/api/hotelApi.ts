import apiClient from "./apiClient";
import type { Hotel } from "../types/Hotel";
import type { PagedResult } from "./types";

export interface GetHotelsRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string;
  country?: string;
  sortBy?: string;
  sortDescending?: boolean;
  minPrice?: number;
  maxPrice?: number;
  starRatings?: number[];
  reviewScoreMin?: number;
  amenities?: string[];
  propertyTypes?: string[];
}

class HotelApi {
  async getHotels(request: GetHotelsRequest): Promise<PagedResult<Hotel>> {
    const params = {
      ...request,
      starRatings: request.starRatings?.length ? request.starRatings.join(",") : undefined,
      amenities: request.amenities?.length ? request.amenities.join(",") : undefined,
      propertyTypes: request.propertyTypes?.length ? request.propertyTypes.join(",") : undefined,
    };

    const { data } = await apiClient.get<PagedResult<Hotel>>("/public/hotels", {
      params,
    });

    return data;
  }

  async getHotel(id: string): Promise<Hotel> {
    const { data } = await apiClient.get<Hotel>(`/public/hotels/${id}`);
    return data;
  }
}

export const hotelApi = new HotelApi();
