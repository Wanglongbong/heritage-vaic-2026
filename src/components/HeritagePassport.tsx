/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HERITAGE_STOPS } from '../data/heritage';
import { Language } from '../types';
import { GoldenCraneIcon, StationSealStamp, ArtifactSpriteRenderer } from '../utils/visualAssets';
import { generatePassportJSON, downloadPassportJSON, printPassportDocument } from '../utils/passportExport';
import { Download, Printer, X, ShieldCheck, BookmarkCheck, Award, Calendar, Sparkles } from 'lucide-react';

interface HeritagePassportProps {
  language: Language;
  sealedStops: string[];
  visitedHotspots: string[];
  onClose: () => void;
}

export function HeritagePassport({
  language,
  sealedStops,
  visitedHotspots,
  onClose,
}: HeritagePassportProps) {
  const handleExportJSON = () => {
    const data = generatePassportJSON(HERITAGE_STOPS, sealedStops, visitedHotspots, language);
    downloadPassportJSON(data);
  };

  const handlePrintPDF = () => {
    printPassportDocument();
  };

  const todayStr = new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="passport-title"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] print:max-h-none bg-[#fbf9f4] text-stone-900 border-4 border-[#854d0e] rounded-3xl shadow-2xl overflow-y-auto print:border-none print:shadow-none p-6 sm:p-10 flex flex-col gap-8 select-text">
        {/* Floating Action Controls */}
        <div className="flex items-center justify-between border-b-2 border-[#ca8a04]/40 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <GoldenCraneIcon className="w-7 h-7 text-[#b45309]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#78350f] font-bold">
              {language === 'vi' ? 'HỘ CHIẾU DI SẢN CHÍNH THỨC' : 'OFFICIAL HERITAGE PASSPORT'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-mono transition shadow"
              title="Print / Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'In / Lưu PDF' : 'Print / PDF'}</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-mono transition shadow font-bold"
              title="Download structured JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Xuất JSON' : 'Export JSON'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 transition ml-2"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Passport Identity Cover Header */}
        <div className="relative text-center border-b border-[#ca8a04]/30 pb-6">
          {/* Faint Golden Crane Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
            <GoldenCraneIcon className="w-64 h-64 text-[#b45309]" />
          </div>

          <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#92400e] uppercase">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM · BẢO TỒN DI SẢN
          </span>
          <h1 id="passport-title" className="text-2xl sm:text-3xl font-serif font-bold text-[#451a03] mt-2 mb-1">
            {language === 'vi' ? 'HỘ CHIẾU DI SẢN VIỆT NAM' : 'VIETNAM HERITAGE PASSPORT'}
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-stone-600">
            {language === 'vi'
              ? 'Chứng thực hành trình khám phá 05 di sản văn hóa phi vật thể và làng nghề truyền thống'
              : 'Official certificate for exploring 05 intangible cultural heritages and craft villages'}
          </p>

          {/* Identity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 text-left max-w-2xl mx-auto bg-[#f5efe4] p-4 rounded-xl border border-[#d6c7b0]">
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block">
                {language === 'vi' ? 'Người lữ hành' : 'Bearer'}
              </span>
              <span className="text-xs font-serif font-bold text-stone-800">
                {language === 'vi' ? 'Khách Lữ Hành' : 'Heritage Traveler'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block">
                {language === 'vi' ? 'Ga hoàn tất' : 'Sealed Stations'}
              </span>
              <span className="text-xs font-serif font-bold text-[#b45309]">
                {sealedStops.length} / 5
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block">
                {language === 'vi' ? 'Vật phẩm mở khóa' : 'Discovered Relics'}
              </span>
              <span className="text-xs font-serif font-bold text-[#b45309]">
                {visitedHotspots.length} / 15
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-500 block">
                {language === 'vi' ? 'Ngày chứng thực' : 'Issued Date'}
              </span>
              <span className="text-xs font-serif font-bold text-stone-800">
                {todayStr}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: The 5 Official Station Seals */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-[#b45309]" />
            <h2 className="text-lg font-serif font-bold text-[#451a03]">
              {language === 'vi' ? 'Con dấu Di sản 5 Ga' : 'The 5 Heritage Station Seals'}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {HERITAGE_STOPS.map((stop) => {
              const isSealed = sealedStops.includes(stop.id);
              return (
                <div key={stop.id} className="flex flex-col items-center">
                  <StationSealStamp
                    stationNumber={stop.number}
                    stationTitle={stop.title[language]}
                    location={stop.location[language]}
                    isSealed={isSealed}
                    className="w-28 h-28"
                  />
                  <span className="text-[11px] font-serif font-bold text-stone-800 mt-2 text-center">
                    {stop.title[language]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Discovered Artifacts & Source Records */}
        <div className="pt-4 border-t border-[#ca8a04]/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#b45309]" />
              <h2 className="text-lg font-serif font-bold text-[#451a03]">
                {language === 'vi' ? 'Kho hồ sơ 15 vật phẩm đã thu thập' : 'Collected Dossier: 15 Artifacts'}
              </h2>
            </div>
            <span className="text-xs font-mono text-stone-500">
              {visitedHotspots.length}/15 {language === 'vi' ? 'vật phẩm' : 'artifacts'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HERITAGE_STOPS.flatMap((stop) =>
              stop.hotspots.map((h) => {
                const isVisited = visitedHotspots.includes(`${stop.id}:${h.id}`);
                if (!isVisited) return null;

                return (
                  <div
                    key={h.id}
                    className="bg-[#f5efe4] border border-[#d6c7b0] rounded-xl p-3.5 flex gap-3 shadow-sm"
                  >
                    <div className="w-16 h-16 shrink-0 bg-[#eaddc7] rounded-lg p-1 flex items-center justify-center border border-[#c7b599]">
                      <ArtifactSpriteRenderer artifactId={h.id} face="front" />
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-[#92400e] uppercase font-bold">
                          {stop.title[language]}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] text-emerald-700 font-mono">
                          <BookmarkCheck className="w-3 h-3" />
                          <span>UNESCO</span>
                        </span>
                      </div>
                      <h3 className="text-xs font-serif font-bold text-stone-900 mt-0.5">
                        {h.label[language]}
                      </h3>
                      <p className="text-[11px] font-serif text-stone-600 line-clamp-2 mt-1 leading-snug">
                        {h.story[language]}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Curatorial & Legal Rights Footer */}
        <div className="pt-6 border-t-2 border-[#ca8a04]/40 text-center text-xs text-stone-500 space-y-1">
          <div className="flex items-center justify-center gap-1 font-mono text-[#92400e]">
            <ShieldCheck className="w-4 h-4" />
            <span>05 UNESCO DOSSIERS · 15 VERIFIED RECORDS · NO CULTURAL FABRICATION</span>
          </div>
          <p className="font-serif italic text-[11px]">
            {language === 'vi'
              ? 'Tàu Di Sản Việt Nam — Hành trình lưu giữ ký ức đang sống của văn hóa dân tộc.'
              : 'Vietnam Heritage Express — Preserving living memories of national cultural heritage.'}
          </p>
        </div>
      </div>
    </div>
  );
}
