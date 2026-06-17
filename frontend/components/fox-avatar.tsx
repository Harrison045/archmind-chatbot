"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The ArchMind fox face. Static by default (cheap, used as the assistant avatar);
 * pass `lively` for a hero version that blinks and follows the cursor.
 */
export default function FoxAvatar({
  size = 34,
  lively = false,
  greet = false,
  className,
}: {
  size?: number;
  lively?: boolean;
  greet?: boolean;
  className?: string;
}) {
  const rawId = useId();
  const gid = `fav-${rawId.replace(/:/g, "")}`;

  const svgRef = useRef<SVGSVGElement>(null);
  const lPupil = useRef<SVGGElement>(null);
  const rPupil = useRef<SVGGElement>(null);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!lively) return;
    let alive = true;
    let blinkT: ReturnType<typeof setTimeout>;
    let blinkOff: ReturnType<typeof setTimeout>;
    const blinkLoop = () => {
      if (!alive) return;
      setBlink(true);
      blinkOff = setTimeout(() => setBlink(false), 420);
      blinkT = setTimeout(blinkLoop, 3200 + Math.random() * 3600);
    };
    blinkT = setTimeout(blinkLoop, 1800);

    let raf = 0;
    let px = 0;
    let py = 0;
    const apply = () => {
      raf = 0;
      const el = svgRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / 240));
      const ny = Math.max(-1, Math.min(1, (py - (r.top + r.height / 2)) / 240));
      const tf = `translate(${(nx * 3).toFixed(2)}px, ${(ny * 2.4).toFixed(2)}px)`;
      if (lPupil.current) lPupil.current.style.transform = tf;
      if (rPupil.current) rPupil.current.style.transform = tf;
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      alive = false;
      clearTimeout(blinkT);
      clearTimeout(blinkOff);
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [lively]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <radialGradient id={gid} cx="0.4" cy="0.32" r="0.85">
          <stop offset="0" stopColor="#f4a55c" />
          <stop offset="0.65" stopColor="#e88438" />
          <stop offset="1" stopColor="#d56e29" />
        </radialGradient>
      </defs>
      <g
        stroke="#5a3216"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={cn(greet && "fox-greet")}
      >
        {/* ears */}
        <path d="M20,40 C18,24 22,12 30,6 C32,4 36,5 36,9 C38,24 38,34 38,42 Z" fill={`url(#${gid})`} />
        <path d="M60,40 C62,24 58,12 50,6 C48,4 44,5 44,9 C42,24 42,34 42,42 Z" fill={`url(#${gid})`} />
        <path d="M27,33 C26,22 29,14 33,11 C34,21 35,29 35,37 Z" fill="#fbf4e8" stroke="none" />
        <path d="M53,33 C54,22 51,14 47,11 C46,21 45,29 45,37 Z" fill="#fbf4e8" stroke="none" />
        {/* head */}
        <path
          d="M40,18 C54,18 64,28 64,40 C64,54 54,62 40,62 C26,62 16,54 16,40 C16,28 26,18 40,18 Z"
          fill={`url(#${gid})`}
        />
        {/* muzzle */}
        <path
          d="M40,40 C49,40 54,47 54,53 C54,60 47,64 40,64 C33,64 26,60 26,53 C26,47 31,40 40,40 Z"
          fill="#fbf4e8"
        />
        {/* eyes (blink together) */}
        <g
          className={cn(blink && "anim-blink")}
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        >
          <g ref={lPupil} className="mascot-pupil">
            <ellipse cx="31" cy="42" rx="4.8" ry="5.6" fill="#3a2a24" stroke="none" />
            <circle cx="29.3" cy="39.8" r="1.7" fill="#fff" stroke="none" />
            <circle cx="32.6" cy="44" r="0.9" fill="#fff" stroke="none" />
          </g>
          <g ref={rPupil} className="mascot-pupil">
            <ellipse cx="49" cy="42" rx="4.8" ry="5.6" fill="#3a2a24" stroke="none" />
            <circle cx="47.3" cy="39.8" r="1.7" fill="#fff" stroke="none" />
            <circle cx="50.6" cy="44" r="0.9" fill="#fff" stroke="none" />
          </g>
        </g>
        {/* nose */}
        <path d="M37,50 Q40,48 43,50 Q44,54 40,57 Q36,54 37,50 Z" fill="#3a2a24" strokeWidth="2" />
      </g>
    </svg>
  );
}
