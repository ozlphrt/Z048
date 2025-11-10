type SoundEffect = "move" | "spawn" | "merge" | "undo" | "victory" | "defeat" | "reset";

type ClipName = "clickLight" | "clickDark";

interface ClipConfig {
  src: string;
  baseGain: number;
}

interface EffectOptions {
  clip: ClipName;
  volume: number;
  playbackRate: number;
  offsetMs?: number;
}

const CLIP_CONFIGS: Record<ClipName, ClipConfig> = {
  clickLight: {
    src: `${import.meta.env.BASE_URL}audio/ui_click_light.mp3`,
    baseGain: 0.85
  },
  clickDark: {
    src: `${import.meta.env.BASE_URL}audio/ui_click_dark.mp3`,
    baseGain: 0.9
  }
};

const EFFECT_BUILDERS: Record<SoundEffect, (payload?: { magnitude?: number }) => EffectOptions[]> = {
  move: () => [
    {
      clip: "clickLight",
      volume: 0.55,
      playbackRate: 1.12
    }
  ],
  spawn: () => [
    {
      clip: "clickLight",
      volume: 0.6,
      playbackRate: 1.2
    }
  ],
  merge: (payload) => {
    const magnitude = payload?.magnitude ?? 4;
    const intensity = Math.min(1, Math.log2(magnitude) / 4);
    return [
      {
        clip: "clickDark",
        volume: 0.55 + intensity * 0.25,
        playbackRate: 0.92 - intensity * 0.08
      },
      {
        clip: "clickLight",
        volume: 0.4 + intensity * 0.2,
        playbackRate: 1.12 + intensity * 0.18,
        offsetMs: 48
      }
    ];
  },
  undo: () => [
    {
      clip: "clickDark",
      volume: 0.45,
      playbackRate: 0.9
    }
  ],
  reset: () => [
    {
      clip: "clickDark",
      volume: 0.42,
      playbackRate: 0.88
    },
    {
      clip: "clickLight",
      volume: 0.42,
      playbackRate: 1.25,
      offsetMs: 70
    }
  ],
  victory: () => [
    {
      clip: "clickLight",
      volume: 0.55,
      playbackRate: 1.3
    },
    {
      clip: "clickDark",
      volume: 0.52,
      playbackRate: 1.15,
      offsetMs: 55
    },
    {
      clip: "clickLight",
      volume: 0.5,
      playbackRate: 1.45,
      offsetMs: 110
    }
  ],
  defeat: () => [
    {
      clip: "clickDark",
      volume: 0.52,
      playbackRate: 0.78
    },
    {
      clip: "clickDark",
      volume: 0.4,
      playbackRate: 0.72,
      offsetMs: 80
    }
  ]
};

const PER_CLIP_COOLDOWN_SECONDS = 0.045;

class WebAudioEngine {
  private enabled = true;
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private buffers: Map<ClipName, AudioBuffer> = new Map();
  private preloadPromise: Promise<void> | null = null;
  private loadPromises: Map<ClipName, Promise<void>> = new Map();
  private queue: EffectOptions[][] = [];
  private flushScheduled = false;
  private lastPlayPerClip: Map<ClipName, number> = new Map();

  public setEnabled(value: boolean) {
    this.enabled = value;
    if (this.masterGain && this.context) {
      const ctx = this.context;
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(value ? 1 : 0, ctx.currentTime, 0.025);
    }
  }

  public async prewarm(): Promise<void> {
    if (!this.enabled) {
      return;
    }
    if (!this.preloadPromise) {
      this.preloadPromise = this.initContext();
    }
    return this.preloadPromise;
  }

  private async initContext(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.enabled ? 1 : 0;
      this.masterGain.connect(this.context.destination);
    }
    if (this.context.state === "suspended") {
      await this.context.resume().catch(() => undefined);
    }
    await this.loadClips();
  }

  private async loadClips(): Promise<void> {
    if (!this.context) {
      return;
    }
    const ctx = this.context;
    await Promise.all(
      (Object.keys(CLIP_CONFIGS) as ClipName[]).map((clip) => {
        if (this.buffers.has(clip)) {
          return Promise.resolve();
        }
        if (this.loadPromises.has(clip)) {
          return this.loadPromises.get(clip)!;
        }
        const config = CLIP_CONFIGS[clip];
        if (typeof fetch !== "function") {
          return Promise.resolve();
        }
        const promise = fetch(config.src)
          .then((response) => (response.ok ? response.arrayBuffer() : null))
          .then((arrayBuffer) => {
            if (!arrayBuffer) {
              return;
            }
            return ctx.decodeAudioData(arrayBuffer.slice(0)).then((decoded) => {
              this.buffers.set(clip, decoded);
            });
          })
          .catch((error) => {
            console.warn("[WebAudioEngine] failed to load", config.src, error);
          })
          .finally(() => {
            this.loadPromises.delete(clip);
          });
        this.loadPromises.set(clip, promise);
        return promise;
      })
    );
  }

  private scheduleFlush() {
    if (this.flushScheduled) {
      return;
    }
    this.flushScheduled = true;
    const runner = () => {
      this.flushScheduled = false;
      void this.flushQueue();
    };
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(runner);
    } else {
      setTimeout(runner, 0);
    }
  }

  private async flushQueue() {
    if (!this.enabled) {
      this.queue = [];
      return;
    }
    const batches = this.queue.splice(0);
    if (batches.length === 0) {
      return;
    }
    await this.prewarm();
    if (!this.context || !this.masterGain) {
      return;
    }
    const now = this.context.currentTime;
    for (const batch of batches) {
      for (const variant of batch) {
        this.playVariant(variant, now);
      }
    }
  }

  private playVariant(variant: EffectOptions, referenceTime: number) {
    if (!this.context || !this.masterGain) {
      return;
    }
    const buffer = this.buffers.get(variant.clip);
    if (!buffer) {
      return;
    }
    const lastPlay = this.lastPlayPerClip.get(variant.clip) ?? 0;
    const startTime = Math.max(referenceTime, this.context.currentTime) + (variant.offsetMs ?? 0) / 1000;
    if (startTime - lastPlay < PER_CLIP_COOLDOWN_SECONDS) {
      return;
    }
    this.lastPlayPerClip.set(variant.clip, startTime);

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = variant.playbackRate;

    const gain = this.context.createGain();
    gain.gain.value = Math.max(0, Math.min(1, variant.volume * CLIP_CONFIGS[variant.clip].baseGain));
    source.connect(gain).connect(this.masterGain);
    source.start(startTime);
  }

  public play(effect: SoundEffect, payload?: { magnitude?: number }): Promise<void> {
    if (!this.enabled) {
      return Promise.resolve();
    }
    const variants = EFFECT_BUILDERS[effect]?.(payload);
    if (!variants || variants.length === 0) {
      return Promise.resolve();
    }
    this.queue.push(variants);
    this.scheduleFlush();
    return Promise.resolve();
  }
}

export const webAudioEngine = new WebAudioEngine();
export type { SoundEffect };


