import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

import PressableScale from "@/src/components/PressableScale";
import { colors, spacing, radius, font, shadow, IMAGES } from "@/src/theme/theme";

export default function Success() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]} testID="success-screen">
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.springify().damping(9)} style={styles.mascotWrap}>
          <Image source={IMAGES.mascot} style={styles.mascot} contentFit="cover" transition={300} />
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={26} color="#fff" />
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(150)} style={styles.title}>
          We&apos;ll be in touch soon!
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(250)} style={styles.sub}>
          Thanks for your request. Our team has been notified and will reach out shortly with your free quote.
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(350)} style={styles.tagline}>
          <Text style={styles.taglineText}>🐰 Leave The Mess To Us!</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <PressableScale testID="success-home-button" style={styles.btn} onPress={() => router.replace("/")}>
          <Ionicons name="home" size={18} color={colors.onBrandPrimary} />
          <Text style={styles.btnText}>Back to Home</Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  mascotWrap: { marginBottom: spacing.xl },
  mascot: {
    width: 140,
    height: 140,
    borderRadius: radius.pill,
    borderWidth: 4,
    borderColor: colors.brandTertiary,
  },
  checkBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.surface,
  },
  title: { fontFamily: font.displayBold, fontSize: 28, color: colors.onSurface, textAlign: "center" },
  sub: {
    fontFamily: font.text,
    fontSize: 15,
    color: colors.mutedText,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 22,
  },
  tagline: {
    marginTop: spacing.xl,
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  taglineText: { fontFamily: font.displaySemi, fontSize: 15, color: colors.onBrandTertiary },

  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  btn: {
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadow.card,
  },
  btnText: { color: colors.onBrandPrimary, fontFamily: font.displayBold, fontSize: 18 },
});
