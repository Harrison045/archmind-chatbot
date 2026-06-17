import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const cols = [
  {
    title: "Navigate",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
      { href: "/portfolio", label: "Use Cases" },
      { href: "/chat", label: "Open ArchMind" },
    ],
  },
  {
    title: "Coverage",
    links: [
      { href: "/about", label: "Spatial Planning" },
      { href: "/about", label: "Passive Design" },
      { href: "/about", label: "Codes & Standards" },
      { href: "/about", label: "Practice" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="absolute inset-0 bg-grid-dark opacity-40" />
      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-10">
        {/* Big wordmark */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 pb-16 border-b border-white/10">
          <div className="max-w-md">
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-clay mb-5">
              Architectural Intelligence
            </p>
            <h2 className="font-display text-4xl md:text-5xl leading-[0.95] tracking-tight">
              Inform your
              <br />
              design decisions.
            </h2>
          </div>
          <Link
            href="/chat"
            className="group inline-flex items-center gap-2 rounded-full bg-paper text-ink px-6 py-3 text-sm font-medium hover:bg-clay hover:text-clay-foreground transition-colors self-start"
          >
            Start a conversation
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-14">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2.5 font-display text-xl">
              <span>ArchMind</span>
            </div>
            <p className="text-sm text-paper/55 leading-relaxed mt-4 max-w-xs">
              A thinking partner for architects, students, and builders — built with rigour,
              Ghana-aware by default, and powered by OpenRouter.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-paper/40 mb-5">
                {col.title}
              </p>
              <ul className="flex flex-col gap-3">
                {col.links.map((l, i) => (
                  <li key={`${l.label}-${i}`}>
                    <Link
                      href={l.href}
                      className="text-sm text-paper/70 hover:text-paper transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Fine print */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <p className="font-mono text-[11px] text-paper/40 tracking-wide">
            © 2026 ARCHMIND — 05°33′N 00°12′W
          </p>
          <p className="text-[11px] text-paper/45 max-w-xl leading-relaxed md:text-right">
            ArchMind informs professional judgment — it does not replace a licensed architect&apos;s
            or engineer&apos;s stamped work. When usefulness and safety conflict, safety wins.
          </p>
        </div>
      </div>
    </footer>
  );
}
