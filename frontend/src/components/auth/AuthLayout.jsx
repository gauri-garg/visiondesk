import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">

      {/* Background */}

      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />

      {/* Glow */}

      <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />

      {/* Left Side */}

      <div className="hidden w-1/2 items-center justify-center lg:flex">

        <div className="max-w-lg px-10">

          <div className="mb-10 inline-flex rounded-3xl bg-blue-600 p-6 shadow-2xl shadow-blue-600/40">

            <ShieldCheck
              size={70}
              className="text-white"
            />

          </div>

          <h1 className="text-6xl font-black text-white">

            VisionDesk AI

          </h1>

          <p className="mt-6 text-2xl font-medium text-blue-300">

            AI Powered Workplace Safety Monitoring

          </p>

          <p className="mt-8 text-lg leading-8 text-slate-300">

            Detect PPE violations, generate AI inspection
            reports and monitor workplace safety with
            intelligent computer vision.

          </p>

        </div>

      </div>

      {/* Right Side */}

      <div className="relative flex w-full items-center justify-center px-8 py-12 lg:w-1/2">

        {children}

      </div>

    </div>
  );
}