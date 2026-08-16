import type { AudioAsset, HeritageStop, LocalizedText, SourceRecord } from "@/lib/types";

export const sources: SourceRecord[] = [
  {
    id: "unesco-quan-ho-00183",
    title: { vi: "Dân ca Quan họ Bắc Ninh", en: "Quan Họ Bắc Ninh folk songs" },
    institution: "UNESCO Intangible Cultural Heritage",
    url: "https://ich.unesco.org/en/RL/quan-h-bc-ninh-folk-songs-00183",
    status: "approved",
    reviewedBy: "UNESCO nomination file with community consent",
    rights: {
      vi: "Chỉ diễn giải dữ kiện công khai. Bản ghi và hình ảnh cần giấy phép riêng.",
      en: "Public facts may be interpreted. Recordings and images require separate permission.",
    },
    accessedAt: "2026-07-17",
  },
  {
    id: "unesco-ca-tru-00309",
    title: { vi: "Hát Ca trù", en: "Ca trù singing" },
    institution: "UNESCO Intangible Cultural Heritage",
    url: "https://ich.unesco.org/en/USL/ca-tru-singing-00309",
    status: "approved",
    reviewedBy: "Vietnamese Institute for Musicology and community nomination",
    rights: {
      vi: "Dữ kiện từ hồ sơ UNESCO; đoạn âm thanh dùng giấy phép CC BY 3.0 riêng.",
      en: "Facts from the UNESCO file; the audio excerpt uses a separate CC BY 3.0 licence.",
    },
    accessedAt: "2026-07-17",
  },
  {
    id: "unesco-nha-nhac-00074",
    title: { vi: "Nhã nhạc, âm nhạc cung đình Việt Nam", en: "Nha Nhac, Vietnamese court music" },
    institution: "UNESCO Intangible Cultural Heritage",
    url: "https://ich.unesco.org/en/RL/nha-nhac-vietnamese-court-music-00074",
    status: "approved",
    reviewedBy: "Huế Monuments Conservation Centre / UNESCO",
    rights: {
      vi: "Chỉ diễn giải dữ kiện công khai; không sao chép bản ghi UNESCO.",
      en: "Public facts only; UNESCO recordings are not redistributed.",
    },
    accessedAt: "2026-07-17",
  },
  {
    id: "unesco-cham-pottery-01574",
    title: { vi: "Nghệ thuật làm gốm của người Chăm", en: "Art of pottery-making of Chăm people" },
    institution: "UNESCO Intangible Cultural Heritage",
    url: "https://ich.unesco.org/en/USL/art-of-pottery-making-of-chm-people-01574",
    status: "approved",
    reviewedBy: "Vietnam National Institute of Culture and Arts Studies with community consent",
    rights: {
      vi: "Không tái tạo hoa văn, bí quyết hoặc vật nghi lễ hạn chế; hoạt ảnh chỉ minh họa dữ kiện công khai.",
      en: "No restricted motifs, techniques or ritual objects are reproduced; animation illustrates public facts only.",
    },
    accessedAt: "2026-07-17",
  },
  {
    id: "unesco-don-ca-tai-tu-00733",
    title: { vi: "Nghệ thuật Đờn ca tài tử Nam Bộ", en: "Art of Đờn ca tài tử in southern Viet Nam" },
    institution: "UNESCO Intangible Cultural Heritage",
    url: "https://ich.unesco.org/en/RL/art-of-n-ca-tai-t-music-and-song-in-southern-viet-nam-00733",
    status: "approved",
    reviewedBy: "Vietnamese Institute for Musicology and community nomination",
    rights: {
      vi: "Chỉ diễn giải dữ kiện công khai; bản ghi chính thức được mở tại nguồn.",
      en: "Public facts only; official recordings open at their source.",
    },
    accessedAt: "2026-07-17",
  },
  {
    id: "commons-ca-tru-sound-futures",
    title: { vi: "Trình diễn Ca trù — Sound Futures", en: "Ca trù Club performance — Sound Futures" },
    institution: "Wikimedia Commons",
    url: "https://commons.wikimedia.org/wiki/File:Ca_Tru_Club_performance.ogv",
    status: "approved",
    reviewedBy: "Wikimedia Commons licence review",
    rights: {
      vi: "CC BY 3.0 — ghi công Sound Futures; đoạn trích 22 giây.",
      en: "CC BY 3.0 — attribution to Sound Futures; 22-second excerpt.",
    },
    accessedAt: "2026-07-17",
  },
  {
    id: "bacninh-quan-ho-repertoire-2025",
    title: { vi: "Chương trình hát Quan họ trên thuyền tại Lễ hội trái cây Bắc Ninh 2025", en: "Quan họ boat-singing programme at the 2025 Bắc Ninh Fruit Festival" },
    institution: "Sở Văn hóa, Thể thao và Du lịch tỉnh Bắc Ninh",
    url: "https://svhttdl.bacninh.gov.vn/vi/news/-/details/188850/chuong-trinh-nghe-thuat-hat-dan-ca-quan-ho-tren-thuyen-tai-le-hoi-trai-cay-bac-ninh-2025-81095830",
    status: "approved",
    reviewedBy: "Official Bắc Ninh Department of Culture, Sports and Tourism programme listing",
    rights: {
      vi: "Chỉ diễn giải danh mục tiết mục công khai; không sao chép lời ca, ảnh hoặc bản ghi.",
      en: "Public programme titles only; no lyrics, images or recordings are copied.",
    },
    accessedAt: "2026-08-16",
  },
];

const projectCreditsUrl = "https://github.com/Wanglongbong/tau-di-san-viet-nam/blob/main/CREDITS.md";

function originalAudio(
  id: string,
  role: AudioAsset["role"],
  generatorPreset: NonNullable<AudioAsset["generatorPreset"]>,
  credit: LocalizedText,
  note: LocalizedText,
): AudioAsset {
  return {
    id,
    kind: "synthesized",
    src: null,
    sourceUrl: projectCreditsUrl,
    creator: "Tàu Di Sản Việt Nam prototype",
    license: "MIT (generator code); no sampled recording",
    credit,
    role,
    reviewStatus: "approved-original",
    note,
    generatorPreset,
  };
}

function officialReference(id: string, sourceUrl: string, credit: LocalizedText, note: LocalizedText): AudioAsset {
  return {
    id,
    kind: "official-source",
    src: null,
    sourceUrl,
    creator: "See performer and producer credits at the official source",
    license: "Reuse licence not confirmed — streaming/download disabled",
    credit,
    role: "official-reference",
    reviewStatus: "pending-rights",
    note,
  };
}

const caTruEnsemblePreview: AudioAsset = {
  id: "ca-tru-sound-futures-excerpt",
  kind: "local-audio",
  src: "/media/ca-tru-sound-futures.ogg",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Ca_Tru_Club_performance.ogv",
  creator: "Sound Futures",
  license: "CC BY 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  credit: {
    vi: "Trích 22 giây từ bản ghi Sound Futures, CC BY 3.0; đã cắt và chuyển mã sang Opus/Ogg.",
    en: "22-second excerpt from Sound Futures, CC BY 3.0; trimmed and transcoded to Opus/Ogg.",
  },
  role: "heritage-ensemble-excerpt",
  reviewStatus: "approved-local",
  note: {
    vi: "Đây là toàn bộ nhóm Ca trù (giọng hát, đàn đáy và trống), không phải âm thanh riêng lẻ của một nhạc cụ.",
    en: "This is a Ca trù ensemble (voice, đàn đáy and drum), not an isolated recording of any one instrument.",
  },
  durationSeconds: 22,
  bytes: 281739,
  sha256: "8ca76c2c114caaec2d82036fd0c8e3338edf6be04ed02870c0382cbc4cad2a8e",
  technical: "Ogg container; Opus mono; 48 kHz",
};

