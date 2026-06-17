"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import MascotChat from "@/components/mascot-chat";

const HIDE_KEY = "archmind-mascot-hidden-until";
const HIDE_MS = 5 * 60 * 1000; // hide for 5 minutes, then come back

const TIPS = [
  "Stuck on a design problem? I've got you.",
  "Need a second opinion on that layout?",
  "Ask me about passive cooling — it's my thing.",
  "Codes got you puzzled? Let's talk it through.",
  "Tap me anytime. I'm friendlier than I look.",
];

type Behavior = "wave" | "shake" | "earflick" | "sniff" | "hop" | "tailwag" | null;
const IDLE_ACTIONS: Exclude<Behavior, null>[] = [
  "wave",
  "shake",
  "earflick",
  "sniff",
  "hop",
  "tailwag",
];

export default function Mascot() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(0);
  const [hopping, setHopping] = useState(false);
  const [behavior, setBehavior] = useState<Behavior>(null);
  const [blinking, setBlinking] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const foxBoxRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const lPupilRef = useRef<SVGGElement>(null);
  const rPupilRef = useRef<SVGGElement>(null);
  const lastMoveRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    const hiddenUntil = Number(localStorage.getItem(HIDE_KEY) || 0);
    const remaining = hiddenUntil - Date.now();

    if (remaining > 0) {
      // still in its 5-minute break — reveal when the timer is up
      setDismissed(true);
      hideTimerRef.current = setTimeout(() => {
        localStorage.removeItem(HIDE_KEY);
        setDismissed(false);
        setOpen(true);
      }, remaining);
    } else {
      localStorage.removeItem(HIDE_KEY);
      setDismissed(false);
      const t = setTimeout(() => setOpen(true), 2600);
      return () => clearTimeout(t);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Eyes + head follow the cursor
  useEffect(() => {
    if (!mounted || dismissed) return;
    let raf = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      const box = foxBoxRef.current;
      if (!box) return;
      const r = box.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.3;
      const nx = Math.max(-1, Math.min(1, (px - cx) / 280));
      const ny = Math.max(-1, Math.min(1, (py - cy) / 280));
      if (headRef.current) headRef.current.style.transform = `rotate(${(nx * 6).toFixed(2)}deg)`;
      const ptf = `translate(${(nx * 3.2).toFixed(2)}px, ${(ny * 2.6).toFixed(2)}px)`;
      if (lPupilRef.current) lPupilRef.current.style.transform = ptf;
      if (rPupilRef.current) rPupilRef.current.style.transform = ptf;
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      lastMoveRef.current = Date.now();
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mounted, dismissed]);

  // Blink on its own rhythm
  useEffect(() => {
    if (!mounted || dismissed) return;
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    let off: ReturnType<typeof setTimeout>;
    const loop = () => {
      if (!alive) return;
      setBlinking(true);
      off = setTimeout(() => setBlinking(false), 420);
      t = setTimeout(loop, 3500 + Math.random() * 3500);
    };
    t = setTimeout(loop, 2400);
    return () => {
      alive = false;
      clearTimeout(t);
      clearTimeout(off);
    };
  }, [mounted, dismissed]);

  // Spontaneous idle behaviours + glancing around
  useEffect(() => {
    if (!mounted || dismissed) return;
    let alive = true;
    let nextTimer: ReturnType<typeof setTimeout>;
    let clearTimer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!alive) return;
      const idle = Date.now() - lastMoveRef.current > 1400;
      if (idle && Math.random() < 0.4) {
        const ang = (Math.random() * 2 - 1) * 6;
        if (headRef.current) headRef.current.style.transform = `rotate(${ang.toFixed(1)}deg)`;
        const off = (Math.random() * 2 - 1) * 3;
        const ptf = `translate(${off.toFixed(1)}px, ${(Math.random() * 2).toFixed(1)}px)`;
        if (lPupilRef.current) lPupilRef.current.style.transform = ptf;
        if (rPupilRef.current) rPupilRef.current.style.transform = ptf;
      } else {
        const next = IDLE_ACTIONS[Math.floor(Math.random() * IDLE_ACTIONS.length)];
        setBehavior(next);
        clearTimer = setTimeout(() => setBehavior(null), 1300);
      }
      nextTimer = setTimeout(tick, 3000 + Math.random() * 3200);
    };

    const hello = setTimeout(() => {
      setBehavior("wave");
      clearTimer = setTimeout(() => setBehavior(null), 1300);
    }, 1300);
    nextTimer = setTimeout(tick, 4200);

    return () => {
      alive = false;
      clearTimeout(hello);
      clearTimeout(nextTimer);
      clearTimeout(clearTimer);
    };
  }, [mounted, dismissed]);

  const handlePoke = useCallback(() => {
    setHopping(true);
    setBehavior("tailwag");
    setOpen(false);
    setChatOpen((v) => !v);
    setTip((t) => (t + 1) % TIPS.length);
  }, []);

  function dismiss() {
    const until = Date.now() + HIDE_MS;
    localStorage.setItem(HIDE_KEY, String(until));
    setOpen(false);
    setDismissed(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      localStorage.removeItem(HIDE_KEY);
      setDismissed(false);
      setOpen(true);
    }, HIDE_MS);
  }

  if (!mounted || dismissed) return null;

  return (
    <div
      ref={rootRef}
      className="fixed bottom-5 right-4 sm:right-5 z-40 flex flex-col items-end gap-3 print:hidden"
    >
      {/* Chat popup */}
      <MascotChat open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Speech bubble */}
      {open && !chatOpen && (
        <div
          key={tip}
          className="animate-pop relative mr-2 max-w-[15rem] rounded-2xl rounded-br-sm border border-border bg-card px-4 py-3 shadow-xl"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-clay mb-1.5">
            Psst —
          </p>
          <p className="text-sm leading-snug text-foreground">{TIPS[tip]}</p>
          <button
            onClick={() => {
              setOpen(false);
              setChatOpen(true);
            }}
            className="group mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-clay hover:underline"
          >
            Ask ArchMind
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <span className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-border bg-card" />
        </div>
      )}

      <div ref={foxBoxRef} className="group relative">
        <button
          onClick={dismiss}
          aria-label="Hide for 5 minutes"
          title="Hide for 5 minutes"
          className="absolute -top-1 -left-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground opacity-0 shadow-sm transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <span className="mascot-twinkle pointer-events-none absolute -right-1 top-2 text-clay">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" />
          </svg>
        </span>

        <button
          onClick={handlePoke}
          aria-label="Poke the ArchMind mascot"
          className="block cursor-pointer transition-transform duration-300 hover:scale-[1.07] hover:-rotate-1 active:scale-95"
        >
          <FoxSVG
            headRef={headRef}
            lPupilRef={lPupilRef}
            rPupilRef={rPupilRef}
            hopping={hopping}
            behavior={behavior}
            blinking={blinking}
            onHopEnd={() => setHopping(false)}
          />
        </button>
      </div>
    </div>
  );
}

