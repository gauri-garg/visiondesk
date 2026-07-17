import { Bell, Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/detect": "AI Detection",
  "/upload": "Knowledge Base",
  "/chat": "AI Assistant",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/profile": "My Profile",
};

export default function Topbar({ onMenuClick = () => {} }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const title = PAGE_TITLES[pathname] || "Dashboard";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4 sm:h-20 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-white sm:text-2xl lg:text-3xl">
            {title}
          </h2>
          <p className="hidden truncate text-sm text-slate-400 sm:block">
            Welcome back,
            <span className="ml-1 font-semibold text-blue-400">
              {user.name || "User"}
            </span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <button
          type="button"
          aria-label="Search"
          className="hidden size-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white sm:inline-flex"
        >
          <Search size={20} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="hidden size-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white sm:inline-flex"
        >
          <Bell size={20} />
        </button>

        <div className="hidden text-right lg:block">
          <p className="font-semibold text-white">{user.name || "User"}</p>
          <p className="max-w-[14rem] truncate text-xs text-slate-400">
            {user.email || ""}
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 sm:px-4 sm:text-base"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
