import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions, FlatList, NativeScrollEvent, NativeSyntheticEvent,
  StyleSheet, TouchableOpacity, View, ViewToken,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type CardSliderProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  cardWidth?: number;
  visibleCards?: number;
  gap?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  activeDotColor?: string;
  inactiveDotColor?: string;
  peekWidth?: number;
  containerStyle?: object;
};

const CLONE_COUNT = 3; // clones on each side for buffer

export function CardSlider<T extends { id?: string | number }>({
  data,
  renderItem,
  cardWidth,
  visibleCards,
  gap = 12,
  autoPlay = false,
  autoPlayInterval = 3500,
  activeDotColor = "#0B3D91",
  inactiveDotColor = "#D1D5DB",
  peekWidth = 0,
  containerStyle,
}: CardSliderProps<T>) {
  const flatRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isScrolling = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0); // real index 0..data.length-1

  const containerWidth = SCREEN_WIDTH - 32;
  const effectiveCardWidth = visibleCards
    ? (containerWidth - gap * (visibleCards - 1)) / visibleCards
    : cardWidth ?? containerWidth - peekWidth * 2;
  const snapWidth = effectiveCardWidth + gap;

  // Build infinite list: [last N clones] + [real items] + [first N clones]
  const clonesBefore = data.slice(-CLONE_COUNT);
  const clonesAfter  = data.slice(0, CLONE_COUNT);
  const loopData = [...clonesBefore, ...data, ...clonesAfter];
  const offset = CLONE_COUNT; // real items start here

  // Scroll to real index (offset-adjusted), optionally animated
  const scrollToReal = useCallback(
    (realIdx: number, animated = true) => {
      flatRef.current?.scrollToIndex({
        index: realIdx + offset,
        animated,
        viewPosition: 0,
      });
    },
    [offset],
  );

  // On mount: jump silently to first real item
  useEffect(() => {
    // requestAnimationFrame ensures layout is done
    const raf = requestAnimationFrame(() => scrollToReal(0, false));
    return () => cancelAnimationFrame(raf);
  }, []);

  const advance = useCallback(() => {
    setActiveIndex((prev) => {
      const next = (prev + 1) % data.length;
      scrollToReal(next, true);
      return next;
    });
  }, [data.length, scrollToReal]);

  useEffect(() => {
    if (!autoPlay || data.length <= 1) return;
    timerRef.current = setInterval(advance, autoPlayInterval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoPlay, autoPlayInterval, advance]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!autoPlay || data.length <= 1) return;
    timerRef.current = setInterval(advance, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, advance]);

  // After scroll ends, check if we're in a clone zone and silently reset
  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrolling.current = false;
      const x = e.nativeEvent.contentOffset.x;
      const rawIndex = Math.round(x / snapWidth);

      // Which real index does this correspond to?
      let realIdx = rawIndex - offset;

      if (realIdx < 0) {
        // Scrolled into left clones — jump to equivalent real position at end
        realIdx = ((realIdx % data.length) + data.length) % data.length;
        setActiveIndex(realIdx);
        flatRef.current?.scrollToIndex({ index: realIdx + offset, animated: false });
      } else if (realIdx >= data.length) {
        // Scrolled into right clones — jump to equivalent real position at start
        realIdx = realIdx % data.length;
        setActiveIndex(realIdx);
        flatRef.current?.scrollToIndex({ index: realIdx + offset, animated: false });
      } else {
        setActiveIndex(realIdx);
      }

      resetTimer();
    },
    [data.length, offset, snapWidth, resetTimer],
  );

  const onScrollBeginDrag = useCallback(() => {
    isScrolling.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return (
    <View style={containerStyle}>
      <FlatList
        ref={flatRef}
        data={loopData}
        keyExtractor={(item, i) => `${String((item as any)?.id ?? i)}-loop-${i}`}
        horizontal
        pagingEnabled={false}
        snapToInterval={snapWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: peekWidth > 0 ? peekWidth : 0,
          gap,
        }}
        onScrollBeginDrag={onScrollBeginDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: snapWidth,
          offset: snapWidth * index,
          index,
        })}
        // Disable viewability — we compute real index from scroll offset instead
        renderItem={({ item, index }) => (
          <View style={{ width: effectiveCardWidth }}>
            {renderItem(item as T, (index - offset + data.length) % data.length)}
          </View>
        )}
      />

      {data.length > 1 && (
        <View style={styles.dotsRow}>
          {data.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                scrollToReal(i);
                setActiveIndex(i);
                resetTimer();
              }}
              hitSlop={6}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === activeIndex ? activeDotColor : inactiveDotColor,
                    width: i === activeIndex ? 18 : 6,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 5,
  },
  dot: { height: 6, borderRadius: 3 },
});