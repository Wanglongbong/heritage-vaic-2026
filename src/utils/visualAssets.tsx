/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArtifactFace } from '../types';
import {
  PixelCraneIcon,
  PixelConductorSprite,
  PixelSceneBackground,
  PixelArtifactSprite,
} from './pixelArtAssets';

export {
  PixelCraneIcon,
  PixelConductorSprite,
  PixelSceneBackground,
  PixelArtifactSprite,
};

export function GoldenCraneIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return <PixelCraneIcon className={className} />;
}

export function StationSealStamp({
  stationNumber,
  stationTitle,
  location,
  date = '2026',
  isSealed = false,
  className = 'w-28 h-28',
}: {
  stationNumber: string;
  stationTitle: string;
  location: string;
  date?: string;
  isSealed?: boolean;
  className?: string;
}) {
  if (!isSealed) {
    return (
      <div
        className={`${className} rounded-2xl border-2 border-dashed border-stone-700/80 flex flex-col items-center justify-center p-2 text-center text-stone-500 select-none bg-stone-950/60 shadow-inner`}
        style={{ imageRendering: 'pixelated' }}
      >
        <span className="text-[10px] font-mono tracking-widest text-amber-500/70 font-bold uppercase">
          GA {stationNumber}
        </span>
        <span className="text-xs font-serif text-stone-400 mt-0.5 line-clamp-1">{stationTitle}</span>
        <span className="text-[9px] text-stone-600 mt-1 font-mono uppercase tracking-wider">CHƯA KHÁM PHÁ</span>
      </div>
    );
  }

  return (
    <div
      className={`${className} relative rounded-2xl border-2 border-amber-500/90 bg-gradient-to-b from-amber-950/80 to-stone-950/90 p-2.5 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(245,158,11,0.3)] select-none`}
      style={{ imageRendering: 'pixelated' }}
    >
      <div className="absolute inset-1 rounded-xl border border-amber-500/30 pointer-events-none" />

      {/* Top arc text */}
      <span className="text-[8px] font-mono font-bold tracking-widest text-amber-400 uppercase">
        DI SẢN · GA {stationNumber}
      </span>

      {/* Center 16-bit crane stamp */}
      <div className="my-0.5 text-amber-400 flex items-center justify-center">
        <PixelCraneIcon className="w-6 h-6 text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
      </div>

      {/* Station name */}
      <span className="text-[10px] font-serif font-bold text-amber-100 leading-tight px-1 max-w-[96px] truncate">
        {stationTitle}
      </span>

      {/* Location / verified stamp */}
      <div className="mt-0.5 flex items-center gap-1 text-[7px] font-mono text-amber-400/90">
        <span>{location.split('·')[0].trim()}</span>
        <span>•</span>
        <span>{date}</span>
      </div>
    </div>
  );
}

// Visual Renderer for Artifacts across 4 angles (front, right, back, left)
export function ArtifactSpriteRenderer({
  artifactId,
  face = 'front',
  className = 'w-full h-full object-contain',
}: {
  artifactId: string;
  face?: ArtifactFace;
  className?: string;
}) {
  return (
    <PixelArtifactSprite
      artifactId={artifactId}
      face={face}
      className={className}
    />
  );
}

// Scene Canvas / Background Renderer for the 5 stations
export function SceneArtRenderer({
  stopId,
  isFullyAwakened = false,
  className = 'w-full h-full object-cover',
}: {
  stopId: string;
  isFullyAwakened?: boolean;
  className?: string;
}) {
  return (
    <PixelSceneBackground
      stopId={stopId}
      isFullyAwakened={isFullyAwakened}
      className={className}
    />
  );
}

