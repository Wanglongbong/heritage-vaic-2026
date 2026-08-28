"use client";

import Image from "next/image";
import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Language } from "@/lib/types";

const SUBJECT_FRAMES = Array.from(
  { length: 12 },
  (_, index) => `/thanks-diorama/subject-${String(index).padStart(2, "0")}.webp?v=clean-v3`,
);

const text = {
  vi: {
    kicker: "GA CUỐI · CÂY KÝ ỨC",
    title: "Một mặt sàn. Hai góc nhìn.",
    guide: "Kéo ngang để xoay · Kéo lên để nhìn dọc trục Oy · Chạm QR để mở",
    rotate: "Kéo ngang để xoay sa bàn hoặc kéo lên để nhìn thẳng xuống mặt sàn QR",
    top: "Nhìn từ trên",
    centre: "Xoay 360°",
    qrHint: "Chạm mã để phóng lớn",
    qrDialog: "Mã QR tiếp sức cho Tàu Di Sản Việt Nam",
    qrPrivacy: "Mã QR màu vàng được giữ nguyên dữ liệu để quét và không kèm thông tin tài khoản bằng chữ.",
    save: "Lưu mã QR ↓",
    close: "Đóng",
    museum: "Mở Phòng trưng bày",
  },
  en: {
    kicker: "FINAL STOP · MEMORY TREE",
    title: "One floor. Two perspectives.",
    guide: "Drag sideways to turn · Drag up for the Y-axis view · Touch the QR to open",
    rotate: "Drag sideways to turn the diorama or drag upward for a top-down view of the QR floor",
    top: "Top view",
    centre: "Turn 360°",
    qrHint: "Touch the code to enlarge",
    qrDialog: "Support QR for the Viet Nam Heritage Train",
    qrPrivacy: "The gold QR preserves the original scannable data and displays no written account details.",
    save: "Save QR code ↓",
    close: "Close",
    museum: "Open the gallery",
  },
} as const;

type Pose = { yaw: number; pitch: number };

type DragState = {
  active: boolean;
  moved: boolean;
  startedTopLocked: boolean;
  x: number;
  y: number;
  yaw: number;
  pitch: number;
};

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

