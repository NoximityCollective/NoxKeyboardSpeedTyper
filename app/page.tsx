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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Comprehensive anti-paste protection state
  const [pasteAttempts, setPasteAttempts] = useState<number>(0);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [suspiciousActivity, setSuspiciousActivity] = useState<number>(0);
  const [lastInputTime, setLastInputTime] = useState<number>(0);
  const lastValidLength = useRef<number>(0);
  const blockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [devToolsDetected, setDevToolsDetected] = useState<boolean>(false);
  const keystrokeTimings = useRef<number[]>([]);
  const [automationDetected, setAutomationDetected] = useState<boolean>(false);

  useEffect(() => {
    const el = inputRef.current;
    el?.focus();
    // defer random text generation to client
    setSample(generateTextForDuration(60));

    // Developer tools detection
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        setDevToolsDetected(true);
        setSuspiciousActivity((prev) => prev + 1);
        console.warn("Developer tools detected - potential paste attempt");
      }
    };

    // Monitor console usage
    const originalLog = console.log;
    console.log = function (...args) {
      setSuspiciousActivity((prev) => prev + 1);
      originalLog.apply(console, args);
    };

    // Comprehensive anti-paste protection
    const preventContextMenu = (e: Event) => {
      if (e.target === el) {
        e.preventDefault();
        console.warn("Context menu blocked");
        setPasteAttempts((prev) => prev + 1);
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), 3000);
      }
    };

    const preventDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.warn("Drop event blocked");
      setPasteAttempts((prev) => prev + 1);
      setIsBlocked(true);
      setTimeout(() => setIsBlocked(false), 3000);
    };

    const preventDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const globalPasteHandler = (e: ClipboardEvent) => {
      if (
        document.activeElement === el ||
        (el && el.contains(document.activeElement))
      ) {
        e.preventDefault();
        e.stopPropagation();
        console.warn("Global paste event blocked");
        setPasteAttempts((prev) => prev + 1);
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), 3000);
      }
    };

    // Advanced detection methods
    const detectPasteFromValueChange = () => {
      if (el) {
        const originalDescriptor = Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        );
        Object.defineProperty(el, "value", {
          set: function (newValue) {
            if (newValue && newValue.length > this.value.length + 1) {
              console.warn("Direct value manipulation detected");
              setPasteAttempts((prev) => prev + 1);
              setIsBlocked(true);
              setTimeout(() => setIsBlocked(false), 3000);
              return;
            }
            originalDescriptor?.set?.call(this, newValue);
          },
          get: function () {
            return originalDescriptor?.get?.call(this);
          },
          configurable: true,
        });

        // Detect programmatic focus changes
        const originalFocus = el.focus;
        el.focus = function () {
          setSuspiciousActivity((prev) => prev + 1);
          console.warn("Programmatic focus detected");
          originalFocus.call(this);
        };

        // Monitor for clipboard API usage
        if (navigator.clipboard) {
          const originalReadText = navigator.clipboard.readText;
          navigator.clipboard.readText = function () {
            setSuspiciousActivity((prev) => prev + 1);
            console.warn("Clipboard API access detected");
            return originalReadText.call(this);
          };
        }
      }
    };

    // Add event listeners
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("drop", preventDrop);
    document.addEventListener("dragover", preventDragOver);
    document.addEventListener("paste", globalPasteHandler, true);
    window.addEventListener("resize", detectDevTools);

    // Set up advanced detection
    detectPasteFromValueChange();
    const devToolsInterval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("drop", preventDrop);
      document.removeEventListener("dragover", preventDragOver);
      document.removeEventListener("paste", globalPasteHandler, true);
      window.removeEventListener("resize", detectDevTools);
      clearInterval(devToolsInterval);
      console.log = originalLog;
    };
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
      if (finished || isBlocked) return;

      const newValue = e.target.value;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastInputTime;
      const lengthDiff = Math.abs(newValue.length - lastValidLength.current);

      // Record keystroke timing for pattern analysis
      if (lastInputTime > 0) {
        keystrokeTimings.current.push(timeDiff);
        // Keep only last 20 timings
        if (keystrokeTimings.current.length > 20) {
          keystrokeTimings.current.shift();
        }

        // Detect automation patterns (too consistent timing)
        if (keystrokeTimings.current.length >= 10) {
          const avgTiming =
            keystrokeTimings.current.reduce((a, b) => a + b) /
            keystrokeTimings.current.length;
          const variance =
            keystrokeTimings.current.reduce(
              (sum, time) => sum + Math.pow(time - avgTiming, 2),
              0,
            ) / keystrokeTimings.current.length;

          // Human typing has natural variance; bots are too consistent
          if (variance < 100 && avgTiming < 200) {
            setAutomationDetected(true);
            setSuspiciousActivity((prev) => prev + 1);
            console.warn("Automation detected - too consistent timing pattern");
          }
        }
      }

      // Detect potential paste by checking for large input changes in short time
      if (lengthDiff > 1 && timeDiff < 50) {
        console.warn("Paste attempt detected via input analysis");
        setPasteAttempts((prev) => prev + 1);
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), 3000);
        return;
      }

      // Validate that input is only growing by 1 character at a time (normal typing)
      if (newValue.length > typed.length + 1) {
        console.warn(
          "Invalid input change detected - too many characters added",
        );
        setPasteAttempts((prev) => prev + 1);
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), 3000);
        return;
      }

      // Validate timing between keystrokes (human typing patterns)
      if (timeDiff < 30 && newValue.length > typed.length) {
        console.warn("Typing too fast - possible automation");
        setSuspiciousActivity((prev) => prev + 1);
        return;
      }

      // Detect impossibly fast typing (superhuman speed)
      if (timeDiff < 20 && newValue.length > typed.length) {
        console.warn("Superhuman typing speed detected");
        setPasteAttempts((prev) => prev + 1);
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), 3000);
        return;
      }

      if (!started) setStarted(Date.now());
      setTyped(newValue);
      setLastInputTime(currentTime);
      lastValidLength.current = newValue.length;
    },
    [finished, started, typed, lastInputTime, isBlocked],
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.warn("Paste blocked via clipboard event");
    setPasteAttempts((prev) => prev + 1);
    setIsBlocked(true);
    setTimeout(() => setIsBlocked(false), 3000);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Comprehensive paste shortcut blocking
    const isPasteShortcut =
      ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") ||
      (e.shiftKey && e.key === "Insert") ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "v") ||
      (e.altKey && e.shiftKey && e.key === "Insert") ||
      ((e.ctrlKey || e.metaKey) && e.key === "y");

    if (isPasteShortcut) {
      e.preventDefault();
      e.stopPropagation();
      console.warn(
        "Paste shortcut blocked:",
        e.key,
        e.ctrlKey,
        e.metaKey,
        e.shiftKey,
      );
      setPasteAttempts((prev) => prev + 1);
      setIsBlocked(true);
      setTimeout(() => setIsBlocked(false), 3000);
    }

    // Track suspicious shortcuts
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === "a" || e.key === "x" || e.key === "c")
    ) {
      setSuspiciousActivity((prev) => prev + 1);
      console.log("Copy/cut/select-all detected");
    }
  }, []);

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const inputType = (e as any).inputType;

      // Detect insertFromPaste input type
      if (inputType === "insertFromPaste") {
        e.preventDefault();
        console.warn("Paste detected via input type");
        setPasteAttempts((prev) => prev + 1);
        setIsBlocked(true);
        setTimeout(() => setIsBlocked(false), 3000);
      }

      // Monitor for large value changes
      const target = e.target as HTMLInputElement;
      if (target.value.length > typed.length + 1) {
        console.warn("Suspicious input event detected");
        setPasteAttempts((prev) => prev + 1);
      }
    },
    [typed.length],
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.warn("Drop event blocked");
    setPasteAttempts((prev) => prev + 1);
    setIsBlocked(true);
    setTimeout(() => setIsBlocked(false), 3000);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (e.target === inputRef.current) {
      e.preventDefault();
      console.warn("Context menu blocked");
      setPasteAttempts((prev) => prev + 1);
    }
  }, []);

  const setLen = useCallback((len: 15 | 30 | 60) => {
    setDuration(len);
    setSecondsLeft(len);
    setSample(generateTextForDuration(len));
    setTyped("");
    setStarted(null);
    setFinished(false);
    setPasteAttempts(0);
    setIsBlocked(false);
    setSuspiciousActivity(0);
    setDevToolsDetected(false);
    setAutomationDetected(false);
    keystrokeTimings.current = [];
    lastValidLength.current = 0;
    inputRef.current?.focus();
  }, []);

  const restart = useCallback(() => {
    setSample(generateTextForDuration(duration));
    setTyped("");
    setStarted(null);
    setFinished(false);
    setSecondsLeft(duration);
    setUsername("");
    setPasteAttempts(0);
    setIsBlocked(false);
    setSuspiciousActivity(0);
    setDevToolsDetected(false);
    setAutomationDetected(false);
    keystrokeTimings.current = [];
    lastValidLength.current = 0;
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

  // render helpers - stable character rendering to prevent layout jumps
  const chars = sample.split("");
  const caretIndex = typed.length;

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
            <div
              className="relative font-mono leading-relaxed text-[18px] sm:text-xl select-none"
              style={{ letterSpacing: "0.05em" }}
            >
              {pasteAttempts > 0 && (
                <div className="absolute top-2 right-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse z-10">
                  ⚠️ Paste Blocked ({pasteAttempts})
                </div>
              )}
              {devToolsDetected && (
                <div className="absolute top-2 left-2 bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse z-10">
                  🔧 Dev Tools Detected
                </div>
              )}
              {automationDetected && (
                <div className="absolute top-12 left-2 bg-purple-500/90 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse z-10">
                  🤖 Bot Detected
                </div>
              )}
              {isBlocked && (
                <div className="absolute inset-0 bg-red-500/20 border border-red-500 rounded-3xl flex items-center justify-center z-20">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                    🚫 PASTE DETECTED - BLOCKED FOR 3 SECONDS
                  </span>
                </div>
              )}

              {sample ? (
                <div className="break-words whitespace-pre-wrap">
                  {chars.map((ch, i) => {
                    if (i < typed.length) {
                      // Character has been typed
                      const typedChar = typed[i];
                      const isCorrect = typedChar === ch;
                      return (
                        <span
                          key={`char-${i}`}
                          className={
                            isCorrect
                              ? "text-emerald-400"
                              : "text-orange-400 bg-red-500/20 rounded px-[1px]"
                          }
                          style={{ minWidth: "0.6em", display: "inline-block" }}
                        >
                          {typedChar}
                        </span>
                      );
                    } else if (i === typed.length && !finished && !isBlocked) {
                      // Current cursor position - character with cursor
                      return (
                        <span
                          key={`char-${i}`}
                          className="relative inline-block bg-cyan-400/20 rounded"
                          style={{ minWidth: "0.6em" }}
                        >
                          <span className="text-foreground/60">{ch}</span>
                          <span className="absolute inset-y-0 left-0 w-[3px] bg-cyan-400 animate-pulse rounded-full" />
                        </span>
                      );
                    } else {
                      // Untyped character
                      return (
                        <span
                          key={`char-${i}`}
                          className="text-foreground/40"
                          style={{ minWidth: "0.6em", display: "inline-block" }}
                        >
                          {ch}
                        </span>
                      );
                    }
                  })}
                </div>
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
              onInput={handleInput}
              onDrop={handleDrop}
              onContextMenu={handleContextMenu}
              onDragOver={(e) => e.preventDefault()}
              disabled={finished || isBlocked}
              className="opacity-0 pointer-events-none w-px h-px"
              aria-hidden
              autoComplete="off"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              data-lpignore="true"
              data-form-type="other"
              style={
                {
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                } as React.CSSProperties
              }
            />
          </section>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {!started && (
              <button
                onClick={() => {
                  inputRef.current?.focus();
                  if (!started) setStarted(Date.now());
                }}
                disabled={isBlocked}
                className="px-5 py-3 rounded-2xl border border-white/10 bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBlocked ? "Blocked" : "Start ▶"}
              </button>
            )}
            <button
              onClick={restart}
              disabled={isBlocked}
              className="px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/10 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBlocked ? "Blocked" : "Restart"}
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
