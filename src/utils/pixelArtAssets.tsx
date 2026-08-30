/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArtifactFace } from '../types';

// ==========================================
// 16-BIT PIXEL ART PALETTES & PATTERNS
// ==========================================

export const PIXEL_PALETTE = {
  // Heritage Gold & Amber
  goldLight: '#fef08a',
  goldMid: '#facc15',
  goldDark: '#ca8a04',
  goldDeep: '#854d0e',
  amberGlow: '#f59e0b',

  // Traditional Lacquer Vermilion & Crimson
  redLight: '#f87171',
  redMid: '#dc2626',
  redDark: '#991b1b',
  redDeep: '#450a0a',

  // Deep Vietnamese Indigo & Imperial Blue
  blueLight: '#93c5fd',
  blueMid: '#2563eb',
  blueDark: '#1e3a8a',
  blueNight: '#0f172a',

  // Terracotta & River Clay
  clayLight: '#fdba74',
  clayMid: '#ea580c',
  clayDark: '#9a3412',
  clayDeep: '#431407',

  // Tropical Emerald & Lotus
  greenLight: '#86efac',
  greenMid: '#16a34a',
  greenDark: '#14532d',
  lotusPink: '#f472b6',
  lotusDark: '#db2777',

  // Ancient Wood & Earth
  woodLight: '#d6d3d1',
  woodMid: '#78716c',
  woodDark: '#44403c',
  woodDeep: '#1c1917',
  pitchBlack: '#0c0a09',
};

// ==========================================
// PIXEL CRANE LOGO (CHIM HẠC ĐÔNG SƠN PIXEL)
// ==========================================
export function PixelCraneIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shape-rendering-crispEdges`} style={{ imageRendering: 'pixelated' }}>
      {/* 24x24 authentic pixel grid Đông Sơn Crane */}
      {/* Beak & Head */}
      <rect x="18" y="2" width="2" height="1" fill="#facc15" />
      <rect x="16" y="3" width="3" height="2" fill="#facc15" />
      <rect x="17" y="3" width="1" height="1" fill="#000" />
      <rect x="14" y="4" width="3" height="2" fill="#facc15" />
      {/* Crest */}
      <rect x="12" y="1" width="3" height="1" fill="#fef08a" />
      <rect x="13" y="2" width="3" height="1" fill="#facc15" />
      {/* Long Curved Neck */}
      <rect x="13" y="5" width="2" height="2" fill="#eab308" />
      <rect x="12" y="7" width="2" height="2" fill="#ca8a04" />
      <rect x="11" y="9" width="2" height="2" fill="#ca8a04" />
      <rect x="10" y="11" width="3" height="2" fill="#ca8a04" />
      {/* Body */}
      <rect x="7" y="12" width="7" height="4" fill="#ca8a04" />
      <rect x="8" y="13" width="5" height="2" fill="#facc15" />
      {/* Extended Flight Wings */}
      <rect x="3" y="8" width="6" height="2" fill="#eab308" />
      <rect x="4" y="10" width="5" height="2" fill="#ca8a04" />
      <rect x="1" y="6" width="4" height="2" fill="#fef08a" />
      <rect x="0" y="5" width="2" height="1" fill="#fef08a" />
      <rect x="2" y="7" width="3" height="1" fill="#fde047" />
      {/* Tail Feathers */}
      <rect x="4" y="14" width="3" height="2" fill="#a16207" />
      <rect x="2" y="15" width="3" height="1" fill="#ca8a04" />
      <rect x="1" y="16" width="2" height="1" fill="#eab308" />
      {/* Slender Long Legs */}
      <rect x="9" y="16" width="1" height="6" fill="#854d0e" />
      <rect x="11" y="16" width="1" height="5" fill="#854d0e" />
      {/* Claws */}
      <rect x="8" y="22" width="3" height="1" fill="#a16207" />
      <rect x="10" y="21" width="3" height="1" fill="#a16207" />
    </svg>
  );
}

// ==========================================
// RETRO PIXEL TRAIN CONDUCTOR SPRITE
// ==========================================
export function PixelConductorSprite({ className = 'w-48 h-64' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} select-none`}>
      <svg
        viewBox="0 0 64 80"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Shadow */}
        <ellipse cx="32" cy="76" rx="20" ry="3" fill="#000000" opacity="0.6" />

        {/* 1. Conductor Kép Cap (Mũ kepi đường sắt) */}
        <rect x="20" y="8" width="24" height="3" fill="#1c1917" />
        <rect x="22" y="5" width="20" height="4" fill="#292524" />
        <rect x="24" y="3" width="16" height="3" fill="#44403c" />
        {/* Gold Cap Band & Insignia */}
        <rect x="22" y="9" width="20" height="2" fill="#ca8a04" />
        <rect x="30" y="6" width="4" height="3" fill="#facc15" />
        <rect x="31" y="7" width="2" height="1" fill="#fef08a" />
        {/* Cap Visor (Lưỡi trai) */}
        <rect x="18" y="11" width="28" height="2" fill="#0c0a09" />

        {/* 2. Face & Hair */}
        <rect x="22" y="13" width="20" height="13" fill="#fcd34d" />
        {/* Hair sideburns */}
        <rect x="20" y="13" width="2" height="6" fill="#1c1917" />
        <rect x="42" y="13" width="2" height="6" fill="#1c1917" />
        {/* Eyes (warm & focused) */}
        <rect x="26" y="17" width="3" height="2" fill="#1c1917" />
        <rect x="27" y="17" width="1" height="1" fill="#ffffff" />
        <rect x="35" y="17" width="3" height="2" fill="#1c1917" />
        <rect x="36" y="17" width="1" height="1" fill="#ffffff" />
        {/* Eyebrows */}
        <rect x="25" y="15" width="5" height="1" fill="#292524" />
        <rect x="34" y="15" width="5" height="1" fill="#292524" />
        {/* Nose */}
        <rect x="31" y="19" width="2" height="3" fill="#f59e0b" />
        {/* Warm Mustache & Smile */}
        <rect x="28" y="23" width="8" height="2" fill="#451a03" />
        <rect x="30" y="24" width="4" height="1" fill="#fef08a" />

        {/* 3. Collar & Heritage Red Scarf */}
        <rect x="26" y="26" width="12" height="3" fill="#ffffff" />
        <rect x="30" y="27" width="4" height="5" fill="#dc2626" />
        <rect x="31" y="28" width="2" height="7" fill="#b91c1c" />

        {/* 4. Conductor Jacket Uniform (Áo đại lễ đường sắt) */}
        <rect x="16" y="29" width="32" height="25" fill="#1c1917" />
        {/* Golden Lapels */}
        <polygon points="22,29 27,29 29,38 22,35" fill="#ca8a04" />
        <polygon points="42,29 37,29 35,38 42,35" fill="#ca8a04" />
        {/* Brass Buttons */}
        <rect x="31" y="36" width="2" height="2" fill="#facc15" />
        <rect x="31" y="41" width="2" height="2" fill="#facc15" />
        <rect x="31" y="46" width="2" height="2" fill="#facc15" />
        {/* Breast Pocket with Heritage Pocket Watch Chain */}
        <rect x="20" y="35" width="6" height="1" fill="#292524" />
        <path d="M 23 36 Q 28 42 31 41" stroke="#facc15" strokeWidth="1" fill="none" />

        {/* 5. Arms & White Gloves holding Heritage Lantern */}
        {/* Left Arm */}
        <rect x="11" y="30" width="5" height="16" fill="#1c1917" />
        <rect x="10" y="46" width="6" height="5" fill="#f5f5f4" />
        {/* Right Arm Holding Gold Ticket Puncher */}
        <rect x="48" y="30" width="5" height="14" fill="#1c1917" />
        <rect x="48" y="44" width="6" height="5" fill="#f5f5f4" />
        <rect x="52" y="43" width="3" height="7" fill="#facc15" />
        <rect x="53" y="44" width="1" height="4" fill="#78350f" />

        {/* 6. Trousers & Polished Leather Boots */}
        <rect x="20" y="54" width="10" height="18" fill="#1c1917" />
        <rect x="34" y="54" width="10" height="18" fill="#1c1917" />
        <rect x="30" y="54" width="4" height="6" fill="#0c0a09" />
        {/* Boots */}
        <rect x="18" y="70" width="12" height="5" fill="#000000" />
        <rect x="20" y="71" width="8" height="2" fill="#44403c" />
        <rect x="34" y="70" width="12" height="5" fill="#000000" />
        <rect x="36" y="71" width="8" height="2" fill="#44403c" />
      </svg>
    </div>
  );
}

