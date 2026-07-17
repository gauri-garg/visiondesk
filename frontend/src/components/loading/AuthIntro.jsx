import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function AuthIntro({ onFinish }) {

  const [progress, setProgress] = useState(0);

  useEffect(() => {

    const timer = setInterval(() => {

      setProgress((prev) => {

        if (prev >= 100) {

          clearInterval(timer);

          setTimeout(() => {

            onFinish();

          }, 500);

          return 100;

        }

        return prev + 2;

      });

    }, 25);

    return () => clearInterval(timer);

  }, [onFinish]);

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-slate-950">

      <div className="text-center">

        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-blue-600 shadow-[0_0_60px_rgba(37,99,235,.7)] animate-pulse">

          <ShieldCheck

            size={60}

            className="text-white"

          />

        </div>

        <h1 className="text-5xl font-black text-white">

          VisionDesk AI

        </h1>

        <p className="mt-4 text-lg text-blue-300">

          AI Powered Workplace Safety Monitoring

        </p>

        <div className="mx-auto mt-12 h-3 w-96 overflow-hidden rounded-full bg-slate-800">

          <div

            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"

            style={{

              width: `${progress}%`

            }}

          />

        </div>

        <p className="mt-5 text-slate-400">

          Initializing AI Platform...

        </p>

      </div>

    </div>

  );

}