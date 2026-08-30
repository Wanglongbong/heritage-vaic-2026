/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types';
import { GoldenCraneIcon } from '../utils/visualAssets';
import { soundEngine } from '../utils/soundEngine';
import { Volume2, VolumeX, Globe, ArrowRight, ShieldCheck, Compass, Sparkles } from 'lucide-react';

interface LandingCoverProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onStartJourney: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export function LandingCover({
  language,
  onLanguageChange,
  onStartJourney,
  isMuted,
  onToggleMute,
}: LandingCoverProps) {
  const handleStart = () => {
    soundEngine.initAudioContext();
    soundEngine.playChime(523.25, 0.4);
    soundEngine.startAmbientRailway();
    onStartJourney();
  };

  return (
    <div className="relative w-full h-[100dvh] bg-stone-950 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden text-stone-100">
      {/* Background 16-Bit Pixel Art Cinematic Atmosphere */}
      <div className="absolute inset-0 z-0">
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full object-cover shape-rendering-crispEdges"
          preserveAspectRatio="xMidYMid slice"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Dawn Sky with Pixel Gradient */}
          <rect x="0" y="0" width="320" height="180" fill="#0c0a09" />
          <rect x="0" y="0" width="320" height="40" fill="#1c1917" />
          <rect x="0" y="40" width="320" height="35" fill="#451a03" />
          <rect x="0" y="75" width="320" height="30" fill="#78350f" />
          <rect x="0" y="105" width="320" height="20" fill="#b45309" />

          {/* Pixel Rising Sun & Radiance */}
          <circle cx="160" cy="95" r="30" fill="#facc15" />
          <circle cx="160" cy="95" r="20" fill="#fef08a" />
          <circle cx="160" cy="95" r="10" fill="#ffffff" />

          {/* Distant Mountain Peaks Silhouette */}
          <polygon points="0,110 60,75 120,95 180,65 240,90 320,70 320,180 0,180" fill="#1c1917" />
          <polygon points="0,120 70,85 140,105 210,80 280,100 320,85 320,180 0,180" fill="#0c0a09" />

          {/* Flying White Storks across the Sunrise */}
          <path d="M 90 45 L 94 42 L 98 45" stroke="#ffffff" strokeWidth="1" fill="none" />
          <path d="M 105 52 L 109 49 L 113 52" stroke="#ffffff" strokeWidth="1" fill="none" />
          <path d="M 220 40 L 225 36 L 230 40" stroke="#ffffff" strokeWidth="1" fill="none" />

          {/* 16-Bit Railway Perspective */}
          <polygon points="160,115 162,115 280,180 40,180" fill="#292524" />

          {/* Wooden Sleepers */}
          <line x1="156" y1="120" x2="166" y2="120" stroke="#78350f" strokeWidth="2" />
          <line x1="148" y1="128" x2="174" y2="128" stroke="#78350f" strokeWidth="2" />
          <line x1="136" y1="138" x2="186" y2="138" stroke="#78350f" strokeWidth="3" />
          <line x1="118" y1="150" x2="204" y2="150" stroke="#78350f" strokeWidth="4" />
          <line x1="95" y1="165" x2="227" y2="165" stroke="#78350f" strokeWidth="5" />
          <line x1="65" y1="180" x2="257" y2="180" stroke="#78350f" strokeWidth="6" />

          {/* Steel Rails */}
          <line x1="159" y1="115" x2="60" y2="180" stroke="#94a3b8" strokeWidth="2" />
          <line x1="163" y1="115" x2="260" y2="180" stroke="#94a3b8" strokeWidth="2" />

          {/* Glowing Headlight Beam */}
          <polygon points="160,115 10,180 310,180" fill="#fef08a" opacity="0.2" />

          {/* Heritage Locomotive Engine at center */}
          <g transform="translate(136, 88)">
            <rect x="8" y="14" width="32" height="20" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
            <rect x="4" y="26" width="40" height="8" fill="#dc2626" />
            {/* Smokestack & Golden Steam Clouds */}
            <rect x="12" y="6" width="6" height="8" fill="#475569" />
            <circle cx="15" cy="2" r="4" fill="#cbd5e1" opacity="0.7" />
            <circle cx="11" cy="-4" r="6" fill="#94a3b8" opacity="0.5" />
            <circle cx="18" cy="-10" r="8" fill="#64748b" opacity="0.3" />
            {/* Golden Headlight */}
            <circle cx="24" cy="24" r="6" fill="#facc15" />
            <circle cx="24" cy="24" r="3" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Subtle Starry & Dust Grain Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none z-10" />

      {/* Top Header: Mute & Language Controls */}
      <div className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-stone-900/80 border border-amber-500/40 backdrop-blur-md">
            <GoldenCraneIcon className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-[11px] font-mono tracking-widest text-amber-400 font-bold uppercase hidden sm:inline">
            TÀU DI SẢN VIỆT NAM · 2.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700/80 text-stone-300 transition backdrop-blur-md"
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-stone-900/80 border border-stone-700/80 p-1 backdrop-blur-md font-mono text-xs">
            <button
              onClick={() => onLanguageChange('vi')}
              className={`px-2.5 py-1 rounded-lg transition ${
                language === 'vi' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              VI
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-lg transition ${
                language === 'en' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Center Branding & Start Button */}
      <div className="relative z-20 w-full max-w-3xl mx-auto text-center flex flex-col items-center gap-4 my-auto">
        <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.3em] text-amber-400 uppercase">
          {language === 'vi' ? 'HÀNH TRÌNH TƯƠNG TÁC BẮC – NAM' : 'INTERACTIVE NORTH–SOUTH EXPEDITION'}
        </span>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-amber-100 tracking-tight leading-tight drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          {language === 'vi' ? 'Tàu Di Sản Việt Nam' : 'Vietnam Heritage Express'}
        </h1>

        <p className="text-base sm:text-xl font-serif italic text-amber-200/90 max-w-xl">
          {language === 'vi'
            ? 'Chạm vào ký ức đang sống của 5 di sản văn hóa phi vật thể'
            : 'Touching the living memories of 5 UNESCO intangible cultural heritages'}
        </p>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="mt-6 group px-8 sm:px-12 py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-red-600 hover:from-amber-500 hover:to-red-500 text-stone-950 font-serif font-bold text-base sm:text-lg tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 transform hover:scale-105 flex items-center gap-3 active:scale-95"
        >
          <span>{language === 'vi' ? 'BẮT ĐẦU HÀNH TRÌNH' : 'BEGIN JOURNEY'}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Verification Footer */}
      <div className="relative z-20 w-full max-w-4xl mx-auto text-center border-t border-stone-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-2 font-mono">
        <div className="flex items-center gap-1.5 text-amber-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>05 UNESCO FILES · 15 VERIFIED RECORDS · NO CULTURAL FABRICATION</span>
        </div>

        <div className="flex items-center gap-2 text-stone-500 text-[11px]">
          <span>Quan họ · Ca trù · Nhã nhạc · Gốm Chăm · Đờn ca tài tử</span>
        </div>
      </div>
    </div>
  );
}
