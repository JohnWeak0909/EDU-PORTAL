import { forwardRef, type ReactNode } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { cn } from "@/lib/utils";

export type TouchableOpacityProps = Omit<PressableProps, "style"> & {
  className?: string;
  /** Matches RN TouchableOpacity default (0.2). */
  activeOpacity?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * Drop-in TouchableOpacity replacement. NativeWind className on pressables can
 * swallow onPress on web; Tailwind classes are applied on an inner View instead.
 */
export const TouchableOpacity = forwardRef<
  React.ComponentRef<typeof Pressable>,
  TouchableOpacityProps
>(function TouchableOpacity(
  { className, children, style, activeOpacity = 0.8, disabled, ...props },
  ref,
) {
  const pressableStyle: PressableProps["style"] = (state) => [
    style,
    state.pressed && !disabled ? { opacity: activeOpacity } : null,
  ];

  if (!className) {
    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        accessibilityRole="button"
        {...props}
        style={pressableStyle}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <Pressable
      ref={ref}
      disabled={disabled}
      accessibilityRole="button"
      {...props}
      style={pressableStyle}
    >
      <View className={cn(className)} pointerEvents="none">
        {children}
      </View>
    </Pressable>
  );
});
