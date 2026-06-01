// NativeWind + pressables: className can swallow onPress on web. Disable className mapping;
// use @/components/ui/touchable (inner View) or inline style for Tailwind on pressables.
import {
  Pressable,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { remapProps } from "nativewind";

for (const Component of [
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
] as const) {
  remapProps(Component, { className: false });
}
