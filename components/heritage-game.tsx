"use client";

import Image from "next/image";
import {
  PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { HandTrackingViewer } from "@/components/hand-tracking-viewer";
import { getSource, stops } from "@/lib/heritage";
import { downloadPassportJson, downloadPassportPdf } from "@/lib/passport-export";
import type { PassportRecord, PassportSeal } from "@/lib/passport-export";
import type { HeritageStop, Hotspot, Language, LocalizedText } from "@/lib/types";

type JourneyPhase = "landing" | "carriage" | "travelling" | "heritage" | "ending";
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
    | "southern-riverside";
};

type Soundscape = {
  src?: string | null;
  credit?: LocalizedText | string;
  license?: string;
  generatorPreset?: AudioPreview["generatorPreset"];
};

type ExperienceHotspot = Omit<Hotspot, "audioPreview"> & {
  audioPreview?: AudioPreview;
};

type ExperienceStop = Omit<HeritageStop, "soundscape" | "hotspots"> & {
  soundscape?: Soundscape;
  hotspots: ExperienceHotspot[];
};

type AmbientScene = {
  gain: GainNode;
  sources: AudioScheduledSourceNode[];
};

const experienceStops = stops as ExperienceStop[];
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
    memoryLamp: "ĐÈN KÝ ỨC",
    memoryHint: "Soi tìm 3 dấu vết. Mỗi vật phẩm sẽ trả lại một phần màu sắc cho không gian.",
    memoryProgress: "dấu vết đã thức",
    sceneRestored: "TOÀN CẢNH ĐÃ THỨC",
    sceneRestoredBody: "Màu sắc đã trở lại. Hãy dành một nhịp quan sát toàn cảnh trước khi đóng dấu hành trình.",
    claimSeal: "Tôi đã xem · Nhận con dấu",
    stationLocked: "Tìm đủ 3 vật phẩm để nhận con dấu",
    sealEarned: "CON DẤU DI SẢN",
    sealBody: "Bạn đã tìm đủ ba dấu vết và đánh thức toàn cảnh. Con dấu này ghi nhận một chặng khám phá, không thay thế sự công nhận của cộng đồng chủ thể.",
    continueJourney: "Đồng ý · Giữ dấu và xem toàn cảnh",
    openPassport: "Mở Hộ chiếu di sản",
    explored: "đã mở",
    archive: "Sổ di sản",
    verified: "Nguồn đã đối chiếu",
    sound: "Âm thanh",
    source: "Mở nguồn gốc",
    next: "Ga kế tiếp",
    previous: "Ga trước",
    finishJourney: "Kết thúc hành trình",
    askTitle: "Hồ sơ hiện vật",
    askHint: "Thông tin cần thiết được đối chiếu trực tiếp với nguồn bên dưới.",
    close: "Đóng",
    rights: "Quyền sử dụng",
    reviewedBy: "Đối chiếu bởi",
    export: "Xuất metadata JSON",
    exportPdf: "Tải Hộ chiếu PDF",
    exportingPdf: "Đang tạo Hộ chiếu PDF…",
    passport: "Hộ chiếu di sản",
    passportIntro: "Các con dấu, vật phẩm, nguồn đối chiếu và quyền sử dụng bạn đã thu thập trên hành trình.",
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
    arrival: "TÀU ĐANG VÀO GA",
    allStops: "Tuyến di sản",
    mute: "Tắt tiếng",
    unmute: "Bật tiếng",
    conductor: "NHÂN VIÊN SOÁT VÉ",
    conductorQuestion: "Chào mừng bạn lên Tàu Di Sản.",
    conductorDialogue: "Tôi đã chuẩn bị năm tấm vé. Hãy chọn một ga; đoàn tàu sẽ đưa bạn đến đúng không gian di sản ấy.",
    conductorPrompt: "Chọn điểm đến trên vé",
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
    memoryLamp: "MEMORY LANTERN",
    memoryHint: "Find 3 traces. Each discovery returns a layer of colour to the living setting.",
    memoryProgress: "traces awakened",
    sceneRestored: "THE WHOLE SCENE IS AWAKE",
    sceneRestoredBody: "Colour has returned. Take a moment to view the restored scene before stamping your journey.",
    claimSeal: "I have looked · Receive seal",
    stationLocked: "Find all 3 objects to earn this station seal",
    sealEarned: "HERITAGE STATION SEAL",
    sealBody: "You found all three traces and revealed the full scene. This seal records a learning journey; it does not replace recognition by the source community.",
    continueJourney: "Accept · Keep seal and view scene",
    openPassport: "Open heritage passport",
    explored: "opened",
    archive: "Heritage journal",
    verified: "Cross-checked source",
    sound: "Sound",
    source: "Open primary source",
    next: "Next stop",
    previous: "Previous stop",
    finishJourney: "Complete the journey",
    askTitle: "Object record",
    askHint: "Essential information is checked directly against the sources below.",
    close: "Close",
    rights: "Usage rights",
    reviewedBy: "Cross-checked by",
    export: "Export metadata JSON",
    exportPdf: "Download passport PDF",
    exportingPdf: "Creating passport PDF…",
    passport: "Heritage passport",
    passportIntro: "The seals, objects, cited sources and usage rights collected during your journey.",
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
    arrival: "NOW ARRIVING",
    allStops: "Heritage line",
    mute: "Mute",
    unmute: "Sound on",
    conductor: "TICKET CONDUCTOR",
    conductorQuestion: "Welcome aboard the Heritage Express.",
    conductorDialogue: "I have prepared five tickets. Choose a station and the train will carry you into that living-heritage setting.",
    conductorPrompt: "Choose a destination ticket",
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
  return Boolean(preview?.src);
}

