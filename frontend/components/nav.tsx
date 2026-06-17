"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home", index: "01" },
  { href: "/about", label: "About", index: "02" },
  { href: "/portfolio", label: "Use Cases", index: "03" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";
  const overlay = isHome && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        overlay
          ? "bg-transparent text-paper"
          : "bg-paper/85 text-ink border-b border-border backdrop-blur-md"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Mark className={overlay ? "text-paper" : "text-ink"} />
          <span className="font-display text-lg leading-none tracking-tight">ArchMind</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "group flex items-center gap-1.5 text-sm transition-opacity",
                pathname === l.href ? "opacity-100" : "opacity-60 hover:opacity-100"
              )}
            >
              <span className="font-mono text-[10px] tabular-nums opacity-60">{l.index}</span>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/chat"
            className={cn(
              "group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              overlay
                ? "bg-paper text-ink hover:bg-clay hover:text-clay-foreground"
                : "bg-ink text-paper hover:bg-clay hover:text-clay-foreground"
            )}
          >
            Open ArchMind
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-paper text-ink border-t border-border px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-base"
            >
              <span className="font-mono text-[10px] opacity-50">{l.index}</span>
              {l.label}
            </Link>
          ))}
          <Link
            href="/chat"
            onClick={() => setOpen(false)}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-ink text-paper px-4 py-2.5 text-sm font-medium"
          >
            Open ArchMind
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </header>
  );
}

function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={cn("w-6 h-6", className)}
      aria-hidden
    >
      <path d="M12 2.5 3 8v13.5h18V8L12 2.5Z" />
      <path d="M12 2.5V21.5" strokeOpacity="0.5" />
      <path d="M3 8l9 5 9-5" strokeOpacity="0.5" />
    </svg>
  );
}
