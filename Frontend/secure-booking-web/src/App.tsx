import React from 'react'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-2xl shadow-slate-200">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Secure Booking</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Web application starter with Tailwind
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            A clean React + Vite frontend setup with Tailwind CSS ready. This helps confirm the styling pipeline is working correctly.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Fast build</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Vite compiles extremely fast, so changes appear instantly during development.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Tailwind ready</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Tailwind utilities are applied directly, proving the CSS processor is working end-to-end.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">React + TS</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A React component with TypeScript support is already in place and styled with utility classes.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">API ready</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Your backend and frontend structure are separated, so you can add endpoints and UI features easily.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
