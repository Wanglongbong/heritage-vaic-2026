"use client";

import Image from "next/image";
import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Language } from "@/lib/types";

const SUBJECT_FRAMES = Array.from(
  { length: 12 },
  (_, index) => `/thanks-diorama/subject-${String(index).padStart(2, "0")}.webp?v=clean-v2`,
);

const text = {
  vi: {
    kicker: "GA CUỐI · LỜI CẢM ƠN",
    title: "Một chuyến tàu khép lại. Ký ức vẫn đi tiếp.",
    wish: "Cảm ơn bạn đã lên tàu. Chúc hành trình tiếp theo của bạn luôn đầy những điều đáng nhớ.",
    support: "Nếu hành trình này chạm đến bạn, một sự tiếp sức nhỏ sẽ giúp chuyến tàu tiếp tục lăn bánh.",
    guide: "Kéo để xoay · Nhìn lên để mở QR · Nhìn xuống để nhận lời cảm ơn",
    rotate: "Kéo ngang để xoay sa bàn, kéo lên để xem mã QR, kéo xuống để xem lời cảm ơn",
    top: "Mặt mã QR",
    centre: "Sa bàn",
    bottom: "Mặt cảm ơn",
    qrHint: "Chạm mã để phóng lớn",
    qrDialog: "Mã QR tiếp sức cho Tàu Di Sản Việt Nam",
    qrPrivacy: "Mã QR được hiển thị nguyên vẹn để quét. Không kèm tên, số tài khoản hoặc logo ngân hàng.",
    save: "Lưu mã QR ↓",
    close: "Đóng",
    museum: "Mở Phòng trưng bày",
  },
  en: {
    kicker: "FINAL STOP · A THANK-YOU",
    title: "One journey ends. Living memory travels on.",
    wish: "Thank you for boarding. May your next journey be filled with moments worth remembering.",
    support: "If this journey moved you, a small gesture of support will help the heritage train keep rolling.",
    guide: "Drag to turn · Look up for the QR · Look down for a thank-you",
    rotate: "Drag sideways to turn the diorama, up to see the QR code, or down to see the thank-you",
    top: "QR face",
    centre: "Diorama",
    bottom: "Thank-you face",
    qrHint: "Touch the code to enlarge",
    qrDialog: "Support QR for the Viet Nam Heritage Train",
    qrPrivacy: "The scannable code is shown without a bank name, account number or bank logo.",
    save: "Save QR code ↓",
    close: "Close",
    museum: "Open the gallery",
  },
} as const;

type Pose = { yaw: number; pitch: number };

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

