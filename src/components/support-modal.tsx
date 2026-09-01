import React, { useState, useEffect } from "react";
import type { Language } from "@/lib/types";
import { playClickSfx, playPaperSfx } from "@/lib/sound-effects";
import { ThankYouDiorama } from "./thank-you-diorama";
import { FloatingWishesScreen } from "./floating-wishes-screen";
import {
  type GuestbookEntry,
  type AvatarOption,
  AVATAR_CATEGORIES,
  DEFAULT_AVATARS,
  NATIONALITIES,
  QUICK_EMOJIS,
  createGuestbookEntry,
  formatGuestbookTimestamp,
  getCachedGuestbook,
  listGuestbookEntries,
  migrateLegacyGuestbookEntries,
  subscribeGuestbook,
} from "@/lib/guestbook";

interface SupportModalProps {
  language: Language;
  onClose: () => void;
  muted?: boolean;
  volume?: number;
}

export function SupportModal({ language, onClose, muted, volume }: SupportModalProps) {
  // Guestbook State
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>(() => getCachedGuestbook());

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeGuestbook((updated) => {
      if (active) setGuestbook(updated);
    });
    void (async () => {
      try {
        await migrateLegacyGuestbookEntries();
        const loaded = await listGuestbookEntries();
        if (active) setGuestbook(loaded);
      } catch {}
    })();
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const [authorName, setAuthorName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption>(DEFAULT_AVATARS[0]);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [avatarCategoryIndex, setAvatarCategoryIndex] = useState(0);
  const [selectedNation, setSelectedNation] = useState(NATIONALITIES[0]);
  const [feedbackText, setFeedbackText] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [website, setWebsite] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isFloatingWishesOpen, setIsFloatingWishesOpen] = useState(false);

  function handleClose() {
    playClickSfx({ muted, volume });
    onClose();
  }

  function handleAddEmoji(emoji: string) {
    playClickSfx({ muted, volume });
    setFeedbackText((prev) => prev + emoji);
  }

  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackText.trim() || website || isSubmitting) return;

    playPaperSfx({ muted, volume });
    setIsSubmitting(true);
    setSubmitError("");
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
      setGuestbook((current) => [saved, ...current.filter((entry) => entry.id !== saved.id)]);
      setFeedbackText("");
      setAuthorName("");
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 3000);
    } catch {
      setSubmitError(
        language === "vi"
          ? "Chưa gửi được lưu bút. Hãy chờ vài giây, kiểm tra mạng rồi thử lại."
          : "The note could not be sent. Wait a moment, check your connection, and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="support-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="support-modal-card">
        {/* Vintage decorative corner stamps */}
        <span className="support-card-corner support-corner-tl" aria-hidden="true" />
        <span className="support-card-corner support-corner-tr" aria-hidden="true" />
        <span className="support-card-corner support-corner-bl" aria-hidden="true" />
        <span className="support-card-corner support-corner-br" aria-hidden="true" />

        {/* Modal Header */}
        <div className="support-modal-header">
          <div className="support-header-title">
            <span className="support-header-icon">📜</span>
            <span className="support-header-text">
              {language === "vi" ? "LỜI CẢM ƠN TỪ TÁC GIẢ & SỔ LƯU BÚT ĐỒNG HÀNH" : "AUTHOR'S GRATITUDE & PASSENGER GUESTBOOK"}
            </span>
          </div>
          <button
            type="button"
            className="support-modal-close"
            onClick={handleClose}
            aria-label={language === "vi" ? "Đóng cửa sổ" : "Close modal"}
          >
            ✕
          </button>
        </div>

        <div className="support-modal-content unified-vertical-layout">
          {/* =========================================================================
              PHẦN 1 (TRÊN ĐẦU): SỔ LƯU BÚT & GÓP Ý HÀNH KHÁCH
              ========================================================================= */}
          <section className="modal-section-guestbook" aria-label="Sổ lưu bút">
            <div className="guestbook-section-header">
              <div className="section-title-group">
                <span className="section-icon">🏮</span>
                <div>
                  <h3 className="section-main-title">
                    {language === "vi" ? "SỔ LƯU BÚT & GÓP Ý CHUYẾN TÀU" : "PASSENGER GUESTBOOK & FEEDBACK"}
                  </h3>
                  <p className="section-sub-desc">
                    {language === "vi"
                      ? "Gửi lời lưu bút, góp ý về văn hoá hoặc chia sẻ cảm xúc của bạn cùng tác giả nhé!"
                      : "Leave your thoughts, cultural insights, or encouraging notes for the journey!"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="toggle-guestbook-form-btn"
                onClick={() => {
                  playClickSfx({ muted, volume });
                  setIsFormOpen(!isFormOpen);
                }}
              >
                <span>{isFormOpen ? "➖" : "➕"}</span>
                <span>{isFormOpen ? (language === "vi" ? "Ẩn khung viết" : "Hide Form") : (language === "vi" ? "Viết lưu bút mới" : "Write Note")}</span>
              </button>
            </div>

            {/* FORM GỬI LƯU BÚT */}
            {isFormOpen && (
              <form className="guestbook-clean-form" onSubmit={handleSubmitFeedback}>
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
                <div className="form-pickers-row">
                  {/* Select Avatar with Hover / Click Plus Button */}
                  <div
                    className="form-picker-col avatar-interactive-picker-wrapper"
                    onMouseEnter={() => setIsAvatarPickerOpen(true)}
                    onMouseLeave={() => setIsAvatarPickerOpen(false)}
                  >
                    <div className="avatar-field-header-row">
                      <label className="form-field-label" style={{ marginBottom: 0 }}>
                        {language === "vi" ? "1. Nhân vật đại diện:" : "1. Choose Avatar:"}
                      </label>
                      <span className="avatar-hint-note">
                        {language === "vi" ? "(Rê chuột hoặc chạm [+] để chọn)" : "(Hover or tap [+] to pick)"}
                      </span>
                    </div>

                    {/* Current Selected Avatar Display & Plus Trigger */}
                    <div className="avatar-preview-trigger-container">
                      <div className="avatar-current-display">
                        <span className="avatar-current-glyph">{selectedAvatar.icon}</span>
                        <div className="avatar-current-text">
                          <span className="avatar-current-label">
                            {language === "vi" ? selectedAvatar.labelVi : selectedAvatar.labelEn}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`avatar-plus-expand-btn ${isAvatarPickerOpen ? "active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          playClickSfx({ muted, volume });
                          setIsAvatarPickerOpen(!isAvatarPickerOpen);
                        }}
                        title={language === "vi" ? "Chọn biểu tượng nhân vật khác" : "Change avatar icon"}
                      >
                        <span className="avatar-plus-icon">➕</span>
                        <span className="avatar-plus-text">
                          {isAvatarPickerOpen
                            ? (language === "vi" ? "Đóng danh sách" : "Close")
                            : (language === "vi" ? "Đổi nhân vật / Emoji" : "Pick Emoji")}
                        </span>
                      </button>
                    </div>

                    {/* Expandable Hover / Click Dropdown Panel */}
                    {isAvatarPickerOpen && (
                      <div className="avatar-picker-dropdown-drawer animate-scale-in">
                        {/* Category Filter Tabs */}
                        <div className="avatar-category-tabs">
                          {AVATAR_CATEGORIES.map((cat, cIdx) => (
                            <button
                              key={cat.categoryVi}
                              type="button"
                              className={`avatar-tab-btn ${avatarCategoryIndex === cIdx ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                playClickSfx({ muted, volume });
                                setAvatarCategoryIndex(cIdx);
                              }}
                            >
                              {language === "vi" ? cat.categoryVi : cat.categoryEn}
                            </button>
                          ))}
                        </div>

                        {/* Avatars Grid in selected Category */}
                        <div className="avatar-category-grid">
                          {AVATAR_CATEGORIES[avatarCategoryIndex].avatars.map((av) => (
                            <button
                              key={av.id}
                              type="button"
                              className={`avatar-picker-item ${selectedAvatar.id === av.id ? "selected" : ""}`}
                              onClick={() => {
                                playClickSfx({ muted, volume });
                                setSelectedAvatar(av);
                                setIsAvatarPickerOpen(false);
                              }}
                              title={language === "vi" ? av.labelVi : av.labelEn}
                            >
                              <span className="picker-item-icon">{av.icon}</span>
                              <span className="picker-item-name">
                                {language === "vi" ? av.labelVi : av.labelEn}
                              </span>
                              {selectedAvatar.id === av.id && (
                                <span className="picker-item-check">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nationality & Name */}
                  <div className="form-picker-col">
                    <div className="form-sub-field">
                      <label className="form-field-label">
                        {language === "vi" ? "2. Quốc tịch:" : "2. Nationality:"}
                      </label>
                      <div className="flags-mini-row">
                        {NATIONALITIES.map((nat) => (
                          <button
                            key={nat.code}
                            type="button"
                            className={`flag-mini-btn ${selectedNation.code === nat.code ? "selected" : ""}`}
                            onClick={() => { playClickSfx({ muted, volume }); setSelectedNation(nat); }}
                            title={language === "vi" ? nat.nameVi : nat.nameEn}
                          >
                            <span>{nat.flag}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-sub-field">
                      <label className="form-field-label" htmlFor="author-name-input">
                        {language === "vi" ? "3. Tên / Biệt danh:" : "3. Your Name / Nickname:"}
                      </label>
                      <input
                        id="author-name-input"
                        type="text"
                        className="guestbook-input"
                        placeholder={language === "vi" ? "Lữ khách phương xa..." : "Heritage wanderer..."}
                        value={authorName}
                        maxLength={35}
                        onChange={(e) => setAuthorName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Textarea & Emoji Toolbar */}
                <div className="form-textarea-block">
                  <label className="form-field-label" htmlFor="guestbook-text-area">
                    {language === "vi" ? "4. Lời nhắn & Góp ý:" : "4. Your Message & Suggestions:"}
                  </label>
                  <textarea
                    id="guestbook-text-area"
                    className="guestbook-textarea"
                    rows={2}
                    placeholder={
                      language === "vi"
                        ? "Chia sẻ cảm nhận, góp ý về âm nhạc ngũ cung, đồ họa pixel hoặc văn hóa các miền..."
                        : "Share your experience, cultural insights, or suggestions..."
                    }
                    value={feedbackText}
                    maxLength={260}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                  />

                  {/* Quick Emoji Strip */}
                  <div className="emoji-quick-strip">
                    <span className="emoji-strip-label">{language === "vi" ? "Chèn biểu tượng:" : "Emoji:"}</span>
                    <div className="emoji-button-list">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="emoji-single-btn"
                          onClick={() => handleAddEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="form-actions-bar">
                  {sentSuccess && (
                    <span className="form-success-badge">
                      ✓ {language === "vi" ? "Đã lưu bút thành công! Cảm ơn bạn rất nhiều ❤️" : "Note posted successfully! Thank you so much ❤️"}
                    </span>
                  )}
                  {submitError && <span className="form-success-badge" role="alert">⚠️ {submitError}</span>}
                  <button type="submit" className="form-submit-ticket-btn" disabled={!feedbackText.trim() || isSubmitting}>
                    <span>📜</span>{" "}
                    {isSubmitting
                      ? language === "vi" ? "ĐANG GỬI..." : "POSTING..."
                      : language === "vi" ? "ĐÓNG DẤU LƯU BÚT" : "POST GUESTBOOK NOTE"}
                  </button>
                </div>
              </form>
            )}

            {/* DANH SÁCH LƯU BÚT ĐÃ ĐƯỢC LƯU (SMOOTH SCROLLABLE CARDS GRID) */}
            <div className="guestbook-entries-container">
              {/* Ô TÍNH NĂNG ĐẶC BIỆT: MÀN CHIẾU BAY LƯU BÚT & LỜI CHÚC TỪ TRÁI QUA PHẢI */}
              <div className="wishes-cinema-banner-card">
                <div className="banner-left-content">
                  <div className="banner-text-group">
                    <h3 className="banner-title">
                      {language === "vi" ? "MÀN CHIẾU KÍ ỨC · LỜI LƯU BÚT BAY TRÁI ➔ PHẢI" : "MEMORY CINEMA · FLOATING WISHES"}
                    </h3>
                    <p className="banner-desc">
                      {language === "vi"
                        ? "Mở màn hình chiếu lớn với các dòng lưu bút & lời chúc bay ngang màn hình lần lượt từ trái qua phải"
                        : "Open cinematic screen with passenger wishes & reviews gliding across from left to right"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="open-wishes-cinema-btn"
                  onClick={() => {
                    playPaperSfx({ muted, volume });
                    setIsFloatingWishesOpen(true);
                  }}
                >
                  <span>{language === "vi" ? "MỞ MÀN CHIẾU CHỮ BAY" : "OPEN WISHES CINEMA"}</span>
                  <span className="cinema-btn-arrow">↗</span>
                </button>
              </div>

              <div className="entries-list-bar">
                <span className="entries-badge-count">
                  🏮 {language === "vi" ? `Danh sách ${guestbook.length} lời lưu bút` : `${guestbook.length} notes`}
                </span>
                <span className="entries-hint-text">
                  {language === "vi" ? "Cuộn xuống để xem thêm" : "Scroll to view more"}
                </span>
              </div>

              <div className="guestbook-grid-scroll">
                {guestbook.map((entry) => (
                  <div key={entry.id} className="guestbook-item-ticket">
                    <div className="ticket-header-row">
                      <div className="ticket-user-box">
                        <span className="ticket-avatar-icon">{entry.character}</span>
                        <div className="ticket-user-meta">
                          <span className="ticket-author-name">
                            {entry.name} <span className="ticket-flag-tag">{entry.flag}</span>
                          </span>
                          <span className="ticket-role-name">{entry.characterName} · {entry.countryName}</span>
                        </div>
                      </div>
                      <span className="ticket-timestamp">{formatGuestbookTimestamp(entry, language)}</span>
                    </div>
                    <p className="ticket-body-text">{entry.content}</p>
                    <span className="ticket-seal-stamp" aria-hidden="true">ĐÃ LƯU BÚT</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* =========================================================================
              PHẦN 2 (PHÍA DƯỚI): LỜI CẢM ƠN TÁC GIẢ & MÃ QR 3D XOAY 360 ĐỘ
              ========================================================================= */}
          <section className="modal-section-author-3d" aria-label="Góc tác giả & Tiếp sức 3D">
            <div className="author-story-and-3d-layout">
              {/* CỘT TRÁI: LỜI TÂM SỰ & CẢM ƠN CỦA TÁC GIẢ */}
              <div className="author-warm-story-col">
                <h2 id="support-modal-title" className="author-story-heading">
                  {language === "vi"
                    ? "Gửi lời cảm ơn chân thành từ Tác Giả ❤️"
                    : "Heartfelt Thanks from the Creator ❤️"}
                </h2>

                <div className="author-story-body">
                  {language === "vi" ? (
                    <>
                      <p>
                        Trước tham gia cuộc thi <strong>Vietnam AI</strong> thì bọn em lúc đầu định làm về di sản, lúc đấy em <em>vibe coding</em> ra được con game như này để cho mọi người xem. Nhưng mà về sau em thấy đây là dự án game phi lợi nhuận cảm giác sẽ không phục vụ được cho cuộc thi và em bỏ dở dự án từ đó đến bây giờ.
                      </p>
                      <p>
                        Mỗi ngày qua chỉnh sửa một chút và không biết đã tốn bao nhiêu token cho <strong>Codex</strong> và <strong>Google AI Studio</strong> rồi ^^ .
                      </p>
                      <div className="author-tea-quote-box">
                        <span className="quote-tea-icon">☕</span>
                        <em>
                          &ldquo;Mọi người ủng hộ em một chút để em lấy thêm token đốt lửa, tiếp tục xây dựng thêm các dự án web game mini nhỏ gọn, chỉn chu tiếp theo ạ. <strong>2k - 3k VNĐ hay một cốc trà đá</strong> là em thấy vui và ấm lòng lắm rồi ạ!&rdquo;
                        </em>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        Originally, when preparing for the <strong>Vietnam AI Contest</strong>, our team planned to build a project around cultural heritage. Back then, I started <em>vibe coding</em> this mini-game prototype to share with friends. However, realizing it was a purely non-profit cultural initiative, it didn&apos;t quite fit the competition criteria, so I paused the project until recently...
                      </p>
                      <p>
                        Every day since, I&apos;ve spent time refining small details, pixel art, and dynamic audio—burning through countless tokens on <strong>Codex</strong> and <strong>Google AI Studio</strong> ^^
                      </p>
                      <div className="author-tea-quote-box">
                        <span className="quote-tea-icon">☕</span>
                        <em>
                          &ldquo;Any small donation (even just 2,000 – 3,000 VND / a cup of iced tea) will help me fuel tokens to continue crafting more interactive cultural web games. Truly grateful for your companionship!&rdquo;
                        </em>
                      </div>
                    </>
                  )}
                </div>

                <div className="author-clean-sign">
                  <span className="sign-label">— Tác giả:</span>
                  <strong className="sign-name">Vũ Anh Quân</strong>
                  <span className="sign-sub">(Vibe Coding with AI Studio & Codex)</span>
                </div>
              </div>

              {/* CỘT PHẢI: KHỐI 3D CÂY KÍ ỨC & ĐOÀN TÀU DI SẢN (CLICK PHÓNG TO TOÀN MÀN HÌNH) */}
              <div className="author-3d-qr-col">
                <div className="diorama-card-outer">
                  <ThankYouDiorama
                    language={language}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Dismiss Action */}
        <div className="support-modal-footer">
          <button
            type="button"
            className="support-dismiss-button"
            onClick={handleClose}
          >
            <span>🚆</span> {language === "vi" ? "Trở lại chuyến tàu di sản" : "Return to Heritage Journey"}
          </button>
        </div>
      </div>

      {/* FULLSCREEN CINEMATIC DANMAKU WISHES SCREEN (FLYING LEFT TO RIGHT) */}
      {isFloatingWishesOpen && (
        <FloatingWishesScreen
          language={language}
          entries={guestbook}
          onClose={() => setIsFloatingWishesOpen(false)}
          onAddEntry={async (newEntry) => {
            const saved = await createGuestbookEntry(newEntry);
            setGuestbook((current) => [saved, ...current.filter((entry) => entry.id !== saved.id)]);
          }}
          muted={muted ?? false}
          volume={volume ?? 1}
        />
      )}
    </div>
  );
}