function passportRecords(visited: Set<string>): PassportRecord[] {
  return experienceStops.flatMap((stop) => stop.hotspots
    .filter((hotspot) => visited.has(`${stop.id}:${hotspot.id}`))
    .map((hotspot) => ({
      stationNumber: stop.number,
      stationTitle: stop.title,
      location: stop.location,
      palette: stop.palette,
      itemId: hotspot.id,
      itemLabel: hotspot.label,
      story: hotspot.story,
      sources: hotspot.sourceIds.map(getSource).filter((source): source is NonNullable<ReturnType<typeof getSource>> => Boolean(source)),
    })));
}

function passportSeals(sealed: Set<string>): PassportSeal[] {
  return experienceStops.filter((stop) => sealed.has(stop.id)).map((stop) => ({
    id: stop.id,
    number: stop.number,
    title: stop.title,
    location: stop.location,
    palette: stop.palette,
  }));
}

function useAmbientAudio(environment: string, muted: boolean, ducked: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const ambienceRef = useRef<GainNode | null>(null);
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
      ambience.gain.value = duckedRef.current ? 0 : 0.082;
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
    ambience.gain.setTargetAtTime(ducked ? 0 : 0.082, context.currentTime, 0.12);
  }, [ducked]);

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
    activeSceneRef.current?.sources.forEach((source) => {
      try { source.stop(); } catch { /* source may already be stopped */ }
    });
    if (contextRef.current) void contextRef.current.close();
  }, []);

  return { enable };
}

