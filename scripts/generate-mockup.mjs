// Generate "TILE A / TILE B" style mockup PNGs with 4 screens: HOME / MENU / DETTAGLIO / CART
// Uses Playwright + system Microsoft Edge (no Chromium download).
// Output: C:\Users\Notebook Lenovo\Desktop\mock up 1.png + mock up 2.png

import { chromium } from "playwright-core";
import { writeFileSync } from "fs";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const DESKTOP = "C:\\Users\\Notebook Lenovo\\Desktop";

const VERSIONS = [
  {
    file: "mock up 1.png",
    badge: "TILE A",
    title: "Minimal & Zen",
    subtitle: "Sfondo paper cream, accenti sage bamboo, tipografia Noto Serif JP — estetica giapponese pulita e ariosa",
    url: "http://localhost:3001",
    bg: "linear-gradient(135deg, #f6efe5 0%, #ebdfc8 100%)",
    accentBg: "#5a7a64",
    accentText: "#fafaf9",
    titleColor: "#1c1c1c",
    subtitleColor: "rgba(28,28,28,0.55)",
    labelColor: "rgba(28,28,28,0.45)",
    watermarkColor: "rgba(28,28,28,0.35)",
  },
  {
    file: "mock up 2.png",
    badge: "TILE B",
    title: "Tokyo Night",
    subtitle: "Sfondo ink #0a0a0a, accenti sushi-red e gold, vibe izakaya premium — estetica notturna giapponese",
    url: "http://localhost:3002",
    bg: "linear-gradient(135deg, #18181a 0%, #0a0a0a 100%)",
    accentBg: "#c8102e",
    accentText: "#fafaf9",
    titleColor: "#fafaf9",
    subtitleColor: "rgba(255,255,255,0.6)",
    labelColor: "rgba(255,255,255,0.45)",
    watermarkColor: "rgba(255,255,255,0.3)",
  },
];

const SCREENS = [
  {
    path: "/",
    label: "HOME",
    prefillCart: false,
  },
  {
    path: "/menu",
    label: "MENU",
    prefillCart: false,
  },
  {
    path: "/menu?preview=uramaki-sakura",
    label: "DETTAGLIO",
    prefillCart: false,
    waitExtra: 1200, // drawer animation
  },
  {
    path: "/?cart=open",
    label: "CARRELLO",
    prefillCart: true,
    waitExtra: 1200,
  },
];

const PREFILL_CART_LS = JSON.stringify({
  state: {
    items: [
      { dishId: "uramaki-sakura", quantity: 2 },
      { dishId: "poke-tonno-mango", quantity: 1 },
      { dishId: "sashimi-misto", quantity: 1 },
    ],
  },
  version: 0,
});

function buildHTML(version, shots) {
  return `<!doctype html>
<html><head><meta charset="utf-8" /><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif+JP:wght@500;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  width: 1600px;
  height: 1000px;
  background: ${version.bg};
  font-family: 'Inter', system-ui, sans-serif;
  padding: 56px 48px 40px;
  position: relative;
  overflow: hidden;
}
.kanji {
  position: absolute;
  top: -30px;
  right: -10px;
  font-family: 'Noto Serif JP', serif;
  font-weight: 700;
  font-size: 320px;
  line-height: 1;
  color: ${version.titleColor};
  opacity: 0.05;
  user-select: none;
  pointer-events: none;
}
.header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 8px;
}
.badge {
  background: ${version.accentBg};
  color: ${version.accentText};
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.18em;
}
.title {
  font-family: 'Noto Serif JP', serif;
  font-weight: 700;
  font-size: 36px;
  color: ${version.titleColor};
}
.subtitle {
  color: ${version.subtitleColor};
  font-size: 15px;
  margin-bottom: 36px;
  max-width: 900px;
  line-height: 1.5;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 36px;
}
.phone-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.phone {
  width: 100%;
  aspect-ratio: 390 / 844;
  border-radius: 42px;
  padding: 10px;
  background: #0a0a0a;
  border: 2.5px solid #2a2a2a;
  box-shadow:
    0 30px 70px -20px rgba(0,0,0,0.45),
    0 6px 20px -8px rgba(0,0,0,0.3);
  position: relative;
}
.phone::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 92px;
  height: 22px;
  background: #0a0a0a;
  border-radius: 0 0 16px 16px;
  z-index: 5;
}
.screen {
  width: 100%;
  height: 100%;
  border-radius: 32px;
  overflow: hidden;
}
.screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.label {
  margin-top: 18px;
  font-size: 11px;
  letter-spacing: 0.22em;
  color: ${version.labelColor};
  font-weight: 600;
}
.watermark {
  position: absolute;
  bottom: 24px;
  left: 48px;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: ${version.watermarkColor};
  font-weight: 500;
}
.brand {
  position: absolute;
  bottom: 24px;
  right: 48px;
  font-family: 'Noto Serif JP', serif;
  font-size: 14px;
  letter-spacing: 0.1em;
  color: ${version.watermarkColor};
  font-weight: 600;
}
</style></head>
<body>
<div class="kanji">寿司</div>
<div class="header">
  <span class="badge">${version.badge}</span>
  <span class="title">${version.title}</span>
</div>
<div class="subtitle">${version.subtitle}</div>
<div class="grid">
  ${shots
    .map(
      (s) => `
    <div class="phone-wrap">
      <div class="phone"><div class="screen"><img src="data:image/png;base64,${s.data}" /></div></div>
      <div class="label">${s.label}</div>
    </div>`
    )
    .join("")}
</div>
<div class="watermark">SPECIAL SUSHI POKE — DEMO DELIVERABLE · BARI</div>
<div class="brand">特別寿司ポケ</div>
</body></html>`;
}

const browser = await chromium.launch({
  executablePath: EDGE_PATH,
  headless: true,
});

for (const version of VERSIONS) {
  console.log(`\n=== Generating ${version.file} (${version.title}) ===`);

  const shots = [];

  for (const screen of SCREENS) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });

    if (screen.prefillCart) {
      await context.addInitScript((cartLs) => {
        try {
          localStorage.setItem("ssp-cart-v1", cartLs);
        } catch (e) {}
      }, PREFILL_CART_LS);
    }

    const page = await context.newPage();
    const url = version.url + screen.path;
    console.log(`  capturing ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    } catch (e) {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    }
    await page.waitForTimeout(1500 + (screen.waitExtra ?? 0));
    const buf = await page.screenshot({ fullPage: false, type: "png" });
    shots.push({ label: screen.label, data: buf.toString("base64") });
    await page.close();
    await context.close();
  }

  // Build composition HTML and render to PNG
  const compContext = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  const compPage = await compContext.newPage();
  const html = buildHTML(version, shots);
  await compPage.setContent(html, { waitUntil: "networkidle" });
  await compPage.waitForTimeout(1500);
  const outPath = `${DESKTOP}\\${version.file}`;
  const finalBuf = await compPage.screenshot({ fullPage: false, type: "png" });
  writeFileSync(outPath, finalBuf);
  console.log(`  saved → ${outPath}`);
  await compContext.close();
}

await browser.close();
console.log("\n✓ Both mockups generated.");