// ==========================================
// 16-BIT PIXEL ART SCENES (5 HERITAGE STATIONS)
// ==========================================

export function PixelSceneBackground({
  stopId,
  isFullyAwakened = false,
  className = 'w-full h-full object-cover',
}: {
  stopId: string;
  isFullyAwakened?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      <svg
        viewBox="0 0 320 180"
        className="w-full h-full shape-rendering-crispEdges"
        preserveAspectRatio="xMidYMid slice"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* RENDER 16-BIT PIXEL ART STATIONS */}
        {stopId === 'quan-ho' && <PixelQuanHoScene />}
        {stopId === 'ca-tru' && <PixelCaTruScene />}
        {stopId === 'nha-nhac' && <PixelNhaNhacScene />}
        {stopId === 'cham-pottery' && <PixelChamPotteryScene />}
        {stopId === 'don-ca-tai-tu' && <PixelDonCaTaiTuScene />}
      </svg>
    </div>
  );
}

// ----------------------------------------------------
// GA 01: QUAN HỌ KINH BẮC (DRAGON BOAT, LOTUS, BANYAN)
// ----------------------------------------------------
function PixelQuanHoScene() {
  return (
    <g>
      {/* 1. Sky & Dawn Mountain Gradients */}
      <rect x="0" y="0" width="320" height="80" fill="#1c1917" />
      <rect x="0" y="15" width="320" height="25" fill="#292524" opacity="0.8" />
      <rect x="0" y="35" width="320" height="20" fill="#451a03" />
      <rect x="0" y="55" width="320" height="25" fill="#78350f" />
      <rect x="0" y="70" width="320" height="15" fill="#b45309" />

      {/* Sun / Moon with Pixel Glow */}
      <rect x="230" y="18" width="24" height="24" fill="#fde047" />
      <rect x="232" y="16" width="20" height="28" fill="#fef08a" />
      <rect x="234" y="14" width="16" height="32" fill="#ffffff" />

      {/* Distant Kinh Bắc Pagoda Silhouette (Chùa Bút Tháp / Chùa Dâu) */}
      <rect x="40" y="45" width="16" height="4" fill="#1c1917" />
      <rect x="44" y="35" width="8" height="10" fill="#1c1917" />
      <rect x="42" y="33" width="12" height="2" fill="#1c1917" />
      <rect x="46" y="24" width="4" height="9" fill="#1c1917" />
      <rect x="44" y="22" width="8" height="2" fill="#1c1917" />
      <rect x="47" y="16" width="2" height="6" fill="#1c1917" />

      {/* Ancient Banyan Tree Foliage (Cây Đa Quán Dốc) */}
      <rect x="0" y="10" width="35" height="60" fill="#14532d" />
      <rect x="5" y="5" width="25" height="15" fill="#16a34a" />
      <rect x="15" y="20" width="28" height="35" fill="#15803d" />
      <rect x="0" y="40" width="12" height="45" fill="#451a03" />
      <rect x="8" y="55" width="6" height="30" fill="#78350f" />

      {/* 2. Cầu Vồng / Thuyền Rồng Water Surface */}
      <rect x="0" y="85" width="320" height="95" fill="#0f172a" />
      {/* Water ripple bands */}
      <rect x="0" y="90" width="320" height="6" fill="#1e293b" />
      <rect x="0" y="102" width="320" height="8" fill="#1e3a8a" />
      <rect x="0" y="118" width="320" height="12" fill="#172554" />
      <rect x="0" y="140" width="320" height="40" fill="#090d16" />

      {/* Water reflection of Sun */}
      <rect x="228" y="90" width="28" height="4" fill="#d97706" opacity="0.6" />
      <rect x="232" y="102" width="20" height="3" fill="#f59e0b" opacity="0.7" />
      <rect x="236" y="116" width="12" height="2" fill="#fde047" opacity="0.5" />

      {/* 3. Detailed Traditional Quan Họ Dragon Boat (Thuyền Rồng Quan Họ) */}
      {/* Boat Hull */}
      <polygon points="70,120 250,120 230,138 90,138" fill="#78350f" />
      <rect x="80" y="120" width="160" height="4" fill="#b45309" />
      <rect x="85" y="124" width="150" height="3" fill="#451a03" />
      {/* Dragon Head Prow (Đầu Rồng dát vàng) */}
      <rect x="245" y="110" width="14" height="12" fill="#ca8a04" />
      <rect x="252" y="104" width="10" height="8" fill="#eab308" />
      <rect x="258" y="100" width="6" height="5" fill="#facc15" />
      <rect x="262" y="102" width="4" height="2" fill="#dc2626" />
      <rect x="256" y="106" width="2" height="2" fill="#000000" />
      {/* Dragon Tail Stern */}
      <rect x="62" y="114" width="10" height="8" fill="#ca8a04" />
      <rect x="56" y="108" width="8" height="8" fill="#eab308" />

      {/* Canopy / Mui Thuyền */}
      <polygon points="110,105 210,105 200,95 120,95" fill="#dc2626" />
      <rect x="118" y="93" width="84" height="3" fill="#facc15" />
      {/* Canopy Poles */}
      <rect x="122" y="98" width="2" height="22" fill="#ca8a04" />
      <rect x="196" y="98" width="2" height="22" fill="#ca8a04" />

      {/* 4. Liền Anh & Liền Chị (Singers) */}
      {/* Liền Chị with Nón Quai Thao */}
      <ellipse cx="145" cy="98" rx="14" ry="4" fill="#fde047" />
      <rect x="141" y="94" width="8" height="4" fill="#f59e0b" />
      <rect x="142" y="100" width="6" height="6" fill="#fcd34d" />
      <rect x="138" y="106" width="14" height="14" fill="#dc2626" />
      <rect x="141" y="106" width="8" height="14" fill="#f59e0b" />

      {/* Liền Anh with Khăn Xếp Áo The */}
      <rect x="170" y="96" width="8" height="4" fill="#18181b" />
      <rect x="171" y="100" width="6" height="6" fill="#fcd34d" />
      <rect x="166" y="106" width="16" height="14" fill="#1e3a8a" />
      {/* Black silk umbrella (Ô lục soạn) */}
      <ellipse cx="175" cy="88" rx="12" ry="4" fill="#09090b" />
      <rect x="174" y="92" width="2" height="14" fill="#44403c" />

      {/* 5. Foreground Lotus Pond (Hoa sen & Lá sen) */}
      {/* Lotus leaf 1 */}
      <ellipse cx="280" cy="155" rx="22" ry="8" fill="#15803d" />
      <ellipse cx="280" cy="154" rx="18" ry="6" fill="#16a34a" />
      {/* Pink Lotus Blossom */}
      <polygon points="280,140 286,148 274,148" fill="#f472b6" />
      <polygon points="280,142 284,148 276,148" fill="#ffffff" />
      {/* Lotus leaf 2 */}
      <ellipse cx="30" cy="165" rx="26" ry="9" fill="#15803d" />
      <ellipse cx="30" cy="164" rx="20" ry="7" fill="#16a34a" />
      <polygon points="35,152 40,160 30,160" fill="#f472b6" />
    </g>
  );
}