export function HeritageGame() {
  const [language, setLanguage] = useState<Language>("vi");
  const [phase, setPhase] = useState<JourneyPhase>("landing");
  const [stopIndex, setStopIndex] = useState(0);
  const [pendingStopIndex, setPendingStopIndex] = useState(0);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [openHotspot, setOpenHotspot] = useState<ExperienceHotspot | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [sealed, setSealed] = useState<Set<string>>(new Set());
  const [sealStopId, setSealStopId] = useState<string | null>(null);
  const [potteryShaped, setPotteryShaped] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState<string | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const travelTimerRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const ui = copy[language];
  const stop = experienceStops[stopIndex];
  const pendingStop = experienceStops[pendingStopIndex];
  const ambienceEnvironment = phase === "heritage" ? stop.soundscape?.generatorPreset || stop.id : "carriage";
  const { enable: enableAmbient } = useAmbientAudio(ambienceEnvironment, muted, Boolean(previewPlaying));

  useEffect(() => {
    const imageSources = [
      "/train/coastal-transit-v2.webp",
      "/train/straight-track-v2.png",
      "/train/heritage-express.webp",
      "/train/heritage-carriage.webp",
      "/characters/ticket-conductor-v2.png",
      ...experienceStops.map((item) => item.scene),
    ];
    const idle = window.setTimeout(() => {
      imageSources.forEach((source) => {
        const image = new window.Image();
        image.decoding = "async";
        image.src = source;
        void image.decode().catch(() => undefined);
      });
      const licensedAudio = experienceStops.flatMap((item) => [
        ...item.hotspots.flatMap((hotspot) => hotspot.audioPreview?.src ? [hotspot.audioPreview.src] : []),
        ...(item.unlock?.audio.src ? [item.unlock.audio.src] : []),
      ]);
      licensedAudio.forEach((source) => { const audio = new Audio(source); audio.preload = "auto"; });
    }, 180);
    return () => window.clearTimeout(idle);
  }, []);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("heritage-language");
    const savedVisited = window.localStorage.getItem("heritage-visited-v2");
    const savedSeals = window.localStorage.getItem("heritage-seals-v1");
    const savedPotteryShaped = window.localStorage.getItem("heritage-pottery-shaped");
    const savedMuted = window.localStorage.getItem("heritage-muted");
    const restore = window.setTimeout(() => {
      if (savedLanguage === "vi" || savedLanguage === "en") setLanguage(savedLanguage);
      if (savedVisited) {
        try { setVisited(new Set(JSON.parse(savedVisited) as string[])); } catch { /* ignore invalid local state */ }
      }
      if (savedSeals) {
        try { setSealed(new Set(JSON.parse(savedSeals) as string[])); } catch { /* ignore invalid local state */ }
      }
      if (savedPotteryShaped === "true") setPotteryShaped(true);
      if (savedMuted === "true") setMuted(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("heritage-language", language);
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("heritage-visited-v2", JSON.stringify([...visited]));
  }, [visited]);

  useEffect(() => {
    window.localStorage.setItem("heritage-seals-v1", JSON.stringify([...sealed]));
  }, [sealed]);

  useEffect(() => {
    window.localStorage.setItem("heritage-pottery-shaped", String(potteryShaped));
  }, [potteryShaped]);

  useEffect(() => {
    window.localStorage.setItem("heritage-muted", String(muted));
    if (previewAudioRef.current) previewAudioRef.current.muted = muted;
  }, [muted]);

  const stopPreview = useCallback(() => {
    const audio = previewAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    }
    previewAudioRef.current = null;
    setPreviewPlaying(null);
  }, []);

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
  }, [archiveOpen, openHotspot, phase, sealed, stop, stopPreview, visited]);

  function toggleMuted() {
    enableAmbient();
    setMuted((value) => !value);
  }

  function playPreview(hotspot: ExperienceHotspot, keyOverride?: string) {
    const preview = audioFor(hotspot);
    if (!preview || !isPlayableAudio(preview)) return;
    enableAmbient();
    const key = keyOverride || `${stop.id}:${hotspot.id}`;
    const currentAudio = previewAudioRef.current;

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

  function closeRecord() {
    setOpenHotspot(null);
    stopPreview();
  }

  function requestSeal() {
    if (stationComplete && !stationSealed) setSealStopId(stop.id);
  }

  function collectSeal() {
    if (!sealStopId) return;
    const nextSealed = new Set(sealed).add(sealStopId);
    setSealed(nextSealed);
    setSealStopId(null);
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
    }, 2_650);
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
    const scene = sceneRef.current;
    if (!scene) return;
    const sceneRect = scene.getBoundingClientRect();
    scene.style.setProperty("--light-x", `${event.clientX - sceneRect.left}px`);
    scene.style.setProperty("--light-y", `${event.clientY - sceneRect.top}px`);
    scene.dataset.lamp = "active";
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
  const stopUnlockOpen = Boolean(stop.unlock?.requiredHotspotIds.every((id) => visited.has(`${stop.id}:${id}`)));
  const stationComplete = stopVisited === stop.hotspots.length;
  const stationSealed = sealed.has(stop.id);

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
          const hasSeal = sealed.has(item.id);
          return <button key={item.id} className={`${index === stopIndex ? "current" : ""} ${completed ? "completed" : ""} ${hasSeal ? "sealed" : ""}`} onClick={() => beginTravel(index)}>
            <i />
            <span>{item.location[language].split("·")[0]}</span>
          </button>;
        })}
      </section>

      <section className="scene-wrap" style={{ "--scene-image": `url(${stop.scene})` } as CSSProperties}>
        <div className="train-frame" aria-hidden="true"><span className="frame-top" /><span className="frame-left" /><span className="frame-right" /><span className="frame-bottom" /></div>
        <div
          ref={sceneRef}
          className={`scene memory-scene ${stationComplete ? "memory-complete" : ""} ${stop.id === "cham-pottery" && potteryShaped ? "pottery-shaped" : ""}`}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => { setActiveHotspotId(null); if (sceneRef.current) sceneRef.current.dataset.lamp = "idle"; }}
          style={{ backgroundImage: `linear-gradient(180deg, transparent 68%, rgba(8, 8, 7, .2)), url(${stop.scene})` }}
          aria-label={`${stop.title[language]} — ${stop.description[language]}`}
        >
          {stop.hotspots.filter((hotspot) => visited.has(`${stop.id}:${hotspot.id}`)).map((hotspot) => <span
            key={`memory:${hotspot.id}`}
            className="memory-color-patch"
            data-memory-id={hotspot.id}
            style={{ "--memory-x": `${hotspot.x}%`, "--memory-y": `${hotspot.y}%`, "--memory-scene": `url(${stop.scene})` } as CSSProperties}
            aria-hidden="true"
          />)}
          <span className="memory-darkness" aria-hidden="true" />
          <span className="memory-lamp" aria-hidden="true" />
          <div className="scene-discovery-progress"><b>{ui.memoryLamp}</b><span>{stopVisited}/3 {ui.memoryProgress}</span><small>{ui.memoryHint}</small></div>
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
          {stationComplete && !stationSealed && !openHotspot && <aside className="station-reveal-card" role="status">
            <div><i aria-hidden="true">✦</i><span><b>{ui.sceneRestored}</b><small>{ui.sceneRestoredBody}</small></span></div>
            <button type="button" onClick={requestSeal}>{ui.claimSeal}<strong>→</strong></button>
          </aside>}
        </div>
        <div className="scene-footer">
          <div><b>{stopVisited}/{stop.hotspots.length}</b><span>{ui.explored}</span></div>
          <p>{ui.illustration}</p>
          <div className="station-controls">
            <button className="station-direction station-previous" aria-label={ui.previous} disabled={stopIndex === 0} onClick={() => beginTravel(stopIndex - 1)}><span aria-hidden="true">←</span><em>{ui.previous}</em></button>
            {stopIndex === experienceStops.length - 1
              ? <button className="finish-journey-button" disabled={!stationSealed || sealed.size < experienceStops.length} onClick={finishJourney}><em>{stationSealed ? ui.finishJourney : ui.stationLocked}</em><span aria-hidden="true">→</span></button>
              : <button className="station-direction station-next" aria-label={stationSealed ? ui.next : ui.stationLocked} disabled={!stationSealed} onClick={() => beginTravel(stopIndex + 1)}><em>{stationSealed ? ui.next : ui.stationLocked}</em><span aria-hidden="true">→</span></button>}
          </div>
        </div>
      </section>
      </>}

      {phase === "landing" && <Intro language={language} onLanguage={setLanguage} onStart={() => { enableAmbient(); setPhase("carriage"); }} />}
      {phase === "carriage" && <Carriage language={language} muted={muted} onLanguage={setLanguage} onToggleMuted={toggleMuted} onBack={resetToLanding} onDestination={beginTravel} onAudioActivate={enableAmbient} />}
      {phase === "travelling" && <TravelScreen stop={pendingStop} language={language} />}
      {phase === "ending" && <Ending language={language} visited={visited} sealed={sealed} onLanguage={setLanguage} onReplay={replayJourney} onReturn={() => setPhase("heritage")} />}
      {phase === "heritage" && <div className="ambient-disclosure" role="note">♪ {ui.neutralSound}<span>{ui.ambientNote}</span></div>}
      {openHotspot && <RecordDrawer
        key={`${stop.id}:${openHotspot.id}`}
        stop={stop}
        hotspot={openHotspot}
        language={language}
        previewPlaying={previewPlaying === `${stop.id}:${openHotspot.id}`}
        onTogglePreview={() => playPreview(openHotspot)}
        unlock={stopUnlockOpen ? stop.unlock : undefined}
        unlockPlaying={previewPlaying === `${stop.id}:unlock`}
        onToggleUnlock={() => stop.unlock && playPreview({ ...openHotspot, audioPreview: stop.unlock.audio }, `${stop.id}:unlock`)}
        onInteractionComplete={() => setPotteryShaped(true)}
        onClose={closeRecord}
      />}
      {sealStopId && <StationSeal language={language} stop={experienceStops.find((item) => item.id === sealStopId) || stop} onContinue={collectSeal} />}
      {archiveOpen && <Archive language={language} visited={visited} sealed={sealed} onClose={() => setArchiveOpen(false)} />}
    </main>
  );
}

