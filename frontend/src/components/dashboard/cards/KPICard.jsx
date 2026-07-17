import { useEffect, useState } from "react";

export default function KPICard({

  title,

  value,

  icon: Icon,

  color,

}) {

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {

    let finalValue = 0;

    if (typeof value === "string") {

      finalValue = parseInt(value.replace("%", "")) || 0;

    } else {

      finalValue = Number(value) || 0;

    }

    let current = 0;

    const increment = Math.max(1, Math.ceil(finalValue / 40));

    const timer = setInterval(() => {

      current += increment;

      if (current >= finalValue) {

        current = finalValue;

        clearInterval(timer);

      }

      setDisplayValue(current);

    }, 20);

    return () => clearInterval(timer);

  }, [value]);

  const showValue =

    typeof value === "string" && value.includes("%")

      ? `${displayValue}%`

      : displayValue;

  return (

    <div

      className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-500 hover:shadow-blue-600/30"

    >

      {/* Animated Top Border */}

      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />

      {/* Glow */}

      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl transition-all duration-700 group-hover:bg-blue-500/20" />

      <div className="relative flex items-center justify-between p-7">

        <div>

          <p className="text-sm font-medium uppercase tracking-widest text-slate-400">

            {title}

          </p>

          <h2

            className={`mt-4 text-5xl font-black tracking-tight ${color}`}

          >

            {showValue}

          </h2>

        </div>

        <div

          className="rounded-2xl bg-slate-800 p-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"

        >

          <Icon

            size={38}

            className={`${color} transition-all duration-500 group-hover:scale-125`}

          />

        </div>

      </div>

      {/* Bottom Glow */}

      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700 group-hover:w-full" />

    </div>

  );

}