// ----------------------------------------------------
// GA 02: CA TRÙ THĂNG LONG (SALON, INCENSE, LUTE, DRUM)
// ----------------------------------------------------
function PixelCaTruScene() {
  return (
    <g>
      {/* 1. Dark Lacquer Salon Interior */}
      <rect x="0" y="0" width="320" height="180" fill="#09090b" />
      <rect x="0" y="0" width="320" height="40" fill="#1c0d0d" />
      <rect x="0" y="40" width="320" height="80" fill="#2d1313" />

      {/* Floor with Woven Bamboo Mat (Chiếu hoa son) */}
      <polygon points="20,120 300,120 320,180 0,180" fill="#78350f" />
      <polygon points="40,125 280,125 300,175 20,175" fill="#fef3c7" />
      {/* Red border of Chiếu Cạp Điều */}
      <polygon points="36,123 284,123 288,127 32,127" fill="#dc2626" />
      <polygon points="20,171 300,171 304,175 16,175" fill="#dc2626" />
      <line x1="40" y1="125" x2="20" y2="175" stroke="#dc2626" strokeWidth="4" />
      <line x1="280" y1="125" x2="300" y2="175" stroke="#dc2626" strokeWidth="4" />

      {/* 2. Antique Carved Wooden Screen (Bức Bình Phong) */}
      <rect x="60" y="30" width="200" height="85" fill="#1c1917" stroke="#ca8a04" strokeWidth="2" />
      <rect x="70" y="38" width="55" height="70" fill="#292524" />
      <rect x="132" y="38" width="55" height="70" fill="#292524" />
      <rect x="195" y="38" width="55" height="70" fill="#292524" />
      {/* Calligraphy / Chrysanthemum Pattern on Screen */}
      <line x1="97" y1="45" x2="97" y2="95" stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />
      <line x1="160" y1="45" x2="160" y2="95" stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />
      <line x1="222" y1="45" x2="222" y2="95" stroke="#d97706" strokeWidth="2" strokeDasharray="3 3" />

      {/* 3. Glowing Red Silk Lanterns (Đèn Lồng Lụa Đỏ) */}
      <rect x="40" y="15" width="16" height="24" fill="#dc2626" />
      <rect x="42" y="12" width="12" height="30" fill="#ef4444" />
      <rect x="46" y="20" width="4" height="14" fill="#fef08a" />
      <line x1="48" y1="0" x2="48" y2="12" stroke="#ca8a04" strokeWidth="1" />
      <line x1="48" y1="42" x2="48" y2="52" stroke="#dc2626" strokeWidth="2" />

      <rect x="264" y="15" width="16" height="24" fill="#dc2626" />
      <rect x="266" y="12" width="12" height="30" fill="#ef4444" />
      <rect x="270" y="20" width="4" height="14" fill="#fef08a" />
      <line x1="272" y1="0" x2="272" y2="12" stroke="#ca8a04" strokeWidth="1" />
      <line x1="272" y1="42" x2="272" y2="52" stroke="#dc2626" strokeWidth="2" />

      {/* 4. Bronze Incense Urn with Spiraling Smoke (Lư Hương Trầm) */}
      <rect x="154" y="105" width="12" height="8" fill="#ca8a04" />
      <rect x="156" y="113" width="8" height="4" fill="#854d0e" />
      {/* Smoke particles */}
      <rect x="158" y="98" width="2" height="4" fill="#e2e8f0" opacity="0.6" />
      <rect x="162" y="88" width="3" height="6" fill="#cbd5e1" opacity="0.5" />
      <rect x="159" y="76" width="4" height="8" fill="#94a3b8" opacity="0.4" />
      <rect x="165" y="62" width="5" height="10" fill="#64748b" opacity="0.3" />

      {/* 5. Trio Ensemble: Ca Nương, Kép Đàn, Quan Viên */}
      {/* Left: Kép Đàn with Đàn Đáy */}
      <rect x="70" y="110" width="10" height="10" fill="#fcd34d" />
      <rect x="68" y="108" width="14" height="4" fill="#18181b" />
      <rect x="64" y="120" width="22" height="24" fill="#1e3a8a" />
      {/* Đàn Đáy long neck & trapezoid body */}
      <line x1="82" y1="80" x2="82" y2="145" stroke="#f59e0b" strokeWidth="2" />
      <polygon points="76,140 88,140 92,160 72,160" fill="#78350f" stroke="#ca8a04" strokeWidth="1" />

      {/* Center: Ca Nương with Phách */}
      <rect x="152" y="122" width="16" height="14" fill="#fcd34d" />
      {/* Khăn mỏ quạ */}
      <polygon points="150,122 170,122 160,132" fill="#09090b" />
      <rect x="144" y="136" width="32" height="30" fill="#b91c1c" />
      <rect x="152" y="136" width="16" height="30" fill="#f59e0b" />
      {/* Bamboo Phách Bar & 2 Strikers */}
      <rect x="150" y="162" width="20" height="4" fill="#78350f" />
      <line x1="154" y1="152" x2="158" y2="162" stroke="#fde047" strokeWidth="2" />
      <line x1="166" y1="152" x2="162" y2="162" stroke="#fde047" strokeWidth="2" />

      {/* Right: Quan Viên with Trống Chầu */}
      <rect x="240" y="110" width="10" height="10" fill="#fcd34d" />
      <rect x="238" y="108" width="14" height="4" fill="#18181b" />
      <rect x="234" y="120" width="22" height="24" fill="#15803d" />
      {/* Trống Chầu Drum on stand */}
      <ellipse cx="228" cy="148" rx="10" ry="12" fill="#ea580c" stroke="#451a03" strokeWidth="2" />
      <rect x="224" y="138" width="8" height="2" fill="#facc15" />
      {/* Drumstick (Roi chầu) */}
      <line x1="236" y1="135" x2="228" y2="142" stroke="#fef08a" strokeWidth="2" />
    </g>
  );
}

