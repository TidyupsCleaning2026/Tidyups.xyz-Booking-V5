import { useFonts } from "expo-font";

const ttf = (family: string, weight: string) =>
  `https://cdn.jsdelivr.net/fontsource/fonts/${family}@latest/latin-${weight}-normal.ttf`;

export const useAppFonts = (): readonly [boolean, Error | null] =>
  useFonts({
    Fredoka: ttf("fredoka", "400"),
    "Fredoka-SemiBold": ttf("fredoka", "600"),
    "Fredoka-Bold": ttf("fredoka", "700"),
    Nunito: ttf("nunito", "400"),
    "Nunito-SemiBold": ttf("nunito", "600"),
    "Nunito-Bold": ttf("nunito", "700"),
    "Nunito-ExtraBold": ttf("nunito", "800"),
  });
