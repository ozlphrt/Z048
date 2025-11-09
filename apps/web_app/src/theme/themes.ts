export interface TileVisual {
  background: string;
  foreground: string;
  backdrop: string;
}

export interface AppTheme {
  name: string;
  title?: string;
  textPrimary: string;
  textSecondary: string;
  textPrimaryLight: string;
  textSecondaryLight: string;
  surfaceGlass: string;
  surfaceGlassLight: string;
  surfaceBorder: string;
  surfaceBorderLight: string;
  boardOutline: string;
  boardOutlineLight: string;
  boardBackground: string;
  boardBackgroundLight: string;
  tileShadow: string;
  tileShadowLight: string;
  tilePalette: Map<number, TileVisual>;
  defaultTile: TileVisual;
  background: {
    dark: string;
    light: string;
  };
  preview?: string;
}

const frostPalette = new Map<number, TileVisual>([
  [2, { background: "#e0f2fe", foreground: "#1f2937", backdrop: "rgba(208, 236, 255, 0.35)" }],
  [4, { background: "#cfe9ff", foreground: "#1f2937", backdrop: "rgba(191, 224, 255, 0.35)" }],
  [8, { background: "#a8d8ff", foreground: "#0f172a", backdrop: "rgba(161, 210, 255, 0.35)" }],
  [16, { background: "#82c6ff", foreground: "#0f172a", backdrop: "rgba(130, 198, 255, 0.32)" }],
  [32, { background: "#5cb2ff", foreground: "#0f172a", backdrop: "rgba(107, 186, 255, 0.32)" }],
  [64, { background: "#3a97f8", foreground: "#0f172a", backdrop: "rgba(82, 166, 248, 0.32)" }],
  [128, { background: "#6ea8ff", foreground: "#0f172a", backdrop: "rgba(110, 168, 255, 0.3)" }],
  [256, { background: "#4c8dff", foreground: "#0f172a", backdrop: "rgba(76, 141, 255, 0.28)" }],
  [512, { background: "#2563eb", foreground: "#f8fafc", backdrop: "rgba(37, 99, 235, 0.28)" }],
  [1024, { background: "#dbeafe", foreground: "#0f172a", backdrop: "rgba(191, 219, 254, 0.28)" }],
  [2048, { background: "#fef3c7", foreground: "#111827", backdrop: "rgba(252, 211, 77, 0.28)" }]
]);

const auroraPalette = new Map<number, TileVisual>([
  [2, { background: "#f5f3ff", foreground: "#111827", backdrop: "rgba(202, 196, 255, 0.3)" }],
  [4, { background: "#ede9fe", foreground: "#111827", backdrop: "rgba(192, 188, 255, 0.28)" }],
  [8, { background: "linear-gradient(135deg, #d9f99d, #a7f3d0)", foreground: "#082f49", backdrop: "rgba(134, 239, 172, 0.32)" }],
  [16, { background: "linear-gradient(135deg, #c4b5fd, #a855f7)", foreground: "#0f172a", backdrop: "rgba(189, 160, 254, 0.32)" }],
  [32, { background: "linear-gradient(135deg, #a855f7, #6366f1)", foreground: "#f8fafc", backdrop: "rgba(129, 140, 248, 0.32)" }],
  [64, { background: "linear-gradient(135deg, #6366f1, #0ea5e9)", foreground: "#f5f5ff", backdrop: "rgba(59, 130, 246, 0.32)" }],
  [128, { background: "linear-gradient(135deg, #38bdf8, #06b6d4)", foreground: "#022c22", backdrop: "rgba(45, 212, 191, 0.28)" }],
  [256, { background: "linear-gradient(135deg, #0ea5e9, #2563eb)", foreground: "#f5fcff", backdrop: "rgba(59, 130, 246, 0.28)" }],
  [512, { background: "linear-gradient(135deg, #0f766e, #115e59)", foreground: "#f3faf9", backdrop: "rgba(15, 118, 110, 0.32)" }],
  [1024, { background: "linear-gradient(135deg, #14b8a6, #0ea5e9)", foreground: "#f5fdfa", backdrop: "rgba(20, 184, 166, 0.32)" }],
  [2048, { background: "linear-gradient(135deg, #22d3ee, #60a5fa)", foreground: "#082f49", backdrop: "rgba(96, 165, 250, 0.35)" }]
]);

