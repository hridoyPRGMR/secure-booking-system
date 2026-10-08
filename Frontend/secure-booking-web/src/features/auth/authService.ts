import axiosClient, { API_BASE_URL } from '../../api/apiClient'
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

  // Full-page navigation target: the API redirects the browser to Google. The API holds the
  // client secret and runs the whole OAuth exchange, React never sees a Google token.
  googleStartUrl: (): string => `${API_BASE_URL}/auth/google/start`,

  // Confirms ownership of the existing account (password) and links the Google identity to it.
  linkGoogle: async (ticket: string, password: string): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/google/link', { ticket, password })
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
