import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { TouchableOpacity } from "@/components/ui/touchable";
import { demoSignIn, getDashboardPath } from "@/lib/demo-auth";
import { useAuth } from "@/hooks/use-auth";

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, role, loading: authLoading, refresh } = useAuth();
  const [email, setEmail] = useState("student@edu.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && isAuthenticated && role) {
      router.replace(getDashboardPath(role));
    }
  }, [isAuthenticated, role, authLoading, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { role: userRole } = await demoSignIn(email, password);
      await refresh();
      router.replace(getDashboardPath(userRole));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && isAuthenticated && role) {
    return null;
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="items-center gap-8 px-6">
          <View className="items-center gap-2">
            <Text className="text-5xl">🎓</Text>
            <Text className="text-2xl font-bold text-foreground">EduPortal</Text>
            <Text className="text-sm text-muted">Student & Teacher Management</Text>
          </View>

          <View className="w-full bg-surface border border-border rounded-xl p-4 gap-2">
            <Text className="text-xs text-muted font-semibold uppercase">Demo accounts</Text>
            <Text className="text-sm text-foreground">student@edu.com / password123</Text>
            <Text className="text-sm text-foreground">teacher@edu.com / password123</Text>
          </View>

          <View className="w-full gap-4">
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="Enter your email"
                placeholderTextColor="#687076"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Password</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="Enter your password"
                placeholderTextColor="#687076"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {error ? <Text className="text-error text-sm">{error}</Text> : null}

            <TouchableOpacity
              className="bg-primary rounded-lg py-3 items-center mt-2 active:opacity-80"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-background font-semibold text-base">Sign in</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2">
            <Text className="text-muted">Don&apos;t have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text className="text-primary font-semibold">Register</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
            <Text className="text-muted text-sm">Continue without signing in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
