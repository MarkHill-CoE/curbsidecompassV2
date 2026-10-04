const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');

// Create 800x800 square canvas matching the user's uploaded image
const width = 800;
const height = 800;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// 1. TOP HEADER BANNER
const headerHeight = 110;
ctx.fillStyle = '#18538c'; // City of Edmonton rich civic blue
ctx.fillRect(0, 0, width, headerHeight);

// "Curbside Compass" in bold yellow
ctx.fillStyle = '#f2b735';
ctx.font = 'bold 54px "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Curbside Compass', width / 2, headerHeight / 2 + 2);

// 2. ISOMETRIC SIMULATION BACKGROUND
const simY = headerHeight;
const simH = height - headerHeight;
ctx.fillStyle = '#143657'; // simulation night/canvas dark slate-blue
ctx.fillRect(0, simY, width, simH);

// Save state for simulation area
ctx.save();
ctx.translate(0, simY);

// Draw Grass Base
ctx.beginPath();
ctx.moveTo(-100, 260);
ctx.lineTo(600, -70);
ctx.lineTo(950, 240);
ctx.lineTo(250, 750);
ctx.closePath();
ctx.fillStyle = '#659c58';
ctx.fill();

// Draw Back Lane / Alley
ctx.beginPath();
ctx.moveTo(100, 160);
ctx.lineTo(750, -140);
ctx.lineTo(800, -115);
ctx.lineTo(150, 185);
ctx.closePath();
ctx.fillStyle = '#8c959e';
ctx.fill();

// Draw Sidewalk
ctx.beginPath();
ctx.moveTo(-60, 440);
ctx.lineTo(640, 90);
ctx.lineTo(680, 110);
ctx.lineTo(-20, 460);
ctx.closePath();
ctx.fillStyle = '#c5ccd3';
ctx.fill();

// Draw Asphalt Road
ctx.beginPath();
ctx.moveTo(-100, 520);
ctx.lineTo(580, 180);
ctx.lineTo(640, 220);
ctx.lineTo(-40, 560);
ctx.closePath();
ctx.fillStyle = '#3f444a';
ctx.fill();

// Road dashed centerline
ctx.strokeStyle = '#e2e8f0';
ctx.lineWidth = 4;
ctx.setLineDash([20, 18]);
ctx.beginPath();
ctx.moveTo(-50, 540);
ctx.lineTo(610, 200);
ctx.stroke();
ctx.setLineDash([]);

// Helper: Isometric house with garage
function drawIsoHouse(x, y, houseColor, roofColor, hasGarage = true, garageOccupied = false) {
  ctx.save();
  ctx.translate(x, y);

  // House Base (Front and side walls)
  // Left wall
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-26, -13);
  ctx.lineTo(-26, -45);
  ctx.lineTo(0, -32);
  ctx.closePath();
  ctx.fillStyle = houseColor;
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Right wall
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(44, -22);
  ctx.lineTo(44, -54);
  ctx.lineTo(0, -32);
  ctx.closePath();
  ctx.fillStyle = houseColor;
  ctx.fill();
  ctx.stroke();

  // Front porch / steps
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-6, -6, 12, 6);

  // Pitched Roof
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(-26, -45);
  ctx.lineTo(-10, -68);
  ctx.lineTo(16, -55);
  ctx.closePath();
  ctx.fillStyle = roofColor;
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(44, -54);
  ctx.lineTo(16, -55);
  ctx.closePath();
  ctx.fillStyle = roofColor;
  ctx.fill();
  ctx.stroke();

  // Back Garage
  if (hasGarage) {
    const gx = 36;
    const gy = -82;
    // Garage left wall
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx - 18, gy - 9);
    ctx.lineTo(gx - 18, gy - 28);
    ctx.lineTo(gx, gy - 19);
    ctx.closePath();
    ctx.fillStyle = '#2d3748';
    ctx.fill();
    ctx.stroke();

    // Garage right wall
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 26, gy - 13);
    ctx.lineTo(gx + 26, gy - 32);
    ctx.lineTo(gx, gy - 19);
    ctx.closePath();
    ctx.fillStyle = '#1a202c';
    ctx.fill();
    ctx.stroke();

    // Garage roof
    ctx.beginPath();
    ctx.moveTo(gx, gy - 19);
    ctx.lineTo(gx - 18, gy - 28);
    ctx.lineTo(gx - 6, gy - 40);
    ctx.lineTo(gx + 12, gy - 31);
    ctx.closePath();
    ctx.fillStyle = roofColor;
    ctx.fill();
    ctx.stroke();

    // Garage Badge
    const bx = gx + 5;
    const by = gy - 46;
    const bw = garageOccupied ? 68 : 58;
    const bh = 18;
    const br = 9;

    ctx.save();
    // Pill background
    ctx.fillStyle = garageOccupied ? '#059669' : '#d97706';
    ctx.strokeStyle = garageOccupied ? '#34d399' : '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    // Rounded rect
    const rpx = bx - bw / 2;
    const rpy = by - bh / 2;
    ctx.moveTo(rpx + br, rpy);
    ctx.lineTo(rpx + bw - br, rpy);
    ctx.arcTo(rpx + bw, rpy, rpx + bw, rpy + bh, br);
    ctx.lineTo(rpx + bw, rpy + bh - br);
    ctx.arcTo(rpx + bw, rpy + bh, rpx + bw - br, rpy + bh, br);
    ctx.lineTo(rpx + br, rpy + bh);
    ctx.arcTo(rpx, rpy + bh, rpx, rpy + bh - br, br);
    ctx.lineTo(rpx, rpy + br);
    ctx.arcTo(rpx, rpy, rpx + br, rpy, br);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Status dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(rpx + 9, rpy + bh / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Text
    ctx.font = 'bold 9.5px "Open Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(garageOccupied ? 'OCCUPIED' : 'VACANT', rpx + 16, rpy + bh / 2 + 0.5);
    ctx.restore();
  }

  ctx.restore();
}

