import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "./useAppTheme";

const EmptyState = ({
  Icon,
  title,
  subtitle,
}: {
  Icon: any;
  title: string;
  subtitle: string;
}) => {

  const { colors: themeColors } = useAppTheme();

  
  const styles = createStyles(themeColors);
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

const createStyles = (themeColors: any) => StyleSheet.create({
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: themeColors.cardPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: themeColors.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtitle: {
    color: themeColors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
