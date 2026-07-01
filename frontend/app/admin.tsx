import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import PressableScale from "@/src/components/PressableScale";
import { colors, spacing, radius, font } from "@/src/theme/theme";
import { verifyPin } from "@/src/utils/api";

const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

export default function Admin() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const shake = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const triggerError = () => {
    setError(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    setTimeout(() => {
      setPin("");
      setError(false);
    }, 600);
  };

  const submit = async (value: string) => {
    setChecking(true);
    try {
      const ok = await verifyPin(value);
      if (ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace({ pathname: "/leads", params: { pin: value } });
      } else {
        triggerError();
      }
    } catch {
      triggerError();
    } finally {
      setChecking(false);
    }
  };

  const onKey = (k: string) => {
    if (checking) return;
    Haptics.selectionAsync();
    if (k === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + k;
    setPin(next);
    if (next.length === PIN_LENGTH) submit(next);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]} testID="admin-screen">
      <View style={styles.header}>
        <PressableScale testID="admin-back-button" style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </PressableScale>
      </View>

      <View style={styles.top}>
        <View style={styles.lockCircle}>
          <Ionicons name="lock-closed" size={30} color={colors.brand} />
        </View>
        <Text style={styles.title}>Admin Access</Text>
        <Text style={styles.sub}>Enter your 4-digit PIN to view leads</Text>

        <Animated.View style={[styles.dots, shakeStyle]}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <View
              key={i}
              testID={`pin-dot-${i}`}
              style={[
                styles.dot,
                i < pin.length && styles.dotFilled,
                error && styles.dotError,
              ]}
            />
          ))}
        </Animated.View>
        {error && <Text style={styles.errorText} testID="pin-error">Incorrect PIN</Text>}
      </View>

      <View style={[styles.pad, { paddingBottom: insets.bottom + spacing.xl }]}>
        {KEYS.map((k, i) => {
          if (k === "") return <View key={i} style={styles.keyBtn} />;
          return (
            <PressableScale
              key={i}
              testID={k === "del" ? "pin-key-delete" : `pin-key-${k}`}
              scaleTo={0.9}
              style={styles.keyBtn}
              onPress={() => onKey(k)}
            >
              {k === "del" ? (
                <Ionicons name="backspace-outline" size={26} color={colors.onSurface} />
              ) : (
                <Text style={styles.keyText}>{k}</Text>
              )}
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const KEY_SIZE = 74;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, height: 48, justifyContent: "center" },
  iconBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  top: { flex: 1, alignItems: "center", justifyContent: "center" },
  lockCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { fontFamily: font.displayBold, fontSize: 24, color: colors.onSurface },
  sub: { fontFamily: font.text, fontSize: 14, color: colors.mutedText, marginTop: 4 },
  dots: { flexDirection: "row", gap: spacing.lg, marginTop: spacing["2xl"] },
  dot: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  dotFilled: { backgroundColor: colors.brand, borderColor: colors.brand },
  dotError: { borderColor: colors.error },
  errorText: { fontFamily: font.textBold, fontSize: 14, color: colors.error, marginTop: spacing.lg },

  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  keyBtn: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: { fontFamily: font.displayBold, fontSize: 28, color: colors.onSurface },
});