// Helper: Isometric cubic tree
function drawIsoTree(x, y) {
  ctx.save();
  ctx.translate(x, y);
  // Trunk
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-2, -10, 4, 10);
  // Foliage cube
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, -15);
  ctx.lineTo(-10, -32);
  ctx.lineTo(0, -27);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(10, -15);
  ctx.lineTo(10, -32);
  ctx.lineTo(0, -27);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.moveTo(0, -27);
  ctx.lineTo(-10, -32);
  ctx.lineTo(0, -37);
  ctx.lineTo(10, -32);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Helper: Isometric car
function drawIsoCar(x, y, color, isTruck = false) {
  ctx.save();
  ctx.translate(x, y);
  if (isTruck) {
    // Orange delivery truck with green stripes
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-24, -12);
    ctx.lineTo(-24, -36);
    ctx.lineTo(24, -12);
    ctx.lineTo(24, 12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(-24, -36);
    ctx.lineTo(-10, -44);
    ctx.lineTo(14, -32);
    ctx.closePath();
    ctx.fill();

    // Green stripe
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-12, -18, 6, 16);
  } else {
    // Sedan
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-18, -9);
    ctx.lineTo(-18, -20);
    ctx.lineTo(18, -2);
    ctx.lineTo(18, 9);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4, -12);
    ctx.lineTo(-14, -17);
    ctx.lineTo(-8, -22);
    ctx.lineTo(2, -17);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// DRAW HOUSES & TREES (from top-right to bottom-left)
const houses = [
  { x: 55, y: 220, house: '#eab308', roof: '#854d0e', occupied: false }, // Yellow
  { x: 135, y: 260, house: '#dc2626', roof: '#7f1d1d', occupied: true },  // Red
  { x: 215, y: 300, house: '#2563eb', roof: '#1e3a8a', occupied: true },  // Blue
  { x: 295, y: 340, house: '#1e293b', roof: '#0f172a', occupied: false }, // Dark Navy
  { x: 375, y: 380, house: '#b45309', roof: '#78350f', occupied: true },  // Brown
  { x: 455, y: 420, house: '#166534', roof: '#14532d', occupied: false }, // Dark Green
  { x: 535, y: 460, house: '#d97706', roof: '#92400e', occupied: true },  // Gold
  { x: 615, y: 500, house: '#991b1b', roof: '#450a0a', occupied: false }, // Brick Red
  { x: 695, y: 540, house: '#1e293b', roof: '#020617', occupied: false }  // Navy
];

houses.forEach((h, i) => {
  drawIsoHouse(h.x, h.y, h.house, h.roof, true, h.occupied);
  if (i < houses.length - 1) {
    drawIsoTree(h.x + 40, h.y + 70);
  }
});

// DRAW PARKED CARS ALONG CURB
drawIsoCar(40, 480, '#f97316', true); // Delivery Truck
drawIsoCar(110, 520, '#f8fafc');      // White Pickup
drawIsoCar(160, 545, '#a855f7');      // Purple Sedan
drawIsoCar(210, 570, '#0284c7');      // Blue Sedan
drawIsoCar(270, 600, '#dc2626');      // Red Sedan

// 3. TOP-RIGHT FLOATING DASHBOARD CARD
const hudX = width - 210;
const hudY = 20;
const hudW = 190;
const hudH = 195;

// Outer Card Glow & Container
ctx.fillStyle = 'rgba(16, 42, 69, 0.94)';
ctx.strokeStyle = '#1e4976';
ctx.lineWidth = 1.5;

function drawRoundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

drawRoundedRect(hudX, hudY, hudW, hudH, 14);
ctx.fill();
ctx.stroke();

// Section 1: Curb Header & 35% Badge
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 15px "Open Sans", sans-serif';
ctx.textAlign = 'left';
ctx.fillText('Curb', hudX + 16, hudY + 24);

