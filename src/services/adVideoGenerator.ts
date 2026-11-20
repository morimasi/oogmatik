/**
 * Prof. Dr. Görkem Çetin (Ordinaryüs Baş Grafiker & Vektörel Görsel Mimarı)
 * & Prof. Dr. Arda Yılmaz (Ordinaryüs AGI & Polyglot Coder)
 *
 * bdmind Ultra-HD Motion Graphic Reklam Video Motoru v3.0
 *
 * Yenilikler & Düzeltmeler:
 * 1. Saf Vektör Rasterizasyonu: SVG'ler 1200x900 Ultra-HD çözünürlükte rasterize edilir (Pikselleşme %100 sıfırlandı).
 * 2. Akıllı Vitrin Kartı (Showcase Card): Görseller ekrana 7x gerilerek bozulmaz; 
 *    Apple/Canva standartlarında orantılı, gölgeli ve cam çerçeveli bir vitrin kartında sunulur.
 * 3. Hiyerarşik ve Temiz Tipografi: Kamera talimatı yerine vurucu kanca başlıkları,
 *    ayrı seslendirme alt yazı paneli ve gradient CTA butonu ile görsel karmaşa yok edildi.
 * 4. Hem 9:16 (Dikey Reels/TikTok) hem 16:9 (Yatay YouTube/Web) için mükemmel kompozisyon.
 */

import type { AdOutput, AdScene } from '../types/adStudio';

interface VideoOptions {
  format: '9:16' | '16:9';
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
}

/** AdScene + runtime-yüklü screenshot image (sadece generateVideo içinde kullanılır) */
interface AdSceneWithImg extends AdScene {
  _screenshotImg?: HTMLImageElement;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * SVG'yi küçük önizleme yerine 1200x900 Ultra-HD vektörel keskinlikte Image nesnesine dönüştürür.
 */
function svgToImage(svg: string, targetW = 1200, targetH = 900): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let cleanSvg = svg.trim();
    const start = cleanSvg.indexOf('<svg');
    if (start !== -1) cleanSvg = cleanSvg.slice(start);
    const end = cleanSvg.lastIndexOf('</svg>');
    if (end !== -1) cleanSvg = cleanSvg.slice(0, end + 6);

    // Vektörel netlik için yüksek çözünürlük niteliklerini enjekte et
    if (/width=/.test(cleanSvg)) {
      cleanSvg = cleanSvg.replace(/width=["'][^"']*["']/, `width="${targetW}"`);
    } else {
      cleanSvg = cleanSvg.replace('<svg', `<svg width="${targetW}"`);
    }
    if (/height=/.test(cleanSvg)) {
      cleanSvg = cleanSvg.replace(/height=["'][^"']*["']/, `height="${targetH}"`);
    } else {
      cleanSvg = cleanSvg.replace('<svg', `<svg height="${targetH}"`);
    }

