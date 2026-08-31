import React, { useState } from 'react';
import type { Language } from '../lib/types';

interface JourneyGuideModalProps {
  language: Language;
  onClose: () => void;
  onStart?: () => void;
  entryContext?: 'intro' | 'carriage';
}

export function JourneyGuideModal({ language, onClose, onStart, entryContext = 'intro' }: JourneyGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'steps' | 'passport' | 'hand'>('story');
  const [mobileStep, setMobileStep] = useState(entryContext === 'carriage' ? 1 : 0);

  const content = {
    vi: {
      badge: 'CẨM NANG HÀNH TRÌNH TÀU DI SẢN',
      title: 'Chuyến Tàu Di Sản Văn Hóa Xuyên Việt Và Ký Ức Đang Sống',
      subtitle: 'Hướng dẫn từ A đến Z dành cho lữ khách khám phá di sản văn hóa Việt Nam',
      tabStory: '1. Câu chuyện chuyến tàu',
      tabSteps: '2. Lộ trình khám phá A-Z',
      tabPassport: '3. Con dấu & Sổ hộ chiếu',
      tabHand: '4. Điều khiển tay Hand Pilot',
      close: 'Đóng cẩm nang',
      startNow: 'Bắt đầu lên tàu ngay',
      storyHeader: 'Hành trình của một lữ khách dọc theo dải đất hình chữ S',
      storyP1: 'Bước chân lên con tàu di sản văn hóa Việt Nam, tôi bắt đầu chuyến viễn du dọc theo dải đất hình chữ S, khởi hành từ miền Bắc thân thương và xuôi dần về phương Nam trù phú. Ngồi bên khung cửa sổ toa tàu cổ kính, tôi được lắng nghe tiếng còi tàu ngân vang, đưa mình đi qua từng địa điểm thân thương và mở ra từng tầng ký ức của quê hương xứ sở.',
      storyP2: 'Mỗi chặng đường dừng chân là một lần tôi được hòa mình vào không gian văn hóa sống động. Tôi được tận mắt chiêm ngưỡng những bảo vật tinh hoa, lắng nghe làn điệu dân gian tha thiết, cảm nhận nhịp phách uyển chuyển và thấu hiểu bàn tay tài hoa của các nghệ nhân bao đời gìn giữ trao truyền. Chuyến đi không đơn thuần là ngắm nhìn cảnh vật, mà là cuộc hạnh ngộ kỳ diệu với hồn thiêng sông núi và tâm hồn Việt Nam qua ngàn năm lịch sử.',
      storyP3: 'Mọi tư liệu, hình ảnh và thanh âm trong chuyến trải nghiệm đều được đối chiếu chặt chẽ từ các hồ sơ Di sản Văn hóa Phi vật thể UNESCO và cộng đồng nghệ nhân chủ thể.',
      specialEndingNoticeTitle: '✨ BẬT MÍ: BỘ SƯU TẬP HOÀNG KIM & ĐIỀU BẤT NGỜ Ở GA CUỐI',
      specialEndingNoticeBody: 'Khi thu thập trọn vẹn các con dấu di sản, ga cuối cùng sẽ mở khóa không gian bảo tàng bí mật để bạn chiêm ngưỡng toàn bộ chiến tích sưu tầm, gửi gắm lưu bút và khám phá những điều thú vị đang chờ đón!',

      stepsTitle: 'Hành trình từ A đến Z: Khám phá từng vùng đất',
      step1Title: 'Bước 1: Gặp Bác Trưởng Tàu & Nhận Vé Ga',
      step1Desc: 'Bước vào toa tàu cổ kính, trò chuyện cùng Bác Trưởng Tàu để chọn một trong 5 ga dừng chân dọc tuyến đường sắt di sản.',
      step2Title: 'Bước 2: Dùng "Đèn Ký Ức" Đánh Thức Không Gian',
      step2Desc: 'Khi mới đến ga, cảnh vật đang chìm trong màn sương hoài niệm. Rà ngọn Đèn Ký Ức (bằng chuột hoặc cử chỉ tay) trên bức tranh toàn cảnh để phát hiện và khơi gợi lại những dấu ấn di sản còn ẩn mình.',
      step3Title: 'Bước 3: Mở Hồ Sơ Bảo Vật & Lắng Nghe Giai Điệu',
      step3Desc: 'Mỗi hiện vật thức giấc sẽ mở ra một hồ sơ tư liệu chuẩn xác, kèm hình ảnh xoay đa góc độ 360°, bản thu âm di sản có bản quyền và nguồn gốc đối chiếu minh bạch.',
      step4Title: 'Bước 4: Đón Nhận Con Dấu Di Sản & Mở Khóa Trang Tổng Kết',
      step4Desc: 'Sau khi đánh thức đủ 3/3 bảo vật tại ga, hãy bấm "Nhận con dấu di sản". Thu thập đủ con dấu hoàng kim ở các ga là điều kiện bắt buộc để thông hành ga kế tiếp và bước vào Trang Tổng Kết (mở Sổ Hộ Chiếu, tải file PDF lưu niệm, mở Phòng Trưng Bày Bảo Tàng & Lưu Bút Góp Ý).',

      passportTitle: 'Thu thập Con Dấu Hoàng Kim & Sổ Hộ Chiếu',
      passportP1: '✦ Con Dấu Di Sản (Heritage Seal): Khi đã cảm thụ trọn vẹn tinh hoa của một vùng đất, bức tranh toàn cảnh sẽ bừng sáng rực rỡ sắc màu ban sơ. Lúc này, bạn sẽ nhận được một Con Dấu Di Sản danh giá để mở đường đến ga kế tiếp.',
      passportP2: '✦ Hộ Chiếu Di Sản & Tải Xuất PDF: Mọi dấu mộc, hiện vật đã chạm và chứng nhận nguồn gốc sẽ được tự động ghi chép vào Hộ Chiếu. Bạn có thể bấm "Tải Hộ chiếu PDF" để nhận bản in chứng nhận lưu niệm sang trọng có mã định danh và mộc chim hạc hoàng kim.',
      passportP3: '✦ Phòng Trưng Bày Bảo Tàng (Museum Vault) & Sổ Lưu Bút: Sau chuyến đi, bạn được tự do chiêm ngưỡng toàn bộ 15 hiện vật xoay 3D/pixel, nghe trọn bộ âm thanh di sản, ghé thăm lại bất kỳ vùng đất nào qua Bản Đồ Hồi Tưởng và viết lại những dòng cảm xúc, đóng góp ý kiến trong Sổ Lưu Bút!',

      handTitle: 'Công nghệ tương tác AI Hand Pilot (Tùy chọn)',
      handP1: 'Bên cạnh thao tác chuột truyền thống, bạn có thể bật Camera AI để tương tác hoàn toàn bằng cử chỉ bàn tay thật:',
      handFeature1: 'Nghiêng bàn tay: Xoay hiện vật để ngắm nhìn 4 góc độ chi tiết.',
      handFeature2: 'Chụm ngón tay (Pinch): Phóng to / thu nhỏ hiện vật trong không gian ảo.',
      handFeature3: 'Bung mở lòng bàn tay: Đánh thức câu chuyện và tiếp nhận âm thanh di sản.',
      privacyNote: 'Toàn bộ việc nhận diện bàn tay được xử lý trực tiếp trên trình duyệt của bạn (On-Device MediaPipe), tuyệt đối an toàn và không truyền tải hình ảnh camera ra bên ngoài.'
    },
    en: {
      badge: 'THE HERITAGE EXPRESS EXPEDITION GUIDE',
      title: 'The Trans-Vietnam Cultural Heritage Express & Living Memories',
      subtitle: 'A Definitive A-to-Z Field Guide for Voyagers Exploring Living Vietnamese Heritage',
      tabStory: '1. Train Lore & Chronicle',
      tabSteps: '2. A-to-Z Expedition Route',
      tabPassport: '3. Golden Seals & Passport',
      tabHand: '4. AI Hand Pilot Gestures',
      close: 'Close Guide',
      startNow: 'Embark on the Journey',
      storyHeader: "A Voyager's Odyssey Across the S-Shaped Land",
      storyP1: 'Stepping aboard the Vietnam Cultural Heritage Express, I embark on an unforgettable voyage across the S-shaped land, setting out from the northern river deltas and traveling toward the bountiful southern waterways. Gazing through the vintage carriage window, I listen to the whistle echoing as we visit each cherished destination and reawaken historical memories.',
      storyP2: 'At every stop along the way, I immerse myself in vibrant living traditions. I witness exquisite artisan treasures, listen to soulful folk melodies, and feel the devotion of master craftspeople passed down through generations. This expedition is far more than sightseeing; it is a profound encounter with the enduring soul of Vietnamese heritage across centuries.',
      storyP3: 'Every archival record, panoramic illustration, and sound recording is rigorously grounded in UNESCO Intangible Cultural Heritage files and verified heritage communities.',
      specialEndingNoticeTitle: '✨ SECRET VAULT: ARTIFACT COLLECTION & FINAL SURPRISES',
      specialEndingNoticeBody: 'Gathering every golden heritage seal unlocks a hidden living museum at journey’s end — revealing your full collector’s vault, a traveler guestbook, and special surprises along the way!',

      stepsTitle: 'Your A-to-Z Expedition: Step by Step',
      step1Title: 'Step 1: Meet the Conductor & Board with Destination Tickets',
      step1Desc: 'Step inside the mahogany salon carriage, converse with the veteran Conductor, and claim your passage ticket for any of the 5 heritage stops.',
      step2Title: 'Step 2: Awaken Shrouded Landscapes with the "Memory Lamp"',
      step2Desc: 'Each station begins in a nostalgic grayscale mist. Glide your luminous Memory Lamp (via mouse or camera hand gestures) across the panoramic tapestry to unveil hidden cultural relics.',
      step3Title: 'Step 3: Unveil Sacred Artifact Dossiers & Living Audio',
      step3Desc: 'Each awakened artifact unveils authentic archival records, 4-angle rotational artifacts, licensed field recordings, and peer-reviewed heritage sources.',
      step4Title: 'Step 4: Claim Golden Heritage Seals & Unlock Journey Summary',
      step4Desc: 'After awakening all 3/3 relics at a station, claim your official Golden Heritage Seal. Gathering these seals is mandatory to unlock the subsequent stations and enter the grand Journey Summary (Living Passport, Museum Vault & Guestbook).',

      passportTitle: 'Gathering Golden Seals & The Living Heritage Passport',
      passportP1: '✦ Golden Heritage Seals: Once you fully awaken the spirit of a stop, radiant colors return to the landscape, granting an official Imperial Crane Seal to progress forward.',
      passportP2: '✦ Living Passport & Archival PDF Export: Every stamp, discovered artifact, and historical chronicle is automatically bound into your Heritage Passport. Click "Download Passport PDF" anytime for an archival print certificate with your unique traveler ID.',
      passportP3: '✦ Museum Vault & Living Guestbook: Revisit your complete collection of interactive 3D/pixel artifacts, replay all folk melodies, and share your traveler reflections and feedback in the community guestbook.',

      handTitle: 'AI Hand Pilot Gesture Control (Optional Experience)',
      handP1: 'Beyond standard cursor interaction, you can activate the AI Camera Pilot to interact via natural, real-time hand gestures:',
      handFeature1: 'Tilt Hand: Rotate 360° artifacts across 4 authentic angles.',
      handFeature2: 'Pinch Gesture: Zoom in to inspect intricate craftsmanship.',
      handFeature3: 'Open Palm: Awaken historical chronicles and summon authentic melodies.',
      privacyNote: 'All hand tracking is computed 100% locally on your browser via On-Device MediaPipe. Zero camera imagery is ever transmitted to external servers.'
    }
  }[language];

  const mobileSteps = language === 'vi' ? [
    {
      icon: '🚂',
      eyebrow: 'BƯỚC 01 · LÊN TÀU',
      title: 'Bắt đầu một hành trình có nguồn',
      body: 'Bạn sẽ đi qua năm ga di sản từ Bắc vào Nam. Mỗi câu chuyện, hình ảnh và âm thanh đều đi kèm hồ sơ đối chiếu rõ ràng.',
      note: 'Bấm “Bắt đầu hành trình” để bước vào toa tàu và gặp nhân viên soát vé.',
    },
    {
      icon: '🎫',
      eyebrow: 'BƯỚC 02 · CHỌN GA',
      title: 'Chọn tấm vé cho điểm đến tiếp theo',
      body: 'Trong toa tàu, chạm vào một trong năm tấm vé. Bạn có thể bắt đầu từ bất kỳ ga nào và quay lại ga đã đi qua.',
      note: 'Trên điện thoại, danh sách vé có thể cuộn; không cần cố nhìn toàn bộ trong một khung.',
    },
    {
      icon: '🏮',
      eyebrow: 'BƯỚC 03 · ĐÈN KÝ ỨC',
      title: 'Chạm ba điểm sáng trong cảnh ga',
      body: 'Cảnh ga ban đầu chìm trong màu tối. Mỗi lần chạm đúng một vật phẩm, vùng ký ức đó sẽ trở lại nguyên màu và mở hồ sơ hiện vật.',
      note: 'Đánh thức đủ 3/3 vật phẩm để toàn bộ bức tranh bừng sáng.',
    },
    {
      icon: '✦',
      eyebrow: 'BƯỚC 04 · NHẬN CON DẤU',
      title: 'Xác nhận đã xem trọn vẹn cảnh ga',
      body: 'Sau khi tìm đủ ba vật phẩm, bấm “Nhận con dấu di sản”. Con dấu mở đường đến ga kế tiếp và được lưu trong Hộ chiếu.',
      note: 'Thẻ “Bước tiếp theo” bên dưới cảnh sẽ luôn chỉ đúng hành động bạn cần làm.',
    },
    {
      icon: '🏛️',
      eyebrow: 'BƯỚC 05 · TỔNG KẾT',
      title: 'Mở Hộ chiếu, phòng trưng bày và lưu bút',
      body: 'Khi đã đủ năm con dấu, nút về Trang tổng kết sẽ phát sáng. Tại đó bạn có thể xem lại hiện vật, tải Hộ chiếu và gửi cảm nghĩ.',
      note: 'Hand Pilot là tùy chọn. Camera chỉ được xử lý ngay trên thiết bị và không tải hình ảnh ra ngoài.',
    },
  ] : [
    {
      icon: '🚂',
      eyebrow: 'STEP 01 · BOARD THE TRAIN',
      title: 'Begin a source-backed journey',
      body: 'Travel through five living-heritage stops from North to South. Every story, image, and sound is paired with a clear source record.',
      note: 'Tap “Begin journey” to enter the carriage and meet the ticket conductor.',
    },
    {
      icon: '🎫',
      eyebrow: 'STEP 02 · CHOOSE A STOP',
      title: 'Choose the ticket for your next destination',
      body: 'Inside the carriage, tap one of five tickets. You may begin at any stop and revisit places you have already explored.',
      note: 'On a phone the ticket area may scroll; everything does not need to fit into one frame.',
    },
    {
      icon: '🏮',
      eyebrow: 'STEP 03 · MEMORY LANTERN',
      title: 'Tap the three lights in the station scene',
      body: 'Each station begins in darkness. Tapping an object restores that memory region to full colour and opens its sourced record.',
      note: 'Awaken all 3/3 objects to restore the complete scene.',
    },
    {
      icon: '✦',
      eyebrow: 'STEP 04 · CLAIM THE SEAL',
      title: 'Confirm that you viewed the complete station',
      body: 'After finding all three objects, claim the heritage seal. It unlocks the next stop and is saved in your Passport.',
      note: 'The “Next step” card below the scene always shows the action you need now.',
    },
    {
      icon: '🏛️',
      eyebrow: 'STEP 05 · JOURNEY SUMMARY',
      title: 'Open your Passport, gallery, and guestbook',
      body: 'After five seals, the Journey Summary button glows. Revisit objects, download your Passport, and leave a reflection there.',
      note: 'Hand Pilot is optional. Camera processing stays on your device and no camera imagery is uploaded.',
    },
  ];
  const currentMobileStep = mobileSteps[mobileStep];

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-2.5 sm:p-6 bg-stone-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div className="journey-guide-shell relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0f1411] border-2 border-amber-500/60 shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-stone-100 overflow-hidden rounded-none my-auto">
        {/* Top Gold Ornament Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 shrink-0" />

        {/* Header */}
        <div className="journey-guide-header p-3.5 sm:p-6 border-b border-amber-500/20 bg-gradient-to-b from-amber-950/40 to-transparent flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rotate-45 inline-block shrink-0" />
              <span className="truncate">{content.badge}</span>
            </div>
            <h2 id="guide-modal-title" className="text-base sm:text-2xl font-serif font-bold text-amber-100 mt-1 leading-snug break-words">
              {content.title}
            </h2>
            <p className="text-[11px] sm:text-sm text-stone-400 font-sans mt-0.5 leading-relaxed break-words">
              {content.subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 border border-amber-500/40 hover:border-amber-400 bg-stone-900/80 hover:bg-stone-800 text-amber-300 font-mono text-[11px] sm:text-xs transition-colors shrink-0 whitespace-nowrap"
            aria-label={content.close}
          >
            ✕ <span className="hidden xs:inline">{content.close}</span>
          </button>
        </div>

        {/* Tab Switcher - Scrollable horizontally so tabs never crush */}
        <div className="journey-guide-tabs flex overflow-x-auto border-b border-stone-800 bg-stone-950/70 text-[11px] sm:text-xs font-mono scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('story')}
            className={`px-3.5 sm:px-4 py-2.5 transition-colors border-b-2 shrink-0 whitespace-nowrap ${
              activeTab === 'story'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            {content.tabStory}
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-3.5 sm:px-4 py-2.5 transition-colors border-b-2 shrink-0 whitespace-nowrap ${
              activeTab === 'steps'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            {content.tabSteps}
          </button>
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-3.5 sm:px-4 py-2.5 transition-colors border-b-2 shrink-0 whitespace-nowrap ${
              activeTab === 'passport'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            {content.tabPassport}
          </button>
          <button
            onClick={() => setActiveTab('hand')}
            className={`px-3.5 sm:px-4 py-2.5 transition-colors border-b-2 shrink-0 whitespace-nowrap ${
              activeTab === 'hand'
                ? 'border-amber-400 text-amber-300 bg-amber-950/30 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            {content.tabHand}
          </button>
        </div>

        <div className="journey-guide-mobile" aria-live="polite">
          <div className="journey-guide-mobile-progress" aria-label={`${mobileStep + 1} / ${mobileSteps.length}`}>
            <span>{String(mobileStep + 1).padStart(2, '0')} / {String(mobileSteps.length).padStart(2, '0')}</span>
            <i><b style={{ width: `${((mobileStep + 1) / mobileSteps.length) * 100}%` }} /></i>
          </div>
          <article className="journey-guide-mobile-card" key={mobileStep}>
            <span className="journey-guide-mobile-icon" aria-hidden="true">{currentMobileStep.icon}</span>
            <small>{currentMobileStep.eyebrow}</small>
            <h3>{currentMobileStep.title}</h3>
            <p>{currentMobileStep.body}</p>
            <aside><span aria-hidden="true">→</span>{currentMobileStep.note}</aside>
          </article>
          <div className="journey-guide-mobile-dots" aria-hidden="true">
            {mobileSteps.map((_, index) => <i key={index} className={index === mobileStep ? 'active' : index < mobileStep ? 'done' : ''} />)}
          </div>
        </div>

        {/* Content Body */}
        <div className="journey-guide-desktop-body p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-stone-300 font-sans text-xs sm:text-sm leading-relaxed max-h-[58vh] break-words">
          {activeTab === 'story' && (
            <div className="space-y-3.5 sm:space-y-4 animate-fadeIn">
              <div className="p-3 sm:p-4 border-l-4 border-amber-500 bg-amber-950/20 text-amber-100 font-serif text-sm sm:text-base italic leading-relaxed">
                "{content.storyHeader}"
              </div>
              <p className="leading-relaxed">{content.storyP1}</p>
              <p className="leading-relaxed">{content.storyP2}</p>
              <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/50 border-2 border-amber-400/70 shadow-[0_4px_20px_rgba(214,173,103,0.15)] text-amber-100 space-y-1.5">
                <div className="flex items-center gap-2 font-serif font-bold text-xs sm:text-sm text-amber-300">
                  <span className="text-base sm:text-lg">🏛️</span>
                  <span>{content.specialEndingNoticeTitle}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-200 leading-relaxed font-sans">
                  {content.specialEndingNoticeBody}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2">
                <div className="p-2.5 sm:p-3 bg-stone-900/60 border border-stone-800">
                  <span className="text-[9px] sm:text-[10px] font-mono text-amber-400 uppercase block font-bold">05 VÙNG DI SẢN</span>
                  <span className="text-[11px] sm:text-xs text-stone-300 mt-1 block leading-normal">Quan họ, Ca trù, Nhã nhạc Cung đình, Gốm Bàu Trúc & Đờn ca tài tử</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-stone-900/60 border border-stone-800">
                  <span className="text-[9px] sm:text-[10px] font-mono text-amber-400 uppercase block font-bold">15 HIỆN VẬT PIXEL</span>
                  <span className="text-[11px] sm:text-xs text-stone-300 mt-1 block leading-normal">Xoay 360 độ 4 góc độ chân thực với bản thu âm chuẩn mực</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-stone-900/60 border border-stone-800">
                  <span className="text-[9px] sm:text-[10px] font-mono text-amber-400 uppercase block font-bold">100% NGUỒN UNESCO</span>
                  <span className="text-[11px] sm:text-xs text-stone-300 mt-1 block leading-normal">Đối chiếu trực tiếp từ tư liệu viện di sản và hồ sơ quốc tế</span>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 font-mono pt-1 leading-normal">{content.storyP3}</p>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-3.5 sm:space-y-4 animate-fadeIn">
              <h3 className="text-sm sm:text-base font-serif font-bold text-amber-300">
                {content.stepsTitle}
              </h3>

              <div className="flex gap-3 p-3 sm:p-3.5 bg-stone-900/60 border border-stone-800/80">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-amber-500 text-stone-950 font-serif font-bold text-sm sm:text-base flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-amber-200 text-xs sm:text-sm leading-snug">{content.step1Title}</h4>
                  <p className="text-[11px] sm:text-xs text-stone-300 mt-1 leading-relaxed">{content.step1Desc}</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 sm:p-3.5 bg-stone-900/60 border border-stone-800/80">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-amber-500 text-stone-950 font-serif font-bold text-sm sm:text-base flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-amber-200 text-xs sm:text-sm leading-snug">{content.step2Title}</h4>
                  <p className="text-[11px] sm:text-xs text-stone-300 mt-1 leading-relaxed">{content.step2Desc}</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 sm:p-3.5 bg-stone-900/60 border border-stone-800/80">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-amber-500 text-stone-950 font-serif font-bold text-sm sm:text-base flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-amber-200 text-xs sm:text-sm leading-snug">{content.step3Title}</h4>
                  <p className="text-[11px] sm:text-xs text-stone-300 mt-1 leading-relaxed">{content.step3Desc}</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 sm:p-3.5 bg-gradient-to-r from-amber-950/40 to-stone-900/80 border border-amber-500/50 shadow-sm">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-serif font-bold text-sm sm:text-base flex items-center justify-center shrink-0 shadow">
                  4
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-serif font-bold text-amber-300 text-xs sm:text-sm leading-snug">{content.step4Title}</h4>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">{language === 'vi' ? 'Lưu ý bắt buộc' : 'Required step'}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-amber-100/90 mt-1 leading-relaxed">{content.step4Desc}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'passport' && (
            <div className="space-y-3.5 sm:space-y-4 animate-fadeIn">
              <h3 className="text-sm sm:text-base font-serif font-bold text-amber-300">
                {content.passportTitle}
              </h3>
              <div className="p-3 sm:p-3.5 bg-amber-950/20 border border-amber-500/30 text-[11px] sm:text-xs text-amber-100 space-y-2 leading-relaxed">
                <p>{content.passportP1}</p>
              </div>
              <div className="p-3 sm:p-3.5 bg-stone-900/60 border border-stone-800 text-[11px] sm:text-xs text-stone-300 space-y-2 leading-relaxed">
                <p>{content.passportP2}</p>
              </div>
              <div className="p-3 sm:p-3.5 bg-stone-900/60 border border-stone-800 text-[11px] sm:text-xs text-stone-300 space-y-2 leading-relaxed">
                <p>{content.passportP3}</p>
              </div>
            </div>
          )}

          {activeTab === 'hand' && (
            <div className="space-y-3 sm:space-y-3.5 animate-fadeIn">
              <h3 className="text-sm sm:text-base font-serif font-bold text-amber-300">
                {content.handTitle}
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-300 leading-relaxed">{content.handP1}</p>
              <ul className="space-y-2 text-[11px] sm:text-xs">
                <li className="flex items-start gap-2 p-2.5 bg-stone-900/50 border border-stone-800 leading-relaxed">
                  <span className="text-amber-400 font-bold font-mono shrink-0">✦</span>
                  <span><strong>{content.handFeature1}</strong></span>
                </li>
                <li className="flex items-start gap-2 p-2.5 bg-stone-900/50 border border-stone-800 leading-relaxed">
                  <span className="text-amber-400 font-bold font-mono shrink-0">✦</span>
                  <span><strong>{content.handFeature2}</strong></span>
                </li>
                <li className="flex items-start gap-2 p-2.5 bg-stone-900/50 border border-stone-800 leading-relaxed">
                  <span className="text-amber-400 font-bold font-mono shrink-0">✦</span>
                  <span><strong>{content.handFeature3}</strong></span>
                </li>
              </ul>
              <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 text-[10px] sm:text-[11px] text-emerald-200 leading-relaxed">
                🛡 {content.privacyNote}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="journey-guide-desktop-footer p-3 sm:p-5 border-t border-stone-800 bg-stone-950 flex items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-mono text-stone-400 hover:text-stone-200 border border-stone-800 hover:border-stone-700 transition-colors"
          >
            {content.close}
          </button>

          {onStart && (
            <button
              onClick={() => {
                onClose();
                onStart();
              }}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-serif font-bold text-xs sm:text-sm tracking-wide shadow-md transition-transform hover:-translate-y-0.5 flex items-center gap-1.5 sm:gap-2 shrink-0"
            >
              <span>{content.startNow}</span>
              <span className="text-sm sm:text-base font-sans">→</span>
            </button>
          )}
        </div>
        <div className="journey-guide-mobile-footer">
          <button type="button" onClick={() => mobileStep === 0 ? onClose() : setMobileStep((step) => step - 1)}>
            {mobileStep === 0 ? content.close : (language === 'vi' ? '← Trước' : '← Back')}
          </button>
          {mobileStep < mobileSteps.length - 1 ? (
            <button type="button" className="primary" onClick={() => setMobileStep((step) => step + 1)}>
              {language === 'vi' ? 'Tiếp theo' : 'Next'} <span>→</span>
            </button>
          ) : onStart ? (
            <button type="button" className="primary" onClick={() => { onClose(); onStart(); }}>
              {content.startNow} <span>→</span>
            </button>
          ) : (
            <button type="button" className="primary" onClick={onClose}>
              {language === 'vi' ? 'Đã hiểu · Đóng' : 'Got it · Close'} <span>✓</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
