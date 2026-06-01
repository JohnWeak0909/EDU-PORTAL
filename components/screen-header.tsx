import { Text, View } from "react-native";

import { TouchableOpacity } from "@/components/ui/touchable";
import { useRouter } from "expo-router";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
};

export function ScreenHeader({ title, subtitle, showBack = true }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-3 px-6 py-4 border-b border-border bg-background">
      {showBack && (
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-surface border border-border active:opacity-80"
          accessibilityLabel="Go back"
        >
          <Text className="text-foreground text-lg">←</Text>
        </TouchableOpacity>
      )}
      <View className="flex-1">
        <Text className="text-xl font-bold text-foreground">{title}</Text>
        {subtitle ? <Text className="text-sm text-muted mt-0.5">{subtitle}</Text> : null}
      </View>
    </View>
  );
}
