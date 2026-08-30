/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'vi' | 'en';

export interface LocalizedText {
  vi: string;
  en: string;
}

export type ReviewStatus = 'approved' | 'pending-expert-review' | 'rejected';

export interface SourceRecord {
  id: string;
  title: LocalizedText;
  institution: string;
  url: string;
  accessedAt: string;
  status: ReviewStatus;
  reviewedBy: string;
  rights: LocalizedText;
}

export type AudioRole =
  | 'heritage-ensemble-excerpt'
  | 'educational-soundscape'
  | 'ambient-train'
  | 'artifact-preview';

export interface AudioAsset {
  id: string;
  kind: 'recorded' | 'simulated';
  src: string;
  sourceUrl: string;
  creator: string;
  license: string;
  licenseUrl?: string;
  credit: LocalizedText;
  role: AudioRole;
  reviewStatus: ReviewStatus;
  note: LocalizedText;
  durationSeconds: number;
}

export type ArtifactFace = 'front' | 'right' | 'back' | 'left';

export interface ArtifactViews {
  front: string;
  right: string;
  back: string;
  left: string;
}

export interface HeritageHotspot {
  id: string;
  label: LocalizedText;
  kicker: LocalizedText;
  story: LocalizedText;
  facts: LocalizedText[];
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  radius: number; // proximity radius in percentage
  sprite: string;
  views: ArtifactViews;
  sourceIds: string[];
  audioPreview?: {
    title: LocalizedText;
    note: LocalizedText;
    soundType: string;
  };
}

export interface HeritageUnlock {
  requiredHotspotIds: [string, string, string];
  title: LocalizedText;
  message: LocalizedText;
  audio: AudioAsset;
}

export interface HeritageStop {
  id: string;
  number: string;
  location: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  sceneImage: string;
  palette: {
    primary: string;
    accent: string;
    glow: string;
    darkBg: string;
  };
  sourceIds: string[];
  soundscapeType: string;
  hotspots: [HeritageHotspot, HeritageHotspot, HeritageHotspot];
  unlock: HeritageUnlock;
}

export type GamePhase = 'landing' | 'carriage' | 'travelling' | 'heritage' | 'ending';

export interface GameProgress {
  visitedHotspots: string[]; // "stopId:hotspotId"
  sealedStops: string[]; // stopId
  currentStopId: string;
  language: Language;
  muted: boolean;
}
