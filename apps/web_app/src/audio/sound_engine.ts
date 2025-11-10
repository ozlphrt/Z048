type SoundEffect = "move" | "spawn" | "merge" | "undo" | "victory" | "defeat" | "reset";

interface TriggerOptions {
  playbackRate?: number;
  gain?: number;
  delay?: number;
}

const CLICK_URL = `${import.meta.env.BASE_URL}audio/mouse_click.wav`;
const preloadedClickSample: Promise<ArrayBuffer | null> =
  typeof fetch === "function" ? fetchClickSample({ cache: "force-cache" }) : Promise.resolve(null);

async function fetchClickSample(init?: RequestInit): Promise<ArrayBuffer | null> {
  if (typeof fetch !== "function") {
    return null;
  }
  try {
    const response = await fetch(CLICK_URL, init);
    if (!response.ok) {
      return null;
    }
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

class SoundEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = true;
  private buffers: Map<string, AudioBuffer> = new Map();
  private initialized = false;

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
    }

    if (this.context.state === "suspended") {
      await this.context.resume().catch(() => undefined);
    }

    if (!this.initialized && this.context) {
      this.initialized = await this.loadBuffers(this.context);
    }
  }

  private async loadBuffers(ctx: AudioContext): Promise<boolean> {
    if (this.buffers.has("click")) {
      return true;
    }

    try {
      const arrayBuffer =
        (await preloadedClickSample) ?? (await fetchClickSample({ cache: "force-cache" })) ?? (await fetchClickSample());
      if (!arrayBuffer) {
        console.warn("[SoundEngine] Unable to load click sample:", CLICK_URL);
        return false;
      }
      const clickBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      this.buffers.set("click", clickBuffer);
      this.buffers.set("thud", clickBuffer);
      return true;
    } catch (error) {
      console.warn("[SoundEngine] Failed to decode click sample:", error);
      // Silently ignore failures; sounds will no-op if assets unavailable.
      return false;
    }
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
        this.trigger("click", { playbackRate: 1.2, gain: 0.32 });
        break;
      case "spawn":
        this.trigger("click", { playbackRate: 1.35, gain: 0.36 });
        break;
      case "merge": {
        const magnitude = payload?.magnitude ?? 4;
        const intensity = Math.min(1, Math.log2(magnitude) / 4);
        this.trigger("click", { playbackRate: 0.88, gain: 0.42 + intensity * 0.12 });
        this.trigger("click", { playbackRate: 1.1 + intensity * 0.18, gain: 0.25 + intensity * 0.08, delay: 0.04 });
        break;
      }
      case "undo":
        this.trigger("click", { playbackRate: 0.9, gain: 0.3 });
        break;
      case "reset":
        this.trigger("click", { playbackRate: 0.85, gain: 0.28 });
        this.trigger("click", { playbackRate: 1.4, gain: 0.24, delay: 0.05 });
        break;
      case "victory":
        this.trigger("click", { playbackRate: 1.5, gain: 0.34 });
        this.trigger("click", { playbackRate: 1.7, gain: 0.28, delay: 0.05 });
        this.trigger("click", { playbackRate: 1.9, gain: 0.22, delay: 0.1 });
        break;
      case "defeat":
        this.trigger("click", { playbackRate: 0.75, gain: 0.32 });
        this.trigger("click", { playbackRate: 0.65, gain: 0.22, delay: 0.08 });
        break;
      default:
        break;
    }
  }
}

export const soundEngine = new SoundEngine();
export type { SoundEffect };

