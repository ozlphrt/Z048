type SoundEffect = "move" | "spawn" | "merge" | "undo" | "victory" | "defeat" | "reset";

type ClipName = "clickLight" | "clickDark";

interface ClipConfig {
  src: string;
  baseVolume: number;
}

interface EffectVariant {
  clip: ClipName;
  volume: number;
  playbackRate: number;
  offsetMs?: number;
}

const CLIP_CONFIGS: Record<ClipName, ClipConfig> = {
  clickLight: {
    src: `${import.meta.env.BASE_URL}audio/ui_click_light.mp3`,
    baseVolume: 0.85
  },
  clickDark: {
    src: `${import.meta.env.BASE_URL}audio/ui_click_dark.mp3`,
    baseVolume: 0.9
  }
};

const EFFECT_VARIANTS: Record<SoundEffect, (payload?: { magnitude?: number }) => EffectVariant[]> = {
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

const PER_CLIP_COOLDOWN_MS = 50;
const MAX_POOL_SIZE = 2;

class HtmlAudioClip {
  private pool: HTMLAudioElement[] = [];
  private lastPlay = 0;

  constructor(private readonly config: ClipConfig) {
    const element = this.createElement();
    if (element) {
      this.pool.push(element);
    }
  }

  private createElement(): HTMLAudioElement | null {
    if (typeof window === "undefined") {
      return null;
    }
    const audio = new Audio(this.config.src);
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.load();
    return audio;
  }

  private acquire(): HTMLAudioElement | null {
    for (const element of this.pool) {
      if (element.paused || element.ended) {
        return element;
      }
    }
    if (this.pool.length >= MAX_POOL_SIZE) {
      return null;
    }
    const base = this.pool[0] ?? this.createElement();
    if (!base) {
      return null;
    }
    const clone = base.cloneNode(true) as HTMLAudioElement;
    clone.preload = "auto";
    clone.load();
    this.pool.push(clone);
    return clone;
  }

  public preload() {
    const element = this.pool[0];
    if (element) {
      element.load();
    }
  }

  public play(options: { volume: number; playbackRate: number }) {
    const now = performance.now();
    if (now - this.lastPlay < PER_CLIP_COOLDOWN_MS) {
      return;
    }
    this.lastPlay = now;

    const element = this.acquire();
    if (!element) {
      return;
    }
    element.pause();
    element.currentTime = 0;
    element.volume = Math.max(0, Math.min(1, options.volume * this.config.baseVolume));
    element.playbackRate = options.playbackRate;
    void element.play().catch(() => undefined);
  }
}

class BasicAudioEngine {
  private enabled = true;
  private clips: Record<ClipName, HtmlAudioClip>;
  private queue: EffectVariant[][] = [];
  private flushScheduled = false;

  constructor() {
    this.clips = {
      clickLight: new HtmlAudioClip(CLIP_CONFIGS.clickLight),
      clickDark: new HtmlAudioClip(CLIP_CONFIGS.clickDark)
    };
  }

  public setEnabled(value: boolean) {
    this.enabled = value;
    if (!value) {
      this.queue = [];
    }
  }

  public preload() {
    Object.values(this.clips).forEach((clip) => clip.preload());
  }

  private scheduleFlush() {
    if (this.flushScheduled) {
      return;
    }
    this.flushScheduled = true;
    const run = () => {
      this.flushScheduled = false;
      this.flushQueue();
    };
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(run);
    } else {
      setTimeout(run, 0);
    }
  }

  private flushQueue() {
    if (!this.enabled) {
      this.queue = [];
      return;
    }
    const batches = this.queue.splice(0);
    for (const batch of batches) {
      for (const variant of batch) {
        const clip = this.clips[variant.clip];
        if (!clip) {
          continue;
        }
        if (variant.offsetMs && variant.offsetMs > 0) {
          setTimeout(() => clip.play(variant), variant.offsetMs);
        } else {
          clip.play(variant);
        }
      }
    }
  }

  public play(effect: SoundEffect, payload?: { magnitude?: number }): Promise<void> {
    if (!this.enabled) {
      return Promise.resolve();
    }
    const variants = EFFECT_VARIANTS[effect]?.(payload);
    if (!variants || variants.length === 0) {
      return Promise.resolve();
    }
    this.queue.push(variants);
    this.scheduleFlush();
    return Promise.resolve();
  }
}

export const basicAudioEngine = new BasicAudioEngine();
export type { SoundEffect };


