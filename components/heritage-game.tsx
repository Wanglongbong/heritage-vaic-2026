"use client";

import Image from "next/image";
import {
  FormEvent,
  PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { getSource, stops } from "@/lib/heritage";
import type { GuideResponse, HeritageStop, Hotspot, Language, LocalizedText } from "@/lib/types";

type JourneyPhase = "landing" | "carriage" | "travelling" | "heritage" | "ending";
type TranscriptionStatus = "matched" | "ambiguous" | "no-match";

type AudioPreview = {
  id?: string;
  kind?: "local-audio" | "official-source" | "synthesized";
  src?: string | null;
  sourceUrl?: string;
  creator?: string;
  license?: string;
  credit?: LocalizedText | string;
  role?: LocalizedText | string;
  reviewStatus?: string;
  note?: LocalizedText | string;
  generatorPreset?:
    | "carriage"
    | "kinh-bac-air"
    | "hanoi-room"
    | "hue-courtyard"
    | "cham-workyard"
    | "southern-riverside"
    | "clay-work"
    | "open-fire";
};

type Soundscape = {
  src?: string | null;
  credit?: LocalizedText | string;
  license?: string;
  generatorPreset?: AudioPreview["generatorPreset"];
};

type ExperienceHotspot = Omit<Hotspot, "audioPreview" | "suggestedQuestions"> & {
  audioPreview?: AudioPreview;
  suggestedQuestions?: LocalizedText[];
};

type ExperienceStop = Omit<HeritageStop, "soundscape" | "hotspots"> & {
  soundscape?: Soundscape;
  hotspots: ExperienceHotspot[];
};

type TranscriptionResponse = {
  transcript?: string;
  status?: TranscriptionStatus;
  destinationId?: string | null;
  stopId?: string | null;
  mock?: boolean;
  error?: string;
};

type AmbientScene = {
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
};

type ForegroundFoley = {
  sources: AudioScheduledSourceNode[];
  timer: number;
};

const experienceStops = stops as ExperienceStop[];
const MAX_RECORDING_BYTES = 3 * 1024 * 1024;
const MAX_RECORDING_MS = 6_000;

const copy = {
  vi: {
    brand: "TÀU DI SẢN",
    brandSub: "Một Việt Nam đang sống",
    board: "LÊN TÀU",
    introKicker: "HÀNH TRÌNH BẮC — NAM / 05 GA",
    introTitleA: "Đi qua Việt Nam.",
    introTitleB: "Lắng nghe điều còn ở lại.",
    introBody: "Đứng trong một toa tàu, mở năm cánh cửa và chạm vào những ký ức đang được truyền từ người sang người. Mọi câu chuyện đều đi cùng nguồn.",
    start: "Bắt đầu hành trình",
    instruction: "Di chuột gần một vật để đánh thức câu chuyện",
    explored: "đã mở",
    archive: "Sổ di sản",
    verified: "Nguồn đã duyệt",
    sound: "Âm thanh",
    source: "Mở nguồn gốc",
    next: "Ga kế tiếp",
    previous: "Ga trước",
    finishJourney: "Kết thúc hành trình",
    askTitle: "Hỏi Trưởng tàu AI",
    askHint: "Chỉ trả lời từ hồ sơ đang mở và luôn dẫn nguồn.",
    askPlaceholder: "Vì sao chi tiết này quan trọng?",
    ask: "Hỏi",
    asking: "Đang đối chiếu nguồn…",
    close: "Đóng",
    rights: "Quyền sử dụng",
    reviewedBy: "Đối chiếu bởi",
    export: "Xuất metadata JSON",
    emptyArchive: "Hãy chạm vào một vật trong cảnh để bắt đầu Sổ di sản.",
    archiveIntro: "Những hồ sơ bạn đã mở — kèm nguồn, quyền sử dụng và trạng thái kiểm duyệt.",
    illustration: "Minh họa pixel dựa trên dữ kiện công khai — không thay thế lời nghệ nhân.",
    animationNote: "Hoạt ảnh khái quát, không phải hướng dẫn tay nghề hay tái tạo nghi lễ.",
    localAudio: "Bản ghi có giấy phép",
    playAudio: "Phát âm thanh tại đây",
    pauseAudio: "Tạm dừng âm thanh",
    audioPending: "Chưa phát trong game",
    audioPendingBody: "Bản ghi chưa có quyền tái sử dụng rõ ràng nên game không sao chép hoặc phát lại. Thông tin nguồn vẫn có ở cuối hồ sơ.",
    ambientNote: "Nhạc nền hiện đại do game tổng hợp — không phải bản ghi hay mô phỏng âm nhạc di sản.",
    aiFallback: "Chế độ tư liệu kiểm chứng",
    aiLive: "OpenAI · câu trả lời có rào nguồn",
    arrival: "TÀU ĐANG VÀO GA",
    allStops: "Tuyến di sản",
    mute: "Tắt tiếng",
    unmute: "Bật tiếng",
    suggestions: "Gợi ý để hỏi từ hồ sơ",
    carriageKicker: "KHOANG 01 · TÀU BẮC — NAM",
    conductor: "NHÂN VIÊN SOÁT VÉ",
    conductorQuestion: "Chào mừng bạn lên tàu. Vé của bạn sẽ đi đến ga nào?",
    conductorBody: "Hãy nói tên một trong năm điểm đến. Tôi sẽ đối chiếu tên ga trong tối đa 6 giây và không lưu bản ghi.",
    mockConductorBody: "Bản demo dùng giọng nói mô phỏng. Bạn vẫn có thể nói để nhập vai; vé mẫu sẽ đưa bạn đến Huế.",
    mockBadge: "VOICE API · MÔ PHỎNG",
    mockResult: "KẾT QUẢ MẪU · ÂM THANH KHÔNG ĐƯỢC PHÂN TÍCH",
    micStart: "Nói điểm đến",
    micStop: "Gửi lời thoại",
    listening: "Đang nghe…",
    transcribing: "Đang nhận diện điểm đến…",
    mockTranscribing: "Đang chạy API mô phỏng…",
    micHint: "Ví dụ: “Tôi muốn đi Huế” hoặc “Đưa tôi đến Hà Nội”",
    transcript: "Tôi nghe thấy",
    matched: "Đã nhận vé. Tàu sắp chuyển bánh.",
    ambiguous: "Có nhiều hơn một điểm đến. Hãy nói lại chỉ một tên ga.",
    noMatch: "Chưa nhận ra điểm đến. Bạn có thể nói lại hoặc chọn ga bên dưới.",
    micDenied: "Trình duyệt chưa được cấp quyền micro. Hãy cho phép micro hoặc chọn ga bên dưới.",
    micUnsupported: "Trình duyệt này chưa hỗ trợ ghi âm. Bạn vẫn có thể chọn ga bên dưới.",
    micError: "Chưa gửi được giọng nói. Hãy thử lại hoặc chọn ga bên dưới.",
    micLarge: "Bản ghi vượt quá 3 MB. Hãy thử lại với câu ngắn hơn.",
    chooseInstead: "Hoặc chọn một vé",
    privacy: "Âm thanh chỉ được gửi để nhận diện ga, không được lưu trong Sổ di sản.",
    mockPrivacy: "Bản ghi demo chỉ được kiểm tra định dạng rồi bỏ; không phân tích nội dung và không lưu.",
    backLanding: "Về trang đầu",
    travellingTo: "ĐANG RỜI KHOANG · ĐI ĐẾN",
    neutralSound: "Nhạc nền hành trình đang phát",
    endingKicker: "HÀNH TRÌNH KHÉP LẠI · DI SẢN TIẾP TỤC SỐNG",
    endingTitle: "Tàu Di Sản Việt Nam",
    endingTagline: "Chạm vào ký ức đang sống.",
    endingBody: "Những gì bạn vừa mở không chỉ thuộc về quá khứ — đó là tri thức vẫn đang được cộng đồng trao truyền hôm nay.",
    replayJourney: "Đi lại hành trình",
    returnLastStop: "Trở lại ga cuối",
  },
  en: {
    brand: "HERITAGE EXPRESS",
    brandSub: "A living Viet Nam",
    board: "BOARD TRAIN",
    introKicker: "NORTH — SOUTH / 05 STOPS",
    introTitleA: "Cross Viet Nam.",
    introTitleB: "Listen to what remains.",
    introBody: "Stand inside a train carriage, open five doors and touch memories passed from person to person. Every story travels with its source.",
    start: "Begin the journey",
    instruction: "Move close to an object to wake its story",
    explored: "opened",
    archive: "Heritage journal",
    verified: "Approved source",
    sound: "Sound",
    source: "Open primary source",
    next: "Next stop",
    previous: "Previous stop",
    finishJourney: "Complete the journey",
    askTitle: "Ask the AI conductor",
    askHint: "Answers only from the open record, with sources.",
    askPlaceholder: "Why does this detail matter?",
    ask: "Ask",
    asking: "Checking the source…",
    close: "Close",
    rights: "Usage rights",
    reviewedBy: "Cross-checked by",
    export: "Export metadata JSON",
    emptyArchive: "Touch an object in the scene to begin your heritage journal.",
    archiveIntro: "The records you opened — with sources, rights and review status.",
    illustration: "Pixel illustration based on public facts — not a substitute for artisan testimony.",
    animationNote: "A high-level animation, not craft instruction or ritual reconstruction.",
    localAudio: "Licensed recording",
    playAudio: "Play audio here",
    pauseAudio: "Pause audio",
    audioPending: "Not played in the game",
    audioPendingBody: "No clear reuse permission is available, so the game does not copy or replay this recording. Its source remains listed at the end of the record.",
    ambientNote: "The modern background score is generated by the game — it is not a heritage recording or musical imitation.",
    aiFallback: "Verified archive mode",
    aiLive: "OpenAI · source-bounded answer",
    arrival: "NOW ARRIVING",
    allStops: "Heritage line",
    mute: "Mute",
    unmute: "Sound on",
    suggestions: "Questions grounded in this record",
    carriageKicker: "CARRIAGE 01 · NORTH — SOUTH",
    conductor: "TICKET CONDUCTOR",
    conductorQuestion: "Welcome aboard. Which station should I write on your ticket?",
    conductorBody: "Say one of the five destinations. I will match the station name within 6 seconds and will not retain the recording.",
    mockConductorBody: "This demo uses a mock voice flow. You can still speak in character; the sample ticket will take you to Huế.",
    mockBadge: "VOICE API · MOCK",
    mockResult: "SAMPLE RESULT · AUDIO WAS NOT ANALYSED",
    micStart: "Say your destination",
    micStop: "Send dialogue",
    listening: "Listening…",
    transcribing: "Recognising your destination…",
    mockTranscribing: "Running the mock API…",
    micHint: "For example: “Take me to Huế” or “I want to visit Hà Nội”",
    transcript: "I heard",
    matched: "Ticket accepted. The train is about to depart.",
    ambiguous: "More than one destination was heard. Please say just one station.",
    noMatch: "No destination was recognised. Try again or choose a station below.",
    micDenied: "Microphone permission is unavailable. Allow it or choose a station below.",
    micUnsupported: "Audio recording is not supported here. You can still choose a station below.",
    micError: "The voice request could not be sent. Try again or choose a station below.",
    micLarge: "The recording is over 3 MB. Please try a shorter request.",
    chooseInstead: "Or choose a ticket",
    privacy: "Audio is sent only to recognise a station and is not stored in your heritage journal.",
    mockPrivacy: "The demo recording is checked only for file validity, then discarded; its content is not analysed or stored.",
    backLanding: "Back to the opening",
    travellingTo: "LEAVING THE CARRIAGE · BOUND FOR",
    neutralSound: "Journey background music is playing",
    endingKicker: "THE JOURNEY CLOSES · HERITAGE LIVES ON",
    endingTitle: "Viet Nam Heritage Express",
    endingTagline: "Touch living memory.",
    endingBody: "What you have opened does not belong only to the past — it is knowledge communities continue to transmit today.",
    replayJourney: "Travel again",
    returnLastStop: "Return to the final stop",
  },
};

const stationVoiceExamples: Record<string, LocalizedText> = {
  "quan-ho": { vi: "Đi Bắc Ninh", en: "Take me to Bắc Ninh" },
  "ca-tru": { vi: "Đi Hà Nội", en: "Take me to Hà Nội" },
  "nha-nhac": { vi: "Đi Huế", en: "Take me to Huế" },
  "cham-pottery": { vi: "Đi Ninh Thuận", en: "Take me to Ninh Thuận" },
  "don-ca-tai-tu": { vi: "Đi Nam Bộ", en: "Take me to Southern Viet Nam" },
};

const ambientProfiles: Record<string, { base: number; filter: number; air: number; pulse: number }> = {
  carriage: { base: 48, filter: 520, air: 0.28, pulse: 2.1 },
  "kinh-bac-air": { base: 62, filter: 980, air: 0.34, pulse: 0.11 },
  "hanoi-room": { base: 55, filter: 680, air: 0.2, pulse: 0.08 },
  "hue-courtyard": { base: 46, filter: 760, air: 0.25, pulse: 0.07 },
  "cham-workyard": { base: 67, filter: 1350, air: 0.42, pulse: 0.09 },
  "southern-riverside": { base: 52, filter: 1120, air: 0.38, pulse: 0.1 },
  train: { base: 48, filter: 520, air: 0.28, pulse: 2.1 },
  "quan-ho": { base: 62, filter: 980, air: 0.34, pulse: 0.11 },
  "ca-tru": { base: 55, filter: 680, air: 0.2, pulse: 0.08 },
  "nha-nhac": { base: 46, filter: 760, air: 0.25, pulse: 0.07 },
  "cham-pottery": { base: 67, filter: 1350, air: 0.42, pulse: 0.09 },
  "don-ca-tai-tu": { base: 52, filter: 1120, air: 0.38, pulse: 0.1 },
};

const scorePatterns: Record<string, number[]> = {
  carriage: [0, 7, 4, 9],
  train: [0, 4, 7, 11],
  "quan-ho": [0, 7, 9, 4],
  "ca-tru": [0, 3, 7, 10],
  "nha-nhac": [0, 5, 7, 12],
  "cham-pottery": [0, 4, 9, 7],
  "don-ca-tai-tu": [0, 7, 11, 9],
};

function createSessionId() {
  return window.crypto.randomUUID();
}

function localized(value: LocalizedText | string | undefined, language: Language) {
  if (!value) return "";
  return typeof value === "string" ? value : value[language];
}

function audioFor(hotspot: ExperienceHotspot): AudioPreview | null {
  if (hotspot.audioPreview) return hotspot.audioPreview;
  if (hotspot.media?.kind === "audio" && hotspot.media.src) {
    return {
      src: hotspot.media.src,
      sourceUrl: hotspot.media.sourceUrl,
      creator: hotspot.media.creator,
      license: hotspot.media.license,
      credit: hotspot.media.credit,
    };
  }
  return null;
}

function isPlayableAudio(preview: AudioPreview | null) {
  return Boolean(preview?.src || preview?.generatorPreset === "clay-work" || preview?.generatorPreset === "open-fire");
}

function suggestedQuestions(hotspot: ExperienceHotspot): LocalizedText[] {
  if (hotspot.suggestedQuestions && hotspot.suggestedQuestions.length > 0) {
    return hotspot.suggestedQuestions.slice(0, 3);
  }

  if (hotspot.interaction === "audio") {
    return [
      {
        vi: `${hotspot.label.vi} giữ vai trò gì trong tổng thể thực hành này?`,
        en: `What role does ${hotspot.label.en} play in this practice?`,
      },
      {
        vi: `Chi tiết ${hotspot.label.vi} phối hợp với những thành phần khác như thế nào?`,
        en: `How does ${hotspot.label.en} work with the other elements?`,
      },
      {
        vi: `Tri thức liên quan đến ${hotspot.label.vi} được truyền dạy và bảo vệ ra sao?`,
        en: `How is knowledge related to ${hotspot.label.en} transmitted and safeguarded?`,
      },
    ];
  }

  if (hotspot.interaction === "animation") {
    return [
      {
        vi: `Hồ sơ đã kiểm chứng mô tả ${hotspot.label.vi} qua những bước chính nào?`,
        en: `Which main steps of ${hotspot.label.en} are documented in the verified record?`,
      },
      {
        vi: `Vì sao kỹ năng này cần được học trực tiếp từ người thực hành?`,
        en: "Why must this skill be learned directly from practitioners?",
      },
      {
        vi: `Cộng đồng đang gìn giữ thực hành này như thế nào?`,
        en: "How is the community safeguarding this practice?",
      },
    ];
  }

  return [
    {
      vi: `${hotspot.label.vi} cho biết gì về không gian văn hóa này?`,
      en: `What does ${hotspot.label.en} reveal about this cultural setting?`,
    },
    {
      vi: `Chi tiết này liên hệ như thế nào với thực hành di sản đang sống?`,
      en: "How does this detail relate to the living heritage practice?",
    },
    {
      vi: `Nguồn tư liệu nào xác nhận câu chuyện về ${hotspot.label.vi}?`,
      en: `Which source verifies the account of ${hotspot.label.en}?`,
    },
  ];
}

function useAmbientAudio(environment: string, muted: boolean, ducked: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const ambienceRef = useRef<GainNode | null>(null);
  const foregroundRef = useRef<ForegroundFoley | null>(null);
  const activeSceneRef = useRef<AmbientScene | null>(null);
  const environmentRef = useRef(environment);
  const enabledRef = useRef(false);
  const mutedRef = useRef(muted);
  const duckedRef = useRef(ducked);
  const stopTimersRef = useRef<number[]>([]);

  const transitionTo = useCallback((nextEnvironment: string) => {
    const context = contextRef.current;
    const ambience = ambienceRef.current;
    if (!context || !ambience || !enabledRef.current) return;

    const now = context.currentTime;
    const previous = activeSceneRef.current;
    if (previous) {
      previous.gain.gain.cancelScheduledValues(now);
      previous.gain.gain.setValueAtTime(previous.gain.gain.value, now);
      previous.gain.gain.linearRampToValueAtTime(0, now + 1.2);
      const timer = window.setTimeout(() => {
        previous.sources.forEach((source) => {
          try { source.stop(); } catch { /* source may already be stopped */ }
        });
        previous.gain.disconnect();
      }, 1_300);
      stopTimersRef.current.push(timer);
    }

    const profile = ambientProfiles[nextEnvironment] || ambientProfiles.carriage;
    const sceneGain = context.createGain();
    sceneGain.gain.setValueAtTime(0, now);
    sceneGain.gain.linearRampToValueAtTime(0.92, now + 1.3);
    sceneGain.connect(ambience);

    const hum = context.createOscillator();
    const humGain = context.createGain();
    hum.type = "sine";
    hum.frequency.value = profile.base;
    humGain.gain.value = nextEnvironment === "train" || nextEnvironment === "carriage" ? 0.28 : 0.12;
    hum.connect(humGain).connect(sceneGain);

    const overtone = context.createOscillator();
    const overtoneGain = context.createGain();
    overtone.type = "sine";
    overtone.frequency.value = profile.base * 1.501;
    overtone.detune.value = 3;
    overtoneGain.gain.value = 0.045;
    overtone.connect(overtoneGain).connect(sceneGain);

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noiseData.length; index += 1) {
      noiseData[index] = (Math.random() * 2 - 1) * 0.35;
    }
    const noise = context.createBufferSource();
    const noiseFilter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = profile.filter;
    noiseFilter.Q.value = 0.5;
    noiseGain.gain.value = profile.air;
    noise.connect(noiseFilter).connect(noiseGain).connect(sceneGain);

    const movement = context.createOscillator();
    const movementDepth = context.createGain();
    movement.type = "sine";
    movement.frequency.value = profile.pulse;
    movementDepth.gain.value = nextEnvironment === "train" || nextEnvironment === "carriage" ? 0.18 : 0.035;
    movement.connect(movementDepth).connect(sceneGain.gain);

    const scoreBuffer = context.createBuffer(1, context.sampleRate * 12, context.sampleRate);
    const scoreData = scoreBuffer.getChannelData(0);
    const scorePattern = scorePatterns[nextEnvironment] || scorePatterns.carriage;
    const scoreRoot = Math.min(246, Math.max(174, profile.base * 4));
    for (let noteIndex = 0; noteIndex < scorePattern.length; noteIndex += 1) {
      const noteStart = noteIndex * 3;
      const noteFrequency = scoreRoot * 2 ** (scorePattern[noteIndex] / 12);
      const startSample = Math.floor(noteStart * context.sampleRate);
      const noteSamples = Math.floor(2.7 * context.sampleRate);
      for (let sampleIndex = 0; sampleIndex < noteSamples && startSample + sampleIndex < scoreData.length; sampleIndex += 1) {
        const time = sampleIndex / context.sampleRate;
        const envelope = Math.min(1, time * 4.5) * Math.exp(-1.2 * time);
        const fundamental = Math.sin(2 * Math.PI * noteFrequency * time);
        const shimmer = Math.sin(2 * Math.PI * noteFrequency * 2.01 * time) * 0.24;
        scoreData[startSample + sampleIndex] += (fundamental + shimmer) * envelope * 0.16;
      }
    }
    const score = context.createBufferSource();
    const scoreFilter = context.createBiquadFilter();
    const scoreGain = context.createGain();
    score.buffer = scoreBuffer;
    score.loop = true;
    scoreFilter.type = "lowpass";
    scoreFilter.frequency.value = 1_650;
    scoreGain.gain.value = nextEnvironment === "train" || nextEnvironment === "carriage" ? 0.42 : 0.34;
    score.connect(scoreFilter).connect(scoreGain).connect(sceneGain);

    const pad = context.createOscillator();
    const padGain = context.createGain();
    pad.type = "sine";
    pad.frequency.value = scoreRoot / 2;
    padGain.gain.value = 0.035;
    pad.connect(padGain).connect(sceneGain);

    const sources: AudioScheduledSourceNode[] = [hum, overtone, noise, movement, score, pad];
    sources.forEach((source) => source.start());
    activeSceneRef.current = { gain: sceneGain, sources };
  }, []);

  const enable = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!contextRef.current) {
      const context = new window.AudioContext();
      const master = context.createGain();
      const ambience = context.createGain();
      master.gain.value = mutedRef.current ? 0 : 1;
      ambience.gain.value = duckedRef.current ? 0.018 : 0.082;
      ambience.connect(master).connect(context.destination);
      contextRef.current = context;
      masterRef.current = master;
      ambienceRef.current = ambience;
    }
    enabledRef.current = true;
    void contextRef.current.resume();
    if (!activeSceneRef.current) transitionTo(environmentRef.current);
  }, [transitionTo]);

  useEffect(() => {
    environmentRef.current = environment;
    if (enabledRef.current) transitionTo(environment);
  }, [environment, transitionTo]);

  useEffect(() => {
    mutedRef.current = muted;
    const context = contextRef.current;
    const master = masterRef.current;
    if (!context || !master) return;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(muted ? 0 : 1, context.currentTime, 0.08);
  }, [muted]);

  useEffect(() => {
    duckedRef.current = ducked;
    const context = contextRef.current;
    const ambience = ambienceRef.current;
    if (!context || !ambience) return;
    ambience.gain.cancelScheduledValues(context.currentTime);
    ambience.gain.setTargetAtTime(ducked ? 0.018 : 0.082, context.currentTime, 0.12);
  }, [ducked]);

  const stopFoley = useCallback(() => {
    const foreground = foregroundRef.current;
    if (!foreground) return;
    window.clearTimeout(foreground.timer);
    foreground.sources.forEach((source) => {
      try { source.stop(); } catch { /* source may already be stopped */ }
    });
    foregroundRef.current = null;
  }, []);

  const playFoley = useCallback((preset: AudioPreview["generatorPreset"], onEnded: () => void) => {
    if (preset !== "clay-work" && preset !== "open-fire") return false;
    enable();
    stopFoley();
    const context = contextRef.current;
    const master = masterRef.current;
    if (!context || !master) return false;

    const bus = context.createGain();
    bus.gain.value = preset === "clay-work" ? 0.38 : 0.29;
    bus.connect(master);
    const sources: AudioScheduledSourceNode[] = [];
    const duration = 4.8;

    if (preset === "clay-work") {
      for (let stroke = 0; stroke < 6; stroke += 1) {
        const buffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.55), context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let index = 0; index < data.length; index += 1) {
          const envelope = Math.sin(Math.PI * index / data.length);
          data[index] = (Math.random() * 2 - 1) * envelope * 0.34;
        }
        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const strokeGain = context.createGain();
        source.buffer = buffer;
        filter.type = "bandpass";
        filter.frequency.value = 430 + stroke * 37;
        filter.Q.value = 0.7;
        strokeGain.gain.value = 0.42;
        source.connect(filter).connect(strokeGain).connect(bus);
        source.start(context.currentTime + stroke * 0.72);
        sources.push(source);
      }
    } else {
      const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) {
        const crackle = Math.random() > 0.992 ? Math.random() * 1.4 : 0;
        data[index] = (Math.random() * 2 - 1) * 0.08 + crackle;
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const fireGain = context.createGain();
      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = 1_900;
      fireGain.gain.value = 0.5;
      source.connect(filter).connect(fireGain).connect(bus);
      source.start();
      sources.push(source);
    }

    const timer = window.setTimeout(() => {
      foregroundRef.current = null;
      sources.forEach((source) => {
        try { source.stop(); } catch { /* source has naturally ended */ }
      });
      bus.disconnect();
      onEnded();
    }, duration * 1_000);
    foregroundRef.current = { sources, timer };
    return true;
  }, [enable, stopFoley]);

  useEffect(() => {
    const onVisibility = () => {
      const context = contextRef.current;
      if (!context || !enabledRef.current) return;
      if (document.hidden) void context.suspend();
      else void context.resume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => () => {
    stopTimersRef.current.forEach(window.clearTimeout);
    stopFoley();
    activeSceneRef.current?.sources.forEach((source) => {
      try { source.stop(); } catch { /* source may already be stopped */ }
    });
    if (contextRef.current) void contextRef.current.close();
  }, [stopFoley]);

  return { enable, playFoley, stopFoley };
}

export function HeritageGame({ voiceApiMode = "mock" }: { voiceApiMode?: "mock" | "live" }) {
  const [language, setLanguage] = useState<Language>("vi");
  const [phase, setPhase] = useState<JourneyPhase>("landing");
  const [stopIndex, setStopIndex] = useState(0);
  const [pendingStopIndex, setPendingStopIndex] = useState(0);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [openHotspot, setOpenHotspot] = useState<ExperienceHotspot | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("heritage_browser_session");
  const sceneRef = useRef<HTMLDivElement>(null);
  const travelTimerRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const ui = copy[language];
  const stop = experienceStops[stopIndex];
  const pendingStop = experienceStops[pendingStopIndex];
  const ambienceEnvironment = phase === "heritage" ? stop.soundscape?.generatorPreset || stop.id : "carriage";
  const { enable: enableAmbient, playFoley, stopFoley } = useAmbientAudio(ambienceEnvironment, muted, Boolean(previewPlaying));

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("heritage-language");
    const savedVisited = window.localStorage.getItem("heritage-visited");
    const savedMuted = window.localStorage.getItem("heritage-muted");
    const savedSession = window.sessionStorage.getItem("heritage-session-id");
    const restore = window.setTimeout(() => {
      if (savedLanguage === "vi" || savedLanguage === "en") setLanguage(savedLanguage);
      if (savedVisited) {
        try { setVisited(new Set(JSON.parse(savedVisited) as string[])); } catch { /* ignore invalid local state */ }
      }
      if (savedMuted === "true") setMuted(true);
      if (savedSession && /^[A-Za-z0-9_-]{16,64}$/.test(savedSession)) {
        setSessionId(savedSession);
      } else {
        const nextSession = createSessionId();
        window.sessionStorage.setItem("heritage-session-id", nextSession);
        setSessionId(nextSession);
      }
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("heritage-language", language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("heritage-visited", JSON.stringify([...visited]));
  }, [visited]);

  useEffect(() => {
    window.localStorage.setItem("heritage-muted", String(muted));
    if (previewAudioRef.current) previewAudioRef.current.muted = muted;
  }, [muted]);

  const stopPreview = useCallback(() => {
    stopFoley();
    const audio = previewAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    }
    previewAudioRef.current = null;
    setPreviewPlaying(null);
  }, [stopFoley]);

  useEffect(() => () => {
    if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current);
    const audio = previewAudioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (archiveOpen) setArchiveOpen(false);
      else if (openHotspot) {
        setOpenHotspot(null);
        stopPreview();
      } else if (phase === "carriage") setPhase("landing");
      else if (phase === "ending") setPhase("heritage");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [archiveOpen, openHotspot, phase, stopPreview]);

  function toggleMuted() {
    enableAmbient();
    setMuted((value) => !value);
  }

  function playPreview(hotspot: ExperienceHotspot) {
    const preview = audioFor(hotspot);
    if (!preview || !isPlayableAudio(preview)) return;
    enableAmbient();
    const key = `${stop.id}:${hotspot.id}`;
    const currentAudio = previewAudioRef.current;

    if (previewPlaying === key && (preview.generatorPreset === "clay-work" || preview.generatorPreset === "open-fire")) {
      stopFoley();
      setPreviewPlaying(null);
      return;
    }

    if (previewPlaying === key && currentAudio) {
      if (currentAudio.paused) {
        void currentAudio.play().then(() => setPreviewPlaying(key)).catch(() => setPreviewPlaying(null));
      } else {
        currentAudio.pause();
        setPreviewPlaying(null);
      }
      return;
    }

    stopPreview();
    if (preview.generatorPreset === "clay-work" || preview.generatorPreset === "open-fire") {
      const started = playFoley(preview.generatorPreset, () => setPreviewPlaying(null));
      if (started) setPreviewPlaying(key);
      return;
    }
    if (!preview.src) return;
    const audio = new Audio(preview.src);
    audio.preload = "auto";
    audio.muted = muted;
    audio.volume = 0.9;
    audio.onended = () => {
      previewAudioRef.current = null;
      setPreviewPlaying(null);
    };
    audio.onerror = () => {
      previewAudioRef.current = null;
      setPreviewPlaying(null);
    };
    previewAudioRef.current = audio;
    void audio.play().then(() => setPreviewPlaying(key)).catch(() => setPreviewPlaying(null));
  }

  function openRecord(hotspot: ExperienceHotspot) {
    setVisited((current) => new Set(current).add(`${stop.id}:${hotspot.id}`));
    setOpenHotspot(hotspot);
    if (isPlayableAudio(audioFor(hotspot))) playPreview(hotspot);
  }

  function beginTravel(index: number) {
    if (index < 0 || index >= experienceStops.length || phase === "travelling") return;
    if (phase === "heritage" && index === stopIndex) return;
    if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current);
    stopPreview();
    setOpenHotspot(null);
    setActiveHotspotId(null);
    setPendingStopIndex(index);
    setPhase("travelling");
    travelTimerRef.current = window.setTimeout(() => {
      setStopIndex(index);
      setPhase("heritage");
      travelTimerRef.current = null;
    }, 3_150);
  }

  function resetToLanding() {
    if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current);
    travelTimerRef.current = null;
    stopPreview();
    setArchiveOpen(false);
    setOpenHotspot(null);
    setPhase("landing");
  }

  function finishJourney() {
    stopPreview();
    setArchiveOpen(false);
    setOpenHotspot(null);
    setActiveHotspotId(null);
    setPhase("ending");
  }

  function replayJourney() {
    stopPreview();
    setStopIndex(0);
    setPendingStopIndex(0);
    setPhase("carriage");
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const buttons = sceneRef.current?.querySelectorAll<HTMLButtonElement>("[data-hotspot]");
    if (!buttons) return;
    let closest: { id: string; distance: number } | null = null;
    for (const button of Array.from(buttons)) {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy) - Math.max(rect.width, rect.height) / 2;
      if (!closest || distance < closest.distance) closest = { id: button.dataset.hotspot || "", distance };
    }
    setActiveHotspotId(closest && closest.distance < 94 ? closest.id : null);
  }

  const visitedCount = visited.size;
  const stopVisited = stop.hotspots.filter((hotspot) => visited.has(`${stop.id}:${hotspot.id}`)).length;

  return (
    <main className="game-shell" style={{ "--stop-accent": stop.palette } as CSSProperties}>
      {phase === "heritage" && <>
      <header className="topbar">
        <button className="wordmark" onClick={resetToLanding} aria-label={ui.brand}>
          <span className="wordmark-mark">T</span>
          <span><b>{ui.brand}</b><small>{ui.brandSub}</small></span>
        </button>
        <div className="journey-status">
          <span>{stop.number} / 05</span>
          <b>{stop.location[language]}</b>
        </div>
        <div className="top-actions">
          <button onClick={toggleMuted} aria-label={muted ? ui.unmute : ui.mute} className="icon-button" aria-pressed={muted}>{muted ? "◌" : "♪"}</button>
          <button className="language-switch" onClick={() => setLanguage(language === "vi" ? "en" : "vi")}>{language === "vi" ? "EN" : "VI"}</button>
          <button className="archive-button" onClick={() => setArchiveOpen(true)}><span>{visitedCount.toString().padStart(2, "0")}</span>{ui.archive}</button>
        </div>
      </header>

      <section className="route-bar" aria-label={ui.allStops}>
        <span className="route-rail" aria-hidden="true" />
        {experienceStops.map((item, index) => {
          const completed = item.hotspots.every((hotspot) => visited.has(`${item.id}:${hotspot.id}`));
          return <button key={item.id} className={`${index === stopIndex ? "current" : ""} ${completed ? "completed" : ""}`} onClick={() => beginTravel(index)}>
            <i />
            <span>{item.location[language].split("·")[0]}</span>
          </button>;
        })}
      </section>

      <section className="scene-wrap" style={{ "--scene-image": `url(${stop.scene})` } as CSSProperties}>
        <div className="train-frame" aria-hidden="true"><span className="frame-top" /><span className="frame-left" /><span className="frame-right" /><span className="frame-bottom" /></div>
        <div
          ref={sceneRef}
          className="scene"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setActiveHotspotId(null)}
          style={{ backgroundImage: `linear-gradient(180deg, transparent 68%, rgba(8, 8, 7, .2)), url(${stop.scene})` }}
          aria-label={`${stop.title[language]} — ${stop.description[language]}`}
        >
          <div className="scene-heading">
            <span>GA {stop.number} · {stop.location[language]}</span>
            <h1>{stop.title[language]}</h1>
            <p>{stop.subtitle[language]}</p>
          </div>
          <div className="instruction"><i className="mouse-glyph" /> {ui.instruction}</div>
          {stop.hotspots.map((hotspot, index) => {
            const active = activeHotspotId === hotspot.id;
            const seen = visited.has(`${stop.id}:${hotspot.id}`);
            const playable = isPlayableAudio(audioFor(hotspot));
            return <button
              key={hotspot.id}
              data-hotspot={hotspot.id}
              className={`hotspot ${active ? "near" : ""} ${seen ? "seen" : ""} ${playable ? "has-audio" : ""}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, "--radius": `${hotspot.radius * 8}px` } as CSSProperties}
              onPointerEnter={() => setActiveHotspotId(hotspot.id)}
              onFocus={() => setActiveHotspotId(hotspot.id)}
              onBlur={() => setActiveHotspotId(null)}
              onClick={() => openRecord(hotspot)}
              aria-label={`${hotspot.label[language]}${playable ? ` · ${ui.playAudio}` : ""}`}
            >
              <span className="hotspot-orbit" />
              <span className="hotspot-dot">{playable && previewPlaying === `${stop.id}:${hotspot.id}` ? "♫" : seen ? "✓" : String(index + 1).padStart(2, "0")}</span>
              <span className="hotspot-label"><small>{hotspot.kicker[language]}</small><b>{hotspot.label[language]}</b>{playable && <em>♪ {ui.playAudio}</em>}</span>
            </button>;
          })}
        </div>
        <div className="scene-footer">
          <div><b>{stopVisited}/{stop.hotspots.length}</b><span>{ui.explored}</span></div>
          <p>{ui.illustration}</p>
          <div className="station-controls">
            <button className="station-direction station-previous" aria-label={ui.previous} disabled={stopIndex === 0} onClick={() => beginTravel(stopIndex - 1)}><span aria-hidden="true">←</span><em>{ui.previous}</em></button>
            {stopIndex === experienceStops.length - 1
              ? <button className="finish-journey-button" onClick={finishJourney}><em>{ui.finishJourney}</em><span aria-hidden="true">→</span></button>
              : <button className="station-direction station-next" aria-label={ui.next} onClick={() => beginTravel(stopIndex + 1)}><em>{ui.next}</em><span aria-hidden="true">→</span></button>}
          </div>
        </div>
      </section>
      </>}

      {phase === "landing" && <Intro language={language} onLanguage={setLanguage} onStart={() => { enableAmbient(); setPhase("carriage"); }} />}
      {phase === "carriage" && <Carriage language={language} muted={muted} sessionId={sessionId} voiceApiMode={voiceApiMode} onLanguage={setLanguage} onToggleMuted={toggleMuted} onBack={resetToLanding} onDestination={beginTravel} onAudioActivate={enableAmbient} />}
      {phase === "travelling" && <TravelScreen stop={pendingStop} language={language} />}
      {phase === "ending" && <Ending language={language} onLanguage={setLanguage} onReplay={replayJourney} onReturn={() => setPhase("heritage")} />}
      {phase === "heritage" && <div className="ambient-disclosure" role="note">♪ {ui.neutralSound}<span>{ui.ambientNote}</span></div>}
      {openHotspot && <RecordDrawer
        key={`${stop.id}:${openHotspot.id}`}
        stop={stop}
        hotspot={openHotspot}
        language={language}
        sessionId={sessionId}
        previewPlaying={previewPlaying === `${stop.id}:${openHotspot.id}`}
        onTogglePreview={() => playPreview(openHotspot)}
        onClose={() => { setOpenHotspot(null); stopPreview(); }}
      />}
      {archiveOpen && <Archive language={language} visited={visited} onClose={() => setArchiveOpen(false)} />}
    </main>
  );
}

function Ending({
  language,
  onLanguage,
  onReplay,
  onReturn,
}: {
  language: Language;
  onLanguage: (language: Language) => void;
  onReplay: () => void;
  onReturn: () => void;
}) {
  const ui = copy[language];
  return <section className="ending-screen" aria-labelledby="ending-title">
    <Image className="ending-cover-image" src="/og.png" alt="" fill priority unoptimized sizes="100vw" aria-hidden="true" />
    <div className="ending-vignette" aria-hidden="true" />
    <div className="ending-language" aria-label={language === "vi" ? "Chọn ngôn ngữ" : "Choose language"}>
      <button className={language === "vi" ? "active" : ""} aria-pressed={language === "vi"} onClick={() => onLanguage("vi")}>VI</button>
      <button className={language === "en" ? "active" : ""} aria-pressed={language === "en"} onClick={() => onLanguage("en")}>EN</button>
    </div>
    <div className="ending-copy">
      <span>{ui.endingKicker}</span>
      <h1 id="ending-title" className="sr-only">{ui.endingTitle}</h1>
      <p className="ending-tagline">{ui.endingTagline}</p>
      <p className="ending-body">{ui.endingBody}</p>
      <div className="ending-actions">
        <button className="ending-primary" onClick={onReplay}>{ui.replayJourney}<b>↻</b></button>
        <button className="ending-secondary" onClick={onReturn}>← {ui.returnLastStop}</button>
      </div>
    </div>
  </section>;
}

function Intro({ language, onLanguage, onStart }: { language: Language; onLanguage: (language: Language) => void; onStart: () => void }) {
  const ui = copy[language];
  return <section className="intro-screen" aria-labelledby="intro-title">
    <Image className="intro-cover-image" src="/og.png" alt="" fill priority unoptimized sizes="100vw" aria-hidden="true" />
    <div className="intro-noise" aria-hidden="true" />
    <div className="intro-brand"><span>T</span><b>{ui.brand}</b></div>
    <div className="intro-language intro-language-top" aria-label={language === "vi" ? "Chọn ngôn ngữ" : "Choose language"}>
      <button className={language === "vi" ? "active" : ""} aria-pressed={language === "vi"} onClick={() => onLanguage("vi")}>VI</button>
      <button className={language === "en" ? "active" : ""} aria-pressed={language === "en"} onClick={() => onLanguage("en")}>EN</button>
    </div>
    <div className="intro-copy">
      <span className="intro-kicker"><i /> {ui.introKicker}</span>
      <h1 id="intro-title" className="sr-only">{ui.introTitleA} {ui.introTitleB}</h1>
      <p>{ui.introBody}</p>
      <div className="intro-actions">
        <button onClick={onStart}>{ui.start}<span>→</span></button>
      </div>
    </div>
    <div className="intro-source"><span>●</span> 05 UNESCO FILES <i /> 15 VERIFIED RECORDS <i /> NO CULTURAL FABRICATION</div>
  </section>;
}

function Carriage({
  language,
  muted,
  sessionId,
  voiceApiMode,
  onLanguage,
  onToggleMuted,
  onBack,
  onDestination,
  onAudioActivate,
}: {
  language: Language;
  muted: boolean;
  sessionId: string;
  voiceApiMode: "mock" | "live";
  onLanguage: (language: Language) => void;
  onToggleMuted: () => void;
  onBack: () => void;
  onDestination: (index: number) => void;
  onAudioActivate: () => void;
}) {
  const ui = copy[language];
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [resultStatus, setResultStatus] = useState<TranscriptionStatus | null>(null);
  const [mockedResult, setMockedResult] = useState(false);
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const departTimerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  const clearStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current);
    stopTimerRef.current = null;
  }, []);

  useEffect(() => () => {
    cancelledRef.current = true;
    if (departTimerRef.current) window.clearTimeout(departTimerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    clearStream();
  }, [clearStream]);

  async function sendRecording(blob: Blob) {
    if (blob.size > MAX_RECORDING_BYTES) {
      setError(ui.micLarge);
      setProcessing(false);
      return;
    }

    const extension = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
    const formData = new FormData();
    formData.append("audio", blob, `destination.${extension}`);
    formData.append("language", language);
    formData.append("sessionId", sessionId);

    try {
      const response = await fetch("/api/transcribe", { method: "POST", body: formData });
      const payload = await response.json() as TranscriptionResponse;
      if (!response.ok) throw new Error(payload.error || "transcription_failed");
      if (cancelledRef.current) return;
      const destinationId = payload.destinationId || payload.stopId || null;
      const destinationIndex = destinationId ? experienceStops.findIndex((stop) => stop.id === destinationId) : -1;
      const nextStatus: TranscriptionStatus = payload.status || (destinationIndex >= 0 ? "matched" : "no-match");
      setTranscript(payload.transcript || "");
      setResultStatus(nextStatus);
      setMockedResult(payload.mock === true);
      if (nextStatus === "matched" && destinationIndex >= 0) {
        departTimerRef.current = window.setTimeout(() => onDestination(destinationIndex), payload.mock ? 1_800 : 1_050);
      }
    } catch {
      if (!cancelledRef.current) setError(ui.micError);
    } finally {
      if (!cancelledRef.current) setProcessing(false);
    }
  }

  async function startRecording() {
    setError("");
    setTranscript("");
    setResultStatus(null);
    setMockedResult(false);
    onAudioActivate();

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError(ui.micUnsupported);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      if (cancelledRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const preferredMime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
      const recorder = preferredMime ? new MediaRecorder(stream, { mimeType: preferredMime }) : new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || preferredMime || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        clearStream();
        setRecording(false);
        if (!cancelledRef.current) {
          setProcessing(true);
          void sendRecording(blob);
        }
      };
      recorder.onerror = () => {
        clearStream();
        setRecording(false);
        setError(ui.micError);
      };
      recorder.start(250);
      setRecording(true);
      stopTimerRef.current = window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, MAX_RECORDING_MS);
    } catch (caught) {
      const denied = caught instanceof DOMException && (caught.name === "NotAllowedError" || caught.name === "SecurityError");
      setError(denied ? ui.micDenied : ui.micError);
      clearStream();
    }
  }

  function toggleRecording() {
    if (processing) return;
    if (recording && recorderRef.current?.state === "recording") recorderRef.current.stop();
    else void startRecording();
  }

  const resultCopy = resultStatus === "matched" ? ui.matched : resultStatus === "ambiguous" ? ui.ambiguous : resultStatus === "no-match" ? ui.noMatch : "";

  return <section className="carriage-screen" aria-labelledby="carriage-title" aria-busy={processing}>
    <div className="carriage-stage" aria-hidden="true">
      <Image className="carriage-backdrop" src="/train/heritage-carriage.webp" alt="" fill priority unoptimized sizes="100vw" />
      <span className="carriage-light-sweep" />
      <span className="carriage-vignette" />
      <Image className="conductor-character" src="/characters/ticket-conductor-v2.png" alt="" width={887} height={1774} priority unoptimized />
    </div>
    <div className="carriage-toolbar">
      <button className="carriage-brand" onClick={onBack}><span>T</span><b>{ui.brand}</b></button>
      <div><button onClick={onToggleMuted} aria-label={muted ? ui.unmute : ui.mute}>{muted ? "◌" : "♪"}</button><button onClick={() => onLanguage(language === "vi" ? "en" : "vi")}>{language === "vi" ? "EN" : "VI"}</button></div>
    </div>

    <div className="conductor-panel story-dialogue">
      <span className="carriage-kicker">● {ui.carriageKicker}</span>
      <div className="dialogue-label"><i /> {ui.conductor}</div>
      <h1 id="carriage-title">{ui.conductorQuestion}</h1>
      {voiceApiMode === "mock" && <span className="voice-mode">{ui.mockBadge}</span>}
      <p>{voiceApiMode === "mock" ? ui.mockConductorBody : ui.conductorBody}</p>

      <div className="voice-console story-mic-row">
        <button className={`voice-button ${recording ? "recording" : ""}`} onClick={toggleRecording} disabled={processing} aria-pressed={recording} aria-label={recording ? ui.micStop : ui.micStart}>
          <span className="mic-symbol"><i /></span>
          <b>{processing ? (voiceApiMode === "mock" ? ui.mockTranscribing : ui.transcribing) : recording ? ui.micStop : ui.micStart}</b>
          <small>{recording ? ui.listening : ui.micHint}</small>
          {recording && <em className="recording-progress" />}
        </button>
        <div className="voice-privacy">◇ {voiceApiMode === "mock" ? ui.mockPrivacy : ui.privacy}</div>
      </div>

      {(transcript || resultCopy || error) && <div className={`voice-result ${resultStatus || "error"}`} role="status" aria-live="polite">
        {mockedResult && <small>{ui.mockResult}</small>}
        {transcript && <p><span>{ui.transcript}</span> “{transcript}”</p>}
        {(resultCopy || error) && <b>{error || resultCopy}</b>}
      </div>}

      <div className="station-choice">
        <span>{ui.chooseInstead}</span>
        <div>
          {experienceStops.map((item, index) => <button key={item.id} onClick={() => onDestination(index)}>
            <small>{item.number}</small>
            <b>{item.location[language].split("·")[0]}</b>
            <em>“{stationVoiceExamples[item.id]?.[language]}”</em>
          </button>)}
        </div>
      </div>
    </div>
  </section>;
}

function TravelScreen({ stop, language }: { stop: ExperienceStop; language: Language }) {
  const ui = copy[language];
  return <section className="travel-screen" aria-live="polite" aria-label={`${ui.arrival} ${stop.location[language]}`}>
    <Image className="travel-landscape" src="/train/coastal-transit-v2.webp" alt="" fill priority unoptimized sizes="100vw" aria-hidden="true" />
    <Image className="travel-destination" src={stop.scene} alt="" fill unoptimized sizes="100vw" aria-hidden="true" />
    <Image className="travel-track-image" src="/train/straight-track-v2.png" alt="" fill priority unoptimized sizes="100vw" aria-hidden="true" />
    <Image className="travel-train-image" src="/train/heritage-express.webp" alt="" width={2086} height={218} priority unoptimized aria-hidden="true" />
    <div className="travel-vignette" aria-hidden="true" />
    <div className="travel-copy"><span>{ui.travellingTo}</span><h1>{stop.location[language]}</h1><p>{stop.title[language]}</p><div><i /><i /><i /><i /><i /></div></div>
  </section>;
}

function RecordDrawer({
  stop,
  hotspot,
  language,
  sessionId,
  previewPlaying,
  onTogglePreview,
  onClose,
}: {
  stop: ExperienceStop;
  hotspot: ExperienceHotspot;
  language: Language;
  sessionId: string;
  previewPlaying: boolean;
  onTogglePreview: () => void;
  onClose: () => void;
}) {
  const ui = copy[language];
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<GuideResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const sourceRecords = hotspot.sourceIds.map(getSource).filter(Boolean);
  const preview = audioFor(hotspot);
  const playablePreview = isPlayableAudio(preview);
  const questions = suggestedQuestions(hotspot);

  async function askQuestion(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed || loading) return;
    setQuestion(trimmed);
    setLoading(true);
    setAnswer(null);
    try {
      const response = await fetch("/api/guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stopId: stop.id, hotspotId: hotspot.id, question: trimmed, language, sessionId }),
      });
      const payload = await response.json() as GuideResponse;
      if (!response.ok) throw new Error("guide_failed");
      setAnswer(payload);
    } catch {
      setAnswer({ answer: language === "vi" ? "Hiện chưa kết nối được kho tư liệu. Hãy đọc thẻ nguồn bên dưới." : "The archive is temporarily unavailable. Please use the source card below.", sourceIds: [], grounded: false, refusalReason: "network", mode: "refusal" });
    } finally { setLoading(false); }
  }

  function ask(event: FormEvent) {
    event.preventDefault();
    void askQuestion(question);
  }

  const credit = localized(preview?.credit, language);
  const note = localized(preview?.note, language);
  const role = preview?.role === "heritage-ensemble-excerpt"
    ? (language === "vi" ? "Trích đoạn trình diễn di sản có giấy phép" : "Licensed heritage ensemble excerpt")
    : preview?.role === "interpretive-foley"
      ? (language === "vi" ? "Hiệu ứng minh họa do game tạo mới" : "Newly generated interpretive foley")
      : preview?.role === "official-reference"
        ? (language === "vi" ? "Tư liệu tham chiếu chính thức" : "Official reference recording")
        : preview?.role === "modern-ambient"
          ? (language === "vi" ? "Âm nền hiện đại, không mô phỏng di sản" : "Modern ambience, not heritage imitation")
          : note;

  return <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <aside className="record-drawer" role="dialog" aria-modal="true" aria-label={hotspot.label[language]}>
      <div className="drawer-top"><span>{stop.number} / {stop.location[language]}</span><button onClick={onClose} aria-label={ui.close}>×</button></div>
      <div className="record-heading"><span>{hotspot.kicker[language]}</span><h2>{hotspot.label[language]}</h2><p>{hotspot.story[language]}</p></div>
      <div className="fact-list">{hotspot.facts.map((fact, index) => <div key={fact.vi}><span>0{index + 1}</span><p>{fact[language]}</p></div>)}</div>

      {playablePreview && preview && <div className="media-card direct-audio-card">
        <span>♪ {ui.localAudio}</span>
        <button onClick={onTogglePreview} aria-pressed={previewPlaying}>
          <span className={`sound-wave ${previewPlaying ? "playing" : ""}`} aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
          <b>{previewPlaying ? ui.pauseAudio : ui.playAudio}</b>
          <em>{role || `${hotspot.label[language]} · ${preview.license || "verified media"}`}</em>
        </button>
        {(credit || preview.license || note) && <small>{credit}{credit && preview.license ? " · " : ""}{preview.license}{note ? ` · ${note}` : ""}</small>}
      </div>}
      {!playablePreview && (Boolean(preview) || hotspot.interaction === "audio") && <div className="media-card pending-audio-card">
        <span>◇ {ui.audioPending}</span>
        <p>{ui.audioPendingBody}</p>
        {(credit || note || preview?.license) && <small>{credit || note}{preview?.license ? ` · ${preview.license}` : ""}</small>}
      </div>}
      {hotspot.media?.kind === "animation" && <div className={`craft-animation ${stop.id === "cham-pottery" ? "pottery-animation" : "rhythm-animation"}`} aria-label={ui.animationNote}><div className="animation-stage"><i /><i /><i /><i /><span /></div><small>{ui.animationNote}</small></div>}

      <form className="guide-box" onSubmit={ask}>
        <div><span className="conductor-mark">AI</span><p><b>{ui.askTitle}</b><small>{ui.askHint}</small></p></div>
        <div className="question-suggestions"><span>{ui.suggestions}</span>{questions.map((item) => <button type="button" key={item.vi} disabled={loading} onClick={() => void askQuestion(item[language])}>{item[language]}</button>)}</div>
        <label><span className="sr-only">{ui.askTitle}</span><input maxLength={300} value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={ui.askPlaceholder} /><button aria-label={ui.ask} disabled={loading || !question.trim()}>{loading ? "···" : "→"}</button></label>
        {loading && <span className="checking" role="status">{ui.asking}</span>}
        {answer && <div className={`guide-answer ${answer.grounded ? "grounded" : "refused"}`} aria-live="polite"><span>{answer.mode === "ai" ? ui.aiLive : ui.aiFallback}</span><p>{answer.answer}</p>{answer.sourceIds.length > 0 && <small>{ui.verified}: {answer.sourceIds.join(", ")}</small>}</div>}
      </form>

      <section className="source-stack">
        {sourceRecords.map((source) => source && <article key={source.id}>
          <div><span className="approval-dot" /><small>{ui.verified}</small></div>
          <h3>{source.title[language]}</h3>
          <p>{source.institution}</p>
          <dl><div><dt>{ui.reviewedBy}</dt><dd>{source.reviewedBy}</dd></div><div><dt>{ui.rights}</dt><dd>{source.rights[language]}</dd></div></dl>
          <a href={source.url} target="_blank" rel="noreferrer">{ui.source} ↗</a>
        </article>)}
      </section>
    </aside>
  </div>;
}

function Archive({ language, visited, onClose }: { language: Language; visited: Set<string>; onClose: () => void }) {
  const ui = copy[language];
  const records = useMemo(() => experienceStops.flatMap((stop) => stop.hotspots.filter((hotspot) => visited.has(`${stop.id}:${hotspot.id}`)).map((hotspot) => ({ stop, hotspot }))), [visited]);

  function exportArchive() {
    const payload = records.map(({ stop, hotspot }) => ({
      stop: stop.title,
      location: stop.location,
      record: { id: hotspot.id, label: hotspot.label, story: hotspot.story, sourceIds: hotspot.sourceIds },
      sources: hotspot.sourceIds.map(getSource),
      exportedAt: new Date().toISOString(),
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "tau-di-san-archive.json"; anchor.click();
    URL.revokeObjectURL(url);
  }

  return <div className="archive-overlay" role="dialog" aria-modal="true" aria-label={ui.archive}>
    <header><div><span>ARCHIVE / {records.length.toString().padStart(2, "0")}</span><h2>{ui.archive}</h2><p>{ui.archiveIntro}</p></div><button onClick={onClose} aria-label={ui.close}>×</button></header>
    {records.length === 0 ? <div className="archive-empty"><i>◇</i><p>{ui.emptyArchive}</p></div> : <div className="archive-grid">{records.map(({ stop, hotspot }, index) => <article key={`${stop.id}:${hotspot.id}`}>
      <span>{String(index + 1).padStart(2, "0")} · {stop.location[language]}</span>
      <h3>{hotspot.label[language]}</h3>
      <p>{hotspot.story[language]}</p>
      <small>✓ {hotspot.sourceIds.join(" · ")}</small>
    </article>)}</div>}
    <footer><button disabled={records.length === 0} onClick={exportArchive}>{ui.export} ↓</button><span>LOCAL ONLY · NO CAMERA · NO PERSONAL DATA</span></footer>
  </div>;
}
