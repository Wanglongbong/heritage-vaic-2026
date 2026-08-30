/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HERITAGE_STOPS } from '../data/heritage';
import { CarriageSceneRenderer, TicketConductorRenderer, GoldenCraneIcon } from '../utils/visualAssets';
import { Language } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { CheckCircle2, Compass, ArrowRight, Sparkles, MapPin } from 'lucide-react';

interface TrainCarriageProps {
  language: Language;
  sealedStops: string[];
  visitedHotspots: string[];
  onSelectStop: (stopId: string) => void;
  onOpenEnding: () => void;
}

export function TrainCarriage({
  language,
  sealedStops,
  visitedHotspots,
  onSelectStop,
  onOpenEnding,
}: TrainCarriageProps) {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTypingDone, setIsTypingDone] = useState<boolean>(false);

  const fullDialogue =
    language === 'vi'
      ? 'Kính chào quý khách! Đoàn tàu Di Sản Bắc–Nam đang khởi hành. Mời quý khách chọn một trong 5 tấm vé để cùng Đèn Ký Ức chạm vào những giá trị văn hóa sống động của dân tộc.'
      : 'Welcome aboard! The North–South Heritage Express is rolling. Please choose one of 5 tickets to touch living cultural memories with the Memory Lantern.';

  useEffect(() => {
    setDisplayedText('');
    setIsTypingDone(false);

    // Initial 520ms natural transition delay
    const startTimeout = setTimeout(() => {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        charIndex++;
        setDisplayedText(fullDialogue.slice(0, charIndex));
        if (charIndex >= fullDialogue.length) {
          clearInterval(typeInterval);
          setIsTypingDone(true);
        }
      }, 25);

      return () => clearInterval(typeInterval);
    }, 520);

    return () => clearTimeout(startTimeout);
  }, [language, fullDialogue]);

  const handleTicketClick = (stopId: string) => {
    soundEngine.playChime(523.25, 0.4);
    onSelectStop(stopId);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-stone-950 flex flex-col overflow-hidden select-none">
      {/* Background: Luxury Carriage with panoramic moving window */}
      <div className="absolute inset-0 z-0">
        <CarriageSceneRenderer />
      </div>

      {/* Top Banner */}
      <div className="relative z-20 w-full px-6 py-4 flex items-center justify-between bg-gradient-to-b from-stone-950/90 to-transparent">
        <div className="flex items-center gap-3">
          <GoldenCraneIcon className="w-7 h-7 text-amber-400" />
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
              ĐOÀN TÀU BẮC – NAM · TOA ĐIỀU HÀNH
            </span>
            <h1 className="text-base sm:text-xl font-serif font-bold text-amber-100">
              {language === 'vi' ? 'Toa Tàu Di Sản Việt Nam' : 'Vietnam Heritage Carriage'}
            </h1>
          </div>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-stone-900/90 border border-stone-700/70 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-stone-400">{language === 'vi' ? 'Con dấu:' : 'Seals:'}</span>
            <span className="text-amber-400 font-bold">{sealedStops.length}/5</span>
          </div>

          {sealedStops.length === 5 && (
            <button
              onClick={onOpenEnding}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs shadow-lg transition animate-pulse"
            >
              {language === 'vi' ? 'Xem Hộ chiếu & Tổng kết ↗' : 'Passport & Ending ↗'}
            </button>
          )}
        </div>
      </div>

      {/* Main Center Area: Conductor & Tickets */}
      <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 pb-24 sm:pb-28 overflow-y-auto">
        {/* Ticket Conductor Figure */}
        <div className="w-full md:w-5/12 flex flex-col items-center justify-center pt-4 md:pt-0">
          <div className="relative">
            <TicketConductorRenderer className="w-44 h-60 sm:w-52 sm:h-72" />
          </div>

          {/* Conductor Dialogue Box (Typewriter text) */}
          <div className="w-full mt-3 p-4 rounded-xl bg-stone-950/90 border border-amber-600/50 shadow-2xl backdrop-blur-sm text-center md:text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
              {language === 'vi' ? 'Trưởng tàu Di sản:' : 'Heritage Train Master:'}
            </span>
            <p className="text-xs sm:text-sm text-stone-200 font-serif leading-relaxed min-h-[3.5rem]">
              {displayedText}
              {!isTypingDone && <span className="inline-block w-1.5 h-3.5 bg-amber-400 ml-1 animate-pulse" />}
            </p>
          </div>
        </div>

        {/* 5 Heritage Tickets Grid */}
        <div className="w-full md:w-7/12 flex flex-col gap-2.5">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-1 flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            <span>{language === 'vi' ? 'Chọn ga di sản muốn đến:' : 'Select your destination ticket:'}</span>
          </div>

          {HERITAGE_STOPS.map((stop) => {
            const isSealed = sealedStops.includes(stop.id);
            const visitedCountInStop = stop.hotspots.filter((h) =>
              visitedHotspots.includes(`${stop.id}:${h.id}`)
            ).length;

            return (
              <button
                key={stop.id}
                onClick={() => handleTicketClick(stop.id)}
                className={`group relative w-full p-3 sm:p-3.5 rounded-xl text-left transition-all duration-200 flex items-center justify-between border ${
                  isSealed
                    ? 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:bg-amber-900/50'
                    : 'bg-stone-900/80 hover:bg-stone-850 border-stone-700/80 hover:border-amber-500/60 shadow-md'
                }`}
              >
                {/* Left Ticket Info */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Station Number Badge */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm sm:text-base border ${
                      isSealed
                        ? 'bg-amber-500 text-stone-950 border-amber-300'
                        : 'bg-stone-800 text-stone-300 border-stone-600 group-hover:border-amber-400 group-hover:text-amber-300'
                    }`}
                  >
                    {stop.number}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-400/90 uppercase tracking-wider">
                        {stop.location[language]}
                      </span>
                      {isSealed && (
                        <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-700">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{language === 'vi' ? 'Đã nhận dấu' : 'Sealed'}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm sm:text-base font-serif font-bold text-stone-100 group-hover:text-amber-200 transition">
                      {stop.title[language]}
                    </h2>
                    <span className="text-[11px] text-stone-400 font-serif line-clamp-1">
                      {stop.subtitle[language]}
                    </span>
                  </div>
                </div>

                {/* Right Action / Status */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-mono text-stone-400 block">
                      {visitedCountInStop}/3 {language === 'vi' ? 'dấu vết' : 'relics'}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-800 group-hover:bg-amber-500 group-hover:text-stone-950 flex items-center justify-center text-stone-300 transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
