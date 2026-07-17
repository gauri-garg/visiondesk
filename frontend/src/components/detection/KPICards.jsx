import { Users } from "lucide-react";

export default function KPICards({ count }) {

  return (

    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">

      <div className="rounded-xl bg-slate-900 p-6">

        <Users size={40} />

        <h3 className="mt-3 text-slate-400">
          Workers
        </h3>

        <p className="text-3xl font-bold">
          {count}
        </p>

      </div>

    </div>

  );

}