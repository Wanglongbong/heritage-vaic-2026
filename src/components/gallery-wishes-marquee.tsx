"use client";

import React, { useState, useEffect } from "react";
import type { Language } from "@/lib/types";
import { playClickSfx, playPaperSfx } from "@/lib/sound-effects";
import {
  type GuestbookEntry,
  type AvatarOption,
  DEFAULT_AVATARS,
  NATIONALITIES,
  createGuestbookEntry,
  formatGuestbookTimestamp,
  getCachedGuestbook,
  listGuestbookEntries,
  migrateLegacyGuestbookEntries,
  subscribeGuestbook,
} from "@/lib/guestbook";
import { FloatingWishesScreen } from "./floating-wishes-screen";

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
  const [entries, setEntries] = useState<GuestbookEntry[]>(() => getCachedGuestbook());
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestbookError, setGuestbookError] = useState("");
  const [website, setWebsite] = useState("");

  // Form State
  const [authorName, setAuthorName] = useState("");
  const [selectedAvatar] = useState<AvatarOption>(DEFAULT_AVATARS[0]);
  const [selectedNation] = useState(NATIONALITIES[0]);
  const [feedbackText, setFeedbackText] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeGuestbook((updated) => {
      if (active) setEntries(updated);
    });
    void (async () => {
      try {
        await migrateLegacyGuestbookEntries();
        const loaded = await listGuestbookEntries();
        if (active) setEntries(loaded);
      } catch {
        if (active) {
          setGuestbookError(
            language === "vi"
              ? "Chưa kết nối được sổ lưu bút chung. Bạn vẫn có thể xem bản đã lưu gần nhất."
              : "The shared guestbook is temporarily unavailable. Showing the latest saved copy.",
          );
        }
      }
    })();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackText.trim() || website || isSubmitting) return;

    const lastSubmit = Number(localStorage.getItem("tau_di_san_guestbook_last_submit") ?? 0);
    if (Date.now() - lastSubmit < 10_000) {
      setGuestbookError(
        language === "vi"
          ? "Bạn hãy chờ vài giây trước khi gửi thêm một lưu bút nhé."
          : "Please wait a few seconds before sending another note.",
      );
      return;
    }

    playPaperSfx({ muted, volume });
    setIsSubmitting(true);
    setGuestbookError("");
    try {
      const saved = await createGuestbookEntry({
        name: authorName.trim() || (language === "vi" ? "Lữ khách phương xa" : "Anonymous Passenger"),
        character: selectedAvatar.icon,
        characterName: language === "vi" ? selectedAvatar.labelVi : selectedAvatar.labelEn,
        countryCode: selectedNation.code,
        countryName: language === "vi" ? selectedNation.nameVi : selectedNation.nameEn,
        flag: selectedNation.flag,
        content: feedbackText.trim(),
      });
      setEntries((current) => [saved, ...current.filter((entry) => entry.id !== saved.id)]);
      localStorage.setItem("tau_di_san_guestbook_last_submit", String(Date.now()));
      setFeedbackText("");
      setAuthorName("");
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3500);
    } catch {
      setGuestbookError(
        language === "vi"
          ? "Lưu bút chưa gửi được. Vui lòng kiểm tra mạng và thử lại."
          : "Your note could not be sent. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
            <span className="admin-trigger-emoji" aria-hidden="true">🎬</span>
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
        <input
          type="text"
          name="website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-10000px", width: 1, height: 1 }}
        />
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
            disabled={!feedbackText.trim() || isSubmitting}
          >
            <span>✍️</span>
            <span>
              {isSubmitting
                ? language === "vi" ? "ĐANG GỬI..." : "SENDING..."
                : language === "vi" ? "GỬI LƯU BÚT" : "SUBMIT NOTE"}
            </span>
          </button>
        </div>

        {guestbookError && (
          <div className="compact-success-toast animate-fade-in" role="alert">
            <span>⚠️</span>
            <span>{guestbookError}</span>
          </div>
        )}

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
                <span className="note-time">{formatGuestbookTimestamp(entry, language)}</span>
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
          onAddEntry={async (newEntry) => {
            const saved = await createGuestbookEntry(newEntry);
            setEntries((current) => [saved, ...current.filter((entry) => entry.id !== saved.id)]);
          }}
          muted={muted}
          volume={volume}
        />
      )}

    </section>
  );
}
