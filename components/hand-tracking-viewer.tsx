"use client";

import Image from "next/image";
import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";
import {
  assignHandRoles,
  faceFromYaw,
  FOUR_VIEWS,
  handOpenness,
  smoothValue,
  updateStableFace,
} from "@/lib/heritage-hand-gestures";
import type { Language } from "@/lib/types";

type TrackingState = "idle" | "loading" | "running" | "denied" | "unsupported" | "error";

const text = {
  vi: {
    title: "Bàn quan sát hiện vật",
    intro: "Tay phải xoay qua bốn mặt; tay trái mở hoặc nắm để phóng to, thu nhỏ. Với gốm, khoảng cách hai tay còn thay đổi hình khối minh họa.",
    start: "Bật hand tracking",
    stop: "Tắt camera",
    loading: "Đang chuẩn bị nhận diện bàn tay…",
    running: "Camera chạy cục bộ · không gửi và không lưu hình ảnh",
    denied: "Chưa được cấp quyền camera. Bạn vẫn có thể kéo hiện vật bằng chuột hoặc ngón tay.",
    unsupported: "Thiết bị chưa hỗ trợ camera. Hãy kéo trực tiếp lên hiện vật để xoay.",
    error: "Không khởi tạo được nhận diện bàn tay. Chế độ kéo vẫn hoạt động.",
    hands: "bàn tay đang nhận diện",
    fallback: "Kéo ngang để xem đủ bốn mặt",
    views: ["Mặt trước", "Mặt phải", "Mặt sau", "Mặt trái"],
    swap: "Đổi vai tay trái / phải",
    guideTitle: "Cách điều khiển",
    guide: [
      { icon: "↔", label: "Tay phải", action: "Di chuyển ngang để xoay 4 mặt" },
      { icon: "✋", label: "Tay trái", action: "Xòe để phóng to · nắm để thu nhỏ" },
      { icon: "⇄", label: "Nhận sai tay?", action: "Bấm nút đổi vai tay bên dưới" },
      { icon: "☝", label: "Không dùng camera", action: "Kéo hiện vật hoặc chọn từng mặt" },
    ],
    potteryGuide: "Riêng gốm: đưa hai tay gần hoặc xa nhau để thay đổi hình khối minh họa.",
    cameraTitle: "Cửa sổ nhận diện bàn tay",
    shapingTitle: "Tạo hình bằng hai tay",
    shapingProgress: "Tiến độ mô phỏng",
    shapingDone: "Đã hoàn tất mô phỏng tạo hình",
    shapingBoundary: "Đây là mô phỏng giáo dục, không tái tạo đầy đủ tay nghề hoặc bí quyết của nghệ nhân Chăm.",
    shapingFallback: "Không dùng camera? Kéo thanh này để thử thay đổi hình khối.",
  },
  en: {
    title: "Object observation table",
    intro: "Use your right hand to turn through four views; open or close your left hand to zoom. For pottery, two-hand distance also changes the illustrative form.",
    start: "Enable hand tracking",
    stop: "Turn camera off",
    loading: "Preparing hand recognition…",
    running: "Local camera only · no images are sent or stored",
    denied: "Camera access was not granted. You can still drag the object with a pointer or finger.",
    unsupported: "Camera tracking is unavailable here. Drag directly on the object to rotate it.",
    error: "Hand recognition could not start. Drag mode remains available.",
    hands: "hands detected",
    fallback: "Drag horizontally to see all four sides",
    views: ["Front", "Right", "Back", "Left"],
    swap: "Swap left / right roles",
    guideTitle: "How to control",
    guide: [
      { icon: "↔", label: "Right hand", action: "Move sideways to rotate through 4 views" },
      { icon: "✋", label: "Left hand", action: "Open to zoom in · close to zoom out" },
      { icon: "⇄", label: "Hands reversed?", action: "Use the role-swap button below" },
      { icon: "☝", label: "Without camera", action: "Drag the object or choose a view" },
    ],
    potteryGuide: "Pottery only: move both hands closer or farther apart to reshape the illustration.",
    cameraTitle: "Hand recognition window",
    shapingTitle: "Two-hand shaping",
    shapingProgress: "Simulation progress",
    shapingDone: "Shaping simulation completed",
    shapingBoundary: "This educational simulation does not reproduce the full skill or protected knowledge of Chăm practitioners.",
    shapingFallback: "No camera? Use this slider to explore the illustrative form.",
  },
} as const;