// ----------------------------------------------------
// GA 03: NHÃ NHẠC CUNG ĐÌNH HUẾ (NGỌ MÔN & ORCHESTRA)
// ----------------------------------------------------
function PixelNhaNhacScene() {
  return (
    <g>
      {/* 1. Twilight Imperial Sky */}
      <rect x="0" y="0" width="320" height="70" fill="#171717" />
      <rect x="0" y="20" width="320" height="30" fill="#451a03" />
      <rect x="0" y="45" width="320" height="25" fill="#78350f" />

      {/* 2. Ngọ Môn Gate (Cổng Ngọ Môn Đại Nội) */}
      {/* Massive stone bastion base (Tầng đài đá) */}
      <rect x="30" y="65" width="260" height="45" fill="#57534e" />
      <rect x="30" y="65" width="260" height="4" fill="#78716c" />
      {/* 3 Arched Portals (3 Cửa vòm) */}
      <rect x="145" y="80" width="30" height="30" rx="15" fill="#0c0a09" />
      <rect x="90" y="85" width="22" height="25" rx="11" fill="#0c0a09" />
      <rect x="208" y="85" width="22" height="25" rx="11" fill="#0c0a09" />

      {/* Lầu Ngũ Phụng (Pavilion of Five Phoenixes on top) */}
      {/* Royal Yellow Tiled Curved Roof (Mái ngói Hoàng Lưu Ly) */}
      <polygon points="50,45 270,45 250,30 70,30" fill="#eab308" />
      <polygon points="75,30 245,30 230,18 90,18" fill="#ca8a04" />
      <rect x="155" y="12" width="10" height="6" fill="#facc15" />
      {/* Royal Red Pillars */}
      <rect x="75" y="45" width="6" height="20" fill="#991b1b" />
      <rect x="110" y="45" width="6" height="20" fill="#991b1b" />
      <rect x="157" y="45" width="6" height="20" fill="#991b1b" />
      <rect x="204" y="45" width="6" height="20" fill="#991b1b" />
      <rect x="239" y="45" width="6" height="20" fill="#991b1b" />

      {/* 3. Courtyard Flag Banners (Cờ ngũ sắc cung đình) */}
      <rect x="45" y="35" width="2" height="70" fill="#ca8a04" />
      <polygon points="47,38 70,46 47,54" fill="#dc2626" stroke="#facc15" strokeWidth="1" />
      <rect x="273" y="35" width="2" height="70" fill="#ca8a04" />
      <polygon points="273,38 250,46 273,54" fill="#2563eb" stroke="#facc15" strokeWidth="1" />

      {/* 4. Imperial Flagstone Courtyard (Sân Đại Triều Nghi) */}
      <rect x="0" y="110" width="320" height="70" fill="#292524" />
      <line x1="0" y1="125" x2="320" y2="125" stroke="#44403c" strokeWidth="2" />
      <line x1="0" y1="145" x2="320" y2="145" stroke="#44403c" strokeWidth="2" />

      {/* 5. Royal Musicians in Dragon Robes & Grand Drum (Đại Nhạc) */}
      {/* Grand Imperial Drum (Trống Đại Nhạc sơn son thiếp vàng) */}
      <rect x="140" y="120" width="40" height="30" rx="6" fill="#dc2626" stroke="#ca8a04" strokeWidth="2" />
      <ellipse cx="160" cy="135" rx="10" ry="12" fill="#ca8a04" />
      <circle cx="160" cy="135" r="4" fill="#fef08a" />
      {/* Drum Stand (Giá trống gỗ chạm rồng) */}
      <rect x="136" y="145" width="6" height="25" fill="#451a03" />
      <rect x="178" y="145" width="6" height="25" fill="#451a03" />

      {/* Court Musicians Left (Kèn Bầu, Trống Chiến) */}
      <rect x="90" y="125" width="10" height="10" fill="#fcd34d" />
      <rect x="88" y="123" width="14" height="4" fill="#ca8a04" />
      <rect x="84" y="135" width="22" height="32" fill="#eab308" />
      {/* Trumpet Horn (Kèn Bầu) */}
      <line x1="98" y1="130" x2="115" y2="125" stroke="#facc15" strokeWidth="3" />
      <polygon points="115,121 124,125 115,129" fill="#ca8a04" />

      {/* Court Musicians Right (Đàn Tỳ Bà, Tam Âm La) */}
      <rect x="220" y="125" width="10" height="10" fill="#fcd34d" />
      <rect x="218" y="123" width="14" height="4" fill="#ca8a04" />
      <rect x="214" y="135" width="22" height="32" fill="#eab308" />
      {/* Pear-shaped Lute (Đàn Tỳ Bà) */}
      <ellipse cx="210" cy="145" rx="6" ry="12" fill="#78350f" stroke="#ca8a04" strokeWidth="1" />
    </g>
  );
}