export const soundscapes: Record<"carriage" | "quan-ho" | "ca-tru" | "nha-nhac" | "cham-pottery" | "don-ca-tai-tu", AudioAsset> = {
  carriage: originalAudio(
    "ambient-carriage",
    "modern-ambient",
    "carriage",
    { vi: "Không khí toa tàu được tổng hợp trong trình duyệt.", en: "Browser-synthesized train-car ambience." },
    { vi: "Thiết kế âm thanh hiện đại, không phải bản ghi đường sắt hay âm nhạc di sản.", en: "Modern sound design, not a railway field recording or heritage music." },
  ),
  "quan-ho": originalAudio(
    "ambient-kinh-bac-air",
    "modern-ambient",
    "kinh-bac-air",
    { vi: "Không khí nhẹ tại ga Kinh Bắc được tổng hợp trong trình duyệt.", en: "Browser-synthesized light ambience for the Kinh Bắc stop." },
    { vi: "Không dùng hoặc mô phỏng giai điệu Quan họ.", en: "Uses and imitates no Quan họ melody." },
  ),
  "ca-tru": originalAudio(
    "ambient-hanoi-room",
    "modern-ambient",
    "hanoi-room",
    { vi: "Không khí phòng yên tĩnh được tổng hợp trong trình duyệt.", en: "Browser-synthesized quiet room ambience." },
    { vi: "Không dùng hoặc mô phỏng thể cách Ca trù.", en: "Uses and imitates no Ca trù form or melody." },
  ),
  "nha-nhac": originalAudio(
    "ambient-hue-courtyard",
    "modern-ambient",
    "hue-courtyard",
    { vi: "Không khí sân thoáng ở ga Huế được tổng hợp trong trình duyệt.", en: "Browser-synthesized open courtyard ambience for the Huế stop." },
    { vi: "Không dùng hoặc mô phỏng Nhã nhạc hay âm thanh nghi lễ.", en: "Uses and imitates no Nhã nhạc or ceremonial sound." },
  ),
  "cham-pottery": originalAudio(
    "ambient-cham-workyard",
    "modern-ambient",
    "cham-workyard",
    { vi: "Không khí sân làm việc khô thoáng được tổng hợp trong trình duyệt.", en: "Browser-synthesized dry workyard ambience." },
    { vi: "Không phải bản ghi tại cộng đồng Chăm và không mô phỏng nghi lễ.", en: "Not a Chăm community field recording and does not imitate ritual." },
  ),
  "don-ca-tai-tu": originalAudio(
    "ambient-southern-riverside",
    "modern-ambient",
    "southern-riverside",
    { vi: "Không khí sông nước nhẹ được tổng hợp trong trình duyệt.", en: "Browser-synthesized gentle riverside ambience." },
    { vi: "Không dùng hoặc mô phỏng giai điệu Đờn ca tài tử.", en: "Uses and imitates no Đờn ca tài tử melody." },
  ),
};

const clayWorkRecording: AudioAsset = {
  id: "clay-sculpting-field-recording",
  kind: "local-audio",
  src: "/media/clay-sculpting.mp3",
  sourceUrl: "https://freesound.org/people/manuelaurreaf/sounds/490100/",
  creator: "manuelaurreaf",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  credit: {
    vi: "Bản ghi thao tác đất “Spreading” của manuelaurreaf, CC BY 4.0.",
    en: "“Spreading” clay-handling recording by manuelaurreaf, CC BY 4.0.",
  },
  role: "licensed-field-recording",
  reviewStatus: "approved-local",
  note: {
    vi: "Âm thanh thao tác đất thật để tạo bối cảnh; không phải bản ghi nghệ nhân Chăm và không minh họa bí quyết nghề.",
    en: "A real clay-handling sound for context; not a recording of a Chăm artisan and not evidence of craft technique.",
  },
  durationSeconds: 10.286032,
  bytes: 193621,
  sha256: "89b39108b59cc391bcaf0bd3e67938e2d874c23f053df6460206b9d5c3e21135",
  technical: "MP3; Freesound preview",
};

const openFireRecording: AudioAsset = {
  id: "open-fire-field-recording",
  kind: "local-audio",
  src: "/media/open-fire.mp3",
  sourceUrl: "https://freesound.org/people/kingsrow/sounds/181563/",
  creator: "kingsrow",
  license: "CC0 1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  credit: {
    vi: "Bản ghi lửa nổ lách tách “Fire Crackling 01.wav” của kingsrow, CC0 1.0.",
    en: "“Fire Crackling 01.wav” field recording by kingsrow, CC0 1.0.",
  },
  role: "licensed-field-recording",
  reviewStatus: "approved-local",
  note: {
    vi: "Đây là tiếng lửa thật dùng làm bối cảnh, không phải bản ghi một lần nung gốm Chăm cụ thể.",
    en: "This is a real fire recording used as ambience, not documentation of a specific Chăm firing.",
  },
  durationSeconds: 34.210839,
  bytes: 920315,
  sha256: "f06ff554e43415d6fe1d83d00d964c93f8a3b1c1ec7c5b59e4e6c4383dd4c591",
  technical: "MP3; Freesound preview",
};

const danTranhFieldRecording: AudioAsset = {
  id: "dan-tranh-field-recording",
  kind: "local-audio",
  src: "/media/dan-tranh-field.mp3",
  sourceUrl: "https://freesound.org/people/TRP/sounds/574668/",
  creator: "TRP",
  license: "CC0 1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  credit: {
    vi: "Bản ghi thực địa chỉnh dây đàn giống đàn tranh tại Hội An của TRP, CC0 1.0.",
    en: "TRP field recording of tuning a zither-like đàn tranh instrument in Hội An, CC0 1.0.",
  },
  role: "licensed-field-recording",
  reviewStatus: "approved-local",
  note: {
    vi: "Dùng để nghe chất liệu tiếng dây thực; đây không phải tiết mục Đờn ca tài tử hay bản diễn mẫu của nghệ nhân.",
    en: "Used to hear real string timbre; this is neither a Đờn ca tài tử piece nor a model artisan performance.",
  },
  durationSeconds: 32.882333,
  bytes: 717984,
  sha256: "4e8778307eb6bc9d894d538e7cb8bac0d1a8d12ca692e35866c6561b88efcecd",
  technical: "MP3; Freesound preview",
};

const nhaNhacOfficialRecording = officialReference(
  "nha-nhac-official-recording-reference",
  "https://ich.unesco.org/en/RL/nha-nhac-vietnamese-court-music-00074",
  { vi: "Tư liệu nghe nhìn nằm tại hồ sơ UNESCO; chưa được phép sao chép vào game.", en: "Audiovisual material is available in the UNESCO file; local copying is not authorized." },
  { vi: "Không dùng âm thanh trống hoặc dàn nhạc thay thế vì có thể làm sai chức năng của Nhã nhạc.", en: "No substitute drum or ensemble audio is used because it could misrepresent Nhã nhạc's function." },
);

