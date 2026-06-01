import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { TouchableOpacity } from "@/components/ui/touchable";
import { getDashboardPath } from "@/lib/demo-auth";
import { useAuth } from "@/hooks/use-auth";

export default function HomeScreen() {
  const router = useRouter();
  const { user, role, isAuthenticated, loading, logout } = useAuth();

  const goToDashboard = () => {
    if (role) {
      router.push(getDashboardPath(role));
      return;
    }
    router.push("/student/dashboard");
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        <View className="flex-1 gap-6 px-6 pt-4">
          <View className="items-center gap-3 pt-4">
            <Text className="text-5xl">🎓</Text>
            <Text className="text-3xl font-bold text-foreground">EduPortal</Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              Your campus hub for courses, grades, attendance, and teaching tools.
            </Text>
          </View>

          {!loading && isAuthenticated && user ? (
            <View className="bg-surface rounded-2xl p-5 border border-border gap-4">
              <Text className="text-muted text-sm">Signed in as</Text>
              <Text className="text-xl font-bold text-foreground">{user.name}</Text>
              <Text className="text-muted text-sm capitalize">{role ?? "student"} account</Text>
              <TouchableOpacity
                className="bg-primary rounded-xl py-3.5 active:opacity-80"
                onPress={goToDashboard}
              >
                <Text className="text-background text-center font-semibold">Go to Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="border border-border rounded-xl py-3 active:opacity-80"
                onPress={async () => {
                  await logout();
                }}
              >
                <Text className="text-error text-center font-semibold">Sign out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View className="gap-3">
                <Text className="text-sm font-semibold text-muted uppercase tracking-wide">
                  Browse without signing in
                </Text>
                <TouchableOpacity
                  className="bg-primary rounded-xl py-4 px-5 active:opacity-80"
                  onPress={() => router.push("/student/dashboard")}
                >
                  <Text className="text-background text-center font-semibold text-base">
                    Student Dashboard
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-surface border border-border rounded-xl py-4 px-5 active:opacity-80"
                  onPress={() => router.push("/teacher/dashboard")}
                >
                  <Text className="text-foreground text-center font-semibold text-base">
                    Teacher Dashboard
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="items-center gap-2 pt-2">
                <TouchableOpacity
                  className="bg-surface border border-border rounded-full px-6 py-3 active:opacity-80"
                  onPress={() => router.push("/auth/login")}
                >
                  <Text className="text-primary font-semibold">Sign in</Text>
                </TouchableOpacity>
                <View className="flex-row gap-1">
                  <Text className="text-muted text-sm">New here?</Text>
                  <TouchableOpacity onPress={() => router.push("/auth/register")}>
                    <Text className="text-primary text-sm font-semibold">Create an account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
