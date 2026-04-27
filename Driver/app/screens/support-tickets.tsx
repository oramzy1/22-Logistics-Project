import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Send, ChevronRight, MessageCircle } from "lucide-react-native";
import { Text } from "../../components/AppText";
import { AppHeader } from "@/src/ui/AppHeader";
import { UserService } from "@/api/user.service";
import { useAppTheme } from "@/src/ui/useAppTheme";
import { showToast } from "@/app/utils/toast";
import { spacing, radius } from "@/src/ui/theme";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  OPEN:        { bg: "#DBEAFE", text: "#1D4ED8" },
  IN_PROGRESS: { bg: "#FEF3C7", text: "#92400E" },
  RESOLVED:    { bg: "#D1FAE5", text: "#065F46" },
  CLOSED:      { bg: "#F3F4F6", text: "#6B7280" },
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
};

// ── Ticket List Screen ─────────────────────────────────────────
export default function SupportTicketsScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors: themeColors } = useAppTheme();
  const styles = createListStyles(themeColors);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await UserService.getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      showToast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <AppHeader title="My Support Tickets" showBack />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={themeColors.text} />
      ) : tickets.length === 0 ? (
        <View style={styles.empty}>
          <MessageCircle size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No tickets yet</Text>
          <Text style={styles.emptySub}>
            Use the Help Center to submit a support request
          </Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: spacing.lg }}
          renderItem={({ item }) => {
            const statusStyle = STATUS_COLORS[item.status] ?? STATUS_COLORS.OPEN;
            const lastMsg = item.messages?.[0];
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/screens/support-chat",
                    params: { ticketId: item.id },
                  })
                }
              >
                <View style={styles.cardTop}>
                  <Text style={styles.ticketId}>{item.ticketId}</Text>
                  <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                      {item.status.replace("_", " ")}
                    </Text>
                  </View>
                </View>
                <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
                {lastMsg && (
                  <Text style={styles.preview} numberOfLines={1}>
                    {lastMsg.isAdmin ? "Support: " : "You: "}{lastMsg.body}
                  </Text>
                )}
                <View style={styles.cardBottom}>
                  <Text style={styles.date}>
                    {formatDate(item.createdAt)}
                  </Text>
                  <ChevronRight size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const createListStyles = (themeColors: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: themeColors.background },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyText: { fontSize: 16, fontWeight: "700", color: themeColors.text },
    emptySub: { fontSize: 13, color: "#6B7280", textAlign: "center", paddingHorizontal: 40 },
    card: {
      backgroundColor: themeColors.card,
      borderRadius: radius.lg,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    ticketId: { fontSize: 12, fontWeight: "700", color: "#6B7280" },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: "700" },
    subject: { fontSize: 15, fontWeight: "700", color: themeColors.text, marginBottom: 4 },
    preview: { fontSize: 13, color: "#6B7280", marginBottom: 8 },
    cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    date: { fontSize: 11, color: "#9CA3AF" },
  });