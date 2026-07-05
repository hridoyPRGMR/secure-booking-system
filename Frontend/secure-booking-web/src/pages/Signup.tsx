import { useState } from "react";

type SignupForm = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Signup() {
  const [form, setForm] = useState<SignupForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    console.log(form);

    // TODO:
    // await signup(form);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold">
          Create Account
        </h1>

        <p className="mb-8 text-center text-sm text-gray-500">
          Start your journey today.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              required
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
            />
          </div>

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

          <div>
            <label className="mb-2 block text-sm font-medium">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button className="font-medium text-indigo-600 hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}