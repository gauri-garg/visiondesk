import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [name, setName] = useState(user.name || "");
  const [email] = useState(user.email || "");

  function saveProfile() {
    localStorage.setItem("user", JSON.stringify({ ...user, name }));
    alert("Profile updated successfully.");
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">My Profile</h1>

        <div className="mt-6 flex justify-center sm:mt-8">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=2563eb&color=fff&size=128`}
            alt="Profile"
            className="h-28 w-28 rounded-full border-4 border-blue-500 sm:h-32 sm:w-32"
          />
        </div>

        <div className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
          <div>
            <label className="text-sm text-slate-400">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Email</label>
            <input
              value={email}
              disabled
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-slate-400"
            />
          </div>

          <button
            onClick={saveProfile}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 sm:px-8"
          >
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}