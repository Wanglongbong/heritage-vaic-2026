/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { HeritageHotspot, Language } from '../types';
import { SOURCE_REGISTRY } from '../data/heritage';
import { HandTrackingViewer } from './HandTrackingViewer';
import { soundEngine } from '../utils/soundEngine';
import { X, ExternalLink, ShieldCheck, Volume2, BookmarkCheck, Info } from 'lucide-react';

interface RecordDrawerProps {
  hotspot: HeritageHotspot | null;
  stationTitle: string;
  language: Language;
  onClose: () => void;
}

export function RecordDrawer({ hotspot, stationTitle, language, onClose }: RecordDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!hotspot) return null;

  const handlePlayAudioPreview = () => {
    if (hotspot.audioPreview) {
      soundEngine.playArtifactPreview(hotspot.audioPreview.soundType);
    }
  };

  const sources = hotspot.sourceIds
    .map((id) => SOURCE_REGISTRY[id])
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-stone-950 border border-amber-600/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={language === 'vi' ? 'Đóng hồ sơ' : 'Close record'}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white transition border border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: 4-Angle Hand Tracking & Visual Turntable */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 bg-gradient-to-b from-stone-900/90 to-stone-950 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-stone-800/80 overflow-y-auto">
          <div className="w-full text-left mb-3">
            <span className="text-xs font-mono tracking-widest text-amber-400 uppercase font-bold">
              {stationTitle} · {language === 'vi' ? 'HỒ SƠ HIỆN VẬT' : 'ARTIFACT DOSSIER'}
            </span>
            <h3 id="record-title" className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 mt-1">
              {hotspot.label[language]}
            </h3>
          </div>

          <div className="w-full my-2">
            <HandTrackingViewer
              artifactId={hotspot.id}
              artifactName={hotspot.label[language]}
              language={language}
            />
          </div>

          {/* Audio Preview button if available */}
          {hotspot.audioPreview && (
            <div className="w-full mt-3 p-3 rounded-xl bg-stone-900/80 border border-stone-700/70 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-stone-200">
                <Volume2 className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-amber-200 text-sm sm:text-base">{hotspot.audioPreview.title[language]}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{hotspot.audioPreview.note[language]}</div>
                </div>
              </div>
              <button
                onClick={handlePlayAudioPreview}
                className="px-3.5 py-1.5 text-xs sm:text-sm rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition shrink-0 ml-2 shadow"
              >
                {language === 'vi' ? 'Nghe thử' : 'Listen'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Curatorial Story, Verified Facts, Sources */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Kicker badge */}
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-md bg-amber-950/90 border border-amber-500/50 text-amber-300 text-xs sm:text-sm font-mono font-bold">
                {hotspot.kicker[language]}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold">
                <BookmarkCheck className="w-4 h-4" />
                <span>{language === 'vi' ? 'Đã thẩm định nguồn' : 'Verified Source'}</span>
              </div>
            </div>

            {/* Story narrative */}
            <div className="text-stone-200 text-base sm:text-lg leading-relaxed font-serif">
              {hotspot.story[language]}
            </div>

            {/* Verified Facts List */}
            <div className="space-y-2.5 pt-3 border-t border-stone-800">
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-400 font-bold block">
                {language === 'vi' ? 'Dữ kiện di sản đã xác minh:' : 'Verified Heritage Facts:'}
              </span>
              <ul className="space-y-2.5">
                {hotspot.facts.map((fact, idx) => (
                  <li
                    key={idx}
                    className="text-sm sm:text-base text-stone-200 bg-stone-900/70 p-3.5 rounded-lg border-l-4 border-amber-500 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="text-amber-400 text-sm mt-0.5 shrink-0 select-none">✦</span>
                    <span>{fact[language]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Source Reference Registry Badges */}
            <div className="pt-3 border-t border-stone-800 space-y-2.5">
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-stone-400 font-bold block">
                {language === 'vi' ? 'Hồ sơ nguồn lưu trữ:' : 'Archival Source Records:'}
              </span>
              <div className="space-y-2">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    className="bg-stone-900/90 border border-stone-800 rounded-lg p-3 flex flex-col gap-1.5 text-xs sm:text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-200 text-sm">{src.institution}</span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs font-semibold hover:underline"
                      >
                        <span>{language === 'vi' ? 'Xem hồ sơ gốc' : 'Official Record'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="text-xs text-stone-300 leading-normal">{src.rights[language]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Dialog Action */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-stone-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{language === 'vi' ? 'Không chứa nội dung AI hư cấu' : 'No AI cultural fabrication'}</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold transition shadow-lg"
            >
              {language === 'vi' ? 'Đóng hồ sơ' : 'Close Record'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