export function HandTrackingViewer({ language, spriteSrc, malleable = false, label, onComplete }: { language: Language; spriteSrc: string; malleable?: boolean; label: string; onComplete?: () => void }) {
  const ui = text[language];
  const [trackingState, setTrackingState] = useState<TrackingState>("idle");
  const [handCount, setHandCount] = useState(0);
  const [activeView, setActiveView] = useState(0);
  const [swapHands, setSwapHands] = useState(false);
  const [shapingProgress, setShapingProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<{ close: () => void; detectForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks?: Array<Array<{ x: number; y: number; z?: number }>>; handednesses?: Array<Array<{ categoryName?: string; displayName?: string; score?: number }>>; handedness?: Array<Array<{ categoryName?: string; displayName?: string; score?: number }>> } } | null>(null);
  const frameRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const swapHandsRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, yaw: 0 });
  const previousHandsRef = useRef(0);
  const lastHandDistanceRef = useRef<number | null>(null);
  const shapingProgressRef = useRef(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const poseRef = useRef({ yaw: 0, rotateX: -8, rotateY: 0, width: 1, height: 1, zoom: 1 });
  const stableFaceRef = useRef({ candidate: 0, frames: 0, committed: 0 });
  const spriteBase = spriteSrc.split("/").pop()?.replace(/\.webp$/i, "") ?? "artifact";
  const viewSources = useMemo(() => FOUR_VIEWS.map((view) => `/artifacts/turn/${spriteBase}-${view}.webp`), [spriteBase]);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  function completeShaping(progress: number) {
    const next = Math.min(100, Math.max(shapingProgressRef.current, progress));
    shapingProgressRef.current = next;
    setShapingProgress((current) => Math.abs(current - next) >= 1 ? Math.round(next) : current);
    if (next >= 100 && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  }

  function applyPose(next: Partial<typeof poseRef.current>, smoothing = 0.22, stabilizeFace = true) {
    const pose = poseRef.current;
    for (const key of Object.keys(next) as Array<keyof typeof pose>) {
      const value = next[key];
      if (typeof value === "number") pose[key] = smoothValue(pose[key], value, smoothing);
    }
    const candidateFace = faceFromYaw(pose.yaw);
    let committedFace = candidateFace;
    if (stabilizeFace) {
      committedFace = updateStableFace(stableFaceRef.current, candidateFace);
    } else {
      stableFaceRef.current = { candidate: candidateFace, frames: 3, committed: candidateFace };
    }
    setActiveView((current) => current === committedFace ? current : committedFace);
    const snappedYaw = Math.round(pose.yaw / 90) * 90;
    pose.rotateY = Math.max(-18, Math.min(18, (pose.yaw - snappedYaw) * 0.32));
    objectRef.current?.style.setProperty("--object-rx", `${pose.rotateX.toFixed(2)}deg`);
    objectRef.current?.style.setProperty("--object-ry", `${pose.rotateY.toFixed(2)}deg`);
    objectRef.current?.style.setProperty("--pot-width", pose.width.toFixed(3));
    objectRef.current?.style.setProperty("--pot-height", pose.height.toFixed(3));
    objectRef.current?.style.setProperty("--object-zoom", pose.zoom.toFixed(3));
  }

  useEffect(() => {
    viewSources.forEach((source) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = source;
      void image.decode().catch(() => undefined);
    });
  }, [viewSources]);

  function stopTracking() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    trackerRef.current?.close();
    trackerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    previousHandsRef.current = 0;
    lastHandDistanceRef.current = null;
    setHandCount(0);
    setTrackingState("idle");
  }

  useEffect(() => () => stopTracking(), []);

  async function startTracking() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setTrackingState("unsupported");
      return;
    }
    setTrackingState("loading");
    try {
      const [{ FilesetResolver, HandLandmarker }, stream] = await Promise.all([
        import("@mediapipe/tasks-vision"),
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }),
      ]);
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("video-missing");
      video.srcObject = stream;
      await video.play();
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm");
      const tracker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task", delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });
      trackerRef.current = tracker;
      setTrackingState("running");

      const renderFrame = () => {
        const liveVideo = videoRef.current;
        const canvas = canvasRef.current;
        const activeTracker = trackerRef.current;
        if (!liveVideo || !canvas || !activeTracker) return;
        const width = liveVideo.videoWidth || 640;
        const height = liveVideo.videoHeight || 480;
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
        const context = canvas.getContext("2d");
        if (context) {
          context.clearRect(0, 0, width, height);
          context.save();
          context.translate(width, 0);
          context.scale(-1, 1);
          context.drawImage(liveVideo, 0, 0, width, height);
          context.restore();
        }
        const result = activeTracker.detectForVideo(liveVideo, performance.now());
        const hands = result.landmarks ?? [];
        const handednesses = result.handednesses ?? result.handedness ?? [];
        const detectedHands = hands.map((landmarks, index) => {
          const category = handednesses[index]?.[0];
          return {
            landmarks,
            handedness: category?.categoryName ?? category?.displayName ?? "Unknown",
            score: category?.score ?? 0,
          };
        });
        const roles = assignHandRoles(detectedHands, swapHandsRef.current);
        if (hands.length !== previousHandsRef.current) {
          previousHandsRef.current = hands.length;
          setHandCount(hands.length);
        }
        if (context) {
          context.lineWidth = 2;
          hands.forEach((landmarks) => {
            const isRight = landmarks === roles.right;
            context.fillStyle = isRight ? "#14b8a6" : "#f97316";
            context.strokeStyle = isRight ? "rgba(94,234,212,.8)" : "rgba(251,146,60,.8)";
            const points = landmarks.map((point) => ({ x: (1 - point.x) * width, y: point.y * height }));
            for (const [a, b] of [[0, 5], [5, 8], [0, 9], [9, 12], [0, 13], [13, 16], [0, 17], [17, 20]] as Array<[number, number]>) {
              context.beginPath(); context.moveTo(points[a].x, points[a].y); context.lineTo(points[b].x, points[b].y); context.stroke();
            }
            points.forEach((point) => { context.beginPath(); context.arc(point.x, point.y, 3.2, 0, Math.PI * 2); context.fill(); });
          });
        }
        if (roles.right) {
          const palm = roles.right[9];
          const leftGesture = handOpenness(roles.left);
          const next = {
            yaw: (0.5 - palm.x) * 360,
            rotateX: (palm.y - 0.5) * 34,
            zoom: leftGesture === "open" ? 1.16 : leftGesture === "fist" ? 0.86 : 1,
          };
          if (malleable && roles.left) {
            const otherPalm = roles.left[9];
            const distance = Math.hypot(palm.x - otherPalm.x, palm.y - otherPalm.y);
            Object.assign(next, { width: Math.min(1.3, Math.max(.76, .58 + distance * 1.45)), height: Math.min(1.18, Math.max(.82, 1.22 - distance * .42)) });
            const previousDistance = lastHandDistanceRef.current;
            if (previousDistance !== null) {
              const movement = Math.abs(distance - previousDistance);
              if (movement > .004 && movement < .12) completeShaping(shapingProgressRef.current + movement * 185);
            }
            lastHandDistanceRef.current = distance;
          }
          applyPose(next, 0.2, true);
        } else if (roles.left) {
          const leftGesture = handOpenness(roles.left);
          applyPose({ zoom: leftGesture === "open" ? 1.16 : leftGesture === "fist" ? 0.86 : 1 }, 0.2, true);
        }
        frameRef.current = requestAnimationFrame(renderFrame);
      };
      frameRef.current = requestAnimationFrame(renderFrame);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError");
      setTrackingState(denied ? "denied" : "error");
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const deltaX = event.clientX - pointerStartRef.current.x;
    applyPose({ yaw: pointerStartRef.current.yaw + deltaX / rect.width * 360 }, .56, false);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    pointerStartRef.current = { x: event.clientX, yaw: poseRef.current.yaw };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function selectView(index: number) {
    applyPose({ yaw: index * 90 }, 1, false);
  }

  function shapeWithSlider(value: number) {
    const width = value / 100;
    applyPose({ width, height: Math.min(1.18, Math.max(.82, 1.18 - Math.abs(width - 1) * .8)) }, .8, false);
    completeShaping(Math.abs(value - 100) * 4.2);
  }

  const status = trackingState === "loading" ? ui.loading
    : trackingState === "running" ? `${ui.running} · ${handCount} ${ui.hands}`
      : trackingState === "denied" ? ui.denied
        : trackingState === "unsupported" ? ui.unsupported
          : trackingState === "error" ? ui.error
            : ui.fallback;

  return <section className="hand-viewer" aria-label={`${ui.title}: ${label}`}>
    <video className="camera-source" ref={videoRef} muted playsInline />
    <div className="hand-viewer-copy"><span>◫ HAND TRACKING · LOCAL</span><h3>{ui.title}</h3><p>{ui.intro}</p></div>
    <aside className="hand-guide" aria-label={ui.guideTitle}>
      <b>{ui.guideTitle}</b>
      <div>
        {ui.guide.map((item) => <p key={item.label}><i aria-hidden="true">{item.icon}</i><span><strong>{item.label}</strong>{item.action}</span></p>)}
      </div>
      {malleable && <small>◎ {ui.potteryGuide}</small>}
    </aside>
    <div className="hand-viewer-stage" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => { draggingRef.current = false; }} onPointerCancel={() => { draggingRef.current = false; }}>
      {malleable && <div className={`pottery-hand-overlay ${shapingProgress >= 100 ? "completed" : ""}`} aria-hidden="true"><span>✋</span><i>↔</i><span>🤚</span></div>}
      <div ref={objectRef} className={`tracked-object ${malleable ? "is-malleable" : ""}`} style={{ "--object-rx": "-8deg", "--object-ry": "0deg", "--object-zoom": 1, "--pot-width": 1, "--pot-height": 1 } as CSSProperties}>
        {viewSources.map((source, index) => <Image key={source} className={`tracked-object-face ${activeView === index ? "is-active" : ""}`} src={source} alt={activeView === index ? `${label} · ${ui.views[index]}` : ""} aria-hidden={activeView !== index} fill unoptimized sizes="(max-width: 640px) 72vw, 340px" draggable={false} />)}
        <b>{label}</b>
        <span>{ui.views[activeView]} · {activeView + 1}/4</span>
      </div>
      <nav className="object-view-switcher" aria-label={language === "vi" ? "Chọn mặt quan sát" : "Choose object view"}>
        {ui.views.map((view, index) => <button key={view} type="button" className={activeView === index ? "active" : ""} onPointerDown={(event) => event.stopPropagation()} onClick={() => selectView(index)} aria-pressed={activeView === index}><i />{view}</button>)}
      </nav>
      <small>{status}</small>
    </div>
    {malleable && <section className="pottery-shaping-panel" aria-label={ui.shapingTitle}>
      <div><b>{shapingProgress >= 100 ? `✓ ${ui.shapingDone}` : ui.shapingTitle}</b><span>{ui.shapingProgress} · {shapingProgress}%</span></div>
      <div className="shaping-meter"><i style={{ width: `${shapingProgress}%` }} /></div>
      <label><span>{ui.shapingFallback}</span><input type="range" min="76" max="130" defaultValue="100" onChange={(event) => shapeWithSlider(Number(event.target.value))} /></label>
      <p>{ui.shapingBoundary}</p>
    </section>}
    <div className="tracking-actions">
      <button type="button" className="tracking-toggle" onClick={trackingState === "running" ? stopTracking : startTracking} disabled={trackingState === "loading"}>{trackingState === "running" ? ui.stop : ui.start}</button>
      <button type="button" className="tracking-swap" onClick={() => setSwapHands((value) => { const next = !value; swapHandsRef.current = next; return next; })} aria-pressed={swapHands}>{ui.swap}</button>
    </div>
    {(trackingState === "loading" || trackingState === "running") && typeof document !== "undefined" && createPortal(<aside className="camera-popout" aria-label={ui.cameraTitle}>
      <header><span><i /> {ui.cameraTitle}</span><button type="button" onClick={stopTracking} aria-label={ui.stop}>×</button></header>
      <div><canvas ref={canvasRef} /></div>
      <footer><b>{trackingState === "loading" ? ui.loading : `${handCount} ${ui.hands}`}</b><small>{ui.running}</small></footer>
    </aside>, document.body)}
  </section>;
}
