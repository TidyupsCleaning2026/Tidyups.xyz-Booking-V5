import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

import PressableScale from "@/src/components/PressableScale";
import { colors, spacing, radius, font, shadow, PHONE_DISPLAY, PHONE_TEL } from "@/src/theme/theme";

const LOGO = require("../assets/images/tidyups-logo.png");

const SERVICES = [
  { key: "Standard Cleaning", icon: "sparkles-outline", desc: "Regular refresh for a tidy home", tint: "#FAE8FF" },
  { key: "Deep Cleaning", icon: "water-outline", desc: "Top-to-bottom intensive clean", tint: "#F3E8FF" },
  { key: "Move In Cleaning", icon: "home-outline", desc: "Spotless start in your new place", tint: "#FDF4FF" },
  { key: "Move Out Cleaning", icon: "exit-outline", desc: "Leave it gleaming, get your deposit", tint: "#FCE7F3" },
] as const;

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { crash } = useLocalSearchParams<{ crash?: string }>();

  // Test hook: force a render error to validate the root error boundary.
  if (crash === "1") {
    throw new Error("Intentional crash to test ErrorBoundary");
  }

  return (
    <View style={styles.root} testID="home-screen">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      >
        {/* Dark brand hero with real logo */}
        <View style={styles.hero}>
          <LinearGradient
            colors={["#000000", "#1A0821", "#2E0A3A"]}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["transparent", "rgba(192,38,211,0.18)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <PressableScale
            testID="home-admin-button"
            style={[styles.adminBtn, { top: insets.top + spacing.sm }]}
            onPress={() => router.push("/admin")}
          >
            <Ionicons name="lock-closed-outline" size={18} color="#fff" />
          </PressableScale>

          <View style={[styles.heroContent, { paddingTop: insets.top + spacing.xl }]}>
            <Animated.View entering={FadeInDown.delay(60)}>
              <Image source={LOGO} style={styles.logo} contentFit="contain" transition={300} />
            </Animated.View>
            <Animated.Text entering={FadeInDown.delay(160)} style={styles.tagline}>
              Leave The Mess To Us!
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(240)}>
              <PressableScale
                testID="home-call-button"
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${PHONE_TEL}`)}
              >
                <Ionicons name="call" size={16} color={colors.brandPrimary} />
                <Text style={styles.callText}>{PHONE_DISPLAY}</Text>
              </PressableScale>
            </Animated.View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <Text style={styles.sectionSub}>Pick what fits — we handle the rest.</Text>

          <View style={styles.grid}>
            {SERVICES.map((s, i) => (
              <Animated.View key={s.key} entering={FadeInDown.delay(120 + i * 70)} style={styles.cardWrap}>
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

          <PressableScale
            testID="home-privacy-link"
            haptic={false}
            scaleTo={0.97}
            style={styles.privacyLink}
            onPress={() => router.push("/privacy")}
          >
            <Ionicons name="lock-closed-outline" size={13} color={colors.mutedText} />
            <Text style={styles.privacyLinkText}>Privacy Policy</Text>
          </PressableScale>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <BlurView intensity={40} tint="light" style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <PressableScale testID="home-get-quote-button" style={styles.ctaBtn} onPress={() => router.push("/quote")}>
          <Text style={styles.ctaText}>Get a Free Quote</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.onBrandPrimary} />
        </PressableScale>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: {
    width: "100%",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  adminBtn: {
    position: "absolute",
    right: spacing.lg,
    zIndex: 2,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: { alignItems: "center", paddingBottom: spacing["2xl"], paddingHorizontal: spacing.xl },
  logo: { width: 260, height: 260 },
  tagline: {
    color: "#fff",
    fontFamily: font.displayBold,
    fontSize: 22,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(217,70,239,0.5)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  callText: { color: "#fff", fontFamily: font.textBold, fontSize: 15, letterSpacing: 0.5 },

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

  privacyLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  privacyLinkText: {
    fontFamily: font.textSemi,
    fontSize: 13,
    color: colors.mutedText,
    textDecorationLine: "underline",
  },

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
