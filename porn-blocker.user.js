// ==UserScript==
// @name         Chặn Porn Tự Động & Động Viên Bản Thân (StevenBlack Filter)
// @namespace    https://github.com/ngxuanhai123/tampermonkey-porn-blocker
// @version      1.1.0
// @description  Tự động chặn các trang web khiêu dâm theo bộ lọc StevenBlack Hosts (hơn 76.000 tên miền) + Nhận diện thông minh, tự động cập nhật, hiển thị giao diện động viên, bài tập thở và bộ đếm chiến thắng cám dỗ.
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
  const PREBUNDLED_DOMAINS = new Set(["0310love.com","1001truyen.blogspot.com","102model.com","123sex.top","12hdem.com","210vn.net","247live.mobi","2jav.net","2ola.pro","3xvn.pro","444live.link","567live.online","567live.win","567lives.top","6666.net","6789live.com","7sex.org","820mm.live","825mm.live","836mm.live","999live.app","9xlove.xyz","adultepic.com","alkux.com","alogaigoi.com","alogaigoidem.com","alohang.xyz","aloyeu.com","amurz.com","anhgaixinh.us","anhjavdep.blogspot.com","anhlondep.xyz","anhmodel.com","anhsex18.com","anhsexjav.xyz","anhvl.net","anhx.net","antonstepanok.com","app567lives.com","appgaixinh.com","apphotlive.biz","applive.vn","applives.top","appliveshow.com","appmmlive.com","argylesecurity.com","avhd.cc","avhd.mobi","b2branked.com","badtopsex.com","banhbeo.net","bblive.org","bblive17.vip","bblive6.vip","bimdep.net","bimdep.vip","bimhong.net","bimmup.net","bimmup.tv","bimxinh.com","biphim18.com","blog.applive.vn","blogtruyensex.com","boy18tube.com","boybamien.com","boymoviedome.com","boyngon.com","bulon.net","buoito.vip","buom.tv","buomdep.pro","buomhay.com","buomngon.com","buomsex.com","buomtube.tv","buomtv.blog","buomtv.club","buomtv.io","buomtv.live","buomtv.me","buomtv.tv","buomxinh.org","callboyvn.net","cangcuc.com","cap3.autos","cap3.beer","cap3.click","cap3.email","cap3.monster","cap3.pics","cap3.pro","cap3.quest","cap3.rest","cap3.sex","cap3.shop","catewalk.com","cd-taxi.com","cdn.javhd.vc","cdn.manhwa24hs.com","cdn.subjav.sex","cdn2.seaporn.net","chanrau.cc","checkerfc.xyz","checkerviet.bet","checkerviet.cc","checkerviet.fan","checkerviet.fun","checkerviet.us","checkgaigoi.xyz","checkgaiviet.us","chich.live","chich.pro","chich.xyz","chich69.co","chichlive.biz","chichlive.com","chichlive.info","chichlive.mobi","chichlive.tumblr.com","chichlivemobi.contently.com","chichnhau.club","chichnhau.vip","chigaicodon.xyz","chim18.xyz","chimchuot.com","chinav.sex","chogai.net","choidangcap.pro","choidangcap.us","choidangcap10.cc","choidangcap13.cc","choidangcap5.cc","choidangcap6.cc","choigaigoi.com","choigaigoi3.cc","choitrai.net","chongtoico.link","chymme.net","clip-sex.biz","clip-sex.net","clip3x.info","clipdit.xyz","clipfull.xyz","clipgai.xyz","clipgaidep.com","clipgaixinh.xyz","cliphot.bet","cliphot.biz","cliphot.cc","cliphot.live","cliphot.lol","cliphot.me","cliphot.men","cliphot.net","cliphot69.cam","cliphot69.cc","cliphot69.life","cliphot69.one","cliphot69.org","cliphot69.win","cliphotnew.net","cliphotvn.com","cliphotvn.info","cliphotvn.org","cliphubs.com","clipmoivn.com","clipnong.blog","clipnong.com","clipnong.lol","clipnong.me","clipnong.online","clipnong.video","clipnong.xyz","clipphot.net","clipquaylen.net","clipsex.cam","clipsex.mobi","clipsex.top","clipsex3x.net","clipsex69.com","clipsexhot.org","clipsexhot3x.net","clipsexmoi.com","clipsexnhanh3x.net","clipsextv.net","clipsexviet.icu","clipsexviet.live","clipsexviet.xyz","clipsexvn.me","clipvietnam18.com","coiphimsex.icu","coiphimsex.org","coithienthai.com","congdongx.com","contrinh.net","cucac.net","cuongdam.org","cuongsex.com","cutexinh.com","cwow.org","dam69.com","dam69.me","dam69.pro","dam69.xyz","damconuong.cc","damconuong.fit","damconuong.love","damconuong.net","damduc.org","damlon.xyz","damsextv.pro","damsexvn.com","damvc.vip","damvodoi.com","demnay.com","depvailon.com","diendanjav.com","ditgai.xyz","ditme.biz","ditnhau.cc","ditnhau.online","ditnhau.xyz","ditnhau69.com","dmsex.net","doctruyen14.biz","doctruyen3qv.pro","doctruyen3qvn.com","doctruyennguoilonhay.blogspot.com","doctruyennguoilonvl.wordpress.com","dokatehnik.ru","donggai.pro","dongtoico.com","dongtoico.live","dongtoico.tv","dongtoico.us","dualeotruyen1s.com","dualeotruyen24h.com","dualeotruyenkq.com","dualeotruyenzz.com","duccai.com","duccai.xyz","dutrai.com","emphequa.com","emxinh.art","ephimsex.com","ephimsex.net","erotic-hentai.com","etinhyeu.com","exviet69.cc","fanpay.org","fap18.net","file.mm1cloud.com","film18.pro","filmseksbaru.blogspot.com","fimsex.org","fimsex.vip","fullcliphot.info","gadit.pro","gai2.buomngon.com","gaicaocap.xyz","gaichanh.co","gaidam18.com","gaidep.blog","gaidepvn.xyz","gaidepxx.com","gaidepxx.me","gaigoi.homes","gaigoi.id","gaigoi.live","gaigoi.mom","gaigoi.network","gaigoi.win","gaigoi.ws","gaigoi2.checkerviet.cc","gaigoi79.top","gaigoialo.com","gaigoibinhduong.vncns.com","gaigoidanang.xyz","gaigoidep.pro","gaigoidep.xyz","gaigoidongthap.xyz","gaigoidulich.info","gaigoihaiphong.gonevis.com","gaigoihaiphong.vncns.com","gaigoihanoi.net","gaigoihanoi.pro","gaigoihanoivip.vncns.com","gaigoihanoivip1.vncns.com","gaigoihanoivip2.vncns.com","gaigoihue.xyz","gaigoikiemdinh.net","gaigoikynu.xyz","gaigoilauxanh.us","gaigoilauxanh.xyz","gaigoinhanh.ggvn.me","gaigoinhanh1.com","gaigoinhatrang.xyz","gaigoiquanhday.net","gaigoisaigon.vncns.com","gaigoisinhvien.xyz","gaigoitelegram.xyz","gaigoitop.com","gaigoituoi18.fun","gaigoivietnam.info","gaigoivietnam.one","gaigoivietnam.shop","gaigoivietnamx.com","gaigoivina.com","gaigoivip.live","gaigoivip.org","gaigoix.com","gaigoixinh.me","gaigoixinh.pro","gaigoiz.com","gaigu.buzz","gaigu.info","gaigu.net","gaigu.xyz","gaigu18.blog","gaigu6.tv","gaigu7.tv","gaigu8.com","gaigutv.net","gaigutv.top","gaigutv.vip","gaikhoehang.com","gaikiemdinh.net","gailauxanh.xyz","gailove.com","gaimassagetainha.vipvn.net","gaimup.click","gaimup.net","gainviewers.com","gaionline.xyz","gaisex.org","gaisex.top","gaithudam.org","gaito.life","gaito.xyz","gaitredep.top","gaixinh.biz","gaixinh.cyou","gaixinh.me","gaixinh.photo","gaixinh.vipvn.net","gaixinh24h.xyz","gaixinh2k.xyz","gaixinh365.com","gaixinh365.net","gaixinhcaocap.top","gaixinhkhoehang.com","gaixinhonline.com","gaixinhthudam.net","gay3x.top","gaysex69.net","genzsex.today","ggvn.xyz","girlxinhblog.com","girlxinhxinh.com","gockhuat.net","goctoi.xyz","goigai.cloud","goigai.net","goigai.one","gvnvh18.com","gwweb.xyz","hangdep18.com","hanoi4.vipviet.net","hanoivip.comvn.me","hanoivip.vnzz.me","hanoivip1.vncns.com","hanoivip2.vncns.com","hanoivip4.vncns.com","hay88.me","hayhaynhat.com","hayjav.com","haysex.net","haysex.plus","haysex.xyz","haysex3xyz.net","hayvkl.xyz","hayvl.pro","hdgay.net","hdxxxx.org","henho.us","henho.vip","henho24h.com","henhozalo.com","hentai24h.org","hentaiaz.net","hentaicb.xyz","hentaimanhwa.net","hentaimoi.com","hentaisub.blog","hentaisub.org","hentaitop.xyz","hentaitruyen.pro","hentaitruyenvn.net","hentaitv.app","hentaitvn.net","hentaivcl.com","hentaivl.online","hentaivl.org","hentaivn.autos","hentaivn.cafe","hentaivn.cc","hentaivn.com","hentaivn.de","hentaivn.fit","hentaivn.forum","hentaivn.fun","hentaivn.life","hentaivn.moe","hentaivn.online","hentaivn.sbs","hentaivn.tv","hentaivngo.com","hentaivngo.xyz","hentaivnn.me","hentaivnn.net","hentaivnpro.net","hentaivnx.com","hentaivv1.com","hentaiz.vip","hentaizvn.com","hentaizz.cc","hentaizz.net","heo3x.net","heo68.xyz","heo69.cc","heo69.com","heo69.icu","heo69.top","heodamtv.us","heodem.com","heohay.com","heomup.net","heotop.com","heotv.net","heoviet.com","heovl.blog","heovl.bot","heovl.cc","heovl.com","heovl.fit","heovl.fun","heovl.im","heovl.live","heovl.me","heovl.moe","heovl.name","heovl.net","heovl.tube","heovl.tv","heovl1.com","heovl1.net","heovlx.com","hhentai.net","hihisex.app","hihisex.pro","hihisex.vip","hinhgai.com","hinhgaixinh.org","hisex.pro","hisex.xyz","home.tuoi69vn.com","hongbiencang.com","hotlive.win","hotvnn.com","hqthaiporn.com","htvncdn.net","i1.hhentai.net","i3.hentaivn.tv","i3.hhentai.net","ihentai.fun","ihentai.to","ihentai.ws","img.hentaivv1.com","img.nangcuc.dev","img.nangcucz.link","img.phimkk.pro","img.sexbuz.com","img.vl69.pro","img.xxxmeo.com","img.xxxphim.top","img.xxxviet.io","info.xnxx.gold","japanhdv.biz","japansex.blog","jav-hay.com","jav2.pro","javabc.com","javagv.biz","javbiz.net","javdep.pro","javfinder.la","javfinder.li","javgg.me","javgg.sbs","javgiga.com","pornhub.com","xvideos.com","xnxx.com","redtube.com","youporn.com","spankbang.com","eporner.com","chaturbate.com","stripchat.com","bongacams.com","cam4.com","livejasmin.com","hqporner.com","beeg.com","xhamster.com","tube8.com","daftsex.com","brazzers.com","naughtyamerica.com","tnaflix.com","porn.com","rule34.xxx","gelbooru.com","nhentai.net","e-hentai.org","hanime.tv","javhd.com","javmost.com","javbus.com","missav.com","jable.tv","avgle.com","onlyfans.com","fansly.com","manyvids.com","camsoda.com","heavy-r.com","motherless.com","tblop.com","sex.com","vlxx.sex","vlxx.tube","vlxx.top","vlxx.pro","phimsex.com","sexvn.com"]);

  // Danh sách những câu động viên sâu sắc đánh thức bản lĩnh và ý chí
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
    if (rawStevenBlackHosts && rawStevenBlackHosts.includes('\n' + host + '\n')) return true;

    // 5. Kiểm tra toàn bộ subdomain cha (ví dụ: m.pornhub.com -> pornhub.com)
    const parts = host.split('.');
    while (parts.length > 1) {
      parts.shift();
      const parent = parts.join('.');
      if (customBlocked.has(parent) || PREBUNDLED_DOMAINS.has(parent)) return true;
      if (rawStevenBlackHosts && rawStevenBlackHosts.includes('\n' + parent + '\n')) return true;
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

  // --- CƠ CHẾ CHẶN TRIỆT ĐỂ & HIỂN THỊ MÀN HÌNH ĐỘNG VIÊN ---
  function enforceBlockScreen(host) {
    // Ngắt ngay lập tức kết nối và luồng tải của trang web
    try {
      window.stop();
    } catch (e) {}

    document.title = '🛡️ DỪNG LẠI! BẠN MẠNH MẼ HƠN CÁM DỖ NÀY!';

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
        style.textContent = `
          body > *:not(#ap-shield-root) {
            display: none !important;
            visibility: hidden !important;
          }
          html, body {
            overflow: hidden !important;
            background: #090d16 !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        `;
        (document.head || document.documentElement || document).appendChild(style);
      }

      // Tạo màn hình chắn toàn phần (Full-screen Shield)
      const shield = document.createElement('div');
      shield.id = 'ap-shield-root';
      shield.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2147483647 !important;
        background: linear-gradient(135deg, #090d16 0%, #0f172a 45%, #1e1b4b 100%) !important;
        color: #f1f5f9 !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 24px !important;
        box-sizing: border-box !important;
        overflow-y: auto !important;
      `;

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

    return `
      <div style="
        max-width: 660px;
        width: 100%;
        background: rgba(30, 41, 59, 0.88);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 24px;
        padding: 34px 30px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.2);
        text-align: center;
        box-sizing: border-box;
      ">
        <div style="
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
          margin-bottom: 18px;
        ">
          ⛔ ĐÃ KÍCH HOẠT BẢO VỆ TỰ ĐỘNG
        </div>

        <div style="
          width: 76px;
          height: 76px;
          margin: 0 auto 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(79, 70, 229, 0.45);
        ">
          <svg style="width: 42px; height: 42px; fill: none; stroke: #ffffff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>

        <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin-bottom: 8px; line-height: 1.3;">
          Dừng Lại! Tương Lai Đang Chờ Đón Bạn
        </h1>

        <div style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">
          Đã chặn trang web: <span style="color: #f87171; font-family: monospace; background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 6px;">${escapeHtml(host)}</span>
        </div>

        <div style="
          background: linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15));
          border: 1px solid rgba(16, 185, 129, 0.35);
          padding: 10px 18px;
          border-radius: 12px;
          color: #6ee7b7;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 22px;
          display: inline-block;
        ">
          🛡️ Bạn vừa chiến thắng cám dỗ lần thứ <strong>${count}</strong>! Hãy kiên định!
        </div>

        <div style="
          background: rgba(15, 23, 42, 0.65);
          border-left: 4px solid #6366f1;
          padding: 18px 20px;
          border-radius: 12px;
          margin-bottom: 22px;
          text-align: left;
        ">
          <div id="ap-quote-text" style="font-size: 15px; line-height: 1.6; color: #e2e8f0; font-style: italic; margin-bottom: 6px; transition: opacity 0.2s;">
            “${escapeHtml(randomQuote.quote)}”
          </div>
          <div id="ap-quote-author" style="font-size: 13px; color: #818cf8; font-weight: 600; text-align: right; transition: opacity 0.2s;">
            — ${escapeHtml(randomQuote.author)}
          </div>
        </div>

        <div style="
          background: rgba(15, 23, 42, 0.45);
          border: 1px dashed rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 16px 18px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        ">
          <div style="
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: radial-gradient(circle, #6366f1 0%, #312e81 100%);
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
            flex-shrink: 0;
          "></div>
          <div style="text-align: left; flex-grow: 1;">
            <div style="font-size: 13px; font-weight: 700; color: #a5b4fc; margin-bottom: 4px;">
              Bài tập thở tĩnh tâm 4-4-4:
            </div>
            <div id="ap-breath-state" style="font-size: 15px; font-weight: 600; color: #38bdf8;">
              🌸 Hít vào thật sâu bằng mũi (4s)... [4s]
            </div>
            <div style="font-size: 11px; color: #94a3b8;">
              Hạ hưng phấn hệ thần kinh và làm dịu cơn thôi thúc nhất thời
            </div>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 16px;">
          <button id="ap-btn-close" style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
            color: #ffffff;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
          ">
            ✖️ Đóng tab này ngay
          </button>

          <button id="ap-btn-home" style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            background: linear-gradient(135deg, #10b981 0%, #047857 100%);
            color: #ffffff;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
          ">
            🧭 Về Google an toàn
          </button>

          <button id="ap-btn-lofi" style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 12px 18px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.08);
            color: #cbd5e1;
          ">
            🎧 Nghe Lofi thư giãn
          </button>

          <button id="ap-btn-quote" style="
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 12px 18px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.08);
            color: #cbd5e1;
          ">
            🎲 Đổi câu động viên
          </button>
        </div>

        <div style="font-size: 12px; color: #64748b; margin-top: 16px; line-height: 1.5;">
          Bộ lọc StevenBlack Hosts (hơn 76.000 tên miền) + Nhận diện thông minh • Tự động cập nhật 24h<br>
          Phát triển bởi <a href="https://github.com/ngxuanhai123/tampermonkey-porn-blocker" target="_blank" rel="noopener noreferrer" style="color: #818cf8; text-decoration: none;">ngxuanhai123</a>
        </div>
      </div>
    `;
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

    const btnLofi = shield.querySelector('#ap-btn-lofi');
    if (btnLofi) {
      btnLofi.onclick = function () {
        window.location.replace('https://www.youtube.com/results?search_query=lofi+hip+hop+radio+relax+study');
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
          quoteText.textContent = `“${item.quote}”`;
          quoteAuthor.textContent = `— ${item.author}`;
          quoteText.style.opacity = '1';
          quoteAuthor.style.opacity = '1';
        }, 150);
      };
    }

    const breathState = shield.querySelector('#ap-breath-state');
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
          showNotification('Cập nhật thành công! 🛡️', `Đã nạp ${count.toLocaleString('vi-VN')} tên miền từ StevenBlack Hosts!`);
        }
      } else {
        // Fallback sang raw GitHub
        console.warn('[Porn Blocker] CDN thất bại, thử sang nguồn phụ GitHub...');
        fetchFilter(FALLBACK_FILTER_URL, function (fallbackErr, fallbackCount) {
          if (!fallbackErr && fallbackCount > 5000) {
            if (isManual) {
              showNotification('Cập nhật thành công! 🛡️', `Đã nạp ${fallbackCount.toLocaleString('vi-VN')} tên miền từ StevenBlack Hosts!`);
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
            const count = (rawString.match(/\n/g) || []).length - 1;
            if (count > 5000) {
              GM_setValue(STORAGE_KEYS.BLOCKED_HOSTS_RAW, rawString);
              GM_setValue(STORAGE_KEYS.LAST_UPDATE, Date.now());
              GM_setValue(STORAGE_KEYS.FILTER_COUNT, count);
              console.log(`[Porn Blocker] Cập nhật thành công: ${count} domains`);
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
    const lines = text.split('\n');
    const domains = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.charCodeAt(0) === 35 /* dấu '#' */) continue;

      const parts = line.split(/\s+/);
      if (parts.length >= 2 && (parts[0] === '0.0.0.0' || parts[0] === '127.0.0.1')) {
        const domain = parts[1].toLowerCase();
        if (domain && domain !== 'localhost' && !domain.startsWith('#')) {
          domains.push(domain);
        }
      }
    }
    // Định dạng chuỗi: \ndomain1\ndomain2\ndomain3\n để tìm kiếm includes siêu tốc O(1)
    return '\n' + domains.join('\n') + '\n';
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
        `🛡️ THỐNG KÊ PORN BLOCKER GUARD\n` +
        `----------------------------------------\n` +
        `• Tên miền từ StevenBlack: ${count > 0 ? count.toLocaleString('vi-VN') + ' domains' : 'Đang đồng bộ'}\n` +
        `• Tên miền tích hợp sẵn: ${PREBUNDLED_DOMAINS.size} domains\n` +
        `• Nhận diện từ khóa thông minh: Đang bật (Active)\n` +
        `• Lần cập nhật cuối: ${timeStr}\n` +
        `• Số lần giúp bạn chiến thắng cám dỗ: ${prevented} lần 🎉\n` +
        `• Tên miền chặn thủ công: ${customBlockedCount}\n` +
        `• Tên miền ngoại lệ (Whitelist): ${customWhitelistCount}\n\n` +
        `Nguồn: StevenBlack/hosts (alternates/porn-only)`;

      alert(report);
    });

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
