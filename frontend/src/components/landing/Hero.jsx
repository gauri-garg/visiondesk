import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[80vh] sm:px-6 sm:py-20 lg:min-h-[85vh]">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
      >
        AI Workplace Intelligence
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-5 max-w-2xl text-pretty text-base text-slate-400 sm:mt-7 sm:text-lg md:text-xl"
      >
        Detect workplace safety violations, analyze documents, generate
        AI-powered reports, and monitor PPE compliance using VisionDesk AI.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:mt-10 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4"
      >
        <Link to="/detect" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">
            Start Detection
          </Button>
        </Link>

        <Link to="/dashboard" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Open Dashboard
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