    const img = new Image();
    const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error('SVG render failed'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function loadSceneImage(visual: string, targetW = 1200, targetH = 900): Promise<HTMLImageElement> {
  if (visual.startsWith('<svg') || visual.includes('<svg')) {
    return svgToImage(visual, targetW, targetH);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    if (!visual.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.src = visual;
  });
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// DEVICE MOCKUP & APP SCREEN ANIMATION SİSTEMİ
// Prof. Dr. Görkem Çetin — Ordinaryüs Baş Grafiker & Vektör Mimarı
// ---------------------------------------------------------------------------

type DeviceType = 'phone' | 'tablet' | 'desktop';
type DeviceAnimStyle = 'slide-up' | 'zoom-in' | 'rotate-reveal' | 'parallax' | 'float';
type ScreenTransitionStyle = 'swipe-left' | 'fade' | 'scale-up';

/**
 * Cihaz çerçevesi (mockup) + uygulama ekranı animasyonu.
 * Saf Canvas 2D — dış kütüphane yok, TypeScript strict.
 */
function drawDeviceMockup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  appScreenshot: HTMLImageElement,
  deviceType: DeviceType,
  t: number,
  animStyle: DeviceAnimStyle
): void {
  const eased = easeInOutCubic(Math.min(1, Math.max(0, t)));

  // ---- Animasyon Dönüşümü ----
  ctx.save();

  // Dönüşüm merkezini cihazın ortasına al
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.translate(cx, cy);

  switch (animStyle) {
    case 'slide-up': {
      // Aşağıdan yukarı kayarak girer (t=0 → h*1.5 offset, t=1 → 0)
      const slideOffset = (1 - eased) * h * 1.5;
      ctx.translate(0, slideOffset);
      break;
    }
    case 'zoom-in': {
      // 0.7x → 1.0x büyür
      const scale = 0.7 + 0.3 * eased;
      ctx.scale(scale, scale);
      break;
    }
    case 'rotate-reveal': {
      // -8° → 0°, opaklık 0 → 1
      const angle = (-8 * (1 - eased) * Math.PI) / 180;
      ctx.rotate(angle);
      ctx.globalAlpha = eased;
      break;
    }
    case 'parallax': {
      // Hafifçe yukarı aşağı float (sin bazlı sürekli)
      const floatY = Math.sin(t * Math.PI * 2) * 6;
      ctx.translate(0, floatY);
      break;
    }
    case 'float': {
      // sin(t*π*2)*8px yukarı aşağı
      const floatOffset = Math.sin(t * Math.PI * 2) * 8;
      ctx.translate(0, floatOffset);
      break;
    }
  }

  ctx.translate(-cx, -cy);

  // ---- Cihaz Gölgesi ----
  ctx.shadowColor = 'rgba(99,102,241,0.4)';
  ctx.shadowBlur = 30;

  // ---- Cihaza Göre Kenar Payı ----
  const isPhone = deviceType === 'phone';
  const isTablet = deviceType === 'tablet';
  // Desktop için daha az yuvarlaklık
  const outerRadius = isPhone ? 36 : isTablet ? 28 : 16;
  const borderW = 3;
  const gapW = 4; // inner gap
  const innerPad = borderW + gapW;

  // Dış çerçeve: koyu metalik
  ctx.fillStyle = '#1a1a2e';
  fillRoundRect(ctx, x, y, w, h, outerRadius);

  // Dış kenarlık
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#333355';
  ctx.lineWidth = borderW;
  strokeRoundRect(ctx, x, y, w, h, outerRadius);

  // ---- Ekran Klip Alanı ----
  const screenX = x + innerPad;
  const screenY = y + innerPad + (isPhone ? 20 : 0); // kamera alanı için üstten boşluk
  const screenW = w - innerPad * 2;
  const screenH = h - innerPad * 2 - (isPhone ? 50 : 0); // üst kamera + alt home bar

  // Ekran arka planı
  ctx.fillStyle = '#0a0a1a';
  fillRoundRect(ctx, screenX, screenY, screenW, screenH, outerRadius - innerPad);

  // Screenshot'ı contain mantığıyla çiz
  ctx.save();
  ctx.beginPath();
  const scrRadius = Math.max(0, outerRadius - innerPad);
  ctx.moveTo(screenX + scrRadius, screenY);
  ctx.lineTo(screenX + screenW - scrRadius, screenY);
  ctx.quadraticCurveTo(screenX + screenW, screenY, screenX + screenW, screenY + scrRadius);
  ctx.lineTo(screenX + screenW, screenY + screenH - scrRadius);
  ctx.quadraticCurveTo(screenX + screenW, screenY + screenH, screenX + screenW - scrRadius, screenY + screenH);
  ctx.lineTo(screenX + scrRadius, screenY + screenH);
  ctx.quadraticCurveTo(screenX, screenY + screenH, screenX, screenY + screenH - scrRadius);
  ctx.lineTo(screenX, screenY + scrRadius);
  ctx.quadraticCurveTo(screenX, screenY, screenX + scrRadius, screenY);
  ctx.closePath();
  ctx.clip();

  // Contain mantığıyla screenshot çiz
  const iw = appScreenshot.naturalWidth || screenW;
  const ih = appScreenshot.naturalHeight || screenH;
  const imgRatio = iw / ih;
  const scrRatio = screenW / screenH;

  let dw: number;
  let dh: number;
  if (imgRatio > scrRatio) {
    dw = screenW;
    dh = screenW / imgRatio;
  } else {
    dh = screenH;
    dw = screenH * imgRatio;
  }
  const dx = screenX + (screenW - dw) / 2;
  const dy = screenY + (screenH - dh) / 2;
  ctx.drawImage(appScreenshot, dx, dy, dw, dh);

  ctx.restore();

  // ---- Phone'a Özel: Kamera Noktası (Sol Üst) ----
  if (isPhone) {
    // Üst kamera notch alanı
    ctx.fillStyle = '#0d0d1f';
    ctx.fillRect(x + innerPad, y + innerPad, w - innerPad * 2, 20);

    // Kamera noktası
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + innerPad + 10, 6, 0, Math.PI * 2);
    ctx.fill();

    // Alt Home Bar
    const homeBarW = 40;
    const homeBarH = 4;
    const homeBarX = x + w / 2 - homeBarW / 2;
    const homeBarY = y + h - innerPad - homeBarH - 6;
    ctx.fillStyle = '#333333';
    fillRoundRect(ctx, homeBarX, homeBarY, homeBarW, homeBarH, homeBarH / 2);
  }

  ctx.restore();
}

/**
 * İki uygulama ekranı arasında geçiş animasyonu.
 */
function drawAppScreenTransition(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  img1: HTMLImageElement,
  img2: HTMLImageElement,
  t: number,
  transitionStyle: ScreenTransitionStyle
): void {
  const eased = easeInOutCubic(Math.min(1, Math.max(0, t)));

  ctx.save();

  // Klip bölgesi
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  switch (transitionStyle) {
    case 'swipe-left': {
      // img1 sola kayar, img2 sağdan girer
      const offset = eased * w;
      ctx.drawImage(img1, x - offset, y, w, h);
      ctx.drawImage(img2, x + (w - offset), y, w, h);
      break;
    }
    case 'fade': {
      // Crossfade
      ctx.drawImage(img1, x, y, w, h);
      ctx.globalAlpha = eased;
      ctx.drawImage(img2, x, y, w, h);
      ctx.globalAlpha = 1;
      break;
    }
    case 'scale-up': {
      // img1 küçülür (merkeze doğru), img2 büyüyerek gelir
      const scale1 = 1 - eased * 0.3;
      const scale2 = 0.7 + eased * 0.3;
      const cx = x + w / 2;
      const cy = y + h / 2;

      // img1 küçülür
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale1, scale1);
      ctx.globalAlpha = 1 - eased;
      ctx.drawImage(img1, -w / 2, -h / 2, w, h);
      ctx.restore();

      // img2 büyüyerek gelir
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale2, scale2);
      ctx.globalAlpha = eased;
      ctx.drawImage(img2, -w / 2, -h / 2, w, h);
      ctx.restore();

      ctx.globalAlpha = 1;
      break;
    }
  }

  ctx.restore();
}

