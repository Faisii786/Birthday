"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const BIRTH = { year: 2003, month: 4, day: 8 } as const;

function isBirthdayToday(d: Date) {
  return d.getMonth() === BIRTH.month && d.getDate() === BIRTH.day;
}

function ageOnDate(d: Date) {
  let age = d.getFullYear() - BIRTH.year;
  const hadBirthday =
    d.getMonth() > BIRTH.month ||
    (d.getMonth() === BIRTH.month && d.getDate() >= BIRTH.day);
  if (!hadBirthday) age -= 1;
  return age;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
};

const CONFETTI_COLORS = [
  "#f472b6",
  "#c084fc",
  "#fbbf24",
  "#fb7185",
  "#a78bfa",
  "#fcd34d",
  "#f9a8d4",
  "#34d399",
];

function ConfettiCanvas({
  burstKey,
  enabled,
}: {
  burstKey: number;
  enabled: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const lastSprinkleRef = useRef(0);
  const burstAtRef = useRef<(x: number, y: number, n: number) => void>(
    () => {},
  );

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = window.innerWidth;
    const h = window.innerHeight;
    sizeRef.current = { w, h, dpr };
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function burst(cx: number, cy: number, count: number) {
      const colors = CONFETTI_COLORS;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 9;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 5,
          w: 5 + Math.random() * 7,
          h: 3 + Math.random() * 5,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.35,
          color: colors[i % colors.length]!,
          life: 1,
        });
      }
    }

    burstAtRef.current = burst;
    resize();
    burst(sizeRef.current.w / 2, sizeRef.current.h * 0.32, 160);

    const tick = (t: number) => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      if (t - lastSprinkleRef.current > 3200 && particlesRef.current.length < 320) {
        lastSprinkleRef.current = t;
        burst(Math.random() * w, -16, 28);
      }

      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]!;
        p.vy += 0.14;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vx *= 0.998;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, p.life * 1.1);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.life -= 0.0018;
        if (p.y > h + 60 || p.life <= 0) parts.splice(i, 1);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", resize);
      vv.addEventListener("scroll", resize);
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      if (vv) {
        vv.removeEventListener("resize", resize);
        vv.removeEventListener("scroll", resize);
      }
      particlesRef.current = [];
    };
  }, [enabled, resize]);

  useEffect(() => {
    if (!enabled || burstKey === 0) return;
    const { w, h } = sizeRef.current;
    const cx = w > 0 ? w / 2 : window.innerWidth / 2;
    const cy = h > 0 ? h * 0.4 : window.innerHeight * 0.4;
    burstAtRef.current(cx, cy, 90);
  }, [burstKey, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[25]"
      aria-hidden
    />
  );
}

type Star = { left: number; top: number; size: number; delay: number; dur: number };

