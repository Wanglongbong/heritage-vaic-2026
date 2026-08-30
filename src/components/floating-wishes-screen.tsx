"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Language } from "@/lib/types";
import { playClickSfx, playPaperSfx } from "@/lib/sound-effects";
import {
  playCinemaDavid,
  exitCinemaToGoldenEmbers,
  updateEndingMusicVolume,
} from "@/lib/ending-music";
import type { GuestbookEntry } from "@/lib/guestbook";

interface FloatingWishesScreenProps {
  language: Language;
  entries: GuestbookEntry[];
  onClose: () => void;
  onAddEntry?: (newEntry: GuestbookEntry) => void;
  muted: boolean;
  volume: number;
}

export function FloatingWishesScreen({
  language,
  entries,
  onClose,
  onAddEntry,
  muted,
  volume,
}: FloatingWishesScreenProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 1.6 | 0.6>(1);
  const [quickInput, setQuickInput] = useState("");
  const [quickSender, setQuickSender] = useState("");
  const [heartCount, setHeartCount] = useState(198);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollOffsetY, setScrollOffsetY] = useState<number>(0);
  const currentOffsetRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartOffsetRef = useRef<number>(0);

  // Play David (Instrumental Slowed) soundtrack during Movie Credits
  useEffect(() => {
    if (isMusicEnabled) {
      playCinemaDavid({ muted, volume });
    } else {
      updateEndingMusicVolume({ muted: true, volume });
    }
    return () => {
      exitCinemaToGoldenEmbers({ muted, volume });
    };
  }, []);

  useEffect(() => {
    updateEndingMusicVolume({ muted: muted || !isMusicEnabled, volume });
  }, [muted, volume, isMusicEnabled]);

  // Set initial scroll offset so credits begin from lower half of viewport
  useEffect(() => {
    const initialPos = typeof window !== "undefined" ? window.innerHeight * 0.45 : 360;
    currentOffsetRef.current = initialPos;
    setScrollOffsetY(initialPos);
  }, []);

  // Smooth continuous movie credits upward scroll loop using requestAnimationFrame & GPU translate3d
  useEffect(() => {
    let lastTimestamp = performance.now();
    let animationFrameId: number;

    const scrollLoop = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.08);
      lastTimestamp = now;

      if (!isPaused && !isDraggingRef.current) {
        const baseSpeed = 46; // pixels per second
        currentOffsetRef.current -= baseSpeed * speedMultiplier * dt;

        // Calculate loop reset condition
        if (trackRef.current && containerRef.current) {
          const trackHeight = trackRef.current.offsetHeight;
          const containerHeight = containerRef.current.offsetHeight;
          // If track has completely scrolled past the top
          if (currentOffsetRef.current < -(trackHeight + 80)) {
            currentOffsetRef.current = containerHeight * 0.75; // Loop back from bottom
          }
        }

        setScrollOffsetY(currentOffsetRef.current);
      }

      animationFrameId = requestAnimationFrame(scrollLoop);
    };

    animationFrameId = requestAnimationFrame(scrollLoop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPaused, speedMultiplier]);

  // Manual wheel scroll support without stopping auto-scroll
  const handleWheel = (e: React.WheelEvent) => {
    currentOffsetRef.current -= e.deltaY * 0.8;
    setScrollOffsetY(currentOffsetRef.current);
  };

  // Touch drag support
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    dragStartYRef.current = e.touches[0].clientY;
    dragStartOffsetRef.current = currentOffsetRef.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.touches[0].clientY - dragStartYRef.current;
    currentOffsetRef.current = dragStartOffsetRef.current + deltaY;
    setScrollOffsetY(currentOffsetRef.current);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  function handleResetScroll() {
    playClickSfx({ muted, volume });
    const initialPos = containerRef.current ? containerRef.current.offsetHeight * 0.45 : 360;
    currentOffsetRef.current = initialPos;
    setScrollOffsetY(initialPos);
  }

  // Handle keyboard Esc & Space
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        playClickSfx({ muted, volume });
        onClose();
      } else if (e.key === " " && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, muted, volume]);

  function handleSendQuickWish(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!quickInput.trim()) return;

    playPaperSfx({ muted, volume });

    const newWish: GuestbookEntry = {
      id: "credits-quick-" + Date.now(),
      name: quickSender.trim() || (language === "vi" ? "Lữ khách đồng hành" : "Heritage Traveler"),
      character: "📜",
      characterName: language === "vi" ? "Người gửi lời chúc" : "Passenger",
      countryCode: "VN",
      countryName: "Việt Nam",
      flag: "🇻🇳",
      content: quickInput.trim(),
      timestamp: language === "vi" ? "Vừa gửi" : "Just now",
    };

    if (onAddEntry) {
      onAddEntry(newWish);
    }
    setQuickInput("");
    triggerFloatingHeart(window.innerWidth / 2, window.innerHeight / 2);
  }

  function triggerFloatingHeart(x: number, y: number) {
    playClickSfx({ muted, volume });
    setHeartCount((h) => h + 1);
    const newH = { id: Date.now() + Math.random(), x, y };
    setFloatingHearts((prev) => [...prev.slice(-15), newH]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((item) => item.id !== newH.id));
    }, 2000);
  }

  return (
    <div
      className="floating-wishes-overlay credits-cinema-theme"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credits-movie-heading"
    >
      {/* Cinematic Starfield & Ambient Gold Mist */}
      <div className="wishes-sky-backdrop" aria-hidden="true">
        <div className="heritage-sky-gradient" />
        <div className="stars-cluster layer-1" />
        <div className="stars-cluster layer-2" />
        <div className="moonlit-soft-glow" />
        <div className="credits-film-grain" />
      </div>

      {/* Top Navigation & Status Bar */}
      <header className="wishes-top-bar">
        <div className="wishes-header-branding">
          <span className="heritage-crest-icon">🎬</span>
          <div>
            <h2 id="credits-screen-title" className="wishes-title">
              {language === "vi"
                ? "MÀN CHIẾU KẾT THÚC · ENDING MOVIE CREDITS"
                : "ENDING SCROLLING CREDITS · MEMORY CINEMA"}
            </h2>
            <p className="wishes-sub">
              {language === "vi"
                ? "Dòng chữ cuộn tri ân tất cả những người đã bước lên chuyến tàu di sản"
                : "A rolling tribute to all passengers who stepped aboard the heritage express"}
            </p>
          </div>
        </div>

        {/* Control Actions */}
        <div className="wishes-top-controls">
          <button
            type="button"
            className={`wishes-ctrl-btn ${isMusicEnabled ? "active-music" : ""}`}
            onClick={() => {
              playClickSfx({ muted, volume });
              setIsMusicEnabled((m) => !m);
            }}
            title={language === "vi" ? "Nhạc phim David (Instrumental Slowed)" : "David (Instrumental Slowed) Soundtrack"}
          >
            <span>{isMusicEnabled ? (language === "vi" ? "🎶 Nhạc phim" : "🎶 Soundtrack") : (language === "vi" ? "🔇 Tắt nhạc" : "🔇 Muted")}</span>
          </button>

          <button
            type="button"
            className={`wishes-ctrl-btn ${isPaused ? "active-pause" : ""}`}
            onClick={() => {
              playClickSfx({ muted, volume });
              setIsPaused((p) => !p);
            }}
            title={language === "vi" ? "Tạm dừng / Tiếp tục cuộn" : "Pause / Resume"}
          >
            <span>{isPaused ? "▶️ Tiếp tục" : "⏸️ Tạm dừng"}</span>
          </button>

          <button
            type="button"
            className="wishes-ctrl-btn"
            onClick={handleResetScroll}
            title={language === "vi" ? "Cuộn lại từ đầu" : "Rewind to top"}
          >
            <span>↺ {language === "vi" ? "Từ đầu" : "Rewind"}</span>
          </button>

          <button
            type="button"
            className="wishes-ctrl-btn"
            onClick={() => {
              playClickSfx({ muted, volume });
              setSpeedMultiplier((s) => (s === 1 ? 1.6 : s === 1.6 ? 0.6 : 1));
            }}
            title={language === "vi" ? "Tốc độ cuộn chữ" : "Scroll Speed"}
          >
            <span>
              ⚡ {speedMultiplier === 1.6 ? (language === "vi" ? "Nhanh" : "Fast") : speedMultiplier === 0.6 ? (language === "vi" ? "Chậm" : "Slow") : (language === "vi" ? "Chuẩn" : "Normal")}
            </span>
          </button>

          <button
            type="button"
            className="wishes-ctrl-btn heart-btn"
            onClick={(e) => triggerFloatingHeart(e.clientX, e.clientY)}
            title={language === "vi" ? "Thả tim tri ân" : "Send love"}
          >
            <span>❤️ {heartCount}</span>
          </button>

          <button
            type="button"
            className="wishes-close-btn"
            onClick={() => {
              playClickSfx({ muted, volume });
              onClose();
            }}
            aria-label={language === "vi" ? "Đóng rạp chiếu" : "Close cinema"}
          >
            <span>✕</span>
          </button>
        </div>
      </header>

      {/* 1. FIXED & BEAUTIFIED HERO BANNER: "BIG THANKS TO..." (PINNED AT THE TOP) */}
      <div className="credits-fixed-hero-marquee" role="banner">
        <div className="credits-hero-inner">
          <div className="credits-super-kicker">
            ✦ VIETNAM HERITAGE EXPRESS · TRI ÂN ĐỒNG HÀNH ✦
          </div>
          <h1 id="credits-movie-heading" className="credits-movie-title">
            BIG THANKS TO...
          </h1>
          <p className="credits-tribute-subtitle">
            {language === "vi"
              ? "TẤT CẢ NHỮNG NGƯỜI ĐÃ BƯỚC LÊN CHUYẾN TÀU DI SẢN"
              : "ALL PASSENGERS WHO STEPPED ABOARD THE HERITAGE EXPRESS"}
          </p>
          <div className="credits-decorative-divider">
            <span className="divider-line" />
            <span className="divider-icon">💮</span>
            <span className="divider-line" />
          </div>
        </div>

        {/* Feathered Dissolve Veil: Crawling text disappears right underneath BIG THANKS TO... */}
        <div className="credits-dissolve-under-title" aria-hidden="true" />
      </div>

      {/* Bottom Cinematic Vignette Fade */}
      <div className="credits-vignette-fade bottom-fade" aria-hidden="true" />

      {/* Main Crawling Credits Stage: Text moves up smoothly & disappears under the header */}
      <main
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`credits-crawl-viewport ${isPaused ? "is-paused" : ""}`}
        aria-live="polite"
      >
        <div
          ref={trackRef}
          className="credits-crawling-track"
          style={{
            transform: `translate3d(0, ${scrollOffsetY}px, 0)`,
          }}
        >
          {/* INTRODUCTORY TRIBUTE MESSAGE */}
          <div className="credits-intro-message-card">
            <p className="credits-tribute-desc">
              {language === "vi"
                ? "Xin gửi lời tri ân sâu sắc nhất tới từng vị khách quý đã dành thời gian thưởng thức văn hoá, tương tác từng chặng đường và lưu lại những dòng tâm tình quý báu trên chuyến tàu này."
                : "With our deepest gratitude to every honored traveler who spent time appreciating our culture and penning heartfelt reflections on this journey."}
            </p>
          </div>

          {/* PRODUCTION & AUTHOR CREDITS SECTION */}
          <div className="credits-role-block">
            <div className="credits-role-title">
              {language === "vi" ? "TÁC GIẢ & PHÁT TRIỂN DỰ ÁN" : "CREATOR & LEAD DEVELOPER"}
            </div>
            <div className="credits-person-name">VŨ ANH QUÂN</div>
            <p className="credits-person-note">
              {language === "vi"
                ? "“Cảm ơn mọi người đã đồng hành và tiếp lửa cho chuyến tàu văn hóa này!”"
                : "“Thank you all for journeying with us and keeping the heritage flame alive!”"}
            </p>
          </div>

          <div className="credits-role-block">
            <div className="credits-role-title">
              {language === "vi" ? "NGUỒN CẢM HỨNG VÀ DI SẢN" : "HERITAGE & INSPIRATION"}
            </div>
            <div className="credits-person-name">
              {language === "vi" ? "KHO TÀNG DI SẢN VĂN HOÁ PHI VẬT THỂ VIỆT NAM" : "INTANGIBLE CULTURAL HERITAGE OF VIETNAM"}
            </div>
            <p className="credits-person-note">
              {language === "vi"
                ? "Ca Trù · Quan Họ · Gốm Bát Tràng · Đàn Bầu · Tranh Đông Hồ"
                : "Ca Tru · Quan Ho Singing · Bat Trang Pottery · Dan Bau · Dong Ho Woodcut"}
            </p>
          </div>

          {/* GUESTBOOK PASSENGERS SECTION (NO EMOJI AVATARS - CLEAN NAMES & QUOTES) */}
          <div className="credits-passengers-section">
            <div className="credits-section-label">
              <span className="credits-section-label-text">
                {language === "vi" ? "DANH SÁCH LƯU BÚT ĐỒNG HÀNH" : "PASSENGER REFLECTIONS & GUESTBOOK"}
              </span>
            </div>

            <div className="credits-entries-list">
              {entries.map((entry, index) => (
                <article key={`credit-entry-${entry.id}-${index}`} className="credit-entry-card">
                  <div className="credit-entry-index">#{String(index + 1).padStart(3, "0")}</div>
                  <h3 className="credit-entry-name">
                    {entry.name.toUpperCase()}
                  </h3>
                  {entry.countryName && (
                    <div className="credit-entry-origin">
                      {entry.countryName}
                    </div>
                  )}
                  <blockquote className="credit-entry-quote">
                    “{entry.content}”
                  </blockquote>
                </article>
              ))}
            </div>
          </div>

          {/* CLOSING FINALE CARD */}
          <div className="credits-finale-block">
            <span className="finale-crest">🚂</span>
            <h2 className="finale-heading">
              CHUYẾN TÀU DI SẢN VIỆT NAM
            </h2>
            <p className="finale-subheading">
              VIETNAM HERITAGE EXPRESS
            </p>
            <div className="credits-decorative-divider">
              <span className="divider-line" />
              <span className="divider-icon">🌸</span>
              <span className="divider-line" />
            </div>
            <p className="finale-message">
              {language === "vi"
                ? "Hẹn gặp lại quý bạn đọc và các lữ khách ở những hành trình di sản tiếp theo!"
                : "Farewell, dear passengers. May our paths cross again on future heritage journeys!"}
            </p>
            <div className="finale-year">
              © 2026 · VŨ ANH QUÂN · NON-PROFIT CULTURAL PROJECT
            </div>
          </div>
        </div>
      </main>

      {/* Floating Heart Particles */}
      {floatingHearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart-particle"
          style={{ left: h.x, top: h.y }}
        >
          🏮
        </span>
      ))}

      {/* Bottom Floating Quick Wish Input Bar */}
      <footer className="wishes-bottom-dock">
        <form className="wishes-quick-send-form" onSubmit={handleSendQuickWish}>
          <div className="wishes-input-wrapper">
            <input
              type="text"
              className="wishes-name-input"
              placeholder={language === "vi" ? "Tên bạn (hiện trên màn chiếu)..." : "Your name for credits..."}
              value={quickSender}
              onChange={(e) => setQuickSender(e.target.value)}
              maxLength={40}
            />
            <input
              type="text"
              className="wishes-msg-input"
              placeholder={
                language === "vi"
                  ? "Viết lời lưu bút để tên & lời chúc của bạn cuộn lên màn chiếu ngay..."
                  : "Write your reflection to roll onto the movie credits..."
              }
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              maxLength={240}
            />
            <button
              type="submit"
              className="wishes-send-submit-btn"
              disabled={!quickInput.trim()}
            >
              <span>🎬</span>{" "}
              {language === "vi" ? "GỬI VÀO MÀN CHIẾU" : "ADD TO CREDITS"}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
