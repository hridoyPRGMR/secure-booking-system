import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AlertCircle, Circle, CheckCircle2, Lock } from 'lucide-react'

import { authService } from '../features/auth/authService'

export default function ResetPassword() {
  const navigate = useNavigate()

  // The token arrives in the URL fragment (never sent to servers). Capture it once, then strip it
  // from the address bar and history.
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token'))
  useEffect(() => {
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname)
  }, [])

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rules = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'One number', ok: /[0-9]/.test(password) },
  ]
  const valid = rules.every((r) => r.ok) && password === confirm

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !valid) return
    setError(null)
    setSubmitting(true)
    try {
      await authService.resetPassword(token, password)
      toast.success('Password updated. Please sign in.')
      navigate('/login', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { detail?: string; errors?: Record<string, string[]> } | undefined
        const first = data?.errors && Object.values(data.errors)[0]?.[0]
        setError(
          err.response?.status === 429
            ? 'Too many attempts. Please wait a few minutes and try again.'
            : first || data?.detail || 'Could not reset your password.'
        )
      } else {
        setError('Could not reset your password.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {!token ? (
            <>
              <div role="alert" className="alert alert-error alert-soft text-sm">
                <AlertCircle className="h-5 w-5" />
                <span>This reset link is invalid. Please request a new one.</span>
              </div>
              <Link to="/forgot-password" className="btn btn-primary w-full">Request a new link</Link>
            </>
          ) : (
            <>
              <h1 className="text-center text-3xl font-bold">Set a new password</h1>
              <p className="mb-2 text-center text-sm text-base-content/60">
                Choose a strong password you don't use elsewhere.
              </p>

              {error && (
                <div role="alert" className="alert alert-error alert-soft text-sm">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <fieldset className="fieldset p-0">
                  <legend className="fieldset-legend">New password</legend>
                  <label className="input w-full">
                    <Lock className="h-4 w-4 opacity-50" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={submitting}
                    />
                  </label>
                </fieldset>

                <fieldset className="fieldset p-0">
                  <legend className="fieldset-legend">Confirm new password</legend>
                  <label className={`input w-full ${confirm && confirm !== password ? 'input-error' : ''}`}>
                    <Lock className="h-4 w-4 opacity-50" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      disabled={submitting}
                    />
                  </label>
                  {confirm && confirm !== password && (
                    <p className="label text-error">Passwords do not match.</p>
                  )}
                </fieldset>

                {password && (
                  <ul className="grid gap-1 text-sm sm:grid-cols-2" aria-label="Password requirements">
                    {rules.map((r) => (
                      <li
                        key={r.label}
                        className={`flex items-center gap-2 ${r.ok ? 'text-success' : 'text-base-content/50'}`}
                      >
                        {r.ok ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        {r.label}
                      </li>
                    ))}
                  </ul>
                )}

                <button type="submit" disabled={submitting || !valid} className="btn btn-primary w-full">
                  {submitting && <span className="loading loading-spinner loading-sm" />}
                  {submitting ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
