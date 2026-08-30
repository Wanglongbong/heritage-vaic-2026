"use client";

import React, { useState } from "react";
import type { Language } from "@/lib/types";
import {
  type GuestbookEntry,
  type AvatarOption,
  DEFAULT_AVATARS,
  NATIONALITIES,
  SEED_GUESTBOOK,
  getStoredGuestbook,
  saveStoredGuestbook,
  deleteGuestbookEntry,
  deleteMultipleGuestbookEntries,
  resetGuestbookToDefault,
  clearAllGuestbook,
} from "@/lib/guestbook";
import { playClickSfx, playPaperSfx, playSealSfx } from "@/lib/sound-effects";

interface AdminGuestbookModalProps {
  language: Language;
  onClose: () => void;
  muted?: boolean;
  volume?: number;
}

export function AdminGuestbookModal({
  language,
  onClose,
  muted,
  volume,
}: AdminGuestbookModalProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(() => getStoredGuestbook());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Quick form for author to inject verified note
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("Vũ Anh Quân (Tác giả)");
  const [customAvatar, setCustomAvatar] = useState<AvatarOption>(DEFAULT_AVATARS[0]);
  const [customNation, setCustomNation] = useState(NATIONALITIES[0]);
  const [customContent, setCustomContent] = useState("");

  // Filter entries
  const filteredEntries = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.characterName && e.characterName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function notify(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  // Delete single entry
  function handleDeleteSingle(id: string) {
    playPaperSfx({ muted, volume });
    const updated = deleteGuestbookEntry(id);
    setEntries(updated);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    notify(language === "vi" ? "Đã xoá lời chúc thành công." : "Entry deleted successfully.");
  }

  // Reset to default seed entries
  function handleResetDefault() {
    playSealSfx({ muted, volume });
    const updated = resetGuestbookToDefault();
    setEntries(updated);
    setSelectedIds([]);
    notify(
      language === "vi"
        ? "Đã khôi phục về 8 lời chúc mẫu chuẩn ban đầu."
        : "Reset to 8 default heritage wishes."
    );
  }

  // Bulk delete selected
  function handleDeleteSelected() {
    if (selectedIds.length === 0) return;
    playPaperSfx({ muted, volume });
    const updated = deleteMultipleGuestbookEntries(selectedIds);
    setEntries(updated);
    setSelectedIds([]);
    notify(
      language === "vi"
        ? `Đã xoá ${selectedIds.length} lời chúc được chọn.`
        : `Deleted ${selectedIds.length} selected entries.`
    );
  }

  // Clear all
  function handleClearAll() {
    playPaperSfx({ muted, volume });
    const updated = clearAllGuestbook();
    setEntries(updated);
    setSelectedIds([]);
    notify(
      language === "vi"
        ? "Đã dọn sạch toàn bộ sổ lưu bút."
        : "All guestbook entries cleared."
    );
  }

  // Toggle selection
  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredEntries.length && filteredEntries.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEntries.map((e) => e.id));
    }
  }

  // Submit author custom entry
  function handleCreateAuthorEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!customContent.trim()) return;
    playClickSfx({ muted, volume });

    const newEntry: GuestbookEntry = {
      id: "author-" + Date.now(),
      name: customName.trim() || "Vũ Anh Quân",
      character: customAvatar.icon,
      characterName: language === "vi" ? customAvatar.labelVi : customAvatar.labelEn,
      countryCode: customNation.code,
      countryName: language === "vi" ? customNation.nameVi : customNation.nameEn,
      flag: customNation.flag,
      content: customContent.trim(),
      timestamp: language === "vi" ? "Vừa xong (Tác giả)" : "Just now (Author)",
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveStoredGuestbook(updated);
    setCustomContent("");
    setIsAddingCustom(false);
    notify(
      language === "vi"
        ? "Đã thêm lời nhắn tác giả thành công."
        : "Author note added successfully."
    );
  }

  return (
    <div
      className="admin-guestbook-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playClickSfx({ muted, volume });
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="admin-guestbook-window">
        {/* Header */}
        <div className="admin-guestbook-header">
          <div className="admin-header-title-group">
            <div className="admin-badge-icon">🎬</div>
            <div>
              <div className="admin-kicker-row">
                <span className="admin-pill-badge">ADMIN ACCESS</span>
                <span className="admin-author-pill">👑 Vũ Anh Quân</span>
              </div>
              <h3 className="admin-header-title">
                {language === "vi"
                  ? "Quản Trị & Xoá Lời Chúc Sổ Lưu Bút"
                  : "Secret Guestbook & Wishes Manager"}
              </h3>
            </div>
          </div>
          <button
            className="admin-close-btn"
            onClick={() => {
              playClickSfx({ muted, volume });
              onClose();
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="admin-notification-toast">
            <span>✓</span> {notification}
          </div>
        )}

        {/* Stats Strip */}
        <div className="admin-stats-strip">
          <div className="admin-stat-item">
            <small>{language === "vi" ? "TỔNG LỜI CHÚC" : "TOTAL WISHES"}</small>
            <b>{entries.length}</b>
          </div>
          <div className="admin-stat-item">
            <small>{language === "vi" ? "ĐANG HIỂN THỊ" : "MATCHING FILTER"}</small>
            <b>{filteredEntries.length}</b>
          </div>
          <div className="admin-stat-item">
            <small>{language === "vi" ? "LỜI CHÚC MẪU GỐC" : "DEFAULT SEED"}</small>
            <b>{SEED_GUESTBOOK.length}</b>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-search-wrapper">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              className="admin-search-input"
              placeholder={
                language === "vi"
                  ? "Tìm kiếm theo tên hoặc nội dung lời chúc..."
                  : "Search wishes by name or content..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="admin-search-clear"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="admin-action-btns">
            <button
              className="admin-tool-btn reset-btn"
              onClick={handleResetDefault}
              title={
                language === "vi"
                  ? "Khôi phục lại 8 lời chúc di sản mẫu chuẩn"
                  : "Restore default 8 seed wishes"
              }
            >
              ↺ {language === "vi" ? "Khôi phục 8 lời chúc gốc" : "Restore Defaults"}
            </button>

            {selectedIds.length > 0 && (
              <button
                className="admin-tool-btn bulk-delete-btn"
                onClick={handleDeleteSelected}
              >
                🗑️ {language === "vi" ? `Xoá (${selectedIds.length}) mục chọn` : `Delete (${selectedIds.length}) selected`}
              </button>
            )}

            <button
              className="admin-tool-btn add-btn"
              onClick={() => setIsAddingCustom(!isAddingCustom)}
            >
              👑 {language === "vi" ? "Thêm lưu bút Tác giả" : "Add Author Note"}
            </button>

            <button
              className="admin-tool-btn danger-clear-btn"
              onClick={() => {
                if (
                  confirm(
                    language === "vi"
                      ? "Bạn có chắc chắn muốn xoá sạch TOÀN BỘ lời chúc trong sổ lưu bút không?"
                      : "Are you sure you want to clear ALL guestbook entries?"
                  )
                ) {
                  handleClearAll();
                }
              }}
            >
              🧹 {language === "vi" ? "Xoá Hết" : "Clear All"}
            </button>
          </div>
        </div>

        {/* Author Note Form (Expandable) */}
        {isAddingCustom && (
          <form className="admin-author-note-form" onSubmit={handleCreateAuthorEntry}>
            <div className="admin-form-header">
              👑 {language === "vi" ? "Tạo lời lưu bút đại diện Tác giả / Quản trị viên" : "Create Author/Admin Note"}
            </div>
            <div className="admin-form-row">
              <div className="admin-form-col">
                <label>{language === "vi" ? "Tên hiển thị:" : "Display Name:"}</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Vũ Anh Quân"
                />
              </div>
              <div className="admin-form-col-sm">
                <label>{language === "vi" ? "Huy hiệu đại diện:" : "Avatar Icon:"}</label>
                <select
                  className="admin-form-select"
                  value={customAvatar.id}
                  onChange={(e) => {
                    const found = DEFAULT_AVATARS.find((a) => a.id === e.target.value);
                    if (found) setCustomAvatar(found);
                  }}
                >
                  {DEFAULT_AVATARS.map((av) => (
                    <option key={av.id} value={av.id}>
                      {av.icon} {language === "vi" ? av.labelVi : av.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form-col-sm">
                <label>{language === "vi" ? "Quốc tịch / Cờ:" : "Flag:"}</label>
                <select
                  className="admin-form-select"
                  value={customNation.code}
                  onChange={(e) => {
                    const found = NATIONALITIES.find((n) => n.code === e.target.value);
                    if (found) setCustomNation(found);
                  }}
                >
                  {NATIONALITIES.map((n) => (
                    <option key={n.code} value={n.code}>
                      {n.flag} {language === "vi" ? n.nameVi : n.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-form-col">
              <label>{language === "vi" ? "Nội dung lưu bút:" : "Note Content:"}</label>
              <textarea
                className="admin-form-textarea"
                rows={2}
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder={
                  language === "vi"
                    ? "Nhập thông điệp tác giả gửi đến toàn thể hành khách trên chuyến tàu..."
                    : "Enter author message for all passengers..."
                }
              />
            </div>
            <div className="admin-form-footer">
              <button
                type="button"
                className="admin-cancel-btn"
                onClick={() => setIsAddingCustom(false)}
              >
                {language === "vi" ? "Hủy" : "Cancel"}
              </button>
              <button
                type="submit"
                className="admin-submit-btn"
                disabled={!customContent.trim()}
              >
                ✦ {language === "vi" ? "Đăng ngay vào sổ lưu bút" : "Post to Guestbook"}
              </button>
            </div>
          </form>
        )}

        {/* Entries List */}
        <div className="admin-entries-scroll">
          {filteredEntries.length === 0 ? (
            <div className="admin-empty-state">
              <span>📭</span>
              <h4>{language === "vi" ? "Không tìm thấy lời chúc nào" : "No entries found"}</h4>
              <p>
                {language === "vi"
                  ? "Bạn có thể nhấn nút 'Khôi phục 8 lời chúc gốc' ở trên để nạp lại dữ liệu."
                  : "You can click 'Restore Defaults' above to reload initial data."}
              </p>
            </div>
          ) : (
            <div className="admin-entries-grid">
              <div className="admin-select-all-row" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px" }}>
                <input
                  type="checkbox"
                  id="select-all-checkbox"
                  checked={selectedIds.length === filteredEntries.length && filteredEntries.length > 0}
                  onChange={toggleSelectAll}
                  style={{ accentColor: "#f59e0b", width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="select-all-checkbox" style={{ font: "700 12px var(--mono)", color: "rgba(239,229,207,0.8)", cursor: "pointer" }}>
                  {language === "vi" ? `Chọn tất cả (${filteredEntries.length} mục)` : `Select all (${filteredEntries.length} items)`}
                </label>
              </div>

              {filteredEntries.map((entry) => {
                const isSelected = selectedIds.includes(entry.id);
                const isAuthor = entry.id.startsWith("author-") || entry.name.includes("Vũ Anh Quân");
                return (
                  <div
                    key={entry.id}
                    className={`admin-entry-card ${isSelected ? "selected" : ""} ${isAuthor ? "author-note" : ""}`}
                  >
                    <div className="admin-entry-top">
                      <div className="admin-entry-left">
                        <label className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(entry.id)}
                          />
                        </label>
                        <div className="admin-entry-avatar">{entry.character}</div>
                        <div className="admin-entry-meta">
                          <div className="admin-entry-name-row">
                            <span className="admin-entry-name">{entry.name}</span>
                            {entry.flag && (
                              <span className="admin-entry-flag">{entry.flag}</span>
                            )}
                            {isAuthor ? (
                              <span className="admin-author-pill">👑 Tác giả</span>
                            ) : (
                              <span className="admin-badge-user">
                                {language === "vi" ? "HÀNH KHÁCH" : "PASSENGER"}
                              </span>
                            )}
                          </div>
                          <span className="admin-entry-sub">
                            {entry.timestamp} · {entry.characterName} ({entry.countryName})
                          </span>
                        </div>
                      </div>

                      <button
                        className="admin-entry-delete-btn"
                        onClick={() => handleDeleteSingle(entry.id)}
                        title={language === "vi" ? "Xoá lời chúc này" : "Delete this wish"}
                      >
                        🗑️ {language === "vi" ? "Xoá" : "Delete"}
                      </button>
                    </div>

                    <p className="admin-entry-content">“{entry.content}”</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="admin-footer-bar">
          <span className="admin-footer-tip">
            💡 {language === "vi"
              ? "Mẹo: Mọi thay đổi xóa hoặc khôi phục sẽ cập nhật tức thì trên toàn bộ trang web và màn chiếu phim."
              : "Tip: All deletions and restores apply instantly to the website and movie marquee."}
          </span>
          <button
            className="admin-done-btn"
            onClick={() => {
              playClickSfx({ muted, volume });
              onClose();
            }}
          >
            ✓ {language === "vi" ? "Hoàn tất & Đóng" : "Done & Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