const midnightPalette = new Map<number, TileVisual>([
  [2, { background: "#343d5c", foreground: "#f7fbff", backdrop: "rgba(88, 104, 160, 0.3)" }],
  [4, { background: "#404a76", foreground: "#f5f8ff", backdrop: "rgba(108, 124, 180, 0.32)" }],
  [8, { background: "linear-gradient(135deg, #465fb4, #5d86ff)", foreground: "#f4f6ff", backdrop: "rgba(95, 126, 243, 0.38)" }],
  [16, { background: "linear-gradient(135deg, #5445b4, #8053ff)", foreground: "#f3f4ff", backdrop: "rgba(126, 95, 233, 0.36)" }],
  [32, { background: "linear-gradient(135deg, #8053ff, #ba40ff)", foreground: "#fff0ff", backdrop: "rgba(180, 90, 255, 0.38)" }],
  [64, { background: "linear-gradient(135deg, #c04aff, #ff5a99)", foreground: "#fff1ff", backdrop: "rgba(255, 102, 184, 0.38)" }],
  [128, { background: "linear-gradient(135deg, #ff9654, #ff6e3c)", foreground: "#2c1812", backdrop: "rgba(255, 138, 92, 0.38)" }],
  [256, { background: "linear-gradient(135deg, #ffb854, #ff8d2e)", foreground: "#2d190c", backdrop: "rgba(255, 178, 94, 0.4)" }],
  [512, { background: "linear-gradient(135deg, #ffd26e, #ffa434)", foreground: "#2b1600", backdrop: "rgba(255, 204, 110, 0.4)" }],
  [1024, { background: "linear-gradient(135deg, #ffe294, #ffb83e)", foreground: "#291700", backdrop: "rgba(255, 214, 136, 0.42)" }],
  [2048, { background: "linear-gradient(135deg, #ffeeaa, #ffcf48)", foreground: "#291700", backdrop: "rgba(255, 232, 158, 0.44)" }]
]);

const sunsetPalette = new Map<number, TileVisual>([
  [2, { background: "#ffe7d6", foreground: "#2c2015", backdrop: "rgba(255, 205, 178, 0.35)" }],
  [4, { background: "#ffd2b2", foreground: "#2c2015", backdrop: "rgba(255, 183, 149, 0.32)" }],
  [8, { background: "#ffb48c", foreground: "#2c170f", backdrop: "rgba(255, 160, 122, 0.32)" }],
  [16, { background: "#ff9a66", foreground: "#2c140d", backdrop: "rgba(255, 138, 92, 0.32)" }],
  [32, { background: "#ff7a45", foreground: "#2c0f09", backdrop: "rgba(255, 122, 69, 0.32)" }],
  [64, { background: "#ff5c33", foreground: "#ffece6", backdrop: "rgba(255, 92, 51, 0.28)" }],
  [128, { background: "#ff8b4a", foreground: "#33150c", backdrop: "rgba(255, 139, 74, 0.3)" }],
  [256, { background: "#ff6b3b", foreground: "#ffeae3", backdrop: "rgba(255, 107, 59, 0.3)" }],
  [512, { background: "#f7502c", foreground: "#ffeade", backdrop: "rgba(247, 80, 44, 0.32)" }],
  [1024, { background: "#ffd8a8", foreground: "#2e1b0f", backdrop: "rgba(255, 205, 155, 0.32)" }],
  [2048, { background: "#ffe49c", foreground: "#331f0c", backdrop: "rgba(255, 225, 160, 0.32)" }]
]);

const emberPalette = new Map<number, TileVisual>([
  [2, { background: "#fef2e5", foreground: "#2b1a10", backdrop: "rgba(254, 226, 200, 0.35)" }],
  [4, { background: "#fcdcc9", foreground: "#2b1a10", backdrop: "rgba(252, 212, 180, 0.32)" }],
  [8, { background: "#fbb58f", foreground: "#2b160d", backdrop: "rgba(250, 174, 131, 0.32)" }],
  [16, { background: "#f98d69", foreground: "#2b130b", backdrop: "rgba(249, 141, 105, 0.32)" }],
  [32, { background: "#f76b47", foreground: "#ffece6", backdrop: "rgba(247, 107, 71, 0.32)" }],
  [64, { background: "#f6502e", foreground: "#ffeae3", backdrop: "rgba(246, 80, 46, 0.3)" }],
  [128, { background: "#ea3d39", foreground: "#ffe6e4", backdrop: "rgba(234, 61, 57, 0.3)" }],
  [256, { background: "#d92f40", foreground: "#ffe8e8", backdrop: "rgba(217, 47, 64, 0.28)" }],
  [512, { background: "#c5283a", foreground: "#ffeaea", backdrop: "rgba(197, 40, 58, 0.28)" }],
  [1024, { background: "#fbbf24", foreground: "#2b1700", backdrop: "rgba(251, 191, 36, 0.32)" }],
  [2048, { background: "#fde68a", foreground: "#2b1900", backdrop: "rgba(253, 230, 138, 0.32)" }]
]);

