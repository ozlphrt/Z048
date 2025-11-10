type SoundEffect = "move" | "spawn" | "merge" | "undo" | "victory" | "defeat" | "reset";

type ClipName = "clickLight" | "clickDark";

interface ClipConfig {
  src: string;
  baseGain: number;
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
    baseGain: 0.85
  },
  clickDark: {
    src: `${import.meta.env.BASE_URL}audio/ui_click_dark.mp3`,
    baseGain: 0.9
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

const PER_CLIP_COOLDOWN_SECONDS = 0.045;

class HybridAudioEngine {
  private enabled = true;
  private prefersWebAudio = false;
  private htmlClips: Map<ClipName, HTMLAudioElement[]> = new Map();
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private decodedBuffers: Map<ClipName, AudioBuffer> = new Map();
  private preloadPromise: Promise<void> | null = null;
  private lastPlayPerClip: Map<ClipName, number> = new Map();

  constructor() {
    this.prefersWebAudio = typeof window !== "undefined" && typeof window.AudioContext === "function";
    (Object.keys(CLIP_CONFIGS) as ClipName[]).forEach((clip) => {
      this.htmlClips.set(clip, []);
    });
  }

  public setEnabled(value: boolean) {
    this.enabled = value;
  }

  public async prewarm(): Promise<void> {
    if (!this.enabled) {
      return;
    }
    if (!this.preloadPromise) {
      this.preloadPromise = this.prefersWebAudio ? this.initWebAudio() : this.initHtmlAudio();
    }
    await this.preloadPromise;
  }

  private async initWebAudio(): Promise<void> {
    if (!this.prefersWebAudio || typeof window === "undefined") {
      return;
    }
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume().catch(() => undefined);
    }

    await Promise.all(
      (Object.keys(CLIP_CONFIGS) as ClipName[]).map(async (clip) => {
        if (this.decodedBuffers.has(clip)) {
          return;
        }
        const config = CLIP_CONFIGS[clip];
        const response = await fetch(config.src).catch(() => null);
        if (!response || !response.ok) {
          return;
        }
        const arrayBuffer = await response.arrayBuffer().catch(() => null);
        if (!arrayBuffer) {
          return;
        }
        try {
          const decoded = await this.audioContext!.decodeAudioData(arrayBuffer);
          this.decodedBuffers.set(clip, decoded);
        } catch {
          // Safari might reject; fall back to HTML audio for that clip.
        }
      })
    );
  }

  private async initHtmlAudio(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }
    (Object.keys(CLIP_CONFIGS) as ClipName[]).forEach((clip) => {
      const pool = this.htmlClips.get(clip)!;
      if (pool.length === 0) {
        const element = new Audio(CLIP_CONFIGS[clip].src);
        element.preload = "auto";
        element.crossOrigin = "anonymous";
        element.load();
        pool.push(element);
      }
    });
  }

  private playWithWebAudio(variant: EffectVariant) {
    if (!this.audioContext || !this.masterGain) {
      return false;
    }
    const buffer = this.decodedBuffers.get(variant.clip);
    if (!buffer) {
      return false;
    }

    const now = this.audioContext.currentTime;
    const lastStart = this.lastPlayPerClip.get(variant.clip) ?? 0;
    const startTime = now + (variant.offsetMs ?? 0) / 1000;
    if (startTime - lastStart < PER_CLIP_COOLDOWN_SECONDS) {
      return true;
    }
    this.lastPlayPerClip.set(variant.clip, startTime);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = variant.playbackRate;

    const gain = this.audioContext.createGain();
    gain.gain.value = Math.max(0, Math.min(1, variant.volume * CLIP_CONFIGS[variant.clip].baseGain));

    source.connect(gain).connect(this.masterGain);
    source.start(startTime);
    return true;
  }

  private playWithHtmlAudio(variant: EffectVariant) {
    const pool = this.htmlClips.get(variant.clip);
    if (!pool) {
      return;
    }
    let element = pool.find((item) => item.paused || item.ended);
    if (!element) {
      if (pool.length >= 2) {
        return;
      }
      element = pool[0].cloneNode(true) as HTMLAudioElement;
      element.crossOrigin = "anonymous";
      element.preload = "auto";
      element.load();
      pool.push(element);
    }
    const now = performance.now();
    const lastStart = this.lastPlayPerClip.get(variant.clip) ?? 0;
    const startAt = now + (variant.offsetMs ?? 0);
    if ((startAt - lastStart) / 1000 < PER_CLIP_COOLDOWN_SECONDS) {
      return;
    }
    this.lastPlayPerClip.set(variant.clip, startAt / 1000);

    const trigger = () => {
      element!.pause();
      element!.currentTime = 0;
      element!.volume = Math.max(0, Math.min(1, variant.volume * CLIP_CONFIGS[variant.clip].baseGain));
      element!.playbackRate = variant.playbackRate;
      void element!.play().catch(() => undefined);
    };
    if (variant.offsetMs && variant.offsetMs > 0) {
      setTimeout(trigger, variant.offsetMs);
    } else {
      trigger();
    }
  }

  public async play(effect: SoundEffect, payload?: { magnitude?: number }): Promise<void> {
    if (!this.enabled) {
      return;
    }
    const variants = EFFECT_VARIANTS[effect]?.(payload);
    if (!variants || variants.length === 0) {
      return;
    }
    await this.prewarm();
    const usedWebAudio = this.audioContext && this.masterGain && this.prefersWebAudio;
    if (usedWebAudio) {
      variants.forEach((variant) => {
        if (!this.playWithWebAudio(variant)) {
          this.playWithHtmlAudio(variant);
        }
      });
    } else {
      variants.forEach((variant) => this.playWithHtmlAudio(variant));
    }
  }
}

export const hybridAudioEngine = new HybridAudioEngine();
export type { SoundEffect };


