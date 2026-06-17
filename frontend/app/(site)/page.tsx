import Link from "next/link";
import Reveal from "@/components/reveal";
import { cn } from "@/lib/utils";
import {
  Building2,
  Layers,
  Leaf,
  BookOpen,
  ToyBrick,
  Briefcase,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Spatial Planning",
    description: "Massing, circulation, daylight, proportion and acoustics — reasoned before you draw.",
  },
  {
    icon: Layers,
    title: "Structural Concepts",
    description: "Load paths, spans and system choice — conceptually. Sizing always stays with your engineer.",
  },
  {
    icon: Leaf,
    title: "Passive Design",
    description: "Thermal comfort, daylighting, ventilation, embodied carbon and green certifications.",
  },
  {
    icon: BookOpen,
    title: "Codes & Standards",
    description: "Ghana LI 1630, IBC, Eurocodes — always named, region-flagged, never fabricated.",
  },
  {
    icon: ToyBrick,
    title: "Materials & Envelope",
    description: "Failure modes, detailing principles and material trade-offs, explained clearly.",
  },
  {
    icon: Briefcase,
    title: "Practice & Business",
    description: "Project phases, BIM, fees and client communication for working professionals.",
  },
];

const keywords = [
  "Massing", "Daylight", "Circulation", "Thermal Comfort", "Load Paths",
  "Envelope", "Passive Cooling", "Setbacks", "Embodied Carbon", "Proportion",
  "Egress", "Detailing", "Ventilation", "Site & Climate",
];

