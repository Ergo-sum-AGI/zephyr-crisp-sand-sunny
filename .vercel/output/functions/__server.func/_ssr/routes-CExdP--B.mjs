import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as Pause, i as Play, o as LoaderCircle, r as Square, s as Download, t as Upload } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { a as BufferTarget, c as canEncodeVideo, i as CanvasSource, n as Mp4OutputFormat, o as Quality, r as AudioBufferSource, s as canEncodeAudio, t as Output } from "../_libs/mediabunny.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CExdP--B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}
function stemName(fileName) {
	return fileName.replace(/\.[^/.]+$/, "") || "halo";
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-surface text-fg border border-border hover:bg-surface-2",
			ghost: "text-fg hover:bg-surface",
			outline: "border border-border bg-transparent text-fg hover:bg-surface"
		},
		size: {
			default: "h-12 rounded-md px-5 text-sm",
			sm: "h-10 rounded-sm px-3 text-sm",
			icon: "size-12 rounded-md",
			iconSm: "size-10 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex w-full touch-none select-none items-center py-2", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1 w-full grow overflow-hidden rounded-full bg-surface-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-fg" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full bg-fg shadow-none ring-offset-bg transition-[box-shadow] duration-[var(--motion-quick)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" })]
	});
}
/** A short, punchy pulse so the rings move without needing a file. */
function createDemoBuffer(sampleRate = 44100) {
	const duration = 8;
	const length = Math.floor(sampleRate * duration);
	const L = new Float32Array(length);
	const R = new Float32Array(length);
	const twoPi = Math.PI * 2;
	const notes = [
		261.63,
		311.13,
		392,
		466.16,
		523.25,
		392,
		311.13,
		261.63
	];
	const add = (buf, i, v) => {
		if (i >= 0 && i < buf.length) buf[i] = (buf[i] ?? 0) + v;
	};
	const kickTimes = [];
	for (let t = 0; t < duration; t += .5) kickTimes.push(t);
	for (const t0 of kickTimes) {
		const n = Math.floor(sampleRate * .2);
		const i0 = Math.floor(t0 * sampleRate);
		for (let i = 0; i < n; i++) {
			const t = i / sampleRate;
			const env = Math.exp(-t * 26);
			const freq = 150 * Math.exp(-t * 16) + 38;
			const s = Math.sin(twoPi * freq * t) * env * 1.15;
			add(L, i0 + i, s);
			add(R, i0 + i, s * .96);
		}
	}
	for (let t0 = .25; t0 < duration; t0 += .5) {
		const n = Math.floor(sampleRate * .08);
		const i0 = Math.floor(t0 * sampleRate);
		for (let i = 0; i < n; i++) {
			const t = i / sampleRate;
			const env = Math.exp(-t * 48);
			const noise = (Math.random() * 2 - 1) * env * .22;
			add(L, i0 + i, noise);
			add(R, i0 + i, noise * .85);
		}
	}
	for (let i = 0; i < length; i++) {
		const t = i / sampleRate;
		const bassHz = Math.floor(t / 2) % 2 === 0 ? 55 : 65.41;
		const env = .18 + .08 * Math.sin(twoPi * 2 * t);
		const s = Math.sin(twoPi * bassHz * t) * env;
		add(L, i, s);
		add(R, i, s * .92);
	}
	const step = .25;
	for (let stepI = 0; stepI * step < duration; stepI++) {
		const t0 = stepI * step;
		const hz = notes[stepI % notes.length];
		const n = Math.floor(sampleRate * .22);
		const i0 = Math.floor(t0 * sampleRate);
		for (let i = 0; i < n; i++) {
			const t = i / sampleRate;
			const env = Math.sin(Math.PI * i / n) * .22;
			const s = Math.sin(twoPi * hz * t) * env + Math.sin(twoPi * hz * 2 * t) * env * .4;
			const pan = (stepI % 2 === 0 ? 1 : -1) * .18;
			add(L, i0 + i, s * (1 - pan));
			add(R, i0 + i, s * (1 + pan));
		}
	}
	for (let i = 0; i < length; i++) {
		L[i] = Math.tanh((L[i] ?? 0) * 1.15);
		R[i] = Math.tanh((R[i] ?? 0) * 1.15);
	}
	const buffer = new AudioBuffer({
		length,
		numberOfChannels: 2,
		sampleRate
	});
	buffer.copyToChannel(L, 0);
	buffer.copyToChannel(R, 1);
	return buffer;
}
var FFT_SIZE = 2048;
function makeHannWindow(n) {
	const w = new Float32Array(n);
	const last = n - 1 || 1;
	for (let i = 0; i < n; i++) w[i] = .5 * (1 - Math.cos(2 * Math.PI * i / last));
	return w;
}
function fftInPlace(real, imag) {
	const n = real.length;
	for (let i = 1, j = 0; i < n; i++) {
		let bit = n >> 1;
		for (; j & bit; bit >>= 1) j ^= bit;
		j ^= bit;
		if (i < j) {
			const tr = real[i];
			real[i] = real[j];
			real[j] = tr;
			const ti = imag[i];
			imag[i] = imag[j];
			imag[j] = ti;
		}
	}
	for (let len = 2; len <= n; len <<= 1) {
		const ang = -2 * Math.PI / len;
		const wlenRe = Math.cos(ang);
		const wlenIm = Math.sin(ang);
		const half = len >> 1;
		for (let i = 0; i < n; i += len) {
			let wRe = 1;
			let wIm = 0;
			for (let j = 0; j < half; j++) {
				const ur = real[i + j];
				const ui = imag[i + j];
				const vr0 = real[i + j + half];
				const vi0 = imag[i + j + half];
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
function analyzeWindow(channel, sampleIndex, fftSize, window, real, imag) {
	const start = Math.max(0, Math.min(channel.length, sampleIndex) - (fftSize >> 1));
	const waveform = new Uint8Array(fftSize);
	imag.fill(0);
	for (let i = 0; i < fftSize; i++) {
		const idx = start + i;
		const s = idx < channel.length ? channel[idx] ?? 0 : 0;
		real[i] = s * (window[i] ?? 1);
		waveform[i] = Math.max(0, Math.min(255, Math.round((s + 1) * 128)));
	}
	fftInPlace(real, imag);
	const bins = fftSize >> 1;
	const frequency = new Uint8Array(bins);
	const minDb = -100;
	const invN = 1 / fftSize;
	for (let i = 0; i < bins; i++) {
		const mag = Math.hypot(real[i] ?? 0, imag[i] ?? 0) * invN;
		const norm = ((mag > 1e-12 ? 20 * Math.log10(mag) : minDb) - minDb) / 70;
		frequency[i] = Math.max(0, Math.min(255, Math.round(norm * 255)));
	}
	return {
		frequency,
		waveform
	};
}
function smoothBytes(current, previous, amount) {
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
var RING_COUNT = 16;
var POINTS = 280;
function bandEnergy(frequency, start, end) {
	const a = Math.max(0, Math.floor(start));
	const b = Math.min(frequency.length, Math.ceil(end));
	if (b <= a) return 0;
	let sum = 0;
	for (let i = a; i < b; i++) sum += frequency[i] ?? 0;
	return sum / (b - a) / 255;
}
function idleFrame(t) {
	const frequency = /* @__PURE__ */ new Uint8Array(1024);
	const waveform = /* @__PURE__ */ new Uint8Array(2048);
	for (let i = 0; i < frequency.length; i++) {
		const x = i / frequency.length;
		const v = 70 + 48 * Math.sin(t * .8 + x * 9) + 28 * Math.sin(t * 1.6 + x * 22) + 16 * Math.sin(t * .3 + x * 4);
		frequency[i] = Math.max(0, Math.min(255, v));
	}
	for (let i = 0; i < waveform.length; i++) {
		const x = i / waveform.length;
		const s = .32 * Math.sin(t * 1.2 + x * Math.PI * 10) + .18 * Math.sin(t * 2.6 + x * Math.PI * 22) + .08 * Math.sin(t * .7 + x * Math.PI * 4);
		waveform[i] = Math.max(0, Math.min(255, Math.round((s + 1) * 128)));
	}
	return {
		frequency,
		waveform,
		time: t,
		duration: 1
	};
}
function sampleWave(wave, p) {
	const pos = p * wave.length;
	const i0 = Math.floor(pos) % wave.length;
	const i1 = (i0 + 1) % wave.length;
	const f = pos - Math.floor(pos);
	const a = ((wave[i0] ?? 128) - 128) / 128;
	return a + (((wave[i1] ?? 128) - 128) / 128 - a) * f;
}
function drawHalo(ctx, width, height, frame, clock) {
	const data = frame ?? idleFrame(clock);
	const cx = width / 2;
	const cy = height / 2;
	const minDim = Math.min(width, height);
	const freq = data.frequency;
	const wave = data.waveform;
	const bins = Math.max(1, freq.length);
	const bass = bandEnergy(freq, 0, bins * .08);
	const mid = bandEnergy(freq, bins * .08, bins * .35);
	const treble = bandEnergy(freq, bins * .35, bins * .9);
	ctx.fillStyle = "#050508";
	ctx.fillRect(0, 0, width, height);
	const wash = ctx.createRadialGradient(cx, cy, minDim * .03, cx, cy, minDim * .64);
	wash.addColorStop(0, `hsla(${(clock * 14 + 32) % 360}, 78%, 22%, ${.28 + bass * .42})`);
	wash.addColorStop(.42, `hsla(${(clock * 9 + 196) % 360}, 62%, 14%, 0.22)`);
	wash.addColorStop(1, "rgba(5,5,8,0)");
	ctx.fillStyle = wash;
	ctx.fillRect(0, 0, width, height);
	ctx.save();
	ctx.globalCompositeOperation = "lighter";
	const inner = minDim * .065;
	const outer = minDim * .455;
	for (let r = 15; r >= 0; r--) {
		const u = r / 15;
		const logStart = bins * (.015 + u * u * .72);
		const logEnd = bins * Math.min(.98, .045 + (u + 1 / RING_COUNT) ** 2 * .88);
		const energy = Math.min(1, bandEnergy(freq, logStart, logEnd) * 1.45);
		const radius = inner + u * (outer - inner) + energy * minDim * .055 + bass * minDim * .012 * (1 - u);
		const waveAmp = minDim * (.02 + energy * .06 + treble * .012) * (.65 + u * .85);
		const hue = (clock * 18 + r * 19 + energy * 50 + bass * 20) % 360;
		const alpha = .22 + energy * .58 + mid * .08;
		const line = 1.15 + energy * 3.1 + (r < 3 ? bass * 2.4 : 0);
		ctx.beginPath();
		for (let i = 0; i <= POINTS; i++) {
			const p = i / POINTS;
			const theta = p * Math.PI * 2 - Math.PI / 2;
			const rr = radius + (sampleWave(wave, p) * waveAmp + .35 * sampleWave(wave, p * 2 % 1) * waveAmp * treble);
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
	const orbR = minDim * (.048 + bass * .09 + mid * .02);
	const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR * 2.6);
	orb.addColorStop(0, `hsla(${(clock * 20 + 48) % 360}, 92%, 80%, ${.62 + bass * .38})`);
	orb.addColorStop(.32, `hsla(${(clock * 16 + 18) % 360}, 88%, 60%, ${.32 + bass * .32})`);
	orb.addColorStop(1, "rgba(0,0,0,0)");
	ctx.fillStyle = orb;
	ctx.beginPath();
	ctx.arc(cx, cy, orbR * 2.6, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
	const vignette = ctx.createRadialGradient(cx, cy, minDim * .3, cx, cy, minDim * .6);
	vignette.addColorStop(0, "rgba(0,0,0,0)");
	vignette.addColorStop(1, "rgba(5,5,8,0.5)");
	ctx.fillStyle = vignette;
	ctx.fillRect(0, 0, width, height);
}
async function pickVideoCodec(size) {
	for (const codec of [
		"avc",
		"hevc",
		"av1"
	]) if (await canEncodeVideo(codec, {
		width: size,
		height: size,
		quality: new Quality("high")
	})) return codec;
	throw new Error("This browser cannot encode video. Try Chrome or Edge on Android.");
}
async function pickAudioCodec() {
	for (const codec of ["aac", "mp3"]) if (await canEncodeAudio(codec, { quality: new Quality("high") })) return codec;
	return null;
}
async function encodeHaloMp4(audioBuffer, options = {}) {
	const size = options.size ?? 720;
	const duration = Math.min(audioBuffer.duration, 480);
	const totalFrames = Math.max(1, Math.ceil(duration * 30));
	const channel = audioBuffer.getChannelData(0);
	const window = makeHannWindow(FFT_SIZE);
	const real = new Float32Array(FFT_SIZE);
	const imag = new Float32Array(FFT_SIZE);
	const smoothed = new Float32Array(FFT_SIZE / 2);
	const canvas = new OffscreenCanvas(size, size);
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not open a drawing surface for the video.");
	options.onProgress?.({
		ratio: .02,
		label: "Preparing encoder"
	});
	const videoCodec = await pickVideoCodec(size);
	const audioCodec = await pickAudioCodec();
	const target = new BufferTarget();
	const output = new Output({
		format: new Mp4OutputFormat({ fastStart: "in-memory" }),
		target
	});
	const videoSource = new CanvasSource(canvas, {
		codec: videoCodec,
		quality: new Quality("high"),
		keyFrameInterval: 2
	});
	output.addVideoTrack(videoSource, { frameRate: 30 });
	let audioSource = null;
	if (audioCodec) {
		audioSource = new AudioBufferSource({
			codec: audioCodec,
			quality: new Quality("high")
		});
		output.addAudioTrack(audioSource);
	}
	const throwIfAborted = () => {
		if (options.signal?.aborted) throw new DOMException("Export cancelled", "AbortError");
	};
	try {
		await output.start();
		throwIfAborted();
		if (audioSource) {
			options.onProgress?.({
				ratio: .06,
				label: "Writing audio"
			});
			if (audioBuffer.duration > 480) {
				const frames = Math.floor(480 * audioBuffer.sampleRate);
				const clipped = new AudioBuffer({
					length: frames,
					numberOfChannels: audioBuffer.numberOfChannels,
					sampleRate: audioBuffer.sampleRate
				});
				for (let c = 0; c < audioBuffer.numberOfChannels; c++) clipped.copyToChannel(audioBuffer.getChannelData(c).subarray(0, frames), c);
				await audioSource.add(clipped);
			} else await audioSource.add(audioBuffer);
			audioSource.close();
		}
		const frameDur = 1 / 30;
		for (let i = 0; i < totalFrames; i++) {
			throwIfAborted();
			const t = i * frameDur;
			const raw = analyzeWindow(channel, Math.floor(t * audioBuffer.sampleRate), FFT_SIZE, window, real, imag);
			drawHalo(ctx, size, size, {
				frequency: smoothBytes(raw.frequency, smoothed, .62),
				waveform: raw.waveform,
				time: t,
				duration
			}, t);
			await videoSource.add(t, frameDur);
			if (i % 6 === 0 || i === totalFrames - 1) {
				options.onProgress?.({
					ratio: .08 + .86 * (i + 1) / totalFrames,
					label: "Painting rings"
				});
				await new Promise((resolve) => setTimeout(resolve, 0));
			}
		}
		videoSource.close();
		options.onProgress?.({
			ratio: .96,
			label: "Finishing MP4"
		});
		await output.finalize();
	} catch (err) {
		await output.cancel().catch(() => void 0);
		throw err;
	}
	if (!target.buffer) throw new Error("The MP4 came back empty.");
	options.onProgress?.({
		ratio: 1,
		label: "Done"
	});
	return target.buffer;
}
function usePrefersReducedMotion() {
	const [reduced, setReduced] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => setReduced(mq.matches);
		sync();
		mq.addEventListener("change", sync);
		return () => mq.removeEventListener("change", sync);
	}, []);
	return reduced;
}
function HaloApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const audioRef = (0, import_react.useRef)(null);
	const playRef = (0, import_react.useRef)({
		playing: false,
		startedAt: 0,
		offset: 0
	});
	const trackRef = (0, import_react.useRef)(null);
	const rafRef = (0, import_react.useRef)(0);
	const abortRef = (0, import_react.useRef)(null);
	const fftRef = (0, import_react.useRef)({
		window: makeHannWindow(FFT_SIZE),
		real: new Float32Array(FFT_SIZE),
		imag: new Float32Array(FFT_SIZE)
	});
	const lastUiRef = (0, import_react.useRef)(0);
	const [track, setTrack] = (0, import_react.useState)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [currentTime, setCurrentTime] = (0, import_react.useState)(0);
	const [exporting, setExporting] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)({
		ratio: 0,
		label: ""
	});
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const reducedMotion = usePrefersReducedMotion();
	const ensureAudio = (0, import_react.useCallback)(async () => {
		if (audioRef.current) {
			if (audioRef.current.ctx.state === "suspended") await audioRef.current.ctx.resume();
			return audioRef.current;
		}
		const ctx = new AudioContext();
		const analyser = ctx.createAnalyser();
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = .48;
		analyser.minDecibels = -90;
		analyser.maxDecibels = -18;
		const gain = ctx.createGain();
		gain.gain.value = .9;
		analyser.connect(gain);
		gain.connect(ctx.destination);
		if (ctx.state === "suspended") await ctx.resume();
		const engine = {
			ctx,
			analyser,
			gain,
			source: null,
			freq: new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount)),
			wave: new Uint8Array(new ArrayBuffer(analyser.fftSize))
		};
		audioRef.current = engine;
		return engine;
	}, []);
	const stopSource = (0, import_react.useCallback)(() => {
		const engine = audioRef.current;
		if (!engine?.source) return;
		try {
			engine.source.onended = null;
			engine.source.stop();
		} catch {}
		engine.source.disconnect();
		engine.source = null;
	}, []);
	const pausePlayback = (0, import_react.useCallback)(() => {
		const engine = audioRef.current;
		if (engine && playRef.current.playing) {
			playRef.current.offset = Math.min(trackRef.current?.buffer.duration ?? 0, Math.max(0, engine.ctx.currentTime - playRef.current.startedAt + playRef.current.offset));
			setCurrentTime(playRef.current.offset);
		}
		stopSource();
		playRef.current.playing = false;
		setPlaying(false);
	}, [stopSource]);
	const startPlayback = (0, import_react.useCallback)(async (from) => {
		const current = trackRef.current;
		if (!current) return;
		const engine = await ensureAudio();
		stopSource();
		const offset = Math.max(0, Math.min(current.buffer.duration - .01, from ?? playRef.current.offset));
		const source = engine.ctx.createBufferSource();
		source.buffer = current.buffer;
		source.connect(engine.analyser);
		source.onended = () => {
			if (!playRef.current.playing) return;
			playRef.current.playing = false;
			playRef.current.offset = 0;
			engine.source = null;
			setPlaying(false);
			setCurrentTime(0);
		};
		engine.source = source;
		playRef.current.playing = true;
		playRef.current.offset = offset;
		playRef.current.startedAt = engine.ctx.currentTime;
		source.start(0, offset);
		setPlaying(true);
	}, [ensureAudio, stopSource]);
	const loadBuffer = (0, import_react.useCallback)(async (buffer, name) => {
		pausePlayback();
		playRef.current.offset = 0;
		const next = {
			buffer,
			name
		};
		trackRef.current = next;
		setTrack(next);
		setCurrentTime(0);
	}, [pausePlayback]);
	const loadFile = (0, import_react.useCallback)(async (file) => {
		try {
			const engine = await ensureAudio();
			const bytes = await file.arrayBuffer();
			const buffer = await engine.ctx.decodeAudioData(bytes.slice(0));
			await loadBuffer(buffer, file.name);
			toast.success("Track loaded");
		} catch {
			toast.error("Could not read that file. Try an MP3.");
		}
	}, [ensureAudio, loadBuffer]);
	const loadDemo = (0, import_react.useCallback)(async () => {
		const buffer = createDemoBuffer((await ensureAudio()).ctx.sampleRate);
		await loadBuffer(buffer, "Pulse (demo)");
		toast.success("Demo pulse loaded");
	}, [ensureAudio, loadBuffer]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const resize = () => {
			const parent = canvas.parentElement;
			const css = Math.min(parent?.clientWidth ?? 360, 560);
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.style.width = `${css}px`;
			canvas.style.height = `${css}px`;
			canvas.width = Math.round(css * dpr);
			canvas.height = Math.round(css * dpr);
		};
		resize();
		const ro = new ResizeObserver(resize);
		if (canvas.parentElement) ro.observe(canvas.parentElement);
		let last = performance.now();
		let clock = 0;
		const tick = (now) => {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			clock += reducedMotion ? dt * .25 : dt;
			const engine = audioRef.current;
			const current = trackRef.current;
			let frame = null;
			let t = playRef.current.offset;
			if (engine && playRef.current.playing) {
				t = engine.ctx.currentTime - playRef.current.startedAt + playRef.current.offset;
				if (current && t >= current.buffer.duration) t = current.buffer.duration;
				engine.analyser.getByteFrequencyData(engine.freq);
				engine.analyser.getByteTimeDomainData(engine.wave);
				if (current) frame = {
					frequency: engine.freq,
					waveform: engine.wave,
					time: t,
					duration: current.buffer.duration
				};
				if (now - lastUiRef.current > 120) {
					lastUiRef.current = now;
					setCurrentTime(t);
				}
			} else if (current) {
				const fft = fftRef.current;
				const sampleIndex = Math.floor(playRef.current.offset * current.buffer.sampleRate);
				const snap = analyzeWindow(current.buffer.getChannelData(0), sampleIndex, FFT_SIZE, fft.window, fft.real, fft.imag);
				frame = {
					frequency: snap.frequency,
					waveform: snap.waveform,
					time: playRef.current.offset,
					duration: current.buffer.duration
				};
			}
			drawHalo(ctx, canvas.width, canvas.height, frame, clock);
			rafRef.current = requestAnimationFrame(tick);
		};
		drawHalo(ctx, canvas.width, canvas.height, null, 0);
		rafRef.current = requestAnimationFrame(tick);
		const onResize = () => resize();
		window.addEventListener("resize", onResize);
		return () => {
			cancelAnimationFrame(rafRef.current);
			window.removeEventListener("resize", onResize);
			ro.disconnect();
		};
	}, [reducedMotion]);
	(0, import_react.useEffect)(() => {
		return () => {
			abortRef.current?.abort();
			stopSource();
			audioRef.current?.ctx.close();
		};
	}, [stopSource]);
	const onSeek = (value) => {
		const next = value[0] ?? 0;
		setCurrentTime(next);
		playRef.current.offset = next;
		if (playRef.current.playing) startPlayback(next);
	};
	const exportMp4 = async () => {
		const current = trackRef.current;
		if (!current || exporting) return;
		if (current.buffer.duration > 480) {
			toast.error("Keep the track under 8 minutes for export.");
			return;
		}
		pausePlayback();
		const abort = new AbortController();
		abortRef.current = abort;
		setExporting(true);
		setProgress({
			ratio: 0,
			label: "Starting"
		});
		try {
			const encoded = await encodeHaloMp4(current.buffer, {
				signal: abort.signal,
				onProgress: setProgress
			});
			const blob = new Blob([new Uint8Array(encoded)], { type: "video/mp4" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${stemName(current.name)}-halo.mp4`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.setTimeout(() => URL.revokeObjectURL(url), 4e3);
			toast.success("MP4 saved");
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") toast.message("Export cancelled");
			else {
				const message = err instanceof Error ? err.message : "Export failed.";
				toast.error(message);
			}
		} finally {
			abortRef.current = null;
			setExporting(false);
		}
	};
	const duration = track?.buffer.duration ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+1.25rem)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme: "dark",
				position: "top-center",
				toastOptions: { className: "!bg-surface !text-fg !border-border !rounded-md !font-[family-name:var(--font-sans)]" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-5 flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.18em] text-muted",
					children: "Audio film"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold tracking-[-0.04em] text-balance",
					children: "Halo"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "tabular-nums text-sm text-muted",
					children: [formatTime(currentTime), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-subtle",
						children: [" / ", formatTime(duration)]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface",
				onDragOver: (e) => {
					e.preventDefault();
					setDragOver(true);
				},
				onDragLeave: () => setDragOver(false),
				onDrop: (e) => {
					e.preventDefault();
					setDragOver(false);
					const file = e.dataTransfer.files[0];
					if (file) loadFile(file);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						className: "block size-full",
						"aria-label": "Concentric circular sound visualizer"
					}),
					dragOver ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 grid place-items-center bg-bg/70 text-sm font-medium",
						children: "Drop the MP3"
					}) : null,
					exporting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/70 px-8 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-fg" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: progress.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1 w-full overflow-hidden rounded-full bg-surface-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full bg-fg transition-[width] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
									style: { width: `${Math.round(progress.ratio * 100)}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "tabular-nums text-xs text-muted",
								children: [Math.round(progress.ratio * 100), "%"]
							})
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium",
							children: track ? track.name : "No track yet"
						}), track ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 text-xs text-muted",
							children: [Math.round(duration), "s · square MP4"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-xs text-muted",
							children: "MP3 in, MP4 out"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
						min: 0,
						max: Math.max(duration, .01),
						step: .01,
						value: [Math.min(currentTime, duration)],
						disabled: !track || exporting,
						onValueChange: onSeek,
						"aria-label": "Seek"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-[3rem_1fr] gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "secondary",
							size: "icon",
							disabled: !track || exporting,
							"aria-label": playing ? "Pause" : "Play",
							onClick: () => {
								if (playing) pausePlayback();
								else startPlayback();
							},
							children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							disabled: !track || exporting,
							onClick: () => void exportMp4(),
							children: [exporting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Convert to MP4"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							disabled: exporting,
							onClick: () => fileRef.current?.click(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), "Load MP3"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							disabled: exporting,
							onClick: () => void loadDemo(),
							children: "Try a pulse"
						})]
					}),
					exporting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						className: "mt-2 w-full",
						onClick: () => abortRef.current?.abort(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, {}), "Cancel export"]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "audio/mpeg,audio/mp3,audio/wav,audio/x-m4a,audio/aac,audio/ogg,audio/*",
						className: "sr-only",
						"aria-hidden": "true",
						tabIndex: -1,
						onChange: (e) => {
							const file = e.target.files?.[0];
							if (file) loadFile(file);
							e.target.value = "";
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-pretty text-center text-sm leading-relaxed text-muted",
				children: "Load a track. The rings follow the sound. Convert writes a square MP4 with the same halo for the length of the song."
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HaloApp, {})
	});
}
//#endregion
export { Home as component };
