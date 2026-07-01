import React from "react";
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import PressableScale from "@/src/components/PressableScale";
import { colors, spacing, radius, font, shadow, IMAGES } from "@/src/theme/theme";

const SERVICES = [
  { key: "Standard Cleaning", icon: "sparkles-outline", desc: "Regular refresh for a tidy home", tint: "#FAE8FF" },
  { key: "Deep Cleaning", icon: "water-outline", desc: "Top-to-bottom intensive clean", tint: "#F3E8FF" },
  { key: "Move In Cleaning", icon: "home-outline", desc: "Spotless start in your new place", tint: "#FDF4FF" },
  { key: "Move Out Cleaning", icon: "exit-outline", desc: "Leave it gleaming, get your deposit", tint: "#FCE7F3" },
] as const;

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height } = useWindowDimensions();

  return (
    <View style={styles.root} testID="home-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        {/* Hero */}
        <View style={[styles.hero, { height: Math.max(340, height * 0.46) }]}>
          <Image source={IMAGES.hero} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
          <LinearGradient
            colors={["rgba(28,25,23,0.15)", "rgba(28,25,23,0.55)", "rgba(28,25,23,0.9)"]}
            style={StyleSheet.absoluteFill}
          />
          <PressableScale
            testID="home-admin-button"
            style={[styles.adminBtn, { top: insets.top + spacing.sm }]}
            onPress={() => router.push("/admin")}
          >
            <Ionicons name="lock-closed-outline" size={18} color="#fff" />
          </PressableScale>

          <View style={[styles.heroContent, { paddingBottom: spacing.xl }]}>
            <Animated.View entering={FadeInDown.delay(80)} style={styles.brandRow}>
              <Image source={IMAGES.mascot} style={styles.mascot} contentFit="cover" transition={300} />
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>TIDYUPS</Text>
              </View>
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(160)} style={styles.heroTitle}>
              Leave The Mess{"\n"}To Us!
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(240)} style={styles.heroSub}>
              Book a trusted cleaning crew in seconds. Free, no-obligation quotes.
            </Animated.Text>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <Text style={styles.sectionSub}>Pick what fits — we handle the rest.</Text>

          <View style={styles.grid}>
            {SERVICES.map((s, i) => (
              <Animated.View
                key={s.key}
                entering={FadeInDown.delay(120 + i * 70)}
                style={styles.cardWrap}
              >
                <PressableScale
                  testID={`service-card-${i}`}
                  style={styles.card}
                  onPress={() => router.push({ pathname: "/quote", params: { service: s.key } })}
                >
                  <View style={[styles.iconBox, { backgroundColor: s.tint }]}>
                    <Ionicons name={s.icon as any} size={26} color={colors.brand} />
                  </View>
                  <Text style={styles.cardTitle}>{s.key}</Text>
                  <Text style={styles.cardDesc}>{s.desc}</Text>
                </PressableScale>
              </Animated.View>
            ))}
          </View>

          <View style={styles.trustRow}>
            {[
              { icon: "shield-checkmark", label: "Insured" },
              { icon: "leaf", label: "Eco friendly" },
              { icon: "happy", label: "5-star crew" },
            ].map((t) => (
              <View key={t.label} style={styles.trustItem}>
                <Ionicons name={t.icon as any} size={18} color={colors.brand} />
                <Text style={styles.trustText}>{t.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <BlurView intensity={40} tint="light" style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <PressableScale
          testID="home-get-quote-button"
          style={styles.ctaBtn}
          onPress={() => router.push("/quote")}
        >
          <Text style={styles.ctaText}>Get a Free Quote</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.onBrandPrimary} />
        </PressableScale>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: { width: "100%", justifyContent: "flex-end" },
  adminBtn: {
    position: "absolute",
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: { paddingHorizontal: spacing.xl },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  mascot: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  brandBadge: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  brandBadgeText: { color: colors.onBrandPrimary, fontFamily: font.textExtra, fontSize: 13, letterSpacing: 1 },
  heroTitle: { color: "#fff", fontFamily: font.displayBold, fontSize: 40, lineHeight: 44 },
  heroSub: { color: "rgba(255,255,255,0.9)", fontFamily: font.text, fontSize: 15, marginTop: spacing.sm, lineHeight: 21 },

  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  sectionTitle: { fontFamily: font.displayBold, fontSize: 24, color: colors.onSurface },
  sectionSub: { fontFamily: font.text, fontSize: 14, color: colors.mutedText, marginTop: 2, marginBottom: spacing.lg },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cardWrap: { width: "48%", marginBottom: spacing.md },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  cardTitle: { fontFamily: font.displaySemi, fontSize: 16, color: colors.onSurface },
  cardDesc: { fontFamily: font.text, fontSize: 12.5, color: colors.mutedText, marginTop: 4, lineHeight: 17 },

  trustRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.md,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
  },
  trustItem: { alignItems: "center", gap: 6 },
  trustText: { fontFamily: font.textSemi, fontSize: 12, color: colors.onBrandTertiary },

  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaBtn: {
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadow.card,
  },
  ctaText: { color: colors.onBrandPrimary, fontFamily: font.displayBold, fontSize: 18 },
});
