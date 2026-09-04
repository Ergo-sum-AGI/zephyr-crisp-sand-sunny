import { Download, Loader2, Pause, Play, Square, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { createDemoBuffer } from "@/lib/demo-audio";
import { encodeHaloMp4, MAX_EXPORT_SECONDS } from "@/lib/encode-mp4";
import { FFT_SIZE, analyzeWindow, makeHannWindow } from "@/lib/fft";
import { formatTime, stemName } from "@/lib/utils";
import { drawHalo, type VizFrame } from "@/lib/visualizer";

type Track = {
  buffer: AudioBuffer;
  name: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

export function HaloApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<{
    ctx: AudioContext;
    analyser: AnalyserNode;
    gain: GainNode;
    source: AudioBufferSourceNode | null;
    freq: Uint8Array<ArrayBuffer>;
    wave: Uint8Array<ArrayBuffer>;
  } | null>(null);
  const playRef = useRef({
    playing: false,
    startedAt: 0,
    offset: 0,
  });
  const trackRef = useRef<Track | null>(null);
  const rafRef = useRef<number>(0);
  const abortRef = useRef<AbortController | null>(null);
  const fftRef = useRef({
    window: makeHannWindow(FFT_SIZE),
    real: new Float32Array(FFT_SIZE),
    imag: new Float32Array(FFT_SIZE),
  });
  const lastUiRef = useRef(0);

  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState({ ratio: 0, label: "" });
  const [dragOver, setDragOver] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const ensureAudio = useCallback(async () => {
    if (audioRef.current) {
      if (audioRef.current.ctx.state === "suspended") await audioRef.current.ctx.resume();
      return audioRef.current;
    }
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.48;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -18;
    const gain = ctx.createGain();
    gain.gain.value = 0.9;
    analyser.connect(gain);
    gain.connect(ctx.destination);
    if (ctx.state === "suspended") await ctx.resume();
    const engine = {
      ctx,
      analyser,
      gain,
      source: null as AudioBufferSourceNode | null,
      freq: new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount)),
      wave: new Uint8Array(new ArrayBuffer(analyser.fftSize)),
    };
    audioRef.current = engine;
    return engine;
  }, []);

  const stopSource = useCallback(() => {
    const engine = audioRef.current;
    if (!engine?.source) return;
    try {
      engine.source.onended = null;
      engine.source.stop();
    } catch {
      /* already stopped */
    }
    engine.source.disconnect();
    engine.source = null;
  }, []);

  const pausePlayback = useCallback(() => {
    const engine = audioRef.current;
    if (engine && playRef.current.playing) {
      playRef.current.offset = Math.min(
        trackRef.current?.buffer.duration ?? 0,
        Math.max(0, engine.ctx.currentTime - playRef.current.startedAt + playRef.current.offset),
      );
      setCurrentTime(playRef.current.offset);
    }
    stopSource();
    playRef.current.playing = false;
    setPlaying(false);
  }, [stopSource]);

  const startPlayback = useCallback(
    async (from?: number) => {
      const current = trackRef.current;
      if (!current) return;
      const engine = await ensureAudio();
      stopSource();
      const offset = Math.max(0, Math.min(current.buffer.duration - 0.01, from ?? playRef.current.offset));
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
    },
    [ensureAudio, stopSource],
  );

  const loadBuffer = useCallback(
    async (buffer: AudioBuffer, name: string) => {
      pausePlayback();
      playRef.current.offset = 0;
      const next = { buffer, name };
      trackRef.current = next;
      setTrack(next);
      setCurrentTime(0);
    },
    [pausePlayback],
  );

  const loadFile = useCallback(
    async (file: File) => {
      try {
        const engine = await ensureAudio();
        const bytes = await file.arrayBuffer();
        const buffer = await engine.ctx.decodeAudioData(bytes.slice(0));
        await loadBuffer(buffer, file.name);
        toast.success("Track loaded");
      } catch {
        toast.error("Could not read that file. Try an MP3.");
      }
    },
    [ensureAudio, loadBuffer],
  );

  const loadDemo = useCallback(async () => {
    const engine = await ensureAudio();
    const buffer = createDemoBuffer(engine.ctx.sampleRate);
    await loadBuffer(buffer, "Pulse (demo)");
    toast.success("Demo pulse loaded");
  }, [ensureAudio, loadBuffer]);

  useEffect(() => {
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
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      clock += reducedMotion ? dt * 0.25 : dt;

      const engine = audioRef.current;
      const current = trackRef.current;
      let frame: VizFrame | null = null;
      let t = playRef.current.offset;
      if (engine && playRef.current.playing) {
        t = engine.ctx.currentTime - playRef.current.startedAt + playRef.current.offset;
        if (current && t >= current.buffer.duration) t = current.buffer.duration;
        engine.analyser.getByteFrequencyData(engine.freq);
        engine.analyser.getByteTimeDomainData(engine.wave);
        if (current) {
          frame = {
            frequency: engine.freq,
            waveform: engine.wave,
            time: t,
            duration: current.buffer.duration,
          };
        }
        if (now - lastUiRef.current > 120) {
          lastUiRef.current = now;
          setCurrentTime(t);
        }
      } else if (current) {
        const fft = fftRef.current;
        const sampleIndex = Math.floor(playRef.current.offset * current.buffer.sampleRate);
        const snap = analyzeWindow(
          current.buffer.getChannelData(0),
          sampleIndex,
          FFT_SIZE,
          fft.window,
          fft.real,
          fft.imag,
        );
        frame = {
          frequency: snap.frequency,
          waveform: snap.waveform,
          time: playRef.current.offset,
          duration: current.buffer.duration,
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

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopSource();
      void audioRef.current?.ctx.close();
    };
  }, [stopSource]);

  const onSeek = (value: number[]) => {
    const next = value[0] ?? 0;
    setCurrentTime(next);
    playRef.current.offset = next;
    if (playRef.current.playing) void startPlayback(next);
  };

  const exportMp4 = async () => {
    const current = trackRef.current;
    if (!current || exporting) return;
    if (current.buffer.duration > MAX_EXPORT_SECONDS) {
      toast.error("Keep the track under 8 minutes for export.");
      return;
    }
    pausePlayback();
    const abort = new AbortController();
    abortRef.current = abort;
    setExporting(true);
    setProgress({ ratio: 0, label: "Starting" });
    try {
      const encoded = await encodeHaloMp4(current.buffer, {
        signal: abort.signal,
        onProgress: setProgress,
      });
      const blob = new Blob([new Uint8Array(encoded)], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${stemName(current.name)}-halo.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast.success("MP4 saved");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.message("Export cancelled");
      } else {
        const message = err instanceof Error ? err.message : "Export failed.";
        toast.error(message);
      }
    } finally {
      abortRef.current = null;
      setExporting(false);
    }
  };

  const duration = track?.buffer.duration ?? 0;

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[440px] flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+1.25rem)]">
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className:
            "!bg-surface !text-fg !border-border !rounded-md !font-[family-name:var(--font-sans)]",
        }}
      />

      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Audio film</p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-balance">Halo</h1>
        </div>
        <p className="tabular-nums text-sm text-muted">
          {formatTime(currentTime)}
          <span className="text-subtle"> / {formatTime(duration)}</span>
        </p>
      </header>

      <div
        className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-surface"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) void loadFile(file);
        }}
      >
        <canvas
          ref={canvasRef}
          className="block size-full"
          aria-label="Concentric circular sound visualizer"
        />
        {dragOver ? (
          <div className="absolute inset-0 grid place-items-center bg-bg/70 text-sm font-medium">
            Drop the MP3
          </div>
        ) : null}
        {exporting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg/70 px-8 text-center">
            <Loader2 className="size-6 animate-spin text-fg" />
            <p className="text-sm font-medium">{progress.label}</p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-fg transition-[width] duration-[var(--motion-fast)] ease-[var(--ease-out)]"
                style={{ width: `${Math.round(progress.ratio * 100)}%` }}
              />
            </div>
            <p className="tabular-nums text-xs text-muted">{Math.round(progress.ratio * 100)}%</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium">{track ? track.name : "No track yet"}</p>
          {track ? (
            <span className="shrink-0 text-xs text-muted">{Math.round(duration)}s · square MP4</span>
          ) : (
            <span className="shrink-0 text-xs text-muted">MP3 in, MP4 out</span>
          )}
        </div>

        <Slider
          min={0}
          max={Math.max(duration, 0.01)}
          step={0.01}
          value={[Math.min(currentTime, duration)]}
          disabled={!track || exporting}
          onValueChange={onSeek}
          aria-label="Seek"
        />

        <div className="mt-4 grid grid-cols-[3rem_1fr] gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            disabled={!track || exporting}
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => {
              if (playing) pausePlayback();
              else void startPlayback();
            }}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
          <Button type="button" disabled={!track || exporting} onClick={() => void exportMp4()}>
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}
            Convert to MP4
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={exporting}
            onClick={() => fileRef.current?.click()}
          >
            <Upload />
            Load MP3
          </Button>
          <Button type="button" variant="outline" disabled={exporting} onClick={() => void loadDemo()}>
            Try a pulse
          </Button>
        </div>

        {exporting ? (
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full"
            onClick={() => abortRef.current?.abort()}
          >
            <Square />
            Cancel export
          </Button>
        ) : null}

        <input
          ref={fileRef}
          type="file"
          accept="audio/mpeg,audio/mp3,audio/wav,audio/x-m4a,audio/aac,audio/ogg,audio/*"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void loadFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <p className="mt-4 text-pretty text-center text-sm leading-relaxed text-muted">
        Load a track. The rings follow the sound. Convert writes a square MP4 with the same halo
        for the length of the song.
      </p>
    </div>
  );
}
