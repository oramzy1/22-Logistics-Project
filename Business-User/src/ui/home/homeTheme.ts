import { useAppTheme } from "@/src/ui/useAppTheme";

/**
 * Home-screen-only tokens. Layered on top of useAppTheme() so the shared
 * lightColors / darkColors file doesn't need to change.
 */
type Gradient = readonly [string, string];
type Tone = { bg: string; fg: string };

type HomeTokens = {
  gold: string; // text / icon gold (darker in light mode for contrast)
  goldTint: string; // icon-circle background
  goldGradient: Gradient; // primary CTA
  onGold: string; // text on the gold CTA
  cardBorder: string;
  inner: string; // inset panels inside cards
  innerBorder: string;
  promoGradient: Gradient;
  promoBorder: string;
  chipSuccess: Tone;
  chipInfo: Tone;
  chipWarn: Tone;
  shadowOpacity: number;
};

const light: HomeTokens = {
  gold: "#B88A2E",
  goldTint: "#F7ECD6",
  goldGradient: ["#DDBB6E", "#C39A3E"],
  onGold: "#1F1608",
  cardBorder: "#EFE8DA",
  inner: "#FBF9F4",
  innerBorder: "#EEE7D8",
  promoGradient: ["#FCF3DC", "#F6E4B8"],
  promoBorder: "#E6CF9A",
  chipSuccess: { bg: "#DCF5E4", fg: "#15803D" },
  chipInfo: { bg: "#E3ECFF", fg: "#1D4ED8" },
  chipWarn: { bg: "#FEF3C7", fg: "#B45309" },
  shadowOpacity: 0.08,
};

const dark: HomeTokens = {
  gold: "#E4C77B",
  goldTint: "#2A2413",
  goldGradient: ["#E9CF86", "#C9A24E"],
  onGold: "#1A1408",
  cardBorder: "#2B2A27",
  inner: "#151515",
  innerBorder: "#2A2A2A",
  promoGradient: ["#3A2F14", "#1E190C"],
  promoBorder: "#5A4A22",
  chipSuccess: { bg: "rgba(34,197,94,0.22)", fg: "#4ADE80" },
  chipInfo: { bg: "rgba(59,130,246,0.25)", fg: "#93C5FD" },
  chipWarn: { bg: "rgba(245,158,11,0.22)", fg: "#FBBF24" },
  shadowOpacity: 0,
};

export function useHomeTheme() {
  const { isDark, colors } = useAppTheme();
  return { isDark, c: colors, h: isDark ? dark : light };
}
