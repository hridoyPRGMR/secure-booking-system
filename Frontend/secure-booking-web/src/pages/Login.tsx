import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import { authService } from "../features/auth/authService";
import { loginSchema, LoginFormData } from "../features/auth/authValidation";

interface ApiValidationError {
  detail?: string;
  errors?: Record<string, string[]>;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setGeneralError(null);



    try {
      const response = await authService.login({
        email: data.email,
        password: data.password
      });

      console.log("Auth Response: "+ response);
      
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("user", JSON.stringify({
        id: response.id,
        email: response.email,
        name: `${response.firstName} ${response.lastName}`
      }));

      navigate(from, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data as ApiValidationError;

        if (error.response.status === 400 && errorData.errors) {
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            const formField = field.toLowerCase() as keyof LoginFormData;
            setError(formField, { type: "server", message: messages[0] });
          });
        } else {
          setGeneralError(errorData.detail || "Invalid email or password.");
        }
      } else {
        setGeneralError("A network error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold">Welcome Back</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Sign in to continue.</p>

        {generalError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              disabled={isSubmitting}
              placeholder="john@example.com"
              {...register("email")}
              className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-indigo-500 ${
                errors.email ? "border-red-500 focus:border-red-500" : "border-gray-300"
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
              {...register("password")}
              className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:border-indigo-500 ${
                errors.password ? "border-red-500 focus:border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <span className="mt-1 block text-xs text-red-500">{errors.password.message}</span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 select-none">
              <input
                type="checkbox"
                disabled={isSubmitting}
                {...register("remember")}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remember me
            </label>

            <button type="button" className="text-indigo-600 hover:underline">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button className="font-medium text-indigo-600 hover:underline">Sign Up</button>
        </p>
      </div>
    </div>
  );
}