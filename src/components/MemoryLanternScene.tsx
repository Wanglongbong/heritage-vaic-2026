/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HeritageStop, HeritageHotspot, Language } from '../types';
import { SceneArtRenderer, ArtifactSpriteRenderer, StationSealStamp } from '../utils/visualAssets';
import { RecordDrawer } from './RecordDrawer';
import { soundEngine } from '../utils/soundEngine';
import { Sparkles, Play, Pause, ArrowLeft, ArrowRight, Train, CheckCircle2, Award, Volume2, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemoryLanternSceneProps {
  stop: HeritageStop;
  language: Language;
  visitedHotspots: string[];
  sealedStops: string[];
  onVisitHotspot: (stopId: string, hotspotId: string) => void;
  onSealStop: (stopId: string) => void;
  onReturnToCarriage: () => void;
  onNavigateStop: (stopId: string) => void;
  onFinishJourney: () => void;
}

export function MemoryLanternScene({
  stop,
  language,
  visitedHotspots,
  sealedStops,
  onVisitHotspot,
  onSealStop,
  onReturnToCarriage,
  onNavigateStop,
  onFinishJourney,
}: MemoryLanternSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lightPos, setLightPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [activeHotspot, setActiveHotspot] = useState<HeritageHotspot | null>(null);
  const [nearHotspotId, setNearHotspotId] = useState<string | null>(null);
  const [showSealModal, setShowSealModal] = useState<boolean>(false);

  // Audio player state
  const [isPlayingTrack, setIsPlayingTrack] = useState<boolean>(false);
  const [trackProgress, setTrackProgress] = useState<{ current: number; duration: number }>({
    current: 0,
    duration: stop.unlock.audio.durationSeconds,
  });

  const stopHotspots = stop.hotspots;
  const isStopSealed = sealedStops.includes(stop.id);

  // Check if all 3 hotspots of current stop have been visited
  const discoveredCount = stopHotspots.filter((h) =>
    visitedHotspots.includes(`${stop.id}:${h.id}`)
  ).length;
  const isAllDiscovered = discoveredCount === 3;
  const canCollectSeal = isAllDiscovered && !isStopSealed;

  // Track cursor / touch movement
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setLightPos({ x: xPct, y: yPct });

    // Calculate proximity to hotspots
    let closestId: string | null = null;
    let minDistance = Infinity;

    stopHotspots.forEach((h) => {
      const dist = Math.hypot(xPct - h.x, yPct - h.y);
      if (dist <= h.radius + 5 && dist < minDistance) {
        minDistance = dist;
        closestId = h.id;
      }
    });

    if (closestId !== nearHotspotId) {
      setNearHotspotId(closestId);
      if (closestId) {
        soundEngine.playLanternDiscovery();
      }
    }
  }, [stopHotspots, nearHotspotId]);

  // Audio Playback Controls
  const handleToggleStationTrack = () => {
    if (isPlayingTrack) {
      soundEngine.pauseStationTrack();
      setIsPlayingTrack(false);
    } else {
      setIsPlayingTrack(true);
      soundEngine.playStationTrack(
        stop.unlock.audio.src,
        stop.unlock.audio.durationSeconds,
        {
          onTimeUpdate: (current, duration) => {
            setTrackProgress({ current, duration });
          },
          onEnd: () => {
            setIsPlayingTrack(false);
            setTrackProgress((prev) => ({ ...prev, current: 0 }));
          },
          onError: () => {
            setIsPlayingTrack(false);
          },
        }
      );
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setTrackProgress((prev) => ({ ...prev, current: time }));
    soundEngine.seekStationTrack(time);
  };

  // Open Record Drawer
  const handleOpenHotspot = (hotspot: HeritageHotspot) => {
    onVisitHotspot(stop.id, hotspot.id);
    setActiveHotspot(hotspot);
    soundEngine.playChime(659.25, 0.3);
  };

  // Trigger Seal Acceptance
  const handleConfirmSeal = () => {
    onSealStop(stop.id);
    setShowSealModal(false);
    soundEngine.playChime(880, 0.8);
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#dc2626', '#10b981'],
      });
    } catch (e) {
      // ignore
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full h-[100dvh] bg-stone-950 flex flex-col overflow-hidden select-none">
      {/* Top Header Navigation Bar */}
      <header className="relative z-30 w-full px-4 py-3 bg-stone-950/80 backdrop-blur-md border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToCarriage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition text-xs font-mono"
            title={language === 'vi' ? 'Quay lại toa tàu' : 'Back to Carriage'}
          >
            <Train className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{language === 'vi' ? 'Toa tàu' : 'Carriage'}</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                GA {stop.number} · {stop.location[language]}
              </span>
              {isStopSealed && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{language === 'vi' ? 'Đã nhận dấu' : 'Sealed'}</span>
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-serif font-bold text-stone-100">
              {stop.title[language]}
            </h1>
          </div>
        </div>

        {/* Discovery Progress Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-stone-900/90 px-3 py-1.5 rounded-lg border border-stone-800 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-bold">{discoveredCount}/3</span>
            <span className="text-stone-400 text-[11px] hidden md:inline">
              {language === 'vi' ? 'vật phẩm' : 'artifacts'}
            </span>
          </div>

          {sealedStops.length === 5 && (
            <button
              onClick={onFinishJourney}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs shadow-lg transition animate-pulse"
            >
              {language === 'vi' ? 'Tổng kết ↗' : 'Ending ↗'}
            </button>
          )}
        </div>
      </header>

      {/* Main Interactive Stage with Flashlight "Đèn Ký Ức" */}
      <main
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="relative flex-1 w-full h-full overflow-hidden cursor-crosshair touch-none"
        style={
          {
            '--light-x': `${lightPos.x}%`,
            '--light-y': `${lightPos.y}%`,
          } as React.CSSProperties
        }
      >
        {/* Layer 1: Grayscale / Darkness Background */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isStopSealed || isAllDiscovered ? 'opacity-20' : 'opacity-100'}`}>
          <div className="w-full h-full filter grayscale brightness-50 contrast-125">
            <SceneArtRenderer stopId={stop.id} isFullyAwakened={false} />
          </div>
          {/* Darkness Mask overlay */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Layer 2: Memory Lantern (Đèn Ký Ức) Spotlighting Full Color beneath */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            maskImage: isStopSealed || isAllDiscovered
              ? 'none'
              : `radial-gradient(circle 140px at var(--light-x) var(--light-y), rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)`,
            WebkitMaskImage: isStopSealed || isAllDiscovered
              ? 'none'
              : `radial-gradient(circle 140px at var(--light-x) var(--light-y), rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)`,
          }}
        >
          <SceneArtRenderer stopId={stop.id} isFullyAwakened={true} />
        </div>

        {/* Layer 3: Interactive Hotspots on Canvas */}
        {stopHotspots.map((hotspot) => {
          const isVisited = visitedHotspots.includes(`${stop.id}:${hotspot.id}`);
          const isNear = nearHotspotId === hotspot.id;

          return (
            <div
              key={hotspot.id}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                onClick={() => handleOpenHotspot(hotspot)}
                className={`relative group flex flex-col items-center focus:outline-none transition-transform duration-300 ${
                  isNear ? 'scale-125' : 'scale-100'
                }`}
                aria-label={hotspot.label[language]}
              >
                {/* Hotspot Pulsing Rings */}
                <span
                  className={`absolute -inset-3 rounded-full transition-opacity duration-300 ${
                    isNear
                      ? 'bg-amber-400/40 animate-ping opacity-100'
                      : isVisited
                      ? 'bg-emerald-500/20 opacity-40'
                      : 'bg-amber-500/20 opacity-0 group-hover:opacity-60'
                  }`}
                />

                {/* Hotspot Center Core */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${
                    isVisited
                      ? 'bg-amber-950/90 border-amber-400 text-amber-300'
                      : isNear
                      ? 'bg-amber-500 border-amber-200 text-stone-950'
                      : 'bg-stone-900/80 border-stone-600 text-stone-400'
                  }`}
                >
                  <Sparkles className={`w-5 h-5 ${isNear ? 'animate-spin' : ''}`} />
                </div>

                {/* Hotspot Label Popover */}
                <div
                  className={`absolute -bottom-8 whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wide pointer-events-none transition-all duration-200 shadow-md ${
                    isNear || isVisited
                      ? 'opacity-100 translate-y-0 bg-stone-900/95 border border-amber-500/60 text-amber-200'
                      : 'opacity-0 translate-y-1 bg-stone-900/80 text-stone-400'
                  }`}
                >
                  {hotspot.label[language]}
                </div>
              </button>
            </div>
          );
        })}

        {/* Center Bottom: "TOÀN CẢNH ĐÃ THỨC" Card & Unlocked Audio Player */}
        <div className="absolute bottom-4 inset-x-4 z-30 flex flex-col items-center pointer-events-none">
          {/* Awakening Announcement Card */}
          {canCollectSeal && (
            <div className="pointer-events-auto mb-3 p-4 rounded-xl bg-stone-950/95 border-2 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.3)] max-w-lg w-full text-center flex flex-col items-center gap-2 animate-bounce-gentle">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{language === 'vi' ? 'TOÀN CẢNH ĐÃ THỨC' : 'SCENE FULLY AWAKENED'}</span>
              </div>
              <p className="text-xs text-stone-300 font-serif leading-relaxed">
                {stop.unlock.message[language]}
              </p>
              <button
                onClick={() => setShowSealModal(true)}
                className="mt-1 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs font-bold font-mono tracking-wider shadow-lg transition flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>{language === 'vi' ? 'NHẬN CON DẤU DI SẢN' : 'COLLECT HERITAGE SEAL'}</span>
              </button>
            </div>
          )}

          {/* Station Audio Player (Only shows when all 3 artifacts found or stop is sealed) */}
          {(isAllDiscovered || isStopSealed) && (
            <div className="pointer-events-auto w-full max-w-xl bg-stone-950/90 backdrop-blur-md border border-amber-600/50 rounded-xl p-3 shadow-xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-serif text-amber-100 truncate font-semibold">
                    {stop.unlock.audio.credit[language]}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-stone-400 shrink-0">
                  {formatTime(trackProgress.current)} / {formatTime(trackProgress.duration)}
                </span>
              </div>

              {/* Progress Slider */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleStationTrack}
                  className="p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 transition shrink-0 shadow"
                  aria-label={isPlayingTrack ? 'Pause' : 'Play'}
                >
                  {isPlayingTrack ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={trackProgress.duration}
                  step={0.1}
                  value={trackProgress.current}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Audio Right & Ensemble Attribution Note */}
              <div className="text-[10px] text-stone-400 italic text-center font-mono">
                {stop.unlock.audio.note[language]}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Record Modal Drawer */}
      {activeHotspot && (
        <RecordDrawer
          hotspot={activeHotspot}
          stationTitle={stop.title[language]}
          language={language}
          onClose={() => setActiveHotspot(null)}
        />
      )}

      {/* Heritage Seal Confirmation Modal */}
      {showSealModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-stone-950 border-2 border-amber-500 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="mb-4">
              <StationSealStamp
                stationNumber={stop.number}
                stationTitle={stop.title[language]}
                location={stop.location[language]}
                isSealed={true}
                className="w-32 h-32"
              />
            </div>

            <span className="text-xs font-mono text-amber-500 uppercase tracking-widest font-bold">
              {language === 'vi' ? 'CON DẤU DI SẢN CHÍNH THỨC' : 'OFFICIAL HERITAGE SEAL'}
            </span>
            <h2 className="text-xl font-serif font-bold text-amber-100 mt-1 mb-2">
              {stop.title[language]}
            </h2>
            <p className="text-xs text-stone-300 font-serif leading-relaxed mb-6">
              {language === 'vi'
                ? `Bạn đã khám phá trọn vẹn 3 dấu ấn di sản của Ga ${stop.number} (${stop.location[language]}). Con dấu này sẽ được đóng vĩnh viễn vào Hộ chiếu Di sản của bạn.`
                : `You have uncovered all 3 heritage relics of Station ${stop.number}. This seal will be stamped permanently into your Heritage Passport.`}
            </p>

            <div className="w-full flex items-center gap-3">
              <button
                onClick={() => setShowSealModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-mono border border-stone-700 transition"
              >
                {language === 'vi' ? 'Xem lại' : 'Review'}
              </button>
              <button
                onClick={handleConfirmSeal}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-lg transition"
              >
                {language === 'vi' ? 'ĐỒNG Ý / GIỮ CON DẤU' : 'KEEP & STAMP SEAL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
