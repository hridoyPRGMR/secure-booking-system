import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Mail, CheckCircle2 } from 'lucide-react'

import { authService } from '../features/auth/authService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      await authService.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        setError('Too many attempts. Please wait a few minutes and try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          {sent ? (
            <div className="flex flex-col items-center gap-3 text-center" role="status">
              <CheckCircle2 className="h-12 w-12 text-success" />
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-sm text-base-content/60">
                If an account exists for <strong>{email.trim()}</strong>, we've sent a link to reset your
                password. It expires in 1 hour.
              </p>
              <Link to="/login" className="btn btn-primary mt-2 w-full">Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-center text-3xl font-bold">Forgot password?</h1>
              <p className="mb-2 text-center text-sm text-base-content/60">
                Enter your email and we'll send you a link to reset it.
              </p>

              {error && (
                <div role="alert" className="alert alert-error alert-soft text-sm">{error}</div>
              )}

              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <fieldset className="fieldset p-0">
                  <legend className="fieldset-legend">Email</legend>
                  <label className="input w-full">
                    <Mail className="h-4 w-4 opacity-50" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={submitting}
                      autoComplete="email"
                      placeholder="john@example.com"
                    />
                  </label>
                </fieldset>

                <button type="submit" disabled={submitting || !email} className="btn btn-primary w-full">
                  {submitting && <span className="loading loading-spinner loading-sm" />}
                  {submitting ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <p className="text-center text-sm text-base-content/60">
                Remembered it?{' '}
                <Link to="/login" className="link link-primary font-medium">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
