export interface GuestbookEntry {
  id: string;
  name: string;
  character: string;
  characterName: string;
  countryCode: string;
  countryName: string;
  flag: string;
  content: string;
  timestamp: string;
}

export interface AvatarOption {
  id: string;
  icon: string;
  labelVi: string;
  labelEn: string;
}

export const AVATAR_CATEGORIES: { categoryVi: string; categoryEn: string; avatars: AvatarOption[] }[] = [
  {
    categoryVi: "Văn hóa & Cổ phục",
    categoryEn: "Culture & Costumes",
    avatars: [
      { id: "female_ao_dai", icon: "👩‍🌾", labelVi: "Thiếu nữ Áo tứ thân", labelEn: "Quan Ho Maiden" },
      { id: "male_quan_ho", icon: "👨‍🌾", labelVi: "Liền anh Quan họ", labelEn: "Quan Ho Brother" },
      { id: "cham_dancer", icon: "💃", labelVi: "Vũ nữ Chăm Pa / Apsara", labelEn: "Cham Apsara Dancer" },
      { id: "nhat_binh", icon: "👘", labelVi: "Cổ phục Nhật Bình", labelEn: "Heritage Royal Attire" },
      { id: "mountain_folk", icon: "🧕", labelVi: "Đồng bào Dân tộc miền núi", labelEn: "Highland Folk" },
    ],
  },
  {
    categoryVi: "Nghệ nhân & Bác Trưởng tàu",
    categoryEn: "Artisans & Conductor",
    avatars: [
      { id: "conductor", icon: "👨‍✈️", labelVi: "Bác Trưởng tàu Di sản", labelEn: "Heritage Conductor" },
      { id: "musician", icon: "🧓", labelVi: "Bác Nghệ nhân Đờn ca", labelEn: "Master Musician" },
      { id: "calligrapher", icon: "👴", labelVi: "Cụ đồ Thư pháp", labelEn: "Calligraphy Master" },
      { id: "potter", icon: "🧑‍🎨", labelVi: "Nghệ nhân Gốm Bàu Trúc", labelEn: "Cham Pottery Artisan" },
      { id: "farmer", icon: "🌾", labelVi: "Lão nông Tri kỷ", labelEn: "Countryside Elder" },
    ],
  },
  {
    categoryVi: "Lữ khách & Thế hệ trẻ",
    categoryEn: "Travelers & Youth",
    avatars: [
      { id: "male_student", icon: "🧑‍🎓", labelVi: "Sinh viên / Nhà nghiên cứu", labelEn: "Student / Explorer" },
      { id: "traveler", icon: "🎒", labelVi: "Du khách Ba lô", labelEn: "Backpacker" },
      { id: "photographer", icon: "📷", labelVi: "Nhiếp ảnh gia Di sản", labelEn: "Heritage Photographer" },
      { id: "biker", icon: "🚴", labelVi: "Phượt thủ Xuyên Việt", labelEn: "Cross-Vietnam Biker" },
      { id: "artist", icon: "🎨", labelVi: "Họa sĩ Ký họa", labelEn: "Sketch Artist" },
      { id: "bard", icon: "🎸", labelVi: "Nhạc công Du ca", labelEn: "Roaming Minstrel" },
    ],
  },
  {
    categoryVi: "Biểu tượng & Tinh hoa Di sản",
    categoryEn: "Heritage Icons & Symbols",
    avatars: [
      { id: "lantern", icon: "🏮", labelVi: "Đèn lồng Phố Hội", labelEn: "Hoi An Lantern" },
      { id: "lotus", icon: "🪷", labelVi: "Hoa sen Đồng Tháp", labelEn: "Lotus Flower" },
      { id: "train", icon: "🚂", labelVi: "Đoàn tàu Di sản", labelEn: "Heritage Express" },
      { id: "lute", icon: "🪕", labelVi: "Cây Đàn Nguyệt", labelEn: "Moon Lute" },
      { id: "tea", icon: "🍵", labelVi: "Tách trà sen Tây Hồ", labelEn: "Lotus Tea" },
      { id: "coffee", icon: "☕", labelVi: "Cà phê Phin Việt Nam", labelEn: "Viet Drip Coffee" },
      { id: "vase", icon: "🏺", labelVi: "Bình gốm Cổ truyền", labelEn: "Heritage Ceramic" },
      { id: "bamboo", icon: "🎋", labelVi: "Lũy tre xanh", labelEn: "Green Bamboo" },
      { id: "dove", icon: "🕊️", labelVi: "Sứ giả Hoà bình", labelEn: "Dove of Peace" },
      { id: "star", icon: "🌟", labelVi: "Ngôi sao May mắn", labelEn: "Bright Star" },
      { id: "globe", icon: "🌏", labelVi: "Bạn bè Quốc tế", labelEn: "Global Passenger" },
      { id: "heart", icon: "❤️", labelVi: "Trái tim Đồng hành", labelEn: "Devoted Heart" },
    ],
  },
];