export function ThankYouDiorama({ language }: { language: Language }) {
  const ui = text[language];
  const [pose, setPose] = useState<Pose>({ yaw: 0, pitch: 0 });
  const [qrOpen, setQrOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<DragState>({ active: false, moved: false, startedTopLocked: false, x: 0, y: 0, yaw: 0, pitch: 0 });
  const resumeAtRef = useRef(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const frameIndex = Math.round(normalizeDegrees(pose.yaw) / 30) % SUBJECT_FRAMES.length;
  const topViewLocked = pose.pitch === 64 && (!dragging || (dragRef.current.startedTopLocked && !dragRef.current.moved));
  const mode = topViewLocked ? "top" : "diorama";
  const topProgress = clamp(pose.pitch / 64);
  const projectionProgress = clamp((topProgress - 0.18) / 0.5);
  const dissolveProgress = clamp((topProgress - 0.7) / 0.3);
  const sceneStyle = {
    "--floor-tilt": `${62 * (1 - topProgress)}deg`,
    "--floor-y": `${19 * (1 - topProgress)}%`,
    "--floor-scale": String(0.75 + topProgress * 0.13),
    "--floor-yaw": `${frameIndex * 30}deg`,
    "--subject-opacity": String(1 - projectionProgress),
    "--subject-scale": String(0.96 - projectionProgress * 0.18),
    "--subject-y": `${3 - projectionProgress * 7}%`,
    "--projection-opacity": String(projectionProgress * (1 - dissolveProgress)),
    "--projection-scale": String(0.9 + projectionProgress * 0.1),
    "--gold-bloom-opacity": String(clamp((topProgress - 0.52) / 0.48) * 0.28),
    "--shadow-opacity": String(1 - topProgress),
  } as CSSProperties;

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (reducedMotion || qrOpen) return;
    const timer = window.setInterval(() => {
      if (dragRef.current.active || performance.now() < resumeAtRef.current) return;
      setPose((current) => current.pitch === 0 ? { ...current, yaw: current.yaw + 1.6 } : current);
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
    setPose({ yaw: next.yaw, pitch: clamp(next.pitch, 0, 68) });
    resumeAtRef.current = performance.now() + 2600;
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button,a")) return;
    dragRef.current = {
      active: true,
      moved: false,
      startedTopLocked: topViewLocked,
      x: event.clientX,
      y: event.clientY,
      yaw: pose.yaw,
      pitch: pose.pitch,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragRef.current.moved = true;
    updatePose({ yaw: dragRef.current.yaw + dx * 0.48, pitch: dragRef.current.pitch - dy * 0.34 });
  }

  function finishPointer(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return;
    const wasTap = !dragRef.current.moved;
    dragRef.current.active = false;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setPose((current) => ({ yaw: current.yaw, pitch: current.pitch > 44 ? 64 : 0 }));
    resumeAtRef.current = performance.now() + 2600;
    if (wasTap && dragRef.current.startedTopLocked) {
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
    if (event.key === "ArrowDown") { event.preventDefault(); setFace(0); }
    if ((event.key === "Enter" || event.key === " ") && mode === "top") { event.preventDefault(); setQrOpen(true); }
  }

  return <>
    <section id="thank-you-stop" className="thank-you-stop final-qr-stop" aria-labelledby="final-qr-title">
      <Image className="thank-you-crane thank-you-crane-left" src="/motifs/crane-stamp-gold.png" alt="" width={180} height={180} unoptimized aria-hidden="true" />
      <Image className="thank-you-crane thank-you-crane-right" src="/motifs/crane-stamp-gold.png" alt="" width={140} height={140} unoptimized aria-hidden="true" />
      <header className="final-qr-heading">
        <span>{ui.kicker}</span>
        <h2 id="final-qr-title">{ui.title}</h2>
        <small>{ui.guide}</small>
      </header>

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
            <div className="diorama-floor-surface" />
            {topViewLocked && <div className="diorama-qr-reveal">
              <Image src="/thanks-diorama/bank-qr-tree-pixel.png?v=oy-lock-v2" alt="" fill unoptimized priority sizes="(max-width: 720px) 78vw, 520px" draggable={false} />
            </div>}
            <div className="diorama-top-projection">
              <Image src="/thanks-diorama/subject-top.webp?v=top-v1" alt="" fill unoptimized sizes="(max-width: 720px) 62vw, 420px" draggable={false} />
            </div>
            <span>{ui.qrHint}</span>
          </div>
          <div className="diorama-subject" aria-hidden={mode === "top"}>
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
          <span className="diorama-floor-shadow" aria-hidden="true" />
        </div>

        <nav className="diorama-controls" aria-label={language === "vi" ? "Chọn góc nhìn sa bàn" : "Choose a diorama view"}>
          <button type="button" className={mode === "diorama" ? "active" : ""} onClick={() => setFace(0)} aria-pressed={mode === "diorama"}>◇ <span>{ui.centre}</span></button>
          <button type="button" className={mode === "top" ? "active" : ""} onClick={() => setFace(64)} aria-pressed={mode === "top"}>↑ <span>{ui.top}</span></button>
        </nav>
      </div>

      <a className="thank-you-museum-link" href="#memory-map"><span>{ui.museum}</span><b>↓</b></a>
    </section>

    {qrOpen && <div className="qr-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setQrOpen(false)}>
      <section className="qr-dialog" role="dialog" aria-modal="true" aria-labelledby="qr-dialog-title" aria-describedby="qr-dialog-note">
        <button ref={closeButtonRef} type="button" className="qr-dialog-close" onClick={() => setQrOpen(false)} aria-label={ui.close}>×</button>
        <span>GA CUỐI · QR</span>
        <h2 id="qr-dialog-title">{ui.qrDialog}</h2>
        <div className="qr-dialog-image"><Image src="/thanks-diorama/bank-qr-tree-pixel.png?v=tree-pixel-v1" alt={ui.qrDialog} fill unoptimized priority sizes="(max-width: 720px) 86vw, 560px" /></div>
        <p id="qr-dialog-note">{ui.qrPrivacy}</p>
        <a href="/thanks-diorama/bank-qr-tree-pixel.png" download="tau-di-san-viet-nam-qr-pixel-vang.png">{ui.save}</a>
      </section>
    </div>}
  </>;
}
