import apiClient from "./apiClient";
import type { Booking, CreateBookingRequest, BookingStatus } from "../types/Booking";
import type { PagedResult } from "./types";

export interface GetMyBookingsRequest {
  page?: number;
  pageSize?: number;
  status?: BookingStatus;
}

class BookingApi {
  async getMyBookings(request: GetMyBookingsRequest): Promise<PagedResult<Booking>> {
    const { data } = await apiClient.get<PagedResult<Booking>>("/bookings/mine", {
      params: request,
    });

    return data;
  }

  async createMyBooking(request: CreateBookingRequest): Promise<Booking> {
    const { data } = await apiClient.post<Booking>("/bookings/mine", request);
    return data;
  }

  async cancelMyBooking(id: string): Promise<void> {
    await apiClient.post(`/bookings/mine/${id}/cancel`);
  }
}

export const bookingApi = new BookingApi();
