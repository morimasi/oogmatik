import type { AdOutput, AdScene } from '../types/adStudio';

interface VideoOptions {
  format: '9:16' | '16:9';
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function svgToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
    img.onerror = () => { reject(new Error('SVG render failed')); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

function loadSceneImage(visual: string): Promise<HTMLImageElement> {
  if (visual.startsWith('<svg')) return svgToImage(visual);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    if (!visual.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.src = visual;
  });
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  maxWidth: number, lineHeight: number,
  align: CanvasTextAlign = 'center',
): number {
  if (!text) return y;
  const words = text.split(' ');
  let line = '';
  let ly = y;
  ctx.textAlign = align;
  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, ly);
      line = word;
      ly += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, ly);
  return ly;
}

function getLineCount(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): number {
  if (!text) return 1;
  const words = text.split(' ');
  let line = '';
  let count = 1;
  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      line = word;
      count++;
    } else {
      line = testLine;
    }
  }
  return count;
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, accentRgb: string) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0f0a2e');
  grad.addColorStop(0.4, `rgba(${accentRgb},0.12)`);
  grad.addColorStop(1, '#0a0520');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawSceneImage(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  img: HTMLImageElement,
  t: number,
) {
  const eased = easeInOutCubic(Math.min(1, Math.max(0, t)));
  const zoom = 1.15 - 0.12 * eased;
  const panX = (eased - 0.5) * w * 0.03;
  const panY = (eased - 0.5) * h * 0.015;
  const iw = img.naturalWidth || 400;
  const ih = img.naturalHeight || 300;
  const scale = Math.max(w / iw, h / ih) * zoom;
  ctx.drawImage(img, (w - iw * scale) / 2 + panX, (h - ih * scale) / 2 + panY, iw * scale, ih * scale);
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createRadialGradient(w / 2, h * 0.5, h * 0.25, w / 2, h * 0.5, h * 0.85);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawTextOverlay(ctx: CanvasRenderingContext2D, w: number, h: number, scene: AdScene) {
  const accentRgb = scene.sceneNo % 2 === 0 ? '124,58,237' : '99,102,241';

  const badgeText = `${scene.sceneNo}`;
  ctx.font = `700 ${w * 0.016}px Lexend, sans-serif`;
  const badgeMetrics = ctx.measureText(badgeText);
  const pad = w * 0.02;
  const badgeW = badgeMetrics.width + pad * 2.8;
  const badgeH = w * 0.044;
  const badgeX = w * 0.05;
  const badgeY = h * 0.05;

  const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY);
  badgeGrad.addColorStop(0, `rgba(${accentRgb},0.35)`);
  badgeGrad.addColorStop(1, `rgba(${accentRgb},0.08)`);
  ctx.fillStyle = badgeGrad;
  fillRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);

  ctx.strokeStyle = `rgba(${accentRgb},0.2)`;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(badgeX + badgeH / 2, badgeY);
  ctx.lineTo(badgeX + badgeW - badgeH / 2, badgeY);
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + badgeH / 2);
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - badgeH / 2, badgeY + badgeH);
  ctx.lineTo(badgeX + badgeH / 2, badgeY + badgeH);
  ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH / 2);
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + badgeH / 2, badgeY);
  ctx.stroke();

  ctx.fillStyle = `rgba(${accentRgb},0.95)`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, badgeX + pad, badgeY + badgeH / 2);

  ctx.font = `400 ${w * 0.01}px Lexend, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`${scene.duration}s`, w * 0.95, h * 0.055);

  const titleText = scene.textOverlay || scene.visualDesc;
  const titleFs = w * 0.034;
  ctx.font = `700 ${titleFs}px Lexend, sans-serif`;
  const lineH = titleFs * 1.5;
  const maxTitleW = w * 0.78;
  const titleCount = getLineCount(ctx, titleText, maxTitleW);
  const titleBlockH = titleCount * lineH + w * 0.03;

  const titleX = w * 0.5;
  const titleBarTop = h * 0.58;
  const titleTextY = titleBarTop + w * 0.018;

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  fillRoundRect(ctx, w * 0.08, titleBarTop, w * 0.84, titleBlockH, w * 0.012);

  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = w * 0.012;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  wrapText(ctx, titleText, titleX, titleTextY, maxTitleW, lineH, 'center');
  ctx.shadowBlur = 0;

  if (scene.voiceover) {
    const subFs = w * 0.02;
    ctx.font = `400 ${subFs}px Lexend, sans-serif`;

    const subText = scene.voiceover;
    const subMaxW = w * 0.7;
    const subCount = getLineCount(ctx, subText, subMaxW);
    const subBlockH = subCount * subFs * 1.5 + w * 0.02;
    const subBarTop = h * 0.80;
    const subTextY = subBarTop + w * 0.012;

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    fillRoundRect(ctx, w * 0.15, subBarTop, w * 0.7, subBlockH, w * 0.01);

    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = w * 0.006;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.textBaseline = 'top';
    wrapText(ctx, subText, w * 0.5, subTextY, subMaxW, subFs * 1.5, 'center');
    ctx.shadowBlur = 0;
  }
}

function drawProgressBar(ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) {
  const barW = w * 0.7;
  const barH = 2;
  const barX = (w - barW) / 2;
  const barY = h - 50;

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  fillRoundRect(ctx, barX, barY, barW, barH, barH / 2);

  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, 'rgba(124,58,237,0.7)');
  grad.addColorStop(0.5, 'rgba(99,102,241,0.7)');
  grad.addColorStop(1, 'rgba(139,92,246,0.7)');
  ctx.fillStyle = grad;
  fillRoundRect(ctx, barX, barY, barW * Math.min(1, Math.max(0, progress)), barH, barH / 2);
}

function drawBottomOverlay(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, h * 0.6, 0, h);
  grad.addColorStop(0, 'rgba(15,10,46,0)');
  grad.addColorStop(1, 'rgba(15,10,46,0.85)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);
}

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.font = `500 ${w * 0.011}px Lexend, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('bdmind', w * 0.96, h * 0.96);
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  scene: AdScene,
  img: HTMLImageElement | null,
  prevImg: HTMLImageElement | null,
  t: number,
  sceneIdx: number,
  progress: number,
) {
  ctx.clearRect(0, 0, w, h);

  const accentRgb = scene.sceneNo % 2 === 0 ? '124,58,237' : '99,102,241';
  const easedT = easeInOutCubic(Math.min(1, Math.max(0, t)));
  const crossfadeDuration = 0.2;

  drawBackground(ctx, w, h, accentRgb);

  if (img && prevImg && sceneIdx > 0 && t < crossfadeDuration) {
    const fadeT = easeInOutCubic(t / crossfadeDuration);
    ctx.globalAlpha = 1 - fadeT / 2;
    drawSceneImage(ctx, w, h, prevImg, 0.85);
    ctx.globalAlpha = fadeT;
    drawSceneImage(ctx, w, h, img, t);
    ctx.globalAlpha = 1;
  } else if (img) {
    ctx.globalAlpha = 0.7;
    drawSceneImage(ctx, w, h, img, easedT);
    ctx.globalAlpha = 1;
  } else if (prevImg && sceneIdx > 0 && t < crossfadeDuration) {
    drawSceneImage(ctx, w, h, prevImg, 0.85);
  }

  drawVignette(ctx, w, h);
  drawBottomOverlay(ctx, w, h);
  drawTextOverlay(ctx, w, h, scene);
  drawProgressBar(ctx, w, h, progress);
  drawWatermark(ctx, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, 1, w - 2, h - 2);
}

