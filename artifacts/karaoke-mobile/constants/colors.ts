export default {
  dark: {
    background: "#06061A",
    surface: "#0D0D2B",
    card: "rgba(147, 51, 234, 0.08)",
    cardBorder: "rgba(147, 51, 234, 0.25)",
    primary: "#9333EA",
    primaryLight: "rgba(147, 51, 234, 0.2)",
    secondary: "#3B82F6",
    secondaryLight: "rgba(59, 130, 246, 0.2)",
    accent: "#FACC15",
    text: "#FFFFFF",
    textSecondary: "rgba(255, 255, 255, 0.55)",
    textTertiary: "rgba(255, 255, 255, 0.3)",
    border: "rgba(255, 255, 255, 0.08)",
    error: "#EF4444",
    success: "#22C55E",
    warning: "#F59E0B",
    tint: "#9333EA",
    tabIconDefault: "rgba(255,255,255,0.3)",
    tabIconSelected: "#9333EA",
  },
};

export type ColorScheme = typeof import("./colors").default.dark;
