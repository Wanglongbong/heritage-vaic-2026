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

Đây là bản ghi di sản duy nhất hiện được game phục vụ cục bộ. Thông tin máy đọc được nằm trong `public/media/audio-manifest.json`.

## Bản ghi đang chờ quyền

Quan họ, Nhã nhạc và Đờn ca tài tử hiện chỉ có liên kết tham chiếu đến hồ sơ UNESCO. Chưa xác nhận được giấy phép tái sử dụng cho bản ghi phù hợp, nên các mục này có `src: null`, trạng thái `pending-rights`, và **không tải xuống, trích xuất, phát thay hoặc lưu lại**.

Không dùng một nhạc cụ gần giống để giả làm nhạc cụ được mô tả. Không trích âm thanh từ YouTube hoặc nền tảng khác nếu chủ thể quyền chưa cấp phép rõ ràng. Khi có bản ghi mới, cần lưu bằng chứng về người biểu diễn, người ghi/nhà sản xuất, chủ thể quyền, giấy phép, phạm vi lãnh thổ, thời hạn, quyền rút lại và yêu cầu ghi công.

## Âm thanh mới do dự án tạo

Sáu lớp nhạc nền nhẹ — toa tàu và năm ga — được tổng hợp trong trình duyệt bằng mã của prototype, gồm không gian môi trường, hòa âm kéo dài và mô-típ chuông điện tử chậm; không lấy mẫu từ bản ghi bên ngoài. Đây là **thiết kế âm thanh hiện đại trung tính**, không phải âm nhạc truyền thống, bản ghi thực địa hay mô phỏng giai điệu di sản.

Mười một âm hiệu tương tác cũng được tổng hợp trong trình duyệt: thao tác đất, lửa, ba vai trò Ca trù, ba điểm Nhã nhạc và ba điểm Đờn ca tài tử. Chúng chỉ giúp phân biệt thao tác hoặc vai trò nghe, không phải âm thanh thực địa, không mô tả bí quyết nghề, không tái tạo làn điệu/kỹ thuật trình diễn và không được ghi nhãn là tiếng nhạc cụ thật. Mã tạo âm thanh thuộc giấy phép MIT cùng mã nguồn dự án; không có tệp ghi âm được cấp phép riêng dưới tên cộng đồng.

## Hand tracking và quyền riêng tư

Tính năng quan sát hiện vật dùng MediaPipe Tasks Vision trong trình duyệt. Chỉ sau khi người chơi chủ động bấm bật và cấp quyền, hình camera mới được xử lý cục bộ để lấy tọa độ bàn tay; game không tải khung hình lên máy chủ và không lưu ảnh, video hoặc dữ liệu sinh trắc học. Mô hình/WASM được tải từ hạ tầng công khai của Google MediaPipe và jsDelivr. Khi camera bị từ chối hoặc không hỗ trợ, kéo chuột/chạm vẫn hoạt động đầy đủ.

## Minh họa pixel

Năm cảnh trong `public/scenes/` và ảnh giới thiệu là minh họa gốc do OpenAI ImageGen tạo cho prototype dựa trên phần mô tả công khai trong các hồ sơ UNESCO. Chúng là không gian diễn giải, không phải ảnh tư liệu, bản phục dựng nghi lễ hoặc lời xác nhận của nghệ nhân.

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
