import { Text } from "@/components/AppText";
import { SwipeSlider } from "@/src/ui/SliderButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Simple Scheduling\nMade Easy",
    highlight: "Scheduling",
    description:
      "Easily book your ride for any occasion, whether it's a quick trip or a day out.",
    image: require("../../assets/images/slides/Slide1.png"),
  },
  {
    id: "2",
    title: "Travel on\nYour Terms",
    highlight: "Your Terms",
    description:
      "Flexible scheduling and reliable rides at your fingertips. Wherever you go, we'll take you there.",
    image: require("../../assets/images/slides/Slide2.png"),
  },
  {
    id: "3",
    title: "Quick, Easy,\nReliable",
    highlight: "Quick, Easy,",
    description:
      "Seamlessly schedule your ride and enjoy a smooth journey - anytime, anywhere.",
    image: require("../../assets/images/slides/Slide3.png"),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<FlatList>(null);
  const router = useRouter();
  const [hasLaunched, setHasLaunched] = useState<Boolean | null>(null);

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  useEffect(() => {
    const checkLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem("hasLaunched");
        setHasLaunched(value === "true");
      } catch (e) {
        console.error("Error reading launch flag", e);
        setHasLaunched(false);
      }
    };
    checkLaunch();
  }, []);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push("/(auth)/account-type");
      AsyncStorage.setItem("hasLaunched", "true").catch((e) =>
        console.error("Error setting launch flag", e),
      );
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      scrollRef.current?.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ImageBackground
        source={require("../../assets/images/slides/background.png")}
        style={styles.imageContainer}
        imageStyle={styles.bgPattern}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={async () => {
              await AsyncStorage.setItem("hasLaunched", "true");
              router.push("/(auth)/account-type");
            }}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={scrollRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <View style={styles.slideFrame}>
              <Image
                source={item.image}
                style={styles.slideImage}
                contentFit="contain"
                transition={200}
              />
            </View>
          )}
        />

        <View style={styles.bottomSheet}>
          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentIndex === index && styles.dotActive]}
              />
            ))}
          </View>

          <Text style={styles.title}>
            {SLIDES[currentIndex].title
              .split(SLIDES[currentIndex].highlight)
              .map((part, i, arr) => (
                <Text key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <Text style={styles.highlight}>
                      {SLIDES[currentIndex].highlight}
                    </Text>
                  )}
                </Text>
              ))}
          </Text>
          <Text style={styles.description}>
            {SLIDES[currentIndex].description}
          </Text>

          <View style={styles.footer}>
            {currentIndex === 0 ? (
              <SwipeSlider title="Get started" onComplete={handleNext} />
            ) : (
              <View style={styles.navRow}>
                <TouchableOpacity style={styles.navBtn} onPress={handlePrev}>
                  <ArrowLeft size={20} color="#A76D3A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={handleNext}>
                  <ArrowRight size={20} color="#A76D3A" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0B0B" },
  imageContainer: { flex: 1 },
  header: { alignItems: "flex-end", padding: 20 },
  skipButton: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: { color: "#D97706", fontWeight: "500" },
  bgPattern: {
    opacity: 0.5,
    resizeMode: "cover",
  },
  slideFrame: {
    width: width,
    justifyContent: "center",
    alignItems: "center",
  },
  slideImage: {
    width: width * 0.85,
    height: height * 0.9,
  },
  phoneMockupOutline: {
    width: width * 0.7,
    height: height * 0.45,
    backgroundColor: "#1C1C1E",
    borderRadius: 40,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#333",
  },
  bottomSheet: {
    backgroundColor: "#F9F6F0",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 50,
    minHeight: height * 0.4,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: "#D97706", width: 20 },
  title: {
    fontSize: 23,
    fontWeight: "600",
    textAlign: "center",
    color: "#111827",
    marginBottom: 16,
  },
  highlight: { color: "#974C16" }, // Brown accent
  description: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  footer: { marginTop: "auto", alignItems: "center" },
  getStartedBtn: {
    backgroundColor: "#D97706",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: "100%",
  },
  getStartedBtnText: { color: "#FFF", fontSize: 16, fontWeight: "500" },
  arrowsRow: { flexDirection: "row" },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D97706",
    alignItems: "center",
    justifyContent: "center",
  },
});
