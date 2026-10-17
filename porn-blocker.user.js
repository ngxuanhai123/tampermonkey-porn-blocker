// ==UserScript==
// @name         Chặn Porn Tự Động & Động Viên Bản Thân (StevenBlack Filter)
// @namespace    https://github.com/ngxuanhai123/tampermonkey-porn-blocker
// @version      1.0.0
// @description  Tự động chặn các trang web khiêu dâm theo bộ lọc StevenBlack Hosts (hơn 76.000 tên miền), tự động cập nhật, hiển thị giao diện động viên, bài tập thở và bộ đếm chiến thắng cám dỗ.
// @author       ngxuanhai123
// @match        *://*/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/ngxuanhai123/tampermonkey-porn-blocker/main/porn-blocker.user.js
// @downloadURL  https://raw.githubusercontent.com/ngxuanhai123/tampermonkey-porn-blocker/main/porn-blocker.user.js
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  // --- CẤU HÌNH & HẰNG SỐ ---
  const FILTER_URL = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts';
  const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // Tự động cập nhật mỗi 24 giờ
  const STORAGE_KEYS = {
    BLOCKED_DOMAINS: 'ap_blocked_domains',
    LAST_UPDATE: 'ap_last_update',
    FILTER_COUNT: 'ap_filter_count',
    PREVENTED_COUNT: 'ap_prevented_count',
    CUSTOM_BLOCKED: 'ap_custom_blocked',
    CUSTOM_WHITELIST: 'ap_custom_whitelist'
  };

  // Danh sách các trang phổ biến an toàn để bỏ qua kiểm tra, giúp lướt web hàng ngày mượt 100%
  const SAFE_ROOT_DOMAINS = new Set([
    'google.com', 'google.com.vn', 'youtube.com', 'facebook.com', 'messenger.com',
    'github.com', 'gitlab.com', 'stackoverflow.com', 'wikipedia.org', 'microsoft.com',
    'apple.com', 'amazon.com', 'twitter.com', 'x.com', 'reddit.com', 'linkedin.com',
    'zalo.me', 'shopee.vn', 'lazada.vn', 'tiki.vn', 'vnexpress.net', 'dantri.com.vn',
    'tuoitre.vn', 'thanhnien.vn', 'kenh14.vn', 'genk.vn', 'tinhte.vn', 'chatgpt.com',
    'openai.com', 'bing.com', 'duckduckgo.com', 'netflix.com', 'spotify.com',
    'cloudflare.com', 'canva.com', 'notion.so', 'figma.com', 'tampermonkey.net'
  ]);

  // Danh sách chặn nhanh dự phòng (Top adult sites) phòng khi người dùng vừa cài đặt chưa tải xong 76k host
  const FALLBACK_POPULAR_BLOCKED = [
    'pornhub.com', 'xvideos.com', 'xnxx.com', 'redtube.com', 'youporn.com',
    'spankbang.com', 'eporner.com', 'chaturbate.com', 'stripchat.com', 'bongacams.com',
    'cam4.com', 'livejasmin.com', 'hqporner.com', 'beeg.com', 'xhamster.com',
    'tube8.com', 'daftsex.com', 'brazzers.com', 'naughtyamerica.com', 'tnaflix.com',
    'porn.com', 'rule34.xxx', 'gelbooru.com', 'nhentai.net', 'e-hentai.org',
    'hanime.tv', 'javhd.com', 'javmost.com', 'javbus.com', 'missav.com',
    'jable.tv', 'avgle.com', 'vlxx.sex', 'phimsex.com', 'sexvn.com',
    'heydouga.com', 'dmm.co.jp', 'fanza.com', 'onlyfans.com', 'fansly.com',
    'manyvids.com', 'camsoda.com', 'heavy-r.com', 'motherless.com', 'tblop.com'
  ];

  // Danh sách những câu động viên sâu sắc, đánh thức ý chí và giúp cai nghiện dopamine ảo
  const MOTIVATIONAL_QUOTES = [
    {
      quote: "Chiến thắng vạn quân không bằng tự chiến thắng chính mình. Người chiến thắng được chính mình mới là chiến tướng oanh liệt nhất.",
      author: "Đức Phật"
    },
    {
      quote: "Một khoảnh khắc thỏa mãn nhất thời không xứng đáng đánh đổi bằng sự tự tin, sức khỏe, trí tuệ và tương lai tươi sáng của bạn.",
      author: "Lời nhắc từ bản thân"
    },
    {
      quote: "Cơn thèm muốn của não bộ chỉ kéo dài mạnh nhất từ 5 đến 10 phút. Nếu bạn vượt qua được 10 phút này, bạn đã làm chủ số phận của mình.",
      author: "Khoa học Thần kinh"
    },
    {
      quote: "Đừng để bộ não bị nô dịch bởi dopamine rẻ tiền. Hãy tích luỹ năng lượng quý giá này cho sự nghiệp, học vấn và rèn luyện thể chất.",
      author: "Bản lĩnh đàn ông"
    },
    {
      quote: "Hãy nhớ lại cảm giác tội lỗi, trống rỗng và kiệt quệ sau mỗi lần buông thả. Bạn có thực sự muốn quay lại vũng lầy tăm tối đó không?",
      author: "Sự tỉnh thức"
    },
    {
      quote: "Tương lai của bạn được định hình chính xác bởi những gì bạn làm trong lúc một mình và không có ai nhìn thấy.",
      author: "Kỷ luật thép"
    },
    {
      quote: "Mỗi lần bạn dũng cảm nói 'KHÔNG' với cám dỗ, bản lĩnh, ý chí và lòng tự trọng của bạn lại mạnh mẽ thêm một bậc.",
      author: "Chiến thắng nội tâm"
    },
    {
      quote: "Bạn xứng đáng có một tình yêu chân thành, lành mạnh ngoài đời thực, chứ không phải những hình ảnh ảo vô hồn sau màn hình vi tính.",
      author: "Thấu hiểu bản thân"
    },
    {
      quote: "Nỗi đau của kỷ luật chỉ là tạm thời, nhưng nỗi đau của sự buông thả và hối hận sẽ dằn vặt suốt cả cuộc đời.",
      author: "Jim Rohn"
    },
    {
      quote: "Đứng dậy ngay bây giờ! Uống một ly nước mát, hít thở thật sâu hoặc chống đẩy 20 cái. Bạn mạnh mẽ hơn cơn thèm này rất nhiều!",
      author: "Hành động ngay"
    },
    {
      quote: "Bộ não của bạn có tính dẻo (Neuroplasticity). Mỗi lần bạn từ chối kích thích xấu, các dây thần kinh tích cực đang tự chữa lành.",
      author: "Tái cấu trúc não bộ"
    },
    {
      quote: "Hãy nghĩ đến người thân, gia đình và những người bạn yêu quý. Họ cần một người vững chãi, khỏe mạnh và đáng tin cậy.",
      author: "Trách nhiệm cuộc đời"
    }
  ];

  const currentHost = window.location.hostname.toLowerCase();

  // Bỏ qua các địa chỉ nội bộ, localhost
  if (!currentHost || currentHost === 'localhost' || currentHost === '127.0.0.1' ||
      currentHost.startsWith('192.168.') || currentHost.startsWith('10.') || currentHost === '::1') {
    return;
  }

  // Kiểm tra tên miền an toàn để duyệt web siêu tốc
  function isSafeDomain(host) {
    for (const safe of SAFE_ROOT_DOMAINS) {
      if (host === safe || host.endsWith('.' + safe)) {
        return true;
      }
    }
    return false;
  }

  if (isSafeDomain(currentHost)) {
    // Vẫn chạy kiểm tra cập nhật ngầm định kỳ
    checkAutoUpdate();
    return;
  }

  // Lấy dữ liệu từ storage
  const customWhitelist = new Set(GM_getValue(STORAGE_KEYS.CUSTOM_WHITELIST, []));
  if (customWhitelist.has(currentHost)) {
    checkAutoUpdate();
    return;
  }

  const customBlocked = new Set(GM_getValue(STORAGE_KEYS.CUSTOM_BLOCKED, []));
  const filterList = GM_getValue(STORAGE_KEYS.BLOCKED_DOMAINS, null);
  const filterSet = filterList && filterList.length > 0 ? new Set(filterList) : new Set(FALLBACK_POPULAR_BLOCKED);

  // Kiểm tra domain và toàn bộ domain cha
  function checkDomainBlocked(host) {
    if (customBlocked.has(host)) return true;
    if (filterSet.has(host)) return true;

    // Kiểm tra parent domain (ví dụ: m.pornhub.com -> pornhub.com)
    const parts = host.split('.');
    while (parts.length > 1) {
      parts.shift();
      const parent = parts.join('.');
      if (customBlocked.has(parent) || filterSet.has(parent)) {
        return true;
      }
    }
    return false;
  }

  // --- NẾU PHÁT HIỆN TÊN MIỀN BỊ CHẶN ---
  if (checkDomainBlocked(currentHost)) {
    // Chặn ngay lập tức kết nối và tài nguyên của web
    try {
      window.stop();
    } catch (e) {}

    // Tăng số lần đã ngăn chặn thành công
    const prevCount = GM_getValue(STORAGE_KEYS.PREVENTED_COUNT, 0);
    const newCount = prevCount + 1;
    GM_setValue(STORAGE_KEYS.PREVENTED_COUNT, newCount);

    // Hiển thị màn hình động viên cứu cánh
    renderEncouragementScreen(currentHost, newCount);
    return;
  }

  // Nếu không bị chặn, kích hoạt kiểm tra cập nhật bộ lọc nền
  checkAutoUpdate();

  // --- GIAO DIỆN CHẶN & ĐỘNG VIÊN ---
  function renderEncouragementScreen(host, count) {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🛡️ DỪNG LẠI! BẠN MẠNH MẼ HƠN CÁM DỖ NÀY!</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #090d16 0%, #0f172a 45%, #1e1b4b 100%);
      color: #f1f5f9;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 24px;
      overflow-x: hidden;
    }
    .container {
      max-width: 680px;
      width: 100%;
      background: rgba(30, 41, 59, 0.85);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 36px 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15);
      text-align: center;
      position: relative;
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.96) translateY(12px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #fca5a5;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }
    .icon-wrapper {
      width: 80px;
      height: 80px;
      margin: 0 auto 16px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(79, 70, 229, 0.4);
    }
    .icon-wrapper svg {
      width: 44px;
      height: 44px;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    .blocked-host {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 22px;
      word-break: break-all;
    }
    .blocked-host span {
      color: #f87171;
      font-family: monospace;
      background: rgba(0, 0, 0, 0.25);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .victory-counter {
      background: linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15));
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 10px 18px;
      border-radius: 12px;
      color: #6ee7b7;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 24px;
      display: inline-block;
    }
    .quote-box {
      background: rgba(15, 23, 42, 0.6);
      border-left: 4px solid #6366f1;
      padding: 20px 22px;
      border-radius: 12px;
      margin-bottom: 26px;
      text-align: left;
      position: relative;
    }
    .quote-text {
      font-size: 16px;
      line-height: 1.6;
      color: #e2e8f0;
      font-style: italic;
      margin-bottom: 8px;
    }
    .quote-author {
      font-size: 13px;
      color: #818cf8;
      font-weight: 600;
      text-align: right;
    }
    /* Bài tập thở 4-4-4 */
    .breathing-box {
      background: rgba(15, 23, 42, 0.4);
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      padding: 18px 20px;
      margin-bottom: 26px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .breath-circle {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: radial-gradient(circle, #6366f1 0%, #312e81 100%);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
      animation: breathAnimation 16s infinite ease-in-out;
      flex-shrink: 0;
    }
    @keyframes breathAnimation {
      0%, 100% { transform: scale(0.7); opacity: 0.6; }
      25% { transform: scale(1.15); opacity: 1; }      /* Hít vào 4s */
      50% { transform: scale(1.15); opacity: 1; }      /* Giữ 4s */
      75% { transform: scale(0.7); opacity: 0.6; }      /* Thở ra 4s */
    }
    .breath-info {
      text-align: left;
      flex-grow: 1;
    }
    .breath-title {
      font-size: 14px;
      font-weight: 700;
      color: #a5b4fc;
      margin-bottom: 4px;
    }
    .breath-state {
      font-size: 16px;
      font-weight: 600;
      color: #38bdf8;
      min-height: 24px;
    }
    .breath-sub {
      font-size: 12px;
      color: #94a3b8;
    }
    /* Nút hành động */
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 22px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      border: none;
      outline: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.35);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
    }
    .btn-safe {
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
    }
    .btn-safe:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      transform: translateY(-2px);
    }
    .footer-note {
      font-size: 12px;
      color: #64748b;
      margin-top: 18px;
      line-height: 1.5;
    }
    .footer-note a {
      color: #818cf8;
      text-decoration: none;
    }
    .footer-note a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">
      <span>⛔ ĐÃ KÍCH HOẠT BẢO VỆ TỰ ĐỘNG</span>
    </div>

    <div class="icon-wrapper">
      <svg viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    </div>

    <h1>Dừng Lại! Tương Lai Đang Chờ Đón Bạn</h1>
    <div class="blocked-host">Đã chặn truy cập vào: <span>${escapeHtml(host)}</span></div>

    <div class="victory-counter">
      🛡️ Bạn vừa chiến thắng cám dỗ lần thứ <strong>${count}</strong>! Hãy tự hào về điều đó!
    </div>

    <div class="quote-box">
      <div class="quote-text" id="quoteText">“${escapeHtml(randomQuote.quote)}”</div>
      <div class="quote-author" id="quoteAuthor">— ${escapeHtml(randomQuote.author)}</div>
    </div>

    <div class="breathing-box">
      <div class="breath-circle"></div>
      <div class="breath-info">
        <div class="breath-title">Bài tập thở tĩnh tâm 4-4-4:</div>
        <div class="breath-state" id="breathState">Hít vào chậm rãi (4s)...</div>
        <div class="breath-sub">Lấy lại quyền kiểm soát tâm trí và hạ cơn hưng phấn thần kinh</div>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-primary" id="btnCloseTab">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        Đóng tab này ngay
      </button>

      <button class="btn btn-safe" id="btnGoHome">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Về Google an toàn
      </button>

      <button class="btn btn-secondary" id="btnLofiMusic">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
        Nghe nhạc tĩnh tâm Lofi
      </button>

      <button class="btn btn-secondary" id="btnNextQuote">
        🎲 Đổi câu động viên khác
      </button>
    </div>

    <div class="footer-note">
      Bộ lọc StevenBlack Hosts bảo vệ hơn 76.000 tên miền khiêu dâm • Tự động cập nhật mỗi 24h<br>
      Phát triển bởi <a href="https://github.com/ngxuanhai123/tampermonkey-porn-blocker" target="_blank">ngxuanhai123</a>
    </div>
  </div>
