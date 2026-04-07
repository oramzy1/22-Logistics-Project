import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";

interface DropdownInputProps {
  label?: string;
  placeholder?: string;
  options: string[];
  value: any;
  onSelect: any;
}

const ITEM_HEIGHT = 50;

export const DropdownInput: React.FC<DropdownInputProps> = ({
  label,
  placeholder,
  options,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const progress = useSharedValue(0);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    progress.value = next
      ? withSpring(1, { damping: 15, stiffness: 120, mass: 0.5 })
      : withTiming(0, { duration: 200 });
  };

  const dropdownStyle = useAnimatedStyle(() => {
    return {
      height: progress.value * ITEM_HEIGHT * options.length,
      opacity: progress.value,
      transform: [
        {
          translateY: interpolate(progress.value, [0, 1], [-10, 0]),
        },
      ],
    };
  });

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg`,
        },
      ],
    };
  });

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.input} activeOpacity={0.8} onPress={toggle}>
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected || placeholder}
        </Text>

        <Animated.View style={chevronStyle}>
          <ChevronDown size={18} color="#9CA3AF" />
        </Animated.View>
      </TouchableOpacity>

      {/* Overlay + Dropdown */}
      {open && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.dropdownBody]}
            onPress={toggle}
          />

          <Animated.View style={[styles.dropdown, dropdownStyle, styles.dropdownBody]}>
            {options.map((item, index) => {
              const isSelected = selected === item;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    isSelected && styles.selectedOption,
                  ]}
                  onPress={() => {
                    setSelected(item);
                    toggle();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  dropdownBody: {
    zIndex: 1000,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#1F2937",
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 14,
    color: "#111827",
  },
  placeholder: {
    color: "#9CA3AF",
  },
  dropdown: {
    position: "absolute",
    top: 90,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    elevation: 6,
  },
  option: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  selectedOption: {
    backgroundColor: "#F3F4F6",
  },
  optionText: {
    fontSize: 14,
    color: "#111827",
  },
  selectedText: {
    fontWeight: "600",
  },
});