function StarField() {
  const [stars, setStars] = useState<Star[] | null>(null);

  useEffect(() => {
    const next: Star[] = Array.from({ length: 56 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2.2,
      delay: Math.random() * 4,
      dur: 2.2 + Math.random() * 2.8,
    }));
    setStars(next);
  }, []);

  if (!stars) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
      aria-hidden
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="star-twinkle absolute rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] dark:bg-rose-100 dark:shadow-[0_0_8px_rgba(251,113,133,0.7)]"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function splitTitle(title: string) {
  const marker = "Nimra";
  const idx = title.indexOf(marker);
  if (idx === -1) return { before: title, highlight: null as string | null, after: "" };
  return {
    before: title.slice(0, idx),
    highlight: marker,
    after: title.slice(idx + marker.length),
  };
}

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const [motionOk, setMotionOk] = useState(true);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionOk(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const copy = useMemo(() => {
    if (!now) return { title: "Nimra", subtitle: "A quiet wish for you." };
    const birthday = isBirthdayToday(now);
    const age = ageOnDate(now);
    return {
      title: birthday ? "Happy Birthday, Nimra" : "For Nimra, with care",
      subtitle: birthday
        ? `May your day feel unhurried and kind — ${age} gentle years, and counting.`
        : `Whenever you read this, I hope it finds you well — ${age} beautiful years of you.`,
    };
  }, [now]);

  const titleParts = useMemo(() => splitTitle(copy.title), [copy.title]);

  const yearsLine = now ? `${ageOnDate(now)} years` : "\u00A0";

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!motionOk) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x, y });
  }, [motionOk]);

  const onPointerLeave = useCallback(() => setParallax({ x: 0, y: 0 }), []);

  const triggerBurst = useCallback(() => {
    setBurstKey((k) => k + 1);
  }, []);

  return (
    <div
      className="relative flex min-h-dvh flex-1 flex-col overflow-x-clip overflow-y-auto bg-[#faf6f3] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <ConfettiCanvas burstKey={burstKey} enabled={motionOk} />
      <StarField />

      <div
        aria-hidden
        className="celebrate-aurora pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_130%_90%_at_50%_-25%,rgba(251,113,133,0.45),transparent_55%),radial-gradient(ellipse_90%_70%_at_110%_40%,rgba(167,139,250,0.28),transparent_50%),radial-gradient(ellipse_80%_60%_at_-10%_85%,rgba(253,224,71,0.22),transparent_50%)] dark:bg-[radial-gradient(ellipse_130%_90%_at_50%_-25%,rgba(190,24,93,0.4),transparent_55%),radial-gradient(ellipse_90%_70%_at_110%_40%,rgba(109,40,217,0.3),transparent_50%),radial-gradient(ellipse_80%_60%_at_-10%_85%,rgba(202,138,4,0.15),transparent_50%)]"
      />

      <div
        aria-hidden
        className="celebrate-float pointer-events-none absolute -left-32 top-16 z-[2] h-96 w-96 rounded-full bg-rose-300/45 blur-3xl dark:bg-rose-900/35"
        style={{
          transform: `translate(${parallax.x * 48}px, ${parallax.y * 40}px)`,
        }}
      />
      <div
        aria-hidden
        className="celebrate-float-delayed pointer-events-none absolute -right-24 bottom-10 z-[2] h-80 w-80 rounded-full bg-violet-300/40 blur-3xl dark:bg-violet-900/30"
        style={{
          transform: `translate(${parallax.x * -36}px, ${parallax.y * -32}px)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 z-[2] h-64 w-64 -translate-x-1/2 rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-500/10"
        style={{
          transform: `translate(calc(-50% + ${parallax.x * 20}px), ${parallax.y * 16}px)`,
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <main className="relative z-20 flex flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-8 sm:py-24 md:px-10 pb-[max(4rem,env(safe-area-inset-bottom,0px))] sm:pb-24">
        <p className="celebrate-rise mb-5 min-h-[1.25em] max-w-[min(100%,24rem)] text-xs font-semibold uppercase tracking-[0.22em] text-rose-700/95 dark:text-rose-300/95 sm:text-sm sm:tracking-[0.35em]">
          {yearsLine}
        </p>

        <h1
          className="celebrate-rise celebrate-rise-delay-1 max-w-[min(100%,42rem)] text-balance text-[clamp(1.65rem,5.5vw+0.6rem,3.65rem)] font-medium leading-[1.12] tracking-tight sm:leading-[1.1] md:text-6xl [font-family:var(--font-display-serif),serif]"
        >
          {titleParts.highlight ? (
            <>
              {titleParts.before}
              <span className="text-name-shimmer">{titleParts.highlight}</span>
              {titleParts.after}
            </>
          ) : (
            copy.title
          )}
        </h1>

        <p className="celebrate-rise celebrate-rise-delay-2 mt-6 w-full max-w-lg text-pretty text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:mt-8 sm:text-lg md:text-xl">
          {copy.subtitle}
        </p>

        <p className="celebrate-rise celebrate-rise-delay-3 mt-8 w-full max-w-md text-pretty text-sm leading-relaxed text-zinc-500 dark:text-zinc-500 sm:mt-10 sm:text-base">
          May the people around you show up softly, may ordinary moments feel a
          little sweeter, and may you notice how much warmth you carry. Wishing
          you peace that lingers, smiles that come easily, and a year ahead that
          feels like home.
        </p>

        <div className="celebrate-rise celebrate-rise-delay-4 mt-10 flex w-full max-w-sm flex-col items-stretch gap-4 sm:mt-12 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-6">
          <button
            type="button"
            onClick={triggerBurst}
            disabled={!motionOk}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-rose-300/90 bg-white/90 px-8 py-3.5 text-sm font-medium text-rose-950 shadow-[0_8px_30px_rgba(251,113,133,0.22)] backdrop-blur-md transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:border-rose-400 hover:bg-rose-50 hover:text-rose-950 hover:shadow-[0_12px_40px_rgba(244,114,182,0.28)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-rose-300/90 disabled:hover:bg-white/90 disabled:hover:shadow-[0_8px_30px_rgba(251,113,133,0.22)] sm:w-auto sm:min-w-[12rem] dark:border-rose-400/35 dark:bg-zinc-900/80 dark:text-rose-100 dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)] dark:hover:border-rose-300/55 dark:hover:bg-zinc-800/95 dark:hover:text-rose-50 dark:hover:shadow-[0_12px_40px_rgba(251,113,133,0.12)] dark:disabled:hover:border-rose-400/35 dark:disabled:hover:bg-zinc-900/80 dark:disabled:hover:shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
            aria-label="Sprinkle more confetti"
          >
            More magic ✨
          </button>
          {!motionOk ? (
            <span className="text-xs text-zinc-500">
              Animations toned down for reduced motion
            </span>
          ) : null}
        </div>

        <div
          aria-hidden
          className="celebrate-rise celebrate-rise-delay-4 mt-16 flex gap-4 text-2xl text-rose-400/90 dark:text-rose-400/60"
        >
          <span className="celebrate-float inline-block">🎂</span>
          <span
            className="celebrate-float inline-block"
            style={{ animationDelay: "0.15s" }}
          >
            ✨
          </span>
          <span
            className="celebrate-float inline-block"
            style={{ animationDelay: "0.3s" }}
          >
            🌸
          </span>
        </div>
      </main>
    </div>
  );
}
