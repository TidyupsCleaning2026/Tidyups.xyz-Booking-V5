import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import PressableScale from "@/src/components/PressableScale";
import { colors, spacing, radius, font, shadow } from "@/src/theme/theme";

export function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.root} testID="error-boundary-fallback">
      <View style={styles.iconCircle}>
        <Ionicons name="sad-outline" size={40} color={colors.brand} />
      </View>
      <Text style={styles.title}>Oops, something went wrong</Text>
      <Text style={styles.sub}>
        We hit an unexpected hiccup. Give it another go — your info is safe.
      </Text>
      <PressableScale testID="error-boundary-retry-button" style={styles.btn} onPress={onRetry}>
        <Ionicons name="refresh" size={18} color={colors.onBrandPrimary} />
        <Text style={styles.btnText}>Try Again</Text>
      </PressableScale>
    </View>
  );
}

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.log("AppErrorBoundary caught:", error?.message);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.reset} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  title: { fontFamily: font.displayBold, fontSize: 22, color: colors.onSurface, textAlign: "center" },
  sub: {
    fontFamily: font.text,
    fontSize: 15,
    lineHeight: 22,
    color: colors.mutedText,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    height: 54,
    paddingHorizontal: spacing["2xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    ...shadow.card,
  },
  btnText: { color: colors.onBrandPrimary, fontFamily: font.displayBold, fontSize: 17 },
});
