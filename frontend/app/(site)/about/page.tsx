import Link from "next/link";
import Reveal from "@/components/reveal";
import { Check, X, Globe, ShieldCheck, Scale, Handshake, ArrowUpRight } from "lucide-react";

const capabilities = [
  "Spatial planning — massing, circulation, daylight, proportion, acoustics",
  "Structural concepts — load paths, spans, system choice (conceptual only)",
  "Building envelope — materials, failure modes, detailing principles",
  "Passive design — thermal comfort, daylighting, ventilation, carbon",
  "Certification systems — LEED, BREEAM, EDGE, Passive House",
  "Architectural history, theory, precedents and critique",
  "Practice — project phases, BIM, fees, client communication",
  "Codes & standards — explained conceptually, always region-flagged",
];

const limits = [
  "Final structural member sizing, foundation design, or reinforcement",
  "Life-safety sign-off: fire ratings, egress capacity, occupancy limits",
  "Code-compliance confirmation — whether something is actually to code",
  "Anything where being wrong could cause structural failure or injury",
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Safety first",
    body: "When usefulness and safety conflict, safety wins — every time. Hard limits hold regardless of how a question is framed.",
  },
  {
    icon: Scale,
    title: "Accuracy over fluency",
    body: "A confident wrong answer is worse than an honest admission of uncertainty. Facts, rules of thumb and opinion are labelled, and ArchMind hedges when unsure.",
  },
  {
    icon: Handshake,
    title: "Inform, never replace",
    body: "ArchMind is a thinking partner and reference. Licensed architects and engineers review, stamp, and bear responsibility for construction documents.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero header */}
      <section className="relative grain bg-ink text-paper overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark mask-fade" />
        <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-24 md:pt-44 md:pb-28">
          <p className="animate-rise font-mono text-[11px] tracking-[0.22em] uppercase text-clay mb-6">
            About
          </p>
          <h1
            className="animate-rise font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight max-w-4xl text-balance"
            style={{ animationDelay: "120ms" }}
          >
            Architectural intelligence, with clear limits.
          </h1>
          <p
            className="animate-rise mt-8 text-lg md:text-xl text-paper/65 max-w-2xl leading-relaxed"
            style={{ animationDelay: "240ms" }}
          >
            ArchMind is an AI assistant purpose-built for architecture. It brings domain depth and
            technical rigour to design conversations — while being transparent about what it cannot,
            and will not, do.
          </p>
        </div>
      </section>

      {/* Can / cannot */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 lg:gap-24">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-clay mb-5">
              What it does
            </p>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-8">
              Broad, applied coverage
            </h2>
            <ul className="divide-y divide-border border-y border-border">
              {capabilities.map((c) => (
                <li key={c} className="flex gap-4 py-4 text-sm">
                  <Check className="w-4 h-4 mt-0.5 text-clay shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground mb-5">
              What it won&apos;t do
            </p>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-8">
              Where it draws the line
            </h2>
            <ul className="divide-y divide-border border-y border-border">
              {limits.map((l) => (
                <li key={l} className="flex gap-4 py-4 text-sm text-muted-foreground">
                  <X className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Ghana band */}
      <section className="bg-muted/40 border-y border-border py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="grid lg:grid-cols-[1fr_1.3fr] gap-12 items-start">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <Globe className="w-5 h-5 text-clay" />
                <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-clay">
                  Localisation
                </p>
              </div>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-tight">
                Ghana-aware
                <br />
                by default
              </h2>
            </div>
            <div className="flex flex-col gap-5 text-muted-foreground leading-relaxed md:text-lg">
              <p>
                ArchMind defaults to Ghana — applying the{" "}
                <strong className="text-foreground font-medium">
                  National Building Regulations LI 1630
                </strong>{" "}
                and{" "}
                <strong className="text-foreground font-medium">Ghana Building Code GS 1207</strong>,
                with a warm-humid tropical baseline for coastal regions and hot-dry for the north.
              </p>
              <p>
                It re-confirms your location before giving code, climate, or cost-specific answers,
                and switches context for any jurisdiction — IBC, Eurocodes, UK Approved Documents,
                Canada NBC, India NBC, Australia NCC, and more.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="mb-16">
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-clay mb-4">
              Principles
            </p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">
              Three commitments
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 border-t border-l border-border">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div className="h-full border-r border-b border-border p-8">
                  <span className="font-mono text-[11px] text-muted-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-6 mb-5 w-11 h-11 rounded-lg bg-ink text-paper flex items-center justify-center">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-xl mb-3">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink text-paper grain relative overflow-hidden py-24 md:py-28">
        <div className="absolute inset-0 bg-grid-dark opacity-40 mask-fade" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-8 text-balance">
            See how it handles real questions.
          </h2>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/chat"
              className="group inline-flex items-center gap-2 rounded-full bg-clay text-clay-foreground px-7 py-3.5 text-sm font-medium hover:brightness-110 transition"
            >
              Start a conversation
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium hover:bg-white/5 transition"
            >
              Browse use cases
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
