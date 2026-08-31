"use client";

import Image from "@/components/Image";
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
import { JourneyGuideModal } from "@/components/JourneyGuideModal";
import { SupportModal } from "@/components/support-modal";
import { ThankYouDiorama } from "@/components/thank-you-diorama";
import { GalleryWishesMarquee } from "@/components/gallery-wishes-marquee";
import { getSource, stops } from "@/lib/heritage";
import { downloadPassportJson, downloadPassportPdf } from "@/lib/passport-export";
import type { PassportRecord, PassportSeal } from "@/lib/passport-export";
import {
  playClickSfx,
  playItemDiscoverSfx,
  playPaperSfx,
  playSealSfx,
  playTicketSelectSfx,
} from "@/lib/sound-effects";
import {
  playEndingGoldenEmbers,
  stopEndingMusic,
  updateEndingMusicVolume,
} from "@/lib/ending-music";
import type { HeritageStop, Hotspot, Language, LocalizedText } from "@/lib/types";

type JourneyPhase = "landing" | "carriage" | "travelling" | "heritage" | "ending";
type AudioPreview = {
  id?: string;
  kind?: "local-audio" | "official-source" | "youtube-embed" | "synthesized";
  src?: string | null;
  embedUrl?: string;
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

type MuseumRecord = {
  stop: ExperienceStop;
  hotspot: ExperienceHotspot;
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
    introSpecialEndingTip: "✨ Cuối hành trình: Khám phá không gian lưu trữ di sản & gửi gắm cảm nghĩ cùng nhiều điều thú vị đang chờ đón!",
    start: "Bắt đầu hành trình",
    instruction: "Di chuột gần một vật để đánh thức câu chuyện",
    touchInstruction: "Chạm vào từng vật phẩm để trả lại màu ký ức",
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
    volume: "Âm lượng",
    volumeLevel: "Chỉnh âm lượng",
    volumeMuted: "Đã tắt tiếng",
    conductor: "NHÂN VIÊN SOÁT VÉ",
    conductorQuestion: "Chào mừng bạn lên Tàu Di Sản.",
    conductorDialogue: "Tôi đã chuẩn bị năm tấm vé. Hãy chọn một ga; đoàn tàu sẽ đưa bạn đến đúng không gian di sản ấy.",
    conductorPrompt: "Chọn điểm đến trên vé",
    backLanding: "Về trang đầu",
    travellingTo: "ĐANG RỜI KHOANG · ĐI ĐẾN",
    neutralSound: "Nhạc nền",
    endingKicker: "HÀNH TRÌNH KHÉP LẠI · DI SẢN TIẾP TỤC SỐNG",
    endingTitle: "Tàu Di Sản Việt Nam",
    endingTagline: "Chạm vào ký ức đang sống.",
    endingBody: "Những gì bạn vừa mở không chỉ thuộc về quá khứ — đó là tri thức vẫn đang được cộng đồng trao truyền hôm nay.",
    memoryMapKicker: "BẢN ĐỒ HỒI TƯỞNG · 05 GA ĐÃ MỞ",
    memoryMapTitle: "Đi lại một miền ký ức",
    memoryMapBody: "Chọn một khung cảnh. Đoàn tàu sẽ đưa bạn trở lại ga ấy với toàn bộ màu sắc và vật phẩm đã khám phá.",
    revisitStop: "Trở lại ga này",
    museumKicker: "KHO BẢO TÀNG · BỘ SƯU TẬP CỦA BẠN",
    museumTitle: "Những vật phẩm đã chạm",
    museumBody: "Mỗi hiện vật là một lối vào hồ sơ nguồn. Chạm để mở lại câu chuyện, âm thanh và quyền sử dụng.",
    museumEmpty: "Chưa có vật phẩm nào trong kho.",
    returnSummary: "Về trang tổng kết",
    newJourney: "Chơi mới toàn bộ",
    resetTitle: "Bắt đầu một hành trình mới?",
    resetBody: "Vật phẩm và con dấu trên thiết bị này sẽ được xóa. Ngôn ngữ và lựa chọn âm thanh vẫn được giữ lại.",
    resetCancel: "Tiếp tục giữ hành trình",
    resetConfirm: "Xóa tiến trình · Chơi mới",
    guide: "Cẩm nang hành trình A-Z",
    guideButton: "Cẩm nang & Lộ trình 📜",
  },
  en: {
    brand: "HERITAGE EXPRESS",
    brandSub: "A living Viet Nam",
    board: "BOARD TRAIN",
    introKicker: "NORTH — SOUTH / 05 STOPS",
    introTitleA: "Cross Viet Nam.",
    introTitleB: "Listen to what remains.",
    introBody: "Stand inside a train carriage, open five doors and touch memories passed from person to person. Every story travels with its source.",
    introSpecialEndingTip: "✨ Journey's end: Discover the living archive & leave your reflections alongside special surprises!",
    start: "Begin the journey",
    instruction: "Move close to an object to wake its story",
    touchInstruction: "Tap each object to restore its memory colours",
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
    volume: "Volume",
    volumeLevel: "Adjust volume",
    volumeMuted: "Muted",
    conductor: "TICKET CONDUCTOR",
    conductorQuestion: "Welcome aboard the Heritage Express.",
    conductorDialogue: "I have prepared five tickets. Choose a station and the train will carry you into that living-heritage setting.",
    conductorPrompt: "Choose a destination ticket",
    backLanding: "Back to the opening",
    travellingTo: "LEAVING THE CARRIAGE · BOUND FOR",
    neutralSound: "Ambient audio",
    endingKicker: "THE JOURNEY CLOSES · HERITAGE LIVES ON",
    endingTitle: "Viet Nam Heritage Express",
    endingTagline: "Touch living memory.",
    endingBody: "What you have opened does not belong only to the past — it is knowledge communities continue to transmit today.",
    memoryMapKicker: "MEMORY MAP · 05 OPENED STATIONS",
    memoryMapTitle: "Return to a living memory",
    memoryMapBody: "Choose a scene. The train will carry you back with every colour and object you discovered restored.",
    revisitStop: "Return to this station",
    museumKicker: "MUSEUM VAULT · YOUR COLLECTION",
    museumTitle: "Objects you touched",
    museumBody: "Each object opens a sourced record. Touch it to revisit the story, sound and usage rights.",
    museumEmpty: "No objects have been collected yet.",
    returnSummary: "Return to journey summary",
    newJourney: "Start a completely new game",
    resetTitle: "Begin a new journey?",
    resetBody: "Objects and seals on this device will be removed. Language and sound preferences will be preserved.",
    resetCancel: "Keep this journey",
    resetConfirm: "Clear progress · Start new",
    guide: "Journey Guide A-Z",
    guideButton: "Guide & Story 📜",
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

function clockTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  return `${Math.floor(safe / 60)}:${Math.floor(safe % 60).toString().padStart(2, "0")}`;
}

function passportRecords(visited: Set<string>): PassportRecord[] {
  return experienceStops.flatMap((stop) => stop.hotspots
    .filter((hotspot) => visited.has(`${stop.id}:${hotspot.id}`))
    .map((hotspot, index) => ({
      stationNumber: stop.number,
      stationTitle: stop.title,
      location: stop.location,
      palette: stop.palette,
      itemId: hotspot.id,
      itemLabel: hotspot.label,
      story: hotspot.story,
      sources: hotspot.sourceIds.map(getSource).filter((source): source is NonNullable<ReturnType<typeof getSource>> => Boolean(source)),
      ...(index === 0 && stop.unlock?.audio && stop.hotspots.every((item) => visited.has(`${stop.id}:${item.id}`)) ? {
        audioSource: {
          id: stop.unlock.audio.id,
          title: stop.unlock.title,
          url: stop.unlock.audio.sourceUrl,
          credit: stop.unlock.audio.credit,
          rights: stop.unlock.audio.license,
          note: stop.unlock.audio.note,
          durationSeconds: stop.unlock.audio.durationSeconds,
        },
      } : {}),
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

function useAmbientAudio(environment: string, muted: boolean, ducked: boolean, volume = 0.75) {
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const ambienceRef = useRef<GainNode | null>(null);
  const activeSceneRef = useRef<AmbientScene | null>(null);
  const environmentRef = useRef(environment);
  const enabledRef = useRef(false);
  const mutedRef = useRef(muted);
  const duckedRef = useRef(ducked);
  const volumeRef = useRef(volume);
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
    sceneGain.gain.linearRampToValueAtTime(1.0, now + 1.3);
    sceneGain.connect(ambience);

    const hum = context.createOscillator();
    const humGain = context.createGain();
    hum.type = "sine";
    hum.frequency.value = profile.base;
    humGain.gain.value = nextEnvironment === "train" || nextEnvironment === "carriage" ? 0.245 : 0.126;
    hum.connect(humGain).connect(sceneGain);

    const overtone = context.createOscillator();
    const overtoneGain = context.createGain();
    overtone.type = "sine";
    overtone.frequency.value = profile.base * 1.501;
    overtone.detune.value = 3;
    overtoneGain.gain.value = 0.005;
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
    noiseGain.gain.value = profile.air * 0.875;
    noise.connect(noiseFilter).connect(noiseGain).connect(sceneGain);

    const movement = context.createOscillator();
    const movementDepth = context.createGain();
    movement.type = "sine";
    movement.frequency.value = profile.pulse;
    movementDepth.gain.value = nextEnvironment === "train" || nextEnvironment === "carriage" ? 0.154 : 0.031;
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
        const envelope = Math.min(1, time * 4.5) * Math.exp(-1.8 * time);
        const fundamental = Math.sin(2 * Math.PI * noteFrequency * time);
        const shimmer = Math.sin(2 * Math.PI * noteFrequency * 2.01 * time) * 0.015;
        scoreData[startSample + sampleIndex] += (fundamental + shimmer) * envelope * 0.20;
      }
    }
    const score = context.createBufferSource();
    const scoreFilter = context.createBiquadFilter();
    const scoreGain = context.createGain();
    score.buffer = scoreBuffer;
    score.loop = true;
    scoreFilter.type = "lowpass";
    scoreFilter.frequency.value = 1_150;
    scoreGain.gain.value = nextEnvironment === "train" || nextEnvironment === "carriage" ? 0.50 : 0.42;
    score.connect(scoreFilter).connect(scoreGain).connect(sceneGain);

    const pad = context.createOscillator();
    const padGain = context.createGain();
    pad.type = "sine";
    pad.frequency.value = scoreRoot / 2;
    padGain.gain.value = 0.038;
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
      ambience.gain.value = duckedRef.current ? 0 : 0.38 * volumeRef.current;
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
    volumeRef.current = volume;
    const context = contextRef.current;
    const ambience = ambienceRef.current;
    if (!context || !ambience) return;
    ambience.gain.cancelScheduledValues(context.currentTime);
    ambience.gain.setTargetAtTime(ducked ? 0 : 0.38 * volume, context.currentTime, 0.12);
  }, [ducked, volume]);

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

function VolumeControl({
  muted,
  volume,
  onToggleMute,
  onVolumeChange,
  language,
}: {
  muted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  language: Language;
}) {
  const ui = copy[language];
  const displayPercent = muted ? 0 : Math.round(volume * 100);

  return (
    <div className="volume-control-group" role="group" aria-label={ui.volumeLevel}>
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={muted ? ui.unmute : ui.mute}
        className={`volume-toggle-button ${muted ? "is-muted" : ""}`}
        aria-pressed={muted}
        title={muted ? ui.unmute : ui.mute}
      >
        {muted ? "◌" : "♪"}
      </button>
      <div className="volume-slider-panel" title={`${ui.volume}: ${displayPercent}%`}>
        <div className="volume-slider-track">
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={muted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
            aria-label={ui.volumeLevel}
            aria-valuenow={displayPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className="volume-percent-badge">{displayPercent}%</span>
      </div>
    </div>
  );
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
  const [museumRecord, setMuseumRecord] = useState<MuseumRecord | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [previewPlaying, setPreviewPlaying] = useState<string | null>(null);
  const [stationTrackPlaying, setStationTrackPlaying] = useState<string | null>(null);
  const [stationTrackPosition, setStationTrackPosition] = useState(0);
  const [stationTrackDuration, setStationTrackDuration] = useState(0);
  const [externalReferenceOpen, setExternalReferenceOpen] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [isSceneImmersive, setIsSceneImmersive] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const travelTimerRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const stationAudioRef = useRef<HTMLAudioElement | null>(null);
  const ui = copy[language];
  const stop = experienceStops[stopIndex];
  const pendingStop = experienceStops[pendingStopIndex];
  const stopVisited = stop.hotspots.filter((hotspot) => visited.has(`${stop.id}:${hotspot.id}`)).length;
  const stationComplete = stopVisited === stop.hotspots.length;
  const ambienceEnvironment = phase === "heritage" && stationComplete ? stop.soundscape?.generatorPreset || stop.id : "carriage";
  const { enable: enableAmbient } = useAmbientAudio(
    ambienceEnvironment,
    muted || phase === "ending",
    Boolean(previewPlaying) || Boolean(stationTrackPlaying) || externalReferenceOpen || phase === "ending" || phase === "travelling",
    volume
  );

  useEffect(() => {
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const updatePointerMode = () => setIsCoarsePointer(coarsePointer.matches);
    updatePointerMode();
    if (typeof coarsePointer.addEventListener === "function") {
      coarsePointer.addEventListener("change", updatePointerMode);
      return () => coarsePointer.removeEventListener("change", updatePointerMode);
    }
    coarsePointer.addListener(updatePointerMode);
    return () => coarsePointer.removeListener(updatePointerMode);
  }, []);

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
    const savedMuted = window.localStorage.getItem("heritage-muted");
    const savedVolume = window.localStorage.getItem("heritage-volume");
    const restore = window.setTimeout(() => {
      if (savedLanguage === "vi" || savedLanguage === "en") setLanguage(savedLanguage);
      if (savedVisited) {
        try { setVisited(new Set(JSON.parse(savedVisited) as string[])); } catch { /* ignore invalid local state */ }
      }
      if (savedSeals) {
        try { setSealed(new Set(JSON.parse(savedSeals) as string[])); } catch { /* ignore invalid local state */ }
      }
      if (savedMuted === "true") setMuted(true);
      if (savedVolume) {
        const parsed = parseFloat(savedVolume);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          setVolume(parsed);
        }
      }
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
    window.localStorage.setItem("heritage-muted", String(muted));
    if (previewAudioRef.current) previewAudioRef.current.muted = muted;
    if (stationAudioRef.current) stationAudioRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    window.localStorage.setItem("heritage-volume", String(volume));
    if (previewAudioRef.current) {
      previewAudioRef.current.volume = Math.min(1, Math.max(0.05, 0.95 * volume));
    }
    if (stationAudioRef.current) {
      stationAudioRef.current.volume = Math.min(1, Math.max(0.05, 0.95 * volume));
    }
  }, [volume]);

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

  const stopStationTrack = useCallback(() => {
    const audio = stationAudioRef.current;
    if (audio) {
      audio.onloadedmetadata = null;
      audio.ontimeupdate = null;
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
      audio.load();
    }
    stationAudioRef.current = null;
    setStationTrackPlaying(null);
    setStationTrackPosition(0);
    setStationTrackDuration(0);
  }, []);

  useEffect(() => () => {
    if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current);
    const audio = previewAudioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    const stationAudio = stationAudioRef.current;
    if (stationAudio) {
      stationAudio.pause();
      stationAudio.src = "";
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isSceneImmersive) {
        setIsSceneImmersive(false);
      } else if (museumRecord) {
        stopPreview();
        setExternalReferenceOpen(false);
        setMuseumRecord(null);
      }
      else if (openHotspot) {
        setOpenHotspot(null);
        stopPreview();
        setExternalReferenceOpen(false);
      } else if (phase === "carriage") setPhase("landing");
      else if (phase === "ending") setPhase("heritage");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSceneImmersive, museumRecord, openHotspot, phase, stopPreview]);

  useEffect(() => {
    if (!isSceneImmersive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSceneImmersive]);

  // Global subtle click sound effects for interactive elements
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        "button, [role='button'], a, input, select, .hotspot, .carriage-ticket, .passport-seal-badge, .archive-grid article, .museum-map-vitrine, .museum-object-card, .guide-toc-item, .language-switch, .volume-toggle-button"
      );
      if (interactive) {
        // Hotspot handles its own distinctive discover chime
        if (!interactive.classList.contains("hotspot")) {
          playClickSfx({ muted, volume });
        }
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [muted, volume]);

  function toggleMuted() {
    enableAmbient();
    setMuted((value) => !value);
  }

  function handleVolumeChange(newVol: number) {
    enableAmbient();
    setVolume(newVol);
    if (muted && newVol > 0) {
      setMuted(false);
    }
  }

  function playPreview(hotspot: ExperienceHotspot, keyOverride?: string) {
    const preview = audioFor(hotspot);
    if (!preview || !isPlayableAudio(preview)) return;
    enableAmbient();
    stopStationTrack();
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
    audio.volume = Math.min(1, Math.max(0.05, 0.95 * volume));
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

  function playStationTrack(track = stop.unlock?.audio, key = stop.id) {
    if (!track?.src) return;
    enableAmbient();
    stopPreview();
    const current = stationAudioRef.current;
    if (current && current.dataset.trackKey === key) {
      if (current.paused) void current.play().then(() => setStationTrackPlaying(key)).catch(() => setStationTrackPlaying(null));
      else {
        current.pause();
        setStationTrackPlaying(null);
      }
      return;
    }
    stopStationTrack();
    const audio = new Audio(track.src);
    audio.dataset.trackKey = key;
    audio.preload = "auto";
    audio.muted = muted;
    audio.volume = Math.min(1, Math.max(0.05, 0.95 * volume));
    audio.onloadedmetadata = () => setStationTrackDuration(Number.isFinite(audio.duration) ? audio.duration : track.durationSeconds || 0);
    audio.ontimeupdate = () => setStationTrackPosition(audio.currentTime);
    audio.onended = () => {
      audio.currentTime = 0;
      setStationTrackPosition(0);
      setStationTrackPlaying(null);
    };
    audio.onerror = () => {
      setStationTrackPlaying(null);
      setStationTrackPosition(0);
    };
    stationAudioRef.current = audio;
    setStationTrackDuration(track.durationSeconds || 0);
    void audio.play().then(() => setStationTrackPlaying(key)).catch(() => setStationTrackPlaying(null));
  }

  function seekStationTrack(value: number) {
    const audio = stationAudioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setStationTrackPosition(value);
  }

  function openRecord(hotspot: ExperienceHotspot) {
    playItemDiscoverSfx({ muted, volume });
    const stationWasComplete = stop.hotspots.every((item) => visited.has(`${stop.id}:${item.id}`));
    const nextVisited = new Set(visited).add(`${stop.id}:${hotspot.id}`);
    const completesStation = stop.hotspots.every((item) => nextVisited.has(`${stop.id}:${item.id}`));
    setVisited(nextVisited);
    setOpenHotspot(hotspot);
    // The train bed stays active until all three objects are discovered. A
    // rights-cleared unlock recording starts on the final object.
    if (!stationWasComplete && completesStation && stop.unlock?.audio.src && isPlayableAudio(stop.unlock.audio)) {
      playStationTrack(stop.unlock.audio, stop.id);
    } else if (isPlayableAudio(audioFor(hotspot))) playPreview(hotspot);
  }

  function closeRecord() {
    playClickSfx({ muted, volume });
    setOpenHotspot(null);
    stopPreview();
    setExternalReferenceOpen(false);
  }

  function requestSeal() {
    if (stationComplete && !stationSealed) {
      playSealSfx({ muted, volume });
      setSealStopId(stop.id);
    }
  }

  function collectSeal() {
    if (!sealStopId) return;
    playClickSfx({ muted, volume });
    const nextSealed = new Set(sealed).add(sealStopId);
    setSealed(nextSealed);
    setSealStopId(null);
  }

  function beginTravel(index: number) {
    if (index < 0 || index >= experienceStops.length || phase === "travelling") return;
    if (phase === "heritage" && index === stopIndex) return;
    playTicketSelectSfx({ muted, volume });
    if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current);
    stopPreview();
    stopStationTrack();
    // Mobile browsers can suspend the Web Audio context when a MediaElement
    // track is stopped. Resume it while this navigation is still a user tap.
    enableAmbient();
    setIsSceneImmersive(false);
    setExternalReferenceOpen(false);
    setMuseumRecord(null);
    setOpenHotspot(null);
    setExternalReferenceOpen(false);
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
    stopStationTrack();
    setMuseumRecord(null);
    setOpenHotspot(null);
    setExternalReferenceOpen(false);
    setIsSceneImmersive(false);
    setPhase("landing");
  }

  function finishJourney() {
    playPaperSfx({ muted, volume });
    stopPreview();
    stopStationTrack();
    setExternalReferenceOpen(false);
    setMuseumRecord(null);
    setOpenHotspot(null);
    setActiveHotspotId(null);
    setIsSceneImmersive(false);
    setPhase("ending");
  }

  function startNewJourney() {
    if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current);
    travelTimerRef.current = null;
    stopPreview();
    stopStationTrack();
    setVisited(new Set());
    setSealed(new Set());
    setSealStopId(null);
    setMuseumRecord(null);
    setOpenHotspot(null);
    setExternalReferenceOpen(false);
    setActiveHotspotId(null);
    setStopIndex(0);
    setPendingStopIndex(0);
    window.localStorage.removeItem("heritage-visited-v2");
    window.localStorage.removeItem("heritage-seals-v1");
    setPhase("landing");
  }

  function openMuseumRecord(record: MuseumRecord) {
    playItemDiscoverSfx({ muted, volume });
    stopPreview();
    setMuseumRecord(record);
  }

  function closeMuseumRecord() {
    playClickSfx({ muted, volume });
    stopPreview();
    setMuseumRecord(null);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (isCoarsePointer) return;
    const scene = sceneRef.current;
    if (!scene) return;
    const sceneRect = scene.getBoundingClientRect();
    scene.style.setProperty("--light-x", `${event.clientX - sceneRect.left}px`);
    scene.style.setProperty("--light-y", `${event.clientY - sceneRect.top}px`);
    scene.dataset.lamp = "active";
    const buttons = sceneRef.current?.querySelectorAll<HTMLButtonElement>("[data-hotspot]");
    if (!buttons) return;
    let closest: { id: string; distance: number } | null = null;
    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy) - Math.max(rect.width, rect.height) / 2;
      if (!closest || distance < closest.distance) closest = { id: button.dataset.hotspot || "", distance };
    });
    const targetId = closest && closest.distance < 94 ? closest.id : null;
    setActiveHotspotId(targetId);
  }

  const stationSealed = sealed.has(stop.id);
  const journeyComplete = sealed.size === experienceStops.length;
  const nextUnvisitedHotspot = stop.hotspots.find((hotspot) => !visited.has(`${stop.id}:${hotspot.id}`));
  const recommendedStopIndex = experienceStops.findIndex((item) => !sealed.has(item.id));
  const recommendedStop = recommendedStopIndex >= 0 ? experienceStops[recommendedStopIndex] : null;
  const followingStop = experienceStops[Math.min(stopIndex + 1, experienceStops.length - 1)];

  return (
    <main className={`game-shell ${isCoarsePointer ? "touch-interface" : "pointer-interface"}`} style={{ "--stop-accent": stop.palette } as CSSProperties}>
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
          <div className="ambient-disclosure" role="note" tabIndex={0} aria-label={`${ui.neutralSound} · ${ui.ambientNote}`}>
            <span className="ambient-note-icon" aria-hidden="true">♪</span>
            <span className="ambient-note-label">{ui.neutralSound}</span>
            <span className="ambient-note-tooltip">{ui.ambientNote}</span>
          </div>
          <VolumeControl
            muted={muted}
            volume={volume}
            onToggleMute={toggleMuted}
            onVolumeChange={handleVolumeChange}
            language={language}
          />
          <button className="language-switch" onClick={() => setLanguage(language === "vi" ? "en" : "vi")}>{language === "vi" ? "EN" : "VI"}</button>
        </div>
      </header>

      <section className="route-bar" aria-label={ui.allStops}>
        <div className="mobile-route-summary" aria-hidden="true">
          <span>GA {stop.number} / 05</span>
          <b>{stop.location[language].split("·")[0]}</b>
          <small>{stopIndex < experienceStops.length - 1 ? `${language === "vi" ? "Tiếp" : "Next"}: ${followingStop.location[language].split("·")[0]}` : (language === "vi" ? "Ga cuối" : "Final stop")}</small>
        </div>
        <div className="route-stops">
          <span className="route-rail" aria-hidden="true" />
          {experienceStops.map((item, index) => {
            const completed = item.hotspots.every((hotspot) => visited.has(`${item.id}:${hotspot.id}`));
            const hasSeal = sealed.has(item.id);
            return <button key={item.id} className={`${index === stopIndex ? "current" : ""} ${completed ? "completed" : ""} ${hasSeal ? "sealed" : ""}`} onClick={() => beginTravel(index)}>
              <i />
              <span>{item.location[language].split("·")[0]}</span>
            </button>;
          })}
        </div>
      </section>

      <section className={`scene-wrap ${isSceneImmersive ? "is-immersive" : ""}`} style={{ "--scene-image": `url(${stop.scene})` } as CSSProperties}>
        <button
          type="button"
          className="scene-immersive-toggle"
          onClick={() => setIsSceneImmersive((current) => !current)}
          aria-pressed={isSceneImmersive}
          aria-label={isSceneImmersive ? (language === "vi" ? "Thoát xem toàn cảnh" : "Exit immersive view") : (language === "vi" ? "Xem tranh toàn cảnh" : "View immersive scene")}
        >
          <span aria-hidden="true">{isSceneImmersive ? "×" : "⛶"}</span>
          <em>{isSceneImmersive ? (language === "vi" ? "Thoát" : "Exit") : (language === "vi" ? "Toàn cảnh" : "Immersive")}</em>
        </button>
        <div className="train-frame" aria-hidden="true"><span className="frame-top" /><span className="frame-left" /><span className="frame-right" /><span className="frame-bottom" /></div>
        <div
          ref={sceneRef}
          data-stop-id={stop.id}
          className={`scene memory-scene ${stationComplete ? "memory-complete" : ""}`}
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
          <Image className="scene-crane-watermark scene-crane-watermark-a" src="/motifs/crane-stamp-gold.png" alt="" width={150} height={150} unoptimized aria-hidden="true" />
          <Image className="scene-crane-watermark scene-crane-watermark-b" src="/motifs/crane-stamp-gold.png" alt="" width={118} height={118} unoptimized aria-hidden="true" />
          <span className="memory-lamp" aria-hidden="true" />
          <div className="scene-heading">
            <span>GA {stop.number} · {stop.location[language]}</span>
            <h1>{stop.title[language]}</h1>
            <p>{stop.subtitle[language]}</p>
          </div>
          <div className="instruction">
            <i className={isCoarsePointer ? "touch-glyph" : "mouse-glyph"} />
            {isCoarsePointer ? ui.touchInstruction : ui.instruction}
          </div>
          {stop.hotspots.map((hotspot, index) => {
            const active = activeHotspotId === hotspot.id;
            const seen = visited.has(`${stop.id}:${hotspot.id}`);
            const playable = isPlayableAudio(audioFor(hotspot));
            return <button
              key={hotspot.id}
              data-hotspot={hotspot.id}
              className={`hotspot ${active ? "near" : ""} ${seen ? "seen" : ""} ${playable ? "has-audio" : ""}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, "--radius": `${hotspot.radius * 8}px` } as CSSProperties}
              onPointerEnter={() => { if (!isCoarsePointer) setActiveHotspotId(hotspot.id); }}
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
          {stationComplete && !stationSealed && !openHotspot && <aside className="station-reveal-card station-reveal-card-desktop" role="status">
            <div><i aria-hidden="true">✦</i><span><b>{ui.sceneRestored}</b><small>{ui.sceneRestoredBody}</small></span></div>
            <button type="button" onClick={requestSeal}>{ui.claimSeal}<strong>→</strong></button>
          </aside>}
        </div>
        {!openHotspot && <aside className="mobile-next-step" role="status" aria-live="polite">
          {!stationComplete && <>
            <div className="mobile-next-step-mark" aria-hidden="true">{String(stopVisited + 1).padStart(2, "0")}</div>
            <div className="mobile-next-step-copy">
              <small>{language === "vi" ? "BƯỚC TIẾP THEO · ĐÈN KÝ ỨC" : "NEXT STEP · MEMORY LANTERN"}</small>
              <h2>{language === "vi" ? "Chạm điểm sáng tiếp theo trong tranh" : "Tap the next light in the scene"}</h2>
              <p>{nextUnvisitedHotspot
                ? `${nextUnvisitedHotspot.label[language]} · ${stop.hotspots.length - stopVisited} ${language === "vi" ? "vật phẩm còn lại" : "objects remaining"}`
                : ui.memoryHint}</p>
            </div>
          </>}
          {stationComplete && !stationSealed && <>
            <div className="mobile-next-step-mark complete" aria-hidden="true">✦</div>
            <div className="mobile-next-step-copy">
              <small>{ui.sceneRestored}</small>
              <h2>{language === "vi" ? "Toàn cảnh đã trở lại nguyên màu" : "The complete scene is awake"}</h2>
              <p>{ui.sceneRestoredBody}</p>
              <button type="button" onClick={requestSeal}>{ui.claimSeal}<strong>→</strong></button>
            </div>
          </>}
          {stationSealed && !journeyComplete && recommendedStop && <>
            <div className="mobile-next-step-mark sealed" aria-hidden="true">✓</div>
            <div className="mobile-next-step-copy">
              <small>{language === "vi" ? "CON DẤU ĐÃ ĐƯỢC LƯU" : "SEAL SAVED"}</small>
              <h2>{language === "vi" ? "Tiếp tục đến ga chưa có con dấu" : "Continue to an unsealed station"}</h2>
              <p>GA {recommendedStop.number} · {recommendedStop.location[language]} · {recommendedStop.title[language]}</p>
              <button type="button" onClick={() => beginTravel(recommendedStopIndex)}>{language === "vi" ? "Đi đến ga tiếp theo" : "Go to next station"}<strong>→</strong></button>
            </div>
          </>}
          {journeyComplete && <>
            <div className="mobile-next-step-mark summary" aria-hidden="true">⌂</div>
            <div className="mobile-next-step-copy">
              <small>{language === "vi" ? "05 / 05 CON DẤU HOÀN TẤT" : "05 / 05 SEALS COMPLETE"}</small>
              <h2>{language === "vi" ? "Trang tổng kết đã mở khóa" : "Journey Summary unlocked"}</h2>
              <p>{language === "vi" ? "Mở Hộ chiếu, phòng trưng bày và lưu lại cảm nghĩ của bạn." : "Open your Passport, gallery, and leave your reflection."}</p>
              <button type="button" className="mobile-summary-cta" onClick={finishJourney}>{ui.returnSummary}<strong>↗</strong></button>
            </div>
          </>}
        </aside>}
        <div className="scene-footer">
          <div><b>{stopVisited}/{stop.hotspots.length}</b><span>{ui.explored}</span></div>
          {stationComplete && stop.unlock?.audio.src ? <div className="station-audio-player" data-playing={stationTrackPlaying === stop.id}>
            <button type="button" onClick={() => playStationTrack(stop.unlock?.audio, stop.id)} aria-label={stationTrackPlaying === stop.id ? ui.pauseAudio : ui.playAudio} aria-pressed={stationTrackPlaying === stop.id}>
              <span aria-hidden="true">{stationTrackPlaying === stop.id ? "Ⅱ" : "▶"}</span>
            </button>
            <label>
              <span><b>{language === "vi" ? "ÂM THANH GA ĐÃ MỞ" : "STATION AUDIO UNLOCKED"}</b><em>{stop.unlock.title[language]}</em></span>
              <input type="range" min={0} max={stationTrackDuration || stop.unlock.audio.durationSeconds || 1} step="0.1" value={Math.min(stationTrackPosition, stationTrackDuration || stop.unlock.audio.durationSeconds || 1)} onChange={(event) => seekStationTrack(Number(event.target.value))} aria-label={language === "vi" ? "Vị trí phát âm thanh" : "Audio position"} />
              <small>{clockTime(stationTrackPosition)} / {clockTime(stationTrackDuration || stop.unlock.audio.durationSeconds || 0)}</small>
            </label>
          </div> : <p>{ui.illustration}</p>}
          <div className="station-controls">
            {stationComplete && !stationSealed && <button className="station-claim-compact" type="button" onClick={requestSeal}>
              <span aria-hidden="true">✦</span>
              <em className="claim-long">{ui.claimSeal}</em>
              <em className="claim-short">{language === "vi" ? "Nhận dấu" : "Claim seal"}</em>
            </button>}
            {journeyComplete && <button className="journey-summary-button journey-summary-primary" onClick={finishJourney}><span aria-hidden="true">⌂</span><em>{ui.returnSummary}</em></button>}
            <button className="station-direction station-previous" aria-label={ui.previous} disabled={stopIndex === 0} onClick={() => beginTravel(stopIndex - 1)}><span aria-hidden="true">←</span><em>{ui.previous}</em></button>
            {journeyComplete
              ? stopIndex < experienceStops.length - 1 && <button className="station-direction station-next" aria-label={ui.next} onClick={() => beginTravel(stopIndex + 1)}><em>{ui.next}</em><span aria-hidden="true">→</span></button>
              : stopIndex === experienceStops.length - 1
              ? <button className="finish-journey-button" disabled={!stationSealed || sealed.size < experienceStops.length} onClick={finishJourney}><em>{stationSealed ? ui.finishJourney : ui.stationLocked}</em><span aria-hidden="true">→</span></button>
              : <button className="station-direction station-next" aria-label={stationSealed ? ui.next : ui.stationLocked} disabled={!stationSealed} onClick={() => beginTravel(stopIndex + 1)}><em>{stationSealed ? ui.next : ui.stationLocked}</em><span aria-hidden="true">→</span></button>}
          </div>
        </div>
      </section>
      </>}

      {phase === "landing" && (
        <Intro
          language={language}
          muted={muted}
          volume={volume}
          onLanguage={setLanguage}
          onToggleMuted={toggleMuted}
          onVolumeChange={handleVolumeChange}
          onStart={() => {
            enableAmbient();
            setPhase("carriage");
          }}
        />
      )}
      {phase === "carriage" && (
        <Carriage
          language={language}
          muted={muted}
          volume={volume}
          onLanguage={setLanguage}
          onToggleMuted={toggleMuted}
          onVolumeChange={handleVolumeChange}
          onBack={resetToLanding}
          onDestination={beginTravel}
          onAudioActivate={enableAmbient}
        />
      )}
      {phase === "travelling" && <TravelScreen stop={pendingStop} language={language} />}
      {phase === "ending" && (
        <Ending
          language={language}
          muted={muted}
          volume={volume}
          visited={visited}
          sealed={sealed}
          onLanguage={setLanguage}
          onToggleMuted={toggleMuted}
          onVolumeChange={handleVolumeChange}
          onVisitStop={beginTravel}
          onInspect={openMuseumRecord}
          onNewJourney={startNewJourney}
        />
      )}
      {openHotspot && <RecordDrawer
        key={`${stop.id}:${openHotspot.id}`}
        stop={stop}
        hotspot={openHotspot}
        language={language}
        previewPlaying={previewPlaying === `${stop.id}:${openHotspot.id}`}
        onTogglePreview={() => playPreview(openHotspot)}
        onExternalReference={(open) => { stopPreview(); setExternalReferenceOpen(open); }}
        onClose={closeRecord}
      />}
      {museumRecord && <RecordDrawer
        key={`museum:${museumRecord.stop.id}:${museumRecord.hotspot.id}`}
        stop={museumRecord.stop}
        hotspot={museumRecord.hotspot}
        language={language}
        previewPlaying={previewPlaying === `${museumRecord.stop.id}:${museumRecord.hotspot.id}`}
        onTogglePreview={() => playPreview(museumRecord.hotspot, `${museumRecord.stop.id}:${museumRecord.hotspot.id}`)}
        onExternalReference={(open) => { stopPreview(); setExternalReferenceOpen(open); }}
        onClose={closeMuseumRecord}
      />}
      {sealStopId && <StationSeal language={language} stop={experienceStops.find((item) => item.id === sealStopId) || stop} onContinue={collectSeal} muted={muted} volume={volume} />}
    </main>
  );
}

function StationSeal({ language, stop, onContinue, muted, volume }: { language: Language; stop: ExperienceStop; onContinue: () => void; muted?: boolean; volume?: number }) {
  const ui = copy[language];

  useEffect(() => {
    playSealSfx({ muted, volume });
  }, [muted, volume]);

  return <div className="seal-overlay" role="dialog" aria-modal="true" aria-labelledby="seal-title">
    <section className="station-seal-card" style={{ "--seal-accent": stop.palette } as CSSProperties}>
      <span className="seal-rays" aria-hidden="true" />
      <span className="seal-glow-aura" aria-hidden="true" />
      <div className="seal-card-corner seal-corner-tl" aria-hidden="true" />
      <div className="seal-card-corner seal-corner-tr" aria-hidden="true" />
      <div className="seal-card-corner seal-corner-bl" aria-hidden="true" />
      <div className="seal-card-corner seal-corner-br" aria-hidden="true" />

      <div className="seal-emblem-wrap">
        <span className="seal-emblem-halo-spin" aria-hidden="true" />
        <div className="seal-emblem" aria-hidden="true">
          <span className="seal-emblem-ring" />
          <span className="seal-emblem-kicker">VIỆT NAM · DI SẢN</span>
          <div className="seal-emblem-center">
            <i className="seal-number">{stop.number}</i>
            <b className="seal-star">✦</b>
          </div>
          <span className="seal-emblem-footer">{language === "vi" ? "ẤN KÝ HÀNH TRÌNH" : "AUTHENTIC SEAL"}</span>
        </div>
      </div>

      <div className="seal-badge-label">
        <span className="seal-ribbon-line" />
        <span className="seal-kicker-text">✦ {ui.sealEarned} ✦</span>
        <span className="seal-ribbon-line" />
      </div>

      <h2 id="seal-title">{stop.title[language]}</h2>
      <p className="seal-location">{stop.location[language]}</p>
      <small className="seal-body-desc">{ui.sealBody}</small>

      <button type="button" className="seal-continue-btn" onClick={onContinue}>
        <span>{ui.continueJourney}</span>
        <b>→</b>
      </button>
    </section>
  </div>;
}

const museumTurnViews = ["front", "right", "back", "left"] as const;

function MuseumArtifactCard({
  hotspot,
  stop,
  language,
  index,
  onInspect,
}: {
  key?: string;
  hotspot: ExperienceHotspot;
  stop: ExperienceStop;
  language: Language;
  index: number;
  onInspect: (record: MuseumRecord) => void;
}) {
  const [activeView, setActiveView] = useState(index % museumTurnViews.length);
  const [paused, setPaused] = useState(false);
  const spriteBase = hotspot.artifactSprite.split("/").pop()?.replace(/\.webp$/i, "") ?? "artifact";

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveView((current) => (current + 1) % museumTurnViews.length), 1450 + index * 170);
    return () => window.clearInterval(timer);
  }, [index, paused]);

  const turnSprite = `/artifacts/turn/${spriteBase}-${museumTurnViews[activeView]}.webp`;
  return <button
    type="button"
    className="museum-object-card"
    onClick={() => onInspect({ stop, hotspot })}
    onPointerEnter={() => setPaused(true)}
    onPointerLeave={() => setPaused(false)}
    onFocus={() => setPaused(true)}
    onBlur={() => setPaused(false)}
    aria-label={`${hotspot.label[language]} · ${copy[language].askTitle}`}
  >
    <span className="museum-glass-shine" aria-hidden="true" />
    <span className="museum-object-image">
      <Image src={turnSprite} alt="" width={300} height={300} unoptimized aria-hidden="true" />
      <i aria-hidden="true" />
    </span>
    <span className="museum-object-copy">
      <small>{hotspot.kicker[language]}</small>
      <b>{hotspot.label[language]}</b>
      <em>{language === "vi" ? "Chạm để mở hồ sơ" : "Touch to open record"} ↗</em>
    </span>
  </button>;
}

function Ending({
  language,
  muted,
  volume,
  visited,
  sealed,
  onLanguage,
  onToggleMuted,
  onVolumeChange,
  onVisitStop,
  onInspect,
  onNewJourney,
}: {
  language: Language;
  muted: boolean;
  volume: number;
  visited: Set<string>;
  sealed: Set<string>;
  onLanguage: (language: Language) => void;
  onToggleMuted: () => void;
  onVolumeChange: (vol: number) => void;
  onVisitStop: (index: number) => void;
  onInspect: (record: MuseumRecord) => void;
  onNewJourney: () => void;
}) {
  const ui = copy[language];
  const [passportOpen, setPassportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [activeMuseumStopIndex, setActiveMuseumStopIndex] = useState(0);
  const museumSwipeStart = useRef<number | null>(null);
  const collectedCount = experienceStops.reduce((count, stop) => count + stop.hotspots.filter((hotspot) => visited.has(`${stop.id}:${hotspot.id}`)).length, 0);
  const activeMuseumStop = experienceStops[activeMuseumStopIndex];
  const activeCollectedCount = activeMuseumStop.hotspots.filter((hotspot) => visited.has(`${activeMuseumStop.id}:${hotspot.id}`)).length;

  useEffect(() => {
    playEndingGoldenEmbers({ muted, volume });
    return () => {
      stopEndingMusic();
    };
  }, []);

  useEffect(() => {
    updateEndingMusicVolume({ muted, volume });
  }, [muted, volume]);

  function moveMuseum(direction: -1 | 1) {
    setActiveMuseumStopIndex((current) => (current + direction + experienceStops.length) % experienceStops.length);
  }

  function handleScrollToTerminal(targetId = "thank-you-stop") {
    playPaperSfx({ muted, volume });
    const element = document.getElementById(targetId) || document.getElementById("terminal-station");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return <section className="ending-screen" aria-labelledby="ending-title">
    <div className="ending-hero">
      <Image className="ending-cover-image" src="/og.webp" alt="" fill priority unoptimized sizes="100vw" aria-hidden="true" />
      <div className="ending-vignette" aria-hidden="true" />
      <div className="ending-language" aria-label={language === "vi" ? "Chọn ngôn ngữ và âm lượng" : "Choose language and audio"}>
        <VolumeControl
          muted={muted}
          volume={volume}
          onToggleMute={onToggleMuted}
          onVolumeChange={onVolumeChange}
          language={language}
        />
        <div className="ending-lang-switch" role="group" aria-label={language === "vi" ? "Chọn ngôn ngữ" : "Choose language"}>
          <button className={language === "vi" ? "active" : ""} aria-pressed={language === "vi"} onClick={() => onLanguage("vi")}>VI</button>
          <button className={language === "en" ? "active" : ""} aria-pressed={language === "en"} onClick={() => onLanguage("en")}>EN</button>
        </div>
      </div>
      <div className="ending-copy">
        <span>{ui.endingKicker}</span>
        <h1 id="ending-title" className="sr-only">{ui.endingTitle}</h1>
        <div className="ending-actions">
          <button className="ending-cta ending-primary" onClick={() => { playPaperSfx({ muted, volume }); setPassportOpen(true); }}>{ui.openPassport}<b>↗</b></button>
          <button className="ending-cta ending-secondary ending-new-game" onClick={() => setResetOpen(true)}>{ui.newJourney} <b>↻</b></button>
        </div>
        <div className="ending-secondary-row">
          <a className="ending-cta ending-gallery-cta" href="#memory-map"><span>{language === "vi" ? "MỞ PHÒNG TRƯNG BÀY & LƯU BÚT" : "OPEN GALLERY & GUESTBOOK"}</span><i>↓</i></a>
          <button className="ending-cta ending-support-button" onClick={handleScrollToTerminal}>{language === "vi" ? "Ủng hộ tác giả (Cây kí ức)" : "Support Author (Memory Tree)"}</button>
        </div>
      </div>
    </div>

    <div className="ending-hub" id="memory-map">
      <section className="museum-vault" aria-labelledby="museum-title" style={{ "--museum-bg": "url(/museum/heritage-gallery-v2.webp)", "--museum-accent": activeMuseumStop.palette } as CSSProperties}>
        <span className="museum-backdrop" aria-hidden="true" />
        <header className="ending-section-heading museum-heading"><span>{ui.museumKicker}</span><h2 id="museum-title">{ui.museumTitle}</h2><p>{ui.museumBody}</p><b>{collectedCount.toString().padStart(2, "0")} / 15</b></header>
        <div className="museum-carousel-shell">
          <div className="museum-route-heading" aria-live="polite">
            <span>GA {activeMuseumStop.number} · {activeMuseumStop.location[language]}</span>
            <h3>{activeMuseumStop.title[language]}</h3>
            <p>{activeCollectedCount}/3 {language === "vi" ? "vật phẩm đã khám phá" : "objects discovered"}</p>
          </div>

          <div
            className="museum-carousel-stage"
            role="region"
            tabIndex={0}
            aria-label={language === "vi" ? "Chọn ga di sản để chơi lại" : "Choose a heritage stop to replay"}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") { event.preventDefault(); moveMuseum(-1); }
              if (event.key === "ArrowRight") { event.preventDefault(); moveMuseum(1); }
            }}
            onTouchStart={(event) => { museumSwipeStart.current = event.changedTouches[0]?.clientX ?? null; }}
            onTouchEnd={(event) => {
              if (museumSwipeStart.current === null) return;
              const distance = (event.changedTouches[0]?.clientX ?? museumSwipeStart.current) - museumSwipeStart.current;
              museumSwipeStart.current = null;
              if (Math.abs(distance) > 48) moveMuseum(distance > 0 ? -1 : 1);
            }}
          >
            <button type="button" className="museum-carousel-arrow museum-carousel-previous" onClick={() => moveMuseum(-1)} aria-label={language === "vi" ? "Ga trưng bày trước" : "Previous exhibition stop"}><span aria-hidden="true">←</span></button>
            <button type="button" className="museum-map-vitrine" onClick={() => onVisitStop(activeMuseumStopIndex)} aria-label={`${ui.revisitStop}: ${activeMuseumStop.title[language]}`}>
              <span className="museum-vitrine-lights" aria-hidden="true"><i /><i /><i /></span>
              <span className="museum-map-image"><Image key={activeMuseumStop.scene} src={activeMuseumStop.scene} alt="" fill unoptimized sizes="(max-width: 720px) 92vw, 920px" aria-hidden="true" /><i /></span>
              <span className="museum-map-caption"><small>{language === "vi" ? "MÀN CHƠI TRƯNG BÀY" : "EXHIBITED CHAPTER"}</small><b>{ui.revisitStop}</b><strong>→</strong></span>
            </button>
            <button type="button" className="museum-carousel-arrow museum-carousel-next" onClick={() => moveMuseum(1)} aria-label={language === "vi" ? "Ga trưng bày tiếp theo" : "Next exhibition stop"}><span aria-hidden="true">→</span></button>
          </div>
          <div className="museum-carousel-dots" aria-label={language === "vi" ? "Năm ga di sản" : "Five heritage stops"}>
            {experienceStops.map((stop, index) => <button key={stop.id} type="button" className={index === activeMuseumStopIndex ? "active" : ""} aria-current={index === activeMuseumStopIndex ? "true" : undefined} aria-label={`${language === "vi" ? "Ga" : "Stop"} ${stop.number}: ${stop.title[language]}`} onClick={() => setActiveMuseumStopIndex(index)}><span>{stop.number}</span></button>)}
            <b>{String(activeMuseumStopIndex + 1).padStart(2, "0")} / {String(experienceStops.length).padStart(2, "0")}</b>
          </div>
          <div className="museum-object-cases" aria-label={language === "vi" ? `Vật phẩm tại ${activeMuseumStop.title.vi}` : `Objects from ${activeMuseumStop.title.en}`}>
            {activeMuseumStop.hotspots.map((hotspot, index) => visited.has(`${activeMuseumStop.id}:${hotspot.id}`)
              ? <MuseumArtifactCard key={`${activeMuseumStop.id}:${hotspot.id}`} hotspot={hotspot} stop={activeMuseumStop} language={language} index={index} onInspect={onInspect} />
              : <div key={hotspot.id} className="museum-object-card museum-object-locked"><span>?</span><b>{language === "vi" ? "Chưa khám phá" : "Not discovered"}</b></div>)}
          </div>
        </div>
        <p className="museum-illustration-note">{ui.illustration}<br /><a href="https://commons.wikimedia.org/wiki/File:Interior_view_-_Museum_of_Vietnamese_History_-_Ho_Chi_Minh_City_-_DSC05932.JPG" target="_blank" rel="noreferrer">{language === "vi" ? "Nền phòng trưng bày chuyển thể pixel từ ảnh Bảo tàng Lịch sử Việt Nam, TP. Hồ Chí Minh · Daderot · CC0 1.0." : "Gallery background pixel adaptation from the Museum of Vietnamese History, Ho Chi Minh City · Daderot · CC0 1.0."}</a></p>
      </section>

      {/* RẠP ĐIỀU ƯỚC PHƯƠNG XA (NẰM NGAY DƯỚI PHÒNG TRƯNG BÀY) */}
      <GalleryWishesMarquee
        language={language}
        muted={muted}
        volume={volume}
        onNewJourney={() => setResetOpen(true)}
      />

      {/* PHẦN 1: LỜI CẢM ƠN TỪ TÁC GIẢ (HEARTFELT THANKS) */}
      <section id="author-thanks" className="author-thanks-section" aria-labelledby="author-thanks-title">
        <header className="ending-section-heading author-thanks-heading">
          <span className="author-thanks-kicker">{language === "vi" ? "💌 TÂM THƯ TÁC GIẢ · LỜI TRI ÂN TỪ TRÁI TIM" : "💌 CREATOR'S LETTER · HEARTFELT GRATITUDE"}</span>
          <h2 id="author-thanks-title">{language === "vi" ? "Lời cảm ơn từ tác giả" : "Thank You from the Author"}</h2>
          <p>{language === "vi" ? "Đôi dòng tâm sự từ Vũ Anh Quân gửi gắm đến tất cả những hành khách đã đồng hành trên chuyến tàu di sản." : "A few sincere words from Vu Anh Quan to all passengers who journeyed on the heritage express."}</p>
        </header>

        <div className="author-thanks-container">
          <div className="terminal-author-letter-card">
            <div className="author-letter-header">
              <div className="author-letter-badge">
                <span className="author-letter-icon">📜</span>
                <div>
                  <small>{language === "vi" ? "NHÀ PHÁT TRIỂN DỰ ÁN" : "PROJECT DEVELOPER"}</small>
                  <h3>{language === "vi" ? "Vũ Anh Quân gửi lời tri ân sâu sắc" : "Vu Anh Quan & Sincere Gratitude"}</h3>
                </div>
              </div>
              <span className="author-letter-seal">💮 {language === "vi" ? "TRI ÂN ĐỒNG HÀNH" : "PASSENGER TRIBUTE"}</span>
            </div>

            <div className="author-letter-body">
              {language === "vi" ? (
                <>
                  <p>
                    Dự án này thực ra bắt đầu xuất phát từ Cuộc thi Vietnam Ai 2026 nhưng mà em chưa từng nộp bài, em đã vibe coding ra chuyến tàu di sản văn hoá này nhưng mà sợ rằng với một dự án phi lợi nhuận thì sẽ không thể nào thắng được giải nên em cũng thôi và bỏ dở đến tận gần đây.
                  </p>
                  <p>
                    Cho tới ngày hôm nay, con game cũng đã hoàn thành kha khá, nếu có góp ý gì hay thiếu xót thì mọi người cứ để qua phần lưu bút. Một lần nữa, cảm ơn mọi người đã lên chuyến tàu này ^^
                  </p>
                </>
              ) : (
                <>
                  <p>
                    This project originally started from the Vietnam AI 2026 competition, but I never submitted it. I vibe-coded this cultural heritage express, but feared that a non-profit cultural initiative wouldn&apos;t win any prize, so I put it on hold until recently.
                  </p>
                  <p>
                    As of today, the game is quite complete. If you have any feedback or suggestions, please leave a note in the guestbook. Once again, thank you all for boarding this train ^^
                  </p>
                </>
              )}
            </div>

            <div className="author-letter-footer">
              <div className="author-signature">
                <div>
                  <b>Vũ Anh Quân</b>
                  <small>{language === "vi" ? "Nhà phát triển · Dự án Tàu Di Sản Việt Nam" : "Creator · Vietnam Heritage Express Project"}</small>
                </div>
              </div>

              <div className="author-letter-actions">
                <button
                  type="button"
                  className="author-letter-cta-btn support-cta"
                  onClick={handleScrollToTerminal}
                >
                  <span>🚂 {language === "vi" ? "Đến Ga Cuối (Cây Kí Ức)" : "Go to Terminal Station"}</span>
                  <i>↓</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN 2: GA CUỐI (TERMINAL STOP: TIẾP SỨC TÁC GIẢ & SA BÀN CÂY KÍ ỨC) */}
      <section id="terminal-station" className="terminal-station-section" aria-label={language === "vi" ? "Ga Cuối: Cây Kí Ức & Đoàn Tàu Di Sản" : "Terminal Stop: Memory Tree & Heritage Express"}>
        <div className="terminal-station-content">
          {/* 1. HỘP TIẾP SỨC TÁC GIẢ (NẰM BÊN TRÊN SA BÀN & MÃ QR) */}
          <div className="terminal-support-callout-box">
            <div className="support-callout-left">
              <span className="support-callout-icon">☕</span>
              <div className="support-callout-text">
                <small>{language === "vi" ? "TIẾP SỨC ĐỒNG HÀNH" : "SUPPORT THE CREATOR"}</small>
                <h4>{language === "vi" ? "Ủng hộ tác giả" : "Support the creator"}</h4>
                <p>
                  {language === "vi"
                    ? "2k hoặc 3k là em cũng vui rồi ạ, có tiền đốt token xây dựng những mini games như này ạ ^^. Cảm ơn mọi người một lần nữa vì đã lên chuyến tàu này."
                    : "Even 2k or 3k VND brings great joy to me, helping fuel tokens to build more mini-games like this ^^. Thank you all once again for boarding this journey."}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="support-callout-btn"
              onClick={() => {
                playPaperSfx({ muted, volume });
                const el = document.getElementById("thank-you-stop");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                } else {
                  setDonateOpen(true);
                }
              }}
            >
              <span>🌳 {language === "vi" ? "Xem Mô Hình Cây Kí Ức & QR" : "View Memory Tree Model & QR"}</span>
              <i>↓</i>
            </button>
          </div>

          {/* 2. SA BÀN GA CUỐI - CÂY KÍ ỨC & ĐOÀN TÀU DI SẢN (MÃ QR & MÔ HÌNH) */}
          <div className="terminal-diorama-wrapper">
            <div className="terminal-station-diorama-container">
              <ThankYouDiorama
                language={language}
                compact={false}
              />
            </div>
          </div>
        </div>
      </section>
    </div>

    {resetOpen && <div className="reset-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setResetOpen(false)}>
      <section className="reset-dialog" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-body">
        <span aria-hidden="true">↻</span><small>{language === "vi" ? "XÁC NHẬN CHƠI MỚI" : "CONFIRM NEW GAME"}</small><h2 id="reset-title">{ui.resetTitle}</h2><p id="reset-body">{ui.resetBody}</p>
        <div><button type="button" onClick={() => setResetOpen(false)}>{ui.resetCancel}</button><button type="button" onClick={onNewJourney}>{ui.resetConfirm}</button></div>
      </section>
    </div>}
    {passportOpen && <Archive language={language} visited={visited} sealed={sealed} passport onClose={() => setPassportOpen(false)} />}
    {donateOpen && <SupportModal language={language} onClose={() => setDonateOpen(false)} muted={muted} volume={volume} />}
  </section>;
}

function Intro({
  language,
  muted,
  volume,
  onLanguage,
  onToggleMuted,
  onVolumeChange,
  onStart,
}: {
  language: Language;
  muted: boolean;
  volume: number;
  onLanguage: (language: Language) => void;
  onToggleMuted: () => void;
  onVolumeChange: (vol: number) => void;
  onStart: () => void;
}) {
  const ui = copy[language];
  const [guideOpen, setGuideOpen] = useState(false);

  return <section className="intro-screen" aria-labelledby="intro-title">
    <Image className="intro-cover-image" src="/og.webp" alt="Tàu Di Sản Việt Nam — Chạm vào ký ức đang sống" fill priority unoptimized sizes="100vw" />
    <div className="intro-noise" aria-hidden="true" />
    <div className="intro-brand"><span>T</span><b>{ui.brand}</b></div>
    <div className="intro-language intro-language-top" aria-label={language === "vi" ? "Chọn ngôn ngữ và âm lượng" : "Choose language and audio"}>
      <VolumeControl
        muted={muted}
        volume={volume}
        onToggleMute={onToggleMuted}
        onVolumeChange={onVolumeChange}
        language={language}
      />
      <div className="intro-lang-switch" role="group" aria-label={language === "vi" ? "Chọn ngôn ngữ" : "Choose language"}>
        <button className={language === "vi" ? "active" : ""} aria-pressed={language === "vi"} onClick={() => onLanguage("vi")}>VI</button>
        <button className={language === "en" ? "active" : ""} aria-pressed={language === "en"} onClick={() => onLanguage("en")}>EN</button>
      </div>
    </div>
    <div className="intro-copy">
      <span className="intro-kicker"><i /> {ui.introKicker}</span>
      <h1 id="intro-title" className="sr-only">{ui.introTitleA} {ui.introTitleB}</h1>
      <p>{ui.introBody}</p>
      <div className="intro-ending-highlight">
        <span className="intro-ending-sparkle">🏛️</span>
        <p>{ui.introSpecialEndingTip}</p>
      </div>
      <div className="intro-actions">
        <button type="button" className="intro-start-button" onClick={onStart}>{ui.start}<span>→</span></button>
        <button type="button" className="intro-guide-button" onClick={() => { playPaperSfx({ muted, volume }); setGuideOpen(true); }}><span>📜</span> {ui.guideButton}</button>
      </div>
    </div>
    <div className="intro-source"><span>●</span> 05 UNESCO FILES <i /> 15 VERIFIED RECORDS <i /> NO CULTURAL FABRICATION</div>
    {guideOpen && <JourneyGuideModal language={language} entryContext="intro" onClose={() => setGuideOpen(false)} onStart={() => { setGuideOpen(false); onStart(); }} />}
  </section>;
}

function Carriage({
  language,
  muted,
  volume,
  onLanguage,
  onToggleMuted,
  onVolumeChange,
  onBack,
  onDestination,
  onAudioActivate,
}: {
  language: Language;
  muted: boolean;
  volume: number;
  onLanguage: (language: Language) => void;
  onToggleMuted: () => void;
  onVolumeChange: (vol: number) => void;
  onBack: () => void;
  onDestination: (index: number) => void;
  onAudioActivate: () => void;
}) {
  const ui = copy[language];
  const [dialogueReady, setDialogueReady] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

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
      <div className="carriage-toolbar-actions">
        <button
          type="button"
          onClick={() => { playPaperSfx({ muted, volume }); setGuideOpen(true); }}
          className="carriage-guide-button"
          aria-label={ui.guide}
          title={ui.guide}
        >
          <span>📜</span> <b className="guide-btn-text">{ui.guide}</b>
        </button>
        <VolumeControl
          muted={muted}
          volume={volume}
          onToggleMute={onToggleMuted}
          onVolumeChange={onVolumeChange}
          language={language}
        />
        <button onClick={() => onLanguage(language === "vi" ? "en" : "vi")}>{language === "vi" ? "EN" : "VI"}</button>
      </div>
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
    {guideOpen && <JourneyGuideModal language={language} entryContext="carriage" onClose={() => setGuideOpen(false)} />}
  </section>;
}

function TravelScreen({ stop, language }: { stop: ExperienceStop; language: Language }) {
  const ui = copy[language];
  return <section className="travel-screen" aria-live="polite" aria-label={`${ui.arrival} ${stop.location[language]}`}>
    <Image className="travel-landscape" src="/train/coastal-transit-v2.webp" alt="" fill priority unoptimized sizes="100vw" aria-hidden="true" />
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
  onExternalReference,
  onClose,
}: {
  key?: string;
  stop: ExperienceStop;
  hotspot: ExperienceHotspot;
  language: Language;
  previewPlaying: boolean;
  onTogglePreview: () => void;
  onExternalReference: (open: boolean) => void;
  onClose: () => void;
}) {
  const ui = copy[language];
  const [referenceOpen, setReferenceOpen] = useState(false);
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
      <div className="drawer-top"><span>{stop.location[language]} · {language === "vi" ? "HỒ SƠ HIỆN VẬT" : "ARTIFACT RECORD"}</span><button onClick={onClose} aria-label={ui.close}>×</button></div>
      <div className="record-heading"><span>{hotspot.kicker[language]}</span><h2>{hotspot.label[language]}</h2><p>{hotspot.story[language]}</p></div>
      <div className="fact-list">{hotspot.facts.map((fact) => <div key={fact.vi}><span className="fact-bullet">✦</span><p>{fact[language]}</p></div>)}</div>

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
        <p>{preview?.embedUrl ? (language === "vi" ? "Bản ghi được mở từ trình phát YouTube bên ngoài; game không tải hoặc lưu lại âm thanh." : "This recording opens in an external YouTube player; the game does not download or store the audio.") : ui.audioPendingBody}</p>
        {(credit || note || preview?.license) && <small>{credit || note}{preview?.license ? ` · ${preview.license}` : ""}</small>}
        {preview?.embedUrl && <>
          <button className="official-audio-link" type="button" onClick={() => { const nextOpen = !referenceOpen; onExternalReference(nextOpen); setReferenceOpen(nextOpen); }} aria-expanded={referenceOpen}>
            {referenceOpen ? (language === "vi" ? "Đóng trình phát tham khảo" : "Close reference player") : (language === "vi" ? "Mở trình phát YouTube tham khảo" : "Open reference YouTube player")} ↗
          </button>
          {referenceOpen && <div className="external-audio-player">
            <iframe src={preview.embedUrl} title={`${hotspot.label[language]} · YouTube`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            <small>{language === "vi" ? "Nguồn bên ngoài: YouTube · Không tái lưu trữ trong game." : "External source: YouTube · Not re-hosted in the game."}</small>
          </div>}
        </>}
        {hotspot.media?.kind === "official-link" && hotspot.media.sourceUrl && <a className="official-audio-link" href={hotspot.media.sourceUrl} target="_blank" rel="noreferrer">
          {language === "vi" ? "Mở tư liệu tại nguồn chính thức" : "Open media at the official source"} ↗
        </a>}
      </div>}

      <section className="object-record-summary">
        <div><span className="record-mark">✦</span><p><b>{ui.askTitle}</b><small>{ui.askHint}</small></p></div>
        <dl>
          <div><dt>{language === "vi" ? "Bối cảnh" : "Context"}</dt><dd>{stop.description[language]}</dd></div>
          <div><dt>{language === "vi" ? "Giới hạn diễn giải" : "Interpretive boundary"}</dt><dd>{language === "vi" ? "Chỉ trình bày dữ kiện có trong hồ sơ nguồn; mọi bản ghi bối cảnh đều được ghi rõ và không được coi là bản trình diễn di sản nếu nguồn không xác nhận như vậy." : "Only source-backed facts are presented; contextual recordings are explicitly labelled and are not treated as heritage performances unless their source confirms that role."}</dd></div>
        </dl>
      </section>

      <HandTrackingViewer language={language} spriteSrc={hotspot.artifactSprite} label={hotspot.label[language]} />

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

  return <div className="archive-overlay passport-overlay" role="dialog" aria-modal="true" aria-label={ui.passport}>
    <div className={passport ? "passport-book" : "archive-ledger"}>
      <Image className="passport-crane-mark passport-crane-mark-top" src="/motifs/crane-stamp-gold.png" alt="" width={116} height={116} unoptimized aria-hidden="true" />
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
      {passport && <section className="passport-station-gallery" aria-labelledby="passport-scenes-title">
        <header><span>{language === "vi" ? "05 KHUNG CẢNH ĐÃ ĐÁNH THỨC" : "05 AWAKENED SCENES"}</span><h3 id="passport-scenes-title">{language === "vi" ? "Những miền ký ức đã đi qua" : "Living memories you crossed"}</h3></header>
        <div>{experienceStops.map((stop) => {
          const foundObjects = stop.hotspots.filter((hotspot) => visited.has(`${stop.id}:${hotspot.id}`));
          return <article key={stop.id} className={sealed.has(stop.id) ? "earned" : ""} style={{ "--passport-accent": stop.palette } as CSSProperties}>
            <span className="passport-scene-image"><Image src={stop.scene} alt="" fill unoptimized sizes="(max-width: 720px) 80vw, 30vw" aria-hidden="true" /><i /></span>
            <span className="passport-scene-seal" aria-label={`${language === "vi" ? "Dấu ấn ga" : "Station seal"} ${stop.number}`}>
              <i className="scene-seal-star">✦</i>
              <b>{stop.number}</b>
            </span>
            <div className="passport-scene-copy"><small>{stop.location[language]}</small><b>{stop.title[language]}</b></div>
            <div className="passport-scene-objects" aria-hidden="true">{foundObjects.map((hotspot) => <Image key={hotspot.id} src={hotspot.artifactSprite} alt="" width={72} height={72} unoptimized />)}</div>
          </article>;
        })}</div>
      </section>}
      <div className="passport-seal-strip" aria-label={language === "vi" ? "Các con dấu đã nhận" : "Earned station seals"}>
        {experienceStops.map((stop) => {
          const isEarned = sealed.has(stop.id);
          return (
            <span
              key={stop.id}
              className={`passport-seal-badge ${isEarned ? "earned" : "locked"}`}
              style={{ "--seal-accent": stop.palette } as CSSProperties}
            >
              <span className="seal-badge-ring" />
              <span className="seal-badge-inner">
                <i className="seal-badge-origin">VIỆT NAM</i>
                <b className="seal-badge-num">{stop.number}</b>
                <small className="seal-badge-name">{stop.title[language]}</small>
                <span className="seal-badge-status">
                  {isEarned ? (language === "vi" ? "✓ ĐÃ KÝ DẤU" : "✓ SEALED") : (language === "vi" ? "CHỜ KHAI MỞ" : "LOCKED")}
                </span>
              </span>
            </span>
          );
        })}
      </div>
      {records.length === 0 ? <div className="archive-empty"><i>◇</i><p>{ui.emptyArchive}</p></div> : <div className="archive-grid">{records.map(({ stop, hotspot }, index) => <article key={`${stop.id}:${hotspot.id}`} style={{ "--entry-accent": stop.palette } as CSSProperties}>
        {passport && <div className="passport-entry-visual"><Image className="passport-entry-scene" src={stop.scene} alt="" fill unoptimized sizes="(max-width: 720px) 85vw, 40vw" aria-hidden="true" /><span aria-hidden="true" /><Image className="passport-entry-object" src={hotspot.artifactSprite} alt="" width={190} height={190} unoptimized aria-hidden="true" /></div>}
        {passport ? <div className="passport-entry-head"><span>{stop.location[language]}</span><i>{String(index + 1).padStart(2, "0")}</i></div> : <span>{String(index + 1).padStart(2, "0")} · {stop.location[language]}</span>}
        <h3>{hotspot.label[language]}</h3>
        <p>{hotspot.story[language]}</p>
        <div className="passport-source-note"><small>✓ {hotspot.sourceIds.map((id) => getSource(id)?.title[language] || id).join(" · ")}</small><em>{hotspot.sourceIds.map((id) => getSource(id)?.rights[language]).filter(Boolean).join(" · ")}</em></div>
      </article>)}</div>}
      <footer><div><button disabled={records.length === 0} onClick={() => downloadPassportJson(exportRecords, exportSeals)}>{ui.export} ↓</button><button disabled={records.length === 0 || exportingPdf} onClick={exportPdf}>{exportingPdf ? ui.exportingPdf : ui.exportPdf} ↓</button></div><span>CAMERA LOCAL ONLY · NO UPLOAD · NO PERSONAL DATA</span><Image className="passport-crane-mark passport-crane-mark-bottom" src="/motifs/crane-stamp-gold.png" alt="" width={106} height={106} unoptimized aria-hidden="true" /></footer>
    </div>
  </div>;
}
