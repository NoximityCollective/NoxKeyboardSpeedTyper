"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SENTENCES: string[] = [
  "The quick brown fox jumps over the lazy dog.",
  "Coding is like a puzzle you solve one step at a time.",
  "Type the words carefully and keep a steady pace.",
  "Small habits every day make big progress over time.",
  "The sun peeks through the clouds after the rain.",
  "Practice makes progress, not perfect, and that is okay.",
  "Read the line, breathe, and let your fingers fly.",
  "Cats nap in warm spots, while dogs wag and play.",
  "A bright idea can light up a whole room.",
  "Sand castles fade but the fun stays in your heart.",
  "Robots follow rules; people can imagine new ones.",
  "Today is a great day to learn something new.",
  "Mountains are tall, but steps are small and brave.",
  "The keyboard sings when you find your rhythm.",
  "Smiles grow when we share kind words and time.",
  "A calm mind helps fast hands stay accurate.",
  "Stars glow quietly while the moon keeps watch.",
  "We count our wins and learn from our misses.",
  "Green trees sway softly in the cool wind.",
  "Good stories start with a single sentence.",
  "Try not to rush; smooth is fast in the end.",
  "Cookies bake, tea steams, and friends chat nearby.",
  "Little sparks of focus grow into bright beams.",
  "A playful tune can turn practice into fun.",
  "Waves roll in, waves roll out, and time flows.",
  "Maps help, but courage takes the next step.",
  "Clear goals make the path easier to see.",
  "Reading sharpens the mind like a pencil.",
  "Keep your shoulders relaxed and hands light.",
  "Numbers count, letters spell, and ideas connect.",
  "Rain taps the window while we type inside.",
  "Learning is a gift you give your future self.",
  "Balloons float up, and worries drift away.",
  "Every key press is a tiny promise kept.",
  "We cheer for effort, not just the score.",
  "A gentle pace keeps mistakes from piling up.",
  "Your best today helps your best tomorrow.",
  "When in doubt, slow down and refocus.",
  "A tidy desk can calm a busy mind.",
  "Practice today, surprise yourself next week.",
  "The moon paints silver paths across the sea.",
  "Fresh snow turns the world quiet and bright.",
  "A friendly hello can change someone’s day.",
  "Teamwork makes tough tasks feel lighter.",
  "Brave doesn’t mean loud; it means you try.",
  "Paper planes glide and loop in the air.",
  "The library smells like stories and sunshine.",
  "Pencils scratch, ideas hatch, and notes grow.",
  "The city hums while birds sing above it.",
  "Kind words echo longer than we think.",
  "A new skill feels hard until it doesn’t.",
  "Starlight is old light finally saying hello.",
  "We build confidence by keeping small promises.",
  "Practice is patience wearing running shoes.",
  "Questions open doors that fear keeps shut.",
  "Warm cocoa and good books pair well.",
  "The path is made by walking it.",
  "Notes on a staff become a melody.",
  "Raindrops drum lightly on the roof tonight.",
  "The first step is often the hardest.",
  "We learn fast by staying curious.",
  "Even tiny lanterns can guide the way.",
  "A gentle reminder is better than a shout.",
  "Keep going; steady beats speedy when it counts.",
  "Cooking is chemistry that you can taste.",
  "A map helps, but asking helps more.",
  "Make room for new ideas to land.",
  "The river keeps moving, and so do we.",
  "Honest work makes quiet pride.",
  "Practice until your hands remember for you.",
  "Make the next minute your best minute.",
  "Write it down so your brain can rest.",
  "A kind friend is better than a perfect plan.",
  "Even tall trees began as tiny seeds.",
  "Breathe in calm, breathe out hurry.",
  "Laugh, learn, and try again tomorrow.",
  "Routines make hard things feel easier.",
  "Courage grows when we use it.",
  "Neat code is kind to future you.",
  "Tidy thoughts help tidy actions.",
  "Storms pass; clear skies follow.",
  "Silence helps ideas speak up.",
  "We measure progress, not perfection.",
  "Share your tools, grow your team.",
  "The right pace is your pace.",
  "Practice the small things to master the big.",
  "Bright screens rest easier with dark themes.",
  "Finish strong and celebrate the effort.",
  "Grit is talent that never gave up.",
  "Try it, tweak it, try again.",
  "Clean inputs make clean results.",
  "Good sleep is a secret power up.",
  "Speak kindly to yourself while you learn.",
  "Hard work glows brighter than luck.",
  "Close unused tabs in your mind.",
  "You can always improve one small thing.",
  "We grow faster when we help others.",
  "Notes today save time tomorrow.",
  "A checklist keeps chaos calm.",
  "Short breaks keep focus fresh.",
  "We can do hard things together.",
  "Slow is smooth and smooth is fast.",
  "Great journeys begin with tiny steps.",
  "Kindness is the best kind of clever.",
  "Stretch your fingers; relax your shoulders.",
  "The cursor blinks like a patient heartbeat.",
  "Good habits are the best shortcuts.",
  "Aim for better, not for perfect.",
  "A neat stack of wins builds confidence.",
  "Keep learning; curiosity fuels progress.",
];

