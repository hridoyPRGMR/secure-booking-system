import apiClient from "./apiClient";

export interface LocationSearchResult {
  city: string;
  country: string;
  displayText: string;
}

class LocationApi {
  async search(search: string): Promise<LocationSearchResult[]> {
    const { data } = await apiClient.get<LocationSearchResult[]>("/public/locations", {
      params: { search },
    });

    return data;
  }
}

export const locationApi = new LocationApi();
