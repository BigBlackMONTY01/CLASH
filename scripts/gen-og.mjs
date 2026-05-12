import { writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../artifacts/clash/public");
const SVG_PATH = join(OUT_DIR, "og-image.svg");
const PNG_PATH = join(OUT_DIR, "og-image.png");

mkdirSync(OUT_DIR, { recursive: true });

async function fetchBase64(url, type) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buf = await res.arrayBuffer();
  return `data:${type};base64,${Buffer.from(buf).toString("base64")}`;
}

async function fetchGoogleFontUrls(family) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&display=swap`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });
  const css = await res.text();
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((m) =>
    m[1].replace(/['"]/g, "")
  );
  return urls;
}

console.log("Fetching fonts…");

const [bebasUrls, barlowUrls] = await Promise.all([
  fetchGoogleFontUrls("Bebas Neue"),
  fetchGoogleFontUrls("Barlow Condensed:wght@600;700"),
]);

const [bebasB64, barlowB64, barlowBoldB64] = await Promise.all([
  fetchBase64(bebasUrls[0], "font/woff2"),
  fetchBase64(barlowUrls[0], "font/woff2"),
  fetchBase64(barlowUrls[1] ?? barlowUrls[0], "font/woff2"),
]);

const fontDefs = `
  <style>
    @font-face {
      font-family: 'Bebas Neue';
      src: url('${bebasB64}') format('woff2');
      font-weight: 400;
    }
    @font-face {
      font-family: 'Barlow Condensed';
      src: url('${barlowB64}') format('woff2');
      font-weight: 600;
    }
    @font-face {
      font-family: 'Barlow Condensed';
      src: url('${barlowBoldB64}') format('woff2');
      font-weight: 700;
    }
  </style>`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 1200 630" width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  ${fontDefs}
  <defs>
    <radialGradient id="redGlow2" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#e63946" stop-opacity="0.22"/>
      <stop offset="70%" stop-color="#e63946" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#080808" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="topBar2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e63946"/>
      <stop offset="50%" stop-color="#f4c542"/>
      <stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
    <linearGradient id="streakL2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e63946" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#e63946" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="streakR2" x1="100%" y1="0%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#e63946" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#e63946" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="vignette2" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.65"/>
    </radialGradient>
    <clipPath id="aClip">
      <rect x="468" y="60" width="138" height="340"/>
    </clipPath>
  </defs>

  <!-- Base -->
  <rect width="1200" height="630" fill="#080808"/>

  <!-- Grid -->
  <g opacity="0.03" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105"/>
    <line x1="0" y1="210" x2="1200" y2="210"/>
    <line x1="0" y1="315" x2="1200" y2="315"/>
    <line x1="0" y1="420" x2="1200" y2="420"/>
    <line x1="0" y1="525" x2="1200" y2="525"/>
    <line x1="150" y1="0" x2="150" y2="630"/>
    <line x1="300" y1="0" x2="300" y2="630"/>
    <line x1="450" y1="0" x2="450" y2="630"/>
    <line x1="600" y1="0" x2="600" y2="630"/>
    <line x1="750" y1="0" x2="750" y2="630"/>
    <line x1="900" y1="0" x2="900" y2="630"/>
    <line x1="1050" y1="0" x2="1050" y2="630"/>
  </g>

  <!-- Red glow -->
  <rect width="1200" height="630" fill="url(#redGlow2)"/>

  <!-- Diagonal slashes -->
  <polygon points="0,0 220,0 120,630 0,630" fill="#e63946" opacity="0.04"/>
  <polygon points="1200,0 980,0 1080,630 1200,630" fill="#e63946" opacity="0.04"/>

  <!-- Horizontal streaks -->
  <rect x="0" y="314" width="260" height="1.5" fill="url(#streakL2)"/>
  <rect x="940" y="314" width="260" height="1.5" fill="url(#streakR2)"/>

  <!-- Full CLASH white -->
  <text x="600" y="380" font-family="'Bebas Neue', sans-serif" font-size="320" fill="#efefef" text-anchor="middle" letter-spacing="6">CLASH</text>

  <!-- Red A overlay -->
  <text x="600" y="380" font-family="'Bebas Neue', sans-serif" font-size="320" fill="#e63946" text-anchor="middle" letter-spacing="6" clip-path="url(#aClip)">CLASH</text>

  <!-- ARGUE. WIN. -->
  <text x="600" y="456" font-family="'Bebas Neue', sans-serif" font-size="64" fill="#e63946" text-anchor="middle" letter-spacing="16">ARGUE. WIN.</text>

  <!-- Tagline -->
  <text x="600" y="508" font-family="'Barlow Condensed', sans-serif" font-size="19" fill="#505050" text-anchor="middle" letter-spacing="5" font-weight="600">YOU VS AI · GET SCORED · CLIMB THE RANKS</text>

  <!-- Top rainbow bar -->
  <rect x="0" y="0" width="1200" height="5" fill="url(#topBar2)"/>

  <!-- Bottom bar -->
  <rect x="0" y="625" width="1200" height="5" fill="#161616"/>

  <!-- Logo top left -->
  <text x="48" y="70" font-family="'Bebas Neue', sans-serif" font-size="36" fill="#f0f0f0" letter-spacing="1">CL</text>
  <text x="96" y="70" font-family="'Bebas Neue', sans-serif" font-size="36" fill="#e63946" letter-spacing="1">A</text>
  <text x="118" y="70" font-family="'Bebas Neue', sans-serif" font-size="36" fill="#f0f0f0" letter-spacing="1">SH</text>

  <!-- BETA badge -->
  <rect x="170" y="48" width="50" height="22" rx="3" fill="#e63946"/>
  <text x="195" y="63" font-family="'Barlow Condensed', sans-serif" font-size="12" fill="#fff" text-anchor="middle" letter-spacing="2" font-weight="700">BETA</text>

  <!-- Live dot -->
  <circle cx="894" cy="57" r="6" fill="#22c55e"/>
  <text x="910" y="63" font-family="'Barlow Condensed', sans-serif" font-size="15" fill="#444" letter-spacing="2" font-weight="600">LIVE · 2,847 DEBATES FOUGHT</text>

  <!-- Bottom left opponents -->
  <text x="48" y="592" font-family="'Barlow Condensed', sans-serif" font-size="13" fill="#303030" letter-spacing="3" font-weight="700">6 AI OPPONENTS</text>
  <text x="210" y="594" font-size="19">🎓</text>
  <text x="240" y="594" font-size="19">🏛️</text>
  <text x="270" y="594" font-size="19">⚖️</text>
  <text x="300" y="594" font-size="19">🔮</text>
  <text x="330" y="594" font-size="19">😈</text>
  <text x="360" y="594" font-size="19">🔬</text>

  <!-- Bottom right URL -->
  <text x="1152" y="592" font-family="'Barlow Condensed', sans-serif" font-size="15" fill="#303030" text-anchor="end" letter-spacing="2">clashbant.netlify.app</text>

  <!-- Vignette -->
  <rect width="1200" height="630" fill="url(#vignette2)"/>
</svg>`;

console.log("Writing SVG…");
writeFileSync(SVG_PATH, svg);

console.log("Converting to PNG with ImageMagick…");
execSync(
  `convert -background none -density 150 "${SVG_PATH}" "${PNG_PATH}"`,
  { stdio: "inherit" }
);

console.log(`Done → ${PNG_PATH}`);