const donCaOfficialRecording = officialReference(
  "don-ca-tai-tu-official-recording-reference",
  "https://ich.unesco.org/en/RL/art-of-n-ca-tai-t-music-and-song-in-southern-viet-nam-00733",
  { vi: "Bản ghi tham chiếu nằm tại hồ sơ UNESCO; chưa được phép sao chép vào game.", en: "The reference recording is available in the UNESCO file; local copying is not authorized." },
  { vi: "Không gắn âm thanh nhạc cụ khác dưới tên đàn kìm hoặc cuộc đàn tài tử.", en: "No other instrument recording is relabelled as đàn kìm or a tài tử gathering." },
);

export const stops: HeritageStop[] = [
  {
    id: "quan-ho",
    number: "01",
    location: { vi: "Bắc Ninh · Bắc Giang", en: "Bắc Ninh · Bắc Giang" },
    title: { vi: "Quan họ Kinh Bắc", en: "Quan họ of Kinh Bắc" },
    subtitle: { vi: "Lời mời, câu đối đáp, cuộc chia tay", en: "Invitation, exchange and farewell" },
    description: {
      vi: "Quan họ kết nối những làng kết chạ bằng lối hát đối đáp giữa nhóm nữ và nhóm nam, với giai điệu tương ứng nhưng lời ca khác nhau.",
      en: "Quan họ links twinned villages through alternating verses between women and men, using related melodies with different lyrics.",
    },
    scene: "/scenes/01-quan-ho.webp",
    palette: "#f0b07a",
    sourceIds: ["unesco-quan-ho-00183", "bacninh-quan-ho-repertoire-2025"],
    soundscape: soundscapes["quan-ho"],
    hotspots: [
      {
        id: "round-hat",
        artifactSprite: "/artifacts/quan-ho-hat.webp",
        label: { vi: "Nón quai thao", en: "Large round hat" },
        kicker: { vi: "Trang phục trong không gian hát", en: "Dress within the singing space" },
        story: {
          vi: "Hồ sơ UNESCO ghi nhận phụ nữ Quan họ truyền thống đội nón tròn lớn và quàng khăn; nam giới mặc áo dài, khăn xếp và có thể mang ô.",
          en: "The UNESCO file notes that women traditionally wear distinctive large round hats and scarves, while men wear tunics and turbans and may carry umbrellas.",
        },
        facts: [
          { vi: "Trang phục là một phần của không gian giao tiếp Quan họ.", en: "Dress is part of Quan họ’s social setting." },
          { vi: "Minh họa pixel không đại diện cho mọi biến thể địa phương.", en: "The pixel illustration does not represent every local variation." },
        ],
        x: 23, y: 78, radius: 13, interaction: "story", sourceIds: ["unesco-quan-ho-00183"],
        suggestedQuestions: [
          { vi: "Trang phục góp phần tạo nên không gian giao tiếp Quan họ như thế nào?", en: "How does dress help shape Quan họ’s social setting?" },
          { vi: "Hồ sơ UNESCO mô tả trang phục của liền chị và liền anh ra sao?", en: "How does the UNESCO file describe the women’s and men’s dress?" },
          { vi: "Vì sao minh họa pixel không thể đại diện cho mọi biến thể địa phương?", en: "Why can the pixel illustration not represent every local variation?" },
        ],
      },
      {
        id: "paired-singing",
        artifactSprite: "/artifacts/quan-ho-singing.webp",
        label: { vi: "Hát đối đáp", en: "Responsive singing" },
        kicker: { vi: "Hai làng, hai nhóm hát", en: "Two villages, two singing groups" },
        story: {
          vi: "Hai phụ nữ của một làng hát hòa giọng; hai nam giới từ làng kết chạ đáp lại bằng giai điệu tương tự với lời khác. Thực hành này củng cố quan hệ giữa các làng.",
          en: "Two women from one village sing in harmony; two men from a twinned village respond with similar melodies and different lyrics, strengthening relationships between villages.",
        },
        facts: [
          { vi: "Quan họ xuất hiện trong nghi lễ, lễ hội và những cuộc gặp thân tình.", en: "Quan họ appears in rituals, festivals and informal gatherings." },
          { vi: "Bản ghi chính thức mở tại trang UNESCO; game không sao chép tệp khi chưa rõ quyền.", en: "The official recording opens at UNESCO; the game does not copy unclear-rights media." },
          { vi: "Trong lối hát đối đáp được UNESCO mô tả, nhóm nữ hát hòa giọng và nhóm nam của làng kết chạ đáp bằng giai điệu tương ứng với lời khác.", en: "In UNESCO's description of responsive singing, women sing in harmony and men from the twinned village answer with a corresponding melody and different words." },
          { vi: "Đối đáp không chỉ là thay phiên câu hát: đó còn là thực hành giao tiếp và củng cố quan hệ giữa các cộng đồng làng.", en: "The exchange is more than alternating verses: it is a social practice that reinforces relationships between village communities." },
        ],
        x: 50, y: 51, radius: 12, interaction: "audio", sourceIds: ["unesco-quan-ho-00183"],
        media: { kind: "official-link", sourceUrl: "https://ich.unesco.org/en/RL/quan-h-bc-ninh-folk-songs-00183" },
        audioPreview: officialReference(
          "quan-ho-official-recording-reference",
          "https://ich.unesco.org/en/RL/quan-h-bc-ninh-folk-songs-00183",
          { vi: "Bản ghi tham chiếu nằm tại hồ sơ UNESCO; chưa được phép sao chép vào game.", en: "The reference recording is on the UNESCO file; local copying is not authorized." },
          { vi: "Chờ xác nhận quyền từ nghệ nhân/chủ thể quyền trước khi bật phát trực tiếp trong game.", en: "Awaiting permission from performers/rightsholders before in-game playback." },
        ),
        suggestedQuestions: [
          { vi: "Một lượt hát đối đáp Quan họ diễn ra giữa hai nhóm như thế nào?", en: "How does a Quan họ responsive-singing exchange unfold between the two groups?" },
          { vi: "Giai điệu tương ứng nhưng lời khác tạo nên đối thoại ra sao?", en: "How do related melodies with different lyrics create a dialogue?" },
          { vi: "Hát đối đáp góp phần gắn kết các làng kết chạ như thế nào?", en: "How does responsive singing strengthen ties between twinned villages?" },
        ],
      },
      {
        id: "melody-book",
        artifactSprite: "/artifacts/quan-ho-book.webp",
        label: { vi: "Kho lời ca", en: "Song repertoire" },
        kicker: { vi: "Ký ức được truyền bằng thực hành", en: "Memory transmitted through practice" },
        story: {
          vi: "UNESCO ghi nhận hơn 400 lời ca với 213 biến thể giai điệu, diễn tả nỗi nhớ, chia xa và niềm vui gặp gỡ. Danh mục biểu diễn chính thức của Bắc Ninh năm 2025 cho thấy kho thực hành còn hiện diện qua nhiều tiết mục lời cổ và sáng tác gắn với Quan họ.",
          en: "UNESCO records more than 400 song lyrics and 213 melody variations expressing longing, separation and reunion. A 2025 official Bắc Ninh programme shows that this living repertoire continues through old-text pieces and works associated with Quan họ.",
        },
        facts: [
          { vi: "Người trẻ luyện bốn kỹ thuật hát được hồ sơ mô tả.", en: "Young singers practise four techniques described by the file." },
          { vi: "Con số là dữ kiện hồ sơ UNESCO, không phải thống kê trực tiếp của game.", en: "These counts come from the UNESCO file, not an independent game survey." },
          { vi: "Chương trình chính thức năm 2025 nêu các tiết mục như “Dưới giời mấy kẻ biết ra”, “Lý giao duyên”, “Thuyền mở lái chèo”, “Đêm qua nhớ bạn”, “Năm liệu bảy lo” và “Ngồi tựa mạn thuyền”.", en: "The official 2025 programme lists pieces including “Dưới giời mấy kẻ biết ra”, “Lý giao duyên”, “Thuyền mở lái chèo”, “Đêm qua nhớ bạn”, “Năm liệu bảy lo” and “Ngồi tựa mạn thuyền”." },
          { vi: "Game chỉ ghi tên tiết mục để định hướng khám phá; toàn văn lời ca và bản ghi cần được sử dụng theo quyền của nghệ nhân, đơn vị biểu diễn và chủ thể liên quan.", en: "The game lists titles only as discovery pointers; full lyrics and recordings remain subject to the rights of practitioners, performers and relevant communities." },
          { vi: "Kho lời được trao truyền bằng học, nhớ, hát và ứng xử trong sinh hoạt Quan họ — không chỉ bằng một danh sách văn bản.", en: "The repertoire is transmitted through learning, memory, singing and social conduct within Quan họ practice — not merely as a written list." },
        ],
        x: 82, y: 79, radius: 11, interaction: "story", sourceIds: ["unesco-quan-ho-00183", "bacninh-quan-ho-repertoire-2025"],
        suggestedQuestions: [
          { vi: "Con số hơn 400 lời ca và 213 biến thể giai điệu cho biết điều gì?", en: "What do the counts of over 400 lyrics and 213 melody variations tell us?" },
          { vi: "Lời ca Quan họ thường diễn tả những tình cảm nào theo hồ sơ?", en: "Which feelings do Quan họ lyrics express according to the file?" },
          { vi: "Kho lời ca được lưu truyền qua thực hành và luyện hát ra sao?", en: "How is the repertoire transmitted through practice and singing?" },
        ],
      },
    ],
  },
  {
    id: "ca-tru",
    number: "02",
    location: { vi: "Hà Nội · Bắc Bộ", en: "Hà Nội · Northern Viet Nam" },
    title: { vi: "Ca trù", en: "Ca trù" },
    subtitle: { vi: "Thơ hát, phách và tiếng trống thưởng", en: "Sung poetry, clappers and praise drum" },
    description: {
      vi: "Một nhóm Ca trù điển hình có ca nương vừa hát vừa gõ phách, người chơi đàn đáy và người đánh trống chầu.",
      en: "A typical Ca trù group features a singer using clappers, a đàn đáy player and a praise-drum player.",
    },
    scene: "/scenes/02-ca-tru.webp",
    palette: "#ee7b45",
    sourceIds: ["unesco-ca-tru-00309", "commons-ca-tru-sound-futures"],
    soundscape: soundscapes["ca-tru"],
    hotspots: [
      {
        id: "dan-day",
        artifactSprite: "/artifacts/ca-tru-dan-day.webp",
        label: { vi: "Đàn đáy", en: "Đàn đáy lute" },
        kicker: { vi: "Âm trầm của đàn ba dây", en: "The deep tone of a three-string lute" },
        story: {
          vi: "Đàn đáy tạo phần âm trầm đặc trưng trong nhóm Ca trù. Người đàn nâng đỡ giọng hát và hệ thống nhịp của phách, trống chầu.",
          en: "The three-string đàn đáy provides the ensemble’s deep tone, supporting the singer and the rhythmic dialogue of clappers and praise drum.",
        },
        facts: [
          { vi: "Ca trù dùng thơ theo các thể truyền thống Việt Nam.", en: "Ca trù uses lyrics in traditional Vietnamese poetic forms." },
          { vi: "Tư liệu ghi nhận 56 thể cách hoặc giai điệu.", en: "The file records 56 musical forms or melodies." },
          { vi: "Đàn đáy có ba dây và đảm nhiệm lớp âm trầm trong nhóm gồm ca nương, người đàn và người cầm chầu.", en: "The three-string đàn đáy carries the low instrumental layer in the group of singer, lutenist and praise-drum player." },
          { vi: "Đoạn nghe là bản ghi cả nhóm Ca trù, không được coi là tiếng đàn đáy tách riêng; hồ sơ 22 giây mở khóa sau khi khảo sát đủ ba thành phần.", en: "The preview is an ensemble recording, not isolated đàn đáy; the 22-second record unlocks after all three components are explored." },
        ],
        x: 24, y: 78, radius: 13, interaction: "audio", sourceIds: ["unesco-ca-tru-00309", "commons-ca-tru-sound-futures"],
        audioPreview: caTruEnsemblePreview,
        suggestedQuestions: [
          { vi: "Đàn đáy nâng đỡ giọng hát, phách và trống chầu như thế nào?", en: "How does đàn đáy support the voice, clappers and praise drum?" },
          { vi: "Vì sao đoạn nghe này được ghi là âm thanh cả nhóm chứ không phải riêng đàn đáy?", en: "Why is this preview labelled as an ensemble rather than isolated đàn đáy?" },
          { vi: "Các thể cách và thơ truyền thống giữ vai trò gì trong Ca trù?", en: "What roles do musical forms and traditional poetry play in Ca trù?" },
        ],
      },
      {
        id: "phach",
        artifactSprite: "/artifacts/ca-tru-phach.webp",
        label: { vi: "Phách", en: "Clappers" },
        kicker: { vi: "Nhịp trong tay người hát", en: "Rhythm in the singer’s hands" },
        story: {
          vi: "Ca nương vừa dùng kỹ thuật hơi, rung giọng để tạo âm thanh trang sức, vừa gõ phách hoặc hộp gỗ để giữ và biến hóa nhịp.",
          en: "The singer combines breath and vibrato ornamentation with clappers or a wooden box that articulates the rhythmic structure.",
        },
        facts: [
          { vi: "Phách được ca nương gõ trong lúc hát, vì vậy nhịp và câu hát gắn trực tiếp với cùng một người biểu diễn.", en: "The singer strikes the clappers while singing, directly linking rhythmic articulation and the sung line." },
          { vi: "Hồ sơ UNESCO mô tả phách hoặc hộp gỗ là thành phần tạo tiết tấu trong nhóm Ca trù.", en: "The UNESCO file describes clappers or a wooden box as the rhythmic component of the Ca trù group." },
          { vi: "Nhịp phách có thể biến hóa theo thể cách; trò chơi không biến ký hiệu khái quát này thành bài dạy kỹ thuật.", en: "Clapper patterns vary by form; the game does not turn this overview into technique instruction." },
          { vi: "Âm hiệu gõ trong game là minh họa mới, không được ghi nhãn như bản phách của nghệ nhân.", en: "The in-game wooden cue is newly made and is not labelled as an artisan phách recording." },
        ],
        x: 52, y: 80, radius: 11, interaction: "animation", sourceIds: ["unesco-ca-tru-00309"],
        media: { kind: "animation" },
        audioPreview: caTruEnsemblePreview,
        suggestedQuestions: [
          { vi: "Ca nương phối hợp giọng hát và nhịp phách như thế nào?", en: "How does the singer coordinate vocal technique with the clappers?" },
          { vi: "Phách tham gia cấu trúc tiết tấu của Ca trù ra sao?", en: "How do the clappers articulate Ca trù’s rhythmic structure?" },
          { vi: "Vì sao hoạt ảnh chỉ giúp nhận biết vai trò chứ không dạy kỹ thuật gõ phách?", en: "Why does the animation identify the role without teaching clapper technique?" },
        ],
      },
      {
        id: "praise-drum",
        artifactSprite: "/artifacts/ca-tru-drum.webp",
        label: { vi: "Trống chầu", en: "Praise drum" },
        kicker: { vi: "Tiếng trống trong cuộc diễn", en: "A drum within the performance" },
        story: {
          vi: "Người đánh trống chầu tạo những tiếng mạnh, tham gia vào cấu trúc biểu diễn cùng giọng hát, phách và đàn đáy.",
          en: "The praise-drum player contributes strong accents within the performance alongside voice, clappers and đàn đáy.",
        },
        facts: [
          { vi: "Ca trù từng phục vụ nhiều bối cảnh xã hội khác nhau.", en: "Ca trù historically served several social settings." },
          { vi: "Di sản vẫn cần bảo vệ do số nghệ nhân thành thạo còn ít và cao tuổi.", en: "The tradition remains at risk because skilled practitioners are few and ageing." },
          { vi: "Người cầm chầu dùng tiếng trống để tham gia vào cuộc diễn và tạo các điểm nhấn mạnh bên cạnh giọng hát, phách và đàn đáy.", en: "The praise-drum player joins the performance with strong accents beside voice, clappers and đàn đáy." },
          { vi: "Âm hiệu trống riêng trong game giúp nhận biết lớp vai trò; nó không thay thế quy tắc cầm chầu do nghệ nhân truyền dạy.", en: "The isolated game cue identifies a role; it does not replace praise-drum conventions taught by practitioners." },
        ],
        x: 81, y: 72, radius: 13, interaction: "story", sourceIds: ["unesco-ca-tru-00309"],
        audioPreview: caTruEnsemblePreview,
        suggestedQuestions: [
          { vi: "Trống chầu tạo điểm nhấn trong cuộc diễn Ca trù như thế nào?", en: "How does the praise drum provide accents in a Ca trù performance?" },
          { vi: "Trống chầu đối thoại với giọng hát, phách và đàn đáy ra sao?", en: "How does the praise drum interact with voice, clappers and đàn đáy?" },
          { vi: "Vì sao Ca trù vẫn cần được bảo vệ khẩn cấp?", en: "Why does Ca trù still require urgent safeguarding?" },
        ],
      },
    ],
    unlock: {
      requiredHotspotIds: ["dan-day", "phach", "praise-drum"],
      audio: caTruEnsemblePreview,
      message: {
        vi: "Đã khảo sát đủ đàn đáy, phách và trống chầu — mở khóa 22 giây trình diễn Ca trù của Sound Futures (CC BY 3.0).",
        en: "Đàn đáy, clappers and praise drum explored — the 22-second Sound Futures Ca trù performance is now unlocked (CC BY 3.0).",
      },
    },
  },
  {
    id: "nha-nhac",
    number: "03",
    location: { vi: "Huế", en: "Huế" },
    title: { vi: "Nhã nhạc cung đình", en: "Nhã nhạc court music" },
    subtitle: { vi: "Âm nhạc trong trật tự nghi lễ", en: "Music within ceremonial order" },
    description: {
      vi: "Nhã nhạc bao gồm nhiều phong cách âm nhạc và múa của triều đình Việt Nam từ thế kỷ XV đến giữa thế kỷ XX.",
      en: "Nhã nhạc spans court music and dance styles performed from the fifteenth to the mid-twentieth century.",
    },
    scene: "/scenes/03-nha-nhac.webp",
    palette: "#d95d48",
    sourceIds: ["unesco-nha-nhac-00074"],
    soundscape: soundscapes["nha-nhac"],
    hotspots: [
      {
        id: "great-drum",
        artifactSprite: "/artifacts/nha-nhac-drums.webp",
        label: { vi: "Bộ trống", en: "Prominent drum section" },
        kicker: { vi: "Trọng tâm của đại nhạc", en: "A prominent orchestral section" },
        story: {
          vi: "Hồ sơ UNESCO mô tả các dàn nhạc quy mô lớn có bộ trống nổi bật bên cạnh nhiều nhạc cụ gõ, hơi và dây.",
          en: "The UNESCO file describes large orchestras with a prominent drum section alongside percussion, wind and string instruments.",
        },
        facts: [
          { vi: "Người biểu diễn phải tập trung cao để theo đúng từng bước nghi lễ.", en: "Performers maintained intense concentration to follow each ceremonial step." },
          { vi: "Hình minh họa không tái dựng một nghi lễ cụ thể.", en: "The illustration does not reconstruct a specific ceremony." },
          { vi: "Trong mô tả của UNESCO, bộ trống nổi bật thuộc các dàn Đại nhạc quy mô lớn, đi cùng nhiều nhạc cụ gõ, hơi và dây.", en: "In UNESCO's description, a prominent drum section belongs to large Đại nhạc orchestras alongside percussion, wind and string instruments." },
          { vi: "Âm hiệu trầm trong game chỉ đánh dấu vị trí bộ trống; không được trình bày như nhịp thức của một nghi lễ cụ thể.", en: "The low game cue only marks the drum section and is not presented as the rhythm of a specific ceremony." },
        ],
        x: 17, y: 71, radius: 13, interaction: "audio", sourceIds: ["unesco-nha-nhac-00074"],
        media: { kind: "official-link", sourceUrl: "https://ich.unesco.org/en/RL/nha-nhac-vietnamese-court-music-00074" },
        audioPreview: nhaNhacOfficialRecording,
        suggestedQuestions: [
          { vi: "Bộ trống giữ vị trí nào trong các dàn Đại nhạc được hồ sơ mô tả?", en: "What place does the drum section hold in the large orchestras described by the file?" },
          { vi: "Vì sao nhạc công phải tập trung cao trong từng bước nghi lễ?", en: "Why did musicians need intense concentration through each ceremonial step?" },
          { vi: "Minh họa này có giới hạn gì khi nói về một nghi lễ cụ thể?", en: "What are the illustration’s limits when discussing a specific ceremony?" },
        ],
      },
      {
        id: "court-orchestra",
        artifactSprite: "/artifacts/nha-nhac-orchestra.webp",
        label: { vi: "Dàn nhạc", en: "Court ensemble" },
        kicker: { vi: "Hơi, dây và bộ gõ", en: "Winds, strings and percussion" },
        story: {
          vi: "Nhã nhạc từng hiện diện trong lễ kỷ niệm, lễ tôn giáo, lễ đăng quang, tang lễ và các cuộc tiếp đón chính thức của triều đình.",
          en: "Nhã nhạc accompanied anniversaries, religious holidays, coronations, funerals and official court receptions.",
        },
        facts: [
          { vi: "Bản ghi chính thức được mở tại hồ sơ UNESCO.", en: "The official recording opens at the UNESCO file." },
          { vi: "Game không trích âm thanh khi chưa có giấy phép tái sử dụng rõ ràng.", en: "The game does not copy audio without a clear reuse licence." },
          { vi: "Nhã nhạc gồm nhiều phong cách âm nhạc và múa; dàn nhạc có thể phối hợp nhóm hơi, dây và bộ gõ theo chức năng nghi lễ.", en: "Nhã nhạc includes several music and dance styles; ensembles may combine winds, strings and percussion according to ceremonial function." },
          { vi: "Trải nghiệm này giới thiệu cấu trúc tổng quát, không khẳng định mọi nghi lễ dùng cùng một biên chế.", en: "This experience presents a general structure and does not claim that every ceremony used the same instrumentation." },
        ],
        x: 52, y: 78, radius: 14, interaction: "audio", sourceIds: ["unesco-nha-nhac-00074"],
        media: { kind: "official-link", sourceUrl: "https://ich.unesco.org/en/RL/nha-nhac-vietnamese-court-music-00074" },
        audioPreview: nhaNhacOfficialRecording,
        suggestedQuestions: [
          { vi: "Nhã nhạc từng hiện diện trong những dịp nào của triều đình?", en: "Which court occasions historically included Nhã nhạc?" },
          { vi: "Các nhóm nhạc cụ hơi, dây và bộ gõ cùng tạo nên dàn nhạc ra sao?", en: "How do wind, string and percussion groups form the court ensemble?" },
          { vi: "Vì sao game chưa phát một bản ghi Nhã nhạc ngay tại điểm này?", en: "Why does the game not yet play a Nhã nhạc recording at this hotspot?" },
        ],
      },
      {
        id: "ceremonial-door",
        artifactSprite: "/artifacts/nha-nhac-gate.webp",
        label: { vi: "Không gian nghi lễ", en: "Ceremonial setting" },
        kicker: { vi: "Âm nhạc gắn với chức năng xã hội", en: "Music tied to social function" },
        story: {
          vi: "Nhã nhạc không chỉ là phần đệm: trong bối cảnh cung đình, âm nhạc còn truyền đạt quan niệm về tự nhiên, vũ trụ và sự tôn kính.",
          en: "Nhã nhạc was more than accompaniment: within court life it conveyed respect and knowledge about nature and the universe.",
        },
        facts: [
          { vi: "Truyền thống bị đe dọa khi mất bối cảnh cung đình trong thế kỷ XX.", en: "The tradition was threatened when it lost its court context in the twentieth century." },
          { vi: "Những nhạc công còn lại đã góp phần duy trì thực hành.", en: "Surviving court musicians helped keep the practice alive." },
          { vi: "Nhã nhạc từng gắn với lễ kỷ niệm, lễ tôn giáo, đăng quang, tang lễ và tiếp đón chính thức của triều đình.", en: "Nhã nhạc was associated with anniversaries, religious observances, coronations, funerals and official court receptions." },
          { vi: "Không gian, trình tự và sự tập trung của người biểu diễn là một phần ý nghĩa; âm thanh không nên bị tách khỏi bối cảnh để kể sai chức năng.", en: "Setting, sequence and performer concentration carry meaning; sound should not be detached from context in ways that distort its function." },
        ],
        x: 86, y: 67, radius: 12, interaction: "story", sourceIds: ["unesco-nha-nhac-00074"],
        media: { kind: "official-link", sourceUrl: "https://ich.unesco.org/en/RL/nha-nhac-vietnamese-court-music-00074" },
        audioPreview: nhaNhacOfficialRecording,
        suggestedQuestions: [
          { vi: "Trong đời sống cung đình, Nhã nhạc truyền đạt những quan niệm nào?", en: "Which ideas did Nhã nhạc convey within court life?" },
          { vi: "Việc mất bối cảnh cung đình trong thế kỷ XX đe dọa truyền thống ra sao?", en: "How did the loss of court context in the twentieth century threaten the tradition?" },
          { vi: "Những nhạc công còn lại đã góp phần duy trì thực hành như thế nào?", en: "How did surviving court musicians help sustain the practice?" },
        ],
      },
    ],
  },
  {
    id: "cham-pottery",
    number: "04",
    location: { vi: "Ninh Thuận · Bình Thuận", en: "Ninh Thuận · Bình Thuận" },
    title: { vi: "Gốm Chăm", en: "Chăm pottery" },
    subtitle: { vi: "Đất, bàn tay và lửa ngoài trời", en: "Clay, hands and open-air fire" },
    description: {
      vi: "Nghề gốm được phụ nữ thực hành và truyền trong gia đình; người thợ đi quanh khối đất để tạo hình thay vì dùng bàn xoay.",
      en: "Practised and transmitted within families by women, the craft shapes vessels by moving around the clay rather than using a wheel.",
    },
    scene: "/scenes/04-cham-pottery.webp",
    palette: "#e47a3f",
    sourceIds: ["unesco-cham-pottery-01574"],
    soundscape: soundscapes["cham-pottery"],
    hotspots: [
      {
        id: "local-materials",
        artifactSprite: "/artifacts/cham-materials.webp",
        label: { vi: "Nguyên liệu địa phương", en: "Local materials" },
        kicker: { vi: "Đất, cát, nước, củi và rơm", en: "Clay, sand, water, wood and straw" },
        story: {
          vi: "Hồ sơ UNESCO nêu đất, cát, nước, củi và rơm được thu thập tại địa phương, gắn nghề với môi trường sống của cộng đồng.",
          en: "The UNESCO file notes that clay, sand, water, firewood and straw are collected locally, tying the craft to its community environment.",
        },
        facts: [
          { vi: "Đô thị hóa đang gây sức ép lên khả năng tiếp cận nguyên liệu.", en: "Urbanization is placing pressure on access to raw materials." },
          { vi: "Game không hướng dẫn khai thác hay phối trộn nguyên liệu.", en: "The game does not teach extraction or material recipes." },
          { vi: "Đất, cát và nước tạo nên phần vật liệu của sản phẩm; củi và rơm thuộc công đoạn nung ngoài trời được hồ sơ mô tả.", en: "Clay, sand and water form the material base, while wood and straw belong to the open-air firing stage described in the file." },
          { vi: "Việc thu thập tại địa phương cho thấy tri thức nghề gắn với địa hình, nguồn vật liệu và đời sống cộng đồng, không phải một công thức có thể tách rời nơi chốn.", en: "Local collection shows that craft knowledge is tied to landscape, material access and community life rather than a recipe detached from place." },
          { vi: "Sức ép mất nguồn nguyên liệu là một trong những lý do UNESCO ghi nhận nhu cầu bảo vệ khẩn cấp đối với thực hành này.", en: "Pressure on access to raw materials is among the safeguarding concerns recognized around this practice." },
        ],
        x: 15, y: 78, radius: 13, interaction: "story", sourceIds: ["unesco-cham-pottery-01574"],
        suggestedQuestions: [
          { vi: "Những nguyên liệu địa phương nào được hồ sơ UNESCO nhắc tới?", en: "Which local materials does the UNESCO file identify?" },
          { vi: "Nguồn nguyên liệu gắn nghề gốm với môi trường sống như thế nào?", en: "How do local materials connect the craft to its environment?" },
          { vi: "Đô thị hóa tạo sức ép gì lên khả năng tiếp cận nguyên liệu?", en: "How does urbanization pressure access to raw materials?" },
        ],
      },
      {
        id: "hand-shaping",
        artifactSprite: "/artifacts/cham-shaping.webp",
        label: { vi: "Tạo hình không bàn xoay", en: "Shaping without a wheel" },
        kicker: { vi: "Người thợ đi quanh sản phẩm", en: "The maker moves around the piece" },
        story: {
          vi: "Người phụ nữ đi vòng quanh sản phẩm để tạo hình. Kỹ năng được truyền cho thế hệ trẻ qua thực hành trực tiếp trong gia đình.",
          en: "Women move around the piece as they shape it. Knowledge passes to younger generations through hands-on practice within families.",
        },
        facts: [
          { vi: "Hoạt ảnh chỉ chỉ ra hướng chuyển động tổng quát.", en: "The animation shows only the general direction of movement." },
          { vi: "Không phải bài dạy nghề và không tái tạo bí quyết hạn chế.", en: "It is not craft instruction and reproduces no restricted know-how." },
          { vi: "Điểm khác biệt được hồ sơ nhấn mạnh là người thợ di chuyển quanh khối đất thay vì đặt sản phẩm trên bàn xoay.", en: "The file emphasizes that the maker moves around the clay rather than placing the vessel on a wheel." },
          { vi: "Kỹ năng được phụ nữ truyền cho thế hệ trẻ qua quan sát và thực hành trực tiếp trong gia đình.", en: "Women transmit the skill to younger generations through observation and hands-on family practice." },
          { vi: "Hand tracking trong game chỉ điều khiển góc nhìn và hình khối minh họa; không chấm điểm hay suy diễn tay nghề của người chơi.", en: "In-game hand tracking controls only the illustrative view and form; it neither scores nor infers the player's craft skill." },
        ],
        x: 49, y: 58, radius: 14, interaction: "animation", sourceIds: ["unesco-cham-pottery-01574"],
        media: { kind: "animation" },
        audioPreview: clayWorkRecording,
        suggestedQuestions: [
          { vi: "Người thợ tạo hình sản phẩm khi không dùng bàn xoay như thế nào?", en: "How does the maker shape a vessel without using a wheel?" },
          { vi: "Kỹ năng làm gốm được truyền trong gia đình qua thực hành ra sao?", en: "How is pottery knowledge transmitted through hands-on family practice?" },
          { vi: "Vì sao hoạt ảnh và hiệu ứng này không được xem là bài dạy nghề?", en: "Why are this animation and effect not a craft tutorial?" },
        ],
      },
      {
        id: "open-firing",
        artifactSprite: "/artifacts/cham-firing.webp",
        label: { vi: "Nung ngoài trời", en: "Open-air firing" },
        kicker: { vi: "Không men, củi và rơm", en: "Unglazed, with wood and straw" },
        story: {
          vi: "Sản phẩm không tráng men và được nung ngoài trời bằng củi, rơm trong khoảng bảy đến tám giờ, ở nhiệt độ khoảng 800°C theo hồ sơ UNESCO.",
          en: "The unglazed pottery is fired outdoors with wood and straw for roughly seven to eight hours at about 800°C, according to UNESCO.",
        },
        facts: [
          { vi: "Thông tin là mô tả tư liệu, không phải hướng dẫn an toàn để tự thực hiện.", en: "This is documentary context, not safety guidance for attempting the process." },
          { vi: "Di sản được ghi vào Danh sách cần bảo vệ khẩn cấp năm 2022.", en: "The element entered the Urgent Safeguarding List in 2022." },
          { vi: "Theo hồ sơ UNESCO, sản phẩm không tráng men; củi và rơm được dùng trong lần nung ngoài trời kéo dài khoảng bảy đến tám giờ.", en: "According to UNESCO, the pottery is unglazed and wood and straw are used in an outdoor firing lasting roughly seven to eight hours." },
          { vi: "Mốc khoảng 800°C là dữ kiện mô tả của hồ sơ, không bao hàm điều kiện an toàn, lựa chọn nhiên liệu hay kinh nghiệm kiểm soát lửa.", en: "The approximately 800°C figure is documentary context and does not include safety conditions, fuel choices or fire-control experience." },
          { vi: "Âm thanh đi kèm là bản ghi lửa thật CC0 để tạo bối cảnh; không phải tư liệu của một lần nung gốm Chăm cụ thể.", en: "The accompanying sound is a real CC0 fire recording for context, not documentation of a specific Chăm firing." },
        ],
        x: 78, y: 73, radius: 14, interaction: "animation", sourceIds: ["unesco-cham-pottery-01574"],
        media: { kind: "animation" },
        audioPreview: openFireRecording,
        suggestedQuestions: [
          { vi: "Hồ sơ mô tả quá trình nung ngoài trời ở mức khái quát ra sao?", en: "How does the file describe open-air firing at a general level?" },
          { vi: "Vì sao dữ kiện về thời gian và nhiệt độ không phải hướng dẫn tự thực hiện?", en: "Why are the stated time and temperature not instructions for attempting the process?" },
          { vi: "Việc vào Danh sách cần bảo vệ khẩn cấp năm 2022 có ý nghĩa gì?", en: "What does inscription on the Urgent Safeguarding List in 2022 mean?" },
        ],
      },
    ],
  },
  {
    id: "don-ca-tai-tu",
    number: "05",
    location: { vi: "Nam Bộ", en: "Southern Viet Nam" },
    title: { vi: "Đờn ca tài tử", en: "Đờn ca tài tử" },
    subtitle: { vi: "Giai điệu khung và sự ứng tác tinh tế", en: "Skeletal melody and subtle improvisation" },
    description: {
      vi: "Loại hình âm nhạc có gốc bác học và dân gian, gắn với đời sống, lao động trên đất và sông nước Nam Bộ.",
      en: "With scholarly and folk roots, this music is closely connected to life and work across southern lands and waterways.",
    },
    scene: "/scenes/05-don-ca-tai-tu.webp",
    palette: "#42a9a3",
    sourceIds: ["unesco-don-ca-tai-tu-00733"],
    soundscape: soundscapes["don-ca-tai-tu"],
    hotspots: [
      {
        id: "moon-lute",
        artifactSprite: "/artifacts/tai-tu-dan-kim.webp",
        label: { vi: "Đàn kìm", en: "Moon-shaped lute" },
        kicker: { vi: "Một nhạc cụ trong dàn tài tử", en: "One voice in the tài tử ensemble" },
        story: {
          vi: "UNESCO liệt kê đàn hình mặt trăng cùng đàn cò, đàn tranh, đàn tỳ bà, đàn bầu, sáo trúc và bộ gõ trong thực hành Đờn ca tài tử.",
          en: "UNESCO lists the moon-shaped lute alongside fiddle, zither, pear-shaped lute, monochord, bamboo flute and percussion.",
        },
        facts: [
          { vi: "Mỗi nhạc cụ tham gia vào việc biến hóa giai điệu khung.", en: "Each instrument contributes to variations of the skeletal melody." },
          { vi: "Hình minh họa không phải sơ đồ cấu tạo nhạc cụ.", en: "The illustration is not an instrument construction diagram." },
          { vi: "Đàn kìm là một thành viên trong dàn, không hoạt động như một lớp âm thanh tách biệt khỏi sự phối hợp và ứng tác chung.", en: "Đàn kìm is one voice in the ensemble rather than a sound layer detached from collective coordination and improvisation." },
          { vi: "Nhạc công học cách biến hóa giai điệu khung và mẫu tiết tấu để biểu đạt sắc thái cảm xúc.", en: "Musicians learn to vary skeletal melodies and principal rhythmic patterns to express emotional nuance." },
          { vi: "Game chưa phát tiếng đàn kìm riêng vì chưa tìm được bản ghi có quyền tái sử dụng rõ ràng; tư liệu chính thức được mở tại nguồn UNESCO.", en: "The game does not play an isolated đàn kìm recording because no clearly reusable source was found; official media opens at UNESCO." },
        ],
        x: 21, y: 69, radius: 13, interaction: "audio", sourceIds: ["unesco-don-ca-tai-tu-00733"],
        media: { kind: "official-link", sourceUrl: "https://ich.unesco.org/en/RL/art-of-n-ca-tai-t-music-and-song-in-southern-viet-nam-00733" },
        audioPreview: donCaOfficialRecording,
        suggestedQuestions: [
          { vi: "Đàn kìm đứng cùng những nhạc cụ nào trong dàn tài tử?", en: "Which instruments appear alongside đàn kìm in the tài tử ensemble?" },
          { vi: "Mỗi nhạc cụ góp phần biến hóa giai điệu khung như thế nào?", en: "How does each instrument contribute to variations of the skeletal melody?" },
          { vi: "Vì sao hình pixel không được dùng như sơ đồ cấu tạo đàn kìm?", en: "Why should the pixel image not be read as an instrument-construction diagram?" },
        ],
      },
      {
        id: "sixteen-string-zither",
        artifactSprite: "/artifacts/tai-tu-dan-tranh.webp",
        label: { vi: "Đàn tranh", en: "Sixteen-string zither" },
        kicker: { vi: "Biến hóa trên giai điệu khung", en: "Variation over a skeletal melody" },
        story: {
          vi: "Người diễn tấu ứng tác, thêm hoa mỹ và biến đổi giai điệu khung cùng các mẫu tiết tấu chính để diễn đạt cảm xúc.",
          en: "Performers improvise, ornament and vary a skeletal melody and principal rhythmic patterns to express different feelings.",
        },
        facts: [
          { vi: "Nhạc công thường cần ít nhất ba năm để học kỹ thuật cơ bản và các điệu thức.", en: "Musicians generally study at least three years to learn basic technique and musical modes." },
          { vi: "Bản ghi chính thức được mở tại hồ sơ UNESCO.", en: "The official recording opens at the UNESCO file." },
          { vi: "Trong thực hành tài tử, đàn tranh tham gia biến hóa giai điệu khung cùng các nhạc cụ khác thay vì lặp lại một bản cố định.", en: "Within tài tử practice, đàn tranh joins other instruments in varying a skeletal melody rather than repeating a fixed score." },
          { vi: "Ứng tác vẫn dựa trên điệu thức, mẫu tiết tấu và tri thức học trực tiếp; tự do biểu đạt không đồng nghĩa tùy ý ngoài truyền thống.", en: "Improvisation remains grounded in modes, rhythmic patterns and directly learned knowledge; expressive freedom is not arbitrary invention." },
          { vi: "Đoạn nghe là bản ghi thực địa lúc chỉnh dây một nhạc cụ giống đàn tranh tại Hội An; không phải tiết mục Đờn ca tài tử mẫu.", en: "The preview is a field recording of tuning a zither-like đàn tranh instrument in Hội An, not a model Đờn ca tài tử performance." },
        ],
        x: 51, y: 79, radius: 14, interaction: "audio", sourceIds: ["unesco-don-ca-tai-tu-00733"],
        media: { kind: "official-link", sourceUrl: "https://ich.unesco.org/en/RL/art-of-n-ca-tai-t-music-and-song-in-southern-viet-nam-00733" },
        audioPreview: danTranhFieldRecording,
        suggestedQuestions: [
          { vi: "Người diễn tấu biến hóa giai điệu khung bằng cách nào?", en: "How do performers vary and ornament the skeletal melody?" },
          { vi: "Ứng tác giúp nhạc công diễn đạt cảm xúc khác nhau ra sao?", en: "How does improvisation help musicians express different feelings?" },
          { vi: "Vì sao người học thường cần ít nhất ba năm cho kỹ thuật cơ bản và điệu thức?", en: "Why do learners generally need at least three years for basic technique and modes?" },
        ],
      },
      {
        id: "riverside-ensemble",
        artifactSprite: "/artifacts/tai-tu-riverside.webp",
        label: { vi: "Cuộc đàn bên sông", en: "Riverside gathering" },
        kicker: { vi: "Âm nhạc trong đời sống cộng đồng", en: "Music within community life" },
        story: {
          vi: "Đờn ca tài tử hiện diện trong lễ hội, giỗ chạp và những dịp mừng; âm nhạc gợi lại đời sống và lao động trên đất, sông nước đồng bằng.",
          en: "Đờn ca tài tử appears at festivals, death anniversaries and celebrations, evoking life and work across the Mekong Delta’s lands and rivers.",
        },
        facts: [
          { vi: "Tri thức truyền bằng nghe, bắt chước và học trực tiếp từ thầy.", en: "Knowledge passes through listening, imitation and direct study with masters." },
          { vi: "Không gian minh họa đại diện cho tính thân mật, không phải một sự kiện cụ thể.", en: "The illustrated setting conveys intimacy, not a specific event." },
          { vi: "UNESCO ghi nhận Đờn ca tài tử trong lễ hội, giỗ chạp và các dịp mừng, gắn với cộng đồng ở cả không gian đất liền lẫn sông nước Nam Bộ.", en: "UNESCO records Đờn ca tài tử at festivals, death anniversaries and celebrations across southern land and river communities." },
          { vi: "Người nghe và người diễn có thể gặp nhau trong không gian gần gũi; giá trị nằm ở trao truyền, ứng tác và quan hệ cộng đồng, không chỉ ở sân khấu.", en: "Listeners and performers may meet in intimate settings; its value lies in transmission, improvisation and community relationships, not only staged presentation." },
          { vi: "Cảnh bên sông là ẩn dụ thị giác của game, không được coi là tư liệu về một cuộc đàn, địa điểm hay nhóm nghệ nhân cụ thể.", en: "The riverside scene is a visual game metaphor, not documentation of a specific session, place or practitioner group." },
        ],
        x: 77, y: 57, radius: 13, interaction: "story", sourceIds: ["unesco-don-ca-tai-tu-00733"],
        media: { kind: "official-link", sourceUrl: "https://ich.unesco.org/en/RL/art-of-n-ca-tai-t-music-and-song-in-southern-viet-nam-00733" },
        audioPreview: donCaOfficialRecording,
        suggestedQuestions: [
          { vi: "Đờn ca tài tử hiện diện trong những dịp cộng đồng nào?", en: "Which community occasions include Đờn ca tài tử?" },
          { vi: "Âm nhạc gợi lại đời sống và lao động sông nước Nam Bộ như thế nào?", en: "How does the music evoke life and work across southern waterways?" },
          { vi: "Tri thức được truyền qua nghe, bắt chước và học trực tiếp với thầy ra sao?", en: "How is knowledge transmitted through listening, imitation and direct study with masters?" },
        ],
      },
    ],
  },
];

export function getStop(id: string) {
  return stops.find((stop) => stop.id === id);
}

export function getSource(id: string) {
  return sources.find((source) => source.id === id);
}

export const approvedSourceIds = new Set(sources.filter((source) => source.status === "approved").map((source) => source.id));