async function loadLexendFont(): Promise<void> {
  if (typeof document === 'undefined') return;
  try {
    await Promise.all([
      document.fonts.load('700 16px Lexend'),
      document.fonts.load('500 16px Lexend'),
      document.fonts.load('400 16px Lexend'),
    ]);
  } catch {
    // Font not critical, fallback used
  }
}

export async function generateVideo(
  output: AdOutput,
  options: VideoOptions,
): Promise<{ webm: Blob; durationMs: number }> {
  if (!output.scenes.length) {
    throw new Error('Video olusturmak icin en az bir sahne gerekli');
  }

  await loadLexendFont();

  const { width, height } = options.format === '9:16'
    ? { width: 1080, height: 1920 }
    : { width: 1920, height: 1080 };

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context olusturulamadi');

  const sceneImages: (HTMLImageElement | null)[] = await Promise.all(
    output.scenes.map(async (scene) => {
      if (!scene.sceneVisual) return null;
      try { return await loadSceneImage(scene.sceneVisual); }
      catch { return null; }
    }),
  );

  const fps = 30;
  const totalFrames = output.scenes.reduce((sum, s) => sum + s.duration, 0) * fps;
  const durationMs = (totalFrames / fps) * 1000;

  const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  let mimeType = '';
  for (const mt of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mt)) { mimeType = mt; break; }
  }
  if (!mimeType) throw new Error('Bu tarayici video kaydini desteklemiyor.');

  const stream = canvas.captureStream(fps);
  if (!stream) throw new Error('Canvas stream olusturulamadi');
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

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

    const timeoutMs = Math.max(30000, durationMs * 2);
    const timeoutId = setTimeout(() => {
      recorder.stop();
      reject(new Error('Video olusturma zaman asimi'));
    }, timeoutMs);

    recorder.start();

    recorder.onstop = () => {
      clearTimeout(timeoutId);
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve({ webm: blob, durationMs });
    };
    recorder.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Video kaydi basarisiz'));
    };

    function render(now: number) {
      if (options.signal?.aborted) {
        recorder.stop();
        reject(new Error('Video olusturma iptal edildi'));
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
        const prevImg = sceneIdx > 0 ? sceneImages[sceneIdx - 1] : null;
        const sceneStart = sceneFrameMap[sceneIdx].start;
        const localFrame = expectedFrame - sceneStart;
        const totalSceneFrames = scene.duration * fps;
        const t = totalSceneFrames > 0 ? localFrame / totalSceneFrames : 0;
        const progress = expectedFrame / totalFrames;

        renderFrame(ctx, width, height, scene, img, prevImg, t, sceneIdx, progress);

        const pct = Math.round((expectedFrame + 1) / totalFrames * 100);
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