export function ThankYouDiorama({ language }: { language: Language }) {
  const ui = text[language];
  const [pose, setPose] = useState<Pose>({ yaw: 0, pitch: 0 });
  const [qrOpen, setQrOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, moved: false, x: 0, y: 0, yaw: 0, pitch: 0 });
  const resumeAtRef = useRef(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const frameIndex = Math.round(normalizeDegrees(pose.yaw) / 30) % SUBJECT_FRAMES.length;
  const mode = pose.pitch >= 55 ? "top" : pose.pitch <= -55 ? "bottom" : "diorama";
  const topProgress = Math.max(0, Math.min(1, pose.pitch / 64));
  const bottomProgress = Math.max(0, Math.min(1, -pose.pitch / 64));
  const sceneStyle = {
    "--floor-tilt": `${60 * (1 - topProgress)}deg`,
    "--floor-y": `${18 * (1 - topProgress)}%`,
    "--floor-scale": String(0.75 + topProgress * 0.12),
    "--floor-yaw": `${frameIndex * 30}deg`,
    "--scene-opacity": String(1 - bottomProgress),
    "--subject-opacity": String(Math.max(0, 1 - topProgress * 1.08 - bottomProgress)),
    "--subject-scale": String(0.96 - topProgress * 0.62),
    "--subject-y": `${3 - topProgress * 10}%`,
    "--gold-bloom-opacity": String(topProgress * 0.34),
    "--gold-bloom-scale": String(0.3 + topProgress * 0.9),
    "--shadow-opacity": String((1 - bottomProgress) * (1 - topProgress)),
  } as CSSProperties;

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (reducedMotion || qrOpen) return;
    const timer = window.setInterval(() => {
      if (dragRef.current.active || performance.now() < resumeAtRef.current) return;
      setPose((current) => current.pitch === 0 ? { ...current, yaw: current.yaw + 0.8 } : current);
    }, 80);
    return () => window.clearInterval(timer);
  }, [qrOpen, reducedMotion]);

  useEffect(() => {
    if (!qrOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQrOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [qrOpen]);

  useEffect(() => {
    if (!qrOpen && returnFocusRef.current) {
      returnFocusRef.current.focus();
      returnFocusRef.current = null;
    }
  }, [qrOpen]);

  function updatePose(next: Pose) {
    setPose({ yaw: next.yaw, pitch: Math.max(-72, Math.min(72, next.pitch)) });
    resumeAtRef.current = performance.now() + 2600;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button,a")) return;
    dragRef.current = { active: true, moved: false, x: event.clientX, y: event.clientY, yaw: pose.yaw, pitch: pose.pitch };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragRef.current.moved = true;
    updatePose({
      yaw: dragRef.current.yaw + dx * 0.48,
      pitch: dragRef.current.pitch - dy * 0.34,
    });
  }

  function finishPointer(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    const wasTap = !dragRef.current.moved;
    dragRef.current.active = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setPose((current) => ({
      yaw: current.yaw,
      pitch: current.pitch > 44 ? 64 : current.pitch < -44 ? -64 : 0,
    }));
    resumeAtRef.current = performance.now() + 2600;
    if (wasTap && mode === "top") {
      returnFocusRef.current = event.currentTarget;
      setQrOpen(true);
    }
  }

  function setFace(pitch: number) {
    updatePose({ yaw: pose.yaw, pitch });
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") { event.preventDefault(); updatePose({ yaw: pose.yaw - 30, pitch: pose.pitch }); }
    if (event.key === "ArrowRight") { event.preventDefault(); updatePose({ yaw: pose.yaw + 30, pitch: pose.pitch }); }
    if (event.key === "ArrowUp") { event.preventDefault(); setFace(64); }
    if (event.key === "ArrowDown") { event.preventDefault(); setFace(-64); }
    if ((event.key === "Enter" || event.key === " ") && mode === "top") { event.preventDefault(); setQrOpen(true); }
  }

  return <>
    <section id="thank-you-stop" className="thank-you-stop" aria-labelledby="thank-you-title">
      <Image className="thank-you-crane thank-you-crane-left" src="/motifs/crane-stamp-gold.png" alt="" width={180} height={180} unoptimized aria-hidden="true" />
      <Image className="thank-you-crane thank-you-crane-right" src="/motifs/crane-stamp-gold.png" alt="" width={140} height={140} unoptimized aria-hidden="true" />
      <div className="thank-you-copy">
        <span>{ui.kicker}</span>
        <h2 id="thank-you-title">{ui.title}</h2>
        <p>{ui.wish}</p>
        <blockquote>{ui.support}</blockquote>
        <small>{ui.guide}</small>
      </div>

      <div className="diorama-wrap">
        <div
          className={`diorama-stage ${dragging ? "is-dragging" : ""}`}
          data-mode={mode}
          style={sceneStyle}
          role="application"
          tabIndex={0}
          aria-label={ui.rotate}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
        >
          <span className="diorama-orbit diorama-orbit-a" aria-hidden="true" />
          <span className="diorama-orbit diorama-orbit-b" aria-hidden="true" />
          <div className="diorama-qr-floor" aria-hidden="true">
            <Image src="/thanks-diorama/bank-qr-gold.png" alt="" fill unoptimized sizes="(max-width: 720px) 78vw, 520px" draggable={false} />
            <span>{ui.qrHint}</span>
          </div>
          <div className="diorama-subject" aria-hidden={mode === "bottom"}>
            {SUBJECT_FRAMES.map((source, index) => <Image
              key={source}
              className={index === frameIndex ? "is-active" : ""}
              src={source}
              alt=""
              fill
              unoptimized
              draggable={false}
              sizes="(max-width: 720px) 92vw, 650px"
              aria-hidden="true"
            />)}
          </div>
          <span className="diorama-gold-bloom" aria-hidden="true" />
          <div className="diorama-thanks-card" aria-hidden={mode !== "bottom"}>
            <span>THANKS</span><strong>FOR PLAYING</strong><small>{language === "vi" ? "CẢM ƠN BẠN ĐÃ LÊN TÀU" : "THANK YOU FOR BOARDING"}</small>
          </div>
          <span className="diorama-floor-shadow" aria-hidden="true" />
        </div>

        <nav className="diorama-controls" aria-label={language === "vi" ? "Chọn góc nhìn sa bàn" : "Choose a diorama view"}>
          <button type="button" className={mode === "top" ? "active" : ""} onClick={() => setFace(64)} aria-pressed={mode === "top"}>↑ <span>{ui.top}</span></button>
          <button type="button" className={mode === "diorama" ? "active" : ""} onClick={() => setFace(0)} aria-pressed={mode === "diorama"}>◇ <span>{ui.centre}</span></button>
          <button type="button" className={mode === "bottom" ? "active" : ""} onClick={() => setFace(-64)} aria-pressed={mode === "bottom"}>↓ <span>{ui.bottom}</span></button>
        </nav>
      </div>

      <a className="thank-you-museum-link" href="#memory-map"><span>{ui.museum}</span><b>↓</b></a>
    </section>

    {qrOpen && <div className="qr-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setQrOpen(false)}>
      <section className="qr-dialog" role="dialog" aria-modal="true" aria-labelledby="qr-dialog-title" aria-describedby="qr-dialog-note">
        <button ref={closeButtonRef} type="button" className="qr-dialog-close" onClick={() => setQrOpen(false)} aria-label={ui.close}>×</button>
        <span>GA CUỐI · QR</span>
        <h2 id="qr-dialog-title">{ui.qrDialog}</h2>
        <div className="qr-dialog-image"><Image src="/thanks-diorama/bank-qr-gold.png" alt={ui.qrDialog} fill unoptimized priority sizes="(max-width: 720px) 86vw, 560px" /></div>
        <p id="qr-dialog-note">{ui.qrPrivacy}</p>
        <a href="/thanks-diorama/bank-qr.png" download="tau-di-san-viet-nam-qr.png">{ui.save}</a>
      </section>
    </div>}
  </>;
}
