import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useAuth } from '../hooks/useAuth'
import { GOOGLE_RETURN_URL_KEY } from '../components/auth/GoogleSignInButton'

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Google sign-in was cancelled.',
  invalid_state: 'Your sign-in session expired or was invalid. Please try again.',
  google_auth_failed: 'We could not verify your Google sign-in. Please try again.',
  email_not_verified: 'Your Google account email is not verified, so it cannot be used to sign in.',
  google_not_configured: 'Google sign-in is not available right now.',
  conflict: 'Sign-in could not be completed. Please try again.',
}

// Only ever navigate to in-app paths, even though the value comes from our own sessionStorage.
function consumeReturnUrl(): string {
  try {
    const value = sessionStorage.getItem(GOOGLE_RETURN_URL_KEY)
    sessionStorage.removeItem(GOOGLE_RETURN_URL_KEY)
    if (value && value.startsWith('/') && !value.startsWith('//')) return value
  } catch {
    // ignore
  }
  return '/'
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">{children}</div>
      </div>
    </div>
  )
}

export default function GoogleCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { isAuthenticated, isLoading, linkGoogle } = useAuth()

  const status = params.get('status')
  const email = params.get('email')
  const errorCode = params.get('error')

  // The link ticket travels in the URL fragment so it never reaches server logs. Capture it once,
  // then strip it from the address bar/history.
  const [ticket] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('ticket'))
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  const [password, setPassword] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  // status=success: the API set the refresh cookie; AuthProvider's boot-time silent refresh turns it
  // into an access token + user. Once that settles we either have a session or we don't.
  const navigated = useRef(false)
  useEffect(() => {
    if (status !== 'success' || isLoading || navigated.current) return
    navigated.current = true
    if (isAuthenticated) {
      toast.success('Welcome!')
      navigate(consumeReturnUrl(), { replace: true })
    }
  }, [status, isLoading, isAuthenticated, navigate])

  const onLink = async (e: FormEvent) => {
    e.preventDefault()
    if (!ticket) return
    setLinking(true)
    setLinkError(null)
    const result = await linkGoogle(ticket, password)
    setLinking(false)
    if (result.success) {
      toast.success('Google account linked.')
      navigate(consumeReturnUrl(), { replace: true })
    } else {
      setLinkError(result.message ?? 'Could not link your Google account.')
    }
  }

  if (status === 'success') {
    if (isLoading || isAuthenticated) {
      return (
        <Shell>
          <div className="flex flex-col items-center gap-3 py-6" role="status">
            <span className="loading loading-spinner loading-lg" />
            <p className="text-sm text-base-content/60">Signing you in...</p>
          </div>
        </Shell>
      )
    }
    return (
      <Shell>
        <div role="alert" className="alert alert-error text-sm">
          We could not complete your sign-in. Please try again.
        </div>
        <Link to="/login" className="btn btn-primary w-full">Back to login</Link>
      </Shell>
    )
  }

  if (status === 'link' && ticket && email) {
    return (
      <Shell>
        <h1 className="text-center text-2xl font-bold">Link your Google account</h1>
        <p className="text-center text-sm text-base-content/60">
          An account for <strong>{email}</strong> already exists. Enter its password to confirm it is
          yours and link Google sign-in to it.
        </p>

        {linkError && (
          <div role="alert" className="alert alert-error text-sm">{linkError}</div>
        )}

        <form onSubmit={onLink} className="space-y-4">
          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend">Password</legend>
            <input
              type="password"
              autoComplete="current-password"
              required
              disabled={linking}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
            />
          </fieldset>
          <button type="submit" disabled={linking || !password} className="btn btn-primary w-full">
            {linking ? 'Linking...' : 'Confirm and link'}
          </button>
        </form>

        <Link to="/login" className="link link-primary text-center text-sm">Cancel</Link>
      </Shell>
    )
  }

  return (
    <Shell>
      <div role="alert" className="alert alert-error text-sm">
        {(errorCode && ERROR_MESSAGES[errorCode]) || 'Google sign-in failed. Please try again.'}
      </div>
      <Link to="/login" className="btn btn-primary w-full">Back to login</Link>
    </Shell>
  )
}
