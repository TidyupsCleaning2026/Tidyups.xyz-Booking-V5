import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

import PressableScale from "@/src/components/PressableScale";
import { colors, spacing, radius, font, shadow, STATUS_COLORS } from "@/src/theme/theme";
import { listLeads, updateLeadStatus, Lead } from "@/src/utils/api";

const FILTERS = ["All", "New", "Contacted", "Booked", "Closed"] as const;
const STATUSES: Lead["status"][] = ["New", "Contacted", "Booked", "Closed"];

export default function Leads() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { pin } = useLocalSearchParams<{ pin: string }>();
  const adminPin = typeof pin === "string" ? pin : "";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [updating, setUpdating] = useState(false);

  const sheetRef = useRef<BottomSheet>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await listLeads(adminPin);
      setLeads(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load leads");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [adminPin]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => (filter === "All" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: leads.length };
    STATUSES.forEach((s) => (c[s] = leads.filter((l) => l.status === s).length));
    return c;
  }, [leads]);

  const openDetail = (lead: Lead) => {
    setSelected(lead);
    setTimeout(() => sheetRef.current?.snapToIndex(0), 10);
  };

  const changeStatus = async (status: Lead["status"]) => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUpdating(true);
    try {
      const updated = await updateLeadStatus(selected.id, status, adminPin);
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setSelected(updated);
    } catch {
      // ignore, keep previous
    } finally {
      setUpdating(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />,
    []
  );

  return (
    <View style={styles.root} testID="leads-screen">
      {/* Sticky header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <PressableScale testID="leads-back-button" style={styles.iconBtn} onPress={() => router.replace("/")}>
            <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
          </PressableScale>
          <Text style={styles.headerTitle}>Leads</Text>
          <PressableScale testID="leads-refresh-button" style={styles.iconBtn} onPress={load}>
            <Ionicons name="refresh" size={22} color={colors.onSurface} />
          </PressableScale>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <PressableScale
                key={f}
                testID={`filter-chip-${f.toLowerCase()}`}
                scaleTo={0.95}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilter(f);
                }}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {f} {counts[f] ? `(${counts[f]})` : ""}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : error ? (
        <View style={styles.centerFill}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.mutedText} />
          <Text style={styles.emptyTitle}>Couldn&apos;t load leads</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <PressableScale testID="leads-retry-button" style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </PressableScale>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerFill}>
          <Ionicons name="file-tray-outline" size={48} color={colors.mutedText} />
          <Text style={styles.emptyTitle}>No leads yet</Text>
          <Text style={styles.emptySub}>New quote requests will show up here!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: insets.bottom + spacing.xl }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.brand}
            />
          }
          renderItem={({ item }) => <LeadCard lead={item} onPress={() => openDetail(item)} />}
        />
      )}

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={["70%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.borderStrong }}
        backgroundStyle={{ backgroundColor: colors.surfaceSecondary }}
        onClose={() => setSelected(null)}
      >
        <BottomSheetView style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
          {selected && (
            <>
              <Text style={styles.sheetName} testID="lead-detail-name">{selected.name}</Text>
              <View style={styles.statusPillWrap}>
                <StatusPill status={selected.status} />
                <Text style={styles.sheetDate}>{formatDate(selected.created_at)}</Text>
              </View>

              <View style={styles.detailGrid}>
                <DetailRow icon="construct-outline" label="Service" value={selected.service_type} />
                <DetailRow icon="business-outline" label="Property" value={selected.property_type} />
                <DetailRow icon="bed-outline" label="Beds / Baths" value={`${selected.bedrooms} bed · ${selected.bathrooms} bath`} />
                <DetailRow icon="location-outline" label="Address" value={selected.address} />
                {!!selected.message && <DetailRow icon="chatbubble-outline" label="Message" value={selected.message} />}
              </View>

              <View style={styles.contactRow}>
                <PressableScale
                  testID="lead-call-button"
                  style={styles.contactBtn}
                  onPress={() => Linking.openURL(`tel:${selected.phone}`)}
                >
                  <Ionicons name="call" size={18} color={colors.brand} />
                  <Text style={styles.contactText}>{selected.phone}</Text>
                </PressableScale>
                <PressableScale
                  testID="lead-email-button"
                  style={styles.contactBtn}
                  onPress={() => Linking.openURL(`mailto:${selected.email}`)}
                >
                  <Ionicons name="mail" size={18} color={colors.brand} />
                  <Text style={styles.contactText} numberOfLines={1}>Email</Text>
                </PressableScale>
              </View>

              <Text style={styles.sheetLabel}>Update Status</Text>
              <View style={styles.segment}>
                {STATUSES.map((s) => {
                  const active = selected.status === s;
                  return (
                    <PressableScale
                      key={s}
                      testID={`status-option-${s.toLowerCase()}`}
                      scaleTo={0.95}
                      disabled={updating}
                      style={[styles.segItem, active && { backgroundColor: STATUS_COLORS[s].bg }]}
                      onPress={() => changeStatus(s)}
                    >
                      <Text style={[styles.segText, active && { color: STATUS_COLORS[s].fg, fontFamily: font.textBold }]}>
                        {s}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

function LeadCard({ lead, onPress }: { lead: Lead; onPress: () => void }) {
  return (
    <PressableScale testID={`lead-card-${lead.id}`} scaleTo={0.98} style={styles.card} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardName}>{lead.name}</Text>
        <Text style={styles.cardMeta}>{lead.service_type} · {lead.property_type}</Text>
        <Text style={styles.cardPhone}>{lead.phone}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: spacing.sm }}>
        <StatusPill status={lead.status} />
        <Text style={styles.cardDate}>{formatDate(lead.created_at)}</Text>
      </View>
    </PressableScale>
  );
}

function StatusPill({ status }: { status: Lead["status"] }) {
  const c = STATUS_COLORS[status];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]} testID={`status-pill-${status.toLowerCase()}`}>
      <Text style={[styles.pillText, { color: c.fg }]}>{status}</Text>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={18} color={colors.brand} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " · " +
      d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  iconBtn: { width: 40, height: 40, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: font.displayBold, fontSize: 20, color: colors.onSurface },

  filterRow: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  filterChip: {
    flexShrink: 0,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.onSurface, borderColor: colors.onSurface },
  filterText: { fontFamily: font.textSemi, fontSize: 13, color: colors.mutedText },
  filterTextActive: { color: colors.surface },

  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { fontFamily: font.displaySemi, fontSize: 18, color: colors.onSurface, marginTop: spacing.sm },
  emptySub: { fontFamily: font.text, fontSize: 14, color: colors.mutedText, textAlign: "center" },
  retryBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  retryText: { color: colors.onBrandPrimary, fontFamily: font.textBold, fontSize: 15 },

  card: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  cardName: { fontFamily: font.displaySemi, fontSize: 16, color: colors.onSurface },
  cardMeta: { fontFamily: font.text, fontSize: 13, color: colors.mutedText, marginTop: 2 },
  cardPhone: { fontFamily: font.textSemi, fontSize: 13, color: colors.onSurface, marginTop: 4 },
  cardDate: { fontFamily: font.text, fontSize: 11, color: colors.mutedText },

  pill: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { fontFamily: font.textBold, fontSize: 12 },

  sheet: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  sheetName: { fontFamily: font.displayBold, fontSize: 24, color: colors.onSurface },
  statusPillWrap: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  sheetDate: { fontFamily: font.text, fontSize: 13, color: colors.mutedText },

  detailGrid: { marginTop: spacing.xl, gap: spacing.lg },
  detailRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  detailLabel: { fontFamily: font.textSemi, fontSize: 12, color: colors.mutedText },
  detailValue: { fontFamily: font.textSemi, fontSize: 15, color: colors.onSurface, marginTop: 1 },

  contactRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  contactText: { fontFamily: font.textBold, fontSize: 14, color: colors.brand },

  sheetLabel: { fontFamily: font.textBold, fontSize: 14, color: colors.onSurface, marginTop: spacing.xl, marginBottom: spacing.sm },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segItem: { flex: 1, alignItems: "center", paddingVertical: spacing.md, borderRadius: radius.sm },
  segText: { fontFamily: font.textSemi, fontSize: 12.5, color: colors.mutedText },
});
