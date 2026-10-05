# HƯỚNG DẪN CÀI ĐẶT & SỬ DỤNG ỨNG DỤNG POKER SHOT CLOCK (iOS .IPA)

Ứng dụng **Poker Shot Clock** được xây dựng clone hoàn chỉnh theo chuẩn trang web [BasePoker Shot Clock](https://tools.basepoker.com/en/shotclock/) với đầy đủ các tính năng nâng cao:
- **Tự do điều chỉnh thời gian**: Chọn nhanh 15s, 20s, 30s, 45s, 60s hoặc nhập số giây bất kỳ (3s - 600s).
- **Tự do điều chỉnh mốc thời gian cảnh báo**:
  - Mốc Vàng (Amber Warning): VD còn 10 giây bắt đầu cảnh báo.
  - Mốc Đỏ (Red Critical): VD còn 5 giây chuyển sang chế độ khẩn cấp (nháy số và đếm tích tắc từng giây).
- **Tự custom âm thanh cảnh báo & âm thanh hết giờ bằng GHI ÂM TRỰC TIẾP**:
  - Có thể thu âm giọng nói của bạn trực tiếp bằng micro của iPhone (VD: *"Còn 10 giây nhé!"*, *"Hết giờ! Bỏ bài! Fold!"*).
  - Có nút nghe thử (Test), xóa ghi lại, hoặc tải file âm thanh (.mp3, .wav, .m4a) từ máy.
  - Tùy chọn 3 chế độ âm thanh: **Beep điện tử chuẩn** / **Giọng đọc tự động TTS** / **Bản ghi âm giọng nói riêng**.
- **Thẻ gia hạn (Time Extension)**: Nút `+30` (hoặc `+15s`, `+60s`) để dealer/người chơi bấm cộng thêm giờ ngay tức thì kèm âm thanh và rung.
- **Xoay màn hình 90° (Virtual Rotate)**: Cho phép đặt điện thoại nằm ngang dọc bàn poker ngay cả khi iPhone đang khóa xoay màn hình dọc.
- **Giữ màn hình luôn sáng (Keep Awake)**: Đảm bảo màn hình không bị khóa hay tắt ngắt quãng ván bài.
- **Rung phản hồi (Haptics)**: Rung điện thoại khi bấm nút, khi vào giây cảnh báo và khi hết giờ.

---

## 1. FILE .IPA ĐÃ ĐƯỢC TẠO SẴN

File `.ipa` đã được đóng gói hoàn tất tại thư mục gốc của dự án:
```
D:\Time-tap\ShotClock.ipa
```

---

## 2. CÁC CÁCH CÀI ĐẶT LÊN IPHONE

### CÁCH 1: Cài đặt qua Sideloadly (Khuyên dùng - Đơn giản nhất trên máy tính)
1. Tải phần mềm **Sideloadly** miễn phí tại: [https://sideloadly.io/](https://sideloadly.io/) (chọn bản cho Windows 64-bit).
2. Kết nối iPhone với máy tính bằng cáp sạc USB. Mở khóa màn hình iPhone và chọn **"Tin cậy máy tính này" (Trust)** nếu được hỏi.
3. Mở phần mềm Sideloadly trên máy tính:
   - Kéo file `D:\Time-tap\ShotClock.ipa` thả vào ô IPA trên Sideloadly.
   - Nhập tài khoản Apple ID của bạn vào ô **Apple ID** (dùng tài khoản Apple cá nhân miễn phí để ký app).
   - Bấm nút **Start**.
4. Chờ 1 - 2 phút, Sideloadly sẽ tự động ký chứng chỉ và cài app vào iPhone của bạn.
5. **Kích hoạt quyền mở app trên iPhone (chỉ cần làm lần đầu)**:
   - Vào **Cài đặt (Settings)** trên iPhone > **Cài đặt chung (General)** > **Quản lý VPN & Thiết bị (VPN & Device Management)**.
   - Tìm dòng tài khoản Apple ID của bạn > Bấm **"Tin cậy" (Trust)**.
   - Nếu bạn dùng iOS 16 trở lên: Vào *Cài đặt > Quyền riêng tư & Bảo mật > Chế độ nhà phát triển (Developer Mode)* > Bật ON và khởi động lại iPhone.
6. Mở app **Poker Shot Clock** và tận hưởng!

---

### CÁCH 2: Cài đặt qua TrollStore (Dành cho iPhone chạy iOS 14.0 - 17.0)
Nếu iPhone của bạn đã cài TrollStore:
1. Gửi file `ShotClock.ipa` vào iPhone (qua AirDrop, Zalo, Telegram, Google Drive...).
2. Bấm vào file `ShotClock.ipa` > Chọn chia sẻ sang **TrollStore**.
3. Bấm **Install**. Ứng dụng sẽ được cài vĩnh viễn, không bao giờ bị thu hồi chứng chỉ (No Revoke) và không cần máy tính.

---

### CÁCH 3: Cài đặt qua AltStore / Scarlet / GBox / 3uTools
- **AltStore**: Mở AltStore trên iPhone > bấm dấu `+` ở góc trên tab My Apps > Chọn file `ShotClock.ipa`.
- **3uTools**: Cắm iPhone vào máy tính > Mở 3uTools > Vào mục *Apps > Import & Install ipa* > Chọn file `ShotClock.ipa`.

---

### CÁCH 4: Cài trực tiếp trên iPhone qua Safari (Không cần máy tính, không lo hết hạn)
Ứng dụng được thiết kế tương thích chuẩn PWA (Progressive Web App):
1. Chạy ứng dụng trên mạng LAN hoặc đưa lên host miễn phí (Vercel, Netlify, Render hoặc GitHub Pages).
2. Dùng trình duyệt **Safari** trên iPhone mở đường link web.
3. Bấm vào biểu tượng **Chia sẻ (Share)** ở thanh công cụ phía dưới của Safari (hình ô vuông có mũi tên chỉ lên).
4. Cuộn xuống và chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
5. Biểu tượng **Poker Shot Clock** sẽ xuất hiện trên màn hình chính như một ứng dụng cài từ App Store:
   - Chạy toàn màn hình (không có thanh địa chỉ Safari).
   - Hỗ trợ đầy đủ micro ghi âm, âm thanh, rung, giữ màn hình sáng.
   - Không bị giới hạn 7 ngày chứng chỉ.

---

## 3. HƯỚNG DẪN TỰ ĐIỀU CHỈNH THỜI GIAN & GHI ÂM

1. Bấm vào biểu tượng **Bánh răng (Cài đặt)** ở góc dưới cùng bên phải để mở bảng cài đặt.
2. **Chỉnh thời gian lượt chơi**:
   - Chọn nhanh các mốc: `15s`, `20s`, `30s`, `45s`, `60s` hoặc nhập số giây tùy thích vào ô bên cạnh (VD: `25` giây).
3. **Chỉnh thẻ gia hạn (Time Extension)**:
   - Chọn `+15s`, `+30s`, `+60s` hoặc nhập số giây riêng. Nếu không chơi luật gia hạn, chọn `Tắt`.
4. **Chỉnh mốc đổi màu cảnh báo**:
   - Ô **Vàng cảnh báo**: Nhập số giây bắt đầu đổi sang màu vàng và phát âm thanh cảnh báo (mặc định: `10` giây).
   - Ô **Đỏ khẩn cấp**: Nhập số giây đếm ngược gấp rút nháy đỏ và tích tắc từng giây (mặc định: `5` giây).
5. **GHI ÂM ÂM THANH CẢNH BÁO & HẾT GIỜ**:
   - Bấm chọn mục **🎙️ Ghi âm tùy chỉnh riêng**.
   - Bấm **🎙️ Ghi âm**: Trình duyệt/App sẽ yêu cầu quyền Micro (hãy chọn *Cho phép*).
   - Nói vào micro câu bạn muốn (VD: *"Chú ý, còn 10 giây!"* hoặc *"Hết giờ, bỏ bài!"*).
   - Bấm **⏹️ Dừng & Lưu**.
   - Bấm **▶️ Nghe thử** để nghe lại âm thanh bạn vừa thu.
   - Bạn cũng có thể bấm **📁 Tải file âm thanh** nếu muốn chọn file nhạc có sẵn trên điện thoại.
6. Bấm **Lưu & Đóng**.

---

## 4. PHÍM TẮT & THAO TÁC ĐIỀU KHIỂN

| Phím / Thao tác | Chức năng |
| :--- | :--- |
| **Chạm vào màn hình** | Bắt đầu đếm ngược hoặc Reset lại từ đầu ngay lập tức |
| **Nút `+30` (hoặc phím E)** | Thêm thời gian gia hạn cho người chơi |
| **Nút Tạm dừng (hoặc phím P)** | Tạm dừng hoặc Tiếp tục đồng hồ |
| **Nút Xoay (hoặc phím R)** | Xoay màn hình 90° để nhìn ngang trên bàn poker |
| **Nút Toàn màn hình (hoặc phím F)** | Bật/tắt chế độ toàn màn hình |
| **Nút Cài đặt (hoặc phím S)** | Mở menu tùy chỉnh thời gian và âm thanh ghi âm |
| **Nút VI / EN ở góc trên** | Chuyển đổi ngôn ngữ Tiếng Việt / Tiếng Anh |

---

## 5. DÀNH CHO LẬP TRÌNH VIÊN: TỰ BUILD LẠI FILE .IPA

Nếu bạn chỉnh sửa mã nguồn và muốn đóng gói lại file `.ipa`, chỉ cần chạy lệnh sau trong PowerShell:
```powershell
npm run build:ipa
```
Lệnh trên sẽ tự động:
1. Biên dịch TypeScript & Vite tối ưu hóa code.
2. Đồng bộ hóa với project Capacitor iOS.
3. Đóng gói toàn bộ tài nguyên vào `ShotClock.ipa`.
