import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { TouchableOpacity } from "@/components/ui/touchable";
import { useRouter } from "expo-router";
import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";

export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [classes] = useState([
    { id: 1, name: "Data Structures", students: 45, section: "A" },
    { id: 2, name: "Web Development", students: 38, section: "B" },
    { id: 3, name: "Database Systems", students: 42, section: "C" },
  ]);

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="bg-primary px-6 py-6 gap-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <TouchableOpacity onPress={() => router.push("/(tabs)")} className="mb-2">
                <Text className="text-background/80 text-sm">← Home</Text>
              </TouchableOpacity>
              <Text className="text-background/90 text-sm">Welcome,</Text>
              <Text className="text-background text-2xl font-bold">
                {user?.name ?? "Prof. Jane Smith"}
              </Text>
            </View>
            <TouchableOpacity
              className="bg-white/20 rounded-full p-3"
              onPress={() => router.push("/teacher/announcements")}
            >
              <Text className="text-2xl">🔔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View className="px-6 py-6 gap-4">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-muted text-xs">Total Classes</Text>
              <Text className="text-3xl font-bold text-foreground mt-1">3</Text>
            </View>
            <View className="flex-1 bg-surface rounded-lg p-4 border border-border">
              <Text className="text-muted text-xs">Total Students</Text>
              <Text className="text-3xl font-bold text-foreground mt-1">125</Text>
            </View>
          </View>
        </View>

        {/* Classes Overview */}
        <View className="px-6 gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-foreground">My Classes</Text>
            <TouchableOpacity onPress={() => router.push("/teacher/classes")}>
              <Text className="text-primary text-sm">View All</Text>
            </TouchableOpacity>
          </View>

          {classes.map((cls) => (
            <View key={cls.id} className="bg-surface rounded-lg p-4 border border-border">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">{cls.name}</Text>
                  <Text className="text-muted text-sm mt-1">Section {cls.section}</Text>
                </View>
                <View className="items-end">
                  <View className="bg-blue-100 px-3 py-1 rounded">
                    <Text className="text-blue-700 font-semibold text-sm">{cls.students} students</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-6 gap-3">
          <Text className="text-lg font-bold text-foreground">Quick Actions</Text>
          <View className="gap-3">
            <TouchableOpacity
              className="bg-blue-500 rounded-lg py-3 px-4 flex-row items-center gap-3"
              onPress={() => router.push("/teacher/grades")}
            >
              <Text className="text-2xl">📊</Text>
              <View className="flex-1">
                <Text className="text-white font-semibold">Manage Grades</Text>
                <Text className="text-white/70 text-xs">Add and update student grades</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-green-500 rounded-lg py-3 px-4 flex-row items-center gap-3"
              onPress={() => router.push("/teacher/attendance")}
            >
              <Text className="text-2xl">✓</Text>
              <View className="flex-1">
                <Text className="text-white font-semibold">Mark Attendance</Text>
                <Text className="text-white/70 text-xs">Record student attendance</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-purple-500 rounded-lg py-3 px-4 flex-row items-center gap-3"
              onPress={() => router.push("/teacher/announcements")}
            >
              <Text className="text-2xl">📢</Text>
              <View className="flex-1">
                <Text className="text-white font-semibold">Post Announcement</Text>
                <Text className="text-white/70 text-xs">Communicate with students</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-orange-500 rounded-lg py-3 px-4 flex-row items-center gap-3"
              onPress={() => router.push("/teacher/assignments")}
            >
              <Text className="text-2xl">📝</Text>
              <View className="flex-1">
                <Text className="text-white font-semibold">Create Assignment</Text>
                <Text className="text-white/70 text-xs">Upload assignments and deadlines</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
