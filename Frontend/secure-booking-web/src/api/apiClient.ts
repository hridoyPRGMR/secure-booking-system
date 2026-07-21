import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { tokenStore } from '../lib/tokenStore'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh-token']

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false
  return AUTH_ENDPOINTS.some((endpoint) => url.endsWith(endpoint))
}

const axiosClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  // Sends/receives the HttpOnly refresh-token cookie on every request.
  withCredentials: true,
})

// Separate, interceptor-free client for the refresh call itself so a 401
// from /auth/refresh-token can never re-enter the response interceptor below.
const refreshClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean
}

// While a refresh is in flight, queue up every other failing request instead
// of firing off duplicate /auth/refresh-token calls.
let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function resolveQueue(token: string) {
  pendingQueue.forEach(({ resolve }) => resolve(token))
  pendingQueue = []
}

function rejectQueue(error: unknown) {
  pendingQueue.forEach(({ reject }) => reject(error))
  pendingQueue = []
}

async function refreshAccessToken(): Promise<string> {
  const { data } = await refreshClient.post<{ accessToken: string }>('/auth/refresh-token')
  tokenStore.set(data.accessToken)
  return data.accessToken
}

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` }
            resolve(axiosClient(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const token = await refreshAccessToken()
      resolveQueue(token)
      originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` }
      return axiosClient(originalRequest)
    } catch (refreshError) {
      rejectQueue(refreshError)
      tokenStore.clear()
      tokenStore.notifyUnauthorized()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosClient
