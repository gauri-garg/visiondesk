import {
  LayoutDashboard,
  Camera,
  BookOpen,
  Bot,
  BarChart3,
  FileText,
  User,
  ShieldCheck,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, title: "Dashboard", path: "/dashboard" },
  { icon: Camera, title: "AI Detection", path: "/detect" },
  { icon: BookOpen, title: "Knowledge Base", path: "/upload" },
  { icon: Bot, title: "AI Assistant", path: "/chat" },
  { icon: BarChart3, title: "Analytics", path: "/analytics" },
  { icon: FileText, title: "Reports", path: "/reports" },
  { icon: User, title: "My Profile", path: "/profile" },
];

/**
 * Renders as a static column from `lg` up, and as an overlay drawer
 * below it. Before this, the sidebar was `hidden md:flex`, which left
 * phones and small tablets with no navigation at all.
 */
export default function Sidebar({ open = false, onClose = () => {} }) {
  return (
    <>
      {/* Backdrop — mobile only */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] max-w-[85vw] shrink-0 flex-col overflow-y-auto border-r border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-72 lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-2 border-b border-slate-800 p-5 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="shrink-0 rounded-2xl bg-blue-600 p-2.5 shadow-lg shadow-blue-500/30 sm:p-3">
              <ShieldCheck size={28} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
                VisionDesk
              </h1>
              <p className="text-sm text-blue-400">AI Platform</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 p-4 sm:p-5">
          {menuItems.map(({ icon: Icon, title, path }) => (
            <NavLink
              key={title}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-2xl px-4 py-3 transition-all duration-300 sm:px-5 sm:py-3.5 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              <span className="truncate">{title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4 sm:p-5">
          <div className="rounded-2xl bg-slate-800 p-4 sm:p-5">
            <p className="text-sm text-slate-400">VisionDesk AI</p>
            <p className="mt-1.5 font-bold text-white">Enterprise Edition</p>
          </div>
        </div>
      </aside>
    </>
  );
}