// ----------------------------------------------------
// GA 04: GỐM CHĂM BÀU TRÚC (WORKYARD, POTTER, FIRING)
// ----------------------------------------------------
function PixelChamPotteryScene() {
  return (
    <g>
      {/* 1. Hot Sun-Drenched Ninh Thuận Sky & Dunes */}
      <rect x="0" y="0" width="320" height="60" fill="#451a03" />
      <rect x="0" y="20" width="320" height="30" fill="#7c2d12" />
      <rect x="0" y="45" width="320" height="25" fill="#c2410c" />
      <rect x="0" y="60" width="320" height="25" fill="#ea580c" />

      {/* Red Sand Dunes (Đồi cát Nam Cương) */}
      <polygon points="0,70 120,45 240,65 320,50 320,95 0,95" fill="#9a3412" />
      <polygon points="40,85 180,60 300,75 320,95 0,95" fill="#c2410c" />

      {/* 2. Clay Workyard Ground (Sân phơi & nhào đất sông Quao) */}
      <rect x="0" y="90" width="320" height="90" fill="#7c2d12" />
      <rect x="0" y="110" width="320" height="70" fill="#431407" />

      {/* Piles of Fine River Sand & Raw Clay (Đất sét & cát mịn sông Quao) */}
      <ellipse cx="60" cy="115" rx="35" ry="12" fill="#9a3412" />
      <ellipse cx="60" cy="112" rx="25" ry="8" fill="#ea580c" />
      <ellipse cx="45" cy="120" rx="15" ry="5" fill="#fdba74" />

      {/* 3. Open-Air Firing Pile (Nung gốm lộ thiên bằng rơm củi) */}
      {/* Wood logs base */}
      <rect x="230" y="135" width="60" height="6" fill="#1c1917" />
      <rect x="235" y="130" width="50" height="5" fill="#292524" />
      {/* Clay pots nestled in firing */}
      <ellipse cx="250" cy="122" rx="12" ry="14" fill="#c2410c" stroke="#431407" strokeWidth="2" />
      <ellipse cx="270" cy="125" rx="10" ry="12" fill="#9a3412" stroke="#431407" strokeWidth="2" />
      {/* Dancing Flames & Glowing Embers */}
      <polygon points="245,135 250,105 255,135" fill="#f97316" />
      <polygon points="255,135 260,95 265,135" fill="#ef4444" />
      <polygon points="265,135 272,100 278,135" fill="#facc15" />
      <polygon points="275,135 282,110 288,135" fill="#f97316" />
      {/* Pixel Embers floating up */}
      <rect x="252" y="85" width="2" height="2" fill="#fde047" />
      <rect x="268" y="75" width="3" height="3" fill="#f97316" />
      <rect x="260" y="65" width="2" height="2" fill="#fde047" />

      {/* 4. Cham Master Artisan shaping clay without a wheel (Đi giật lùi tạo hình) */}
      {/* Clay Jar on pedestal */}
      <rect x="145" y="135" width="20" height="15" fill="#292524" />
      <ellipse cx="155" cy="115" rx="16" ry="22" fill="#ea580c" stroke="#7c2d12" strokeWidth="2" />
      {/* Cham Traditional Geometric Incised Motifs (Văn sóng nước & răng cưa) */}
      <path d="M 143 115 Q 155 110 167 115" stroke="#facc15" strokeWidth="2" fill="none" />
      <path d="M 145 122 Q 155 118 165 122" stroke="#431407" strokeWidth="1" fill="none" />

      {/* Artisan Woman (Nghệ nhân nữ Chăm trong trang phục Khăn Mat'ra) */}
      <rect x="120" y="100" width="10" height="10" fill="#fcd34d" />
      {/* Cham White & Gold Mat'ra Scarf */}
      <rect x="116" y="96" width="18" height="8" fill="#f8fafc" />
      <rect x="118" y="98" width="14" height="2" fill="#ca8a04" />
      {/* Traditional Green / Indigo Tunic */}
      <rect x="114" y="110" width="18" height="36" fill="#15803d" />
      {/* Embroidered Belt (Talei Ka-in) */}
      <rect x="114" y="122" width="18" height="4" fill="#dc2626" />
      {/* Hands touching clay with wet cloth (Miếng vải cuộn) */}
      <line x1="128" y1="116" x2="142" y2="114" stroke="#fcd34d" strokeWidth="3" />
    </g>
  );
}

