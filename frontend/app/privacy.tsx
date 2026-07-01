import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import PressableScale from "@/src/components/PressableScale";
import { colors, spacing, radius, font, PHONE_DISPLAY, PHONE_TEL } from "@/src/theme/theme";

const UPDATED = "July 2026";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Who we are",
    body:
      "Tidyups Cleaning Service Inc (\"Tidyups\", \"we\", \"us\") provides residential and commercial cleaning services. This policy explains how we handle the information you share when you request a quote through this app.",
  },
  {
    title: "Information we collect",
    body:
      "When you submit a quote request we collect the details you provide: your full name, phone number, email address, property address, the service and property type you select, the number of bedrooms and bathrooms, and any message you add. We do not collect location, camera, contacts, or other device data.",
  },
  {
    title: "How we use your information",
    body:
      "We use your details solely to contact you about your cleaning quote, schedule and provide the requested service, and respond to your enquiry. When you submit a request, an alert containing your name, phone number and service details may be sent by SMS to our team so we can respond quickly.",
  },
  {
    title: "How we share it",
    body:
      "We do not sell or rent your information. We share it only with service providers that help us operate — for example our SMS provider (Twilio) used to notify our team — and only as needed to deliver our service or comply with the law.",
  },
  {
    title: "Data retention",
    body:
      "We keep your quote request for as long as needed to serve you and for our reasonable business and legal records, after which it is deleted.",
  },
  {
    title: "Your choices & rights",
    body:
      "You may ask us to access, correct, or delete the personal information you submitted. To make a request, contact us using the details below and we will action it promptly.",
  },
  {
    title: "Children's privacy",
    body:
      "This app is intended for adults arranging cleaning services and is not directed to children under 13.",
  },
];

export default function Privacy() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.root} testID="privacy-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale testID="privacy-back-button" style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </PressableScale>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xl }}
      >
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={18} color={colors.brand} />
          <Text style={styles.badgeText}>Last updated {UPDATED}</Text>
        </View>

        <Text style={styles.intro}>
          Your privacy matters to us. Here&apos;s exactly what we collect when you request a quote and how we use it.
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact us</Text>
          <Text style={styles.sectionBody}>
            Questions about your data or a deletion request? Reach the Tidyups team:
          </Text>
          <PressableScale
            testID="privacy-call-button"
            style={styles.contactBtn}
            onPress={() => Linking.openURL(`tel:${PHONE_TEL}`)}
          >
            <Ionicons name="call" size={18} color={colors.brand} />
            <Text style={styles.contactBtnText}>{PHONE_DISPLAY}</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: font.displayBold, fontSize: 20, color: colors.onSurface },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  badgeText: { fontFamily: font.textSemi, fontSize: 12, color: colors.onBrandTertiary },

  intro: {
    fontFamily: font.text,
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurface,
    marginTop: spacing.lg,
  },

  section: { marginTop: spacing.xl },
  sectionTitle: { fontFamily: font.displaySemi, fontSize: 17, color: colors.onSurface, marginBottom: spacing.sm },
  sectionBody: { fontFamily: font.text, fontSize: 14.5, lineHeight: 22, color: colors.mutedText },

  contactCard: {
    marginTop: spacing["2xl"],
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  contactTitle: { fontFamily: font.displaySemi, fontSize: 17, color: colors.onSurface, marginBottom: spacing.sm },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  contactBtnText: { fontFamily: font.textBold, fontSize: 15, color: colors.brand },
});
