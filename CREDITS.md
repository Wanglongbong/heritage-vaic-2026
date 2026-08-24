# Nguồn, quyền sử dụng và giới hạn văn hóa

Tàu Di Sản Việt Nam là prototype diễn giải. Nội dung văn hóa chỉ được rút gọn từ các hồ sơ kiểm chứng nêu dưới đây. Việc dẫn nguồn không đồng nghĩa UNESCO, nghệ nhân hoặc cộng đồng liên quan bảo trợ cho prototype. Bản phát hành tại điểm di sản vẫn phải được nghệ nhân/chuyên gia và đại diện cộng đồng rà soát, đồng thuận.

## Hồ sơ di sản

Các trang được truy cập ngày 2026-07-17:

- [Dân ca Quan họ Bắc Ninh](https://ich.unesco.org/en/RL/quan-h-bc-ninh-folk-songs-00183)
- [Chương trình hát Quan họ trên thuyền tại Lễ hội trái cây Bắc Ninh 2025](https://svhttdl.bacninh.gov.vn/vi/news/-/details/188850/chuong-trinh-nghe-thuat-hat-dan-ca-quan-ho-tren-thuyen-tai-le-hoi-trai-cay-bac-ninh-2025-81095830), Sở Văn hóa, Thể thao và Du lịch tỉnh Bắc Ninh — chỉ dùng tên tiết mục công khai, không sao chép lời ca hoặc bản ghi.
- [Hát Ca trù](https://ich.unesco.org/en/USL/ca-tru-singing-00309)
- [Nhã nhạc, âm nhạc cung đình Việt Nam](https://ich.unesco.org/en/RL/nha-nhac-vietnamese-court-music-00074)
- [Nghệ thuật làm gốm của người Chăm](https://ich.unesco.org/en/USL/art-of-pottery-making-of-chm-people-01574)
- [Nghệ thuật Đờn ca tài tử Nam Bộ](https://ich.unesco.org/en/RL/art-of-n-ca-tai-t-music-and-song-in-southern-viet-nam-00733)

Các liên kết này xác nhận dữ kiện văn hóa. Chúng không tự động cấp quyền sao chép hình ảnh, video, giọng nói, âm nhạc hoặc phần trình diễn trên trang.

## Âm thanh di sản được phục vụ cục bộ

`public/media/ca-tru-sound-futures.ogg` là đoạn 22 giây từ [Ca Tru Club performance](https://commons.wikimedia.org/wiki/File:Ca_Tru_Club_performance.ogv), tác giả/đơn vị ghi: Sound Futures, giấy phép [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Tệp được cắt từ khoảng giây thứ 8 và chuyển mã sang Opus trong container Ogg; nội dung biểu diễn không bị phối lại.

Nguồn mô tả đây là phần trình diễn gồm giọng Ca trù, đàn đáy và trống. Vì vậy game luôn ghi nhãn **đoạn trích cả nhóm**, không tuyên bố đây là âm thanh tách riêng của đàn đáy, phách hay trống chầu.

Ba trích đoạn do chủ dự án cung cấp và xác nhận quyền dùng công khai trong Tàu Di Sản Việt Nam ngày 25/08/2026 cũng được phục vụ sau khi người chơi mở đủ ba vật phẩm của ga:

- `public/media/quan-ho-unlock.ogg`: [Quan họ Bắc Ninh folk songs](https://www.youtube.com/watch?v=MlKtqU5685w), trích 03:18–04:48 (90 giây), nguồn công bố UNESCO / Vietnam Institute of Culture and Arts Studies.
- `public/media/nha-nhac-unlock.ogg`: [Nhã nhạc cung đình Huế](https://www.youtube.com/watch?v=wnFZ5QAWGUo), trích 38:00–39:40 (100 giây), ghi nguồn theo kênh Sở Văn hóa và Thể thao Ninh Bình; game không gọi đây là bản master do Huế cung cấp.
- `public/media/don-ca-tai-tu-unlock.ogg`: [Đờn ca tài tử Nam Bộ (phần thứ hai)](https://www.youtube.com/watch?v=FILr_-RPXBs), trích 12:50–14:20 (90 giây), ghi nguồn theo kênh Đăng Hoành Loan.

Các xác nhận trên là căn cứ quyền phát hành của dự án; việc ghi nguồn hoặc có quyền dùng không thay thế thẩm định nội dung của nghệ nhân/chuyên gia. Các tệp được chuẩn hóa Ogg/Opus, có fade đầu/cuối; thời lượng, kích thước và SHA-256 nằm trong manifest.

Hai tệp bối cảnh thực được phục vụ với nhãn giới hạn rõ ràng:

- `public/media/clay-sculpting.mp3`: [Spreading](https://freesound.org/people/manuelaurreaf/sounds/490100/) của manuelaurreaf, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Đây là tiếng thao tác đất nói chung, không phải bản ghi nghệ nhân Chăm hay bằng chứng về kỹ thuật nghề.
- `public/media/open-fire.mp3`: [Fire Crackling 01.wav](https://freesound.org/people/kingsrow/sounds/181563/) của kingsrow, [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Đây là tiếng lửa thật tạo bối cảnh, không phải tư liệu một lần nung gốm Chăm cụ thể.
- `public/media/cham-workyard-unlock.ogg`: lớp âm thanh giáo dục phối từ hai nguồn trên. Đây không phải bản ghi tại xưởng Chăm, buổi thực hành, nghi lễ hay bài dạy kỹ thuật.

Thông tin máy đọc được, thời lượng, kích thước và mã kiểm tra tệp nằm trong `public/media/audio-manifest.json`.

## Giới hạn âm thanh nhạc cụ

Game không phát một bản hòa tấu dưới nhãn “tiếng riêng” của đàn đáy, phách, trống chầu, đàn kìm hoặc đàn tranh. Bản đàn đáy tải về trước đó không được dùng vì trang nguồn cấm đăng lại. Khi bổ sung bản ghi mới, phải lưu bằng chứng về người biểu diễn, người ghi/nhà sản xuất, chủ thể quyền, giấy phép, phạm vi, thời hạn, quyền rút lại và yêu cầu ghi công.

## Nhạc nền mới do dự án tạo

Sáu lớp nhạc nền nhẹ — toa tàu và năm ga — được tổng hợp trong trình duyệt bằng mã của prototype, gồm không gian môi trường, hòa âm kéo dài và mô-típ chuông điện tử chậm; không lấy mẫu từ bản ghi bên ngoài. Đây là **thiết kế âm thanh hiện đại trung tính**, không phải âm nhạc truyền thống, bản ghi thực địa hay mô phỏng giai điệu di sản.

Các âm hiệu vật phẩm tổng hợp trước đây đã bị loại bỏ. Mã tổng hợp chỉ còn tạo sáu lớp nhạc nền hiện đại trung tính; vật phẩm chỉ phát bản ghi thật có quyền rõ ràng hoặc hiển thị liên kết nguồn đang chờ quyền.

## Hand tracking và quyền riêng tư

Tính năng quan sát hiện vật dùng MediaPipe Tasks Vision trong trình duyệt. Cách phân vai tay phải/tay trái và bộ lọc ổn định ba khung hình được điều chỉnh từ dự án cục bộ `HandPilot-Mac`/“HandPilot Native” của chủ repository: tay phải xoay bốn hướng, tay trái mở/nắm để đổi mức phóng đại. Chỉ sau khi người chơi chủ động bấm bật và cấp quyền, hình camera mới được xử lý cục bộ để lấy tọa độ bàn tay; game không tải khung hình lên máy chủ và không lưu ảnh, video hoặc dữ liệu sinh trắc học. Mô hình/WASM được tải từ hạ tầng công khai của Google MediaPipe và jsDelivr. Khi camera bị từ chối hoặc không hỗ trợ, kéo chuột/chạm và bốn nút chọn mặt vẫn hoạt động đầy đủ.

## Minh họa pixel

Năm cảnh trong `public/scenes/` và ảnh bìa đầu hành trình `public/og.webp` là minh họa gốc do OpenAI ImageGen tạo cho prototype dựa trên phần mô tả công khai trong các hồ sơ UNESCO. Chúng là không gian diễn giải, không phải ảnh tư liệu, bản phục dựng nghi lễ hoặc lời xác nhận của nghệ nhân.

Mười lăm sprite chính trong `public/artifacts/` được OpenAI ImageGen tạo lại theo pixel 2D nền trong suốt, dùng ảnh thật có giấy phép mở làm tham chiếu hình dáng. Sáu mươi góc nhìn trong `public/artifacts/turn/` tiếp tục lấy chính các sprite đã duyệt đó làm khóa nhận dạng, gồm bốn hướng trước–phải–sau–trái cho mỗi điểm tương tác. Mỗi sprite là minh họa quan sát, không phải ảnh tư liệu, mô hình quét 3D hay sơ đồ cấu tạo. Các mặt bên/sau do mô hình suy diễn bảo thủ, không được dùng làm bằng chứng về hoa văn, kết cấu, trang phục hoặc kỹ thuật chưa thấy trong nguồn. Nguồn theo nhóm:

- Quan họ: [Nón quai thao](https://commons.wikimedia.org/wiki/File:N%C3%B3n_quai_thao.jpg), Petr Ruzicka, CC BY 2.0; [Quan Ho-Ensemble](https://commons.wikimedia.org/wiki/File:Quan_Ho-Ensemble.JPG), Chrisvomberg, CC BY-SA 3.0; [300 bai Quan ho](https://commons.wikimedia.org/wiki/File:300_bai_Quan_ho.jpg), Chinhatm, CC BY-SA 4.0.
- Ca trù: [Dan day player](https://commons.wikimedia.org/wiki/File:Dan_day_player.jpg), spotter_nl, CC BY 2.0; [Ca trù performance](https://commons.wikimedia.org/wiki/File:Ca_tr%C3%B9_performance.jpg), Michael Coghlan, CC BY-SA 2.0. Phách và trống chầu được đối chiếu trong bối cảnh ảnh trình diễn, không tuyên bố là bản sao của một hiện vật cụ thể.
- Nhã nhạc: [Imperial orchestra performing in front of the Thái Hòa palace](https://commons.wikimedia.org/wiki/File:Imperial_orchestra_performing_in_front_of_the_Th%C3%A1i_H%C3%B2a_palace_-_Ch01_sub01_04_vn.jpg), phạm vi công cộng; [Nhã nhạc cung đình Huế](https://commons.wikimedia.org/wiki/File:Nh%C3%A3_nh%E1%BA%A1c_cung_%C4%91%C3%ACnh_Hu%E1%BA%BF.JPG), Lưu Ly, phạm vi công cộng; [DGJ_1178 - Ngo Mon Gate](https://www.flickr.com/photos/22490717@N02/3442074085), Dennis Jarvis, CC BY-SA 2.0.
- Gốm Chăm: [Cham culture pottery and tools](https://commons.wikimedia.org/wiki/File:Cham_culture_pottery_and_tools,_Museum_of_Western_Bohemia,_187741.jpg), Zde, CC BY-SA 4.0; [Gốm Bàu Trúc](https://commons.wikimedia.org/wiki/File:G%E1%BB%91m_B%C3%A0u_Tr%C3%BAc.JPG), Liftold, CC BY-SA 3.0; [experimental woodfiring day 10](https://www.flickr.com/photos/65749227@N00/6088270137), robynejay, CC BY-SA 2.0. Ảnh lửa chỉ tham chiếu bố cục nung ngoài trời nói chung, không được coi là tư liệu một lần nung Chăm.
- Đờn ca tài tử: [Dan nguyet — Vietnam Museum of Ethnology](https://commons.wikimedia.org/wiki/File:Dan_nguyet_(two-stringed_lute)_-_Vietnam_Museum_of_Ethnology_-_Hanoi,_Vietnam_-_DSC02533.JPG), Daderot, CC0; [Ðàn Tranh](https://commons.wikimedia.org/wiki/File:%C3%90%C3%A0n_Tranh.jpg), Eustaquio Santimano, CC BY 2.0; [Mô hình đờn ca tài tử](https://commons.wikimedia.org/wiki/File:M%C3%B4_h%C3%ACnh_%C4%91%E1%BB%9Dn_ca_t%C3%A0i_t%E1%BB%AD.jpg), Bùi Thụy Đào Nguyên, CC BY-SA 3.0.

Các hình tàu và bối cảnh đường sắt mới cũng do OpenAI ImageGen tạo, nhưng được dự án xem và ghi công như các bản chuyển thể pixel từ ảnh đường sắt Việt Nam có giấy phép mở:

- `public/train/hai-van-journey.webp` tham chiếu bố cục tuyến đường sắt ven núi và biển trong [Hai Van Pass, Vietnam, North-South Railway](https://commons.wikimedia.org/wiki/File:Hai_Van_Pass,_Vietnam,_North-South_Railway.jpg), Vyacheslav Argenberg, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Hình đã được vẽ lại thành phong cảnh pixel 2D và thay đổi màu, thời điểm trong ngày, chi tiết cùng bố cục.
- `public/train/coastal-transit-v2.webp` tiếp tục tham chiếu cảnh quan đèo, biển và đường sắt từ [Hai Van Pass, Vietnam, North-South Railway](https://commons.wikimedia.org/wiki/File:Hai_Van_Pass,_Vietnam,_North-South_Railway.jpg), Vyacheslav Argenberg, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Hình được tái bố cục thành phông nền pixel nhìn ngang cho chuyển cảnh; không phải ảnh tư liệu hay phục dựng chính xác địa hình và tuyến ray.
- `public/train/heritage-express.webp` tham chiếu dáng đầu máy và bảng màu từ [Train passing Lang Co](https://commons.wikimedia.org/wiki/File:Train_passing_Lang_Co.jpg), Emilio Labrador, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). Hình đã được vẽ lại, đơn giản hóa và ghép với ba toa hư cấu; không giữ logo, số hiệu hoặc dấu hiệu nhận diện nhà vận hành.
- `public/train/straight-track-v2.png` là lớp đường ray pixel do OpenAI ImageGen tạo theo phong cách dự án và chuỗi phái sinh của `public/train/heritage-express.webp`, bắt nguồn từ [Train passing Lang Co](https://commons.wikimedia.org/wiki/File:Train_passing_Lang_Co.jpg), Emilio Labrador, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). Đây chỉ là lớp đồ họa chuyển động hư cấu, không phải phục dựng lịch sử hoặc mô tả kỹ thuật chính xác một tuyến ray.
- `public/train/heritage-carriage.webp` tham chiếu tỷ lệ ghế, rèm và lối đi trong [Soft Seats on Vietnam Railways SE4](https://commons.wikimedia.org/wiki/File:Soft_Seats_on_Vietnam_Railways_SE4.JPG), Dragfyre, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Hình đã được vẽ lại thành khoang tàu pixel hư cấu. Bản chuyển thể này được cung cấp theo CC BY-SA 3.0.

`public/characters/ticket-conductor-v2.png` là nhân vật nhân viên đưa vé hư cấu do OpenAI ImageGen tạo. Tài sản chỉ tham chiếu bối cảnh phục vụ và các nét đồng phục khái quát từ [VNR employee pouring soup](https://commons.wikimedia.org/wiki/File:VNR_employee_pouring_soup.jpg), anjči, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/), truy cập ngày 2026-07-18. Khuôn mặt đã được tạo mới theo hướng chung, còn xe phục vụ, thức ăn và logo đều bị loại bỏ. Dự án không tuyên bố người trong ảnh nguồn là nhân viên soát vé; đồng phục trong ảnh có thể không còn hiện hành, và tài sản không hàm ý người được chụp, tác giả, đơn vị đường sắt hay Wikimedia Commons bảo trợ dự án.

“Tàu Di Sản” là thiết kế diễn giải hư cấu lấy cảm hứng từ đường sắt Việt Nam, không phải bản phục dựng chính xác một đoàn tàu lịch sử và không hàm ý đơn vị đường sắt, tác giả ảnh hay Wikimedia Commons bảo trợ dự án. Các ảnh tham khảo gốc không được phân phối cùng repository. Danh mục tài sản thực tế nằm trong `research/media-manifest.json`.

## Giấy phép dự án

Giấy phép MIT chỉ áp dụng cho mã nguồn. Nội dung và tài sản truyền thông giữ điều kiện riêng ghi tại đây và trong manifest; MIT không cấp lại quyền đối với bản ghi Ca trù CC BY 3.0, nội dung nguồn UNESCO hay quyền văn hóa của cộng đồng.

## Điều kiện trước khi phát hành tại cộng đồng

Trước khi triển khai chính thức cần có biên bản rà soát nội dung và phát âm, quy tắc ghi công, quyền đồng ý/rút lại, phạm vi lưu trữ, thời hạn sử dụng, quyền truy cập bản lưu trữ và giấy phép cho từng bản ghi từ nghệ nhân/chuyên gia cùng đại diện cộng đồng có thẩm quyền. Nội dung chưa qua bước này phải được ghi rõ là “kiểm chứng nguồn tư liệu, đang chờ cộng đồng rà soát”.
