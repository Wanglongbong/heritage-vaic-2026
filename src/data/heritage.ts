/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeritageStop, SourceRecord, AudioAsset } from '../types';

export const SOURCE_REGISTRY: Record<string, SourceRecord> = {
  'unesco-quan-ho': {
    id: 'unesco-quan-ho',
    title: {
      vi: 'Hồ sơ Di sản Quan họ Bắc Ninh',
      en: 'Quan Họ Bắc Ninh folk songs UNESCO Dossier',
    },
    institution: 'UNESCO Intangible Cultural Heritage',
    url: 'https://ich.unesco.org/en/RL/quan-h-bc-ninh-folk-songs-00183',
    accessedAt: '2026-08-25',
    status: 'approved',
    reviewedBy: 'UNESCO Committee for the Safeguarding of the Intangible Cultural Heritage (4.COM 13.43)',
    rights: {
      vi: 'Tư liệu công bố bởi UNESCO cho mục đích giáo dục và bảo tồn di sản phi vật thể.',
      en: 'UNESCO published documentation for educational and heritage safeguarding purposes.',
    },
  },
  'bac-ninh-culture-2025': {
    id: 'bac-ninh-culture-2025',
    title: {
      vi: 'Chương trình nghệ thuật Dân ca Quan họ Bắc Ninh trên thuyền',
      en: 'Bắc Ninh Quan Họ Folk Singing on Boats Art Program (2025)',
    },
    institution: 'Sở Văn hóa, Thể thao và Du lịch tỉnh Bắc Ninh',
    url: 'https://svhttdl.bacninh.gov.vn/vi/news/-/details/188850/chuong-trinh-nghe-thuat-hat-dan-ca-quan-ho-tren-thuyen-tai-le-hoi-trai-cay-bac-ninh-2025-81095830',
    accessedAt: '2026-08-25',
    status: 'approved',
    reviewedBy: 'Cổng thông tin Sở VHTT&DL Bắc Ninh',
    rights: {
      vi: 'Danh mục tên tiết mục công khai; không sao chép trái phép toàn văn lời ca.',
      en: 'Public performance repertoire listing; no unauthorized full lyrics reproduction.',
    },
  },
  'unesco-ca-tru': {
    id: 'unesco-ca-tru',
    title: {
      vi: 'Hồ sơ Di sản Ca trù',
      en: 'Ca trù singing UNESCO In Need of Urgent Safeguarding Dossier',
    },
    institution: 'UNESCO Intangible Cultural Heritage',
    url: 'https://ich.unesco.org/en/USL/ca-tru-singing-00309',
    accessedAt: '2026-08-25',
    status: 'approved',
    reviewedBy: 'UNESCO Committee (4.COM 14.10)',
    rights: {
      vi: 'Tư liệu di sản cần bảo vệ khẩn cấp của UNESCO.',
      en: 'UNESCO Urgent Safeguarding List documentation.',
    },
  },
  'wikimedia-ca-tru-soundfutures': {
    id: 'wikimedia-ca-tru-soundfutures',
    title: {
      vi: 'Bản ghi biểu diễn Câu lạc bộ Ca trù Hà Nội (Sound Futures)',
      en: 'Ca Tru Club performance by Sound Futures',
    },
    institution: 'Wikimedia Commons / Sound Futures Project',
    url: 'https://commons.wikimedia.org/wiki/File:Ca_Tru_Club_performance.ogv',
    accessedAt: '2026-08-25',
    status: 'approved',
    reviewedBy: 'Sound Futures Project (CC BY 3.0)',
    rights: {
      vi: 'Bản quyền CC BY 3.0 bởi Sound Futures. Bản ghi hòa tấu gồm giọng ca, đàn đáy và trống chầu.',
      en: 'Creative Commons Attribution 3.0 by Sound Futures. Ensemble recording featuring vocals, đàn đáy, and drum.',
    },
  },
  'unesco-nha-nhac': {
    id: 'unesco-nha-nhac',
    title: {
      vi: 'Hồ sơ Di sản Nhã nhạc, âm nhạc cung đình Việt Nam',
      en: 'Nhã nhạc, Vietnamese court music UNESCO Dossier',
    },
    institution: 'UNESCO Intangible Cultural Heritage',
    url: 'https://ich.unesco.org/en/RL/nha-nhac-vietnamese-court-music-00074',
    accessedAt: '2026-08-25',
    status: 'approved',
    reviewedBy: 'UNESCO Masterpiece of Oral and Intangible Heritage of Humanity (Incorporated 2008)',
    rights: {
      vi: 'Tư liệu chính thức lưu trữ bảo tồn nhã nhạc cung đình Huế.',
      en: 'Official archival safeguarding documentation for Huế court music.',
    },
  },
  'unesco-cham-pottery': {
    id: 'unesco-cham-pottery',
    title: {
      vi: 'Hồ sơ Nghệ thuật làm gốm của người Chăm',
      en: 'Art of pottery-making of Chăm people UNESCO Dossier',
    },
    institution: 'UNESCO Intangible Cultural Heritage',
    url: 'https://ich.unesco.org/en/USL/art-of-pottery-making-of-chm-people-01574',
    accessedAt: '2026-08-25',
    status: 'approved',
    reviewedBy: 'UNESCO Urgent Safeguarding List (17.COM 7.b.8, 2022)',
    rights: {
      vi: 'Hồ sơ di sản cần bảo vệ khẩn cấp; ghi nhận tri thức dân gian tại làng Bàu Trúc và Bình Đức.',
      en: 'UNESCO Urgent Safeguarding List; documents community indigenous knowledge in Bàu Trúc and Bình Đức.',
    },
  },
  'freesound-clay-fire': {
    id: 'freesound-clay-fire',
    title: {
      vi: 'Âm cảnh giáo dục: Thao tác đất sét và lửa ngoài trời',
      en: 'Educational Soundscape: Clay crafting and open fire elements',
    },
    institution: 'Freesound Archive (manuelaurreaf, CC BY 4.0 & kingsrow, CC0 1.0)',
    url: 'https://freesound.org',
    accessedAt: '2026-08-25',
    status: 'approved',
    reviewedBy: 'Curated Open Audio Soundscape Registry',
    rights: {
      vi: 'Âm cảnh giáo dục mô phỏng từ nguồn CC BY 4.0 và CC0 1.0; không phải bản ghi xưởng Chăm hoặc bí quyết nghề.',
      en: 'Educational audio simulation under CC BY 4.0 and CC0; not an on-site artisan recording or craft secret.',
    },
  },
  'unesco-don-ca-tai-tu': {
    id: 'unesco-don-ca-tai-tu',
    title: {
      vi: 'Hồ sơ Nghệ thuật Đờn ca tài tử Nam Bộ',
      en: 'Art of Đờn ca tài tử music and song in southern Viet Nam Dossier',
    },
    institution: 'UNESCO Intangible Cultural Heritage',
    url: 'https://ich.unesco.org/en/RL/art-of-n-ca-tai-t-music-and-song-in-southern-viet-nam-00733',
    accessedAt: '2026-08-25',
    status: 'approved',
    reviewedBy: 'UNESCO Representative List (8.COM 8.25, 2013)',
    rights: {
      vi: 'Tư liệu UNESCO lưu giữ nghệ thuật âm nhạc thính phòng dân gian Nam Bộ.',
      en: 'UNESCO representative documentation of Southern Vietnamese chamber folk art.',
    },
  },
};