function generateTextForDuration(duration: 15 | 30 | 60): string {
  // Aim for roughly 2/4/7 sentences based on duration
  const targetSentences = duration === 15 ? 2 : duration === 30 ? 4 : 7;
  const picks: string[] = [];
  const used = new Set<number>();
  while (picks.length < targetSentences) {
    const idx = Math.floor(Math.random() * SENTENCES.length);
    if (used.has(idx)) continue;
    used.add(idx);
    picks.push(SENTENCES[idx]);
  }
  return picks.join(" ");
}

export default function Home() {
  const [duration, setDuration] = useState<15 | 30 | 60>(60);
  // Generate words on the client after mount to avoid hydration mismatch
  const [sample, setSample] = useState("");
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(duration);
  const [finished, setFinished] = useState(false);
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState<
    { username: string; wpm: number; accuracy?: number; duration?: number }[]
  >([]);
  const [dbSource, setDbSource] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = inputRef.current;
    el?.focus();
    // defer random text generation to client
    setSample(generateTextForDuration(60));
  }, []);

  // Dark theme is forced via <html className="dark"> in layout

  // metrics
  const correctChars = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === sample[i]) c++;
    return c;
  }, [typed, sample]);

  const accuracy = useMemo(() => {
    if (typed.length === 0) return 100;
    return Math.round((correctChars / typed.length) * 100);
  }, [correctChars, typed.length]);

  const elapsedMs = useMemo(
    () => (started ? Date.now() - started : 0),
    [started],
  );
  const elapsed = useMemo(
    () => (started ? Math.min(duration, Math.floor(elapsedMs / 1000)) : 0),
    [started, elapsedMs, duration],
  );
  const wpm = useMemo(() => {
    const minutes = finished
      ? duration / 60
      : Math.max(3 / 60, elapsedMs / 60000); // use >=3s window to prevent huge spikes
    const raw = correctChars / 5 / (minutes || 1 / 60);
    return Math.min(300, Math.max(0, Math.round(raw))); // cap display at 300 wpm
  }, [correctChars, elapsedMs, duration, finished]);

  // timer
  useEffect(() => {
    let t: any;
    if (started && !finished) {
      t = setInterval(() => {
        const s = duration - Math.floor((Date.now() - started) / 1000);
        setSecondsLeft(Math.max(0, s));
        if (s <= 0) {
          setFinished(true);
          setSecondsLeft(0);
        }
      }, 100);
    }
    return () => clearInterval(t);
  }, [started, finished, duration]);

  const onKey = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (finished) return;
      if (!started) setStarted(Date.now());
      setTyped(e.target.value);
    },
    [finished, started],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Prevent Ctrl+V, Cmd+V, and other paste shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === "v") {
      e.preventDefault();
    }
  }, []);

  const setLen = useCallback((len: 15 | 30 | 60) => {
    setDuration(len);
    setSecondsLeft(len);
    setSample(generateTextForDuration(len));
    setTyped("");
    setStarted(null);
    setFinished(false);
    inputRef.current?.focus();
  }, []);

  const restart = useCallback(() => {
    setSample(generateTextForDuration(duration));
    setTyped("");
    setStarted(null);
    setFinished(false);
    setSecondsLeft(duration);
    setUsername("");
    inputRef.current?.focus();
  }, [duration]);

  const loadScores = useCallback(async () => {
    try {
      const res = await fetch(`/api/scores?duration=${duration}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setScores(data.scores ?? []);
      if (data.source) setDbSource(data.source);
    } catch {}
  }, [duration]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  const saveScore = useCallback(async () => {
    if (!finished || !username.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          wpm: Math.min(wpm, 400),
          accuracy,
          duration,
        }),
      });
      await loadScores();
    } finally {
      setSaving(false);
    }
  }, [finished, username, wpm, loadScores]);

  // render helpers
  const caretIndex = typed.length;
  const chars = sample.split("");
  const typedChars = chars.slice(0, caretIndex);
  const restChars = chars.slice(caretIndex);

  return (
    <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
        <div className="p-6 sm:p-8">
          <header className="flex items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Nox Keyboard SpeedTyper
            </h1>
            <div className="flex items-center gap-2 text-sm">
              {[15, 30, 60].map((n) => (
                <button
                  key={n}
                  onClick={() => setLen(n as 15 | 30 | 60)}
                  className={`px-3 py-2 rounded-full border border-white/10 font-medium ${
                    duration === n
                      ? "bg-blue-600 text-white border-blue-600"
                      : "hover:bg-white/10"
                  }`}
                  aria-pressed={duration === n}
                >
                  {n}s
                </button>
              ))}
              {isClient &&
                (window.location.hostname === "localhost" ||
                  window.location.hostname === "127.0.0.1") && (
                  <span
                    className={`ml-2 px-2 py-1 rounded-full border text-xs ${dbSource?.startsWith("db") ? "border-emerald-500 text-emerald-300" : "border-orange-500 text-orange-300"}`}
                  >
                    {dbSource?.startsWith("db") ? "DB: online" : "DB: memory"}
                  </span>
                )}
            </div>
          </header>

          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/5">
              Time
              <div className="font-mono text-lg text-blue-300">
                {secondsLeft}s
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-right">
              WPM
              <div className="font-mono text-lg text-emerald-300">{wpm}</div>
            </div>
            <div className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-right">
              Accuracy
              <div className="font-mono text-lg text-blue-300">{accuracy}%</div>
            </div>
          </div>

          <section
            ref={containerRef}
            onClick={() => inputRef.current?.focus()}
            className="rounded-2xl border border-white/10 p-6 bg-black/30 cursor-text"
          >
            <p className="text-sm text-foreground/70 mb-3">
              Click here and start typing. Keep a steady rhythm. ✨
            </p>
            <div className="relative font-mono leading-9 text-[18px] sm:text-xl select-none break-words whitespace-pre-wrap">
              {sample ? (
                <>
                  {typedChars.map((ch, i) => {
                    const t = typed[i];
                    const cls =
                      t === ch ? "text-emerald-400" : "text-orange-400";
                    return (
                      <span key={i} className={cls}>
                        {t}
                      </span>
                    );
                  })}
                  {!finished && (
                    <span className="inline-block w-[3px] h-[1.2em] -mb-[0.1em] align-[-0.2em] bg-cyan-400 animate-pulse mx-[1px] rounded" />
                  )}
                  {restChars.map((ch, i) => (
                    <span key={`r${i}`} className="text-foreground/40">
                      {ch}
                    </span>
                  ))}
                </>
              ) : (
                <span className="text-foreground/60">Loading words…</span>
              )}
            </div>

            {/* hidden input to capture keystrokes */}
            <input
              ref={inputRef}
              value={typed}
              onChange={onKey}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              disabled={finished}
              className="opacity-0 pointer-events-none w-px h-px"
              aria-hidden
            />
          </section>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {!started && (
              <button
                onClick={() => {
                  inputRef.current?.focus();
                  if (!started) setStarted(Date.now());
                }}
                className="px-5 py-3 rounded-2xl border border-white/10 bg-blue-600 text-white font-semibold hover:bg-blue-500"
              >
                Start ▶
              </button>
            )}
            <button
              onClick={restart}
              className="px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/10 font-semibold"
            >
              Restart
            </button>
            {finished && (
              <div className="flex items-center gap-2">
                <span className="text-base">
                  Nice job! 🎈 <span className="font-mono">{wpm} wpm</span> •{" "}
                  <span className="font-mono">{accuracy}%</span>
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your name"
                  className="px-3 py-3 rounded-xl border border-white/10 bg-white/10"
                  maxLength={24}
                />
                <button
                  onClick={saveScore}
                  disabled={saving || !username.trim()}
                  className="px-5 py-3 rounded-2xl border border-white/10 bg-emerald-600 text-white font-semibold disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save My Score"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="font-semibold mb-2">Leaderboard ({duration}s) 🏆</h2>
            <ol className="text-base divide-y rounded-xl border border-white/10">
              {scores.slice(0, 10).map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="font-mono opacity-70">#{i + 1}</span>
                  <span className="truncate mx-3">{s.username}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">{s.wpm} wpm</span>
                    <span className="font-mono text-blue-300">
                      {s.accuracy || 100}%
                    </span>
                  </div>
                </li>
              ))}
              {scores.length === 0 && (
                <li className="px-4 py-3 text-foreground/70">
                  No scores yet. Be the first! ✨
                </li>
              )}
            </ol>
          </div>

          <footer className="mt-8 text-sm text-foreground/70 flex items-center justify-between">
            <span>
              Made by <strong>Noximity</strong> • Fully open-source
            </span>
            <a
              href="https://ko-fi.com/noximitycollective"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full border border-white/10 bg-pink-600 text-white font-medium hover:bg-pink-500"
            >
              Support us on Ko‑fi
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
