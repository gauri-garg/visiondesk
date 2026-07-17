import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/detect", label: "Detection" },
  { to: "/upload", label: "Knowledge Base" },
  { to: "/analytics", label: "Analytics" },
  { to: "/reports", label: "Reports" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the drawer on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          to="/"
          className="shrink-0 text-xl font-bold text-blue-500 sm:text-2xl"
        >
          VisionDesk AI
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`whitespace-nowrap text-sm transition hover:text-blue-400 ${
                pathname === to ? "text-blue-400" : "text-slate-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:block">
            <Button>Login</Button>
          </Link>

          {/* Mobile / tablet menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex size-10 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet drawer */}
      {open && (
        <div
          id="mobile-nav"
          className="border-t border-slate-800 bg-slate-950 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-lg px-3 py-3 text-base transition ${
                  pathname === to
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}

            <Link to="/login" className="mt-2 sm:hidden">
              <Button className="w-full" size="lg">
                Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
