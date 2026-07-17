import { Camera, Brain, FileText, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: Camera,
    title: "Computer Vision",
    description: "Detect PPE violations and workplace hazards.",
  },
  {
    icon: FileText,
    title: "Document AI",
    description: "Analyze safety manuals and reports.",
  },
  {
    icon: Brain,
    title: "AI Assistant",
    description: "Ask questions using RAG and Gemini.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Visualize workplace insights.",
  },
];

export default function Features() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-8 text-center text-2xl font-bold sm:mb-12 sm:text-4xl md:text-5xl">
          Platform Features
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700 sm:p-6"
            >
              <Icon className="mb-4 text-blue-500" size={36} />

              <h3 className="mb-2 text-lg font-bold sm:text-xl">{title}</h3>

              <p className="text-sm text-slate-400 sm:text-base">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
