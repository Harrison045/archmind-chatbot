import Link from "next/link";
import Reveal from "@/components/reveal";
import { ArrowUpRight } from "lucide-react";

const useCases = [
  {
    category: "Site & Climate",
    title: "Orienting a residence on a coastal Accra plot",
    description:
      "Balancing solar gain, prevailing sea breezes, views and plot setbacks when siting a 3-bedroom house on Ghana's coast.",
    prompt: "How should I orient a 3-bedroom house on a coastal Accra plot?",
  },
  {
    category: "Sustainability",
    title: "Passive cooling strategies for hot-dry climates",
    description:
      "Courtyard plans, thermal mass, night-purge ventilation and roof treatments for buildings in northern Ghana.",
    prompt: "What are the key passive cooling strategies for hot-dry climates in northern Ghana?",
  },
  {
    category: "Structure",
    title: "Understanding load paths in an RC frame",
    description:
      "A conceptual walkthrough of how gravity and lateral loads travel from roof slab through beams, columns and foundations.",
    prompt: "Explain load paths in a simple reinforced concrete frame building",
  },
  {
    category: "Green Building",
    title: "Comparing LEED, BREEAM and EDGE",
    description:
      "Which certification fits a mid-rise mixed-use building in Accra — comparing cost, process and market recognition.",
    prompt: "Compare LEED, BREEAM, and EDGE certifications for a mixed-use building in Accra",
  },
  {
    category: "Spatial Planning",
    title: "Reviewing a floor plan for circulation",
    description:
      "Evaluating travel distances, public/private gradients, served vs servant spaces and egress in a residential plan.",
    prompt: "How do I evaluate a floor plan for circulation efficiency in a residential building?",
  },
  {
    category: "Codes",
    title: "Ghana LI 1630 setback requirements",
    description:
      "How setbacks work under Ghana's National Building Regulations — and what to confirm with the local AHJ.",
    prompt: "Explain how setback requirements work under Ghana's National Building Regulations LI 1630",
  },
  {
    category: "Materials",
    title: "Sandcrete vs burnt brick for a low-cost house",
    description:
      "A trade-off comparison for walling — thermal performance, cost, availability and durability in Ghana.",
    prompt: "Compare sandcrete blocks and burnt brick for walling a low-cost house in Ghana",
  },
  {
    category: "Practice",
    title: "Structuring architect's fees",
    description:
      "How fees are typically calculated — percentage of construction cost, fixed fee or hourly — and what to weigh.",
    prompt: "How should I structure my architect's fees for a residential project in Ghana?",
  },
];

export default function PortfolioPage() {
  return (
    <div>
      {/* Hero header */}
      <section className="relative grain bg-ink text-paper overflow-hidden">
        <div className="absolute inset-0 bg-grid-dark mask-fade" />
        <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-24 md:pt-44 md:pb-28">
          <p className="animate-rise font-mono text-[11px] tracking-[0.22em] uppercase text-clay mb-6">
            Use Cases
          </p>
          <h1
            className="animate-rise font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-tight max-w-4xl text-balance"
            style={{ animationDelay: "120ms" }}
          >
            What you can ask ArchMind.
          </h1>
          <p
            className="animate-rise mt-8 text-lg md:text-xl text-paper/65 max-w-2xl leading-relaxed"
            style={{ animationDelay: "240ms" }}
          >
            Real architectural questions it&apos;s built to handle — from site orientation to codes,
            materials to green certifications. Tap any to open it in the chat.
          </p>
        </div>
      </section>

      {/* Index grid */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border">
            {useCases.map((uc, i) => (
              <Reveal key={uc.title} delay={(i % 2) * 90}>
                <Link
                  href={`/chat?q=${encodeURIComponent(uc.prompt)}`}
                  className="group relative flex h-full flex-col border-r border-b border-border p-8 md:p-10 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-7">
                    <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-clay">
                      {uc.category}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground/50 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl md:text-[1.7rem] leading-snug tracking-tight mb-4">
                    {uc.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                    {uc.description}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 group-hover:text-clay transition-colors">
                    Try this
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-clay transition-all duration-500 group-hover:w-full" />
                </Link>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal className="text-center mt-20">
            <p className="text-muted-foreground mb-6">Have a different question?</p>
            <Link
              href="/chat"
              className="group inline-flex items-center gap-2 rounded-full bg-ink text-paper px-8 py-4 text-sm font-medium hover:bg-clay hover:text-clay-foreground transition-colors"
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
