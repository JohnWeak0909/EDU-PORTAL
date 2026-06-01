import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { TouchableOpacity } from "@/components/ui/touchable";
import { useRouter } from "expo-router";
import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [attendancePercentage, setAttendancePercentage] = useState(85);
  const [gpa, setGpa] = useState("3.8");
  const [assignments, setAssignments] = useState([
    { id: 1, title: "Math Assignment 1", dueDate: "2026-05-25", course: "Calculus" },
    { id: 2, title: "Physics Lab Report", dueDate: "2026-05-28", course: "Physics" },
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
              <Text className="text-background/90 text-sm">Welcome back,</Text>
              <Text className="text-background text-2xl font-bold">{user?.name ?? "John Doe"}</Text>
            </View>
            <TouchableOpacity
              className="bg-white/20 rounded-full p-3"
              onPress={() => router.push("/student/assignments")}
            >
              <Text className="text-2xl">🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="bg-white/20 rounded-lg px-4 py-2 flex-row items-center gap-2">
            <Text className="text-white">🔍</Text>
            <Text className="text-white/60 flex-1">Search courses...</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-6 py-6 gap-4">
          {/* Attendance Card */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-muted text-sm">Attendance</Text>
                <Text className="text-3xl font-bold text-foreground">{attendancePercentage}%</Text>
              </View>
              <View className="items-center justify-center w-16 h-16 rounded-full bg-primary/20">
                <Text className="text-2xl">📊</Text>
              </View>
            </View>
          </View>

          {/* GPA Card */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-muted text-sm">Current GPA</Text>
                <Text className="text-3xl font-bold text-foreground">{gpa}</Text>
              </View>
              <View className="items-center justify-center w-16 h-16 rounded-full bg-success/20">
                <Text className="text-2xl">⭐</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Assignments Section */}
        <View className="px-6 gap-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg font-bold text-foreground">Upcoming Assignments</Text>
            <TouchableOpacity onPress={() => router.push("/student/assignments")}>
              <Text className="text-primary text-sm">View All</Text>
            </TouchableOpacity>
          </View>

          {assignments.map((assignment) => (
            <View key={assignment.id} className="bg-surface rounded-lg p-4 border border-border">
              <View className="flex-row justify-between items-start gap-3">
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">{assignment.title}</Text>
                  <Text className="text-muted text-sm mt-1">{assignment.course}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-error text-xs font-semibold">Due: {assignment.dueDate}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="px-6 py-6 gap-3">
          <Text className="text-lg font-bold text-foreground">Quick Access</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-primary rounded-lg py-3 items-center"
              onPress={() => router.push("/student/courses")}
            >
              <Text className="text-background text-2xl mb-1">📚</Text>
              <Text className="text-background text-xs font-semibold">Courses</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-success rounded-lg py-3 items-center"
              onPress={() => router.push("/student/grades")}
            >
              <Text className="text-background text-2xl mb-1">📈</Text>
              <Text className="text-background text-xs font-semibold">Grades</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-warning rounded-lg py-3 items-center"
              onPress={() => router.push("/student/attendance")}
            >
              <Text className="text-background text-2xl mb-1">✓</Text>
              <Text className="text-background text-xs font-semibold">Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