function FoxSVG({
  headRef,
  lPupilRef,
  rPupilRef,
  hopping,
  behavior,
  blinking,
  onHopEnd,
}: {
  headRef: React.Ref<SVGGElement>;
  lPupilRef: React.Ref<SVGGElement>;
  rPupilRef: React.Ref<SVGGElement>;
  hopping: boolean;
  behavior: Behavior;
  blinking: boolean;
  onHopEnd: () => void;
}) {
  return (
    <svg
      viewBox="0 0 220 300"
      className="h-32 w-auto drop-shadow-xl sm:h-40"
      role="img"
      aria-label="Cute fox mascot"
    >
      <defs>
        <linearGradient id="foxBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0974c" />
          <stop offset="1" stopColor="#d96f2a" />
        </linearGradient>
        <radialGradient id="foxHead" cx="0.4" cy="0.32" r="0.85">
          <stop offset="0" stopColor="#f4a55c" />
          <stop offset="0.65" stopColor="#e88438" />
          <stop offset="1" stopColor="#d56e29" />
        </radialGradient>
        <linearGradient id="foxCream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf4e8" />
          <stop offset="1" stopColor="#eaddc7" />
        </linearGradient>
        <radialGradient id="foxShadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.26" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* grounded contact shadow */}
      <ellipse cx="110" cy="293" rx="74" ry="13" fill="url(#foxShadow)" />

      <g
        className={hopping || behavior === "hop" ? "anim-hop" : undefined}
        onAnimationEnd={(e) => {
          if (e.animationName === "mascotHop") onHopEnd();
        }}
      >
        <g stroke="#5a3216" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          {/* planted feet */}
          <ellipse cx="95" cy="296" rx="16" ry="10" fill="url(#foxBody)" />
          <ellipse cx="129" cy="296" rx="16" ry="10" fill="url(#foxBody)" />
          <g stroke="#5a3216" strokeWidth="2" fill="none">
            <path d="M90,292 v7" />
            <path d="M99,292 v7" />
            <path d="M124,292 v7" />
            <path d="M133,292 v7" />
          </g>

          {/* bushy tail (behind body) */}
          <g className={behavior === "tailwag" ? "svg-part anim-tailwag" : "svg-part anim-tail-loop"}>
            <path
              d="M84,244 C58,238 36,250 28,272 C24,286 34,298 49,296 C40,284 47,266 65,258 C73,254 80,252 86,256 Z"
              fill="url(#foxBody)"
            />
            <path
              d="M49,296 C36,298 26,286 30,273 C34,282 41,288 51,287 C54,290 53,296 49,296 Z"
              fill="url(#foxCream)"
            />
          </g>

          {/* upper body: sway + breathing */}
          <g className="svg-part anim-sway">
            <g className="svg-part anim-breathe-loop">
              {/* body */}
              <path
                d="M84,210 C92,202 128,202 136,210 C150,220 150,252 146,272 C144,282 134,288 122,289 L98,289 C86,288 76,282 74,272 C70,252 70,220 84,210 Z"
                fill="url(#foxBody)"
              />
              {/* cream chest */}
              <path
                d="M110,214 C124,214 132,226 132,244 C132,266 122,280 110,282 C98,280 88,266 88,244 C88,226 96,214 110,214 Z"
                fill="url(#foxCream)"
                strokeWidth="0"
              />

              {/* left arm + paw */}
              <g className="svg-part anim-arm-l">
                <path
                  d="M86,214 C74,220 68,240 72,260 C74,267 84,268 89,262 C92,248 92,230 96,220 Z"
                  fill="url(#foxBody)"
                />
                <ellipse cx="80" cy="265" rx="11" ry="10" fill="url(#foxCream)" />
                <g stroke="#5a3216" strokeWidth="2" fill="none">
                  <path d="M80,259 v12" />
                  <path d="M74,261 l-1,10" />
                  <path d="M86,261 l1,10" />
                </g>
              </g>

              {/* right arm + paw (waves) */}
              <g className="svg-part anim-arm-r">
                <g className={cn("svg-part", behavior === "wave" && "anim-wave")}>
                  <path
                    d="M134,214 C146,220 152,240 148,260 C146,267 136,268 131,262 C128,248 128,230 124,220 Z"
                    fill="url(#foxBody)"
                  />
                  <ellipse cx="140" cy="265" rx="11" ry="10" fill="url(#foxCream)" />
                  <g stroke="#5a3216" strokeWidth="2" fill="none">
                    <path d="M140,259 v12" />
                    <path d="M134,261 l-1,10" />
                    <path d="M146,261 l1,10" />
                  </g>
                </g>
              </g>

              {/* ===== head ===== */}
              <g ref={headRef} className="mascot-look">
                <g className="svg-part anim-head">
                  <g className={cn("svg-part", behavior === "shake" && "anim-shake")}>
                    {/* ears (flick together) */}
                    <g className={cn("svg-part", behavior === "earflick" && "anim-earflick")}>
                      <path
                        d="M58,124 C55,96 60,58 71,30 C73,25 79,27 80,34 C85,72 86,100 86,122 Z"
                        fill="url(#foxBody)"
                      />
                      <path
                        d="M67,114 C66,92 69,62 74,42 C75,38 79,39 80,44 C83,68 82,96 80,114 Z"
                        fill="url(#foxCream)"
                        stroke="none"
                      />
                      <path
                        d="M162,124 C165,96 160,58 149,30 C147,25 141,27 140,34 C135,72 134,100 134,122 Z"
                        fill="url(#foxBody)"
                      />
                      <path
                        d="M153,114 C154,92 151,62 146,42 C145,38 141,39 140,44 C137,68 138,96 140,114 Z"
                        fill="url(#foxCream)"
                        stroke="none"
                      />
                    </g>

                    {/* head */}
                    <path
                      d="M110,100 C148,100 170,124 170,152 C170,186 144,206 110,206 C76,206 50,186 50,152 C50,124 72,100 110,100 Z"
                      fill="url(#foxHead)"
                    />
                    {/* cheek tufts */}
                    <path d="M56,172 L40,194 L66,187 Z" fill="url(#foxBody)" />
                    <path d="M164,172 L180,194 L154,187 Z" fill="url(#foxBody)" />
                    {/* top highlight */}
                    <ellipse cx="92" cy="124" rx="20" ry="12" fill="#ffffff" opacity="0.2" stroke="none" />

                    {/* cream muzzle */}
                    <path
                      d="M110,150 C133,150 146,166 146,183 C146,201 128,210 110,210 C92,210 74,201 74,183 C74,166 87,150 110,150 Z"
                      fill="url(#foxCream)"
                    />

                    {/* blush */}
                    <ellipse cx="74" cy="178" rx="9" ry="5" fill="#f0a39c" opacity="0.65" stroke="none" />
                    <ellipse cx="146" cy="178" rx="9" ry="5" fill="#f0a39c" opacity="0.65" stroke="none" />

                    {/* eyebrows */}
                    <g stroke="#5a3216" strokeWidth="3.5" fill="none" strokeLinecap="round">
                      <path d="M76,138 q12,-6 22,-1" />
                      <path d="M144,138 q-12,-6 -22,-1" />
                    </g>

                    {/* ===== eyes (blink together) ===== */}
                    <g className={cn("svg-part", blinking && "anim-blink")}>
                      {/* left eye */}
                      <ellipse cx="88" cy="158" rx="14" ry="16.5" fill="#ffffff" />
                      <g ref={lPupilRef} className="mascot-pupil">
                        <ellipse cx="88" cy="160" rx="11" ry="13" fill="#3a2a24" stroke="none" />
                        <circle cx="84" cy="154" r="4.2" fill="#ffffff" stroke="none" />
                        <circle cx="92" cy="164" r="2.1" fill="#ffffff" stroke="none" />
                      </g>
                      {/* right eye */}
                      <ellipse cx="132" cy="158" rx="14" ry="16.5" fill="#ffffff" />
                      <g ref={rPupilRef} className="mascot-pupil">
                        <ellipse cx="132" cy="160" rx="11" ry="13" fill="#3a2a24" stroke="none" />
                        <circle cx="128" cy="154" r="4.2" fill="#ffffff" stroke="none" />
                        <circle cx="136" cy="164" r="2.1" fill="#ffffff" stroke="none" />
                      </g>
                    </g>

                    {/* nose (sniffs) */}
                    <g className={cn("svg-part", behavior === "sniff" && "anim-sniff")}>
                      <path
                        d="M104,180 Q110,176 116,180 Q119,187 110,193 Q101,187 104,180 Z"
                        fill="#3a2a24"
                        strokeWidth="2.5"
                      />
                    </g>

                    {/* :3 mouth */}
                    <g stroke="#5a3216" strokeWidth="3" fill="none" strokeLinecap="round">
                      <path d="M110,193 v5" />
                      <path d="M110,198 q-8,8 -16,3" />
                      <path d="M110,198 q8,8 16,3" />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
