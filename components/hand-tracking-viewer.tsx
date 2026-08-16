"use client";

import { PointerEvent, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Language } from "@/lib/types";

type TrackingState = "idle" | "loading" | "running" | "denied" | "unsupported" | "error";

const text = {
  vi: {
    title: "Bàn quan sát hiện vật",
    intro: "Giữ bàn tay trước camera để xoay hiện vật. Với gốm, đưa hai tay gần hoặc xa nhau để thay đổi góc nhìn hình khối.",
    start: "Bật hand tracking",
    stop: "Tắt camera",
    loading: "Đang chuẩn bị nhận diện bàn tay…",
    running: "Camera chạy cục bộ · không gửi và không lưu hình ảnh",
    denied: "Chưa được cấp quyền camera. Bạn vẫn có thể kéo hiện vật bằng chuột hoặc ngón tay.",
    unsupported: "Thiết bị chưa hỗ trợ camera. Hãy kéo trực tiếp lên hiện vật để xoay.",
    error: "Không khởi tạo được nhận diện bàn tay. Chế độ kéo vẫn hoạt động.",
    hands: "bàn tay đang nhận diện",
    fallback: "Kéo để xoay",
  },
  en: {
    title: "Object observation table",
    intro: "Hold a hand in front of the camera to rotate the object. For pottery, move two hands closer or farther apart to change the form view.",
    start: "Enable hand tracking",
    stop: "Turn camera off",
    loading: "Preparing hand recognition…",
    running: "Local camera only · no images are sent or stored",
    denied: "Camera access was not granted. You can still drag the object with a pointer or finger.",
    unsupported: "Camera tracking is unavailable here. Drag directly on the object to rotate it.",
    error: "Hand recognition could not start. Drag mode remains available.",
    hands: "hands detected",
    fallback: "Drag to rotate",
  },
} as const;

export function HandTrackingViewer({ language, pottery = false, label }: { language: Language; pottery?: boolean; label: string }) {
  const ui = text[language];
  const [trackingState, setTrackingState] = useState<TrackingState>("idle");
  const [handCount, setHandCount] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef<{ close: () => void; detectForVideo: (video: HTMLVideoElement, timestamp: number) => { landmarks?: Array<Array<{ x: number; y: number }>> } } | null>(null);
  const frameRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const previousHandsRef = useRef(0);
  const poseRef = useRef({ rotateX: -8, rotateY: 16, width: 1, height: 1 });

  function applyPose(next: Partial<typeof poseRef.current>, smoothing = 0.22) {
    const pose = poseRef.current;
    for (const key of Object.keys(next) as Array<keyof typeof pose>) {
      const value = next[key];
      if (typeof value === "number") pose[key] += (value - pose[key]) * smoothing;
    }
    objectRef.current?.style.setProperty("--object-rx", `${pose.rotateX.toFixed(2)}deg`);
    objectRef.current?.style.setProperty("--object-ry", `${pose.rotateY.toFixed(2)}deg`);
    objectRef.current?.style.setProperty("--pot-width", pose.width.toFixed(3));
    objectRef.current?.style.setProperty("--pot-height", pose.height.toFixed(3));
  }

  function stopTracking() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    trackerRef.current?.close();
    trackerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    previousHandsRef.current = 0;
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
      const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm");
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
        if (hands.length !== previousHandsRef.current) {
          previousHandsRef.current = hands.length;
          setHandCount(hands.length);
        }
        if (context) {
          context.fillStyle = "#e4bd72";
          context.strokeStyle = "rgba(228,189,114,.58)";
          context.lineWidth = 2;
          hands.forEach((landmarks) => {
            const points = landmarks.map((point) => ({ x: (1 - point.x) * width, y: point.y * height }));
            for (const [a, b] of [[0, 5], [5, 8], [0, 9], [9, 12], [0, 13], [13, 16], [0, 17], [17, 20]] as Array<[number, number]>) {
              context.beginPath(); context.moveTo(points[a].x, points[a].y); context.lineTo(points[b].x, points[b].y); context.stroke();
            }
            points.forEach((point) => { context.beginPath(); context.arc(point.x, point.y, 3.2, 0, Math.PI * 2); context.fill(); });
          });
        }
        if (hands[0]) {
          const palm = hands[0][9];
          const next = { rotateY: (0.5 - palm.x) * 78, rotateX: (palm.y - 0.5) * 54 };
          if (pottery && hands[1]) {
            const otherPalm = hands[1][9];
            const distance = Math.hypot(palm.x - otherPalm.x, palm.y - otherPalm.y);
            Object.assign(next, { width: Math.min(1.3, Math.max(.76, .58 + distance * 1.45)), height: Math.min(1.18, Math.max(.82, 1.22 - distance * .42)) });
          }
          applyPose(next);
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
    applyPose({ rotateY: ((event.clientX - rect.left) / rect.width - .5) * 76, rotateX: ((event.clientY - rect.top) / rect.height - .5) * -42 }, .48);
  }

  const status = trackingState === "loading" ? ui.loading
    : trackingState === "running" ? `${ui.running} · ${handCount} ${ui.hands}`
      : trackingState === "denied" ? ui.denied
        : trackingState === "unsupported" ? ui.unsupported
          : trackingState === "error" ? ui.error
            : ui.fallback;

  return <section className="hand-viewer" aria-label={`${ui.title}: ${label}`}>
    <div className="hand-viewer-copy"><span>◫ HAND TRACKING · LOCAL</span><h3>{ui.title}</h3><p>{ui.intro}</p></div>
    <div className="hand-viewer-stage" onPointerDown={(event) => { draggingRef.current = true; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={onPointerMove} onPointerUp={() => { draggingRef.current = false; }} onPointerCancel={() => { draggingRef.current = false; }}>
      <div className="camera-feed" data-active={trackingState === "running"}><video ref={videoRef} muted playsInline /><canvas ref={canvasRef} /></div>
      <div ref={objectRef} className={`tracked-object ${pottery ? "tracked-pottery" : "tracked-artifact"}`} style={{ "--object-rx": "-8deg", "--object-ry": "16deg", "--pot-width": 1, "--pot-height": 1 } as CSSProperties}>
        <i /><b>{label}</b><span />
      </div>
      <small>{status}</small>
    </div>
    <button type="button" className="tracking-toggle" onClick={trackingState === "running" ? stopTracking : startTracking} disabled={trackingState === "loading"}>{trackingState === "running" ? ui.stop : ui.start}</button>
  </section>;
}
