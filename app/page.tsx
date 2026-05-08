"use client";

import { useEffect, useMemo, useState } from "react";

const BIRTH = { year: 2003, month: 4, day: 8 } as const; // May = 4 (0-indexed)

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

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const copy = useMemo(() => {
    if (!now) return { title: "Nimra", subtitle: "8 May · since 2003" };
    const birthday = isBirthdayToday(now);
    const age = ageOnDate(now);
    return {
      title: birthday ? "Happy Birthday, Nimra" : "For Nimra",
      subtitle: birthday
        ? `Wishing you a beautiful day — ${age} wonderful years · 8 May 2003`
        : `With love on your journey — ${age} years young · born 8 May 2003`,
    };
  }, [now]);

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-[#faf6f3] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(251,113,133,0.35),transparent),radial-gradient(ellipse_80%_60%_at_100%_50%,rgba(167,139,250,0.2),transparent),radial-gradient(ellipse_70%_50%_at_0%_80%,rgba(253,224,71,0.18),transparent)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(190,24,93,0.35),transparent),radial-gradient(ellipse_80%_60%_at_100%_50%,rgba(109,40,217,0.22),transparent),radial-gradient(ellipse_70%_50%_at_0%_80%,rgba(202,138,4,0.12),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-900/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-violet-200/35 blur-3xl dark:bg-violet-900/25"
      />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-rose-700/90 dark:text-rose-300/90">
          8 May
        </p>
        <h1 className="max-w-2xl text-balance font-serif text-4xl font-medium leading-tight tracking-tight sm:text-5xl sm:leading-tight">
          {copy.title}
        </h1>
        <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
          {copy.subtitle}
        </p>
        <p className="mt-10 max-w-lg text-pretty text-sm leading-relaxed text-zinc-500 dark:text-zinc-500">
          Here&apos;s to laughter, calm mornings, and all the good things you
          bring into the world. May this year feel gentle, bright, and entirely
          yours.
        </p>

        <div
          aria-hidden
          className="mt-14 flex gap-3 text-rose-400/80 dark:text-rose-400/50"
        >
          <span className="inline-block animate-pulse text-2xl">✦</span>
          <span
            className="inline-block animate-pulse text-2xl"
            style={{ animationDelay: "0.2s" }}
          >
            ✦
          </span>
          <span
            className="inline-block animate-pulse text-2xl"
            style={{ animationDelay: "0.4s" }}
          >
            ✦
          </span>
        </div>
      </main>
    </div>
  );
}