export const DEFAULT_AVATARS: AvatarOption[] = AVATAR_CATEGORIES.flatMap((cat) => cat.avatars);

export const NATIONALITIES = [
  { code: "VN", flag: "🇻🇳", nameVi: "Việt Nam", nameEn: "Vietnam" },
  { code: "JP", flag: "🇯🇵", nameVi: "Nhật Bản", nameEn: "Japan" },
  { code: "KR", flag: "🇰🇷", nameVi: "Hàn Quốc", nameEn: "Korea" },
  { code: "FR", flag: "🇫🇷", nameVi: "Pháp", nameEn: "France" },
  { code: "US", flag: "🇺🇸", nameVi: "Hoa Kỳ", nameEn: "United States" },
  { code: "UK", flag: "🇬🇧", nameVi: "Vương quốc Anh", nameEn: "United Kingdom" },
  { code: "DE", flag: "🇩🇪", nameVi: "Đức", nameEn: "Germany" },
  { code: "AU", flag: "🇦🇺", nameVi: "Úc", nameEn: "Australia" },
  { code: "OTHER", flag: "🌏", nameVi: "Quốc tế khác", nameEn: "International" },
];

export const QUICK_EMOJIS = ["🚂", "🏮", "🎶", "🇻🇳", "🪕", "🍵", "☕", "❤️", "✨", "👏", "📜", "🌸", "🪷", "🔥", "🏺", "🎫"];

