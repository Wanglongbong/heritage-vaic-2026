/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArtifactFace, Language } from '../types';
import { calculateFaceFromYaw, calculateHandOpenness } from '../utils/handGestures';
import { ArtifactSpriteRenderer } from '../utils/visualAssets';
import { Camera, CameraOff, RefreshCw, ZoomIn, ZoomOut, MoveHorizontal, ShieldCheck, Eye } from 'lucide-react';

interface HandTrackingViewerProps {
  artifactId: string;
  artifactName: string;
  language: Language;
}

export function HandTrackingViewer({ artifactId, artifactName, language }: HandTrackingViewerProps) {
  const [activeFace, setActiveFace] = useState<ArtifactFace>('front');
  const [yaw, setYaw] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [handRolesSwapped, setHandRolesSwapped] = useState<boolean>(false);
  const [handsStatus, setHandsStatus] = useState<{ right: boolean; left: boolean }>({ right: false, left: false });

  // Refs for camera and animation
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);

  // Drag interaction state
  const isDraggingRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startYawRef = useRef<number>(0);

  // Cleanup camera stream and landmarker
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (landmarkerRef.current) {
      try {
        landmarkerRef.current.close();
      } catch (e) {
        // ignore
      }
      landmarkerRef.current = null;
    }
    setIsCameraActive(false);
    setIsModelLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start Hand Tracking via MediaPipe
  const startCamera = async () => {
    setCameraError(null);
    setIsModelLoading(true);

    try {
      // 1. Request camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // 2. Initialize MediaPipe HandLandmarker
      const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });

      landmarkerRef.current = landmarker;
      setIsCameraActive(true);
      setIsModelLoading(false);

      // Start processing loop
      runDetectionLoop();
    } catch (err: any) {
      console.warn('Camera or HandLandmarker initialization error', err);
      setCameraError(
        language === 'vi'
          ? 'Không thể mở camera hoặc tải mô hình nhận diện tay. Bạn có thể kéo chuột/chạm để xoay hiện vật.'
          : 'Could not access camera or load hand tracking model. You can drag or click to rotate.'
      );
      stopCamera();
    }
  };

  // Process video frames
  const runDetectionLoop = () => {
    if (!videoRef.current || !landmarkerRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let lastVideoTime = -1;

    const render = () => {
      if (!isCameraActive && !streamRef.current) return;

      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const results = landmarkerRef.current.detectForVideo(video, performance.now());

        if (ctx) {
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          let detectedRight = false;
          let detectedLeft = false;

          if (results.landmarks && results.landmarks.length > 0) {
            results.landmarks.forEach((landmarks: any[], index: number) => {
              const handedness = results.handednesses?.[index]?.[0]?.categoryName || 'Right';
              const isRightHand = handRolesSwapped ? handedness === 'Left' : handedness === 'Right';

              // Draw hand skeleton on mirror canvas
              ctx.strokeStyle = isRightHand ? '#f59e0b' : '#38bdf8';
              ctx.lineWidth = 3;
              ctx.fillStyle = '#fef08a';

              landmarks.forEach((pt: any) => {
                const px = pt.x * canvas.width;
                const py = pt.y * canvas.height;
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fill();
              });

              // Right Hand: controls Yaw
              if (isRightHand) {
                detectedRight = true;
                const palmCenter = landmarks[0];
                // Mirror mapping: x from 1 (left) to 0 (right)
                const normalizedX = 1 - palmCenter.x;
                const newYaw = Math.round(normalizedX * 360);
                setYaw(newYaw);
                setActiveFace((prev) => calculateFaceFromYaw(newYaw, prev));
              } else {
                // Left Hand: controls Zoom
                detectedLeft = true;
                const openness = calculateHandOpenness(landmarks);
                // openness > 0.6 -> zoom in (1.16), openness < 0.3 -> zoom out (0.86)
                if (openness > 0.65) {
                  setZoomScale((prev) => Math.min(prev + 0.015, 1.25));
                } else if (openness < 0.3) {
                  setZoomScale((prev) => Math.max(prev - 0.015, 0.85));
                }
              }
            });
          }

          setHandsStatus({ right: detectedRight, left: detectedLeft });
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // Mouse & Touch Drag Handlers for rotation fallback
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startYawRef.current = yaw;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const newYaw = (startYawRef.current + deltaX * 1.2 + 360) % 360;
    setYaw(newYaw);
    setActiveFace((prev) => calculateFaceFromYaw(newYaw, prev));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  };

  const selectFaceDirectly = (face: ArtifactFace) => {
    setActiveFace(face);
    const yawTargets: Record<ArtifactFace, number> = {
      front: 0,
      right: 90,
      back: 180,
      left: 270,
    };
    setYaw(yawTargets[face]);
  };

  return (
    <div className="w-full bg-stone-900/90 rounded-xl border border-stone-700/60 p-4 relative flex flex-col items-center">
      {/* Top Header & Hand Pilot Controls */}
      <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-stone-800 text-xs">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-stone-300 font-semibold uppercase tracking-wider">
            {language === 'vi' ? 'Bàn quan sát 4 mặt' : '4-View Turntable'}
          </span>
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">
            {activeFace.toUpperCase()} ({Math.round(yaw)}°)
          </span>
        </div>

        {/* Hand Pilot Button */}
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            disabled={isModelLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium transition text-xs shadow-md disabled:opacity-50"
            title={language === 'vi' ? 'Bật điều khiển bằng cử chỉ tay' : 'Enable Hand Tracking'}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isModelLoading ? (language === 'vi' ? 'Đang tải AI...' : 'Loading AI...') : (language === 'vi' ? 'Bật Hand Pilot' : 'Enable Hand Pilot')}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHandRolesSwapped(!handRolesSwapped)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] border border-stone-700"
              title={language === 'vi' ? 'Đổi vai trò tay trái/phải' : 'Swap Hand Roles'}
            >
              <RefreshCw className="w-3 h-3" />
              <span>{language === 'vi' ? 'Đổi tay' : 'Swap'}</span>
            </button>
            <button
              onClick={stopCamera}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-900/70 hover:bg-red-800 text-red-200 text-[11px]"
            >
              <CameraOff className="w-3 h-3" />
              <span>{language === 'vi' ? 'Tắt' : 'Off'}</span>
            </button>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="w-full text-xs text-amber-400/90 bg-amber-950/40 border border-amber-800/50 p-2 rounded mb-3">
          {cameraError}
        </div>
      )}

      {/* Main Turntable Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-56 relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none bg-stone-950/70 rounded-lg border border-stone-800/80 overflow-hidden group touch-none"
      >
        {/* Subtle radial light pedestal */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)] pointer-events-none" />

        {/* Drag Hint overlay */}
        <div className="absolute top-2 left-2 flex items-center gap-1 text-[11px] text-stone-400 bg-stone-900/80 px-2 py-0.5 rounded pointer-events-none backdrop-blur-sm">
          <MoveHorizontal className="w-3 h-3 text-amber-400" />
          <span>{language === 'vi' ? 'Kéo ngang để xoay' : 'Drag to rotate'}</span>
        </div>

        {/* Artifact View Sprite */}
        <div
          className="w-48 h-48 flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomScale})` }}
        >
          <ArtifactSpriteRenderer artifactId={artifactId} face={activeFace} />
        </div>

        {/* Zoom controls float */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-stone-900/90 p-1 rounded-md border border-stone-800 z-10">
          <button
            onClick={() => setZoomScale((prev) => Math.max(prev - 0.1, 0.8))}
            className="p-1 text-stone-400 hover:text-stone-200 rounded hover:bg-stone-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-stone-300 w-8 text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale((prev) => Math.min(prev + 0.1, 1.3))}
            className="p-1 text-stone-400 hover:text-stone-200 rounded hover:bg-stone-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Faces Selection Buttons */}
      <div className="w-full grid grid-cols-4 gap-2 mt-3">
        {(['front', 'right', 'back', 'left'] as ArtifactFace[]).map((face) => {
          const labels: Record<ArtifactFace, { vi: string; en: string }> = {
            front: { vi: 'Mặt trước', en: 'Front' },
            right: { vi: 'Mặt phải', en: 'Right' },
            back: { vi: 'Mặt sau', en: 'Back' },
            left: { vi: 'Mặt trái', en: 'Left' },
          };
          const isSelected = activeFace === face;

          return (
            <button
              key={face}
              onClick={() => selectFaceDirectly(face)}
              className={`py-1.5 px-2 text-xs rounded font-mono transition text-center ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700/60'
              }`}
            >
              {labels[face][language]}
            </button>
          );
        })}
      </div>

      {/* Camera Popout Preview Window (Floating non-blocking) */}
      {isCameraActive && (
        <div className="w-full mt-3 p-2.5 bg-stone-950 rounded-lg border border-amber-500/40 flex flex-col gap-1.5 shadow-lg">
          <div className="flex items-center justify-between text-[11px] text-stone-300">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'vi' ? 'Hand Pilot đang hoạt động' : 'Hand Pilot Active'}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-stone-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{language === 'vi' ? 'Chạy cục bộ, bảo mật' : 'Local processing only'}</span>
            </div>
          </div>

          <div className="relative w-full h-24 bg-black rounded overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-40"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" />

            {/* Live Gesture Prompts overlay */}
            <div className="absolute bottom-1 inset-x-1 flex justify-between text-[9px] font-mono bg-stone-900/80 px-2 py-0.5 rounded text-stone-300">
              <span className={handsStatus.right ? 'text-amber-400 font-bold' : 'text-stone-500'}>
                {language === 'vi' ? 'Tay phải: Xoay 360°' : 'Right Hand: Yaw 360°'}
              </span>
              <span className={handsStatus.left ? 'text-sky-400 font-bold' : 'text-stone-500'}>
                {language === 'vi' ? 'Tay trái: Xòe/Nắm Zoom' : 'Left Hand: Open/Fist Zoom'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Educational & Craftsmanship Disclaimer */}
      <div className="w-full mt-2 pt-2 border-t border-stone-800/80 text-[10px] text-stone-400 text-center italic">
        {language === 'vi'
          ? 'Mô phỏng giáo dục để quan sát hình khối, không thay thế tri thức bí truyền hoặc tay nghề thực tế của nghệ nhân.'
          : 'Educational visualization for geometric observation; does not replace master artisan wisdom.'}
      </div>
    </div>
  );
}
