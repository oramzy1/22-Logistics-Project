import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Text } from "../../components/AppText";
import {
  ChevronLeft,
  Bell,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  CheckCheck,
  CarFront,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  NotificationService,
  AppNotification,
} from "@/api/notification.service";
import { useAppTheme } from "@/src/ui/useAppTheme";

// Map our DB notification types to icons
function getIcon(type: string) {
  switch (type) {
    case "TRIP_STARTED":
      return <CarFront size={20} color="#4B5563" />;
    case "DRIVER_ASSIGNED":
      return <UserPlus size={20} color="#4B5563" />;
    case "PAYMENT_CONFIRMED":
      return <CreditCard size={20} color="#4B5563" />;
    case "BOOKING_COMPLETED":
      return <CheckCheck size={20} color="#10B981" />;
    case "TRIP_COMPLETED":
      return <CheckCircle size={20} color="#10B981" />;
    case "BOOKING_CANCELLED":
      return <AlertTriangle size={20} color="#F59E0B" />;
    case "LICENSE_STATUS":
      return <CheckCircle size={20} color="#3B82F6" />;
    default:
      return <Bell size={20} color="#4B5563" />;
  }
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<"All" | "Unread">("All");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);


  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await NotificationService.getAll();
      setNotifications(data);
    } catch {
      /* fail silently */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const displayed =
    activeTab === "Unread"
      ? notifications.filter((n) => !n.read)
      : notifications;
  const todayItems = displayed.filter((n) => isToday(n.createdAt));
  const olderItems = displayed.filter((n) => !isToday(n.createdAt));
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <ChevronLeft color="#D1D5DB" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
          <View style={{ width: 80 }} />
        </View>
        <ActivityIndicator style={{ marginTop: 60 }} color="#E4C77B" />
      </SafeAreaView>
    );
  }

  const renderItem = (item: AppNotification) => (
    <TouchableOpacity
      key={item.id}
      style={styles.notificationItem}
      onPress={() => handleMarkRead(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.iconBox}>{getIcon(item.type)}</View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {!item.read ? (
            <View style={styles.unreadDot} />
          ) : (
            <Text style={styles.itemRightText}>
              {relativeTime(item.createdAt)}
            </Text>
          )}
        </View>
        <Text
          style={
            item.type === "DRIVER_ASSIGNED"
              ? styles.itemLinkDesc
              : styles.itemDesc
          }
        >
          {item.body}
        </Text>
        {!item.read && (
          <Text style={styles.itemTime}>{relativeTime(item.createdAt)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color="#D1D5DB" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <TouchableOpacity
          style={styles.markReadBtn}
          onPress={handleMarkAllRead}
        >
          <CheckCheck color="#EF4444" size={16} style={{ marginRight: 4 }} />
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {(["All", "Unread"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "Unread" ? `Unread (${unreadCount})` : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          displayed.length === 0 && { flex: 1, justifyContent: "center" },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            colors={["#E4C77B"]}
          />
        }
      >
        {displayed.length === 0 ? (
          <View style={{ alignItems: "center", opacity: 0.4 }}>
            <Bell size={40} color="#9CA3AF" />
            <Text style={{ color: "#9CA3AF", marginTop: 12, fontSize: 14 }}>
              No notifications
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.summaryText}>
              You have{" "}
              <Text style={styles.summaryHighlight}>{unreadCount} unread</Text>{" "}
              notification{unreadCount !== 1 ? "s" : ""}
            </Text>

            {todayItems.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Today</Text>
                {todayItems.map(renderItem)}
              </>
            )}

            {olderItems.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                  Earlier
                </Text>
                {olderItems.map(renderItem)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Keep all existing styles — no changes needed there.
const createStyles = (themeColors: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: themeColors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: themeColors.navy,
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "android" ? 20 : 10,
      paddingBottom: 20,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { fontSize: 16, fontWeight: "600", color: themeColors.textPrimary },
    markReadBtn: { flexDirection: "row", alignItems: "center" },
    markReadText: { fontSize: 12, fontWeight: "600", color: "#EF4444" },
    tabsContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    tabBtn: { flex: 1, paddingVertical: 16, alignItems: "center" },
    activeTabBtn: { borderBottomWidth: 2, borderBottomColor: themeColors.text },
    tabText: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
    activeTabText: { color: themeColors.text, fontWeight: "700" },
    content: { padding: 20, paddingBottom: 60 },
    summaryText: { fontSize: 14, color: themeColors.textSecondary, marginBottom: 24 },
    summaryHighlight: { color: "#3B82F6", fontWeight: "bold" },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: themeColors.text,
      marginBottom: 16,
    },
    notificationItem: {
      flexDirection: "row",
      marginBottom: 24,
      alignItems: "flex-start",
    },
    iconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    itemContent: {
      flex: 1,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      paddingBottom: 16,
    },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    itemTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: themeColors.text,
      flex: 1,
      marginRight: 8,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#10B981",
    },
    itemRightText: { fontSize: 10, color: "#9CA3AF" },
    itemDesc: {
      fontSize: 12,
      color: themeColors.textSecondary,
      lineHeight: 18,
      marginBottom: 6,
    },
    itemLinkDesc: {
      fontSize: 12,
      color: "#3B82F6",
      lineHeight: 18,
      marginBottom: 6,
      fontWeight: "500",
    },
    itemTime: { fontSize: 10, color: "#9CA3AF" },
  });