const frost: AppTheme = {
  name: "frost",
  title: "Frost",
  textPrimary: "#f8fbff",
  textSecondary: "rgba(222, 235, 255, 0.72)",
  textPrimaryLight: "#10223a",
  textSecondaryLight: "rgba(30, 49, 76, 0.68)",
  surfaceGlass: "rgba(17, 24, 39, 0.85)",
  surfaceGlassLight: "rgba(255, 255, 255, 0.92)",
  surfaceBorder: "rgba(116, 140, 192, 0.25)",
  surfaceBorderLight: "rgba(90, 112, 164, 0.18)",
  boardOutline: "rgba(122, 146, 204, 0.35)",
  boardOutlineLight: "rgba(140, 165, 220, 0.28)",
  boardBackground: "rgba(13, 19, 33, 0.92)",
  boardBackgroundLight: "rgba(232, 240, 255, 0.9)",
  tileShadow: "0 20px 50px rgba(9, 12, 24, 0.55)",
  tileShadowLight: "0 18px 36px rgba(120, 146, 200, 0.26)",
  tilePalette: frostPalette,
  defaultTile: {
    background: "rgba(46, 64, 92, 0.28)",
    foreground: "#f8fbff",
    backdrop: "rgba(60, 84, 124, 0.24)"
  },
  background: {
    dark: "radial-gradient(120% 120% at 100% 0%, rgba(88, 112, 255, 0.35) 0%, rgba(24, 33, 58, 0.95) 48%, rgba(18, 20, 28, 1) 100%)",
    light: "radial-gradient(120% 120% at 100% 0%, rgba(208, 236, 255, 0.8) 0%, rgba(198, 221, 255, 0.85) 45%, rgba(236, 244, 255, 1) 100%)"
  },
  preview: "linear-gradient(135deg, rgba(98, 126, 255, 0.7), rgba(142, 182, 255, 0.7))"
};

const aurora: AppTheme = {
  name: "aurora",
  title: "Aurora",
  textPrimary: "#f3f8ff",
  textSecondary: "rgba(216, 232, 255, 0.72)",
  textPrimaryLight: "#0e1c2c",
  textSecondaryLight: "rgba(16, 36, 52, 0.68)",
  surfaceGlass: "rgba(16, 22, 32, 0.78)",
  surfaceGlassLight: "rgba(247, 248, 255, 0.94)",
  surfaceBorder: "rgba(110, 182, 255, 0.22)",
  surfaceBorderLight: "rgba(122, 182, 255, 0.18)",
  boardOutline: "rgba(104, 190, 255, 0.28)",
  boardOutlineLight: "rgba(130, 210, 255, 0.24)",
  boardBackground: "rgba(12, 22, 32, 0.9)",
  boardBackgroundLight: "rgba(233, 243, 254, 0.94)",
  tileShadow: "0 20px 44px rgba(8, 14, 30, 0.5)",
  tileShadowLight: "0 18px 32px rgba(110, 170, 210, 0.25)",
  tilePalette: auroraPalette,
  defaultTile: {
    background: "rgba(208, 232, 255, 0.24)",
    foreground: "#f3f8ff",
    backdrop: "rgba(110, 170, 255, 0.18)"
  },
  background: {
    dark: "radial-gradient(120% 120% at 10% -20%, rgba(56, 189, 248, 0.35) 0%, rgba(17, 94, 89, 0.85) 45%, rgba(10, 12, 28, 0.95) 100%)",
    light: "radial-gradient(120% 120% at 10% -20%, rgba(196, 240, 255, 0.85) 0%, rgba(186, 242, 211, 0.65) 40%, rgba(231, 248, 255, 1) 100%)"
  },
  preview: "linear-gradient(135deg, rgba(48, 162, 255, 0.7), rgba(144, 94, 255, 0.7))"
};

const midnight: AppTheme = {
  name: "midnight",
  title: "Midnight",
  textPrimary: "#f6f7ff",
  textSecondary: "rgba(210, 220, 255, 0.65)",
  textPrimaryLight: "#0d1725",
  textSecondaryLight: "rgba(18, 32, 49, 0.65)",
  surfaceGlass: "rgba(12, 16, 28, 0.88)",
  surfaceGlassLight: "rgba(247, 248, 255, 0.96)",
  surfaceBorder: "rgba(108, 124, 180, 0.22)",
  surfaceBorderLight: "rgba(120, 140, 200, 0.18)",
  boardOutline: "rgba(122, 134, 255, 0.3)",
  boardOutlineLight: "rgba(140, 150, 255, 0.24)",
  boardBackground: "rgba(8, 12, 24, 0.92)",
  boardBackgroundLight: "rgba(236, 239, 255, 0.92)",
  tileShadow: "0 22px 46px rgba(8, 10, 25, 0.55)",
  tileShadowLight: "0 18px 34px rgba(96, 108, 168, 0.24)",
  tilePalette: midnightPalette,
  defaultTile: {
    background: "rgba(88, 104, 160, 0.24)",
    foreground: "#f6f7ff",
    backdrop: "rgba(114, 132, 240, 0.22)"
  },
  background: {
    dark: "radial-gradient(120% 120% at 15% -10%, rgba(74, 88, 214, 0.45) 0%, rgba(26, 31, 68, 0.92) 55%, rgba(9, 11, 25, 0.98) 100%)",
    light: "radial-gradient(120% 120% at 15% -10%, rgba(212, 220, 255, 0.85) 0%, rgba(226, 230, 255, 0.9) 55%, rgba(240, 243, 255, 1) 100%)"
  },
  preview: "linear-gradient(135deg, rgba(74, 88, 214, 0.7), rgba(45, 58, 135, 0.75))"
};

