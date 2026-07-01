// Tidyups design tokens — Tactile / Playful (Light)
export const colors = {
  surface: "#FAFAF9",
  onSurface: "#1C1917",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#292524",
  surfaceTertiary: "#FDF4FF",
  onSurfaceTertiary: "#86198F",
  surfaceInverse: "#1C1917",
  onSurfaceInverse: "#FAFAF9",

  brand: "#C026D3",
  brandPrimary: "#D946EF",
  onBrandPrimary: "#FAFAF9",
  brandSecondary: "#A855F7",
  onBrandSecondary: "#FAFAF9",
  brandTertiary: "#FAE8FF",
  onBrandTertiary: "#86198F",

  success: "#10B981",
  onSuccess: "#FFFFFF",
  warning: "#F59E0B",
  onWarning: "#FFFFFF",
  error: "#EF4444",
  onError: "#FFFFFF",
  info: "#0EA5E9",
  onInfo: "#FFFFFF",

  border: "#E7E5E4",
  borderStrong: "#D6D3D1",
  divider: "#F5F5F4",

  mutedText: "#78716C",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const font = {
  display: "Fredoka",
  displaySemi: "Fredoka-SemiBold",
  displayBold: "Fredoka-Bold",
  text: "Nunito",
  textSemi: "Nunito-SemiBold",
  textBold: "Nunito-Bold",
  textExtra: "Nunito-ExtraBold",
};

export const shadow = {
  card: {
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  soft: {
    shadowColor: "#1C1917",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
};

export const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  New: { bg: "#E0F2FE", fg: "#0369A1" },
  Contacted: { bg: "#FEF3C7", fg: "#B45309" },
  Booked: { bg: "#D1FAE5", fg: "#047857" },
  Closed: { bg: "#F5F5F4", fg: "#78716C" },
};

export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1758273238415-01ec03d9ef27?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHNlcnZpY2UlMjBzcGFya2xpbmclMjBjbGVhbnxlbnwwfHx8fDE3ODIyMTM3NTV8MA&ixlib=rb-4.1.0&q=85",
  mascot:
    "https://images.unsplash.com/photo-1719664246715-512692adf49b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxyYWJiaXQlMjBtYXNjb3QlMjBjb2xvcmZ1bHxlbnwwfHx8fDE3ODI0MDYyMzN8MA&ixlib=rb-4.1.0&q=85",
};
