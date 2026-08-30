"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Language } from "@/lib/types";
import { playClickSfx, playPaperSfx } from "@/lib/sound-effects";
import {
  type GuestbookEntry,
  type AvatarOption,
  DEFAULT_AVATARS,
  NATIONALITIES,
  getStoredGuestbook,
  saveStoredGuestbook,
  subscribeGuestbook,
} from "@/lib/guestbook";
import { FloatingWishesScreen } from "./floating-wishes-screen";
import { AdminGuestbookModal } from "./admin-guestbook-modal";

interface GalleryWishesMarqueeProps {
  language: Language;
  muted: boolean;
  volume: number;
  onNewJourney: () => void;
}

export function GalleryWishesMarquee({
  language,
  muted,
  volume,
}: GalleryWishesMarqueeProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(() => getStoredGuestbook());
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Secret 5-second hold state
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);
  const HOLD_DURATION_MS = 5000;

  // Form State
  const [authorName, setAuthorName] = useState("");
  const [selectedAvatar] = useState<AvatarOption>(DEFAULT_AVATARS[0]);
  const [selectedNation] = useState(NATIONALITIES[0]);
  const [feedbackText, setFeedbackText] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    return subscribeGuestbook((updated) => setEntries(updated));
  }, []);

  function startHold() {
    holdStartRef.current = Date.now();
    setHoldProgress(0.1);

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(pct);
    }, 40);

    holdTimerRef.current = setTimeout(() => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      setHoldProgress(0);
      playClickSfx({ muted, volume });
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }
      setIsAdminModalOpen(true);
    }, HOLD_DURATION_MS);
  }

  function cancelHold() {
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    setHoldProgress(0);
  }

  function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    playPaperSfx({ muted, volume });

    const newEntry: GuestbookEntry = {
      id: "entry-" + Date.now(),
      name: authorName.trim() || (language === "vi" ? "Lữ khách phương xa" : "Anonymous Passenger"),
      character: selectedAvatar.icon,
      characterName: language === "vi" ? selectedAvatar.labelVi : selectedAvatar.labelEn,
      countryCode: selectedNation.code,
      countryName: language === "vi" ? selectedNation.nameVi : selectedNation.nameEn,
      flag: selectedNation.flag,
      content: feedbackText.trim(),
      timestamp: language === "vi" ? "Vừa xong" : "Just now",
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveStoredGuestbook(updated);

    setFeedbackText("");
    setAuthorName("");
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3500);
  }

  function handleOpenCinema() {
    playPaperSfx({ muted, volume });
    setIsCinemaOpen(true);
  }

  const latestEntries = entries.slice(0, 3);

  return (
    <section
      className="gallery-wishes-marquee-section compact-tribute-box"
      aria-label={
        language === "vi"
          ? "Sổ lưu bút và màn chiếu tri ân hành khách"
          : "Passenger guestbook & ending credits cinema launchpad"
      }
    >
      {/* Background ambient lighting */}
      <div className="marquee-ambient-glow" aria-hidden="true" />

      {/* 1. Header with Title and Grand Cinema Launch CTA */}
      <div className="compact-tribute-header">
        <div className="compact-tribute-titles">
          <span className="compact-tribute-kicker">
            <span
              className={`admin-secret-trigger ${holdProgress > 0 ? "holding" : ""}`}
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              onTouchCancel={cancelHold}
              title={language === "vi" ? "🎬 (Giữ 5s để mở Chế độ Quản trị Bí mật)" : "🎬 (Hold 5s for Secret Admin Mode)"}
              aria-label="Secret Admin Mode Trigger"
            >
              <span className="admin-trigger-emoji">🎬</span>
              {holdProgress > 0 && (
                <span className="admin-trigger-progress-badge">
                  <span
                    className="admin-progress-fill"
                    style={{ width: `${holdProgress}%` }}
                  />
                  <span className="admin-progress-seconds">
                    {Math.max(1, Math.ceil((HOLD_DURATION_MS - (holdProgress / 100) * HOLD_DURATION_MS) / 1000))}s
                  </span>
                </span>
              )}
            </span>
            <span>{language === "vi" ? "SỔ LƯU BÚT & MÀN CHIẾU CUỘN TRI ÂN" : "GUESTBOOK & ENDING MOVIE CREDITS"}</span>
          </span>
          <h3 className="compact-tribute-heading">
            {language === "vi"
              ? "Gửi lời lưu bút & Xem màn chiếu tri ân chuyến tàu"
              : "Leave your note & Watch the rolling ending credits"}
          </h3>
          <p className="compact-tribute-desc">
            {language === "vi"
              ? "Tên và cảm nghĩ của bạn sẽ được vinh danh cuộn tự động trong màn chiếu điện ảnh BIG THANKS TO..."
              : "Your name and reflection will be honored rolling automatically in the BIG THANKS TO... movie credits."}
          </p>
        </div>

        {/* Highlighted Cinema Button */}
        <button
          type="button"
          className="compact-cinema-launch-btn"
          onClick={handleOpenCinema}
          title={language === "vi" ? "Mở màn chiếu Ending Credits toàn màn hình" : "Open Ending Movie Credits"}
        >
          <span className="cinema-btn-icon">🎬</span>
          <div className="cinema-btn-text">
            <small>{language === "vi" ? "TRẢI NGHIỆM ĐIỆN ẢNH" : "CINEMATIC EXPERIENCE"}</small>
            <b>{language === "vi" ? "MỞ MÀN CHIẾU (BIG THANKS TO...)" : "OPEN CREDITS (BIG THANKS TO...)"}</b>
          </div>
          <span className="cinema-btn-arrow">↗</span>
        </button>
      </div>

      {/* 2. Streamlined Quick Guestbook Form */}
      <form onSubmit={handleSubmitFeedback} className="compact-guestbook-form">
        <div className="compact-input-row">
          <input
            type="text"
            className="compact-name-input"
            placeholder={language === "vi" ? "Tên bạn (hiện trên màn chiếu)..." : "Your name for credits..."}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={40}
          />
          <input
            type="text"
            className="compact-msg-input"
            placeholder={
              language === "vi"
                ? "Viết lời cảm nghĩ gửi chuyến tàu di sản..."
                : "Write your reflection for the heritage express..."
            }
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            maxLength={260}
            required
          />
          <button
            type="submit"
            className="compact-submit-btn"
            disabled={!feedbackText.trim()}
          >
            <span>✍️</span>
            <span>{language === "vi" ? "GỬI LƯU BÚT" : "SUBMIT NOTE"}</span>
          </button>
        </div>

        {sentSuccess && (
          <div className="compact-success-toast animate-fade-in">
            <span>✨</span>
            <span>
              {language === "vi"
                ? "Lưu bút của bạn đã được ghi lại thành công! Hãy mở Màn Chiếu để xem tên bạn cuộn lên nhé."
                : "Your note was recorded! Open the Movie Credits to see your name roll up."}
            </span>
          </div>
        )}
      </form>

      {/* 3. Sleek Preview of Recent Passenger Notes (Clean 3-card preview, not bulky) */}
      <div className="compact-recent-preview">
        <div className="compact-preview-top">
          <span className="compact-preview-label">
            {language === "vi" ? "Lưu bút mới nhất từ hành khách:" : "Latest passenger reflections:"}
          </span>
          <button
            type="button"
            className="compact-view-all-link"
            onClick={handleOpenCinema}
          >
            {language === "vi" ? `Xem tất cả ${entries.length} lưu bút trên Màn Chiếu ↗` : `View all ${entries.length} notes in Credits ↗`}
          </button>
        </div>

        <div className="compact-cards-grid">
          {latestEntries.map((entry) => (
            <div
              key={entry.id}
              className="compact-note-pill"
              onClick={handleOpenCinema}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenCinema();
                }
              }}
            >
              <div className="note-pill-author">
                <span className="note-author-name">{entry.flag} {entry.name}</span>
                <span className="note-time">{entry.timestamp}</span>
              </div>
              <p className="note-pill-content">“{entry.content}”</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Floating Wishes Cinema Modal */}
      {isCinemaOpen && (
        <FloatingWishesScreen
          language={language}
          entries={entries}
          onClose={() => setIsCinemaOpen(false)}
          onAddEntry={(newEntry) => {
            const updated = [newEntry, ...entries];
            setEntries(updated);
            saveStoredGuestbook(updated);
          }}
          muted={muted}
          volume={volume}
        />
      )}

      {/* Secret Admin Guestbook Manager Modal */}
      {isAdminModalOpen && (
        <AdminGuestbookModal
          language={language}
          onClose={() => setIsAdminModalOpen(false)}
          muted={muted}
          volume={volume}
        />
      )}
    </section>
  );
}
