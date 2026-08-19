import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'

import { useAuth } from '../hooks/useAuth'
import { signupSchema, SignupFormData } from '../features/auth/authValidation'

export default function Signup() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [generalError, setGeneralError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: SignupFormData) => {
    setGeneralError(null)

    const result = await registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    })

    if (result.success) {
      toast.success('Account created — welcome!')
      navigate('/', { replace: true })
      return
    }

    if (result.errors) {
      Object.entries(result.errors).forEach(([field, messages]) => {
        const formField = field.toLowerCase() as keyof SignupFormData
        setError(formField, { type: 'server', message: messages[0] })
      })
    } else {
      setGeneralError(result.message ?? 'Unable to create your account.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-center text-3xl font-bold">Create Account</h1>
          <p className="mb-2 text-center text-sm text-base-content/60">Start your journey today.</p>

          {generalError && (
            <div role="alert" className="alert alert-error text-sm">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <fieldset className="fieldset p-0">
                <legend className="fieldset-legend">First name</legend>
                <input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="John"
                  {...register('firstName')}
                  className={`input w-full ${errors.firstName ? 'input-error' : ''}`}
                />
                {errors.firstName && <p className="label text-error">{errors.firstName.message}</p>}
              </fieldset>

              <fieldset className="fieldset p-0">
                <legend className="fieldset-legend">Last name</legend>
                <input
                  type="text"
                  disabled={isSubmitting}
                  placeholder="Doe"
                  {...register('lastName')}
                  className={`input w-full ${errors.lastName ? 'input-error' : ''}`}
                />
                {errors.lastName && <p className="label text-error">{errors.lastName.message}</p>}
              </fieldset>
            </div>

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

            <fieldset className="fieldset p-0">
              <legend className="fieldset-legend">Confirm password</legend>
              <input
                type="password"
                disabled={isSubmitting}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={`input w-full ${errors.confirmPassword ? 'input-error' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="label text-error">{errors.confirmPassword.message}</p>
              )}
            </fieldset>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
