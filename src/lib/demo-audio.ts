/** A short, punchy pulse so the rings move without needing a file. */
export function createDemoBuffer(sampleRate = 44100): AudioBuffer {
  const duration = 8;
  const length = Math.floor(sampleRate * duration);
  const L = new Float32Array(length);
  const R = new Float32Array(length);

  const twoPi = Math.PI * 2;
  const notes = [261.63, 311.13, 392.0, 466.16, 523.25, 392.0, 311.13, 261.63];

  const add = (buf: Float32Array, i: number, v: number) => {
    if (i >= 0 && i < buf.length) buf[i] = (buf[i] ?? 0) + v;
  };

  const kickTimes: number[] = [];
  for (let t = 0; t < duration; t += 0.5) kickTimes.push(t);

  for (const t0 of kickTimes) {
    const n = Math.floor(sampleRate * 0.2);
    const i0 = Math.floor(t0 * sampleRate);
    for (let i = 0; i < n; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * 26);
      const freq = 150 * Math.exp(-t * 16) + 38;
      const s = Math.sin(twoPi * freq * t) * env * 1.15;
      add(L, i0 + i, s);
      add(R, i0 + i, s * 0.96);
    }
  }

  for (let t0 = 0.25; t0 < duration; t0 += 0.5) {
    const n = Math.floor(sampleRate * 0.08);
    const i0 = Math.floor(t0 * sampleRate);
    for (let i = 0; i < n; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t * 48);
      const noise = (Math.random() * 2 - 1) * env * 0.22;
      add(L, i0 + i, noise);
      add(R, i0 + i, noise * 0.85);
    }
  }

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const bar = Math.floor(t / 2) % 2;
    const bassHz = bar === 0 ? 55 : 65.41;
    const env = 0.18 + 0.08 * Math.sin(twoPi * 2 * t);
    const s = Math.sin(twoPi * bassHz * t) * env;
    add(L, i, s);
    add(R, i, s * 0.92);
  }

  const step = 0.25;
  for (let stepI = 0; stepI * step < duration; stepI++) {
    const t0 = stepI * step;
    const hz = notes[stepI % notes.length]!;
    const n = Math.floor(sampleRate * 0.22);
    const i0 = Math.floor(t0 * sampleRate);
    for (let i = 0; i < n; i++) {
      const t = i / sampleRate;
      const env = Math.sin((Math.PI * i) / n) * 0.22;
      const s =
        Math.sin(twoPi * hz * t) * env +
        Math.sin(twoPi * hz * 2 * t) * env * 0.4;
      const pan = (stepI % 2 === 0 ? 1 : -1) * 0.18;
      add(L, i0 + i, s * (1 - pan));
      add(R, i0 + i, s * (1 + pan));
    }
  }

  for (let i = 0; i < length; i++) {
    L[i] = Math.tanh((L[i] ?? 0) * 1.15);
    R[i] = Math.tanh((R[i] ?? 0) * 1.15);
  }

  const buffer = new AudioBuffer({ length, numberOfChannels: 2, sampleRate });
  buffer.copyToChannel(L, 0);
  buffer.copyToChannel(R, 1);
  return buffer;
}
