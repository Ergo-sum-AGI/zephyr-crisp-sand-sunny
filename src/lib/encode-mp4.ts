import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  Quality,
  canEncodeAudio,
  canEncodeVideo,
  type AudioCodec,
  type VideoCodec,
} from "mediabunny";
import { FFT_SIZE, analyzeWindow, makeHannWindow, smoothBytes } from "./fft";
import { drawHalo } from "./visualizer";

export const EXPORT_SIZE = 720;
export const EXPORT_FPS = 30;
export const MAX_EXPORT_SECONDS = 8 * 60;

export type EncodeProgress = {
  ratio: number;
  label: string;
};

async function pickVideoCodec(size: number): Promise<VideoCodec> {
  const candidates: VideoCodec[] = ["avc", "hevc", "av1"];
  for (const codec of candidates) {
    if (await canEncodeVideo(codec, { width: size, height: size, quality: new Quality("high") })) {
      return codec;
    }
  }
  throw new Error("This browser cannot encode video. Try Chrome or Edge on Android.");
}

async function pickAudioCodec(): Promise<AudioCodec | null> {
  const candidates: AudioCodec[] = ["aac", "mp3"];
  for (const codec of candidates) {
    if (await canEncodeAudio(codec, { quality: new Quality("high") })) return codec;
  }
  return null;
}

export async function encodeHaloMp4(
  audioBuffer: AudioBuffer,
  options: {
    onProgress?: (progress: EncodeProgress) => void;
    signal?: AbortSignal;
    size?: number;
  } = {},
): Promise<ArrayBuffer> {
  const size = options.size ?? EXPORT_SIZE;
  const duration = Math.min(audioBuffer.duration, MAX_EXPORT_SECONDS);
  const totalFrames = Math.max(1, Math.ceil(duration * EXPORT_FPS));
  const channel = audioBuffer.getChannelData(0);
  const window = makeHannWindow(FFT_SIZE);
  const real = new Float32Array(FFT_SIZE);
  const imag = new Float32Array(FFT_SIZE);
  const smoothed = new Float32Array(FFT_SIZE / 2);

  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not open a drawing surface for the video.");

  options.onProgress?.({ ratio: 0.02, label: "Preparing encoder" });

  const videoCodec = await pickVideoCodec(size);
  const audioCodec = await pickAudioCodec();

  const target = new BufferTarget();
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target,
  });

  const videoSource = new CanvasSource(canvas, {
    codec: videoCodec,
    quality: new Quality("high"),
    keyFrameInterval: 2,
  });
  output.addVideoTrack(videoSource, { frameRate: EXPORT_FPS });

  let audioSource: AudioBufferSource | null = null;
  if (audioCodec) {
    audioSource = new AudioBufferSource({
      codec: audioCodec,
      quality: new Quality("high"),
    });
    output.addAudioTrack(audioSource);
  }

  const throwIfAborted = () => {
    if (options.signal?.aborted) {
      throw new DOMException("Export cancelled", "AbortError");
    }
  };

  try {
    await output.start();
    throwIfAborted();

    if (audioSource) {
      options.onProgress?.({ ratio: 0.06, label: "Writing audio" });
      if (audioBuffer.duration > MAX_EXPORT_SECONDS) {
        const frames = Math.floor(MAX_EXPORT_SECONDS * audioBuffer.sampleRate);
        const clipped = new AudioBuffer({
          length: frames,
          numberOfChannels: audioBuffer.numberOfChannels,
          sampleRate: audioBuffer.sampleRate,
        });
        for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
          clipped.copyToChannel(audioBuffer.getChannelData(c).subarray(0, frames), c);
        }
        await audioSource.add(clipped);
      } else {
        await audioSource.add(audioBuffer);
      }
      audioSource.close();
    }

    const frameDur = 1 / EXPORT_FPS;
    for (let i = 0; i < totalFrames; i++) {
      throwIfAborted();
      const t = i * frameDur;
      const sampleIndex = Math.floor(t * audioBuffer.sampleRate);
      const raw = analyzeWindow(channel, sampleIndex, FFT_SIZE, window, real, imag);
      const frequency = smoothBytes(raw.frequency, smoothed, 0.62);
      drawHalo(
        ctx,
        size,
        size,
        { frequency, waveform: raw.waveform, time: t, duration },
        t,
      );
      await videoSource.add(t, frameDur);
      if (i % 6 === 0 || i === totalFrames - 1) {
        options.onProgress?.({
          ratio: 0.08 + (0.86 * (i + 1)) / totalFrames,
          label: "Painting rings",
        });
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    }

    videoSource.close();
    options.onProgress?.({ ratio: 0.96, label: "Finishing MP4" });
    await output.finalize();
  } catch (err) {
    await output.cancel().catch(() => undefined);
    throw err;
  }

  if (!target.buffer) throw new Error("The MP4 came back empty.");
  options.onProgress?.({ ratio: 1, label: "Done" });
  return target.buffer;
}
