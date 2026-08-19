const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Emerald theme SVG icon
const svgBuffer = Buffer.from(`
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="#09090b"/>
  <rect x="32" y="32" width="448" height="448" rx="96" fill="url(#grad)" stroke="#10b981" stroke-width="8"/>
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#064e3b" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="#09090b" stop-opacity="0.95"/>
      <stop offset="1" stop-color="#022c22" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <!-- Car & Dollar Icon -->
  <g transform="translate(106, 126) scale(1.2)" fill="none" stroke="#10b981" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 17h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2"/>
    <path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/>
    <path d="M15 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/>
    <path d="M5 12l2-6h10l2 6"/>
  </g>
  <text x="256" y="390" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="52" font-weight="900">سفرمالی</text>
</svg>
`);

async function generate() {
  await sharp(svgBuffer)
    .resize(192, 192)
    .toFile(path.join(iconsDir, 'icon-192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .toFile(path.join(iconsDir, 'icon-512.png'));

  console.log('PWA Icons generated successfully!');
}

generate().catch(console.error);