export const AUDIO_ASSETS: Record<string, AudioAsset> = {
  'quan-ho-unlock': {
    id: 'quan-ho-unlock',
    kind: 'recorded',
    src: '/media/quan-ho-unlock.ogg',
    sourceUrl: 'https://svhttdl.bacninh.gov.vn',
    creator: 'Cộng đồng nghệ nhân Quan họ Kinh Bắc',
    license: 'Public Educational Heritage Access',
    credit: {
      vi: 'Trích đoạn hòa giọng Quan họ truyền thống (bản ghi hòa tấu cả nhóm)',
      en: 'Traditional Quan Họ vocal ensemble excerpt (group recording)',
    },
    role: 'heritage-ensemble-excerpt',
    reviewStatus: 'approved',
    note: {
      vi: 'Bản trích đoạn hòa tấu cả nhóm gồm liền anh liền chị, không phải âm thanh riêng của một vật phẩm đơn lẻ.',
      en: 'Group ensemble excerpt featuring male and female singers; not an isolated single artifact sound.',
    },
    durationSeconds: 90,
  },
  'ca-tru-unlock': {
    id: 'ca-tru-unlock',
    kind: 'recorded',
    src: '/media/ca-tru-sound-futures.ogg',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ca_Tru_Club_performance.ogv',
    creator: 'Sound Futures Project',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    credit: {
      vi: 'Sound Futures Project · Ca Trù Club performance (CC BY 3.0)',
      en: 'Sound Futures Project · Ca Trù Club performance (CC BY 3.0)',
    },
    role: 'heritage-ensemble-excerpt',
    reviewStatus: 'approved',
    note: {
      vi: 'Bản ghi hòa tấu nguyên bản 22s gồm ca nương hát gõ phách, kép đàn đáy và quan viên cầm chầu.',
      en: 'Authentic 22s ensemble recording featuring singer with phách clapper, đàn đáy lute, and praise drum.',
    },
    durationSeconds: 22,
  },
  'nha-nhac-unlock': {
    id: 'nha-nhac-unlock',
    kind: 'recorded',
    src: '/media/nha-nhac-unlock.ogg',
    sourceUrl: 'https://ich.unesco.org/en/RL/nha-nhac-vietnamese-court-music-00074',
    creator: 'Dàn nhạc Cung đình Huế',
    license: 'UNESCO Archival Heritage Documentation',
    credit: {
      vi: 'Bản ghi hòa tấu Đại nhạc và Tiểu nhạc Cung đình Huế',
      en: 'Huế Court Music Great and Small Ensemble archival excerpt',
    },
    role: 'heritage-ensemble-excerpt',
    reviewStatus: 'approved',
    note: {
      vi: 'Trích đoạn hòa tấu dàn nhạc cung đình gồm bộ gõ trống, kèn và dây trong không gian nghi lễ trang nghiêm.',
      en: 'Court ensemble excerpt showcasing ceremonial drum layers, wind, and strings in ritual harmony.',
    },
    durationSeconds: 100,
  },
  'cham-pottery-unlock': {
    id: 'cham-pottery-unlock',
    kind: 'simulated',
    src: '/media/cham-workyard-unlock.ogg',
    sourceUrl: 'https://freesound.org',
    creator: 'Manuel Aurreaf (CC BY 4.0) & Kingsrow (CC0)',
    license: 'CC BY 4.0 / CC0',
    credit: {
      vi: 'Phối âm giáo dục: Tiếng miết đất sét và than lửa ngoài trời',
      en: 'Educational audio synthesis: Clay shaping and open bonfire soundscape',
    },
    role: 'educational-soundscape',
    reviewStatus: 'approved',
    note: {
      vi: 'Mô phỏng âm cảnh giáo dục, không phải tư liệu tại xưởng Chăm, nghi lễ hoặc hướng dẫn bí quyết nghề.',
      en: 'Educational soundscape simulation; not an on-site recording of Chăm artisans, rituals, or trade secrets.',
    },
    durationSeconds: 35,
  },
  'tai-tu-unlock': {
    id: 'tai-tu-unlock',
    kind: 'recorded',
    src: '/media/don-ca-tai-tu-unlock.ogg',
    sourceUrl: 'https://ich.unesco.org/en/RL/art-of-n-ca-tai-t-music-and-song-in-southern-viet-nam-00733',
    creator: 'Ban Đờn ca tài tử Nam Bộ',
    license: 'Public Heritage Documentation',
    credit: {
      vi: 'Trích đoạn cuộc đàn hòa tấu giọng nữ, đàn kìm và đàn tranh Nam Bộ',
      en: 'Southern chamber ensemble excerpt: Female vocal, đàn kìm moon lute, and đàn tranh zither',
    },
    role: 'heritage-ensemble-excerpt',
    reviewStatus: 'approved',
    note: {
      vi: 'Bản ghi cuộc đàn trọn vẹn gồm giọng hát nữ hòa cùng các nhạc cụ thính phòng; không dính lời bình giới thiệu.',
      en: 'Complete chamber ensemble excerpt featuring female vocal and instruments; free from commentary voiceover.',
    },
    durationSeconds: 90,
  },
};

