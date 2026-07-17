import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import FloatingChat from "@/components/chat/FloatingChat";

export default function DashboardLayout({ children }) {
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  // Close the drawer if the viewport grows past the lg breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const onChange = (e) => e.matches && setSidebarOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    // `overflow-x-hidden` (not `overflow-hidden`) — the old value clipped
    // vertical content and broke `sticky` positioning inside the page.
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right side */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className={`transition-all duration-700 delay-200 ease-out ${
            loaded ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"
          }`}
        >
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main
          className={`flex-1 overflow-y-auto p-4 duration-700 delay-300 ease-out sm:p-6 lg:p-8 ${
            loaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {children}
        </main>
      </div>

      {/* Floating AI Assistant */}
      <div
        className={`transition-all duration-700 delay-500 ease-out ${
          loaded ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <FloatingChat />
      </div>
    </div>
  );
}
