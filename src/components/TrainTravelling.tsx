/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { HeritageStop, Language } from '../types';
import { TrainExpressTravellingRenderer } from '../utils/visualAssets';
import { soundEngine } from '../utils/soundEngine';

interface TrainTravellingProps {
  stop: HeritageStop;
  language: Language;
  onComplete: () => void;
}

export function TrainTravelling({ stop, language, onComplete }: TrainTravellingProps) {
  useEffect(() => {
    soundEngine.playChime(392.0, 0.5);

    const timer = setTimeout(() => {
      onComplete();
    }, 2650);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative w-full h-[100dvh] bg-stone-950 flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Visual Travelling Canvas */}
      <div className="absolute inset-0 z-0">
        <TrainExpressTravellingRenderer destinationName={stop.title[language]} />
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-10" />

      {/* Destination Announcement Card */}
      <div className="relative z-20 text-center px-6 py-6 rounded-2xl bg-stone-950/85 border border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-md max-w-md w-full animate-fade-in">
        <span className="text-[11px] font-mono tracking-widest text-amber-400 font-bold uppercase block mb-1">
          {language === 'vi' ? 'ĐOÀN TÀU ĐANG ĐẾN' : 'NOW APPROACHING'}
        </span>
        <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block">
          GA {stop.number} · {stop.location[language]}
        </span>
        <h2 className="text-2xl font-serif font-bold text-amber-100 mt-2 mb-1">
          {stop.title[language]}
        </h2>
        <p className="text-xs text-stone-300 font-serif italic line-clamp-1">
          {stop.subtitle[language]}
        </p>

        {/* Progress Loading Track line */}
        <div className="w-full h-1 bg-stone-800 rounded-full mt-5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 animate-[progress_2.65s_linear_forwards]" />
        </div>
      </div>
    </div>
  );
}
