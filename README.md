# Tàu Di Sản Việt Nam

Một trải nghiệm point-and-click góc nhìn thứ nhất đưa người chơi lên chuyến tàu pixel Bắc–Nam. Người chơi nhận vé từ nhân vật soát vé, chọn một trong năm ga, khám phá đồ vật và mở hồ sơ song ngữ có nguồn, quyền sử dụng cùng trạng thái kiểm duyệt rõ ràng.

## Trải nghiệm chính

- Landing page hiện tại dẫn vào khoang tàu pixel chuyển động nhẹ.
- Nhân viên soát vé xuất hiện trong khoang tàu toàn màn hình; lời thoại bật dần ở cửa sổ phía dưới và đưa ra năm tấm vé chọn ga.
- Năm ga: Quan họ Kinh Bắc, Ca trù Hà Nội, Nhã nhạc Huế, gốm Chăm và Đờn ca tài tử Nam Bộ.
- Hotspot phát sáng khi con trỏ đến gần; mỗi vật phẩm mở hồ sơ tư liệu chi tiết, còn bản trình diễn của ga chỉ phát sau khi khám phá đủ ba dấu vết.
- Quan họ, Ca trù, Nhã nhạc và Đờn ca tài tử có trích đoạn mở khóa theo ga với nút phát/tạm dừng và thanh thời gian pixel. Ga gốm Chăm mở một lớp âm thanh giáo dục phối từ tiếng đất và lửa có giấy phép.
- Mỗi hồ sơ có bàn quan sát hand tracking: camera chỉ bật khi người chơi cấp quyền, xử lý khung hình cục bộ và luôn có chế độ kéo chuột/chạm thay thế. Điểm tạo hình gốm hỗ trợ hai tay để thay đổi hình khối minh họa.
- Trước khi ga được mở khóa, nhạc nền là soundscape hiện đại, trung tính; khi bản ghi ga phát, nền tự hạ để không chồng âm.
- Hộ chiếu di sản lưu tiến độ trên thiết bị và có thể xuất PDF/JSON kèm nguồn và quyền của âm thanh ga.

## Nguyên tắc văn hóa

Độ trung thực văn hóa là ràng buộc cao nhất của dự án:

- Không dùng nội dung AI sinh tự do làm lời nghệ nhân hoặc thẩm quyền cộng đồng.
- Không mô phỏng bí quyết, nghi lễ hoặc âm thanh nhạc cụ khi chưa có căn cứ và quyền sử dụng rõ ràng.
- Âm thanh biểu diễn tổng thể phải được ghi nhãn đúng; không gọi một bản hòa tấu là âm thanh riêng của một nhạc cụ.
- Thiếu nguồn thì hệ thống từ chối trả lời, không đoán.
- Trước khi dùng tại điểm di sản, toàn bộ nội dung cần được nghệ nhân/chuyên gia và đại diện cộng đồng có thẩm quyền rà soát trực tiếp.

Xem [CREDITS.md](./CREDITS.md) và [research/media-manifest.json](./research/media-manifest.json) để biết nguồn, giấy phép và phạm vi dùng của từng tài sản.

## Chạy cục bộ

Yêu cầu Node.js 22.13 trở lên.

```bash
npm install
npm run dev
```

Phiên bản này không cần biến môi trường hoặc khóa API. Luồng giọng nói/GPT cũ đã được gỡ khỏi giao diện và khỏi các route public; nội dung hiện vật được đóng gói từ hồ sơ nguồn đã duyệt.

Kiểm tra bản phát hành:

```bash
npm run lint
npm test
```

## Quyền riêng tư và khóa API

Repository không chứa khóa API và bản public không còn endpoint GPT/phiên âm. Hand tracking tải thư viện/mô hình MediaPipe rồi xử lý camera trong trình duyệt; không tải ảnh camera lên backend và không lưu dữ liệu cá nhân.

## Quyền sử dụng

Mã nguồn được phát hành theo [MIT License](./LICENSE). Giấy phép MIT **không** áp dụng chung cho nội dung văn hóa, bản ghi, ảnh minh họa hoặc tài sản media; từng tài sản tuân theo điều khoản ghi trong `CREDITS.md` và media manifest.
