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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold">Create Account</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Start your journey today.</p>

        {generalError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">First name</label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="John"
                {...register('firstName')}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-indigo-500 ${
                  errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && (
                <span className="mt-1 block text-xs text-red-500">{errors.firstName.message}</span>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Last name</label>
              <input
                type="text"
                disabled={isSubmitting}
                placeholder="Doe"
                {...register('lastName')}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-indigo-500 ${
                  errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && (
                <span className="mt-1 block text-xs text-red-500">{errors.lastName.message}</span>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              disabled={isSubmitting}
              placeholder="john@example.com"
              {...register('email')}
              className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-indigo-500 ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <span className="mt-1 block text-xs text-red-500">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              disabled={isSubmitting}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-indigo-500 ${
                errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && (
              <span className="mt-1 block text-xs text-red-500">{errors.password.message}</span>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              type="password"
              disabled={isSubmitting}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-indigo-500 ${
                errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && (
              <span className="mt-1 block text-xs text-red-500">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
