import React, { useState, useRef, useEffect } from "react";
import type { Language } from "@/lib/types";
import { playClickSfx } from "@/lib/sound-effects";

interface Interactive3DQRProps {
  language: Language;
  muted?: boolean;
  volume?: number;
}

type CameraView = "diagonal" | "topdown" | "thanks";

export function Interactive3DQR({ language, muted, volume }: Interactive3DQRProps) {
  // Camera view: 'diagonal' (Góc nhìn chéo 3D) | 'topdown' (Góc nhìn trên xuống / QR Cây Kí Ức) | 'thanks' (Lời cảm ơn)
  const [cameraView, setCameraView] = useState<CameraView>("diagonal");

  // Rotation angles:
  // - Diagonal: rotX = -30deg, rotY = 35deg
  // - Top-down: rotX = 0deg, rotY = 0deg
  const [rotX, setRotX] = useState<number>(-30);
  const [rotY, setRotY] = useState<number>(35);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [qrColorTheme, setQrColorTheme] = useState<"heritage" | "original">("heritage");
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  const bankNumberDisplay = "513244";
  const bankNumberRaw = "513244";
  const accountHolder = "VŨ ANH QUÂN";

  const dragStartRef = useRef<{ x: number; y: number; startRotX: number; startRotY: number }>({
    x: 0,
    y: 0,
    startRotX: -30,
    startRotY: 35,
  });

  const animFrameRef = useRef<number | null>(null);

  // Smooth gentle auto-orbit loop for Diagonal View (like tree.icqr.com)
  useEffect(() => {
    if (!isAutoOrbit || isDragging || cameraView !== "diagonal") return;

    let lastTime = performance.now();
    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setRotY((prev) => (prev + delta * 9) % 360);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoOrbit, isDragging, cameraView]);

  // Pointer drag handler for manual diagonal angle adjustment
  const handlePointerDown = (e: React.PointerEvent) => {
    if (cameraView !== "diagonal") return;
    setIsDragging(true);
    setIsAutoOrbit(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRotX: rotX,
      startRotY: rotY,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || cameraView !== "diagonal") return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const newRotY = (dragStartRef.current.startRotY + deltaX * 0.6) % 360;
    const newRotX = Math.max(-55, Math.min(-15, dragStartRef.current.startRotX - deltaY * 0.4));

    setRotX(newRotX);
    setRotY(newRotY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Switch camera views
  const switchCamera = (view: CameraView) => {
    playClickSfx({ muted, volume });
    setCameraView(view);
    if (view === "diagonal") {
      setRotX(-30);
      setRotY(35);
      setIsAutoOrbit(true);
    } else {
      setRotX(0);
      setRotY(0);
      setIsAutoOrbit(false);
    }
  };

  const toggleCameraCycle = () => {
    playClickSfx({ muted, volume });
    if (cameraView === "diagonal") {
      switchCamera("topdown");
    } else if (cameraView === "topdown") {
      switchCamera("thanks");
    } else {
      switchCamera("diagonal");
    }
  };

  function copyToClipboard(text: string) {
    playClickSfx({ muted, volume });
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2200);
    }
  }

  const toggleAutoOrbit = () => {
    playClickSfx({ muted, volume });
    setIsAutoOrbit((prev) => !prev);
  };

  return (
    <div className="diorama-3d-wrapper" id="creator-3d-interactive-zone">
      {/* 3D Viewport / Floating Stage */}
      <div
        className={`diorama-3d-stage view-${cameraView}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ cursor: cameraView === "diagonal" ? (isDragging ? "grabbing" : "grab") : "default" }}
        role="region"
        aria-label="Cây Kí Ức & Đoàn Tàu Di Sản 3D"
      >
        {/* Floating Ambient Spirit Petals & Gold Sparks */}
        <div className="diorama-particles" aria-hidden="true">
          <span className="particle p1">✨</span>
          <span className="particle p2">🏮</span>
          <span className="particle p3">🍂</span>
          <span className="particle p4">✨</span>
          <span className="particle p5">🏮</span>
        </div>

        {/* Top Hint Banner with 1-click angle morph trigger */}
        <div className="diorama-3d-hint">
          <span onClick={toggleCameraCycle} role="button" tabIndex={0}>
            {cameraView === "diagonal" && (language === "vi" ? "📐 Góc 3D Cây Kí Ức · Chạm chuyển sang Góc nhìn Mã QR ➔" : "📐 3D Memory Tree · Tap for QR Code View ➔")}
            {cameraView === "topdown" && (language === "vi" ? "👁️ Góc nhìn Trên (QR Code) · Chạm xem Lời cảm ơn ➔" : "👁️ Top-down QR View · Tap for Thanks ➔")}
            {cameraView === "thanks" && (language === "vi" ? "❤️ Lời cảm ơn · Chạm về Cây Kí Ức 3D ➔" : "❤️ Thanks · Tap for 3D Tree ➔")}
          </span>
        </div>

        {/* -------------------------------------------------------------
            MODE 1: 3D ISOMETRIC DIORAMA (CÂY KÍ ỨC VÀNG ÓNG & ĐOÀN TÀU ĐỎ DI SẢN)
            Inspired by image.png and tree.icqr.com
            ------------------------------------------------------------- */}
        {cameraView === "diagonal" && (
          <div
            className="tree-diorama-root"
            style={{
              transform: `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            }}
          >
            {/* 1. FLOATING ISOMETRIC GRID BASE WITH 3 QR CORNER FINDER PATTERNS */}
            <div className="tree-island-platform-isometric">
              {/* Isometric grid tile pattern */}
              <div className="isometric-grid-surface">
                <div className="grid-sub-line g1" />
                <div className="grid-sub-line g2" />
                <div className="grid-sub-line g3" />
                <div className="grid-sub-line g4" />
                <div className="grid-sub-line g5" />
              </div>

              {/* 3 QR FINDER PATTERN CORNERS (Góc định vị mã QR ở các góc sàn) */}
              <div className="qr-finder-corner corner-nw" title="Mã định vị QR góc trên trái">
                <div className="qr-eye-outer">
                  <div className="qr-eye-mid">
                    <div className="qr-eye-dot" />
                  </div>
                </div>
              </div>

              <div className="qr-finder-corner corner-ne" title="Mã định vị QR góc trên phải">
                <div className="qr-eye-outer">
                  <div className="qr-eye-mid">
                    <div className="qr-eye-dot" />
                  </div>
                </div>
              </div>

              <div className="qr-finder-corner corner-sw" title="Mã định vị QR góc dưới trái">
                <div className="qr-eye-outer">
                  <div className="qr-eye-mid">
                    <div className="qr-eye-dot" />
                  </div>
                </div>
              </div>

              {/* QR Alignment Marker at bottom-right */}
              <div className="qr-align-corner corner-se">
                <div className="qr-align-box">
                  <div className="qr-align-dot" />
                </div>
              </div>

              {/* Base Isometric Island Depth Rim */}
              <div className="island-base-depth" />

              {/* 2. CÂY KÍ ỨC VÀNG ÓNG (GOLDEN-AMBER MEMORY TREE) */}
              <div className="golden-memory-tree-model">
                {/* Thick ancient wood trunk & roots */}
                <div className="tree-trunk-core">
                  <div className="trunk-bark-texture" />
                  <div className="trunk-root r-front" />
                  <div className="trunk-root r-left" />
                  <div className="trunk-root r-right" />
                  <div className="trunk-root r-back" />
                </div>

                {/* Golden Foliage Canopy (Tán lá vàng óng ánh đung đưa) */}
                <div className="golden-canopy-crown">
                  {/* Layer 1: Base Canopy Tier */}
                  <div className="foliage-tier tier-base">
                    <span className="foliage-blob b1" />
                    <span className="foliage-blob b2" />
                    <span className="foliage-blob b3" />
                    <span className="foliage-blob b4" />
                    <span className="foliage-blob b5" />
                  </div>

                  {/* Layer 2: Mid Lush Golden Tier */}
                  <div className="foliage-tier tier-middle">
                    <span className="foliage-blob m1" />
                    <span className="foliage-blob m2" />
                    <span className="foliage-blob m3" />
                    <span className="foliage-blob m4" />
                  </div>

                  {/* Layer 3: Top Glowing Apex */}
                  <div className="foliage-tier tier-top">
                    <span className="foliage-blob t1" />
                    <span className="foliage-blob t2" />
                    <span className="golden-aura-glow" />
                  </div>

                  {/* Glowing Hanging Lanterns (Lồng đèn vàng/đỏ treo đung đưa) */}
                  <div className="tree-lantern lantern-left">
                    <div className="lantern-cord" />
                    <div className="lantern-body">🏮</div>
                    <div className="lantern-glow" />
                  </div>
                  <div className="tree-lantern lantern-front-left">
                    <div className="lantern-cord" />
                    <div className="lantern-body">🏮</div>
                    <div className="lantern-glow" />
                  </div>
                  <div className="tree-lantern lantern-front-right">
                    <div className="lantern-cord" />
                    <div className="lantern-body">🏮</div>
                    <div className="lantern-glow" />
                  </div>
                  <div className="tree-lantern lantern-right">
                    <div className="lantern-cord" />
                    <div className="lantern-body">🏮</div>
                    <div className="lantern-glow" />
                  </div>
                </div>
              </div>

              {/* 3. ĐOÀN TÀU DI SẢN ĐỎ - VÀNG UỐN QUANH PHÍA TRƯỚC CÂY */}
              <div className="curved-heritage-train-cluster">
                {/* Carriage 2 (Toa sau) */}
                <div className="train-coach coach-tail">
                  <div className="coach-roof" />
                  <div className="coach-body">
                    <div className="coach-window w1" />
                    <div className="coach-window w2" />
                  </div>
                  <div className="coach-gold-trim" />
                </div>

                {/* Carriage 1 (Toa giữa) */}
                <div className="train-coach coach-mid">
                  <div className="coach-roof" />
                  <div className="coach-body">
                    <div className="coach-window w1" />
                    <div className="coach-window w2" />
                    <div className="coach-window w3" />
                  </div>
                  <div className="coach-gold-trim" />
                  <span className="coach-badge-sign">DI SẢN</span>
                </div>

                {/* Locomotive Engine (Đầu máy xe lửa hơi nước) */}
                <div className="train-locomotive">
                  {/* Boiler & Front Headlight */}
                  <div className="loco-boiler">
                    <div className="loco-headlight">💡</div>
                    <div className="loco-cowcatcher" />
                    <div className="loco-smokestack">
                      <span className="loco-steam s1">☁️</span>
                      <span className="loco-steam s2">☁️</span>
                    </div>
                  </div>
                  {/* Engineer Cab */}
                  <div className="loco-cab">
                    <div className="cab-window" />
                    <span className="cab-flag">🇻🇳</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            MODE 2: TOP-DOWN VIEW (GÓC NHÌN TRÊN XUỐNG / MÃ QR NGHỆ THUẬT ĐỒNG MÀU)
            Harmonized with the Golden Tree & Crimson Train Color Palette
            ------------------------------------------------------------- */}
        {cameraView === "topdown" && (
          <div className="tree-topdown-qr-view animate-morph-in">
            <div className="topdown-qr-frame">
              {/* Decorative Heritage Corner Emblems */}
              <div className="qr-tree-corner corner-tl">🏮</div>
              <div className="qr-tree-corner corner-tr">🏮</div>
              <div className="qr-tree-corner corner-bl">🏮</div>
              <div className="qr-tree-corner corner-br">🏮</div>

              {/* Header */}
              <div className="topdown-qr-header">
                <span className="header-badge">🌳 CÂY KÍ ỨC · VIETQR DI SẢN</span>
                <small className="header-sub">Quét mã MB Bank ủng hộ tác giả & dự án</small>
              </div>

              {/* Themed Scannable VietQR Canvas Container */}
              <div className={`topdown-qr-canvas theme-${qrColorTheme}`} onClick={() => setIsZoomModalOpen(true)} style={{ cursor: "zoom-in" }}>
                <img
                  src={qrColorTheme === "heritage" ? "/thanks-diorama/bank-qr-gold.png" : "/thanks-diorama/bank-qr.png"}
                  alt="VietQR MB Bank - 513244 - VU ANH QUAN"
                  className={`topdown-qr-img qr-filter-${qrColorTheme}`}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.endsWith("/vietqr-mb-full.png")) {
                      target.src = "/vietqr-mb-full.png";
                    }
                  }}
                />
              </div>

              {/* Bottom MB Bank Credentials */}
              <div className="topdown-qr-footer">
                <span className="footer-tag">MB BANK · STK: <strong>513244</strong></span>
                <span className="footer-name">VŨ ANH QUÂN</span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            MODE 3: HEARTFELT "THANKS" ENGRAVED GOLDEN PLAQUE
            ------------------------------------------------------------- */}
        {cameraView === "thanks" && (
          <div className="diorama-thanks-plaque animate-morph-in">
            <div className="thanks-plaque-border">
              <span className="frame-corner f-tl" />
              <span className="frame-corner f-tr" />
              <span className="frame-corner f-bl" />
              <span className="frame-corner f-br" />

              <span className="thanks-stamp-icon">🏮</span>
              <h4 className="thanks-title">THANKS!</h4>
              <p className="thanks-desc">
                {language === "vi"
                  ? "Cảm ơn bạn rất nhiều vì đã ghé thăm Cây Kí Ức và đồng hành cùng Chuyến Tàu Di Sản ❤️"
                  : "Thank you wholeheartedly for visiting the Memory Tree & riding the Heritage Express ❤️"}
              </p>
              <div className="thanks-author-sign">— Vũ Anh Quân —</div>
              <small className="thanks-sub-note">
                {language === "vi"
                  ? "Chúc bạn một ngày bình an và ngập tràn cảm hứng văn hóa!"
                  : "Wishing you a peaceful and inspiring day!"}
              </small>
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          BOTTOM CONTROLS & CAMERA ANGLE SELECTORS
          ------------------------------------------------------------- */}
      <div className="diorama-bottom-bar">
        {/* Main Camera Switcher (Góc nhìn chéo 3D vs Góc nhìn trên) */}
        <div className="tree-camera-selectors">
          <button
            type="button"
            className={`camera-btn ${cameraView === "diagonal" ? "active" : ""}`}
            onClick={() => switchCamera("diagonal")}
            title={language === "vi" ? "Góc 3D: Cây Kí Ức Vàng & Đoàn Tàu Di Sản" : "3D Diagonal View"}
          >
            <span>📐</span> {language === "vi" ? "Góc nhìn 3D" : "3D View"}
          </button>
          <button
            type="button"
            className={`camera-btn ${cameraView === "topdown" ? "active" : ""}`}
            onClick={() => switchCamera("topdown")}
            title={language === "vi" ? "Góc nhìn trên xuống: Mã QR VietQR" : "Top-down QR View"}
          >
            <span>👁️</span> {language === "vi" ? "Mã QR (Góc trên)" : "Top-down QR"}
          </button>
          <button
            type="button"
            className={`camera-btn ${cameraView === "thanks" ? "active" : ""}`}
            onClick={() => switchCamera("thanks")}
            title={language === "vi" ? "Lời cảm ơn từ tác giả" : "Thank you note"}
          >
            <span>❤️</span> {language === "vi" ? "Cảm ơn" : "Thanks"}
          </button>
          {cameraView === "diagonal" && (
            <button
              type="button"
              className={`camera-btn action-btn ${isAutoOrbit ? "active" : ""}`}
              onClick={toggleAutoOrbit}
              title={language === "vi" ? "Bật/Tắt tự xoay góc chéo" : "Toggle auto orbit"}
            >
              <span>🔄</span> {isAutoOrbit ? (language === "vi" ? "Đang xoay" : "Orbiting") : (language === "vi" ? "Tự xoay" : "Auto Orbit")}
            </button>
          )}
          {cameraView === "topdown" && (
            <button
              type="button"
              className="camera-btn action-btn"
              onClick={() => {
                playClickSfx({ muted, volume });
                setQrColorTheme((prev) => (prev === "heritage" ? "original" : "heritage"));
              }}
              title={language === "vi" ? "Đổi tông màu mã QR: Vàng Di Sản / Gốc" : "Toggle QR color theme"}
            >
              <span>🎨</span> {qrColorTheme === "heritage" ? (language === "vi" ? "Tông Vàng Di Sản" : "Heritage Gold") : (language === "vi" ? "Tông Gốc MB" : "Original")}
            </button>
          )}
          <button
            type="button"
            className="camera-btn action-btn"
            onClick={() => {
              playClickSfx({ muted, volume });
              setIsZoomModalOpen(true);
            }}
            title={language === "vi" ? "Phóng to hình 3D ra trước màn hình" : "Zoom 3D image to front"}
          >
            <span>🔍</span> {language === "vi" ? "Phóng to" : "Zoom"}
          </button>
        </div>

        {/* MB Bank 1-Click Copy Chip */}
        <div className="diorama-bank-chip">
          <div className="bank-chip-info">
            <span className="bank-chip-brand">MB BANK</span>
            <span className="bank-chip-name">{accountHolder}</span>
            <code className="bank-chip-number">{bankNumberDisplay}</code>
          </div>
          <button
            type="button"
            className={`bank-chip-copy-btn ${copiedAccount ? "copied" : ""}`}
            onClick={() => copyToClipboard(bankNumberRaw)}
            title={language === "vi" ? "Sao chép số tài khoản" : "Copy account number"}
          >
            {copiedAccount ? "✓ Đã chép" : "📋 Sao chép"}
          </button>
        </div>
      </div>

      {/* LIGHTBOX ZOOM MODAL */}
      {isZoomModalOpen && (
        <div
          className="memory-tree-lightbox-backdrop animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Hình 3D Phóng To"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsZoomModalOpen(false);
          }}
        >
          <div className="memory-tree-lightbox-card">
            <div className="lightbox-header">
              <div className="lightbox-title-group">
                <span className="lightbox-icon">🌳</span>
                <div>
                  <h3>{language === "vi" ? "MÃ QR CÂY KÍ ỨC & TÀU DI SẢN 3D" : "3D MEMORY TREE & QR ENLARGED"}</h3>
                  <p>{language === "vi" ? "Quét mã chuyển khoản MB Bank ủng hộ tác giả Vũ Anh Quân" : "Scan MB Bank QR to support author Vu Anh Quan"}</p>
                </div>
              </div>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setIsZoomModalOpen(false)}
                aria-label={language === "vi" ? "Đóng phóng to" : "Close enlarged view"}
              >
                ✕
              </button>
            </div>

            <div className="lightbox-3d-stage-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "340px", padding: "16px" }}>
              <div className={`topdown-qr-canvas theme-${qrColorTheme}`} style={{ width: "min(380px, 85vw)", height: "auto", aspectRatio: "1/1", borderRadius: "12px", border: "2px solid rgba(214,173,103,0.5)", overflow: "hidden", background: "#0b0f0c", boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>
                <img
                  src={qrColorTheme === "heritage" ? "/thanks-diorama/bank-qr-gold.png" : "/thanks-diorama/bank-qr.png"}
                  alt="VietQR MB Bank - 513244 - VU ANH QUAN"
                  className={`topdown-qr-img qr-filter-${qrColorTheme}`}
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                />
              </div>
            </div>

            <div className="lightbox-footer">
              <div className="lightbox-bank-info">
                <span className="bank-logo">🏛️ MB BANK</span>
                <span className="bank-account">STK: <strong>513244</strong></span>
                <span className="bank-name">VŨ ANH QUÂN</span>
                <button
                  type="button"
                  className="bank-copy-btn"
                  onClick={() => copyToClipboard(bankNumberRaw)}
                >
                  {copiedAccount ? "✓ Đã sao chép!" : "📋 Sao chép STK"}
                </button>
              </div>
              <div className="lightbox-hints">
                <button
                  type="button"
                  className="lightbox-view-btn"
                  onClick={() => setQrColorTheme((prev) => (prev === "heritage" ? "original" : "heritage"))}
                >
                  {qrColorTheme === "heritage" ? "🎨 Tông Gốc MB" : "🎨 Tông Vàng Di Sản"}
                </button>
                <button
                  type="button"
                  className="lightbox-dismiss-btn"
                  onClick={() => setIsZoomModalOpen(false)}
                >
                  {language === "vi" ? "Thu nhỏ lại" : "Close View"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