function StationSeal({ language, stop, onContinue }: { language: Language; stop: ExperienceStop; onContinue: () => void }) {
  const ui = copy[language];
  return <div className="seal-overlay" role="dialog" aria-modal="true" aria-labelledby="seal-title">
    <section className="station-seal-card" style={{ "--seal-accent": stop.palette } as CSSProperties}>
      <span className="seal-rays" aria-hidden="true" />
      <div className="seal-emblem" aria-hidden="true"><i>{stop.number}</i><b>✦</b></div>
      <span>{ui.sealEarned}</span>
      <h2 id="seal-title">{stop.title[language]}</h2>
      <p>{stop.location[language]}</p>
      <small>{ui.sealBody}</small>
      <button type="button" onClick={onContinue}>{ui.continueJourney}<b>→</b></button>
    </section>
  </div>;
}

function Ending({
  language,
  visited,
  sealed,
  onLanguage,
  onReplay,
  onReturn,
}: {
  language: Language;
  visited: Set<string>;
  sealed: Set<string>;
  onLanguage: (language: Language) => void;
  onReplay: () => void;
  onReturn: () => void;
}) {
  const ui = copy[language];
  const [passportOpen, setPassportOpen] = useState(false);
  return <section className="ending-screen" aria-labelledby="ending-title">
    <Image className="ending-cover-image" src="/og.webp" alt="" fill priority unoptimized sizes="100vw" aria-hidden="true" />
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
      <div className="ending-seals" aria-label={ui.passport}>
        {experienceStops.map((stop) => <span key={stop.id} className={sealed.has(stop.id) ? "earned" : ""} style={{ "--seal-accent": stop.palette } as CSSProperties}><b>{stop.number}</b><small>{stop.location[language].split("·")[0]}</small></span>)}
      </div>
      <div className="ending-actions">
        <button className="ending-primary" onClick={() => setPassportOpen(true)}>{ui.openPassport}<b>↗</b></button>
        <button className="ending-secondary" onClick={onReplay}>{ui.replayJourney} ↻</button>
        <button className="ending-secondary" onClick={onReturn}>← {ui.returnLastStop}</button>
      </div>
    </div>
    {passportOpen && <Archive language={language} visited={visited} sealed={sealed} passport onClose={() => setPassportOpen(false)} />}
  </section>;
}

