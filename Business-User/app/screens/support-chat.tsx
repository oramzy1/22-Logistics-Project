import React, { useEffect, useState, useRef } from "react";
import {
  View, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Send } from "lucide-react-native";
import { Text } from "../../components/AppText";
import { AppHeader } from "@/src/ui/AppHeader";
import { UserService } from "@/api/user.service";
import { useAuth } from "@/context/AuthContext";
import { useAppTheme } from "@/src/ui/useAppTheme";
import { showToast } from "@/app/utils/toast";
import { spacing, radius } from "@/src/ui/theme";
import { socketService } from "@/api/socket.service";
// import { format } from "date-fns";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
};

export default function SupportChatScreen() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const { colors: themeColors } = useAppTheme();
  const styles = createChatStyles(themeColors);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

useEffect(() => {
  if (!ticketId) return;

  socketService.joinTicket(ticketId);

  const unsubMessage = socketService.onSupportMessage(({ ticketId: incomingId, message }) => {
    if (incomingId !== ticketId) return;
    setMessages((prev) =>
      prev.find((m) => m.id === message.id) ? prev : [...prev, message]
    );
  });

  // ← Add this: reflect status changes from admin immediately
  const unsubUpdated = socketService.onSupportTicketUpdated((updated) => {
    if (updated.ticketId !== ticketId && updated.id !== ticketId) return;
    setTicket((prev: any) => ({
      ...prev,
      status: updated.status ?? prev?.status,
      priority: updated.priority ?? prev?.priority,
    }));
  });

  return () => {
    unsubMessage();
    unsubUpdated();
    socketService.leaveTicket(ticketId);
  };
}, [ticketId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const data = await UserService.getTicketById(ticketId);
      setTicket(data);
      setMessages(data.messages ?? []);
    } catch {
      showToast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!reply.trim() || ticket?.status === "CLOSED") return;
    const body = reply;
    setReply("");
    setSending(true);
    try {
      const data = await UserService.sendTicketMessage(ticketId, body);
      const msg = data.message ?? data;
      setMessages((prev) =>
        prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
    } catch {
      setReply(body); // restore on failure
      showToast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const isClosed = ticket?.status === "CLOSED";

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <AppHeader title={ticket?.ticketId ?? "Support Chat"} showBack />

      {/* Ticket subject banner */}
      {ticket && (
        <View style={styles.subjectBanner}>
          <Text style={styles.subjectText} numberOfLines={1}>
            {ticket.subject}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: STATUS_BG[ticket.status] ?? "#F3F4F6" }
          ]}>
            <Text style={[
              styles.statusText,
              { color: STATUS_TEXT[ticket.status] ?? "#6B7280" }
            ]}>
              {ticket.status.replace("_", " ")}
            </Text>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={themeColors.text} />
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => {
              const isMe = !msg.isAdmin; // user = not admin
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.bubble,
                    isMe ? styles.bubbleRight : styles.bubbleLeft,
                  ]}
                >
                  {!isMe && (
                    <View style={styles.adminAvatar}>
                      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                        S
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubbleInner,
                      isMe ? styles.bubbleInnerRight : styles.bubbleInnerLeft,
                    ]}
                  >
                    {!isMe && (
                      <Text style={styles.senderLabel}>Support Team</Text>
                    )}
                    <Text style={[
                      styles.msgText,
                      { color: isMe ? "#3E2723" : themeColors.text }
                    ]}>
                      {msg.body}
                    </Text>
                    <Text style={[
                      styles.msgTime,
                      { textAlign: isMe ? "right" : "left" }
                    ]}>
                      {msg.createdAt
                        ? formatDate(msg.createdAt)
                        : ""}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Input */}
        <View style={[
          styles.inputRow,
          { borderTopColor: themeColors.border },
          isClosed && { opacity: 0.5 }
        ]}>
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
            placeholder={isClosed ? "This ticket is closed" : "Type a message..."}
            placeholderTextColor="#9CA3AF"
            value={reply}
            onChangeText={setReply}
            multiline
            editable={!isClosed && !sending}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!reply.trim() || isClosed || sending) && { opacity: 0.4 },
            ]}
            onPress={handleSend}
            disabled={!reply.trim() || isClosed || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#3E2723" />
            ) : (
              <Send size={18} color="#3E2723" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const STATUS_BG: Record<string, string> = {
  OPEN: "#DBEAFE", IN_PROGRESS: "#FEF3C7", RESOLVED: "#D1FAE5", CLOSED: "#F3F4F6",
};
const STATUS_TEXT: Record<string, string> = {
  OPEN: "#1D4ED8", IN_PROGRESS: "#92400E", RESOLVED: "#065F46", CLOSED: "#6B7280",
};

const createChatStyles = (themeColors: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: themeColors.background },
    subjectBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      backgroundColor: themeColors.card,
    },
    subjectText: { fontSize: 13, fontWeight: "600", color: themeColors.text, flex: 1, marginRight: 8 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: "700" },
    messages: { padding: spacing.lg, gap: 12, paddingBottom: 24 },
    bubble: { flexDirection: "row", alignItems: "flex-end", marginBottom: 4 },
    bubbleRight: { justifyContent: "flex-end" },
    bubbleLeft: { justifyContent: "flex-start", gap: 8 },
    adminAvatar: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: "#0B1B2B",
      alignItems: "center", justifyContent: "center",
    },
    bubbleInner: { maxWidth: "75%", borderRadius: 16, padding: 12 },
    bubbleInnerRight: {
      backgroundColor: "#E4C77B",
      borderBottomRightRadius: 4,
    },
    bubbleInnerLeft: {
      backgroundColor: themeColors.card,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderBottomLeftRadius: 4,
    },
    senderLabel: { fontSize: 10, fontWeight: "700", color: "#6B7280", marginBottom: 4 },
    msgText: { fontSize: 14, lineHeight: 20 },
    msgTime: { fontSize: 10, color: "#9CA3AF", marginTop: 4 },
    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
      padding: spacing.md,
      borderTopWidth: 1,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: radius.lg,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      maxHeight: 100,
      backgroundColor: themeColors.card,
    },
    sendBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: "#E4C77B",
      alignItems: "center", justifyContent: "center",
    },
  });