// ----------------------------------------------------
// GA 05: ĐỜN CA TÀI TỬ (MEKONG CANAL, MOON, PALMS)
// ----------------------------------------------------
function PixelDonCaTaiTuScene() {
  return (
    <g>
      {/* 1. Southern Tropical Night Sky */}
      <rect x="0" y="0" width="320" height="90" fill="#090d16" />
      <rect x="0" y="25" width="320" height="30" fill="#0f172a" />
      <rect x="0" y="50" width="320" height="40" fill="#1e293b" />

      {/* Luminous Full Moon (Trăng Vàng Miền Tây) */}
      <circle cx="250" cy="30" r="16" fill="#fef08a" />
      <circle cx="250" cy="30" r="14" fill="#ffffff" />
      <circle cx="248" cy="28" r="12" fill="#fef08a" />

      {/* Coconut Palm Fronds Silhouettes (Rặng Dừa Nước Bến Sông) */}
      <path d="M 0 0 Q 60 20 80 55 M 0 20 Q 70 35 90 70 M 0 40 Q 50 60 70 90" stroke="#14532d" strokeWidth="4" fill="none" />
      <path d="M 320 10 Q 270 30 250 60 M 320 30 Q 260 50 240 80" stroke="#14532d" strokeWidth="4" fill="none" />

      {/* 2. Mekong River Surface & Gentle Moon Reflections */}
      <rect x="0" y="90" width="320" height="90" fill="#0284c7" opacity="0.3" />
      <rect x="0" y="105" width="320" height="75" fill="#0369a1" opacity="0.4" />
      <rect x="0" y="125" width="320" height="55" fill="#075985" opacity="0.6" />
      <rect x="0" y="145" width="320" height="35" fill="#0c4a6e" />

      {/* Moon Reflection on River */}
      <rect x="242" y="92" width="16" height="3" fill="#fef08a" opacity="0.6" />
      <rect x="240" y="105" width="20" height="3" fill="#fde047" opacity="0.7" />
      <rect x="238" y="120" width="24" height="2" fill="#facc15" opacity="0.6" />
      <rect x="244" y="135" width="12" height="2" fill="#ca8a04" opacity="0.5" />

      {/* Wooden Sampan Floating on River (Ghe Xuồng Ba Lá) */}
      <polygon points="20,135 110,135 95,150 35,150" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
      <rect x="30" y="133" width="70" height="2" fill="#b45309" />

      {/* 3. Riverside Wooden Porch (Chòi Gỗ Bến Sông) */}
      <polygon points="90,110 320,110 320,180 70,180" fill="#44403c" />
      <polygon points="100,112 320,112 320,175 80,175" fill="#78716c" />
      {/* Wood planks */}
      <line x1="120" y1="112" x2="100" y2="175" stroke="#292524" strokeWidth="2" />
      <line x1="180" y1="112" x2="160" y2="175" stroke="#292524" strokeWidth="2" />
      <line x1="240" y1="112" x2="220" y2="175" stroke="#292524" strokeWidth="2" />

      {/* Warm Kerosene Oil Lamp (Đèn Hoa Kỳ) */}
      <rect x="195" y="125" width="8" height="12" fill="#fef08a" />
      <polygon points="197,125 201,115 197,115" fill="#f97316" />
      <rect x="193" y="137" width="12" height="4" fill="#ca8a04" />
      {/* Lamp glow aura */}
      <circle cx="199" cy="125" r="20" fill="#fef08a" opacity="0.15" />

      {/* 4. Tài Tử Ensemble: Đàn Kìm & Đàn Tranh Masters */}
      {/* Left: Master playing Đàn Kìm (Đàn Nguyệt) */}
      <rect x="140" y="115" width="10" height="10" fill="#fcd34d" />
      <rect x="138" y="113" width="14" height="4" fill="#18181b" />
      {/* Áo bà ba nâu sồng */}
      <rect x="134" y="125" width="22" height="28" fill="#78350f" />
      {/* Đàn Kìm circular body & long neck */}
      <circle cx="158" cy="138" r="10" fill="#ca8a04" stroke="#451a03" strokeWidth="1.5" />
      <line x1="148" y1="115" x2="158" y2="145" stroke="#fde047" strokeWidth="2" />

      {/* Right: Master playing Đàn Tranh (16 strings) */}
      <rect x="230" y="115" width="10" height="10" fill="#fcd34d" />
      <rect x="228" y="113" width="14" height="4" fill="#18181b" />
      {/* Áo bà ba lụa */}
      <rect x="224" y="125" width="22" height="28" fill="#2563eb" />
      {/* Đàn Tranh long curved wooden board & bridges */}
      <polygon points="210,138 270,132 265,145 205,150" fill="#854d0e" stroke="#ca8a04" strokeWidth="1" />
      <line x1="215" y1="138" x2="260" y2="134" stroke="#fef08a" strokeWidth="0.8" />
    </g>
  );
}