// 35% Green Pill
const curbPillW = 46;
const curbPillH = 20;
const curbPillX = hudX + hudW - curbPillW - 14;
const curbPillY = hudY + 14;
ctx.fillStyle = '#064e3b';
ctx.strokeStyle = '#10b981';
ctx.lineWidth = 1;
drawRoundedRect(curbPillX, curbPillY, curbPillW, curbPillH, 6);
ctx.fill();
ctx.stroke();
ctx.fillStyle = '#34d399';
ctx.font = 'bold 11px "Open Sans", sans-serif';
ctx.textAlign = 'center';
ctx.fillText('35%', curbPillX + curbPillW / 2, curbPillY + 14);

// Speedometer Gauge Arc
const gaugeCx = hudX + hudW / 2;
const gaugeCy = hudY + 84;
const gaugeR = 40;

// Gradient Arc
const arcGrad = ctx.createLinearGradient(gaugeCx - gaugeR, gaugeCy, gaugeCx + gaugeR, gaugeCy);
arcGrad.addColorStop(0, '#10b981');
arcGrad.addColorStop(0.5, '#f59e0b');
arcGrad.addColorStop(1, '#ef4444');

ctx.strokeStyle = arcGrad;
ctx.lineWidth = 6;
ctx.lineCap = 'round';
ctx.beginPath();
ctx.arc(gaugeCx, gaugeCy, gaugeR, Math.PI, 0, false);
ctx.stroke();

// 100% label at top
ctx.fillStyle = '#94a3b8';
ctx.font = 'bold 9px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('100%', gaugeCx, gaugeCy - gaugeR - 6);

// Needle at 35% (angle roughly 145 deg from center)
const needleAngle = Math.PI - 0.35 * Math.PI;
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.moveTo(gaugeCx, gaugeCy);
ctx.lineTo(gaugeCx + Math.cos(needleAngle) * (gaugeR - 8), gaugeCy - Math.sin(needleAngle) * (gaugeR - 8));
ctx.stroke();

// Needle center pin
ctx.fillStyle = '#f59e0b';
ctx.beginPath();
ctx.arc(gaugeCx, gaugeCy, 4, 0, Math.PI * 2);
ctx.fill();

// "6/16 Cars" Text
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 13px "Open Sans", sans-serif';
ctx.textAlign = 'center';
ctx.fillText('6/16 Cars', gaugeCx, gaugeCy + 18);

// "● Open" Status
ctx.fillStyle = '#34d399';
ctx.beginPath();
ctx.arc(gaugeCx - 22, gaugeCy + 32, 3.5, 0, Math.PI * 2);
ctx.fill();
ctx.font = 'bold 11px "Open Sans", sans-serif';
ctx.textAlign = 'left';
ctx.fillText('Open', gaugeCx - 14, gaugeCy + 35);

// Divider line in card
ctx.strokeStyle = '#1e3a5f';
ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(hudX + 10, hudY + 130);
ctx.lineTo(hudX + hudW - 10, hudY + 130);
ctx.stroke();

// Section 2: Garage Use 50%
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 13px "Open Sans", sans-serif';
ctx.textAlign = 'left';
ctx.fillText('Garage Use', hudX + 16, hudY + 152);

ctx.fillStyle = '#34d399';
ctx.font = 'bold 11px "Open Sans", sans-serif';
ctx.textAlign = 'right';
ctx.fillText('50%', hudX + hudW - 16, hudY + 152);

// 6/12 Pill & 6 Vacant
const gPillW = 42;
const gPillH = 18;
const gPillX = hudX + 16;
const gPillY = hudY + 164;
ctx.fillStyle = '#059669';
ctx.strokeStyle = '#34d399';
ctx.lineWidth = 1;
drawRoundedRect(gPillX, gPillY, gPillW, gPillH, 5);
ctx.fill();
ctx.stroke();
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 10.5px "Open Sans", sans-serif';
ctx.textAlign = 'center';
ctx.fillText('6/12', gPillX + gPillW / 2, gPillY + 12.5);

ctx.fillStyle = '#cbd5e1';
ctx.font = 'bold 11px "Open Sans", sans-serif';
ctx.textAlign = 'right';
ctx.fillText('6 Vacant', hudX + hudW - 16, gPillY + 13);

ctx.restore();

// 4. WRITE FINAL HIGH-RES IMAGE FILES
const outJpgPath = path.join(__dirname, '../public/CurbsideCompass_Social_Media_IMG.jpg');
const outPngPath = path.join(__dirname, '../public/Curbside_Compass_fb.png');
const outSrcPath = path.join(__dirname, '../src/assets/images/CurbsideCompass_Social_Media_IMG.jpg');

const jpegBuffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
const pngBuffer = canvas.toBuffer('image/png');

fs.writeFileSync(outJpgPath, jpegBuffer);
fs.writeFileSync(outPngPath, pngBuffer);
fs.writeFileSync(outSrcPath, jpegBuffer);

console.log('Successfully generated clean vector raster images:');
console.log('1. ', outJpgPath, fs.statSync(outJpgPath).size, 'bytes');
console.log('2. ', outPngPath, fs.statSync(outPngPath).size, 'bytes');
console.log('3. ', outSrcPath, fs.statSync(outSrcPath).size, 'bytes');
