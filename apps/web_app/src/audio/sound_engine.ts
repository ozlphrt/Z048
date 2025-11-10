type SoundEffect = "move" | "spawn" | "merge" | "undo" | "victory" | "defeat" | "reset";

interface TriggerOptions {
  playbackRate?: number;
  gain?: number;
  delay?: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const createWoodClickBuffer = (
  ctx: BaseAudioContext,
  options?: Partial<{ tone: number; roughness: number; decay: number; duration: number; body: number }>
) => {
  const tone = options?.tone ?? 780;
  const roughness = options?.roughness ?? 0.45;
  const decay = options?.decay ?? 0.11;
  const duration = options?.duration ?? 0.14;
  const body = options?.body ?? 0.18;
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  let phase = 0;
  const baseFreq = tone;
  const overtone = tone * 1.32;
  let noiseMemory = 0;

  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t / decay);
    const bodyEnv = Math.exp(-t / (decay * 2.2));
    phase += (2 * Math.PI * baseFreq) / sampleRate;

    const tonal = Math.sin(phase) * envelope * 0.18;
    const overtonePhase = Math.sin((2 * Math.PI * overtone * t) + phase * 0.45) * envelope * 0.12;
    const white = (Math.random() * 2 - 1) * roughness;
    noiseMemory = noiseMemory * 0.55 + white * 0.45;
    const click = noiseMemory * envelope * 0.9;
    const bodyHit = (Math.random() * 2 - 1) * body * bodyEnv;

    data[i] = clamp(click + tonal + overtonePhase + bodyHit, -1, 1);
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
      createWoodClickBuffer(ctx, { tone: 1150, roughness: 0.3, decay: 0.08, duration: 0.12, body: 0.05 })
    );
    this.buffers.set(
      "thud",
      createWoodClickBuffer(ctx, { tone: 360, roughness: 0.55, decay: 0.2, duration: 0.24, body: 0.22 })
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

