import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'

import { useAuth } from '../hooks/useAuth'
import { loginSchema, LoginFormData } from '../features/auth/authValidation'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [generalError, setGeneralError] = useState<string | null>(null)

  const from = (location.state as { from?: Location })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const onSubmit = async (data: LoginFormData) => {
    setGeneralError(null)

    const result = await login(data.email, data.password)

    if (result.success) {
      toast.success('Welcome back!')
      navigate(from, { replace: true })
      return
    }

    if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        const formField = field.toLowerCase() as keyof LoginFormData
        setError(formField, { type: 'server', message: messages[0] })
      })
    } else {
      setGeneralError(result.message ?? 'Invalid email or password.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-center text-3xl font-bold">Welcome Back</h1>
          <p className="mb-2 text-center text-sm text-base-content/60">Sign in to continue.</p>

          {generalError && (
            <div role="alert" className="alert alert-error text-sm">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <fieldset className="fieldset p-0">
              <legend className="fieldset-legend">Email</legend>
              <input
                type="email"
                disabled={isSubmitting}
                placeholder="john@example.com"
                {...register('email')}
                className={`input w-full ${errors.email ? 'input-error' : ''}`}
              />
              {errors.email && <p className="label text-error">{errors.email.message}</p>}
            </fieldset>

            <fieldset className="fieldset p-0">
              <legend className="fieldset-legend">Password</legend>
              <input
                type="password"
                disabled={isSubmitting}
                placeholder="••••••••"
                {...register('password')}
                className={`input w-full ${errors.password ? 'input-error' : ''}`}
              />
              {errors.password && <p className="label text-error">{errors.password.message}</p>}
            </fieldset>

            <div className="flex items-center justify-between text-sm">
              <label className="label gap-2">
                <input
                  type="checkbox"
                  disabled={isSubmitting}
                  {...register('remember')}
                  className="checkbox checkbox-sm"
                />
                Remember me
              </label>

              <button type="button" className="link link-primary">
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Don't have an account?{' '}
            <Link to="/signup" className="link link-primary font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
