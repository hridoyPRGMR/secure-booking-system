import axiosClient from '../../api/apiClient'
import type { AuthResponse, LoginRequest, RefreshResponse, RegisterRequest } from '../../types/Auth'

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', payload)
    return response.data
  },

  refresh: async (): Promise<RefreshResponse> => {
    const response = await axiosClient.post<RefreshResponse>('/auth/refresh-token')
    return response.data
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout')
  },
}
