import { PropsWithChildren, useState } from "react";
import { Sidebar } from "./Sidebar";
import { LanguageRail } from "./LanguageRail";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function AppLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      {/* Top bar for mobile */}
      <header className="md:hidden sticky top-0 z-50 bg-white/70 dark:bg-neutral-900/60 backdrop-blur border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            aria-label="Menüyü aç"
            className="p-2 rounded-md bg-brand text-white"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <NavLink to="/" className="font-semibold tracking-tight">
            On Hotel Antalya
          </NavLink>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-brand/10 text-brand px-2 py-1">
              TR
            </span>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[80%] max-w-[320px] bg-white dark:bg-neutral-900 border-r border-white/20 transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <span className="font-semibold">Menü</span>
            <button
              className="p-2"
              aria-label="Kapat"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="flex md:pt-0">
        <Sidebar className="md:sticky md:top-0 md:h-screen" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Right languages rail */}
      <LanguageRail />
    </div>
  );
}
