import { NavLink } from "react-router-dom";
import {
  Ship,
  Bus,
  Film,
  Home,
  LifeBuoy,
  Plane,
  Ticket,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Ana Sayfa", icon: Home },
  { to: "/turlar", label: "Turlar", icon: Ticket },
  { to: "/transferler", label: "Transferler", icon: Car },
  { to: "/videolar", label: "Tanıtım/Videolar", icon: Film },
  { to: "/yat-kiralama", label: "Yat Kiralama", icon: Ship },
  { to: "/ucak-bileti", label: "Uçak Bileti", icon: Plane },
  { to: "/otobus-bileti", label: "Otobüs Bileti", icon: Bus },
  { to: "/destek", label: "Destek", icon: LifeBuoy },
];

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <aside
      className={cn(
        "h-full w-64 shrink-0 bg-white/70 dark:bg-white/5 border-r border-white/20 backdrop-blur-xl hidden md:flex flex-col",
        className,
      )}
    >
      <div className="px-5 pt-6 pb-4 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-brand text-white grid place-items-center font-bold">
            on
          </div>
          <div>
            <p className="text-sm tracking-widest uppercase text-slate-500">
              Antalya
            </p>
            <p className="font-semibold">On Hotel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand text-white shadow"
                  : "text-slate-700 hover:bg-brand/10 hover:text-brand dark:text-slate-200",
              )
            }
          >
            <Icon className="h-5 w-5 opacity-90" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-slate-500/80">
        <p>7/24 Destek Hattı</p>
        <p className="font-semibold">+90 555 844 99 01</p>
      </div>
    </aside>
  );
}
