import { Link, useLocation } from "react-router-dom";

export default function Placeholder() {
  const { pathname } = useLocation();
  const title =
    pathname
      .replace(/\//g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Ana Sayfa";

  return (
    <section className="min-h-[calc(100vh-0px)] relative overflow-hidden">
      <div className="absolute inset-0 hero-bg" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-4 text-slate-600 max-w-2xl">
          Bu sayfa talebiniz doğrultusunda özelleştirilebilir. Devam etmek için
          bize ne görmek istediğinizi söyleyin.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="rounded-md bg-brand text-white px-5 py-3 font-semibold"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </section>
  );
}
