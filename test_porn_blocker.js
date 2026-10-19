/**
 * TEST SUITE: Porn Blocker Userscript (tampermonkey-porn-blocker)
 * Kiểm thử toàn diện chức năng & bảo mật
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const results = [];
function recordResult(name, passed, details) {
  results.push({ name, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark} | ${name}`);
  if (details) console.log(`   └─ ${details}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ DỰ ÁN: tampermonkey-porn-blocker');
  console.log('====================================================\n');

  const dir = __dirname;
  const scriptPath = path.join(dir, 'porn-blocker.user.js');
  const prebundledPath = path.join(dir, 'prebundled.json');
  const buildPath = path.join(dir, 'build.js');
  const readmePath = path.join(dir, 'README.md');

  // TEST 1: Cấu trúc file
  try {
    const hasScript = fs.existsSync(scriptPath);
    const hasPrebundled = fs.existsSync(prebundledPath);
    const hasBuild = fs.existsSync(buildPath);
    const hasReadme = fs.existsSync(readmePath);
    recordResult('1. Cấu trúc file cơ bản', hasScript && hasPrebundled && hasBuild && hasReadme, `script: ${hasScript}, prebundled: ${hasPrebundled}, build: ${hasBuild}`);
  } catch (e) {
    recordResult('1. Cấu trúc file cơ bản', false, e.message);
  }

  // TEST 2: Kiểm tra prebundled.json
  try {
    const domains = JSON.parse(fs.readFileSync(prebundledPath, 'utf8'));
    const passed = Array.isArray(domains) && domains.length > 500;
    recordResult('2. Danh sách tên miền tích hợp sẵn (prebundled.json)', passed, `Số tên miền: ${domains.length}`);
  } catch (e) {
    recordResult('2. Danh sách tên miền tích hợp sẵn', false, e.message);
  }

  // TEST 3: Build tự động
  try {
    execSync('node build.js', { cwd: dir });
    const content = fs.readFileSync(scriptPath, 'utf8');
    const passed = content.includes('PREBUNDLED_DOMAINS') && content.length > 30000;
    recordResult('3. Quy trình Build Userscript (build.js)', passed, `Dung lượng script sau build: ${content.length} bytes`);
  } catch (e) {
    recordResult('3. Quy trình Build Userscript', false, e.message);
  }

  const scriptContent = fs.readFileSync(scriptPath, 'utf8');

  // TEST 4: An toàn Whitelist (Không chặn nhầm các trang học tập / công việc)
  try {
    const safeDomains = ['google.com', 'github.com', 'wikipedia.org', 'cloudflare.com', 'github.io'];
    const passed = safeDomains.every(d => scriptContent.includes(`'${d}'`));
    recordResult('4. Danh sách Whitelist an toàn (Google, GitHub, Cloudflare...)', passed, `Đầy đủ ${safeDomains.length} domain thiết yếu`);
  } catch (e) {
    recordResult('4. Danh sách Whitelist an toàn', false, e.message);
  }

  // TEST 5: Kết nối bộ lọc CDN StevenBlack Hosts
  try {
    const t0 = Date.now();
    const res = await fetch('https://cdn.jsdelivr.net/gh/StevenBlack/hosts@master/alternates/porn-only/hosts', { method: 'HEAD' });
    const lat = Date.now() - t0;
    const passed = res.status === 200;
    recordResult('5. Kết nối máy chủ CDN bộ lọc StevenBlack Hosts', passed, `Status: ${res.status}, Latency: ${lat}ms`);
  } catch (e) {
    recordResult('5. Kết nối máy chủ CDN bộ lọc StevenBlack Hosts', false, e.message);
  }

  const passedCount = results.filter(r => r.passed).length;
  console.log('\n====================================================');
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passedCount}/${results.length} bài test vượt qua`);
  console.log('====================================================\n');
}

runTests();