</body>
</html>`;

    // Thay thế toàn bộ nội dung trang bằng giao diện chặn
    try {
      document.open();
      document.write(htmlContent);
      document.close();
    } catch (e) {
      if (document.documentElement) {
        document.documentElement.innerHTML = htmlContent;
      }
    }

    // Gắn sự kiện tương tác
    setupInteractions();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  function setupInteractions() {
    // Đóng tab hoặc về Google
    const btnClose = document.getElementById('btnCloseTab');
    if (btnClose) {
      btnClose.onclick = function () {
        window.close();
        // Nếu trình duyệt chặn window.close(), điều hướng về Google
        setTimeout(() => {
          window.location.replace('https://www.google.com');
        }, 300);
      };
    }

    const btnHome = document.getElementById('btnGoHome');
    if (btnHome) {
      btnHome.onclick = function () {
        window.location.replace('https://www.google.com');
      };
    }

    const btnLofi = document.getElementById('btnLofiMusic');
    if (btnLofi) {
      btnLofi.onclick = function () {
        window.location.replace('https://www.youtube.com/results?search_query=lofi+hip+hop+radio+relax+study');
      };
    }

    // Đổi câu động viên
    const btnQuote = document.getElementById('btnNextQuote');
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    if (btnQuote && quoteText && quoteAuthor) {
      btnQuote.onclick = function () {
        const item = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        quoteText.style.opacity = '0';
        quoteAuthor.style.opacity = '0';
        setTimeout(() => {
          quoteText.textContent = `“${item.quote}”`;
          quoteAuthor.textContent = `— ${item.author}`;
          quoteText.style.opacity = '1';
          quoteAuthor.style.opacity = '1';
        }, 150);
      };
    }

    // Hiệu ứng đếm nhịp thở Box Breathing 4-4-4-4
    const breathState = document.getElementById('breathState');
    if (breathState) {
      const phases = [
        { text: '🌸 Hít vào thật sâu bằng mũi (4s)...', time: 4 },
        { text: '✋ Giữ hơi thở và tĩnh tâm (4s)...', time: 4 },
        { text: '🍃 Thở ra chậm rãi bằng miệng (4s)...', time: 4 },
        { text: '🧘 Nghỉ ngơi và thư giãn (4s)...', time: 4 }
      ];
      let currentPhase = 0;
      let secondsLeft = phases[0].time;

      setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
          currentPhase = (currentPhase + 1) % phases.length;
          secondsLeft = phases[currentPhase].time;
        }
        breathState.textContent = `${phases[currentPhase].text} [${secondsLeft}s]`;
      }, 1000);
    }
  }

  // --- CƠ CHẾ TỰ ĐỘNG CẬP NHẬT BỘ LỌC TỪ STEVENBLACK ---
  function checkAutoUpdate() {
    const lastUpdate = GM_getValue(STORAGE_KEYS.LAST_UPDATE, 0);
    const domainList = GM_getValue(STORAGE_KEYS.BLOCKED_DOMAINS, null);
    const now = Date.now();

    // Nếu chưa từng tải danh sách hoặc đã quá 24h kể từ lần cập nhật trước
    if (!domainList || (now - lastUpdate > UPDATE_INTERVAL_MS)) {
      downloadFilterData(false);
    }
  }

  function downloadFilterData(isManual = false) {
    if (isManual) {
      showNotification('Đang cập nhật...', 'Đang tải bộ lọc từ StevenBlack Hosts, vui lòng chờ trong giây lát!');
    }

    GM_xmlhttpRequest({
      method: 'GET',
      url: FILTER_URL,
      timeout: 45000,
      headers: {
        'Cache-Control': 'no-cache'
      },
      onload: function (response) {
        if (response.status === 200 && response.responseText) {
          try {
            const domains = parseHostsContent(response.responseText);
            if (domains.length > 5000) {
              GM_setValue(STORAGE_KEYS.BLOCKED_DOMAINS, domains);
              GM_setValue(STORAGE_KEYS.LAST_UPDATE, Date.now());
              GM_setValue(STORAGE_KEYS.FILTER_COUNT, domains.length);

              const msg = `Đã cập nhật thành công ${domains.length.toLocaleString('vi-VN')} tên miền từ StevenBlack Hosts!`;
              console.log('[Porn Blocker] ' + msg);
              if (isManual) {
                showNotification('Cập nhật thành công! 🛡️', msg);
              }
            } else {
              throw new Error('Số lượng tên miền tải về quá ít (' + domains.length + ')');
            }
          } catch (err) {
            console.error('[Porn Blocker] Lỗi phân tích bộ lọc:', err);
            if (isManual) {
              showNotification('Lỗi phân tích', 'Không thể đọc dữ liệu bộ lọc: ' + err.message);
            }
          }
        } else {
          console.error('[Porn Blocker] Lỗi HTTP khi tải bộ lọc:', response.status);
          if (isManual) {
            showNotification('Lỗi tải dữ liệu', 'Máy chủ phản hồi mã: ' + response.status);
          }
        }
      },
      onerror: function (err) {
        console.error('[Porn Blocker] Lỗi kết nối mạng khi tải:', err);
        if (isManual) {
          showNotification('Lỗi kết nối', 'Không thể kết nối đến GitHub để cập nhật bộ lọc.');
        }
      },
      ontimeout: function () {
        console.error('[Porn Blocker] Quá thời gian kết nối (Timeout)');
        if (isManual) {
          showNotification('Hết thời gian chờ', 'Kết nối mạng quá chậm, vui lòng thử lại sau.');
        }
      }
    });
  }

  // Hàm bóc tách các tên miền từ định dạng hosts file chuẩn của StevenBlack
  function parseHostsContent(text) {
    const lines = text.split('\n');
    const result = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.charCodeAt(0) === 35 /* dấu '#' */) continue;

      const parts = line.split(/\s+/);
      if (parts.length >= 2 && (parts[0] === '0.0.0.0' || parts[0] === '127.0.0.1')) {
        const domain = parts[1].toLowerCase();
        if (domain && domain !== 'localhost' && !domain.startsWith('#')) {
          result.push(domain);
        }
      }
    }
    return result;
  }

  function showNotification(title, text) {
    if (typeof GM_notification === 'function') {
      GM_notification({
        title: '🛡️ Porn Blocker Guard: ' + title,
        text: text,
        timeout: 5000
      });
    } else {
      alert(`[Porn Blocker Guard] ${title}\n\n${text}`);
    }
  }

  // --- MENU LỆNH TRONG TAMPERMONKEY ---
  if (typeof GM_registerMenuCommand === 'function') {
    // 1. Cập nhật thủ công
    GM_registerMenuCommand('🔄 Cập nhật bộ lọc StevenBlack ngay', function () {
      downloadFilterData(true);
    });

    // 2. Xem thống kê
    GM_registerMenuCommand('📊 Xem thống kê & Trạng thái bảo vệ', function () {
      const count = GM_getValue(STORAGE_KEYS.FILTER_COUNT, 0);
      const prevented = GM_getValue(STORAGE_KEYS.PREVENTED_COUNT, 0);
      const lastUpdate = GM_getValue(STORAGE_KEYS.LAST_UPDATE, 0);
      const customBlockedCount = (GM_getValue(STORAGE_KEYS.CUSTOM_BLOCKED, [])).length;
      const customWhitelistCount = (GM_getValue(STORAGE_KEYS.CUSTOM_WHITELIST, [])).length;

      let timeStr = 'Chưa cập nhật';
      if (lastUpdate > 0) {
        timeStr = new Date(lastUpdate).toLocaleString('vi-VN');
      }

      const report =
        `🛡️ THỐNG KÊ PORN BLOCKER GUARD\n` +
        `----------------------------------------\n` +
        `• Tên miền đang được chặn: ${count.toLocaleString('vi-VN')} domains\n` +
        `• Cập nhật lần cuối: ${timeStr}\n` +
        `• Số lần giúp bạn chiến thắng cám dỗ: ${prevented} lần 🎉\n` +
        `• Tên miền chặn thủ công: ${customBlockedCount}\n` +
        `• Tên miền ngoại lệ (Whitelist): ${customWhitelistCount}\n\n` +
        `Nguồn bộ lọc: StevenBlack/hosts (alternates/porn-only)`;

      alert(report);
    });

    // 3. Thêm domain chặn thủ công
    GM_registerMenuCommand('➕ Thêm tên miền chặn thủ công', function () {
      const domain = prompt('Nhập tên miền bạn muốn chặn (ví dụ: badsite.com):');
      if (domain) {
        const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        if (cleanDomain) {
          const list = GM_getValue(STORAGE_KEYS.CUSTOM_BLOCKED, []);
          if (!list.includes(cleanDomain)) {
            list.push(cleanDomain);
            GM_setValue(STORAGE_KEYS.CUSTOM_BLOCKED, list);
            showNotification('Thành công', `Đã thêm "${cleanDomain}" vào danh sách chặn thủ công!`);
          } else {
            alert(`Tên miền "${cleanDomain}" đã có trong danh sách chặn.`);
          }
        }
      }
    });

    // 4. Thêm domain vào Whitelist ngoại lệ
    GM_registerMenuCommand('⚪ Thêm tên miền vào ngoại lệ (Whitelist)', function () {
      const domain = prompt('Nhập tên miền bạn muốn luôn cho phép truy cập:');
      if (domain) {
        const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        if (cleanDomain) {
          const list = GM_getValue(STORAGE_KEYS.CUSTOM_WHITELIST, []);
          if (!list.includes(cleanDomain)) {
            list.push(cleanDomain);
            GM_setValue(STORAGE_KEYS.CUSTOM_WHITELIST, list);
            showNotification('Thành công', `Đã thêm "${cleanDomain}" vào Whitelist!`);
          } else {
            alert(`Tên miền "${cleanDomain}" đã có trong Whitelist.`);
          }
        }
      }
    });
  }

})();
