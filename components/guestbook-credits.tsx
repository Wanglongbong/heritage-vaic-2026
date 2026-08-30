"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Language } from "@/lib/types";

type GuestbookEntry = {
  id: string;
  displayName: string;
  message: string;
  createdAt: string;
};

type GuestbookResponse = {
  configured: boolean;
  entries: GuestbookEntry[];
  nextCursor: string | null;
};

const copy = {
  vi: {
    kicker: "GÓC NHỎ · PHÒNG TRƯNG BÀY",
    cornerTitle: "Một lời nhắn ở lại",
    cornerBody: "Mở cuốn sổ, viết vài dòng rồi xem tên bạn xuất hiện trong đoạn phim kết.",
    openBook: "VIẾT LƯU BÚT",
    watch: "XEM CREDITS",
    title: "Viết tiếp một dòng ký ức",
    body: "Hành trình khép lại, nhưng lời nhắn của bạn có thể ở lại trong cuốn sổ chung của những người đã đi qua chuyến tàu này.",
    name: "Tên hiển thị",
    namePlaceholder: "Bạn muốn được nhớ đến như thế nào?",
    message: "Lời nhắn / feedback",
    messagePlaceholder: "Một chi tiết bạn yêu thích, một điều có thể làm tốt hơn…",
    publicNote: "Tên và lời nhắn sẽ xuất hiện công khai trong phần credits.",
    submit: "Gửi và xem credits",
    submitting: "Đang ghi vào sổ…",
    skip: "Chỉ xem credits",
    close: "Đóng sổ lưu bút",
    success: "Lời nhắn của bạn đã trở thành một phần của Phòng trưng bày ký ức.",
    unavailable: "Sổ lưu bút online chưa được kết nối. Bạn vẫn có thể xem credits.",
    genericError: "Chưa thể ghi lời nhắn. Hãy thử lại sau một chút.",
    newest: "VỪA GHI",
    pause: "Tạm dừng credits",
    resume: "Tiếp tục credits",
    back: "Quay lại sổ lưu bút",
    tree: "Đến Cây ký ức",
    soundtrack: "Nhạc ending",
    playMusic: "Phát nhạc ending",
    muteMusic: "Tắt nhạc ending",
    unmuteMusic: "Bật nhạc ending",
    creditsKicker: "NHỮNG NGƯỜI ĐÃ ĐỂ LẠI MỘT DÒNG KÝ ỨC",
    projectCredits: "CREDITS DỰ ÁN",
    projectItems: [
      ["Ý tưởng & phát triển", "Vu/Quan"],
      ["Thiết kế trải nghiệm", "Tàu Di Sản Việt Nam"],
      ["Nguồn tư liệu", "UNESCO Intangible Cultural Heritage"],
      ["Lời cảm ơn", "Tất cả những người đã bước lên chuyến tàu này"],
    ],
  },
  en: {
    kicker: "A QUIET CORNER · THE GALLERY",
    cornerTitle: "Leave a note behind",
    cornerBody: "Open the book, write a few words, then watch your name enter the final credits.",
    openBook: "SIGN THE GUESTBOOK",
    watch: "WATCH CREDITS",
    title: "Leave one more line of memory",
    body: "The journey is closing, but your note can remain in the shared book of everyone who travelled on this train.",
    name: "Display name",
    namePlaceholder: "How would you like to be remembered?",
    message: "Message / feedback",
    messagePlaceholder: "A detail you loved, or something that could be better…",
    publicNote: "Your name and message will appear publicly in the credits.",
    submit: "Sign and watch credits",
    submitting: "Writing in the book…",
    skip: "Just watch credits",
    close: "Close the guestbook",
    success: "Your note is now part of the Gallery of Living Memories.",
    unavailable: "The online guestbook is not connected yet. You can still watch the credits.",
    genericError: "Your note could not be saved. Please try again shortly.",
    newest: "JUST ADDED",
    pause: "Pause credits",
    resume: "Resume credits",
    back: "Return to the guestbook",
    tree: "Visit the Memory Tree",
    soundtrack: "Ending soundtrack",
    playMusic: "Play ending music",
    muteMusic: "Mute ending music",
    unmuteMusic: "Unmute ending music",
    creditsKicker: "THE PEOPLE WHO LEFT A LINE OF MEMORY",
    projectCredits: "PROJECT CREDITS",
    projectItems: [
      ["Concept & development", "Vu/Quan"],
      ["Experience design", "Vietnam Heritage Train"],
      ["Research sources", "UNESCO Intangible Cultural Heritage"],
      ["With thanks to", "Everyone who stepped aboard this train"],
    ],
  },
} as const;