// ==========================================
// 16-BIT PIXEL ART ARTIFACTS (15 RELICS IN 4 FACES)
// ==========================================

export function PixelArtifactSprite({
  artifactId,
  face = 'front',
  className = 'w-full h-full object-contain',
}: {
  artifactId: string;
  face?: ArtifactFace;
  className?: string;
}) {
  const isProfile = face === 'right' || face === 'left';
  const flip = face === 'left' ? -1 : 1;

  return (
    <div className={`relative flex items-center justify-center p-2 select-none ${className}`}>
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full max-h-56 drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)]"
        style={{ imageRendering: 'pixelated' }}
      >
        <g transform={`translate(32, 32) scale(${flip}, 1) translate(-32, -32)`}>
          {renderPixelArtifactGrid(artifactId, face, isProfile)}
        </g>
      </svg>
    </div>
  );
}

function renderPixelArtifactGrid(id: string, face: ArtifactFace, isProfile: boolean) {
  switch (id) {
    // 01 QUAN HO
    case 'quan-ho-hat':
      return (
        <g>
          {/* Nón quai thao broad circular hat with red silk tassels */}
          <ellipse cx="32" cy="24" rx={isProfile ? 14 : 26} ry={isProfile ? 6 : 10} fill="#ca8a04" />
          <ellipse cx="32" cy="23" rx={isProfile ? 12 : 23} ry={isProfile ? 5 : 8} fill="#fef08a" />
          {/* Center crown */}
          <rect x={isProfile ? "26" : "24"} y="18" width={isProfile ? "12" : "16"} height="6" rx="2" fill="#facc15" />
          {/* Red Silk Ribbon Tassels (Quai thao điều) */}
          <line x1={isProfile ? "28" : "20"} y1="26" x2={isProfile ? "30" : "22"} y2="54" stroke="#dc2626" strokeWidth="3" />
          <line x1={isProfile ? "36" : "44"} y1="26" x2={isProfile ? "34" : "42"} y2="54" stroke="#dc2626" strokeWidth="3" />
          {/* Tassel Ends */}
          <circle cx={isProfile ? "30" : "22"} cy="56" r="2.5" fill="#991b1b" />
          <circle cx={isProfile ? "34" : "42"} cy="56" r="2.5" fill="#991b1b" />
        </g>
      );

    case 'quan-ho-singing':
      return (
        <g>
          {/* Paired Singers in Áo Tứ Thân & Khăn Mỏ Quạ */}
          {/* Singer 1 */}
          <circle cx="22" cy="18" r="5" fill="#fcd34d" />
          <polygon points="17,16 27,16 22,22" fill="#18181b" />
          <polygon points="14,24 30,24 28,52 16,52" fill="#dc2626" />
          <rect x="19" y="24" width="6" height="28" fill="#f59e0b" />
          {/* Singer 2 */}
          <circle cx="42" cy="18" r="5" fill="#fcd34d" />
          <rect x="37" y="14" width="10" height="3" fill="#1e3a8a" />
          <polygon points="34,24 50,24 48,52 36,52" fill="#2563eb" />
          {/* Sound Harmony Wave */}
          <path d="M 28 30 Q 32 26 36 30" stroke="#fef08a" strokeWidth="2" fill="none" />
        </g>
      );

    case 'quan-ho-book':
      return (
        <g>
          {/* Ancient Calligraphy Accordion Manuscript */}
          <rect x={isProfile ? "18" : "12"} y="12" width={isProfile ? "28" : "40"} height="40" fill="#fef3c7" stroke="#78350f" strokeWidth="2" />
          <rect x={isProfile ? "20" : "15"} y="15" width={isProfile ? "24" : "34"} height="34" fill="#fffbeb" />
          {/* Calligraphic notation lines */}
          <line x1="18" y1="22" x2="46" y2="22" stroke="#b45309" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="18" y1="30" x2="46" y2="30" stroke="#b45309" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="18" y1="38" x2="46" y2="38" stroke="#b45309" strokeWidth="2" strokeDasharray="3 2" />
          {/* Vermilion Stamp Seal */}
          <rect x="36" y="36" width="8" height="8" fill="#dc2626" />
        </g>
      );

    // 02 CA TRU
    case 'ca-tru-dan-day':
      return (
        <g>
          {/* Đàn Đáy long neck and trapezoid body */}
          <rect x="30" y="6" width="4" height="36" fill="#ca8a04" stroke="#451a03" strokeWidth="1" />
          {/* Headstock & 3 pegs */}
          <rect x="28" y="4" width="8" height="4" fill="#78350f" />
          <line x1="26" y1="6" x2="38" y2="6" stroke="#ca8a04" strokeWidth="1.5" />
          {/* Trapezoid bottomless body */}
          <polygon
            points={isProfile ? "26,40 38,40 36,58 28,58" : "20,40 44,40 48,58 16,58"}
            fill="#78350f"
            stroke="#292524"
            strokeWidth="2"
          />
          <ellipse cx="32" cy="58" rx={isProfile ? "4" : "12"} ry="2" fill="#000000" />
        </g>
      );

    case 'ca-tru-bo-phach':
      return (
        <g>
          {/* Bamboo Phách Bar & Dual Strikers */}
          <rect x="12" y="32" width="40" height="12" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <rect x="14" y="34" width="36" height="8" fill="#ca8a04" />
          {/* 2 Wooden strikers crossing */}
          <line x1="22" y1="12" x2="30" y2="36" stroke="#fde047" strokeWidth="3" />
          <line x1="42" y1="12" x2="34" y2="36" stroke="#fde047" strokeWidth="3" />
        </g>
      );

    case 'ca-tru-trong-chau':
      return (
        <g>
          {/* Trống Chầu & Roi Chầu */}
          <rect x="20" y="24" width="24" height="26" rx="4" fill="#dc2626" stroke="#451a03" strokeWidth="2" />
          <ellipse cx="32" cy="24" rx="12" ry="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
          <ellipse cx="32" cy="50" rx="12" ry="5" fill="#ca8a04" stroke="#451a03" strokeWidth="1" />
          {/* Wooden Drumstick (Roi Chầu) */}
          <line x1="44" y1="14" x2="32" y2="28" stroke="#fde047" strokeWidth="3" />
        </g>
      );

    // 03 NHA NHAC
    case 'nha-nhac-drum':
      return (
        <g>
          {/* Trống Đại Nhạc Hoàng Cung */}
          <rect x="14" y="18" width="36" height="30" rx="6" fill="#b91c1c" stroke="#facc15" strokeWidth="2" />
          <ellipse cx="32" cy="33" rx="12" ry="12" fill="#ca8a04" />
          <circle cx="32" cy="33" r="5" fill="#fef08a" />
          {/* Wooden Stand */}
          <rect x="12" y="48" width="4" height="12" fill="#451a03" />
          <rect x="48" y="48" width="4" height="12" fill="#451a03" />
        </g>
      );

    case 'nha-nhac-wind':
      return (
        <g>
          {/* Kèn Bầu & Sáo Khí Nhạc Hoàng Cung */}
          <line x1="16" y1="46" x2="44" y2="18" stroke="#facc15" strokeWidth="4" />
          <polygon points="40,14 48,14 48,22" fill="#ca8a04" />
          <circle cx="16" cy="46" r="4" fill="#78350f" />
        </g>
      );

    case 'nha-nhac-court':
      return (
        <g>
          {/* Ngọ Môn Palace Architecture */}
          <polygon points="8,26 56,26 48,16 16,16" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          <rect x="14" y="26" width="36" height="24" fill="#991b1b" stroke="#450a0a" strokeWidth="1.5" />
          {/* 3 Arched Doors */}
          <rect x="28" y="36" width="8" height="14" rx="4" fill="#000" />
          <rect x="18" y="39" width="6" height="11" rx="3" fill="#000" />
          <rect x="40" y="39" width="6" height="11" rx="3" fill="#000" />
        </g>
      );

    // 04 CHAM POTTERY
    case 'cham-raw-clay':
      return (
        <g>
          {/* Đất sét & Cát sông Quao */}
          <ellipse cx="32" cy="38" rx="22" ry="14" fill="#9a3412" />
          <ellipse cx="32" cy="34" rx="16" ry="10" fill="#ea580c" />
          <ellipse cx="28" cy="30" rx="8" ry="5" fill="#fdba74" />
        </g>
      );

    case 'cham-shaping':
      return (
        <g>
          {/* Cham Ceramic Pot & Hand Paddle */}
          <ellipse cx="32" cy="34" rx="18" ry="20" fill="#ea580c" stroke="#7c2d12" strokeWidth="2" />
          <rect x="22" y="14" width="20" height="4" rx="2" fill="#9a3412" />
          {/* Wave Motif */}
          <path d="M 18 34 Q 32 30 46 34" stroke="#facc15" strokeWidth="2" fill="none" />
        </g>
      );

    case 'cham-firing':
      return (
        <g>
          {/* Open Air Fire & Pot */}
          <ellipse cx="32" cy="36" rx="14" ry="16" fill="#c2410c" stroke="#431407" strokeWidth="2" />
          {/* Fire Flames */}
          <polygon points="18,48 24,18 30,48" fill="#f97316" />
          <polygon points="26,48 32,10 38,48" fill="#ef4444" />
          <polygon points="34,48 40,16 46,48" fill="#facc15" />
        </g>
      );

    // 05 DON CA TAI TU
    case 'tai-tu-dan-kim':
      return (
        <g>
          {/* Đàn Kìm Moon Lute */}
          <circle cx="32" cy="38" r="16" fill="#ca8a04" stroke="#451a03" strokeWidth="2" />
          <circle cx="32" cy="38" r="12" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          {/* Long Neck & Headstock */}
          <rect x="30" y="8" width="4" height="20" fill="#78350f" />
          <polygon points="28,8 36,8 35,4 29,4" fill="#f59e0b" />
          <line x1="26" y1="6" x2="38" y2="6" stroke="#451a03" strokeWidth="2" />
        </g>
      );

    case 'tai-tu-dan-tranh':
      return (
        <g>
          {/* Đàn Tranh 16 Strings */}
          <polygon
            points={isProfile ? "24,12 40,12 36,52 28,52" : "16,12 48,12 42,52 22,52"}
            fill="#854d0e"
            stroke="#451a03"
            strokeWidth="2"
          />
          {/* 16 Bridges */}
          <line x1="22" y1="24" x2="26" y2="24" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="32" x2="32" y2="32" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="40" x2="38" y2="40" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
        </g>
      );

    case 'tai-tu-riverside':
      return (
        <g>
          {/* Sampan on river with full moon */}
          <circle cx="46" cy="18" r="8" fill="#fef08a" />
          <polygon points="12,42 52,42 46,52 18,52" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <path d="M 6 56 Q 32 52 58 56" stroke="#0284c7" strokeWidth="2" fill="none" />
        </g>
      );

    default:
      return (
        <rect x="16" y="16" width="32" height="32" fill="#ca8a04" />
      );
  }
}
