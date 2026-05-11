import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "plus.circle.fill": "add-circle",
  "list.bullet.clipboard.fill": "assignment",
  "person.fill": "person",
  // Actions
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "xmark": "close",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  // Task related
  "magnifyingglass": "search",
  "slider.horizontal.3": "tune",
  "clock.fill": "access-time",
  "mappin.and.ellipse": "location-on",
  "mappin": "place",
  "star.fill": "star",
  "star": "star-border",
  "tag.fill": "local-offer",
  // Order status
  "circle.dotted": "radio-button-unchecked",
  "arrow.right.circle.fill": "arrow-circle-right",
  "checkmark.seal.fill": "verified",
  "xmark.circle.fill": "cancel",
  // Profile
  "pencil": "edit",
  "info.circle": "info",
  "chevron.down": "expand-more",
  "trash": "delete",
  // Misc
  "bell.fill": "notifications",
  "gear": "settings",
  "exclamationmark.triangle.fill": "warning",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
