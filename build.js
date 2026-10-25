const fs = require('fs');
const path = require('path');

const prebundled = JSON.parse(fs.readFileSync(path.join(__dirname, 'prebundled.json'), 'utf8'));

const template = `// ==UserScript==
// @name         Chặn Web Đen & Kỷ Luật Bản Thân (StevenBlack Filter)
// @namespace    https://github.com/ngxuanhai123/tampermonkey-porn-blocker
// @version      1.2.0
// @description  Tự động chặn các trang web khiêu dâm theo bộ lọc StevenBlack Hosts (hơn 76.000 tên miền) + Giao diện kỷ luật thép, nhắc nhở ý chí, bài tập thở định tâm & thống kê chiến thắng cám dỗ.
// @author       ngxuanhai123
// @match        *://*/*
// @match        http://*/*
// @match        https://*/*
// @include      *
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @connect      cdn.jsdelivr.net
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/ngxuanhai123/tampermonkey-porn-blocker/main/porn-blocker.user.js
// @downloadURL  https://raw.githubusercontent.com/ngxuanhai123/tampermonkey-porn-blocker/main/porn-blocker.user.js
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  // --- CẤU HÌNH & HẰNG SỐ ---
  const PRIMARY_FILTER_URL = 'https://cdn.jsdelivr.net/gh/StevenBlack/hosts@master/alternates/porn-only/hosts';
  const FALLBACK_FILTER_URL = 'https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts';
  const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // Tự động cập nhật mỗi 24 giờ

  const STORAGE_KEYS = {
    BLOCKED_HOSTS_RAW: 'ap_blocked_hosts_raw_v2',
    LAST_UPDATE: 'ap_last_update_v2',
    FILTER_COUNT: 'ap_filter_count_v2',
    PREVENTED_COUNT: 'ap_prevented_count_v2',
    CUSTOM_BLOCKED: 'ap_custom_blocked_v2',
    CUSTOM_WHITELIST: 'ap_custom_whitelist_v2'
  };

  // Danh sách các trang phổ biến an toàn để duyệt web học tập / làm việc tốc độ cao
  const SAFE_ROOT_DOMAINS = new Set([
    'google.com', 'google.com.vn', 'youtube.com', 'facebook.com', 'messenger.com',
    'github.com', 'gitlab.com', 'stackoverflow.com', 'wikipedia.org', 'microsoft.com',
    'apple.com', 'amazon.com', 'twitter.com', 'x.com', 'reddit.com', 'linkedin.com',
    'zalo.me', 'shopee.vn', 'lazada.vn', 'tiki.vn', 'vnexpress.net', 'dantri.com.vn',
    'tuoitre.vn', 'thanhnien.vn', 'kenh14.vn', 'genk.vn', 'tinhte.vn', 'chatgpt.com',
    'openai.com', 'bing.com', 'duckduckgo.com', 'netflix.com', 'spotify.com',
    'cloudflare.com', 'canva.com', 'notion.so', 'figma.com', 'tampermonkey.net',
    'zoom.us', 'microsoftonline.com', 'live.com', 'office.com', 'github.io'
  ]);

  // Danh sách 546 tên miền người lớn phổ biến (quốc tế + Việt Nam) tích hợp sẵn ngay trong script
  const PREBUNDLED_DOMAINS = new Set(___PREBUNDLED_JSON___);

  // Danh sách danh ngôn kỷ luật thép & khắc kỷ rèn giũa ý chí
  const MOTIVATIONAL_QUOTES = [
    {
      quote: "Kỷ luật là cầu nối giữa mục tiêu và thành tựu. Nỗi đau của kỷ luật chỉ là tạm thời, nhưng nỗi đau của sự buông thả và hối hận sẽ dằn vặt suốt cuộc đời.",
      author: "Jim Rohn"
    },
    {
      quote: "Không ai là người tự do nếu không làm chủ được chính mình. Kẻ nô dịch cho dục vọng tầm thường là kẻ yếu đuối nhất.",
      author: "Pythagoras"
    },
    {
      quote: "Bạn có quyền lực tuyệt đối trên tâm trí của mình, không phải ngoại cảnh. Nhận thức sâu sắc điều này, bạn sẽ tìm thấy sức mạnh vô song.",
      author: "Marcus Aurelius"
    },
    {
      quote: "Chiến thắng vạn quân không bằng tự chiến thắng chính mình. Người chiến thắng được chính mình mới là chiến tướng oanh liệt nhất.",
      author: "Đức Phật"
    },
    {
      quote: "Đừng bao giờ đánh đổi tương lai, trí tuệ, sức khỏe và sự nghiệp của bạn chỉ vì vài phút dopamine rẻ tiền vô nghĩa.",
      author: "Kỷ Luật Thép"
    },
    {
      quote: "Mỗi lần bạn dũng cảm nói 'KHÔNG' với cám dỗ, bản lĩnh, ý chí và lòng tự trọng của bạn lại mạnh mẽ thêm một bậc.",
      author: "Sức Mạnh Nội Tâm"
    },
    {
      quote: "Cơn thèm muốn của não bộ chỉ kéo dài mạnh nhất từ 5 đến 10 phút. Nếu vượt qua được 10 phút này, bạn đã làm chủ số phận của mình.",
      author: "Khoa Học Thần Kinh"
    },
    {
      quote: "Tương lai của bạn được định hình chính xác bởi những gì bạn làm trong lúc một mình và không có ai nhìn thấy.",
      author: "Bản Lĩnh Đàn Ông"
    },
    {
      quote: "Hãy nhớ lại cảm giác tội lỗi, trống rỗng và kiệt quệ sau mỗi lần buông thả. Bạn có thực sự muốn quay lại vũng lầy tăm tối đó không?",
      author: "Sự Tỉnh Thức"
    },
    {
      quote: "Người làm chủ được ham muốn bản thân là người kiểm soát được toàn bộ vận mệnh cuộc đời mình.",
      author: "Seneca"
    },
    {
      quote: "Bộ não có tính dẻo thần kinh (Neuroplasticity). Mỗi lần bạn kiên quyết từ chối kích thích xấu, các nơ-ron tích cực đang tự chữa lành và tái thiết lập.",
      author: "Tái Cấu Trúc Não Bộ"
    },
    {
      quote: "Đứng dậy rời khỏi màn hình ngay bây giờ! Rửa mặt nước lạnh hoặc chống đẩy 20 cái. Bạn mạnh mẽ hơn cơn thôi thúc này rất nhiều!",
      author: "Hành Động Tức Thì"
    }
  ];

  const currentHost = (window.location.hostname || '').toLowerCase();

  // Bỏ qua các địa chỉ nội bộ, localhost
  if (!currentHost || currentHost === 'localhost' || currentHost === '127.0.0.1' ||
      currentHost.startsWith('192.168.') || currentHost.startsWith('10.') || currentHost === '::1') {
    return;
  }

  // Kiểm tra tên miền an toàn
  function isSafeDomain(host) {
    for (const safe of SAFE_ROOT_DOMAINS) {
      if (host === safe || host.endsWith('.' + safe)) {
        return true;
      }
    }
    return false;
  }

  if (isSafeDomain(currentHost)) {
    checkAutoUpdate();
    return;
  }

  // Whitelist tùy chỉnh của người dùng
  const customWhitelist = new Set(GM_getValue(STORAGE_KEYS.CUSTOM_WHITELIST, []));
  if (customWhitelist.has(currentHost)) {
    checkAutoUpdate();
    return;
  }

  // Nhận diện thông minh qua từ khóa đặc trưng của web người lớn
  function isAdultKeywordMatch(h) {
    if (h.includes('porn')) return true;
    if (h.includes('xxx')) return true;
    if (h.includes('xvideo')) return true;
    if (h.includes('xnxx')) return true;
    if (h.includes('hentai')) return true;
    if (h.includes('rule34')) return true;
    if (h.includes('gelbooru')) return true;
    if (h.includes('spankbang') || h.includes('redtube') || h.includes('youporn') || h.includes('brazzers')) return true;
    if (h.includes('vlxx')) return true;
    if (h.includes('phimsex') || h.includes('clipsex') || h.includes('truyensex') || h.includes('anhsex') || h.includes('sexvn') || h.includes('sextop')) return true;
    if (h.includes('chich') || h.includes('ditnhau') || h.includes('lauxanh') || h.includes('thiendia') || h.includes('gai-goi')) return true;

    // Kiểm tra jav (tránh nhầm với java, javadoc, javascript)
    if (h.includes('jav') && !h.includes('java') && !h.includes('javadoc')) return true;

    // Kiểm tra từ sex độc lập (tránh nhầm essex, sussex, middlesex, wessex, unisex)
    if (h.includes('sex')) {
      if (!h.includes('essex') && !h.includes('sussex') && !h.includes('middlesex') && !h.includes('wessex') && !h.includes('unisex')) {
        return true;
      }
    }
    return false;
  }

  // Kiểm tra danh sách chặn thủ công và bộ lọc đầy đủ
  const customBlocked = new Set(GM_getValue(STORAGE_KEYS.CUSTOM_BLOCKED, []));
  const rawStevenBlackHosts = GM_getValue(STORAGE_KEYS.BLOCKED_HOSTS_RAW, '');

  function isDomainBlocked(host) {
    // 1. Kiểm tra danh sách chặn thủ công
    if (customBlocked.has(host)) return true;

    // 2. Kiểm tra bộ nhận diện từ khóa
    if (isAdultKeywordMatch(host)) return true;

    // 3. Kiểm tra danh sách tích hợp sẵn
    if (PREBUNDLED_DOMAINS.has(host)) return true;

    // 4. Kiểm tra trong bộ lọc StevenBlack (76.000+ domain)
    if (rawStevenBlackHosts && rawStevenBlackHosts.includes('\\n' + host + '\\n')) return true;

    // 5. Kiểm tra toàn bộ subdomain cha (ví dụ: m.pornhub.com -> pornhub.com)
    const parts = host.split('.');
    while (parts.length > 1) {
      parts.shift();
      const parent = parts.join('.');
      if (customBlocked.has(parent) || PREBUNDLED_DOMAINS.has(parent)) return true;
      if (rawStevenBlackHosts && rawStevenBlackHosts.includes('\\n' + parent + '\\n')) return true;
    }

    return false;
  }

  // --- NẾU PHÁT HIỆN TÊN MIỀN BỊ CHẶN ---
  if (isDomainBlocked(currentHost)) {
    enforceBlockScreen(currentHost);
    return;
  }

  // Nếu không bị chặn, chạy cập nhật nền định kỳ
  checkAutoUpdate();

  // --- CƠ CHẾ PHONG TỎA KỶ LUẬT TUYỆT ĐỐI ---
  function enforceBlockScreen(host) {
    // Ngắt ngay lập tức kết nối và luồng tải của trang web
    try {
      window.stop();
    } catch (e) {}

    document.title = '⛔ PHONG TỎA TRUY CẬP • KỶ LUẬT BẢN THÂN';

    // Tăng bộ đếm số lần vượt qua cám dỗ
    const prevCount = GM_getValue(STORAGE_KEYS.PREVENTED_COUNT, 0);
    const newCount = prevCount + 1;
    GM_setValue(STORAGE_KEYS.PREVENTED_COUNT, newCount);

    function injectShield() {
      if (document.getElementById('ap-shield-root')) return;

      // Dừng toàn bộ âm thanh, video đang phát ngầm
      try {
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach(m => {
          m.pause();
          m.muted = true;
          m.src = '';
        });
      } catch (e) {}

      // Tạo thẻ style phong tỏa toàn bộ trang
      if (!document.getElementById('ap-shield-lockdown-style')) {
        const style = document.createElement('style');
        style.id = 'ap-shield-lockdown-style';
        style.textContent = \`
          body > *:not(#ap-shield-root) {
            display: none !important;
            visibility: hidden !important;
          }
          html, body {
            overflow: hidden !important;
            background: #090b10 !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        \`;
        (document.head || document.documentElement || document).appendChild(style);
      }

      // Tạo màn hình chắn toàn phần (Discipline Tactical Shield)
      const shield = document.createElement('div');
      shield.id = 'ap-shield-root';
      shield.style.cssText = \`
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2147483647 !important;
        background: #090b10 !important;
        color: #f1f5f9 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        overflow-y: auto !important;
      \`;

      shield.innerHTML = getShieldHtml(host, newCount);

      const target = document.body || document.documentElement;
      if (target) {
        target.appendChild(shield);
        setupShieldInteractions(shield);
      }
    }

    // Tiêm chắn ngay khi DOM bắt đầu xuất hiện
    if (document.body || document.documentElement) {
      injectShield();
    }

    // Canh chừng bằng MutationObserver để đảm bảo không script nào gỡ được màn hình chắn
    const observer = new MutationObserver(() => {
      injectShield();
    });
    observer.observe(document.documentElement || document, { childList: true, subtree: true });

    window.addEventListener('DOMContentLoaded', injectShield);
    window.addEventListener('load', injectShield);
  }

  function getShieldHtml(host, count) {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

    return \`
      <div style="
        max-width: 620px;
        width: 100%;
        background: #11141c;
        border: 1px solid #232836;
        border-radius: 12px;
        padding: 30px 26px;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        text-align: center;
        box-sizing: border-box;
      ">
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 6px;
          background: rgba(220, 38, 38, 0.12);
          border: 1px solid rgba(220, 38, 38, 0.4);
          color: #ef4444;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
          margin-bottom: 18px;
        ">
          ⛔ CẢNH BÁO • PHONG TỎA KỶ LUẬT
        </div>

        <div style="
          width: 58px;
          height: 58px;
          margin: 0 auto 16px;
          border-radius: 10px;
          background: #161a24;
          border: 1px solid #2b3345;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg style="width: 30px; height: 30px; fill: none; stroke: #e2e8f0; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>

        <h1 style="font-size: 22px; font-weight: 800; color: #f8fafc; margin: 0 0 8px 0; letter-spacing: -0.3px; text-transform: uppercase;">
          DỪNG LẠI! GIỮ VỮNG BẢN LĨNH & KỶ LUẬT
        </h1>

        <div style="
          background: #0c0e14;
          border: 1px solid #1c212e;
          border-radius: 6px;
          padding: 6px 12px;
          margin-bottom: 18px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #94a3b8;
          font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
        ">
          <span>ĐÃ CHẶN:</span>
          <span style="color: #ef4444; font-weight: 700;">\${escapeHtml(host)}</span>
        </div>

        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
          text-align: left;
        ">
          <div style="
            background: #0d1017;
            border: 1px solid #1e2433;
            border-radius: 8px;
            padding: 10px 14px;
          ">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px;">
              Chiến thắng cám dỗ
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #f8fafc; font-family: ui-monospace, SFMono-Regular, Consolas, monospace;">
              \${count} LẦN LIÊN TIẾP
            </div>
          </div>

          <div style="
            background: #0d1017;
            border: 1px solid #1e2433;
            border-radius: 8px;
            padding: 10px 14px;
          ">
            <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px;">
              Trạng thái ý chí
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #10b981; font-family: ui-monospace, SFMono-Regular, Consolas, monospace;">
              KIÊN ĐỊNH • TỈNH THỨC
            </div>
          </div>
        </div>

        <div style="
          background: #0b0d13;
          border-left: 3px solid #dc2626;
          border-top: 1px solid #1a202c;
          border-right: 1px solid #1a202c;
          border-bottom: 1px solid #1a202c;
          padding: 16px 18px;
          border-radius: 6px;
          margin-bottom: 20px;
          text-align: left;
        ">
          <div id="ap-quote-text" style="font-size: 14px; line-height: 1.6; color: #e2e8f0; font-style: italic; margin-bottom: 8px; transition: opacity 0.2s;">
            “\${escapeHtml(randomQuote.quote)}”
          </div>
          <div id="ap-quote-author" style="font-size: 12px; color: #94a3b8; font-weight: 700; text-align: right; text-transform: uppercase; letter-spacing: 0.5px; transition: opacity 0.2s;">
            — \${escapeHtml(randomQuote.author)}
          </div>
        </div>

        <div style="
          background: #0d1017;
          border: 1px solid #1e2433;
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        ">
          <div id="ap-breath-indicator" style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 2px solid #3b82f6;
            background: rgba(59, 130, 246, 0.1);
            flex-shrink: 0;
            transition: transform 3.8s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6;"></div>
          </div>
          <div style="text-align: left; flex-grow: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">
                Kỹ thuật thở Box Breathing (4-4-4-4):
              </span>
              <span id="ap-breath-timer" style="font-size: 12px; font-weight: 800; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; color: #3b82f6;">4s</span>
            </div>
            <div id="ap-breath-step" style="font-size: 14px; font-weight: 700; color: #f8fafc;">
              [1/4] HÍT VÀO SÂU
            </div>
            <div id="ap-breath-desc" style="font-size: 12px; color: #64748b;">
              Nạp dưỡng khí bằng mũi & định tâm kiểm soát
            </div>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 16px;">
          <button id="ap-btn-close" style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 11px 20px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.3px;
            text-transform: uppercase;
            cursor: pointer;
            border: 1px solid #b91c1c;
            background: #dc2626;
            color: #ffffff;
            transition: background 0.15s ease;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            Rời khỏi đây ngay
          </button>

          <button id="ap-btn-home" style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 11px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.3px;
            text-transform: uppercase;
            cursor: pointer;
            border: 1px solid #2d3748;
            background: #181d28;
            color: #f8fafc;
            transition: background 0.15s ease;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
            Về trang học tập / công việc
          </button>

          <button id="ap-btn-quote" style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 11px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border: 1px solid #232936;
            background: #0f1219;
            color: #94a3b8;
            transition: background 0.15s ease;
          ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Đổi danh ngôn
          </button>
        </div>

        <div style="
          background: rgba(234, 179, 8, 0.06);
          border: 1px solid rgba(234, 179, 8, 0.25);
          border-radius: 8px;
          padding: 10px 14px;
          color: #facc15;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.5;
          text-align: center;
          margin-top: 14px;
        ">
          ⚡ HÀNH ĐỘNG KỶ LUẬT NGAY: Đứng dậy rời khỏi màn hình • Uống 1 ly nước lạnh hoặc chống đẩy 20 cái để triệt tiêu hoàn toàn dopamine ảo!
        </div>

        <div style="font-size: 11px; color: #475569; margin-top: 16px; line-height: 1.5; font-family: ui-monospace, SFMono-Regular, Consolas, monospace;">
          STEVENBLACK HOSTS FILTER (76.000+ DOMAINS) • HỆ THỐNG KỶ LUẬT BẢN THÂN<br>
          BẢN QUYỀN <a href="https://github.com/ngxuanhai123/tampermonkey-porn-blocker" target="_blank" rel="noopener noreferrer" style="color: #64748b; text-decoration: underline;">ngxuanhai123</a>
        </div>
      </div>
    \`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  function setupShieldInteractions(shield) {
    const btnClose = shield.querySelector('#ap-btn-close');
    if (btnClose) {
      btnClose.onclick = function () {
        window.close();
        setTimeout(() => {
          window.location.replace('https://www.google.com');
        }, 200);
      };
    }

    const btnHome = shield.querySelector('#ap-btn-home');
    if (btnHome) {
      btnHome.onclick = function () {
        window.location.replace('https://www.google.com');
      };
    }

    const btnQuote = shield.querySelector('#ap-btn-quote');
    const quoteText = shield.querySelector('#ap-quote-text');
    const quoteAuthor = shield.querySelector('#ap-quote-author');
    if (btnQuote && quoteText && quoteAuthor) {
      btnQuote.onclick = function () {
        const item = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        quoteText.style.opacity = '0';
        quoteAuthor.style.opacity = '0';
        setTimeout(() => {
          quoteText.textContent = \`“\${item.quote}”\`;
          quoteAuthor.textContent = \`— \${item.author}\`;
          quoteText.style.opacity = '1';
          quoteAuthor.style.opacity = '1';
        }, 150);
      };
    }

    const breathStep = shield.querySelector('#ap-breath-step');
    const breathDesc = shield.querySelector('#ap-breath-desc');
    const breathTimer = shield.querySelector('#ap-breath-timer');
    const breathIndicator = shield.querySelector('#ap-breath-indicator');

    if (breathStep && breathDesc && breathTimer && breathIndicator) {
      const phases = [
        { step: '[1/4] HÍT VÀO SÂU', desc: 'Nạp dưỡng khí bằng mũi & định tâm kiểm soát', time: 4, scale: '1.25' },
        { step: '[2/4] GIỮ HƠI NÍN THỞ', desc: 'Làm chủ thân tâm & giữ vững ý chí kiên định', time: 4, scale: '1.25' },
        { step: '[3/4] THỞ RA CHẬM', desc: 'Thở đều bằng miệng & giải phóng xung động', time: 4, scale: '0.85' },
        { step: '[4/4] TĨNH LẶNG TUYỆT ĐỐI', desc: 'Duy trì bản lĩnh thép & tỉnh thức', time: 4, scale: '1.0' }
      ];
      let currentPhase = 0;
      let secondsLeft = phases[0].time;

      function updateBreathUI() {
        const p = phases[currentPhase];
        breathStep.textContent = p.step;
        breathDesc.textContent = p.desc;
        breathTimer.textContent = \`\${secondsLeft}s\`;
        breathIndicator.style.transform = \`scale(\${p.scale})\`;
      }

      updateBreathUI();

      setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
          currentPhase = (currentPhase + 1) % phases.length;
          secondsLeft = phases[currentPhase].time;
        }
        updateBreathUI();
      }, 1000);
    }
  }

  // --- CẬP NHẬT BỘ LỌC TỰ ĐỘNG TỪ STEVENBLACK ---
  function checkAutoUpdate() {
    const lastUpdate = GM_getValue(STORAGE_KEYS.LAST_UPDATE, 0);
    const rawHosts = GM_getValue(STORAGE_KEYS.BLOCKED_HOSTS_RAW, '');
    const now = Date.now();

    // Nếu chưa có dữ liệu hoặc đã quá 24h
    if (!rawHosts || (now - lastUpdate > UPDATE_INTERVAL_MS)) {
      downloadFilterData(false);
    }
  }

  function downloadFilterData(isManual = false) {
    if (isManual) {
      showNotification('Đang cập nhật...', 'Đang tải bộ lọc từ máy chủ CDN, vui lòng chờ trong giây lát!');
    }

    // Thử tải từ CDN jsDelivr trước (siêu nhanh, có máy chủ tại Singapore/VN)
    fetchFilter(PRIMARY_FILTER_URL, function (err, count) {
      if (!err && count > 5000) {
        if (isManual) {
          showNotification('Cập nhật thành công! 🛡️', \`Đã nạp \${count.toLocaleString('vi-VN')} tên miền từ StevenBlack Hosts!\`);
        }
      } else {
        // Fallback sang raw GitHub
        console.warn('[Porn Blocker] CDN thất bại, thử sang nguồn phụ GitHub...');
        fetchFilter(FALLBACK_FILTER_URL, function (fallbackErr, fallbackCount) {
          if (!fallbackErr && fallbackCount > 5000) {
            if (isManual) {
              showNotification('Cập nhật thành công! 🛡️', \`Đã nạp \${fallbackCount.toLocaleString('vi-VN')} tên miền từ StevenBlack Hosts!\`);
            }
          } else {
            console.error('[Porn Blocker] Cả 2 nguồn cập nhật đều thất bại.');
            if (isManual) {
              showNotification('Lỗi cập nhật', 'Không thể kết nối đến máy chủ bộ lọc. Hệ thống vẫn đang bảo vệ bằng 546 tên miền tích hợp sẵn và bộ nhận diện từ khóa!');
            }
          }
        });
      }
    });
  }

  function fetchFilter(url, callback) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      timeout: 30000,
      headers: {
        'Cache-Control': 'no-cache'
      },
      onload: function (response) {
        if (response.status === 200 && response.responseText) {
          try {
            const rawString = parseHostsToRaw(response.responseText);
            const count = (rawString.match(/\\n/g) || []).length - 1;
            if (count > 5000) {
              GM_setValue(STORAGE_KEYS.BLOCKED_HOSTS_RAW, rawString);
              GM_setValue(STORAGE_KEYS.LAST_UPDATE, Date.now());
              GM_setValue(STORAGE_KEYS.FILTER_COUNT, count);
              console.log(\`[Porn Blocker] Cập nhật thành công: \${count} domains\`);
              callback(null, count);
              return;
            }
            throw new Error('Số lượng domain quá ít: ' + count);
          } catch (e) {
            callback(e);
          }
        } else {
          callback(new Error('HTTP status: ' + response.status));
        }
      },
      onerror: function (err) {
        callback(err);
      },
      ontimeout: function () {
        callback(new Error('Timeout'));
      }
    });
  }

  function parseHostsToRaw(text) {
    const lines = text.split('\\n');
    const domains = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.charCodeAt(0) === 35 /* dấu '#' */) continue;

      const parts = line.split(/\\s+/);
      if (parts.length >= 2 && (parts[0] === '0.0.0.0' || parts[0] === '127.0.0.1')) {
        const domain = parts[1].toLowerCase();
        if (domain && domain !== 'localhost' && !domain.startsWith('#')) {
          domains.push(domain);
        }
      }
    }
    // Định dạng chuỗi: \\ndomain1\\ndomain2\\ndomain3\\n để tìm kiếm includes siêu tốc O(1)
    return '\\n' + domains.join('\\n') + '\\n';
  }

  function showNotification(title, text) {
    if (typeof GM_notification === 'function') {
      GM_notification({
        title: '⛔ Kỷ Luật Bản Thân: ' + title,
        text: text,
        timeout: 5000
      });
    } else {
      alert(\`[Kỷ Luật Bản Thân] \${title}\\n\\n\${text}\`);
    }
  }

  // --- MENU TIỆN ÍCH TRONG TAMPERMONKEY ---
  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('🔄 Cập nhật bộ lọc StevenBlack ngay', function () {
      downloadFilterData(true);
    });

    GM_registerMenuCommand('📊 Xem thống kê & Trạng thái bảo vệ', function () {
      const count = GM_getValue(STORAGE_KEYS.FILTER_COUNT, 0);
      const prevented = GM_getValue(STORAGE_KEYS.PREVENTED_COUNT, 0);
      const lastUpdate = GM_getValue(STORAGE_KEYS.LAST_UPDATE, 0);
      const customBlockedCount = (GM_getValue(STORAGE_KEYS.CUSTOM_BLOCKED, [])).length;
      const customWhitelistCount = (GM_getValue(STORAGE_KEYS.CUSTOM_WHITELIST, [])).length;

      let timeStr = 'Chưa nạp đầy đủ (Đang dùng 546 domain tích hợp sẵn)';
      if (lastUpdate > 0) {
        timeStr = new Date(lastUpdate).toLocaleString('vi-VN');
      }

      const report =
        \`⛔ THỐNG KÊ KỶ LUẬT BẢN THÂN\\n\` +
        \`----------------------------------------\\n\` +
        \`• Tên miền từ StevenBlack: \${count > 0 ? count.toLocaleString('vi-VN') + ' domains' : 'Đang đồng bộ'}\\n\` +
        \`• Tên miền tích hợp sẵn: \${PREBUNDLED_DOMAINS.size} domains\\n\` +
        \`• Nhận diện từ khóa thông minh: Đang kích hoạt (Active)\\n\` +
        \`• Lần cập nhật cuối: \${timeStr}\\n\` +
        \`• Số lần giúp bạn chiến thắng cám dỗ: \${prevented} lần 🛡️\\n\` +
        \`• Tên miền chặn thủ công: \${customBlockedCount}\\n\` +
        \`• Tên miền ngoại lệ (Whitelist): \${customWhitelistCount}\\n\\n\` +
        \`Nguồn: StevenBlack/hosts (alternates/porn-only)\`;

      alert(report);
    });

    GM_registerMenuCommand('➕ Thêm tên miền chặn thủ công', function () {
      const domain = prompt('Nhập tên miền bạn muốn chặn (ví dụ: badsite.com):');
      if (domain) {
        const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\\/\\//, '').replace(/\\/.*$/, '');
        if (cleanDomain) {
          const list = GM_getValue(STORAGE_KEYS.CUSTOM_BLOCKED, []);
          if (!list.includes(cleanDomain)) {
            list.push(cleanDomain);
            GM_setValue(STORAGE_KEYS.CUSTOM_BLOCKED, list);
            showNotification('Thành công', \`Đã thêm "\${cleanDomain}" vào danh sách chặn thủ công!\`);
          } else {
            alert(\`Tên miền "\${cleanDomain}" đã có trong danh sách chặn.\`);
          }
        }
      }
    });

    GM_registerMenuCommand('⚪ Thêm tên miền vào ngoại lệ (Whitelist)', function () {
      const domain = prompt('Nhập tên miền bạn muốn luôn cho phép truy cập:');
      if (domain) {
        const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\\/\\//, '').replace(/\\/.*$/, '');
        if (cleanDomain) {
          const list = GM_getValue(STORAGE_KEYS.CUSTOM_WHITELIST, []);
          if (!list.includes(cleanDomain)) {
            list.push(cleanDomain);
            GM_setValue(STORAGE_KEYS.CUSTOM_WHITELIST, list);
            showNotification('Thành công', \`Đã thêm "\${cleanDomain}" vào Whitelist!\`);
          } else {
            alert(\`Tên miền "\${cleanDomain}" đã có trong Whitelist.\`);
          }
        }
      }
    });
  }

})();
`;

const finalScript = template.replace('___PREBUNDLED_JSON___', JSON.stringify(prebundled));
fs.writeFileSync(path.join(__dirname, 'porn-blocker.user.js'), finalScript, 'utf8');
console.log('Finished building porn-blocker.user.js! Total size:', Buffer.byteLength(finalScript), 'bytes');
