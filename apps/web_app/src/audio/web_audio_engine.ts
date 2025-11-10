type SoundEffect = "move" | "spawn" | "merge" | "undo" | "victory" | "defeat" | "reset";

type ClipName = "clickLight" | "clickDark";

interface ClipConfig {
  src: string;
  baseGain?: number;
}

interface EffectOptions {
  volume?: number;
  playbackRate?: number;
  offsetMs?: number;
  clip: ClipName;
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

const clipArrayPromises: Map<ClipName, Promise<ArrayBuffer | null>> = new Map();

const fetchClipArrayBuffer = (clip: ClipName): Promise<ArrayBuffer | null> => {
  if (clipArrayPromises.has(clip)) {
    return clipArrayPromises.get(clip)!;
  }
  if (typeof fetch !== "function") {
    const fallback = Promise.resolve(null);
    clipArrayPromises.set(clip, fallback);
    return fallback;
  }
  const config = CLIP_CONFIGS[clip];
  const promise = fetch(config.src)
    .then((response) => (response.ok ? response.arrayBuffer() : null))
    .catch(() => null);
  clipArrayPromises.set(clip, promise);
  return promise;
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
        playbackRate: 0.9 - intensity * 0.08
      },
      {
        clip: "clickLight",
        volume: 0.4 + intensity * 0.2,
        playbackRate: 1.1 + intensity * 0.2,
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

class WebAudioEngine {
  private enabled = true;
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private buffers: Map<ClipName, AudioBuffer> = new Map();
  private loading: Promise<void> | null = null;

  public setEnabled(value: boolean) {
    this.enabled = value;
    if (this.masterGain && this.context) {
      const ctx = this.context;
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(value ? 1 : 0, ctx.currentTime, 0.025);
    }
  }

  private async ensureContext(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.enabled ? 1 : 0;
      this.masterGain.connect(this.context.destination);
    }
    if (this.context.state === "suspended") {
      await this.context.resume().catch(() => undefined);
    }
    if (!this.loading) {
      this.loading = this.loadBuffers();
    }
    await this.loading;
  }

  private async loadBuffers(): Promise<void> {
    if (!this.context) {
      return;
    }
    const ctx = this.context;
    const clips = Object.keys(CLIP_CONFIGS) as ClipName[];
    await Promise.all(
      clips.map(async (clip) => {
        if (this.buffers.has(clip)) {
          return;
        }
        const arrayBuffer = await fetchClipArrayBuffer(clip);
        if (!arrayBuffer) {
          return;
        }
        try {
          const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
          this.buffers.set(clip, decoded);
        } catch (error) {
          console.warn("[WebAudioEngine] decode failed for", clip, error);
        }
      })
    );
  }

  private playVariant(variant: EffectOptions) {
    if (!this.context || !this.masterGain) {
      return;
    }
    const buffer = this.buffers.get(variant.clip);
    if (!buffer) {
      return;
    }
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = variant.playbackRate ?? 1;

    const gainNode = this.context.createGain();
    const baseGain = CLIP_CONFIGS[variant.clip].baseGain ?? 1;
    gainNode.gain.value = Math.max(0, Math.min(1, (variant.volume ?? 1) * baseGain));

    source.connect(gainNode).connect(this.masterGain);
    const startTime = this.context.currentTime + (variant.offsetMs ?? 0) / 1000;
    source.start(startTime);
  }

  public async play(effect: SoundEffect, payload?: { magnitude?: number }): Promise<void> {
    if (!this.enabled) {
      return;
    }
    await this.ensureContext();
    if (!this.context || !this.masterGain) {
      return;
    }

    const variants = EFFECT_BUILDERS[effect]?.(payload) ?? [];
    for (const variant of variants) {
      this.playVariant(variant);
    }
  }
}

export const webAudioEngine = new WebAudioEngine();
export type { SoundEffect };


