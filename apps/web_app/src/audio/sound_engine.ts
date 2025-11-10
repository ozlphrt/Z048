type SoundEffect = "move" | "spawn" | "merge" | "undo" | "victory" | "defeat" | "reset";

interface TriggerOptions {
  playbackRate?: number;
  gain?: number;
  delay?: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const createClickBuffer = (
  ctx: BaseAudioContext,
  options?: Partial<{ decay: number; duration: number; shape?: readonly number[] }>
) => {
  const decay = options?.decay ?? 0.03;
  const duration = options?.duration ?? 0.08;
  const sampleRate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  const shape = options?.shape ?? [1, -0.55, 0.32, -0.18, 0.08];
  const impulse = new Float32Array(length);
  for (let i = 0; i < shape.length && i < length; i += 1) {
    impulse[i] = shape[i];
  }

  let prevInput = 0;
  let prevHigh = 0;
  const highPassCoeff = 0.85;

  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t / decay);

    const source = impulse[i];

    const high = highPassCoeff * (prevHigh + source - prevInput);
    prevInput = source;
    prevHigh = high;

    data[i] = clamp(high * envelope, -1, 1);
  }

  return buffer;
};

class SoundEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = true;
  private buffers: Map<string, AudioBuffer> = new Map();

  public setEnabled(value: boolean) {
    this.enabled = value;
    if (this.masterGain) {
      const ctx = this.masterGain.context;
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(value ? 1 : 0, ctx.currentTime, 0.03);
    }
  }

  private async ensureContext() {
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.enabled ? 1 : 0;
      this.masterGain.connect(this.context.destination);
      this.prepareBuffers(this.context);
    }
    if (this.context.state === "suspended") {
      await this.context.resume().catch(() => undefined);
    }
  }

  private prepareBuffers(ctx: AudioContext) {
    this.buffers.set(
      "click",
      createClickBuffer(ctx, {
        decay: 0.022,
        duration: 0.06,
        shape: [1, -0.62, 0.34, -0.21, 0.12, -0.05]
      })
    );
    this.buffers.set(
      "thud",
      createClickBuffer(ctx, {
        decay: 0.05,
        duration: 0.14,
        shape: [1, -0.45, 0.26, -0.15, 0.08, -0.04]
      })
    );
  }

  private trigger(name: string, options?: TriggerOptions) {
    if (!this.enabled || !this.context || !this.masterGain) {
      return;
    }
    const buffer = this.buffers.get(name);
    if (!buffer) {
      return;
    }
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = options?.playbackRate ?? 1;

    const gain = this.context.createGain();
    gain.gain.value = options?.gain ?? 0.45;

    source.connect(gain).connect(this.masterGain);

    const startTime = this.context.currentTime + (options?.delay ?? 0);
    source.start(startTime);
  }

  public async play(effect: SoundEffect, payload?: { magnitude?: number }) {
    await this.ensureContext();
    if (!this.context || !this.masterGain) {
      return;
    }

    switch (effect) {
      case "move":
        this.trigger("click", { playbackRate: 1.1, gain: 0.28 });
        break;
      case "spawn":
        this.trigger("click", { playbackRate: 1.3, gain: 0.32 });
        break;
      case "merge": {
        const magnitude = payload?.magnitude ?? 4;
        const intensity = Math.min(1, Math.log2(magnitude) / 4);
        this.trigger("thud", { playbackRate: 0.86 + intensity * 0.3, gain: 0.4 + intensity * 0.25 });
        this.trigger("click", { playbackRate: 1 + intensity * 0.15, gain: 0.22 + intensity * 0.1, delay: 0.035 });
        break;
      }
      case "undo":
        this.trigger("thud", { playbackRate: 0.92, gain: 0.28 });
        break;
      case "reset":
        this.trigger("thud", { playbackRate: 0.85, gain: 0.22 });
        this.trigger("click", { playbackRate: 1.25, gain: 0.2, delay: 0.05 });
        break;
      case "victory":
        this.trigger("click", { playbackRate: 1.4, gain: 0.35 });
        this.trigger("click", { playbackRate: 1.6, gain: 0.28, delay: 0.05 });
        this.trigger("click", { playbackRate: 1.8, gain: 0.22, delay: 0.1 });
        break;
      case "defeat":
        this.trigger("thud", { playbackRate: 0.72, gain: 0.38 });
        this.trigger("thud", { playbackRate: 0.6, gain: 0.24, delay: 0.09 });
        break;
      default:
        break;
    }
  }
}

export const soundEngine = new SoundEngine();
export type { SoundEffect };

