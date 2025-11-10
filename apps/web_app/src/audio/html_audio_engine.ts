type SoundEffect = "move" | "spawn" | "merge" | "undo" | "victory" | "defeat" | "reset";

type ClipName = "clickLight" | "clickDark";

interface ClipConfig {
  src: string;
  baseVolume?: number;
}

interface PlayOptions {
  volume?: number;
  playbackRate?: number;
}

interface EffectVariant extends PlayOptions {
  clip: ClipName;
  offsetMs?: number;
}

const CLIP_CONFIGS: Record<ClipName, ClipConfig> = {
  clickLight: {
    src: `${import.meta.env.BASE_URL}audio/ui_click_light.mp3`,
    baseVolume: 0.8
  },
  clickDark: {
    src: `${import.meta.env.BASE_URL}audio/ui_click_dark.mp3`,
    baseVolume: 0.9
  }
};

class HtmlAudioClip {
  private readonly pool: HTMLAudioElement[] = [];

  constructor(private readonly config: ClipConfig) {
    const element = this.createElement();
    if (element) {
      this.pool.push(element);
      element.preload = "auto";
      element.load();
    }
  }

  private createElement(): HTMLAudioElement | null {
    if (typeof window === "undefined") {
      return null;
    }
    const audio = new Audio(this.config.src);
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    return audio;
  }

  private acquireInstance(): HTMLAudioElement | null {
    const available = this.pool.find((instance) => instance.paused || instance.ended);
    if (available) {
      return available;
    }
    const prototype = this.pool[0] ?? this.createElement();
    if (!prototype) {
      return null;
    }
    const clone = prototype.cloneNode(true) as HTMLAudioElement;
    clone.preload = "auto";
    this.pool.push(clone);
    return clone;
  }

  public play(options?: PlayOptions) {
    const instance = this.acquireInstance();
    if (!instance) {
      return;
    }
    const baseVolume = this.config.baseVolume ?? 1;
    const volume = Math.max(0, Math.min(1, (options?.volume ?? 1) * baseVolume));
    instance.volume = volume;
    instance.playbackRate = options?.playbackRate ?? 1;
    instance.currentTime = 0;
    void instance.play().catch(() => undefined);
  }

  public stopAll() {
    for (const instance of this.pool) {
      instance.pause();
      instance.currentTime = 0;
    }
  }
}

type EffectBuilder = (payload?: { magnitude?: number }) => EffectVariant[];

const EFFECT_BUILDERS: Record<SoundEffect, EffectBuilder> = {
  move: () => [
    {
      clip: "clickLight",
      volume: 0.55,
      playbackRate: 1.1
    }
  ],
  spawn: () => [
    {
      clip: "clickLight",
      volume: 0.6,
      playbackRate: 1.18
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
        playbackRate: 1.12 + intensity * 0.2,
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
      volume: 0.4,
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

class HtmlAudioEngine {
  private enabled = true;
  private readonly clips: Record<ClipName, HtmlAudioClip>;

  constructor() {
    this.clips = {
      clickLight: new HtmlAudioClip(CLIP_CONFIGS.clickLight),
      clickDark: new HtmlAudioClip(CLIP_CONFIGS.clickDark)
    };
  }

  public setEnabled(value: boolean) {
    this.enabled = value;
    if (!value) {
      Object.values(this.clips).forEach((clip) => clip.stopAll());
    }
  }

  public play(effect: SoundEffect, payload?: { magnitude?: number }): Promise<void> {
    if (!this.enabled || typeof window === "undefined") {
      return Promise.resolve();
    }

    const variants = EFFECT_BUILDERS[effect]?.(payload) ?? [];
    for (const variant of variants) {
      const clip = this.clips[variant.clip];
      if (!clip) {
        continue;
      }
      const trigger = () => {
        clip.play({
          volume: variant.volume,
          playbackRate: variant.playbackRate
        });
      };
      if (variant.offsetMs && variant.offsetMs > 0) {
        window.setTimeout(trigger, variant.offsetMs);
      } else {
        trigger();
      }
    }

    return Promise.resolve();
  }
}

export const htmlAudioEngine = new HtmlAudioEngine();
export type { SoundEffect };


