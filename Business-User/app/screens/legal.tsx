import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Text } from "../../components/AppText";
import { AppHeader } from "@/src/ui/AppHeader";
import { useAppTheme } from "@/src/ui/useAppTheme";
import { getLegalDocument } from "@/src/data/legalDocuments";

export default function LegalScreen() {
  const params = useLocalSearchParams<{ doc?: string }>();
  const docId = Array.isArray(params.doc) ? params.doc[0] : params.doc;
  const legalDoc = getLegalDocument(docId);
  const { colors: themeColors } = useAppTheme();
  const styles = createStyles(themeColors);

  return (
    <SafeAreaView edges={["top"]} style={styles.root}>
      <AppHeader title={legalDoc.title} showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.docTitle}>{legalDoc.title}</Text>
        {legalDoc.effectiveDate ? (
          <Text style={styles.effectiveDate}>
            {`Effective Date: ${legalDoc.effectiveDate}`}
          </Text>
        ) : null}
        {legalDoc.intro ? (
          <Text style={styles.intro}>{legalDoc.intro}</Text>
        ) : null}

        {legalDoc.sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {section.heading ? (
              <Text style={styles.heading}>{section.heading}</Text>
            ) : null}
            {section.blocks.map((block, blockIndex) => {
              if (block.kind === "subheading") {
                return (
                  <Text key={blockIndex} style={styles.subheading}>
                    {block.text}
                  </Text>
                );
              }
              if (block.kind === "bullets") {
                return (
                  <View key={blockIndex} style={styles.bulletGroup}>
                    {block.items.map((item, itemIndex) => (
                      <View key={itemIndex} style={styles.bulletRow}>
                        <View style={styles.bulletDot} />
                        <Text style={styles.bulletText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                );
              }
              return (
                <Text key={blockIndex} style={styles.paragraph}>
                  {block.text}
                </Text>
              );
            })}
          </View>
        ))}

        <Text style={styles.footer}>
          {`© ${new Date().getFullYear()} 22 Logistics. All rights reserved.`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (themeColors: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: themeColors.background },
    content: { padding: 20, paddingBottom: 60 },
    docTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: themeColors.text,
      marginBottom: 6,
    },
    effectiveDate: {
      fontSize: 12,
      color: themeColors.muted,
      marginBottom: 16,
    },
    intro: {
      fontSize: 14,
      lineHeight: 22,
      color: themeColors.textSecondary,
      marginBottom: 4,
    },
    section: { marginTop: 22 },
    heading: {
      fontSize: 15,
      fontWeight: "700",
      color: themeColors.text,
      marginBottom: 8,
    },
    subheading: {
      fontSize: 13,
      fontWeight: "700",
      color: themeColors.textSecondary,
      marginTop: 10,
      marginBottom: 6,
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 22,
      color: themeColors.textSecondary,
      marginBottom: 8,
    },
    bulletGroup: { marginBottom: 4 },
    bulletRow: { flexDirection: "row", marginBottom: 6 },
    bulletDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: themeColors.gold,
      marginTop: 8,
      marginRight: 10,
    },
    bulletText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      color: themeColors.textSecondary,
    },
    footer: {
      marginTop: 32,
      textAlign: "center",
      fontSize: 11,
      color: themeColors.muted,
    },
  });
