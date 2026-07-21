import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import axios, { AxiosError } from 'axios'
import { authService } from '../features/auth/authService'
import { tokenStore } from '../lib/tokenStore'
import type { ApiValidationError, RegisterRequest, User } from '../types/Auth'

export interface AuthActionResult {
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthActionResult>
  register: (payload: RegisterRequest) => Promise<AuthActionResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function extractError(error: unknown): AuthActionResult {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiValidationError>
    if (!axiosError.response) {
      return { success: false, message: 'A network error occurred. Please try again.' }
    }
    return {
      success: false,
      message: axiosError.response.data?.detail || 'An unexpected error occurred.',
      errors: axiosError.response.data?.errors,
    }
  }
  return { success: false, message: 'A network error occurred. Please try again.' }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Best-effort: local session state is cleared regardless of API outcome.
    } finally {
      tokenStore.clear()
      setUser(null)
    }
  }, [])

  // Wired up so a failed silent-refresh anywhere in the app (triggered from
  // the axios interceptor, not just here) drops the user back to signed-out state.
  useEffect(() => {
    tokenStore.onUnauthorized(() => setUser(null))
    return () => tokenStore.onUnauthorized(null)
  }, [])

  // Boot check: try a silent refresh so a page reload doesn't force a re-login
  // as long as the HttpOnly refresh cookie is still valid.
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        const response = await authService.refresh()
        if (cancelled) return
        tokenStore.set(response.accessToken)
        setUser({
          id: response.userId,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
        })
      } catch {
        if (!cancelled) {
          tokenStore.clear()
          setUser(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    try {
      const response = await authService.login({ email, password })
      tokenStore.set(response.accessToken)
      setUser({
        id: response.userId,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
      })
      return { success: true }
    } catch (error) {
      return extractError(error)
    }
  }, [])

  const register = useCallback(async (payload: RegisterRequest): Promise<AuthActionResult> => {
    try {
      const response = await authService.register(payload)
      tokenStore.set(response.accessToken)
      setUser({
        id: response.userId,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
      })
      return { success: true }
    } catch (error) {
      return extractError(error)
    }
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