export const HERITAGE_STOPS: HeritageStop[] = [
  {
    id: 'quan-ho',
    number: '01',
    location: {
      vi: 'Bắc Ninh · Bắc Giang',
      en: 'Bắc Ninh · Bắc Giang',
    },
    title: {
      vi: 'Quan họ Kinh Bắc',
      en: 'Quan Họ Folk Songs of Kinh Bắc',
    },
    subtitle: {
      vi: 'Lời mời, câu đối đáp, cuộc chia tay',
      en: 'The Invitation, Antiphonal Response, and Farewell',
    },
    description: {
      vi: 'Nghệ thuật ca hát dân gian đối đáp trữ tình của vùng Kinh Bắc, gắn liền với tập quán kết chạ giữa các làng và lối ứng xử trọng tình nghĩa.',
      en: 'A lyric folk singing tradition from Kinh Bắc region, rooted in village twinning alliances and profound mutual respect.',
    },
    sceneImage: '/scenes/01-quan-ho.webp',
    palette: {
      primary: '#f0b07a',
      accent: '#d97706',
      glow: 'rgba(240, 176, 122, 0.45)',
      darkBg: '#1c130c',
    },
    sourceIds: ['unesco-quan-ho', 'bac-ninh-culture-2025'],
    soundscapeType: 'quanho-ambient',
    hotspots: [
      {
        id: 'quan-ho-hat',
        label: {
          vi: 'Nón quai thao',
          en: 'Nón Quai Thao (Flat Palm Hat)',
        },
        kicker: {
          vi: 'Trang phục trong không gian hát',
          en: 'Attire in the Singing Space',
        },
        story: {
          vi: 'Chiếc nón quai thao với vành rộng duyên dáng, đi kèm dải quai thao thao lụa mềm mại, là vật bất ly thân của các liền chị trong những buổi hội làng Kinh Bắc.',
          en: 'The large flat palm hat adorned with silk tassel ribbons is the iconic emblem worn by female Quan Họ singers during village festivals.',
        },
        facts: [
          {
            vi: 'Hồ sơ UNESCO ghi nhận phụ nữ truyền thống đội nón tròn lớn (nón quai thao) và quàng khăn mỏ quạ; nam giới mặc áo dài năm thân, khăn xếp và mang ô đen.',
            en: 'UNESCO dossier notes women traditionally wear large circular flat hats with crow-beak headscarves; men wear five-part tunics, folded turbans, and carry black umbrellas.',
          },
          {
            vi: 'Nón vừa để che nắng mưa trên bến đò, vừa là đạo cụ tinh tế che nửa nụ cười e ấp khi cất tiếng hát giao duyên.',
            en: 'The hat served both as shade by the river ferry and as a graceful prop subtly framing the singer during poetic exchanges.',
          },
          {
            vi: 'Lưu ý giám tuyển: Minh họa pixel mang tính ước lệ giáo dục, không thể hiện toàn bộ biến thể thủ công từng làng nghề làm nón Chuông hay làng quan họ.',
            en: 'Curatorial note: The pixel illustration is an educational rendering and does not capture every regional craft nuance of historic hat making villages.',
          },
        ],
        x: 23,
        y: 78,
        radius: 13,
        sprite: '/artifacts/quan-ho-hat.webp',
        views: {
          front: '/artifacts/turn/quan-ho-hat-front.webp',
          right: '/artifacts/turn/quan-ho-hat-right.webp',
          back: '/artifacts/turn/quan-ho-hat-back.webp',
          left: '/artifacts/turn/quan-ho-hat-left.webp',
        },
        sourceIds: ['unesco-quan-ho'],
        audioPreview: {
          title: {
            vi: 'Tiếng dải thao và gió đồng Kinh Bắc',
            en: 'Whisper of Silk Tassels & River Breeze',
          },
          note: {
            vi: 'Âm thanh mô phỏng gió sông Cầu và nhịp bước chân hội làng.',
            en: 'Simulated ambient sound of the Cầu River breeze and festive steps.',
          },
          soundType: 'silk-breeze',
        },
      },
      {
        id: 'quan-ho-singing',
        label: {
          vi: 'Lối hát đối đáp',
          en: 'Antiphonal Singing Practice',
        },
        kicker: {
          vi: 'Nghệ thuật giao tiếp cộng đồng',
          en: 'Community Dialogue & Alliance',
        },
        story: {
          vi: 'Quan họ không đơn thuần là âm nhạc mà là một hệ thống ứng xử văn hóa hoàn chỉnh. Hai liền chị làng này cất giọng hòa quyện; hai liền anh làng kết chạ lập tức đối lại bằng làn điệu tương xứng.',
          en: 'Quan Họ is a complete cultural behavioral system. Two female singers from one village blend their voices, met immediately by two male counterparts from a twinned village.',
        },
        facts: [
          {
            vi: 'Kỹ thuật hát đòi hỏi bốn tiêu chí: "Vang - Rền - Nền - Nảy", tạo nên âm sắc đằm thắm, rung luyến đặc trưng mà không cần nhạc cụ đệm.',
            en: 'Traditional vocal technique mandates four criteria: Resonant, Roaring, Grounded, and Bouncing, achieving rich natural resonance without instrumental accompaniment.',
          },
          {
            vi: 'Mối quan hệ kết chạ giữa các làng Quan họ là thiêng liêng; liền anh liền chị các làng kết chạ theo tục xưa không lấy nhau để giữ tình bạn trong sáng muôn đời.',
            en: 'Village twinning alliances were sacred; custom forbade singers of twinned villages from marrying each other to preserve lifelong fraternal bonds.',
          },
        ],
        x: 50,
        y: 51,
        radius: 12,
        sprite: '/artifacts/quan-ho-singing.webp',
        views: {
          front: '/artifacts/turn/quan-ho-singing-front.webp',
          right: '/artifacts/turn/quan-ho-singing-right.webp',
          back: '/artifacts/turn/quan-ho-singing-back.webp',
          left: '/artifacts/turn/quan-ho-singing-left.webp',
        },
        sourceIds: ['unesco-quan-ho'],
        audioPreview: {
          title: {
            vi: 'Âm sắc hòa giọng mộc',
            en: 'Acapella Vocal Harmony Layer',
          },
          note: {
            vi: 'Mô phỏng hòa âm mộc đối xứng giữa hai bè liền anh và liền chị.',
            en: 'Harmonic acoustic demonstration of paired antiphonal singing.',
          },
          soundType: 'vocal-harmony',
        },
      },
      {
        id: 'quan-ho-book',
        label: {
          vi: 'Kho lời ca & Làn điệu',
          en: 'Song Repertoire & Melodic Modes',
        },
        kicker: {
          vi: 'Di sản truyền khẩu vô giá',
          en: 'Invaluable Oral Tradition',
        },
        story: {
          vi: 'Kho tàng dân ca Quan họ lưu giữ hàng trăm bài ca với vô số dị bản giai điệu, được truyền khẩu qua các thế hệ nghệ nhân bằng lối học truyền ngón, truyền khẩu tỉ mỉ.',
          en: 'The Quan Họ repertoire safeguards hundreds of poetic songs across multiple melodic variations, transmitted orally through master-apprentice generations.',
        },
        facts: [
          {
            vi: 'Hồ sơ UNESCO ghi nhận cộng đồng lưu giữ hơn 400 bài ca và 213 biến thể giai điệu khác nhau với các chặng hát: Giọng lề lối, Giọng vặt, Giọng giã bạn.',
            en: 'UNESCO dossier officially records over 400 song lyrics and 213 distinct melodic variations spanning formal, secular, and farewell stages.',
          },
          {
            vi: 'Các bài ca chứa đựng triết lý nhân sinh sâu sắc, ngôn từ tao nhã mượn hình ảnh trầu cau, mái đò, cây trúc để gửi gắm tình cảm thủy chung.',
            en: 'Songs encapsulate profound philosophy and poetic metaphors—betel nuts, ferry boats, and bamboo stalks—expressing enduring loyalty.',
          },
        ],
        x: 82,
        y: 79,
        radius: 11,
        sprite: '/artifacts/quan-ho-book.webp',
        views: {
          front: '/artifacts/turn/quan-ho-book-front.webp',
          right: '/artifacts/turn/quan-ho-book-right.webp',
          back: '/artifacts/turn/quan-ho-book-back.webp',
          left: '/artifacts/turn/quan-ho-book-left.webp',
        },
        sourceIds: ['unesco-quan-ho', 'bac-ninh-culture-2025'],
      },
    ],
    unlock: {
      requiredHotspotIds: ['quan-ho-hat', 'quan-ho-singing', 'quan-ho-book'],
      title: {
        vi: 'Khúc ca giã bạn Kinh Bắc',
        en: 'Farewell Melodies of Kinh Bắc',
      },
      message: {
        vi: 'Toàn bộ sắc màu của bến đò sông Cầu và không gian Quan họ đã bừng sáng. Bản hòa tấu của cộng đồng liền anh liền chị đã sẵn sàng.',
        en: 'The colors of the historic river landing and singing courtyard are awakened. The ensemble recording is now unlocked.',
      },
      audio: AUDIO_ASSETS['quan-ho-unlock'],
    },
  },
  {
    id: 'ca-tru',
    number: '02',
    location: {
      vi: 'Hà Nội · Bắc Bộ',
      en: 'Hà Nội · Northern Region',
    },
    title: {
      vi: 'Ca trù',
      en: 'Ca Trù Chamber Singing',
    },
    subtitle: {
      vi: 'Thơ hát, phách và tiếng trống thưởng',
      en: 'Sung Poetry, Clapper Rhythm, and Praise Drum',
    },
    description: {
      vi: 'Hình thức nghệ thuật diễn xướng bác học kết hợp đỉnh cao giữa thi ca chữ Hán - chữ Nôm, cây đàn đáy ba dây và nhịp phách giòn tan của đào nương.',
      en: 'A sophisticated chamber art merging classical Vietnamese poetry, the three-stringed đàn đáy lute, and the sharp rhythm of the wooden phách clapper.',
    },
    sceneImage: '/scenes/02-ca-tru.webp',
    palette: {
      primary: '#e0533c',
      accent: '#991b1b',
      glow: 'rgba(224, 83, 60, 0.45)',
      darkBg: '#1a0d0a',
    },
    sourceIds: ['unesco-ca-tru', 'wikimedia-ca-tru-soundfutures'],
    soundscapeType: 'catru-ambient',
    hotspots: [
      {
        id: 'ca-tru-dan-day',
        label: {
          vi: 'Đàn đáy',
          en: 'Đàn Đáy (Three-Stringed Lute)',
        },
        kicker: {
          vi: 'Tiếng trầm nâng đỡ lời thơ',
          en: 'Mellow Bass Anchoring Sung Poetry',
        },
        story: {
          vi: 'Đàn đáy là nhạc cụ độc nhất vô nhị chỉ có trong văn hóa Việt Nam, với cần đàn dài hơn 1 mét và thân đàn khoét rỗng đáy, tạo âm sắc trầm đục, kín đáo và u hoài.',
          en: 'The đàn đáy is uniquely indigenous to Vietnam, featuring a meter-long neck and bottomless soundbox that generates a profound, muffled bass timbre.',
        },
        facts: [
          {
            vi: 'Đàn có 3 dây tơ và phím bấm rất cao, cho phép kép đàn nhấn nhá ngón vuốt, ngón mổ, tạo nên sự biến ảo tinh tế theo từng chữ của lời thơ.',
            en: 'Equipped with 3 silk strings and high raised frets, enabling the master musician to execute delicate slurs, bends, and ornamental microtones.',
          },
          {
            vi: 'Lưu ý âm thanh: Trong nghệ thuật Ca trù, đàn đáy luôn hòa cùng phách và giọng hát; không phát một bản hòa tấu và gắn nhãn là âm thanh riêng của đàn đáy.',
            en: 'Audio note: In Ca trù, the đàn đáy always performs in intimate dialogue with the phách clapper and vocal; an ensemble piece is never mislabeled as solo lute.',
          },
        ],
        x: 24,
        y: 78,
        radius: 13,
        sprite: '/artifacts/ca-tru-dan-day.webp',
        views: {
          front: '/artifacts/turn/ca-tru-dan-day-front.webp',
          right: '/artifacts/turn/ca-tru-dan-day-right.webp',
          back: '/artifacts/turn/ca-tru-dan-day-back.webp',
          left: '/artifacts/turn/ca-tru-dan-day-left.webp',
        },
        sourceIds: ['unesco-ca-tru'],
      },
      {
        id: 'ca-tru-phach',
        label: {
          vi: 'Bộ phách',
          en: 'Phách Clapper & Bamboo Slats',
        },
        kicker: {
          vi: 'Nhịp gõ của đào nương',
          en: 'The Singer-Clapper Virtuosity',
        },
        story: {
          vi: 'Đào nương (ca nương) vừa cất giọng hát thơ phức tạp, vừa tự tay cầm hai dùi gõ lên bàn phách bằng gỗ hoặc tre, điều khiển toàn bộ cấu trúc nhịp của thể cách.',
          en: 'The lead female vocalist (đào nương) simultaneously delivers intricate vocal poetry while striking the hardwood phách block with two bamboo sticks.',
        },
        facts: [
          {
            vi: 'Bàn phách làm từ gỗ lim hoặc tre đực già, dùi phách gồm một dùi tròn và một dùi vát tạo ra hai âm sắc: "chát" (đanh cao) và "ton" (trầm sâu).',
            en: 'The sounding block is carved from ironwood or matured bamboo, struck with two asymmetric beaters producing distinct high-piercing and low-resonant timbre.',
          },
          {
            vi: 'Kỹ thuật gõ phách đòi hỏi khổ luyện nhiều năm để nhịp phách vừa tuân theo khuôn thước thể cách, vừa buông lơi đồng điệu với hơi thở của ca nương.',
            en: 'Mastering the phách requires rigorous training so that rigid rhythmic meter breathes organically in tandem with vocal phrasing.',
          },
        ],
        x: 52,
        y: 80,
        radius: 11,
        sprite: '/artifacts/ca-tru-phach.webp',
        views: {
          front: '/artifacts/turn/ca-tru-phach-front.webp',
          right: '/artifacts/turn/ca-tru-phach-right.webp',
          back: '/artifacts/turn/ca-tru-phach-back.webp',
          left: '/artifacts/turn/ca-tru-phach-left.webp',
        },
        sourceIds: ['unesco-ca-tru'],
      },
      {
        id: 'ca-tru-drum',
        label: {
          vi: 'Trống chầu',
          en: 'Trống Chầu (Praise Drum)',
        },
        kicker: {
          vi: 'Tiếng khen chê của quan viên',
          en: 'Aesthetic Judgment of the Connoisseur',
        },
        story: {
          vi: 'Người cầm chầu (quan viên) là thính giả tri âm, am hiểu sâu sắc thi ca và âm nhạc, dùng tiếng trống để chấm điểm, khen ngợi câu hát hay hoặc nhắc nhở chỗ lỡ nhịp.',
          en: 'The drum master (quan viên) is an enlightened connoisseur who strikes the praise drum with specific strokes to reward brilliant phrasing or correct timing.',
        },
        facts: [
          {
            vi: 'Tiếng trống chia thành: "Tùng" (đánh trúng mặt trống) và "Rắc" (gõ vào tang trống), kết hợp thành các điểm thưởng "hạ mã", "thượng mã", "rắc đôi".',
            en: 'Drum strokes alternate between "Tùng" (center skin hit) and "Rắc" (rim stick hit), forming codified praise patterns understood by connoisseurs.',
          },
          {
            vi: 'Trống chầu thể hiện sự tôn vinh của người thưởng thức đối với tài năng của nghệ nhân, tạo nên một cuộc đối thoại nghệ thuật ba bên trọn vẹn.',
            en: 'The praise drum embodies active audience critique and appreciation, completing a three-way dynamic between singer, lutenist, and listener.',
          },
        ],
        x: 81,
        y: 72,
        radius: 13,
        sprite: '/artifacts/ca-tru-drum.webp',
        views: {
          front: '/artifacts/turn/ca-tru-drum-front.webp',
          right: '/artifacts/turn/ca-tru-drum-right.webp',
          back: '/artifacts/turn/ca-tru-drum-back.webp',
          left: '/artifacts/turn/ca-tru-drum-left.webp',
        },
        sourceIds: ['unesco-ca-tru', 'wikimedia-ca-tru-soundfutures'],
      },
    ],
    unlock: {
      requiredHotspotIds: ['ca-tru-dan-day', 'ca-tru-phach', 'ca-tru-drum'],
      title: {
        vi: 'Cuộc diễn xướng Ca trù Thăng Long',
        en: 'Thăng Long Ca Trù Chamber Performance',
      },
      message: {
        vi: 'Chiếu diễn Ca trù đã sáng bừng trong ánh nến. Tiếng hát của ca nương, đàn đáy của kép và tiếng trống thưởng của quan viên hòa quyện.',
        en: 'The candlelit Ca Trù chamber is fully illuminated. The triadic dialogue between singer, lutenist, and connoisseur drummer is restored.',
      },
      audio: AUDIO_ASSETS['ca-tru-unlock'],
    },
  },
  {
    id: 'nha-nhac',
    number: '03',
    location: {
      vi: 'Huế',
      en: 'Huế Imperial City',
    },
    title: {
      vi: 'Nhã nhạc cung đình',
      en: 'Nhã Nhạc Vietnamese Court Music',
    },
    subtitle: {
      vi: 'Âm nhạc trong trật tự nghi lễ',
      en: 'Music within the Ceremonial Order',
    },
    description: {
      vi: 'Âm nhạc cung đình chính thống của triều Nguyễn, biểu đạt sự uy nghiêm của vương triều và trật tự vũ trụ qua các đại lễ tế Giao, tế Miếu và thiết triều.',
      en: 'The official orthodox court music of the Nguyễn dynasty, expressing monarchical majesty and cosmic order across dynastic rituals and imperial audiences.',
    },
    sceneImage: '/scenes/03-nha-nhac.webp',
    palette: {
      primary: '#f59e0b',
      accent: '#b45309',
      glow: 'rgba(245, 158, 11, 0.45)',
      darkBg: '#181206',
    },
    sourceIds: ['unesco-nha-nhac'],
    soundscapeType: 'nhanhac-ambient',
    hotspots: [
      {
        id: 'nha-nhac-drums',
        label: {
          vi: 'Bộ trống Đại nhạc',
          en: 'Grand Percussion & Ceremonial Drums',
        },
        kicker: {
          vi: 'Nhịp lệnh cung đình',
          en: 'Imperial Pulse & Command',
        },
        story: {
          vi: 'Bộ trống Đại nhạc với trống chiến, trống bản và bồng dẫn dắt toàn bộ cấu trúc nhịp điệu của các khúc nhạc tế lễ uy nghi trước sân Đại Triều.',
          en: 'The Great Ensemble percussion section—battle drums, wooden tablets, and hourglass bồng drums—leads the regal cadence before the Grand Court.',
        },
        facts: [
          {
            vi: 'Trống đóng vai trò định hướng nhịp điệu và hiệu lệnh cho các vũ công bát dật trong các điệu múa cung đình như Lục cúng hoa đăng, Tam quốc tây du.',
            en: 'Drums provided the exact metric signals commanding ceremonial court dancers in master dances such as the Lantern Offering Dance.',
          },
          {
            vi: 'Tang trống được chế tác từ gỗ mít lõi, bọc da trâu chọn lọc để đạt độ vang rền chấn động không gian Điện Thái Hòa.',
            en: 'Drum barrels were hewn from jackfruit heartwood and wrapped in selected water buffalo hide to achieve deep resonance across the Citadel plazas.',
          },
        ],
        x: 20,
        y: 77,
        radius: 13,
        sprite: '/artifacts/nha-nhac-drums.webp',
        views: {
          front: '/artifacts/turn/nha-nhac-drums-front.webp',
          right: '/artifacts/turn/nha-nhac-drums-right.webp',
          back: '/artifacts/turn/nha-nhac-drums-back.webp',
          left: '/artifacts/turn/nha-nhac-drums-left.webp',
        },
        sourceIds: ['unesco-nha-nhac'],
      },
      {
        id: 'nha-nhac-orchestra',
        label: {
          vi: 'Dàn Tiểu nhạc & Khí nhạc',
          en: 'Small Chamber Ensemble & Winds',
        },
        kicker: {
          vi: 'Sự hòa tấu ngũ âm',
          en: 'The Pentatonic Imperial Harmony',
        },
        story: {
          vi: 'Dàn Tiểu nhạc kết hợp kèn bóp, đàn tỳ bà, đàn nhị, đàn nguyệt và sáo trúc biểu diễn các bản nhạc thính phòng cung đình tao nhã trong các yến tiệc hoàng gia.',
          en: 'The Small Ensemble marries the piercing double-reed kèn, tỳ bà lute, two-stringed nhị, moon lute, and bamboo flutes for elegant royal banquet suites.',
        },
        facts: [
          {
            vi: 'Âm nhạc cung đình Huế kế thừa tinh hoa âm nhạc từ thời Lý, Trần, Lê và đạt đến đỉnh cao hoàn thiện về quy chế lễ nhạc dưới triều Nguyễn.',
            en: 'Huế court music synthesized centuries of Vietnamese dynastic heritage from Lý, Trần, and Lê eras, codified into state ritual regulations under the Nguyễn.',
          },
          {
            vi: 'Hệ thống bài bản bao gồm 10 bản ngự: Phẩm tuyết, Nguyên tiêu, Hồ quảng, Liên hoàn, Bình bán, Tây mai, Kim tiền, Xuân phong, Long hổ, Tẩu mã.',
            en: 'The royal canonical suite comprises ten imperial master compositions representing auspicious celestial themes and royal virtues.',
          },
        ],
        x: 52,
        y: 78,
        radius: 13,
        sprite: '/artifacts/nha-nhac-orchestra.webp',
        views: {
          front: '/artifacts/turn/nha-nhac-orchestra-front.webp',
          right: '/artifacts/turn/nha-nhac-orchestra-right.webp',
          back: '/artifacts/turn/nha-nhac-orchestra-back.webp',
          left: '/artifacts/turn/nha-nhac-orchestra-left.webp',
        },
        sourceIds: ['unesco-nha-nhac'],
      },
      {
        id: 'nha-nhac-gate',
        label: {
          vi: 'Không gian nghi lễ Ngọ Môn',
          en: 'Ngọ Môn Imperial Gate & Ritual Axis',
        },
        kicker: {
          vi: 'Kiến trúc và trật tự vũ trụ',
          en: 'Architecture & Cosmological Alignment',
        },
        story: {
          vi: 'Nhã nhạc chỉ thực sự hiển lộ trọn vẹn ý nghĩa khi vang lên trong không gian kiến trúc tôn nghiêm của Cố đô Huế, dọc theo trục Dũng đạo nối từ Kỳ Đài qua Ngọ Môn đến Điện Thái Hòa.',
          en: 'Nhã Nhạc reveals its full cultural resonance when sounded along the imperial meridian axis stretching from the Flag Tower through Ngọ Môn Gate to the Throne Hall.',
        },
        facts: [
          {
            vi: 'Các nghi lễ tế Nam Giao, tế Xã Tắc là dịp quốc lễ quan trọng nhất, nơi vua thay mặt muôn dân tạ ơn trời đất với sự tham gia của hàng trăm nhạc công và vũ công.',
            en: 'The Heaven Worship (Nam Giao) rituals represented paramount state ceremonies where the monarch gave thanks accompanied by hundreds of musicians.',
          },
          {
            vi: 'UNESCO công nhận Nhã nhạc là Kiệt tác Di sản truyền khẩu và phi vật thể của nhân loại năm 2003, ghi nhận giá trị độc bản trong văn hóa cung đình châu Á.',
            en: 'UNESCO proclaimed Nhã Nhạc a Masterpiece of Oral and Intangible Heritage in 2003, acknowledging its unique preservation of East Asian royal musical traditions.',
          },
        ],
        x: 86,
        y: 67,
        radius: 13,
        sprite: '/artifacts/nha-nhac-gate.webp',
        views: {
          front: '/artifacts/turn/nha-nhac-gate-front.webp',
          right: '/artifacts/turn/nha-nhac-gate-right.webp',
          back: '/artifacts/turn/nha-nhac-gate-back.webp',
          left: '/artifacts/turn/nha-nhac-gate-left.webp',
        },
        sourceIds: ['unesco-nha-nhac'],
      },
    ],
    unlock: {
      requiredHotspotIds: ['nha-nhac-drums', 'nha-nhac-orchestra', 'nha-nhac-gate'],
      title: {
        vi: 'Âm sắc Hoàng cung Đại nội Huế',
        en: 'Ceremonial Resonance of the Imperial Citadel',
      },
      message: {
        vi: 'Điện Ngọ Môn đã bừng sáng sắc vàng cung đình. Khúc hòa tấu Nhã nhạc Đại triều trang nghiêm bắt đầu cất lên.',
        en: 'The Ngọ Môn gate is bathed in imperial gold. The solemn Great Court ritual suite begins to sound.',
      },
      audio: AUDIO_ASSETS['nha-nhac-unlock'],
    },
  },
  {
    id: 'cham-pottery',
    number: '04',
    location: {
      vi: 'Ninh Thuận · Bình Thuận',
      en: 'Ninh Thuận · Bình Thuận',
    },
    title: {
      vi: 'Gốm Chăm',
      en: 'Chăm Pottery Artistry',
    },
    subtitle: {
      vi: 'Đất, bàn tay và lửa ngoài trời',
      en: 'Earth, Moving Hands, and Open Bonfires',
    },
    description: {
      vi: 'Nghệ thuật thủ công gốm cổ xưa của người Chăm tại làng Bàu Trúc và Bình Đức, tạo hình thủ công hoàn toàn không dùng bàn xoay và nung lộ thiên bằng củi rơm.',
      en: 'Ancient Chăm ceramic craftsmanship in Bàu Trúc and Bình Đức villages, shaped entirely by walking hands without a potter\'s wheel and fired in open-air kilns.',
    },
    sceneImage: '/scenes/04-cham-pottery.webp',
    palette: {
      primary: '#ea580c',
      accent: '#c2410c',
      glow: 'rgba(234, 88, 12, 0.45)',
      darkBg: '#1f0d06',
    },
    sourceIds: ['unesco-cham-pottery', 'freesound-clay-fire'],
    soundscapeType: 'champottery-ambient',
    hotspots: [
      {
        id: 'cham-materials',
        label: {
          vi: 'Nguyên liệu đất cát địa phương',
          en: 'Indigenous Clay & Sand Gathering',
        },
        kicker: {
          vi: 'Tri thức gắn liền với thổ nhưỡng',
          en: 'Ecological Knowledge & Soil Sourcing',
        },
        story: {
          vi: 'Đất sét làm gốm Bàu Trúc được lấy từ trầm tích màu mỡ ven sông Quao, phối trộn tỉ mỉ với cát mịn theo tỷ lệ truyền đời để gốm chịu được nhiệt độ nung lộ thiên.',
          en: 'Clay for Bàu Trúc ceramics is mined from the Quao riverbanks and hand-kneaded with fine river sand according to ancestral ratios to endure open-air firing.',
        },
        facts: [
          {
            vi: 'Hồ sơ UNESCO nêu rõ nguyên liệu đất, cát, nước, củi và rơm đều được thu thập hoàn toàn tại địa phương, phản ánh mối gắn kết sâu sắc giữa di sản và môi trường tự nhiên.',
            en: 'UNESCO dossier highlights all clay, sand, water, firewood, and straw are locally harvested, demonstrating tight harmony between heritage and local ecology.',
          },
          {
            vi: 'Đô thị hóa và biến đổi khí hậu đang tạo sức ép lớn lên các mỏ đất sét truyền thống; di sản đã được UNESCO đưa vào Danh sách Cần bảo vệ khẩn cấp năm 2022.',
            en: 'Urbanization pressures traditional clay quarries; UNESCO inscribed the art on the Urgent Safeguarding List in 2022.',
          },
          {
            vi: 'Lưu ý giám tuyển: Dữ liệu giới thiệu tri thức văn hóa, không cung cấp công thức kỹ thuật chi tiết để thương mại hóa.',
            en: 'Curatorial note: Data highlights cultural knowledge and does not provide proprietary commercial formulas.',
          },
        ],
        x: 15,
        y: 78,
        radius: 13,
        sprite: '/artifacts/cham-materials.webp',
        views: {
          front: '/artifacts/turn/cham-materials-front.webp',
          right: '/artifacts/turn/cham-materials-right.webp',
          back: '/artifacts/turn/cham-materials-back.webp',
          left: '/artifacts/turn/cham-materials-left.webp',
        },
        sourceIds: ['unesco-cham-pottery'],
      },
      {
        id: 'cham-shaping',
        label: {
          vi: 'Tạo hình "tay làm hàm nhai, chân đi vòng quanh"',
          en: 'Moving Hands Without a Potter\'s Wheel',
        },
        kicker: {
          vi: 'Kỹ thuật tạo hình độc nhất vô nhị',
          en: 'Unique Ambulatory Sculpting Method',
        },
        story: {
          vi: 'Khác với hầu hết các nền gốm trên thế giới, người phụ nữ Chăm không ngồi một chỗ bên bàn xoay mà vừa đi giật lùi quanh khối đất, vừa dùng tay và miếng vải ướt vuốt tạo dáng sản phẩm.',
          en: 'Unlike most ceramic cultures worldwide, Chăm women do not use a potter\'s wheel; they walk backwards around the stationary clay pillar, shaping it with bare hands and wet cloths.',
        },
        facts: [
          {
            vi: 'Hoa văn trang trí được khắc bằng vỏ sò, lược tre hoặc hoa văn khắc chìm mang đậm dấu ấn văn hóa Chăm cổ như sóng nước, vân mây và thần linh.',
            en: 'Motifs are incised using seashells, bamboo combs, and stamp impressions depicting ancestral motifs like water waves, clouds, and deities.',
          },
          {
            vi: 'Nghề gốm được truyền từ mẹ sang con gái qua nhiều thế hệ; Hand Pilot hỗ trợ xoay quan sát bốn mặt hiện vật, không chấm điểm tay nghề.',
            en: 'Pottery wisdom is transmitted matrilineally; Hand Pilot enables 4-view object observation without grading simulated craftsmanship.',
          },
        ],
        x: 49,
        y: 58,
        radius: 14,
        sprite: '/artifacts/cham-shaping.webp',
        views: {
          front: '/artifacts/turn/cham-shaping-front.webp',
          right: '/artifacts/turn/cham-shaping-right.webp',
          back: '/artifacts/turn/cham-shaping-back.webp',
          left: '/artifacts/turn/cham-shaping-left.webp',
        },
        sourceIds: ['unesco-cham-pottery'],
      },
      {
        id: 'cham-firing',
        label: {
          vi: 'Nung lộ thiên ngoài trời',
          en: 'Open-Air Bonfire Firing',
        },
        kicker: {
          vi: 'Hơi thở của củi rơm và màu đất',
          en: 'Breath of Firewood, Straw & Earth Tones',
        },
        story: {
          vi: 'Gốm Chăm không tráng men và không dùng lò nung kín. Sản phẩm được xếp ngay ngắn ngoài trời, phủ củi và rơm lên trên rồi châm lửa nung trong 7-8 giờ.',
          en: 'Chăm pottery is unglazed and unconfined by brick kilns. Pieces are stacked outdoors on open ground, covered with dry wood and straw, and fired for 7–8 hours.',
        },
        facts: [
          {
            vi: 'Nhiệt độ nung đạt khoảng 800°C; tro than và ngọn lửa tạo nên những vệt màu tự nhiên độc bản từ đỏ gạch, vàng rơm đến đen loang huyền ảo.',
            en: 'Firing reaches approximately 800°C; dancing flames and ash yield unpredictable, unique earthy tones from brick-red to smoky obsidian.',
          },
          {
            vi: 'Sau khi nung, nghệ nhân dùng nước chiết xuất từ vỏ cây thị hoặc quả chay vẩy lên bề mặt tạo vân đá cẩm thạch óng ánh đặc trưng.',
            en: 'Post-firing, artisans sprinkle natural bark tannin extracts onto the hot ceramics to forge distinctive marbleized sheen.',
          },
        ],
        x: 78,
        y: 73,
        radius: 14,
        sprite: '/artifacts/cham-firing.webp',
        views: {
          front: '/artifacts/turn/cham-firing-front.webp',
          right: '/artifacts/turn/cham-firing-right.webp',
          back: '/artifacts/turn/cham-firing-back.webp',
          left: '/artifacts/turn/cham-firing-left.webp',
        },
        sourceIds: ['unesco-cham-pottery', 'freesound-clay-fire'],
      },
    ],
    unlock: {
      requiredHotspotIds: ['cham-materials', 'cham-shaping', 'cham-firing'],
      title: {
        vi: 'Hơi ấm sân gốm làng Bàu Trúc',
        en: 'Warmth of Bàu Trúc Village Workyard',
      },
      message: {
        vi: 'Khung cảnh sân phơi gốm và ngọn lửa nung lộ thiên đã rực sáng. Âm cảnh mô phỏng thao tác đất và lửa than được khơi dậy.',
        en: 'The open-air firing ground glows in rich terracotta hues. The educational clay and fire soundscape is unlocked.',
      },
      audio: AUDIO_ASSETS['cham-pottery-unlock'],
    },
  },
  {
    id: 'don-ca-tai-tu',
    number: '05',
    location: {
      vi: 'Nam Bộ',
      en: 'Southern Viet Nam',
    },
    title: {
      vi: 'Đờn ca tài tử',
      en: 'Đờn Ca Tài Tử Chamber Art',
    },
    subtitle: {
      vi: 'Giai điệu khung và sự ứng tác tinh tế',
      en: 'Skeletal Melodies and Subtle Improvisation',
    },
    description: {
      vi: 'Dòng nhạc thính phòng dân gian đặc sắc của vùng sông nước đồng bằng sông Cửu Long, nơi người tài tử đờn và ca đối thoại tâm tình qua 20 bài bản tổ.',
      en: 'A quintessential folk chamber art of the Mekong River Delta, where virtuoso musicians and vocalists dialogue through twenty canonical suites.',
    },
    sceneImage: '/scenes/05-don-ca-tai-tu.webp',
    palette: {
      primary: '#10b981',
      accent: '#047857',
      glow: 'rgba(16, 185, 129, 0.45)',
      darkBg: '#081711',
    },
    sourceIds: ['unesco-don-ca-tai-tu'],
    soundscapeType: 'taitu-ambient',
    hotspots: [
      {
        id: 'tai-tu-dan-kim',
        label: {
          vi: 'Đàn kìm (Đàn nguyệt)',
          en: 'Đàn Kìm (Moon Lute)',
        },
        kicker: {
          vi: 'Cây đàn thủ lĩnh trong ban nhạc',
          en: 'The Master Voice of the Ensemble',
        },
        story: {
          vi: 'Đàn kìm với thùng tròn như mặt trăng rằm, giữ vai trò lĩnh xướng và giữ nhịp chính trong ban nhạc tài tử, dẫn dắt các nhạc cụ khác đi vào các làn điệu Bắc, Nam, Oán.',
          en: 'The moon lute, named for its full circular body, acts as the leader anchoring melodic lines across the canonical modes: Bắc (joyful), Nam (peaceful), and Oán (melancholic).',
        },
        facts: [
          {
            vi: 'UNESCO ghi nhận đàn kìm cùng đàn cò, đàn tranh, đàn tỳ bà, đàn bầu và sáo trúc tạo nên dàn hòa tấu ngũ tuyệt tài hoa của phương Nam.',
            en: 'UNESCO records the moon lute alongside the two-stringed fiddle, zither, pear lute, monochord, and flute as the quintet of Southern masters.',
          },
          {
            vi: 'Kỹ thuật nhấn ngón của đàn kìm tạo ra độ chùng rung đặc trưng thể hiện trọn vẹn tâm tư phóng khoáng, hào hiệp của người dân Nam Bộ.',
            en: 'Finger-bending technique creates microtonal nuances embodying the generous, free-spirited character of Southern river folk.',
          },
        ],
        x: 21,
        y: 69,
        radius: 13,
        sprite: '/artifacts/tai-tu-dan-kim.webp',
        views: {
          front: '/artifacts/turn/tai-tu-dan-kim-front.webp',
          right: '/artifacts/turn/tai-tu-dan-kim-right.webp',
          back: '/artifacts/turn/tai-tu-dan-kim-back.webp',
          left: '/artifacts/turn/tai-tu-dan-kim-left.webp',
        },
        sourceIds: ['unesco-don-ca-tai-tu'],
      },
      {
        id: 'tai-tu-dan-tranh',
        label: {
          vi: 'Đàn tranh 16 dây',
          en: 'Đàn Tranh (16-Stringed Zither)',
        },
        kicker: {
          vi: 'Tiếng tơ lấp lánh sóng nước',
          en: 'Shimmering Strings of the River',
        },
        story: {
          vi: 'Cây đàn tranh với hàng nhạn gỗ hình cánh én nâng đỡ 16 dây tơ, tạo nên những chuỗi âm hoa mỹ, róc rách như dòng nước Cửu Long khi tay đờn vuốt ngón á.',
          en: 'The 16-string zither with swallow-shaped wooden bridges produces cascading ornamental arpeggios evocative of shimmering Mekong waterways.',
        },
        facts: [
          {
            vi: 'Nghệ thuật Đờn ca tài tử dựa trên nguyên tắc "lòng bản" (giai điệu khung); người chơi được tự do ứng tác hoa lá theo tài hoa cá nhân.',
            en: 'Đờn ca tài tử operates on the "skeletal core" (lòng bản); master musicians are free to embellish and improvise personal melodic flora.',
          },
          {
            vi: 'Các điệu thức hơi Nam, hơi Oán đòi hỏi kỹ thuật rung móng, nhấn phím cực kỳ tinh vi để khơi gợi nỗi niềm sâu lắng.',
            en: 'The Nam and Oán emotional modes require intricate pick tremolos and fret depressions to evoke poignant nostalgia.',
          },
        ],
        x: 52,
        y: 72,
        radius: 13,
        sprite: '/artifacts/tai-tu-dan-tranh.webp',
        views: {
          front: '/artifacts/turn/tai-tu-dan-tranh-front.webp',
          right: '/artifacts/turn/tai-tu-dan-tranh-right.webp',
          back: '/artifacts/turn/tai-tu-dan-tranh-back.webp',
          left: '/artifacts/turn/tai-tu-dan-tranh-left.webp',
        },
        sourceIds: ['unesco-don-ca-tai-tu'],
      },
      {
        id: 'tai-tu-riverside',
        label: {
          vi: 'Cuộc đàn hát bên bến sông',
          en: 'Riverside Chamber Gathering',
        },
        kicker: {
          vi: 'Không gian sinh hoạt tài tử',
          en: 'Spontaneous Gathering Space',
        },
        story: {
          vi: 'Người tài tử thường tụ họp dưới bóng dừa, trên chiếc ghe xuồng hay bên hiên nhà sau giờ lao động đồng áng, cất tiếng đàn hòa giọng dưới ánh trăng thanh.',
          en: 'Talented amateurs gather under coconut groves, aboard wooden sampans, or upon riverside verandas after fieldwork to sing beneath the moon.',
        },
        facts: [
          {
            vi: 'Từ "tài tử" hàm ý người có tài năng âm nhạc nhưng chơi đàn vì đam mê và lòng mến khách, không vụ lợi thương mại.',
            en: 'The word "tài tử" designates gifted amateurs who perform out of artistic passion and heartfelt hospitality rather than commercial profit.',
          },
          {
            vi: 'Được UNESCO vinh danh năm 2013, Đờn ca tài tử tiếp tục được trao truyền mạnh mẽ qua các câu lạc bộ và đời sống thường nhật ở 21 tỉnh thành phía Nam.',
            en: 'Inscribed by UNESCO in 2013, Đờn ca tài tử thrives across grassroots clubs and daily family life in 21 Southern provinces.',
          },
        ],
        x: 82,
        y: 72,
        radius: 13,
        sprite: '/artifacts/tai-tu-riverside.webp',
        views: {
          front: '/artifacts/turn/tai-tu-riverside-front.webp',
          right: '/artifacts/turn/tai-tu-riverside-right.webp',
          back: '/artifacts/turn/tai-tu-riverside-back.webp',
          left: '/artifacts/turn/tai-tu-riverside-left.webp',
        },
        sourceIds: ['unesco-don-ca-tai-tu'],
      },
    ],
    unlock: {
      requiredHotspotIds: ['tai-tu-dan-kim', 'tai-tu-dan-tranh', 'tai-tu-riverside'],
      title: {
        vi: 'Khúc tương phùng đất phương Nam',
        en: 'Southern Gathering Melodies',
      },
      message: {
        vi: 'Không gian bến sông Nam Bộ lung linh trăng nước. Bản hòa tấu thính phòng trọn vẹn của giọng ca nữ, đàn kìm và đàn tranh đã sẵn sàng.',
        en: 'The moonlight river landing is aglow. The acoustic ensemble recording of vocal, moon lute, and zither is unlocked.',
      },
      audio: AUDIO_ASSETS['tai-tu-unlock'],
    },
  },
];
