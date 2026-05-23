import type { AdOutput, AdScene } from '../types/adStudio';

interface VideoOptions {
  format: '9:16' | '16:9';
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
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

function drawRoundedRect(
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
}

function drawTransition(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  scene: AdScene, prevScene: AdScene | null,
  t: number
) {
  if (t < 0.05) {
    const fadeIn = t / 0.05;
    ctx.fillStyle = `rgba(0,0,0,${1 - fadeIn})`;
    ctx.fillRect(0, 0, w, h);
  } else if (prevScene && t < 0.15) {
    const wipe = (t - 0.05) / 0.1;
    const dir = scene.sceneNo % 2 === 0 ? 1 : -1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w * wipe * dir + (dir === 1 ? 0 : w * (1 - wipe)), h);
  }
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  scene: AdScene,
  img: HTMLImageElement | null,
  t: number,
  prevScene: AdScene | null,
) {
  ctx.clearRect(0, 0, w, h);

  const accentRgb = scene.sceneNo % 2 === 0 ? '124,58,237' : '99,102,241';

  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0f0a2e');
  bgGrad.addColorStop(0.5, `rgba(${accentRgb},0.15)`);
  bgGrad.addColorStop(1, '#0a0520');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  if (img) {
    const zoom = 1.1 - t * 0.15;
    const panX = (t - 0.5) * w * 0.04;
    const panY = (t - 0.5) * h * 0.02;
    const iw = img.naturalWidth || 400;
    const ih = img.naturalHeight || 300;
    const scale = Math.max(w / iw, h / ih) * zoom;
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (w - sw) / 2 + panX;
    const sy = (h - sh) / 2 + panY;
    ctx.globalAlpha = 0.6;
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.globalAlpha = 1;
  }

  const overlayGrad = ctx.createLinearGradient(0, h * 0.5, 0, h);
  overlayGrad.addColorStop(0, 'rgba(15,10,46,0)');
  overlayGrad.addColorStop(1, 'rgba(15,10,46,0.85)');
  ctx.fillStyle = overlayGrad;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);

  const sceneLabel = `SAHNE ${scene.sceneNo}`;
  ctx.font = `700 ${w * 0.014}px Lexend, sans-serif`;
  ctx.fillStyle = `rgba(${accentRgb},0.5)`;
  ctx.textAlign = 'left';
  ctx.fillText(sceneLabel, w * 0.05, h * 0.06);

  const durationLabel = `${scene.duration}s`;
  ctx.font = `400 ${w * 0.01}px Lexend, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.textAlign = 'right';
  ctx.fillText(durationLabel, w * 0.95, h * 0.06);

  ctx.font = `700 ${w * 0.032}px Lexend, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  wrapText(ctx, scene.textOverlay || scene.visualDesc, w * 0.5, h * 0.68, w * 0.8, w * 0.044);

  ctx.font = `400 ${w * 0.018}px Lexend, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'center';
  wrapText(ctx, scene.voiceover, w * 0.5, h * 0.85, w * 0.8, w * 0.026);

  const totalSec = Math.floor(t * scene.duration);
  ctx.font = `400 ${w * 0.008}px Lexend, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.textAlign = 'center';
  ctx.fillText(`${totalSec}s / ${scene.duration}s`, w * 0.5, h * 0.97);

  drawTransition(ctx, w, h, scene, prevScene, t);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  maxWidth: number, lineHeight: number
) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  let ly = y;
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
  ctx.fillText(line, x, ly);
}

async function loadLexendFont(): Promise<void> {
  if (typeof document === 'undefined') return;
  try {
    await document.fonts.load('700 16px Lexend');
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
  const ctx = canvas.getContext('2d')!;

  const sceneImages: (HTMLImageElement | null)[] = await Promise.all(
    output.scenes.map(async (scene) => {
      if (!scene.sceneVisual) return null;
      try { return await svgToImage(scene.sceneVisual); }
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
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  return new Promise((resolve, reject) => {
    let currentFrame = 0;
    const startTime = performance.now();

    recorder.start();

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve({ webm: blob, durationMs });
    };
    recorder.onerror = () => reject(new Error('Video kaydi basarisiz'));

    function render() {
      if (options.signal?.aborted) {
        recorder.stop();
        reject(new Error('Video olusturma iptal edildi'));
        return;
      }
      if (currentFrame >= totalFrames) {
        recorder.stop();
        return;
      }

      let frameAccum = 0;
      let sceneIdx = 0;
      let localFrame = 0;
      for (let i = 0; i < output.scenes.length; i++) {
        const sceneFrames = output.scenes[i].duration * fps;
        if (currentFrame < frameAccum + sceneFrames) {
          sceneIdx = i;
          localFrame = currentFrame - frameAccum;
          break;
        }
        frameAccum += sceneFrames;
      }

      const scene = output.scenes[sceneIdx];
      const img = sceneImages[sceneIdx];
      const totalSceneFrames = scene.duration * fps;
      const t = totalSceneFrames > 0 ? localFrame / totalSceneFrames : 0;
      const prevScene = sceneIdx > 0 ? output.scenes[sceneIdx - 1] : null;

      renderFrame(ctx, width, height, scene, img, t, prevScene);
      currentFrame++;

      const pct = Math.min(99, Math.round((currentFrame / totalFrames) * 100));
      if (currentFrame % fps === 0) options.onProgress?.(pct);

      const elapsed = performance.now() - startTime;
      const expected = (currentFrame / fps) * 1000;
      setTimeout(render, Math.max(0, expected - elapsed));
    }

    render();
  });
}
