import { useState } from "react";

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

export default function Login() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log(form);

    // TODO:
    // await login(form);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold">
          Welcome Back
        </h1>

        <p className="mb-8 text-center text-sm text-gray-500">
          Sign in to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              Remember me
            </label>

            <button
              type="button"
              className="text-indigo-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <button className="font-medium text-indigo-600 hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}