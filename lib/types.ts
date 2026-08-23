export type Language = "vi" | "en";

export type LocalizedText = {
  vi: string;
  en: string;
};

export type SourceRecord = {
  id: string;
  title: LocalizedText;
  institution: string;
  url: string;
  status: "approved" | "pending" | "restricted";
  reviewedBy: string;
  rights: LocalizedText;
  accessedAt: string;
};

export type AudioReviewStatus =
  | "approved-local"
  | "approved-original"
  | "pending-rights"
  | "restricted";

export type AudioRole =
  | "heritage-ensemble-excerpt"
  | "official-reference"
  | "licensed-field-recording"
  | "modern-ambient"
  | "interpretive-foley";

/**
 * Rights metadata is deliberately required even when no file is served.
 * A null `src` means the source is reference-only or synthesized in-browser;
 * it must never be treated as permission to download or re-host a recording.
 */
export type AudioAsset = {
  id: string;
  kind: "local-audio" | "official-source" | "youtube-embed" | "synthesized";
  src: string | null;
  sourceUrl: string;
  /** Optional external player URL. Never downloaded or re-hosted by the game. */
  embedUrl?: string;
  creator: string;
  license: string;
  licenseUrl?: string;
  credit: LocalizedText;
  role: AudioRole;
  reviewStatus: AudioReviewStatus;
  note: LocalizedText;
  durationSeconds?: number;
  bytes?: number;
  sha256?: string;
  technical?: string;
  generatorPreset?:
    | "carriage"
    | "kinh-bac-air"
    | "hanoi-room"
    | "hue-courtyard"
    | "cham-workyard"
    | "southern-riverside";
};

export type MediaAsset = {
  kind: "audio" | "official-link" | "animation";
  src?: string;
  sourceUrl?: string;
  creator?: string;
  license?: string;
  credit?: LocalizedText;
  role?: AudioRole;
  reviewStatus?: AudioReviewStatus;
};

export type Hotspot = {
  id: string;
  artifactSprite: string;
  label: LocalizedText;
  kicker: LocalizedText;
  story: LocalizedText;
  facts: LocalizedText[];
  x: number;
  y: number;
  radius: number;
  interaction: "story" | "audio" | "animation";
  sourceIds: string[];
  media?: MediaAsset;
  audioPreview?: AudioAsset;
  suggestedQuestions: [LocalizedText, LocalizedText, LocalizedText];
};

export type HeritageStop = {
  id: string;
  number: string;
  location: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  scene: string;
  palette: string;
  sourceIds: string[];
  soundscape: AudioAsset;
  hotspots: Hotspot[];
  unlock?: {
    requiredHotspotIds: string[];
    audio: AudioAsset;
    message: LocalizedText;
  };
};
