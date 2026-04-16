import { StyleSheet, Text, View } from "react-native";

const EmptyState = ({
  Icon,
  title,
  subtitle,
}: {
  Icon: any;
  title: string;
  subtitle: string;
}) => {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconCircle}>
        <Icon size={40} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