const sunset: AppTheme = {
  name: "sunset",
  title: "Sunset",
  textPrimary: "#fff7f2",
  textSecondary: "rgba(255, 215, 189, 0.72)",
  textPrimaryLight: "#2c1a12",
  textSecondaryLight: "rgba(80, 38, 20, 0.68)",
  surfaceGlass: "rgba(38, 22, 28, 0.9)",
  surfaceGlassLight: "rgba(255, 240, 232, 0.95)",
  surfaceBorder: "rgba(255, 138, 92, 0.25)",
  surfaceBorderLight: "rgba(229, 164, 140, 0.2)",
  boardOutline: "rgba(255, 132, 90, 0.38)",
  boardOutlineLight: "rgba(255, 177, 128, 0.28)",
  boardBackground: "rgba(30, 18, 24, 0.95)",
  boardBackgroundLight: "rgba(255, 244, 235, 0.92)",
  tileShadow: "0 22px 48px rgba(40, 12, 6, 0.55)",
  tileShadowLight: "0 18px 32px rgba(152, 94, 72, 0.24)",
  tilePalette: sunsetPalette,
  defaultTile: {
    background: "rgba(58, 32, 24, 0.32)",
    foreground: "#ffeade",
    backdrop: "rgba(255, 160, 122, 0.28)"
  },
  background: {
    dark: "radial-gradient(120% 120% at 100% -10%, rgba(255, 140, 83, 0.55) 0%, rgba(143, 34, 50, 0.92) 55%, rgba(32, 14, 20, 0.98) 100%)",
    light: "radial-gradient(120% 120% at 100% -10%, rgba(255, 200, 166, 0.85) 0%, rgba(255, 226, 193, 0.88) 45%, rgba(255, 244, 235, 1) 100%)"
  },
  preview: "linear-gradient(135deg, rgba(255, 140, 83, 0.75), rgba(255, 95, 109, 0.75))"
};

const ember: AppTheme = {
  name: "ember",
  title: "Ember",
  textPrimary: "#fff8f2",
  textSecondary: "rgba(255, 212, 194, 0.7)",
  textPrimaryLight: "#2b160d",
  textSecondaryLight: "rgba(80, 34, 20, 0.68)",
  surfaceGlass: "rgba(32, 18, 14, 0.9)",
  surfaceGlassLight: "rgba(255, 240, 230, 0.95)",
  surfaceBorder: "rgba(255, 128, 100, 0.25)",
  surfaceBorderLight: "rgba(230, 170, 150, 0.2)",
  boardOutline: "rgba(255, 128, 100, 0.35)",
  boardOutlineLight: "rgba(255, 190, 150, 0.28)",
  boardBackground: "rgba(28, 16, 12, 0.96)",
  boardBackgroundLight: "rgba(255, 242, 234, 0.94)",
  tileShadow: "0 24px 50px rgba(28, 8, 5, 0.6)",
  tileShadowLight: "0 18px 34px rgba(156, 98, 78, 0.28)",
  tilePalette: emberPalette,
  defaultTile: {
    background: "rgba(64, 32, 20, 0.3)",
    foreground: "#fff3eb",
    backdrop: "rgba(247, 168, 110, 0.26)"
  },
  background: {
    dark: "radial-gradient(120% 120% at 100% -10%, rgba(248, 113, 113, 0.55) 0%, rgba(120, 30, 38, 0.92) 55%, rgba(26, 10, 7, 0.98) 100%)",
    light: "radial-gradient(120% 120% at 100% -10%, rgba(255, 221, 201, 0.85) 0%, rgba(255, 233, 212, 0.9) 45%, rgba(255, 242, 236, 1) 100%)"
  },
  preview: "linear-gradient(135deg, rgba(255, 140, 94, 0.75), rgba(255, 94, 121, 0.75))"
};

export const getThemes = () => ({
  frost,
  aurora,
  midnight,
  sunset,
  ember
});