export const SEED_GUESTBOOK: GuestbookEntry[] = [
  {
    id: "seed-1",
    name: "Minh Trang",
    character: "👩‍🌾",
    characterName: "Thiếu nữ Áo tứ thân",
    countryCode: "VN",
    countryName: "Việt Nam",
    flag: "🇻🇳",
    content: "Âm nhạc ngũ cung và đồ họa pixel quá đỗi cảm xúc! Mong em tiếp tục phát triển thêm các chặng miền Tây và Tây Nguyên nhé ❤️🚂",
    timestamp: "Vừa xong",
  },
  {
    id: "seed-2",
    name: "Hoàng Nam",
    character: "🪕",
    characterName: "Cây Đàn Nguyệt",
    countryCode: "VN",
    countryName: "Việt Nam",
    flag: "🇻🇳",
    content: "Một tác phẩm nghệ thuật số tôn vinh di sản quá đỗi tự hào và tinh tế. Từng nốt đàn tranh, nhịp gõ phách ca trù chạm đến trái tim! 🏮✨",
    timestamp: "1 giờ trước",
  },
  {
    id: "seed-3",
    name: "Alexandre",
    character: "🎒",
    characterName: "Du khách Lữ hành",
    countryCode: "FR",
    countryName: "Pháp",
    flag: "🇫🇷",
    content: "Superbe projet interactif sur le patrimoine vietnamien ! Les détails sonores de Ca Trù et Nha Nhac sont magnifiques ✨",
    timestamp: "Hôm qua",
  },
  {
    id: "seed-4",
    name: "Bác Ba Đờn",
    character: "🧓",
    characterName: "Bác Nghệ nhân Đờn ca",
    countryCode: "VN",
    countryName: "Việt Nam",
    flag: "🇻🇳",
    content: "Rất vui khi thấy người trẻ vẫn gìn giữ và truyền tải nét đẹp Đờn ca tài tử Nam Bộ hay như vầy. Chúc tác giả nhiều lửa nghề!",
    timestamp: "2 ngày trước",
  },
  {
    id: "seed-5",
    name: "Kenji Sato",
    character: "🧑‍🎓",
    characterName: "Lữ khách Quốc tế",
    countryCode: "JP",
    countryName: "Nhật Bản",
    flag: "🇯🇵",
    content: "ベトナムの伝統文化を美しく体験できる素晴らしいゲームです！陶芸体験がとても楽しかった 🏮✨",
    timestamp: "3 ngày trước",
  },
  {
    id: "seed-6",
    name: "Thu Thảo",
    character: "🏺",
    characterName: "Bình gốm Cổ truyền",
    countryCode: "VN",
    countryName: "Việt Nam",
    flag: "🇻🇳",
    content: "Cảm ơn chuyến tàu di sản đã đưa mình qua từng miền đất nước. Tiếng gốm nung Bàu Trúc và điệu hò Quan họ Bắc Ninh thật tuyệt vời! 🌸",
    timestamp: "4 ngày trước",
  },
  {
    id: "seed-7",
    name: "David Miller",
    character: "🌏",
    characterName: "Bạn bè Quốc tế",
    countryCode: "US",
    countryName: "Hoa Kỳ",
    flag: "🇺🇸",
    content: "Proud of Vietnamese cultural roots! The pixel craftsmanship, interactive stamps and zither soundtrack are truly extraordinary. 👏",
    timestamp: "5 ngày trước",
  },
  {
    id: "seed-8",
    name: "Thầy giáo Nguyễn Văn An",
    character: "👴",
    characterName: "Cụ đồ Thư pháp",
    countryCode: "VN",
    countryName: "Việt Nam",
    flag: "🇻🇳",
    content: "Mỗi con tem được đóng dấu như khắc ghi thêm một mảnh ghép hồn quê hương vào tâm trí. Trân quý từng tư liệu và thanh âm! 📜❤️",
    timestamp: "1 tuần trước",
  },
];

const STORAGE_KEY = "tau_di_san_guestbook";
const GUESTBOOK_EVENT = "tau_di_san_guestbook_updated";

export function getStoredGuestbook(): GuestbookEntry[] {
  if (typeof window === "undefined") return SEED_GUESTBOOK;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return SEED_GUESTBOOK;
}

export function saveStoredGuestbook(entries: GuestbookEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent(GUESTBOOK_EVENT, { detail: entries }));
  } catch {}
}

export function deleteGuestbookEntry(id: string): GuestbookEntry[] {
  const current = getStoredGuestbook();
  const updated = current.filter((item) => item.id !== id);
  saveStoredGuestbook(updated);
  return updated;
}

export function deleteMultipleGuestbookEntries(ids: string[]): GuestbookEntry[] {
  const idSet = new Set(ids);
  const current = getStoredGuestbook();
  const updated = current.filter((item) => !idSet.has(item.id));
  saveStoredGuestbook(updated);
  return updated;
}

export function resetGuestbookToDefault(): GuestbookEntry[] {
  saveStoredGuestbook(SEED_GUESTBOOK);
  return SEED_GUESTBOOK;
}

export function clearAllGuestbook(): GuestbookEntry[] {
  const empty: GuestbookEntry[] = [];
  saveStoredGuestbook(empty);
  return empty;
}

export function subscribeGuestbook(callback: (entries: GuestbookEntry[]) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<GuestbookEntry[]>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getStoredGuestbook());
    }
  };
  window.addEventListener(GUESTBOOK_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(GUESTBOOK_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
