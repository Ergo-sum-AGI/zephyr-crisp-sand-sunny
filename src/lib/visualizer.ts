export type VizFrame = {
  frequency: Uint8Array;
  waveform: Uint8Array;
  time: number;
  duration: number;
};

const RING_COUNT = 16;
const POINTS = 280;

function bandEnergy(frequency: Uint8Array, start: number, end: number): number {
  const a = Math.max(0, Math.floor(start));
  const b = Math.min(frequency.length, Math.ceil(end));
  if (b <= a) return 0;
  let sum = 0;
  for (let i = a; i < b; i++) sum += frequency[i] ?? 0;
  return sum / (b - a) / 255;
}

function idleFrame(t: number): VizFrame {
  const frequency = new Uint8Array(1024);
  const waveform = new Uint8Array(2048);
  for (let i = 0; i < frequency.length; i++) {
    const x = i / frequency.length;
    const v =
      70 +
      48 * Math.sin(t * 0.8 + x * 9) +
      28 * Math.sin(t * 1.6 + x * 22) +
      16 * Math.sin(t * 0.3 + x * 4);
    frequency[i] = Math.max(0, Math.min(255, v));
  }
  for (let i = 0; i < waveform.length; i++) {
    const x = i / waveform.length;
    const s =
      0.32 * Math.sin(t * 1.2 + x * Math.PI * 10) +
      0.18 * Math.sin(t * 2.6 + x * Math.PI * 22) +
      0.08 * Math.sin(t * 0.7 + x * Math.PI * 4);
    waveform[i] = Math.max(0, Math.min(255, Math.round((s + 1) * 128)));
  }
  return { frequency, waveform, time: t, duration: 1 };
}

function sampleWave(wave: Uint8Array, p: number): number {
  const pos = p * wave.length;
  const i0 = Math.floor(pos) % wave.length;
  const i1 = (i0 + 1) % wave.length;
  const f = pos - Math.floor(pos);
  const a = ((wave[i0] ?? 128) - 128) / 128;
  const b = ((wave[i1] ?? 128) - 128) / 128;
  return a + (b - a) * f;
}

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function drawHalo(ctx: Ctx, width: number, height: number, frame: VizFrame | null, clock: number) {
  const data = frame ?? idleFrame(clock);
  const cx = width / 2;
  const cy = height / 2;
  const minDim = Math.min(width, height);
  const freq = data.frequency;
  const wave = data.waveform;
  const bins = Math.max(1, freq.length);

  const bass = bandEnergy(freq, 0, bins * 0.08);
  const mid = bandEnergy(freq, bins * 0.08, bins * 0.35);
  const treble = bandEnergy(freq, bins * 0.35, bins * 0.9);

  ctx.fillStyle = "#050508";
  ctx.fillRect(0, 0, width, height);

  const wash = ctx.createRadialGradient(cx, cy, minDim * 0.03, cx, cy, minDim * 0.64);
  wash.addColorStop(0, `hsla(${(clock * 14 + 32) % 360}, 78%, 22%, ${0.28 + bass * 0.42})`);
  wash.addColorStop(0.42, `hsla(${(clock * 9 + 196) % 360}, 62%, 14%, 0.22)`);
  wash.addColorStop(1, "rgba(5,5,8,0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const inner = minDim * 0.065;
  const outer = minDim * 0.455;

  for (let r = RING_COUNT - 1; r >= 0; r--) {
    const u = r / (RING_COUNT - 1);
    const logStart = bins * (0.015 + u * u * 0.72);
    const logEnd = bins * Math.min(0.98, 0.045 + (u + 1 / RING_COUNT) ** 2 * 0.88);
    const energy = Math.min(1, bandEnergy(freq, logStart, logEnd) * 1.45);
    const baseR = inner + u * (outer - inner);
    const radius = baseR + energy * minDim * 0.055 + bass * minDim * 0.012 * (1 - u);
    const waveAmp = minDim * (0.02 + energy * 0.06 + treble * 0.012) * (0.65 + u * 0.85);
    const hue = (clock * 18 + r * 19 + energy * 50 + bass * 20) % 360;
    const alpha = 0.22 + energy * 0.58 + mid * 0.08;
    const line = 1.15 + energy * 3.1 + (r < 3 ? bass * 2.4 : 0);

    ctx.beginPath();
    for (let i = 0; i <= POINTS; i++) {
      const p = i / POINTS;
      const theta = p * Math.PI * 2 - Math.PI / 2;
      const w = sampleWave(wave, p);
      const wobble = w * waveAmp + 0.35 * sampleWave(wave, (p * 2) % 1) * waveAmp * treble;
      const rr = radius + wobble;
      const x = cx + Math.cos(theta) * rr;
      const y = cy + Math.sin(theta) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = `hsla(${hue}, 86%, ${56 + energy * 16}%, ${alpha})`;
    ctx.lineWidth = line;
    ctx.stroke();
  }

  const orbR = minDim * (0.048 + bass * 0.09 + mid * 0.02);
  const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR * 2.6);
  orb.addColorStop(0, `hsla(${(clock * 20 + 48) % 360}, 92%, 80%, ${0.62 + bass * 0.38})`);
  orb.addColorStop(0.32, `hsla(${(clock * 16 + 18) % 360}, 88%, 60%, ${0.32 + bass * 0.32})`);
  orb.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(cx, cy, orbR * 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  const vignette = ctx.createRadialGradient(cx, cy, minDim * 0.3, cx, cy, minDim * 0.6);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(5,5,8,0.5)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}
