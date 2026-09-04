export const FFT_SIZE = 2048;

export function makeHannWindow(n: number): Float32Array {
  const w = new Float32Array(n);
  const last = n - 1 || 1;
  for (let i = 0; i < n; i++) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / last));
  }
  return w;
}

function fftInPlace(real: Float32Array, imag: Float32Array) {
  const n = real.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = real[i]!;
      real[i] = real[j]!;
      real[j] = tr;
      const ti = imag[i]!;
      imag[i] = imag[j]!;
      imag[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wlenRe = Math.cos(ang);
    const wlenIm = Math.sin(ang);
    const half = len >> 1;
    for (let i = 0; i < n; i += len) {
      let wRe = 1;
      let wIm = 0;
      for (let j = 0; j < half; j++) {
        const ur = real[i + j]!;
        const ui = imag[i + j]!;
        const vr0 = real[i + j + half]!;
        const vi0 = imag[i + j + half]!;
        const vr = vr0 * wRe - vi0 * wIm;
        const vi = vr0 * wIm + vi0 * wRe;
        real[i + j] = ur + vr;
        imag[i + j] = ui + vi;
        real[i + j + half] = ur - vr;
        imag[i + j + half] = ui - vi;
        const nwRe = wRe * wlenRe - wIm * wlenIm;
        wIm = wRe * wlenIm + wIm * wlenRe;
        wRe = nwRe;
      }
    }
  }
}

export type Spectrum = {
  frequency: Uint8Array;
  waveform: Uint8Array;
};

export function analyzeWindow(
  channel: Float32Array,
  sampleIndex: number,
  fftSize: number,
  window: Float32Array,
  real: Float32Array,
  imag: Float32Array,
): Spectrum {
  const start = Math.max(0, Math.min(channel.length, sampleIndex) - (fftSize >> 1));
  const waveform = new Uint8Array(fftSize);
  imag.fill(0);
  for (let i = 0; i < fftSize; i++) {
    const idx = start + i;
    const s = idx < channel.length ? (channel[idx] ?? 0) : 0;
    real[i] = s * (window[i] ?? 1);
    waveform[i] = Math.max(0, Math.min(255, Math.round((s + 1) * 128)));
  }
  fftInPlace(real, imag);

  const bins = fftSize >> 1;
  const frequency = new Uint8Array(bins);
  const minDb = -100;
  const maxDb = -30;
  const invN = 1 / fftSize;
  for (let i = 0; i < bins; i++) {
    const mag = Math.hypot(real[i] ?? 0, imag[i] ?? 0) * invN;
    const db = mag > 1e-12 ? 20 * Math.log10(mag) : minDb;
    const norm = (db - minDb) / (maxDb - minDb);
    frequency[i] = Math.max(0, Math.min(255, Math.round(norm * 255)));
  }
  return { frequency, waveform };
}

export function smoothBytes(
  current: Uint8Array,
  previous: Float32Array,
  amount: number,
): Uint8Array {
  const out = new Uint8Array(current.length);
  const n = Math.min(current.length, previous.length);
  for (let i = 0; i < n; i++) {
    const next = current[i] ?? 0;
    const mixed = (previous[i] ?? 0) * amount + next * (1 - amount);
    previous[i] = mixed;
    out[i] = Math.max(0, Math.min(255, Math.round(mixed)));
  }
  return out;
}
