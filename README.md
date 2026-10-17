# 🛡️ Porn Blocker & Mindful Encouragement (StevenBlack Filter v1.1.0)

> **Userscript chặn các trang web khiêu dâm tự động dựa trên danh sách StevenBlack Hosts (hơn 76.000 tên miền) kết hợp nhận diện từ khóa thông minh, tự động cập nhật định kỳ, đi kèm giao diện động viên thức tỉnh ý chí, bài tập thở tĩnh tâm và bộ đếm số lần vượt qua cám dỗ.**

---

## 🚀 Cài Đặt Nhanh (1-Click Install)

### 📌 Yêu cầu tiên quyết:
Trình duyệt của bạn (Chrome, Edge, Firefox, Brave, Opera, Cốc Cốc,...) cần cài đặt tiện ích mở rộng **Tampermonkey**:
- 👉 [Cài đặt Tampermonkey cho Chrome / Brave / Edge / Cốc Cốc](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- 👉 [Cài đặt Tampermonkey cho Firefox](https://addons.mozilla.org/vi/firefox/addon/tampermonkey/)

### ⚡ Cài đặt / Cập nhật Userscript:
Nhấp chuột vào liên kết dưới đây để cài đặt hoặc cập nhật phiên bản mới nhất:

👉 **[BẤM VÀO ĐÂY ĐỂ CÀI ĐẶT PORN BLOCKER USERSCRIPT (v1.1.0)](https://raw.githubusercontent.com/ngxuanhai123/tampermonkey-porn-blocker/main/porn-blocker.user.js)**

*(Sau khi bấm vào link, màn hình cài đặt của Tampermonkey sẽ xuất hiện. Bạn chỉ cần nhấn nút **Cài đặt** hoặc **Cập nhật** là xong).*

> ⚠️ **Lưu ý quan trọng cho người dùng Google Chrome (Manifest V3):**
> Trong trình duyệt Chrome, hãy đảm bảo bạn đã bật **Chế độ dành cho nhà phát triển (Developer mode)** trong trang Quản lý tiện ích (`chrome://extensions/`) để Tampermonkey có quyền chạy trên tất cả các trang web.

---

## ✨ Điểm Nâng Cấp Vượt Trội (Phiên Bản 1.1.0)

1. **Hệ Thống Phòng Thủ 3 Lớp (Triệt Để 100%)**:
   - **Lớp 1 - Nhận diện thông minh (Smart Heuristic Detection)**: Tự động phát hiện và chặn đứng mọi trang web có từ khóa khiêu dâm (`porn`, `xxx`, `xvideos`, `xnxx`, `vlxx`, `phimsex`, `chich`, `hentai`, `jav`, `lauxanh`, `thiendia`,...) ngay cả khi trang web đó mới được tạo cách đây vài phút và chưa kịp đưa vào danh sách chặn.
   - **Lớp 2 - Danh sách 546 tên miền tích hợp sẵn**: Chặn ngay lập tức các trang web đen phổ biến của quốc tế và Việt Nam (từ nguồn `bigdargon/hostsVN`) ngay từ giây đầu tiên cài đặt mà không cần chờ tải dữ liệu.
   - **Lớp 3 - Bộ lọc khổng lồ StevenBlack Hosts**: Đồng bộ hơn **76.000 tên miền** qua mạng CDN toàn cầu.

2. **Màn Hình Phong Tỏa Tuyệt Đối (Full-Screen Shield)**:
   - Sử dụng cơ chế màn chắn độc lập (`z-index: 2147483647`) kết hợp với `MutationObserver` liên tục giám sát.
   - Tự động tắt tiếng và tạm dừng mọi video/âm thanh ngầm.
   - Không bị ghi đè, không bị lỗi Content Security Policy (CSP) của trang web đen.

3. **Máy Chủ CDN Tốc Độ Cao Kép**:
   - Tự động tải bộ lọc qua mạng CDN **jsDelivr** (có máy chủ tại Singapore/Việt Nam) giúp tải siêu nhanh và không bao giờ bị nghẽn mạng.
   - Tự động chuyển tiếp sang GitHub raw nếu có sự cố.

4. **Giao Diện Động Viên & Can Thiệp Tâm Lý (Mindful Shield)**:
   - **Kho danh ngôn thức tỉnh**: Chọn ngẫu nhiên các câu nói tâm đắc đánh mạnh vào ý chí, bản lĩnh, kỷ luật bản thân và cảnh báo tác hại của dopamine rẻ tiền.
   - **Bài tập thở tĩnh tâm 4-4-4-4 (Box Breathing)**: Vòng tròn hiệu ứng thở có nhịp đếm thời gian thực (*Hít vào 4s – Giữ 4s – Thở ra 4s – Tĩnh tâm 4s*) giúp hạ hưng phấn thần kinh, lấy lại sự bình tĩnh.
   - **Bộ đếm chiến thắng**: Ghi nhận số lần bạn đã vượt qua cám dỗ.
   - **Nút thoát hiểm nhanh**: Đóng tab ngay lập tức, chuyển hướng về Google hoặc mở nhạc Lofi thư giãn.

5. **Hiệu Năng Cực Nhanh (Zero Lag)**:
   - Tích hợp sẵn Whitelist các dịch vụ thông dụng (Google, Youtube, Facebook, Github, Zalo, Shopee, Báo chí,...) giúp duyệt web hàng ngày hoàn toàn mượt mà.

---

## 🛠️ Cài Đặt Thủ Công (Nếu không cài được tự động)

1. Mở tiện ích **Tampermonkey** trên trình duyệt của bạn.
2. Chọn mục **Bảng điều khiển (Dashboard)** -> Chọn biểu tượng dấu cộng **`+`** (Thêm script mới).
3. Xóa hết code mặc định, sau đó mở file [`porn-blocker.user.js`](https://raw.githubusercontent.com/ngxuanhai123/tampermonkey-porn-blocker/main/porn-blocker.user.js), copy toàn bộ nội dung và dán vào.
4. Nhấn **File** -> **Save** (hoặc tổ hợp phím `Ctrl + S`).
