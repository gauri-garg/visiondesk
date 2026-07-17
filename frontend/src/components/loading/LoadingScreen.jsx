import { ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function LoadingScreen() {

  const [progress, setProgress] = useState(0);

  const user = JSON.parse(

    localStorage.getItem("user") ||

    sessionStorage.getItem("user") ||

    "{}"

  );

  const loadingSteps = [

    "Initializing VisionDesk AI...",

    "Loading AI Detection Engine...",

    "Connecting Gemini AI...",

    "Loading Dashboard Modules...",

    "Preparing Workplace Analytics...",

    "Almost Ready..."

  ];

  const step = Math.min(

    Math.floor(progress / 17),

    loadingSteps.length - 1

  );

  useEffect(() => {

    const timer = setInterval(() => {

      setProgress((prev) => {

        if (prev >= 100) {

          clearInterval(timer);

          return 100;

        }

        return prev + 1;

      });

    }, 35);

    return () => clearInterval(timer);

  }, []);

  const particles = useMemo(() =>

    Array.from({ length: 18 }, (_, i) => ({

      id: i,

      left: Math.random() * 100,

      top: Math.random() * 100,

      size: Math.random() * 6 + 4,

      duration: Math.random() * 8 + 6,

      delay: Math.random() * 5,

    }))

  , []);

  return (

    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950">

      {/* Background */}

      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950"/>

      {/* Grid */}

      <div

        className="absolute inset-0 opacity-10"

        style={{

          backgroundImage:

            "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",

          backgroundSize: "45px 45px",

        }}

      />

      {/* Glow */}

      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-3xl animate-pulse"/>

      {/* Floating Particles */}

      {particles.map((p)=>(

        <div

          key={p.id}

          className="absolute rounded-full bg-cyan-400/40"

          style={{

            width:p.size,

            height:p.size,

            left:`${p.left}%`,

            top:`${p.top}%`,

            animation:`float ${p.duration}s ease-in-out ${p.delay}s infinite`

          }}

        />

      ))}

      <div className="relative flex h-full flex-col items-center justify-center">

        {/* Logo */}

        <div className="relative">

          {/* Rotating Ring */}

          <div className="absolute -inset-6 rounded-full border-4 border-blue-500/30 border-t-blue-400 animate-spin"/>

          <div className="absolute -inset-12 rounded-full border border-cyan-400/20 animate-ping"/>

          <div className="rounded-full bg-blue-600 p-8 shadow-[0_0_80px_rgba(59,130,246,0.7)]">

            <ShieldCheck

              size={90}

              className="text-white"

            />

          </div>

        </div>

        <h1 className="mt-12 text-6xl font-black tracking-wide text-white">

          VisionDesk AI

        </h1>

        <p className="mt-4 text-xl text-blue-300">

          AI Powered Workplace Safety Monitoring

        </p>

        <div className="mt-10 text-center">

          <h2 className="text-2xl font-semibold text-white">

            Welcome back,

          </h2>

          <h3 className="mt-2 text-3xl font-bold text-cyan-300">

            {user.full_name ||

             user.name ||

             "User"}

          </h3>

        </div>

        <div className="mt-12 w-[500px] max-w-[90%]">

          <div className="mb-4 flex justify-between">

            <span className="text-slate-300">

              {loadingSteps[step]}

            </span>

            <span className="font-bold text-cyan-300">

              {progress}%

            </span>

          </div>

          <div className="h-4 overflow-hidden rounded-full bg-slate-800">

            <div

              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 transition-all duration-300"

              style={{

                width:`${progress}%`

              }}

            />

          </div>

        </div>

        <p className="mt-12 text-slate-400">

          Please wait while VisionDesk AI prepares your workspace...

        </p>

      </div>

      <style>{`

      @keyframes float{

        0%{

          transform:translateY(0px);

          opacity:.3;

        }

        50%{

          transform:translateY(-30px);

          opacity:1;

        }

        100%{

          transform:translateY(0px);

          opacity:.3;

        }

      }

      `}</style>

    </div>

  );

}