function Intro({ language, onLanguage, onStart }: { language: Language; onLanguage: (language: Language) => void; onStart: () => void }) {
  const ui = copy[language];
  return <section className="intro-screen" aria-labelledby="intro-title">
    <Image className="intro-cover-image" src="/og.webp" alt="Tàu Di Sản Việt Nam — Chạm vào ký ức đang sống" fill priority unoptimized sizes="100vw" />
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
  onLanguage,
  onToggleMuted,
  onBack,
  onDestination,
  onAudioActivate,
}: {
  language: Language;
  muted: boolean;
  onLanguage: (language: Language) => void;
  onToggleMuted: () => void;
  onBack: () => void;
  onDestination: (index: number) => void;
  onAudioActivate: () => void;
}) {
  const ui = copy[language];
  const [dialogueReady, setDialogueReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDialogueReady(true), 520);
    return () => window.clearTimeout(timer);
  }, []);

  function chooseDestination(index: number) {
    onAudioActivate();
    onDestination(index);
  }

  return <section className="carriage-screen" aria-labelledby="carriage-title">
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

    <div className={`conductor-panel story-dialogue compact-dialogue ${dialogueReady ? "dialogue-ready" : ""}`}>
      <div className="dialogue-speaker"><i /> {ui.conductor}</div>
      <h1 id="carriage-title">{ui.conductorQuestion}</h1>
      <p className="typewriter-line">{ui.conductorDialogue}</p>
      <div className="station-choice">
        <span>{ui.conductorPrompt}</span>
        <div>
          {experienceStops.map((item, index) => <button key={item.id} onClick={() => chooseDestination(index)}>
            <small>{item.number}</small>
            <b>{item.location[language].split("·")[0]}</b>
            <em>{item.title[language]}</em>
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
  previewPlaying,
  onTogglePreview,
  unlock,
  unlockPlaying,
  onToggleUnlock,
  onInteractionComplete,
  onClose,
}: {
  stop: ExperienceStop;
  hotspot: ExperienceHotspot;
  language: Language;
  previewPlaying: boolean;
  onTogglePreview: () => void;
  unlock?: NonNullable<ExperienceStop["unlock"]>;
  unlockPlaying: boolean;
  onToggleUnlock: () => void;
  onInteractionComplete: () => void;
  onClose: () => void;
}) {
  const ui = copy[language];
  const sourceRecords = hotspot.sourceIds.map(getSource).filter(Boolean);
  const preview = audioFor(hotspot);
  const playablePreview = isPlayableAudio(preview);

  const credit = localized(preview?.credit, language);
  const note = localized(preview?.note, language);
  const role = preview?.role === "heritage-ensemble-excerpt"
    ? (language === "vi" ? "Trích đoạn trình diễn di sản có giấy phép" : "Licensed heritage ensemble excerpt")
    : preview?.role === "licensed-field-recording"
      ? (language === "vi" ? "Bản ghi thực có giấy phép" : "Licensed real-world recording")
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
        {hotspot.media?.kind === "official-link" && hotspot.media.sourceUrl && <a className="official-audio-link" href={hotspot.media.sourceUrl} target="_blank" rel="noreferrer">
          {language === "vi" ? "Mở tư liệu tại nguồn chính thức" : "Open media at the official source"} ↗
        </a>}
      </div>}
      {unlock && <div className="media-card direct-audio-card unlocked-ensemble">
        <span>◆ {language === "vi" ? "HỒ SƠ ÂM THANH ĐÃ MỞ KHÓA" : "AUDIO RECORD UNLOCKED"}</span>
        <p>{unlock.message[language]}</p>
        <button onClick={onToggleUnlock} aria-pressed={unlockPlaying}>
          <span className={`sound-wave ${unlockPlaying ? "playing" : ""}`} aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
          <b>{unlockPlaying ? ui.pauseAudio : (language === "vi" ? "Nghe toàn bộ nhóm Ca trù · 22 giây" : "Hear the full Ca trù group · 22 seconds")}</b>
          <em>{unlock.audio.credit[language]} · {unlock.audio.license}</em>
        </button>
      </div>}
      {hotspot.media?.kind === "animation" && <div className={`craft-animation ${stop.id === "cham-pottery" ? "pottery-animation" : "rhythm-animation"}`} aria-label={ui.animationNote}><div className="animation-stage"><i /><i /><i /><i /><span /></div><small>{ui.animationNote}</small></div>}

      <section className="object-record-summary">
        <div><span className="record-mark">✦</span><p><b>{ui.askTitle}</b><small>{ui.askHint}</small></p></div>
        <dl>
          <div><dt>{language === "vi" ? "Bối cảnh" : "Context"}</dt><dd>{stop.description[language]}</dd></div>
          <div><dt>{language === "vi" ? "Giới hạn diễn giải" : "Interpretive boundary"}</dt><dd>{language === "vi" ? "Chỉ trình bày dữ kiện có trong hồ sơ nguồn; mọi bản ghi bối cảnh đều được ghi rõ và không được coi là bản trình diễn di sản nếu nguồn không xác nhận như vậy." : "Only source-backed facts are presented; contextual recordings are explicitly labelled and are not treated as heritage performances unless their source confirms that role."}</dd></div>
        </dl>
      </section>

      <HandTrackingViewer language={language} spriteSrc={hotspot.artifactSprite} malleable={stop.id === "cham-pottery" && hotspot.id === "hand-shaping"} label={hotspot.label[language]} onComplete={onInteractionComplete} />

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