/**
 * appScreenshot varsa HTMLImageElement yükler (base64 data URL)
 */
function loadBase64Image(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('appScreenshot yüklenemedi'));
    img.src = dataUrl;
  });
}

// ---------------------------------------------------------------------------

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 3
): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) break;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  } else if (lines.length === maxLines - 1 && currentLine) {
    lines.push(`${currentLine}...`);
  }

  return lines;
}

/**
 * Başlık ve kanca metnini temizler, gereksiz kamera direktiflerini ayıklar
 */
function cleanHeadline(scene: AdScene, adTitle: string): string {
  let raw = scene.textOverlay || '';
  if (!raw || raw.startsWith('Açılış:') || raw.startsWith('Görsel:') || raw.length > 90) {
    raw = adTitle.split('|')[0].trim();
  }
  return raw.replace(/^──\s*/, '').replace(/[#*_~`]/g, '').trim();
}

/**
 * Derin, lüks, Apple-EdTech stilinde dinamik ambient arka plan
 */
function drawAtmosphere(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  accentRgb: string,
  t: number
) {
  // 1. Ana arka plan gradyanı
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#070514');
  bgGrad.addColorStop(0.5, '#0c0822');
  bgGrad.addColorStop(1, '#05030f');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Yüzen renkli ambient küreler (Orbs)
  const pulse = Math.sin(t * Math.PI) * 0.15;

  // Üst Küre
  const orb1 = ctx.createRadialGradient(w * 0.3, h * 0.25, 20, w * 0.3, h * 0.25, w * 0.55);
  orb1.addColorStop(0, `rgba(${accentRgb},${0.25 + pulse})`);
  orb1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = orb1;
  ctx.fillRect(0, 0, w, h);

  // Alt Küre
  const orb2 = ctx.createRadialGradient(w * 0.75, h * 0.75, 40, w * 0.75, h * 0.75, w * 0.6);
  orb2.addColorStop(0, 'rgba(13,148,136,0.18)');
  orb2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = orb2;
  ctx.fillRect(0, 0, w, h);

  // 3. Çok ince mikro-grid çizgileri
  ctx.strokeStyle = 'rgba(255,255,255,0.015)';
  ctx.lineWidth = 1;
  const step = w * 0.08;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

/**
 * 9:16 Dikey Format (Reels, TikTok, Shorts) Kusursuz Çizimi
 */
function renderPortrait9x16(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  scene: AdSceneWithImg,
  img: HTMLImageElement | null,
  t: number,
  progress: number,
  adTitle: string,
  totalScenes: number,
  accentRgb: string
) {
  drawAtmosphere(ctx, w, h, accentRgb, t);

  // -------------------------------------------------------------
  // A. ÜST BAR: Marka Rozeti ve Sahne Göstergesi
  // -------------------------------------------------------------
  const topY = h * 0.055;
  const brandPillW = w * 0.44;
  const brandPillH = h * 0.032;
  const brandPillX = w * 0.06;

  // Rozet Arka Planı
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  fillRoundRect(ctx, brandPillX, topY, brandPillW, brandPillH, brandPillH / 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  strokeRoundRect(ctx, brandPillX, topY, brandPillW, brandPillH, brandPillH / 2);

  // Rozet İkonu ve Metni
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${w * 0.024}px Lexend, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('bdmind · Özel Eğitim AI', brandPillX + w * 0.03, topY + brandPillH / 2);

  // Sahne ve Süre Sayacı (Sağ Üst)
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = `600 ${w * 0.022}px Lexend, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`Sahne ${scene.sceneNo}/${totalScenes} · ${scene.duration}sn`, w * 0.94, topY + brandPillH / 2);

  // -------------------------------------------------------------
  // B. VİTRİN ALANI — appScreenshot varsa cihaz mockupu, yoksa klasik kart
  // -------------------------------------------------------------
  const cardX = w * 0.06;
  const cardY = h * 0.11;
  const cardW = w * 0.88;
  const cardH = h * 0.42;
  const cardRadius = 32;

  if (scene.appScreenshot && scene._screenshotImg) {
    // ---- Cihaz Mockup Modu ----
    // Telefon oranında mockup alanı: ortalanmış, biraz daha dar
    const mockW = cardW * 0.55;
    const mockH = cardH;
    const mockX = cardX + (cardW - mockW) / 2;
    drawDeviceMockup(
      ctx,
      mockX, cardY, mockW, mockH,
      scene._screenshotImg,
      scene.deviceType ?? 'phone',
      t,
      scene.deviceAnimStyle ?? 'slide-up'
    );
  } else {
    // ---- Klasik SVG Vitrin Kartı (Geriye Dönük Uyumluluk) ----

    // Kart Gölgesi
    ctx.shadowColor = `rgba(${accentRgb},0.35)`;
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#100c2a';
    fillRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.shadowBlur = 0;

    // Kartın İçini Kırp (Clip)
    ctx.save();
    ctx.beginPath();
    fillRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.clip();

    // Kart İçi Arka Planı
    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    cardGrad.addColorStop(0, '#150f38');
    cardGrad.addColorStop(1, '#0e0926');
    ctx.fillStyle = cardGrad;
    ctx.fillRect(cardX, cardY, cardW, cardH);

    // Görsel Çizimi (Yüksek Netlikte Orantılı Fit)
    if (img) {
      const eased = easeInOutCubic(Math.min(1, Math.max(0, t)));
      const zoom = 1.0 + 0.035 * eased;
      const iw = img.naturalWidth || 1200;
      const ih = img.naturalHeight || 900;
      const imgRatio = iw / ih;
      const cardRatio = cardW / cardH;

      let dw = cardW;
      let dh = cardH;

      if (imgRatio > cardRatio) {
        dw = cardW * zoom;
        dh = (cardW / imgRatio) * zoom;
      } else {
        dh = cardH * zoom;
        dw = (cardH * imgRatio) * zoom;
      }

      const dx = cardX + (cardW - dw) / 2;
      const dy = cardY + (cardH - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    ctx.restore();

    // Kart Kenarlığı
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;
    strokeRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);

    // Kart Üstü Mini Etiket (Sol Alt)
    const tagW = w * 0.32;
    const tagH = h * 0.024;
    const tagX = cardX + w * 0.03;
    const tagY = cardY + cardH - tagH - w * 0.03;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    fillRoundRect(ctx, tagX, tagY, tagW, tagH, 8);
    ctx.fillStyle = '#a5b4fc';
    ctx.font = `700 ${w * 0.018}px Lexend, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Sıfır Bilişsel Yük', tagX + tagW / 2, tagY + tagH / 2);
  }

  // -------------------------------------------------------------
  // C. KANCA BAŞLIĞI (Headline / Text Overlay) - Okunabilir, Büyük & Net
  // -------------------------------------------------------------
  const headline = cleanHeadline(scene, adTitle);
  const headlineY = h * 0.57;
  const headlineFs = w * 0.046; // ~50px
  ctx.font = `800 ${headlineFs}px Lexend, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const maxHeadlineW = w * 0.88;
  const headlineLines = wrapTextLines(ctx, headline, maxHeadlineW, 2);

  headlineLines.forEach((line, idx) => {
    // Hafif gölge ile mükemmel kontrast
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = idx === 0 ? '#ffffff' : '#e0e7ff';
    ctx.fillText(line, w * 0.5, headlineY + idx * headlineFs * 1.35);
    ctx.shadowBlur = 0;
  });

  // -------------------------------------------------------------
  // D. SESLENDİRME & ALT YAZI KARTI (Voiceover Caption Card)
  // -------------------------------------------------------------
  if (scene.voiceover) {
    const subY = h * 0.70;
    const subW = w * 0.88;
    const subX = w * 0.06;
    const subRadius = 24;
    const subFs = w * 0.026;
    ctx.font = `500 ${subFs}px Lexend, sans-serif`;

    const subLines = wrapTextLines(ctx, scene.voiceover, subW * 0.88, 3);
    const subH = Math.max(h * 0.12, subLines.length * subFs * 1.45 + h * 0.045);

    // Cam Efekti Kart
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    fillRoundRect(ctx, subX, subY, subW, subH, subRadius);
    ctx.strokeStyle = `rgba(${accentRgb},0.28)`;
    ctx.lineWidth = 1;
    strokeRoundRect(ctx, subX, subY, subW, subH, subRadius);

    // Mikrofon Başlığı
    ctx.fillStyle = '#818cf8';
    ctx.font = `700 ${w * 0.019}px Lexend, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('🎙️ SESLENDİRME', subX + w * 0.04, subY + h * 0.015);

    // Alt Yazı Metni
    ctx.fillStyle = '#f8fafc';
    ctx.font = `400 ${subFs}px Lexend, sans-serif`;
    subLines.forEach((sLine, sIdx) => {
      ctx.fillText(sLine, subX + w * 0.04, subY + h * 0.04 + sIdx * subFs * 1.4);
    });
  }

  // -------------------------------------------------------------
  // E. ÇAĞRI BUTONU (CTA Pill)
  // -------------------------------------------------------------
  const ctaY = h * 0.87;
  const ctaW = w * 0.88;
  const ctaH = h * 0.046;
  const ctaX = w * 0.06;

  const ctaGrad = ctx.createLinearGradient(ctaX, 0, ctaX + ctaW, 0);
  ctaGrad.addColorStop(0, '#4f46e5');
  ctaGrad.addColorStop(1, '#9333ea');
  ctx.fillStyle = ctaGrad;
  fillRoundRect(ctx, ctaX, ctaY, ctaW, ctaH, ctaH / 2);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${w * 0.026}px Lexend, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HEMEN KEŞFET ── bdmind.com', w * 0.5, ctaY + ctaH / 2);

  // -------------------------------------------------------------
  // F. ALT İLERLEME ÇUBUĞU (Progress Bar)
  // -------------------------------------------------------------
  const barY = h * 0.96;
  const barW = w * 0.88;
  const barH = 4;
  const barX = w * 0.06;

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  fillRoundRect(ctx, barX, barY, barW, barH, barH / 2);

  const progW = barW * Math.min(1, Math.max(0, progress));
  const progGrad = ctx.createLinearGradient(barX, 0, barX + progW, 0);
  progGrad.addColorStop(0, '#6366f1');
  progGrad.addColorStop(1, '#ec4899');
  ctx.fillStyle = progGrad;
  fillRoundRect(ctx, barX, barY, progW, barH, barH / 2);
}

/**
 * 16:9 Yatay Format (YouTube, Web, Sunum) Kusursuz Çizimi
 */
function renderLandscape16x9(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  scene: AdSceneWithImg,
  img: HTMLImageElement | null,
  t: number,
  progress: number,
  adTitle: string,
  totalScenes: number,
  accentRgb: string
) {
  drawAtmosphere(ctx, w, h, accentRgb, t);

  // Sol Kolon: Metinler, Sağ Kolon: Vitrin Kartı
  const colLeftX = w * 0.06;
  const colLeftW = w * 0.44;

  // 1. Üst Rozet
  const topY = h * 0.09;
  const pillH = h * 0.045;
  const pillW = colLeftW * 0.55;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  fillRoundRect(ctx, colLeftX, topY, pillW, pillH, pillH / 2);
  ctx.strokeStyle = `rgba(${accentRgb},0.3)`;
  ctx.lineWidth = 1;
  strokeRoundRect(ctx, colLeftX, topY, pillW, pillH, pillH / 2);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${w * 0.011}px Lexend, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`bdmind · Sahne ${scene.sceneNo}/${totalScenes}`, colLeftX + pillW / 2, topY + pillH / 2);

  // 2. Büyük Başlık
  const headline = cleanHeadline(scene, adTitle);
  const headlineY = h * 0.20;
  const headlineFs = w * 0.026; // ~50px
  ctx.font = `800 ${headlineFs}px Lexend, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const headlineLines = wrapTextLines(ctx, headline, colLeftW, 3);
  headlineLines.forEach((line, idx) => {
    ctx.fillStyle = idx === 0 ? '#ffffff' : '#cbd5e1';
    ctx.fillText(line, colLeftX, headlineY + idx * headlineFs * 1.35);
  });

  // 3. Seslendirme Alt Yazı Kartı (Sol Alt)
  if (scene.voiceover) {
    const subY = h * 0.50;
    const subRadius = 20;
    const subFs = w * 0.013;
    ctx.font = `500 ${subFs}px Lexend, sans-serif`;

    const subLines = wrapTextLines(ctx, scene.voiceover, colLeftW * 0.9, 3);
    const subH = Math.max(h * 0.16, subLines.length * subFs * 1.5 + h * 0.06);

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    fillRoundRect(ctx, colLeftX, subY, colLeftW, subH, subRadius);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    strokeRoundRect(ctx, colLeftX, subY, colLeftW, subH, subRadius);

    ctx.fillStyle = '#818cf8';
    ctx.font = `700 ${w * 0.009}px Lexend, sans-serif`;
    ctx.fillText('🎙️ SESLENDİRME & PEDAGOJİK VURGU', colLeftX + w * 0.02, subY + h * 0.025);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = `400 ${subFs}px Lexend, sans-serif`;
    subLines.forEach((sLine, sIdx) => {
      ctx.fillText(sLine, colLeftX + w * 0.02, subY + h * 0.055 + sIdx * subFs * 1.45);
    });
  }

  // 4. Eyleme Çağrı Butonu (CTA)
  const ctaY = h * 0.76;
  const ctaW = colLeftW * 0.7;
  const ctaH = h * 0.065;

  const ctaGrad = ctx.createLinearGradient(colLeftX, 0, colLeftX + ctaW, 0);
  ctaGrad.addColorStop(0, '#4f46e5');
  ctaGrad.addColorStop(1, '#9333ea');
  ctx.fillStyle = ctaGrad;
  fillRoundRect(ctx, colLeftX, ctaY, ctaW, ctaH, ctaH / 2);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${w * 0.012}px Lexend, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Ücretsiz Başla ── bdmind.com', colLeftX + ctaW / 2, ctaY + ctaH / 2);

  // 5. SAĞ KOLON: VİTRİN ALANI — appScreenshot varsa cihaz mockupu, yoksa klasik kart
  const cardX = w * 0.54;
  const cardY = h * 0.12;
  const cardW = w * 0.40;
  const cardH = h * 0.72;
  const cardRadius = 32;

  if (scene.appScreenshot && scene._screenshotImg) {
    // ---- Cihaz Mockup Modu ----
    // Telefon oranı için mockup alanı dikey bölgeye sığdırılır
    const mockW = cardW * 0.75;
    const mockH = cardH;
    const mockX = cardX + (cardW - mockW) / 2;
    drawDeviceMockup(
      ctx,
      mockX, cardY, mockW, mockH,
      scene._screenshotImg,
      scene.deviceType ?? 'phone',
      t,
      scene.deviceAnimStyle ?? 'slide-up'
    );
  } else {
    // ---- Klasik SVG Vitrin Kartı (Geriye Dönük Uyumluluk) ----
    ctx.shadowColor = `rgba(${accentRgb},0.4)`;
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#100c2a';
    fillRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.shadowBlur = 0;

    ctx.save();
    fillRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
    ctx.clip();

    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    cardGrad.addColorStop(0, '#150f38');
    cardGrad.addColorStop(1, '#0e0926');
    ctx.fillStyle = cardGrad;
    ctx.fillRect(cardX, cardY, cardW, cardH);

    if (img) {
      const eased = easeInOutCubic(Math.min(1, Math.max(0, t)));
      const zoom = 1.0 + 0.03 * eased;
      const iw = img.naturalWidth || 1200;
      const ih = img.naturalHeight || 900;
      const imgRatio = iw / ih;
      const cardRatio = cardW / cardH;

      let dw = cardW;
      let dh = cardH;

      if (imgRatio > cardRatio) {
        dw = cardW * zoom;
        dh = (cardW / imgRatio) * zoom;
      } else {
        dh = cardH * zoom;
        dw = (cardH * imgRatio) * zoom;
      }

      const dx = cardX + (cardW - dw) / 2;
      const dy = cardY + (cardH - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1.5;
    strokeRoundRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  }

  // 6. Alt İlerleme Çubuğu
  const barY = h * 0.94;
  const barW = w * 0.88;
  const barH = 5;
  const barX = w * 0.06;

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  fillRoundRect(ctx, barX, barY, barW, barH, barH / 2);

  const progW = barW * Math.min(1, Math.max(0, progress));
  const progGrad = ctx.createLinearGradient(barX, 0, barX + progW, 0);
  progGrad.addColorStop(0, '#6366f1');
  progGrad.addColorStop(1, '#ec4899');
  ctx.fillStyle = progGrad;
  fillRoundRect(ctx, barX, barY, progW, barH, barH / 2);
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  scene: AdSceneWithImg,
  img: HTMLImageElement | null,
  t: number,
  progress: number,
  adTitle: string,
  totalScenes: number,
  isPortrait: boolean
) {
  ctx.clearRect(0, 0, w, h);
  const accentRgb = scene.sceneNo % 2 === 0 ? '124,58,237' : '99,102,241';

  if (isPortrait) {
    renderPortrait9x16(ctx, w, h, scene, img, t, progress, adTitle, totalScenes, accentRgb);
  } else {
    renderLandscape16x9(ctx, w, h, scene, img, t, progress, adTitle, totalScenes, accentRgb);
  }
}

async function loadLexendFont(): Promise<void> {
  if (typeof document === 'undefined') return;
  try {
    await Promise.all([
      document.fonts.load('800 24px Lexend'),
      document.fonts.load('700 20px Lexend'),
      document.fonts.load('500 16px Lexend'),
      document.fonts.load('400 16px Lexend'),
    ]);
  } catch {
    // Font yüklenemezse canvas yerel fallback fontunu kullanır
  }
}

export async function generateVideo(
  output: AdOutput,
  options: VideoOptions,
): Promise<{ webm: Blob; durationMs: number }> {
  if (!output.scenes.length) {
    throw new Error('Video oluşturmak için en az bir sahne gerekli');
  }

  await loadLexendFont();

  const isPortrait = options.format === '9:16';
  const { width, height } = isPortrait
    ? { width: 1080, height: 1920 }
    : { width: 1920, height: 1080 };

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context olusturulamadi');

  // Her sahnenin görselini 1200x900 Ultra-HD vektörel kalitede önceden yükle
  const sceneImages: (HTMLImageElement | null)[] = await Promise.all(
    output.scenes.map(async (scene) => {
      if (!scene.sceneVisual) return null;
      try {
        return await loadSceneImage(scene.sceneVisual, 1200, 900);
      } catch {
        return null;
      }
    }),
  );

  const fps = 30;
  const totalFrames = output.scenes.reduce((sum, s) => sum + s.duration, 0) * fps;
  const durationMs = (totalFrames / fps) * 1000;

  const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  let mimeType = '';
  for (const mt of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mt)) {
      mimeType = mt;
      break;
    }
  }
  if (!mimeType) throw new Error('Bu tarayıcı video kaydını desteklemiyor.');

  const stream = canvas.captureStream(fps);
  if (!stream) throw new Error('Canvas stream oluşturulamadı');
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 }); // 8 Mbps Ultra-HD bitrate!
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = e => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const sceneFrameMap: { start: number; sceneIdx: number }[] = [];
  {
    let acc = 0;
    for (let i = 0; i < output.scenes.length; i++) {
      const sceneFrames = output.scenes[i].duration * fps;
      sceneFrameMap.push({ start: acc, sceneIdx: i });
      acc += sceneFrames;
    }
  }

  function getFrame(frameIndex: number) {
    for (let i = sceneFrameMap.length - 1; i >= 0; i--) {
      if (frameIndex >= sceneFrameMap[i].start) return sceneFrameMap[i];
    }
    return sceneFrameMap[0];
  }

  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    let lastRendered = -1;
    let lastProgressPct = -1;

    const timeoutMs = Math.max(35000, durationMs * 2);
    const timeoutId = setTimeout(() => {
      recorder.stop();
      reject(new Error('Video oluşturma zaman aşımı'));
    }, timeoutMs);

    recorder.start();

    recorder.onstop = () => {
      clearTimeout(timeoutId);
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve({ webm: blob, durationMs });
    };
    recorder.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Video kaydı başarısız'));
    };

    function render(now: number) {
      if (options.signal?.aborted) {
        recorder.stop();
        reject(new Error('Video oluşturma iptal edildi'));
        return;
      }

      const elapsed = now - startTime;
      const frameFloat = (elapsed / 1000) * fps;
      const expectedFrame = Math.floor(frameFloat);

      if (expectedFrame >= totalFrames) {
        options.onProgress?.(100);
        recorder.stop();
        return;
      }

      if (expectedFrame !== lastRendered) {
        lastRendered = expectedFrame;

        const { sceneIdx } = getFrame(expectedFrame);
        const scene = output.scenes[sceneIdx];
        const img = sceneImages[sceneIdx];
        const sceneStart = sceneFrameMap[sceneIdx].start;
        const localFrame = expectedFrame - sceneStart;
        const totalSceneFrames = scene.duration * fps;
        const t = totalSceneFrames > 0 ? localFrame / totalSceneFrames : 0;
        const progress = expectedFrame / totalFrames;

        renderFrame(
          ctx!,
          width,
          height,
          scene,
          img,
          t,
          progress,
          output.title,
          output.scenes.length,
          isPortrait
        );

        const pct = Math.round(((expectedFrame + 1) / totalFrames) * 100);
        if (pct !== lastProgressPct) {
          lastProgressPct = pct;
          options.onProgress?.(pct);
        }
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  });
}
