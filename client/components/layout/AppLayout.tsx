import { PropsWithChildren, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { LanguageRail } from "./LanguageRail";
import { Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export default function AppLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Sidebar collapsed (mini) state. Default: collapse on inner pages
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") === "true";
    } catch {
      return pathname !== "/"; // collapse by default on inner pages
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", String(collapsed));
    } catch {}
  }, [collapsed]);

  // When navigating to inner pages, collapse sidebar automatically
  useEffect(() => {
    if (pathname !== "/") setCollapsed(true);
    else setCollapsed(false);
  }, [pathname]);

  // Currency select state
  const [currency, setCurrency] = useState(() => {
    try {
      return (localStorage.getItem("currency") as string) || "EUR";
    } catch {
      return "EUR";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("currency", currency);
    } catch {}
  }, [currency]);

  // Fetch exchange rates (switch to ER API)
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const fetchRates = async () => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/EUR");
      if (!res.ok) return;
      const data = await res.json();
      // data.rates is an object of currency: value
      setRates(data.rates || null);
    } catch (e) {
      // ignore
    }
  };

  // auto-collapse on small screens and refresh rates periodically
  useEffect(() => {
    fetchRates();
    const id = setInterval(fetchRates, 1000 * 60 * 5); // refresh every 5 minutes

    function onResize() {
      try {
        const isSmall = window.innerWidth < 768;
        if (isSmall) setCollapsed(true);
      } catch {}
    }
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      clearInterval(id);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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

      {/* Desktop top bar */}
      <header className="hidden md:flex items-center justify-between sticky top-0 z-50 bg-white/70 dark:bg-neutral-900/60 backdrop-blur border-b border-white/20 h-16">
        <div className="max-w-7xl mx-auto w-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NavLink to="/" className="font-semibold tracking-tight text-lg">
              On Hotel Antalya
            </NavLink>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              title={collapsed ? "Sidebar'ı genişlet" : "Sidebar'ı daralt"}
              onClick={() => setCollapsed((c) => !c)}
              className="rounded-md p-2 hover:bg-slate-100"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex items-center gap-2 relative">
              <label className="text-xs text-slate-500">Döviz</label>
              <select
                aria-label="Döviz seçimi"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-md border px-3 py-1 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="EUR">Euro (EUR)</option>
                <option value="USD">Dolar (USD)</option>
                <option value="TRY">Türk Lirası (TRY)</option>
                <option value="GBP">Pound (GBP)</option>
                <option value="RUB">Ruble (RUB)</option>
              </select>

              <button
                className="ml-2 text-xs text-slate-500 hover:text-slate-700"
                onClick={() => setShowRates((s) => !s)}
                aria-expanded={String(Boolean(false))}
              >
                Detay
              </button>

              {rates ? (
                <div className="ml-3 text-sm text-slate-500 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div>1 EUR ≈</div>
                    <div className="font-semibold">
                      {currency === "EUR" ? "1.00" : (rates[currency] || "—")}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">Kurlar yükleniyor...</div>
              )}

              {/* Rates panel */}
              {showRates && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-900 border border-white/10 shadow-lg rounded-md p-3 z-50">
                  <div className="text-xs text-slate-500 mb-2">Güncel Kurlar (1 EUR)</div>
                  <div className="space-y-2">
                    {Object.entries(rates || {}).filter(([k]) => ["USD","TRY","GBP","RUB"].includes(k)).map(([k,v]) => (
                      <div key={k} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 text-xs font-medium">{k}</div>
                          <div className="text-slate-600">{v.toFixed(4)}</div>
                        </div>
                        <div className="w-20 h-3 bg-slate-100 rounded overflow-hidden">
                          <div style={{width: `${Math.min(100, (v / (rates["TRY"]||1)) * 20)}%`}} className="h-full bg-brand" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
        <Sidebar className={`md:sticky md:top-0 md:h-screen ${collapsed ? "collapsed" : ""}`} onNavigate={() => { setOpen(false); }} collapsed={collapsed} />
        <main className={`flex-1 min-w-0 ${collapsed ? "md:pl-6" : ""}`}>{children}</main>
      </div>

      {/* Right languages rail */}
      <LanguageRail />
    </div>
  );
}
