import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import PressableScale from "@/src/components/PressableScale";
import { colors, spacing, radius, font, shadow } from "@/src/theme/theme";
import { createLead, LeadInput } from "@/src/utils/api";

const SERVICE_TYPES = ["Standard Cleaning", "Deep Cleaning", "Move In Cleaning", "Move Out Cleaning"];
const PROPERTY_TYPES = ["House", "Flat/Apartment", "Studio", "Office"];

const CTA_HEIGHT = 92;

export default function Quote() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string }>();

  const [serviceType, setServiceType] = useState<string>(
    typeof params.service === "string" && SERVICE_TYPES.includes(params.service) ? params.service : ""
  );
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!serviceType) return "Please choose a service type.";
    if (!propertyType) return "Please choose a property type.";
    if (!name.trim()) return "Please enter your name.";
    if (!/^[\d+\-()\s]{7,}$/.test(phone.trim())) return "Please enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Please enter a valid email.";
    if (!address.trim()) return "Please enter your address.";
    return null;
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) {
      setError(v);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError(null);
    setSubmitting(true);
    const payload: LeadInput = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      service_type: serviceType,
      property_type: propertyType,
      bedrooms,
      bathrooms,
      address: address.trim(),
      message: message.trim(),
    };
    try {
      await createLead(payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/success");
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root} testID="quote-screen">
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale testID="quote-back-button" style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </PressableScale>
        <Text style={styles.headerTitle}>Free Quote</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAwareScrollView
        bottomOffset={CTA_HEIGHT + spacing.md}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + CTA_HEIGHT + spacing.xl }}
      >
        {/* Service type */}
        <Text style={styles.label}>Service Type</Text>
        <View style={{ gap: spacing.sm }}>
          {SERVICE_TYPES.map((s) => {
            const active = serviceType === s;
            return (
              <PressableScale
                key={s}
                testID={`service-option-${s.replace(/\s+/g, "-").toLowerCase()}`}
                scaleTo={0.97}
                style={[styles.serviceRow, active && styles.serviceRowActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setServiceType(s);
                }}
              >
                <Ionicons
                  name={active ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={active ? colors.brand : colors.borderStrong}
                />
                <Text style={[styles.serviceText, active && styles.serviceTextActive]}>{s}</Text>
              </PressableScale>
            );
          })}
        </View>

        {/* Property type */}
        <Text style={[styles.label, { marginTop: spacing.xl }]}>Property Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {PROPERTY_TYPES.map((p) => {
            const active = propertyType === p;
            return (
              <PressableScale
                key={p}
                testID={`property-chip-${p.replace(/[\s/]+/g, "-").toLowerCase()}`}
                scaleTo={0.95}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setPropertyType(p);
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{p}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* Steppers */}
        <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.xl }}>
          <Stepper label="Bedrooms" icon="bed-outline" value={bedrooms} setValue={setBedrooms} min={0} testID="bedrooms" />
          <Stepper label="Bathrooms" icon="water-outline" value={bathrooms} setValue={setBathrooms} min={0} testID="bathrooms" />
        </View>

        {/* Text inputs */}
        <Field label="Full Name" value={name} onChangeText={setName} placeholder="Jane Doe" testID="name" autoCapitalize="words" />
        <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+1 555 123 4567" testID="phone" keyboardType="phone-pad" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="jane@email.com" testID="email" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Address" value={address} onChangeText={setAddress} placeholder="123 Main St, City" testID="address" />
        <Field
          label="Message (optional)"
          value={message}
          onChangeText={setMessage}
          placeholder="Anything we should know?"
          testID="message"
          multiline
        />

        {error && (
          <Animated.View entering={FadeIn} style={styles.errorBox} testID="quote-error">
            <Ionicons name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        )}

        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteText}>
            By submitting, you agree we may contact you about your quote. See our{" "}
          </Text>
          <PressableScale testID="quote-privacy-link" haptic={false} scaleTo={0.98} onPress={() => router.push("/privacy")}>
            <Text style={styles.privacyNoteLink}>Privacy Policy</Text>
          </PressableScale>
        </View>
      </KeyboardAwareScrollView>

      {/* Sticky CTA */}
      <KeyboardStickyView>
        <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <PressableScale
            testID="quote-submit-button"
            disabled={submitting}
            style={[styles.ctaBtn, submitting && { opacity: 0.7 }]}
            onPress={onSubmit}
          >
            <Text style={styles.ctaText}>{submitting ? "Sending..." : "Submit Request"}</Text>
            {!submitting && <Ionicons name="paper-plane" size={18} color={colors.onBrandPrimary} />}
          </PressableScale>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

function Stepper({
  label,
  icon,
  value,
  setValue,
  min,
  testID,
}: {
  label: string;
  icon: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  testID: string;
}) {
  const change = (d: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setValue(Math.max(min, value + d));
  };
  return (
    <View style={styles.stepperCard} testID={`stepper-${testID}`}>
      <View style={styles.stepperHead}>
        <Ionicons name={icon as any} size={16} color={colors.brand} />
        <Text style={styles.stepperLabel}>{label}</Text>
      </View>
      <View style={styles.stepperControls}>
        <PressableScale testID={`stepper-${testID}-minus`} style={styles.stepBtn} onPress={() => change(-1)}>
          <Ionicons name="remove" size={22} color={colors.onSurface} />
        </PressableScale>
        <Text style={styles.stepValue} testID={`stepper-${testID}-value`}>{value}</Text>
        <PressableScale testID={`stepper-${testID}-plus`} style={styles.stepBtn} onPress={() => change(1)}>
          <Ionicons name="add" size={22} color={colors.onSurface} />
        </PressableScale>
      </View>
    </View>
  );
}

function Field({
  label,
  testID,
  multiline,
  ...rest
}: { label: string; testID: string; multiline?: boolean } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        testID={`input-${testID}`}
        placeholderTextColor={colors.mutedText}
        style={[styles.input, multiline && styles.inputMulti]}
        multiline={multiline}
        {...rest}
      />
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

  label: { fontFamily: font.textBold, fontSize: 14, color: colors.onSurface, marginBottom: spacing.sm },

  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  serviceRowActive: { borderColor: colors.brand, backgroundColor: colors.surfaceTertiary },
  serviceText: { fontFamily: font.textSemi, fontSize: 15, color: colors.onSurface },
  serviceTextActive: { color: colors.onSurfaceTertiary, fontFamily: font.textBold },

  chipRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: {
    flexShrink: 0,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontFamily: font.textSemi, fontSize: 14, color: colors.onSurface },
  chipTextActive: { color: colors.onBrandPrimary },

  stepperCard: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.soft,
  },
  stepperHead: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.md },
  stepperLabel: { fontFamily: font.textBold, fontSize: 13, color: colors.onSurface },
  stepperControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: { fontFamily: font.displayBold, fontSize: 22, color: colors.onSurface, minWidth: 30, textAlign: "center" },

  input: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: font.text,
    fontSize: 15,
    color: colors.onSurface,
    minHeight: 52,
  },
  inputMulti: { minHeight: 96, textAlignVertical: "top", paddingTop: spacing.md },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#FEF2F2",
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  errorText: { flex: 1, fontFamily: font.textSemi, fontSize: 13, color: colors.error },

  privacyNote: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  privacyNoteText: { fontFamily: font.text, fontSize: 12.5, color: colors.mutedText, textAlign: "center" },
  privacyNoteLink: {
    fontFamily: font.textBold,
    fontSize: 12.5,
    color: colors.brand,
    textDecorationLine: "underline",
  },

  ctaBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
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