function Archive({ language, visited, sealed, passport = false, onClose }: { language: Language; visited: Set<string>; sealed: Set<string>; passport?: boolean; onClose: () => void }) {
  const ui = copy[language];
  const records = useMemo(() => experienceStops.flatMap((stop) => stop.hotspots.filter((hotspot) => visited.has(`${stop.id}:${hotspot.id}`)).map((hotspot) => ({ stop, hotspot }))), [visited]);
  const [exportingPdf, setExportingPdf] = useState(false);
  const exportRecords = useMemo(() => passportRecords(visited), [visited]);
  const exportSeals = useMemo(() => passportSeals(sealed), [sealed]);

  async function exportPdf() {
    setExportingPdf(true);
    try { await downloadPassportPdf(exportRecords, exportSeals, language); }
    finally { setExportingPdf(false); }
  }

  return <div className={`archive-overlay ${passport ? "passport-overlay" : ""}`} role="dialog" aria-modal="true" aria-label={passport ? ui.passport : ui.archive}>
    <div className={passport ? "passport-book" : "archive-ledger"}>
      {passport && <section className="passport-hero" aria-label={language === "vi" ? "Bìa hành trình" : "Journey cover"}>
        <Image className="passport-hero-image" src="/og.webp" alt="" fill unoptimized sizes="(max-width: 720px) 100vw, 1100px" aria-hidden="true" />
        <span className="passport-hero-shade" aria-hidden="true" />
        <div className="passport-hero-copy"><span>VIET NAM · HERITAGE RAIL</span><b>TĐS</b><small>{language === "vi" ? "CHẠM VÀO KÝ ỨC ĐANG SỐNG" : "TOUCH THE LIVING MEMORY"}</small></div>
      </section>}
      <header><div><span>{passport ? "PASSPORT · TĐS 2026" : "ARCHIVE"} / {records.length.toString().padStart(2, "0")}</span><h2>{passport ? ui.passport : ui.archive}</h2><p>{passport ? ui.passportIntro : ui.archiveIntro}</p></div><button onClick={onClose} aria-label={ui.close}>×</button></header>
      {passport && <section className="passport-identity" aria-label={language === "vi" ? "Thông tin hành trình" : "Journey information"}>
        <div className="passport-monogram"><span>T</span><b>05</b><small>GA DI SẢN</small></div>
        <dl>
          <div><dt>{language === "vi" ? "Hành trình" : "Journey"}</dt><dd>Bắc → Nam</dd></div>
          <div><dt>{language === "vi" ? "Con dấu" : "Seals"}</dt><dd>{sealed.size.toString().padStart(2, "0")} / 05</dd></div>
          <div><dt>{language === "vi" ? "Vật phẩm" : "Objects"}</dt><dd>{records.length.toString().padStart(2, "0")} / 15</dd></div>
          <div><dt>{language === "vi" ? "Nguyên tắc" : "Principle"}</dt><dd>{language === "vi" ? "Có nguồn · Tôn trọng quyền văn hóa" : "Sourced · Cultural rights respected"}</dd></div>
        </dl>
      </section>}
      <div className="passport-seal-strip" aria-label={language === "vi" ? "Các con dấu đã nhận" : "Earned station seals"}>{experienceStops.map((stop) => <span key={stop.id} className={sealed.has(stop.id) ? "earned" : ""} style={{ "--seal-accent": stop.palette } as CSSProperties}><i>VIỆT NAM</i><b>{stop.number}</b><small>{stop.title[language]}</small></span>)}</div>
      {records.length === 0 ? <div className="archive-empty"><i>◇</i><p>{ui.emptyArchive}</p></div> : <div className="archive-grid">{records.map(({ stop, hotspot }, index) => <article key={`${stop.id}:${hotspot.id}`} style={{ "--entry-accent": stop.palette } as CSSProperties}>
        {passport ? <div className="passport-entry-head"><span>{stop.location[language]}</span><i>{String(index + 1).padStart(2, "0")}</i></div> : <span>{String(index + 1).padStart(2, "0")} · {stop.location[language]}</span>}
        <h3>{hotspot.label[language]}</h3>
        <p>{hotspot.story[language]}</p>
        <div className="passport-source-note"><small>✓ {hotspot.sourceIds.map((id) => getSource(id)?.title[language] || id).join(" · ")}</small><em>{hotspot.sourceIds.map((id) => getSource(id)?.rights[language]).filter(Boolean).join(" · ")}</em></div>
      </article>)}</div>}
      <footer><div><button disabled={records.length === 0} onClick={() => downloadPassportJson(exportRecords, exportSeals)}>{ui.export} ↓</button><button disabled={records.length === 0 || exportingPdf} onClick={exportPdf}>{exportingPdf ? ui.exportingPdf : ui.exportPdf} ↓</button></div><span>CAMERA LOCAL ONLY · NO UPLOAD · NO PERSONAL DATA</span></footer>
    </div>
  </div>;
}
