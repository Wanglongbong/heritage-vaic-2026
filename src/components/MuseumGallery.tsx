/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HERITAGE_STOPS } from '../data/heritage';
import { HeritageHotspot, Language } from '../types';
import { SceneArtRenderer, ArtifactSpriteRenderer, GoldenCraneIcon } from '../utils/visualAssets';
import { RecordDrawer } from './RecordDrawer';
import { soundEngine } from '../utils/soundEngine';
import { ChevronLeft, ChevronRight, Play, BookOpen, RotateCcw, Sparkles, HelpCircle, Eye } from 'lucide-react';

interface MuseumGalleryProps {
  language: Language;
  sealedStops: string[];
  visitedHotspots: string[];
  onOpenPassport: () => void;
  onResetJourney: () => void;
  onReplayStop: (stopId: string) => void;
}

export function MuseumGallery({
  language,
  sealedStops,
  visitedHotspots,
  onOpenPassport,
  onResetJourney,
  onReplayStop,
}: MuseumGalleryProps) {
  const [currentStopIndex, setCurrentStopIndex] = useState<number>(0);
  const [activeHotspot, setActiveHotspot] = useState<HeritageHotspot | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const stop = HERITAGE_STOPS[currentStopIndex];

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentStopIndex((prev) => (prev > 0 ? prev - 1 : HERITAGE_STOPS.length - 1));
        soundEngine.playChime(440, 0.2);
      } else if (e.key === 'ArrowRight') {
        setCurrentStopIndex((prev) => (prev < HERITAGE_STOPS.length - 1 ? prev + 1 : 0));
        soundEngine.playChime(440, 0.2);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNext = () => {
    setCurrentStopIndex((prev) => (prev < HERITAGE_STOPS.length - 1 ? prev + 1 : 0));
    soundEngine.playChime(440, 0.2);
  };

  const handlePrev = () => {
    setCurrentStopIndex((prev) => (prev > 0 ? prev - 1 : HERITAGE_STOPS.length - 1));
    soundEngine.playChime(440, 0.2);
  };

  const scrollToMuseum = () => {
    const el = document.getElementById('museum-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-stone-950 text-stone-100 flex flex-col select-none">
      {/* PART 1: HERO SUMMARY SECTION */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center p-6 text-center overflow-hidden border-b border-amber-900/40">
        {/* Background art glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(180,83,9,0.18)_0%,rgba(12,10,9,1)_80%)] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-4">
          <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <GoldenCraneIcon className="w-12 h-12 text-amber-400" />
          </div>

          <span className="text-xs font-mono font-bold tracking-[0.3em] text-amber-400 uppercase">
            {language === 'vi' ? 'HÀNH TRÌNH HOÀN TẤT' : 'JOURNEY COMPLETED'}
          </span>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-amber-100 tracking-tight">
            {language === 'vi' ? 'Tàu Di Sản Việt Nam' : 'Vietnam Heritage Express'}
          </h1>

          <p className="text-sm sm:text-base font-serif italic text-amber-200/90 max-w-lg">
            {language === 'vi' ? 'CHẠM VÀO KÝ ỨC ĐANG SỐNG' : 'TOUCHING LIVING MEMORIES'}
          </p>

          <p className="text-xs sm:text-sm text-stone-400 font-serif leading-relaxed max-w-md">
            {language === 'vi'
              ? 'Chúc mừng bạn đã hoàn thành chuyến hành trình lữ hành qua 5 vùng di sản văn hóa phi vật thể của Việt Nam, gìn giữ trọn vẹn 15 dấu ấn ký ức sống động.'
              : 'Congratulations on completing the voyage through 5 intangible cultural heritage stations, preserving 15 vibrant memories.'}
          </p>

          {/* 3 Uniform CTA Buttons */}
          <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {/* CTA 1: Open Passport */}
            <button
              onClick={onOpenPassport}
              className="min-h-[58px] px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-serif font-bold text-xs sm:text-sm leading-tight shadow-lg transition flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{language === 'vi' ? 'Mở Hộ chiếu di sản ↗' : 'Open Passport ↗'}</span>
            </button>

            {/* CTA 2: Reset Journey */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="min-h-[58px] px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-serif font-semibold text-xs sm:text-sm leading-tight transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>{language === 'vi' ? 'Chơi mới toàn bộ ↻' : 'Restart ↻'}</span>
            </button>

            {/* CTA 3: Scroll to Museum */}
            <button
              onClick={scrollToMuseum}
              className="min-h-[58px] px-4 py-3 rounded-xl bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 border border-amber-600/50 font-serif font-semibold text-xs sm:text-sm leading-tight transition flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 shrink-0" />
              <span>{language === 'vi' ? 'Phòng trưng bày ↓' : 'Museum ↓'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* PART 2: MUSEUM GALLERY SHOWCASE */}
      <section id="museum-showcase" className="relative w-full py-16 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col items-center">
        {/* Museum Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            {language === 'vi' ? 'BẢO TÀNG KÝ ỨC DI SẢN' : 'HERITAGE MEMORY MUSEUM'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 mt-1 min-h-[2.5rem]">
            GA {stop.number} · {stop.title[language]}
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-stone-400 mt-1">
            <span>{stop.location[language]}</span>
            <span>•</span>
            <span className="text-amber-400">
              {stop.hotspots.filter((h) => visitedHotspots.includes(`${stop.id}:${h.id}`)).length}/3 {language === 'vi' ? 'vật phẩm' : 'artifacts'}
            </span>
          </div>
        </div>

        {/* Central Large Glass Showcase */}
        <div className="relative w-full max-w-4xl bg-stone-900/80 rounded-2xl border-2 border-amber-600/50 p-4 sm:p-6 shadow-2xl backdrop-blur-sm flex flex-col items-center">
          {/* Left / Right Carousel Controls */}
          <button
            onClick={handlePrev}
            aria-label="Previous station"
            className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-stone-900/90 hover:bg-amber-600 text-stone-200 hover:text-white border border-amber-500/40 shadow-xl transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next station"
            className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-stone-900/90 hover:bg-amber-600 text-stone-200 hover:text-white border border-amber-500/40 shadow-xl transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Glass Showcase Frame */}
          <div className="relative w-full h-64 sm:h-96 rounded-xl overflow-hidden border border-stone-700 shadow-inner group">
            <SceneArtRenderer stopId={stop.id} isFullyAwakened={true} />

            {/* Replay Station Button overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => onReplayStop(stop.id)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm font-mono flex items-center gap-2 shadow-2xl transform group-hover:scale-105 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{language === 'vi' ? 'Khám phá lại ga này' : 'Replay this station'}</span>
              </button>
            </div>
          </div>

          {/* Dot Navigation */}
          <div className="flex items-center gap-2 mt-4">
            {HERITAGE_STOPS.map((st, idx) => (
              <button
                key={st.id}
                onClick={() => setCurrentStopIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStopIndex
                    ? 'w-7 bg-amber-400'
                    : 'bg-stone-700 hover:bg-stone-500'
                }`}
                aria-label={`Go to station ${idx + 1}`}
              />
            ))}
          </div>

          {/* 3 Floating Crystal Artifact Pods below */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {stop.hotspots.map((hotspot) => {
              const isVisited = visitedHotspots.includes(`${stop.id}:${hotspot.id}`);

              return (
                <div
                  key={hotspot.id}
                  onClick={() => isVisited && setActiveHotspot(hotspot)}
                  className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center text-center ${
                    isVisited
                      ? 'bg-stone-950/90 border-amber-500/60 shadow-[0_10px_20px_rgba(0,0,0,0.6)] cursor-pointer hover:border-amber-400 hover:-translate-y-1'
                      : 'bg-stone-950/40 border-stone-800 opacity-60'
                  }`}
                >
                  <div className="w-24 h-24 flex items-center justify-center my-2">
                    {isVisited ? (
                      <ArtifactSpriteRenderer artifactId={hotspot.id} face="front" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-600">
                        <HelpCircle className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider font-bold">
                    {isVisited ? hotspot.kicker[language] : (language === 'vi' ? 'Chưa mở' : 'Locked')}
                  </span>
                  <h3 className="text-xs sm:text-sm font-serif font-bold text-stone-100 mt-1 line-clamp-1">
                    {isVisited ? hotspot.label[language] : '???'}
                  </h3>

                  {isVisited && (
                    <span className="text-[10px] text-amber-300/80 mt-1 font-mono flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{language === 'vi' ? 'Bấm xem hồ sơ' : 'View Record'}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Record Drawer */}
      {activeHotspot && (
        <RecordDrawer
          hotspot={activeHotspot}
          stationTitle={stop.title[language]}
          language={language}
          onClose={() => setActiveHotspot(null)}
        />
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-stone-950 border-2 border-red-800 rounded-2xl p-6 shadow-2xl text-center">
            <RotateCcw className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-serif font-bold text-stone-100">
              {language === 'vi' ? 'Chơi mới toàn bộ?' : 'Reset All Progress?'}
            </h3>
            <p className="text-xs text-stone-400 font-serif mt-2 mb-6">
              {language === 'vi'
                ? 'Thao tác này sẽ xóa toàn bộ con dấu và vật phẩm đã thu thập để bạn bắt đầu lại chuyến tàu từ đầu.'
                : 'This will reset your seals and collected artifacts so you can embark on the journey again.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetJourney();
                }}
                className="flex-1 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-xs font-mono"
              >
                {language === 'vi' ? 'Xác nhận' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