// 16-bit Detailed Pixel Train Carriage Interior
export function CarriageSceneRenderer() {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-stone-950">
      <svg
        viewBox="0 0 320 180"
        className="w-full h-full shape-rendering-crispEdges"
        preserveAspectRatio="xMidYMid slice"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* 1. Mahogany Wood Carriage Wall Paneling */}
        <rect x="0" y="0" width="320" height="180" fill="#291004" />
        <rect x="0" y="0" width="320" height="16" fill="#1c0a02" />
        <line x1="0" y1="16" x2="320" y2="16" stroke="#ca8a04" strokeWidth="1" />

        {/* 2. Large Vintage Train Panoramic Windows */}
        <rect x="30" y="24" width="260" height="96" rx="4" fill="#0f172a" stroke="#ca8a04" strokeWidth="3" />

        {/* Landscape Outside Window (Moving Vietnam Landscape in Pixel Art) */}
        {/* Sky */}
        <rect x="32" y="26" width="256" height="50" fill="#0284c7" />
        <rect x="32" y="45" width="256" height="20" fill="#38bdf8" />
        <rect x="32" y="60" width="256" height="15" fill="#fde047" />

        {/* Sun Rising over Emerald Mountain Range */}
        <circle cx="210" cy="50" r="14" fill="#fef08a" />
        <polygon points="32,70 90,45 150,65 210,40 288,60 288,90 32,90" fill="#166534" />
        <polygon points="50,75 110,55 170,70 230,50 288,65 288,95 32,95" fill="#15803d" />

        {/* Emerald Terraced Rice Paddies & Flying White Storks */}
        <rect x="32" y="80" width="256" height="38" fill="#15803d" />
        <rect x="32" y="90" width="256" height="10" fill="#22c55e" />
        <rect x="32" y="100" width="256" height="18" fill="#14532d" />

        {/* Flying White Storks (Cò trắng) */}
        <path d="M 120 40 L 125 36 L 130 40" stroke="#ffffff" strokeWidth="1" fill="none" />
        <path d="M 140 46 L 144 43 L 148 46" stroke="#ffffff" strokeWidth="1" fill="none" />
        <path d="M 180 35 L 186 31 L 192 35" stroke="#ffffff" strokeWidth="1" fill="none" />

        {/* Window Center Pillars */}
        <rect x="115" y="24" width="4" height="96" fill="#1c0a02" />
        <rect x="200" y="24" width="4" height="96" fill="#1c0a02" />

        {/* Brass Window Latches */}
        <rect x="113" y="70" width="8" height="4" fill="#facc15" />
        <rect x="198" y="70" width="8" height="4" fill="#facc15" />

        {/* 3. Glowing Brass Sconce Lamps */}
        {/* Left Lamp */}
        <rect x="14" y="30" width="3" height="18" fill="#ca8a04" />
        <polygon points="12,48 19,48 17,58 14,58" fill="#facc15" />
        <rect x="14" y="50" width="3" height="6" fill="#ffffff" />
        <circle cx="15" cy="53" r="12" fill="#fef08a" opacity="0.18" />

        {/* Right Lamp */}
        <rect x="303" y="30" width="3" height="18" fill="#ca8a04" />
        <polygon points="301,48 308,48 306,58 303,58" fill="#facc15" />
        <rect x="303" y="50" width="3" height="6" fill="#ffffff" />
        <circle cx="304" cy="53" r="12" fill="#fef08a" opacity="0.18" />

        {/* 4. Luxury Velvet Seating & Polished Brass Handrail */}
        <rect x="0" y="128" width="320" height="52" fill="#991b1b" />
        <rect x="0" y="128" width="320" height="4" fill="#ca8a04" />
        <rect x="0" y="132" width="320" height="8" fill="#b91c1c" />
        <rect x="0" y="140" width="320" height="40" fill="#7f1d1d" />

        {/* Cushion Tufting Details */}
        <line x1="40" y1="135" x2="40" y2="175" stroke="#450a0a" strokeWidth="1" strokeDasharray="2 4" />
        <line x1="100" y1="135" x2="100" y2="175" stroke="#450a0a" strokeWidth="1" strokeDasharray="2 4" />
        <line x1="160" y1="135" x2="160" y2="175" stroke="#450a0a" strokeWidth="1" strokeDasharray="2 4" />
        <line x1="220" y1="135" x2="220" y2="175" stroke="#450a0a" strokeWidth="1" strokeDasharray="2 4" />
        <line x1="280" y1="135" x2="280" y2="175" stroke="#450a0a" strokeWidth="1" strokeDasharray="2 4" />
      </svg>
    </div>
  );
}

