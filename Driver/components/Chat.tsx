import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send, X } from "lucide-react-native";
import { Text } from "./AppText";
import { AppHeader } from "@/src/ui/AppHeader";
import { socketService } from "@/api/socket.service";
import { useAppTheme } from "@/src/ui/useAppTheme";
import { spacing, radius } from "@/src/ui/theme";

type Message = {
  id: string;
  message: string;
  sender: string;
  senderId: string;
  bookingId: string;
  timestamp: string;
};

type Props = {
  bookingId: string;
  currentUserId: string;
  currentUserName: string;
  targetUserId: string;
  targetUserName: string;
  onClose: () => void;
};

const formatTime = (ts: string) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function Chat({
  bookingId,
  currentUserId,
  currentUserName,
  targetUserId,
  targetUserName,
  onClose,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  useEffect(() => {
    socketService.joinTripChat(bookingId);

    const unsubNew = socketService.onTripMessage((data) => {
      if (data.bookingId !== bookingId) return;
      setMessages((prev) => {
        // Deduplicate by timestamp+senderId
        const isDupe = prev.some(
          (m) => m.timestamp === data.timestamp && m.senderId === data.senderId,
        );
        return isDupe
          ? prev
          : [...prev, { ...data, id: `${data.senderId}-${data.timestamp}` }];
      });
    });

    // Confirm sent message echoed back
    const unsubSent = socketService.onTripMessageSent((data) => {
      if (data.bookingId !== bookingId) return;
      setMessages((prev) => {
        const isDupe = prev.some(
          (m) => m.timestamp === data.timestamp && m.senderId === data.senderId,
        );
        return isDupe
          ? prev
          : [...prev, { ...data, id: `${data.senderId}-${data.timestamp}` }];
      });
    });

    return () => {
      unsubNew();
      unsubSent();
      socketService.leaveTripChat(bookingId);
    };
  }, [bookingId]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!reply.trim() || sending) return;
    setSending(true);
    const body = reply.trim();
    setReply("");

    socketService.sendTripMessage({
      targetUserId,
      message: body,
      sender: currentUserName,
      senderId: currentUserId,
      bookingId,
    });

    setSending(false);
  }, [reply, sending, targetUserId, currentUserName, currentUserId, bookingId]);

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {targetUserName?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <View>
            <Text style={styles.headerName}>{targetUserName}</Text>
            <Text style={styles.headerSub}>Trip Chat · In Progress</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <X size={20} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySub}>
                Send a message to {targetUserName}
              </Text>
            </View>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <View
                key={msg.id}
                style={[
                  styles.bubble,
                  isMe ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                {!isMe && (
                  <View style={styles.remoteAvatar}>
                    <Text style={styles.remoteAvatarText}>
                      {msg.sender?.charAt(0)?.toUpperCase() ?? "?"}
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
                    <Text style={styles.senderLabel}>{msg.sender}</Text>
                  )}
                  <Text
                    style={[
                      styles.msgText,
                      { color: isMe ? "#3E2723" : themeColors.text },
                    ]}
                  >
                    {msg.message}
                  </Text>
                  <Text
                    style={[
                      styles.msgTime,
                      { textAlign: isMe ? "right" : "left" },
                    ]}
                  >
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputRow, { borderTopColor: themeColors.border }]}>
          <TextInput
            style={[
              styles.input,
              { color: themeColors.text, borderColor: themeColors.border },
            ]}
            placeholder={`Message ${targetUserName}...`}
            placeholderTextColor="#9CA3AF"
            value={reply}
            onChangeText={setReply}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!reply.trim() || sending) && { opacity: 0.4 },
            ]}
            onPress={handleSend}
            disabled={!reply.trim() || sending}
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

const createStyles = (themeColors: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: themeColors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
      backgroundColor: themeColors.card,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#0B1B2B",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: { color: "#E4C77B", fontSize: 16, fontWeight: "800" },
    headerName: { fontSize: 15, fontWeight: "700", color: themeColors.text },
    headerSub: { fontSize: 11, color: "#10B981", marginTop: 2 },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: themeColors.cardSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    messages: { padding: spacing.lg, gap: 8, paddingBottom: 16 },
    emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyText: { fontSize: 15, fontWeight: "600", color: themeColors.text },
    emptySub: { fontSize: 13, color: "#6B7280" },
    bubble: { flexDirection: "row", alignItems: "flex-end", marginBottom: 4 },
    bubbleRight: { justifyContent: "flex-end" },
    bubbleLeft: { justifyContent: "flex-start", gap: 8 },
    remoteAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: "#0B1B2B",
      alignItems: "center",
      justifyContent: "center",
    },
    remoteAvatarText: { color: "#E4C77B", fontSize: 11, fontWeight: "700" },
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
    senderLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: "#6B7280",
      marginBottom: 4,
    },
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
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#E4C77B",
      alignItems: "center",
      justifyContent: "center",
    },
  });