const GOLDEN_TRACK = "/media/golden-embers.mp3";
const DAVID_TRACK = "/media/david-instrumental-slowed.mp3";

function smoothVolume(audio: HTMLAudioElement, target: number, duration = 800) {
  const initial = audio.volume;
  const started = performance.now();
  let frame = 0;
  const step = (now: number) => {
    const progress = Math.min(1, (now - started) / duration);
    audio.volume = initial + (target - initial) * progress;
    if (progress < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

function trapFocus(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;
  const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )];
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function GuestbookCredits({
  language,
  muted,
  onToggleMuted,
}: {
  language: Language;
  muted: boolean;
  onToggleMuted: () => void;
}) {
  const ui = copy[language];
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [configured, setConfigured] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [newEntryId, setNewEntryId] = useState<string | null>(null);
  const [guestbookOpen, setGuestbookOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const goldenRef = useRef<HTMLAudioElement | null>(null);
  const davidRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<"golden" | "david">("golden");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const deskButtonRef = useRef<HTMLButtonElement | null>(null);
  const creditsCloseRef = useRef<HTMLButtonElement | null>(null);
  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const fadeCleanupRef = useRef<(() => void)[]>([]);

  const loadMore = useCallback(async (reset = false) => {
    if (loadingRef.current || (!reset && !hasMoreRef.current)) return;
    loadingRef.current = true;
    try {
      const cursor = reset ? null : cursorRef.current;
      const response = await fetch(`/api/guestbook?limit=50${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`, { cache: "no-store" });
      if (!response.ok) throw new Error("guestbook request failed");
      const payload = await response.json() as GuestbookResponse;
      setConfigured(payload.configured);
      setEntries((current) => {
        const combined = reset ? payload.entries : [...current, ...payload.entries];
        return [...new Map(combined.map((entry) => [entry.id, entry])).values()];
      });
      cursorRef.current = payload.nextCursor;
      hasMoreRef.current = Boolean(payload.nextCursor);
    } catch {
      if (reset) setConfigured(false);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => { void loadMore(true); }, [loadMore]);

  useEffect(() => {
    const golden = new Audio(GOLDEN_TRACK);
    const david = new Audio(DAVID_TRACK);
    golden.loop = true;
    david.loop = true;
    golden.preload = "auto";
    david.preload = "auto";
    golden.volume = 0.58;
    david.volume = 0;
    golden.muted = muted;
    david.muted = muted;
    goldenRef.current = golden;
    davidRef.current = david;
    void golden.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
    const onVisibility = () => {
      const active = trackRef.current === "david" ? david : golden;
      if (document.hidden) active.pause();
      else void active.play().catch(() => setAudioBlocked(true));
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      fadeCleanupRef.current.forEach((cleanup) => cleanup());
      golden.pause();
      david.pause();
      golden.src = "";
      david.src = "";
      goldenRef.current = null;
      davidRef.current = null;
    };
  // The ending owns one pair of audio elements for its full mounted lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (goldenRef.current) goldenRef.current.muted = muted;
    if (davidRef.current) davidRef.current.muted = muted;
  }, [muted]);

  const clearFades = useCallback(() => {
    fadeCleanupRef.current.forEach((cleanup) => cleanup());
    fadeCleanupRef.current = [];
  }, []);

  const switchToDavid = useCallback(() => {
    trackRef.current = "david";
    const golden = goldenRef.current;
    const david = davidRef.current;
    if (!golden || !david) return;
    clearFades();
    david.currentTime = 0;
    david.volume = 0;
    david.muted = muted;
    void david.play().then(() => {
      setAudioBlocked(false);
      fadeCleanupRef.current = [smoothVolume(golden, 0), smoothVolume(david, 0.68)];
      window.setTimeout(() => {
        if (trackRef.current === "david") golden.pause();
      }, 850);
    }).catch(() => setAudioBlocked(true));
  }, [clearFades, muted]);

  const switchToGolden = useCallback(() => {
    trackRef.current = "golden";
    const golden = goldenRef.current;
    const david = davidRef.current;
    if (!golden || !david) return;
    clearFades();
    golden.volume = 0;
    golden.muted = muted;
    void golden.play().then(() => {
      setAudioBlocked(false);
      fadeCleanupRef.current = [smoothVolume(david, 0), smoothVolume(golden, 0.58)];
      window.setTimeout(() => {
        if (trackRef.current === "golden") david.pause();
      }, 850);
    }).catch(() => setAudioBlocked(true));
  }, [clearFades, muted]);

  const startCredits = useCallback(() => {
    setGuestbookOpen(false);
    setPaused(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setCreditsOpen(true);
    switchToDavid();
    window.setTimeout(() => {
      if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    }, 40);
  }, [switchToDavid]);

  const closeCredits = useCallback((openBook: boolean) => {
    setCreditsOpen(false);
    switchToGolden();
    if (openBook) setGuestbookOpen(true);
    else window.setTimeout(() => deskButtonRef.current?.focus({ preventScroll: true }), 80);
  }, [switchToGolden]);

  const closeGuestbook = useCallback(() => {
    setGuestbookOpen(false);
    window.setTimeout(() => deskButtonRef.current?.focus({ preventScroll: true }), 40);
  }, []);

  useEffect(() => {
    if (!guestbookOpen && !creditsOpen) return;
    const previousOverflow = document.body.style.overflow;
    const endingScreen = document.querySelector<HTMLElement>(".ending-screen");
    const previousInert = endingScreen?.inert ?? false;
    document.body.style.overflow = "hidden";
    endingScreen?.classList.add("ending-overlay-open");
    if (endingScreen) endingScreen.inert = true;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (creditsOpen) closeCredits(false);
      else closeGuestbook();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      endingScreen?.classList.remove("ending-overlay-open");
      if (endingScreen) endingScreen.inert = previousInert;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeCredits, closeGuestbook, creditsOpen, guestbookOpen]);

  useEffect(() => {
    if (guestbookOpen) window.setTimeout(() => nameInputRef.current?.focus(), 40);
  }, [guestbookOpen]);

  useEffect(() => {
    if (creditsOpen) window.setTimeout(() => creditsCloseRef.current?.focus(), 720);
  }, [creditsOpen]);

  useEffect(() => {
    if (!creditsOpen) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let previous = performance.now();
    const advance = (now: number) => {
      const scroller = scrollerRef.current;
      if (scroller && !paused && !reducedMotion) {
        scroller.scrollTop += Math.min(48, now - previous) * 0.028;
        const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
        if (distance < 700) void loadMore(false);
      }
      previous = now;
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [creditsOpen, loadMore, paused]);

  function goToMemoryTree() {
    setCreditsOpen(false);
    switchToGolden();
    window.setTimeout(() => document.querySelector("#thank-you-stop")?.scrollIntoView({ behavior: "smooth" }), 60);
  }

  async function submitGuestbook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormMessage("");
    try {
      const response = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName, message, website }),
      });
      const payload = await response.json() as { entry?: GuestbookEntry; error?: string };
      if (!response.ok || !payload.entry) throw new Error(payload.error || ui.genericError);
      setEntries((current) => [payload.entry!, ...current.filter((entry) => entry.id !== payload.entry!.id)]);
      setNewEntryId(payload.entry.id);
      setDisplayName("");
      setMessage("");
      setFormMessage(ui.success);
      startCredits();
    } catch (error) {
      setFormMessage(error instanceof Error && error.message ? error.message : ui.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  function playCurrentTrack() {
    const track = trackRef.current;
    const audio = track === "david" ? davidRef.current : goldenRef.current;
    if (!audio) return;
    audio.volume = track === "david" ? 0.68 : 0.58;
    audio.muted = false;
    if (track === "david") goldenRef.current?.pause();
    else davidRef.current?.pause();
    if (muted) onToggleMuted();
    void audio.play().then(() => setAudioBlocked(false)).catch(() => setAudioBlocked(true));
  }

  const overlayLayer = typeof document !== "undefined" && (guestbookOpen || creditsOpen)
    ? createPortal(<>
      {guestbookOpen && <div className="guestbook-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeGuestbook()}>
        <section className="guestbook-modal" role="dialog" aria-modal="true" aria-labelledby="guestbook-title" onKeyDown={trapFocus}>
          <button type="button" className="guestbook-modal-close" onClick={closeGuestbook} aria-label={ui.close}>×</button>
          <div className="guestbook-modal-copy">
            <span>{ui.kicker}</span>
            <h2 id="guestbook-title">{ui.title}</h2>
            <p>{ui.body}</p>
          </div>
          <form className="guestbook-book" onSubmit={submitGuestbook}>
            <span className="guestbook-binding" aria-hidden="true" />
            <div className="guestbook-page guestbook-page-left" aria-hidden="true">
              <small>TÀU DI SẢN VIỆT NAM</small>
              <b>SỔ<br />LƯU BÚT</b>
              <i>2026</i>
            </div>
            <div className="guestbook-page guestbook-page-right">
              <label className="sr-only" aria-hidden="true">Website<input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" /></label>
              <label><span>{ui.name}</span><input ref={nameInputRef} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={ui.namePlaceholder} maxLength={40} required disabled={!configured || submitting} /></label>
              <label><span>{ui.message}</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder={ui.messagePlaceholder} maxLength={280} required disabled={!configured || submitting} /></label>
              <div className="guestbook-count"><span>{ui.publicNote}</span><b>{message.length}/280</b></div>
              {!configured && <p className="guestbook-notice">{ui.unavailable}</p>}
              {formMessage && <p className="guestbook-notice" role="status">{formMessage}</p>}
              <div className="guestbook-actions">
                <button type="submit" disabled={!configured || submitting}>{submitting ? ui.submitting : ui.submit}<b>▶</b></button>
                <button type="button" onClick={startCredits}>{ui.skip}<b>▶</b></button>
              </div>
            </div>
          </form>
        </section>
      </div>}

      {creditsOpen && <section className="community-credits" role="dialog" aria-modal="true" aria-labelledby="community-credits-title" onKeyDown={trapFocus}>
        <span className="credits-film-grain" aria-hidden="true" />
        <span className="credits-train-silhouette" aria-hidden="true" />
        <header className="credits-heading">
          <small>{ui.creditsKicker}</small>
          <h2 id="community-credits-title">Big thanks to...</h2>
        </header>
        <div ref={scrollerRef} className="credits-scroll" tabIndex={0} aria-label={language === "vi" ? "Danh sách lời nhắn, mới nhất trước" : "Guestbook messages, newest first"}>
          <div className="credits-roll">
            {entries.map((entry) => <article key={entry.id} className={entry.id === newEntryId ? "new" : ""}>
              {entry.id === newEntryId && <small>{ui.newest}</small>}
              <h3>{entry.displayName}</h3>
              <p>{entry.message}</p>
            </article>)}
            <section className="credits-project" aria-label={ui.projectCredits}>
              <small>{ui.projectCredits}</small>
              {ui.projectItems.map(([role, name]) => <div key={role}><span>{role}</span><b>{name}</b></div>)}
            </section>
            <p className="credits-fin">✦</p>
          </div>
        </div>
        <div className="credits-controls">
          <button ref={creditsCloseRef} type="button" onClick={() => closeCredits(true)}>← <span>{ui.back}</span></button>
          <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>{paused ? "▶" : "‖"} <span>{paused ? ui.resume : ui.pause}</span></button>
          <button className="credits-sound-button" type="button" onClick={audioBlocked ? playCurrentTrack : onToggleMuted} aria-pressed={muted} aria-label={audioBlocked ? ui.playMusic : muted ? ui.unmuteMusic : ui.muteMusic}>
            <i aria-hidden="true">{audioBlocked ? "▶" : muted ? "◌" : "♪"}</i>
            <span><small>{ui.soundtrack}</small><b>David · Instrumental Slowed</b></span>
          </button>
          <button type="button" onClick={goToMemoryTree}><span>{ui.tree}</span> ↓</button>
        </div>
      </section>}
    </>, document.body)
    : null;

  return <>
    <section id="guestbook-corner" className="guestbook-corner" aria-labelledby="guestbook-corner-title">
      <div className="guestbook-corner-copy">
        <span>{ui.kicker}</span>
        <h3 id="guestbook-corner-title">{ui.cornerTitle}</h3>
        <p>{ui.cornerBody}</p>
        <button type="button" className="guestbook-watch-button" onClick={startCredits}>{ui.watch}<b>▶</b></button>
      </div>
      <button ref={deskButtonRef} type="button" className="guestbook-desk" onClick={() => setGuestbookOpen(true)} aria-label={`${ui.openBook}: ${ui.title}`}>
        <span className="guestbook-lamp" aria-hidden="true"><i /><b /></span>
        <span className="guestbook-desk-top" aria-hidden="true">
          <span className="guestbook-mini-book"><i>{language === "vi" ? "SỔ LƯU BÚT" : "GUESTBOOK"}</i><b /></span>
          <span className="guestbook-pen" />
        </span>
        <span className="guestbook-desk-front" aria-hidden="true"><i /><i /><b>{ui.openBook}</b></span>
      </button>
    </section>
    {overlayLayer}
  </>;
}