// Ticket Conductor Character
export function TicketConductorRenderer({ className = 'w-48 h-64' }: { className?: string }) {
  return <PixelConductorSprite className={className} />;
}

// 16-Bit Pixel Railway Travelling Transition Scene
export function TrainExpressTravellingRenderer({
  destinationName = 'Huế',
}: {
  destinationName?: string;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-950 select-none">
      <svg
        viewBox="0 0 320 180"
        className="w-full h-full shape-rendering-crispEdges"
        preserveAspectRatio="xMidYMid slice"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Night / Dawn Sky */}
        <rect x="0" y="0" width="320" height="180" fill="#090d16" />
        <rect x="0" y="0" width="320" height="40" fill="#0f172a" />
        <rect x="0" y="40" width="320" height="30" fill="#1e293b" />
        <rect x="0" y="70" width="320" height="25" fill="#334155" />

        {/* Pixel Stars */}
        <rect x="40" y="15" width="2" height="2" fill="#ffffff" />
        <rect x="90" y="25" width="1" height="1" fill="#ffffff" />
        <rect x="160" y="10" width="2" height="2" fill="#fef08a" />
        <rect x="240" y="20" width="2" height="2" fill="#ffffff" />
        <rect x="290" y="12" width="1" height="1" fill="#ffffff" />

        {/* Coastal Ocean & Limestone Peaks (Vịnh Hạ Long / Đèo Hải Vân) */}
        <polygon points="0,110 50,75 120,95 190,65 270,90 320,70 320,180 0,180" fill="#0c121e" />
        <polygon points="0,120 70,85 140,105 210,80 290,100 320,85 320,180 0,180" fill="#040711" />

        {/* 16-Bit Perspective Railway Track */}
        <polygon points="160,105 162,105 250,180 70,180" fill="#1e293b" />

        {/* Wooden Sleepers */}
        <line x1="156" y1="110" x2="166" y2="110" stroke="#451a03" strokeWidth="2" />
        <line x1="150" y1="118" x2="172" y2="118" stroke="#451a03" strokeWidth="2" />
        <line x1="140" y1="128" x2="182" y2="128" stroke="#451a03" strokeWidth="3" />
        <line x1="126" y1="142" x2="196" y2="142" stroke="#451a03" strokeWidth="4" />
        <line x1="108" y1="158" x2="214" y2="158" stroke="#451a03" strokeWidth="5" />
        <line x1="85" y1="175" x2="237" y2="175" stroke="#451a03" strokeWidth="6" />

        {/* Shiny Steel Rails */}
        <line x1="159" y1="105" x2="90" y2="180" stroke="#94a3b8" strokeWidth="2" />
        <line x1="163" y1="105" x2="232" y2="180" stroke="#94a3b8" strokeWidth="2" />

        {/* Locomotive Headlight Cone Beam */}
        <polygon points="160,105 30,180 290,180" fill="#fef08a" opacity="0.22" />

        {/* Heritage Steam Locomotive Silhouette Racing Forward */}
        <g transform="translate(138, 78)">
          {/* Main Boiler Body */}
          <rect x="8" y="12" width="28" height="18" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
          <rect x="4" y="24" width="36" height="6" fill="#dc2626" />
          {/* Smokestack & Glowing Steam */}
          <rect x="12" y="6" width="6" height="7" fill="#475569" />
          <circle cx="15" cy="2" r="3" fill="#cbd5e1" opacity="0.6" />
          <circle cx="12" cy="-4" r="5" fill="#94a3b8" opacity="0.4" />
          {/* Golden Headlight */}
          <circle cx="22" cy="21" r="5" fill="#facc15" />
          <circle cx="22" cy="21" r="2.5" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
