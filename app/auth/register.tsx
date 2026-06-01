import { useState } from "react";
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
import { demoSignUp, getDashboardPath, type UserRole } from "@/lib/demo-auth";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterScreen() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { role: userRole } = await demoSignUp(name, email, password, role);
      await refresh();
      router.replace(getDashboardPath(userRole));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View className="items-center gap-6 px-6">
          <View className="items-center gap-2">
            <Text className="text-4xl">🎓</Text>
            <Text className="text-2xl font-bold text-foreground">Create Account</Text>
          </View>

          <View className="w-full gap-4">
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Full Name</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="Enter your name"
                placeholderTextColor="#687076"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

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
                placeholder="Create a password"
                placeholderTextColor="#687076"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">I am a</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg border-2 items-center ${
                    role === "student" ? "bg-primary border-primary" : "bg-surface border-border"
                  }`}
                  onPress={() => setRole("student")}
                >
                  <Text
                    className={`font-semibold ${
                      role === "student" ? "text-background" : "text-foreground"
                    }`}
                  >
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg border-2 items-center ${
                    role === "teacher" ? "bg-primary border-primary" : "bg-surface border-border"
                  }`}
                  onPress={() => setRole("teacher")}
                >
                  <Text
                    className={`font-semibold ${
                      role === "teacher" ? "text-background" : "text-foreground"
                    }`}
                  >
                    Teacher
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text className="text-error text-sm">{error}</Text> : null}

            <TouchableOpacity
              className="bg-primary rounded-lg py-3 items-center mt-2 active:opacity-80"
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-background font-semibold text-base">Create account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-2">
            <Text className="text-muted">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text className="text-primary font-semibold">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