const steps = [
  {
    n: "01",
    title: "Ask",
    body: "A design problem, a code question, a material choice — anything in the built environment.",
  },
  {
    n: "02",
    title: "Reason",
    body: "Layered thinking: constraints → options → trade-offs → recommendation. Facts, rules of thumb and opinion, labelled.",
  },
  {
    n: "03",
    title: "Verify",
    body: "ArchMind informs your judgment. A licensed professional reviews, stamps, and takes responsibility.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ===================== HERO ===================== */}
      <section className="relative grain bg-ink text-paper overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark mask-fade" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/90" />

        {/* corner crop marks */}
        <span className="crop-mark border-l border-t left-5 top-20 text-paper" />
        <span className="crop-mark border-r border-t right-5 top-20 text-paper" />

        <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-24 md:pt-44 md:pb-32">
          {/* title block row */}
          <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.18em] uppercase text-paper/50 border-b border-white/10 pb-5 mb-14">
            <span className="animate-rise">ArchMind / v0.1</span>
            <span className="animate-rise hidden sm:block" style={{ animationDelay: "80ms" }}>
              Architectural Intelligence
            </span>
            <span className="animate-rise" style={{ animationDelay: "160ms" }}>
              Ghana · Global
            </span>
          </div>

          <p
            className="animate-rise font-mono text-[12px] tracking-[0.25em] uppercase text-clay mb-7"
            style={{ animationDelay: "120ms" }}
          >
            The thinking partner for the built environment
          </p>

          <h1
            className="animate-rise font-display text-[clamp(2.75rem,8vw,7rem)] leading-[0.92] tracking-tight text-balance max-w-5xl"
            style={{ animationDelay: "200ms" }}
          >
            Reason about
            <br />
            architecture with{" "}
            <em className="italic text-clay">rigour</em>.
          </h1>

          <p
            className="animate-rise mt-8 text-lg md:text-xl text-paper/65 max-w-xl leading-relaxed"
            style={{ animationDelay: "320ms" }}
          >
            ArchMind helps architects, students and builders work through design decisions —
            with technical depth, domain fluency, and clear safety limits.
          </p>

          <div
            className="animate-rise mt-11 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "440ms" }}
          >
            <Link
              href="/chat"
              className="group inline-flex items-center gap-2 rounded-full bg-clay text-clay-foreground px-7 py-3.5 text-sm font-medium hover:brightness-110 transition"
            >
              Start a conversation
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium hover:bg-white/5 transition"
            >
              Explore use cases
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* stat strip */}
          <div
            className="animate-rise mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden"
            style={{ animationDelay: "560ms" }}
          >
            {[
              ["Ghana-aware", "LI 1630 · GS 1207"],
              ["Safety-first", "Hard boundaries"],
              ["Multi-jurisdiction", "IBC · Eurocodes"],
              ["OpenRouter", "Powered"],
            ].map(([k, v]) => (
              <div key={k} className="bg-ink px-5 py-5">
                <p className="font-display text-lg">{k}</p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-paper/45 mt-1">
                  {v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== KEYWORD MARQUEE ===================== */}
      <div className="bg-clay text-clay-foreground py-3.5 overflow-hidden border-y border-clay">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {keywords.map((k) => (
                <span key={`${dup}-${k}`} className="flex items-center font-mono text-xs tracking-[0.2em] uppercase">
                  <span className="px-6">{k}</span>
                  <span className="opacity-50">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ===================== CAPABILITIES ===================== */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-clay mb-4">
                01 — Capabilities
              </p>
              <h2 className="font-display text-4xl md:text-5xl tracking-tight max-w-xl text-balance">
                Breadth across the whole of practice
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm md:text-right leading-relaxed">
              From the first site sketch to the business of running a studio — domain knowledge,
              applied with care.
            </p>
          </Reveal>

          {/* technical bordered grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-border">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80}>
                <article className="group relative h-full border-r border-b border-border p-8 hover:bg-muted/50 transition-colors">
                  <span className="font-mono text-[11px] text-muted-foreground/60 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-6 mb-5 flex items-center justify-center w-11 h-11 rounded-lg bg-ink text-paper group-hover:bg-clay group-hover:text-clay-foreground transition-colors">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl mb-2.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-clay transition-all duration-500 group-hover:w-full" />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== METHOD ===================== */}
      <section className="bg-muted/40 border-y border-border py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-20">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-clay mb-4">
              02 — Method
            </p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight text-balance">
              A partner, not a replacement
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="relative">
                  <div className="flex items-center gap-5 mb-6">
                    <span className="font-display text-6xl text-clay/30 leading-none">{s.n}</span>
                    {i < steps.length - 1 && (
                      <span className="hidden md:block flex-1 h-px bg-border" />
                    )}
                  </div>
                  <h3 className="font-display text-2xl mb-3">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== SAFETY BAND ===================== */}
      <section className="relative grain bg-ink text-paper overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-dark opacity-50 mask-fade" />
        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-clay mb-5">
              03 — Safety
            </p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.02] mb-6 text-balance">
              Built to know its limits
            </h2>
            <p className="text-paper/65 text-lg leading-relaxed max-w-lg">
              ArchMind will never give you final structural sizing, code-compliance sign-off, or
              life-safety determinations. For those, it redirects you to a licensed professional —
              every time, without exception.
            </p>
            <Link
              href="/about"
              className="group mt-9 inline-flex items-center gap-2 text-sm font-medium text-clay hover:text-paper transition-colors"
            >
              Read the safety principles
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-white/12 rounded-2xl divide-y divide-white/10">
              {[
                "No fabricated code numbers",
                "No structural sizing for construction",
                "No code-compliance sign-off",
                "Always region-flagged guidance",
              ].map((item) => (
                <div key={item} className="flex items-center gap-4 px-6 py-5">
                  <ShieldCheck className="w-5 h-5 text-clay shrink-0" />
                  <span className="text-paper/85">{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="py-28 md:py-36">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-clay mb-6">
              Ready when you are
            </p>
            <h2 className="font-display text-5xl md:text-6xl tracking-tight leading-[0.98] text-balance mb-8">
              Think through your next
              <br />
              design problem.
            </h2>
            <p className="text-muted-foreground text-lg mb-11">
              Free to use. No sign-up required.
            </p>
            <Link
              href="/chat"
              className={cn(
                "group inline-flex items-center gap-2 rounded-full bg-ink text-paper px-8 py-4 text-sm font-medium",
                "hover:bg-clay hover:text-clay-foreground transition-colors"
              )}
            >
              Open ArchMind
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
