# 🛡️ Porn Blocker & Mindful Encouragement (StevenBlack Filter)

> **Userscript chặn các trang web khiêu dâm tự động dựa trên danh sách StevenBlack Hosts (hơn 76.000 tên miền), tự động cập nhật định kỳ, đi kèm giao diện động viên thức tỉnh ý chí, bài tập thở tĩnh tâm và bộ đếm số lần vượt qua cám dỗ.**

---

## 🚀 Cài Đặt Nhanh (1-Click Install)

### 📌 Yêu cầu tiên quyết:
Trình duyệt của bạn (Chrome, Edge, Firefox, Brave, Opera, Cốc Cốc,...) cần cài đặt tiện ích mở rộng **Tampermonkey**:
- 👉 [Cài đặt Tampermonkey cho Chrome / Brave / Edge / Cốc Cốc](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- 👉 [Cài đặt Tampermonkey cho Firefox](https://addons.mozilla.org/vi/firefox/addon/tampermonkey/)

### ⚡ Cài đặt Userscript:
Nhấp chuột vào liên kết dưới đây để cài đặt trực tiếp vào Tampermonkey:

👉 **[Bấm vào đây để cài đặt Porn Blocker Userscript](https://raw.githubusercontent.com/ngxuanhai123/tampermonkey-porn-blocker/main/porn-blocker.user.js)**

*(Sau khi bấm vào link, màn hình cài đặt của Tampermonkey sẽ tự động xuất hiện. Bạn chỉ cần nhấn nút **Cài đặt** / **Install** là xong).*

---

## ✨ Tính Năng Nổi Bật

1. **Bộ lọc StevenBlack Hosts khổng lồ**:
   - Sử dụng danh sách chính thức từ dự án nổi tiếng [StevenBlack/hosts (porn-only)](https://github.com/StevenBlack/hosts) với hơn **76.000 tên miền khiêu dâm, cờ bạc, nội dung người lớn** được cập nhật liên tục bởi cộng đồng quốc tế và Việt Nam (`hostsVN`).

2. **Tự Động Cập Nhật Thông Minh**:
   - Tự động kiểm tra và cập nhật dữ liệu bộ lọc sau mỗi 24 giờ mà không làm phiền bạn.
   - Hỗ trợ tính năng **Tự động cập nhật Userscript** qua Tampermonkey (`@updateURL` & `@downloadURL`).
   - Có sẵn nút **"🔄 Cập nhật bộ lọc StevenBlack ngay"** trong menu Tampermonkey.

3. **Chặn Triệt Để Từ Gốc (document-start)**:
   - Ngay khi bạn vừa nhập tên miền bị chặn hoặc bấm vào link ngoài ý muốn, kịch bản lập tức gọi `window.stop()` để ngắt toàn bộ kết nối tải hình ảnh, video và mã độc.

4. **Giao Diện Can Thiệp & Động Viên Bản Thân (Mindful Shield)**:
   - **Câu nói thức tỉnh & động viên**: Tổng hợp các danh ngôn sâu sắc về kỷ luật bản thân, khoa học thần kinh cai nghiện dopamine ảo và lòng tự trọng.
   - **Bài tập thở tĩnh tâm 4-4-4-4 (Box Breathing)**: Hướng dẫn nhịp thở trực quan giúp điều hòa nhịp tim, hạ cơn hưng phấn thần kinh và lấy lại sự tỉnh táo tức thì.
   - **Bộ đếm chiến thắng**: Ghi nhận mỗi lần bạn được bảo vệ thành công ("Bạn vừa chiến thắng cám dỗ lần thứ X!").
   - **Nút thoát hiểm nhanh**: Đóng tab ngay lập tức, chuyển hướng về Google hoặc mở nhạc Lofi thư giãn đầu óc.

5. **Hiệu Năng Cực Nhanh (Zero Lag)**:
   - Tích hợp sẵn Whitelist các dịch vụ thông dụng (Google, Youtube, Facebook, Github, Zalo, Shopee, Báo chí,...) giúp việc duyệt web học tập và làm việc hàng ngày mượt mà 100%, không tốn tài nguyên máy tính.

6. **Tùy Biến Linh Hoạt Trong Menu Tampermonkey**:
   - ➕ Thêm tên miền chặn thủ công.
   - ⚪ Thêm tên miền vào danh sách trắng (Whitelist).
   - 📊 Xem thống kê số lần vượt qua cám dỗ và số lượng tên miền đang được chặn.

---

## 🛠️ Cài Đặt Thủ Công (Nếu không cài được tự động)

1. Mở tiện ích **Tampermonkey** trên trình duyệt của bạn.
2. Chọn mục **Bảng điều khiển (Dashboard)** -> Chọn biểu tượng dấu cộng **`+`** (Thêm script mới).
3. Xóa hết code mặc định, sau đó mở file [`porn-blocker.user.js`](https://raw.githubusercontent.com/ngxuanhai123/tampermonkey-porn-blocker/main/porn-blocker.user.js), copy toàn bộ nội dung và dán vào.
4. Nhấn **File** -> **Save** (hoặc tổ hợp phím `Ctrl + S`).

---

## 📋 Nguồn Dữ Liệu Bộ Lọc

- StevenBlack Hosts: [https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts](https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts)
- Dự án StevenBlack: [https://github.com/StevenBlack/hosts](https://github.com/StevenBlack/hosts)
