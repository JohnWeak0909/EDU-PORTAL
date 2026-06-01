import { ScrollView, Text, View } from "react-native";

import { TouchableOpacity } from "@/components/ui/touchable";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/screen-header";
import { useState } from "react";

export default function CoursesScreen() {
  const [semester, setSemester] = useState("5");
  const [courses, setCourses] = useState([
    { id: 1, code: "CS301", title: "Data Structures", type: "Theory", status: "Active" },
    { id: 2, code: "CS302", title: "Web Development", type: "Practical", status: "Active" },
    { id: 3, code: "CS303", title: "Database Systems", type: "Lab", status: "Active" },
    { id: 4, code: "CS304", title: "Software Engineering", type: "Theory", status: "Active" },
  ]);

  return (
    <ScreenContainer className="bg-background">
      <ScreenHeader title="My Courses" subtitle={`Semester ${semester}`} />
      <ScrollView>

        {/* Semester Filter */}
        <View className="px-6 py-4 gap-2">
          <Text className="text-foreground font-semibold text-sm">Select Semester</Text>
          <View className="flex-row gap-2 flex-wrap">
            {["3", "4", "5", "6", "7", "8"].map((sem) => (
              <TouchableOpacity
                key={sem}
                className={`px-4 py-2 rounded-lg border-2 ${
                  semester === sem
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
                onPress={() => setSemester(sem)}
              >
                <Text className={semester === sem ? "text-white font-semibold" : "text-foreground"}>
                  Sem {sem}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Courses Table */}
        <View className="px-6 py-4">
          <View className="bg-surface rounded-2xl border border-border overflow-hidden">
            {/* Table Header */}
            <View className="bg-primary px-4 py-3 flex-row">
              <Text className="text-background font-bold flex-1">Course</Text>
              <Text className="text-background font-bold flex-1">Type</Text>
              <Text className="text-background font-bold flex-1">Status</Text>
            </View>

            {/* Table Rows */}
            {courses.map((course, index) => (
              <View
                key={course.id}
                className={`px-4 py-3 flex-row border-t border-border ${
                  index % 2 === 0 ? "bg-surface" : "bg-background"
                }`}
              >
                <View className="flex-1">
                  <Text className="text-foreground font-semibold text-xs">{course.code}</Text>
                  <Text className="text-muted text-xs">{course.title}</Text>
                </View>
                <Text className="text-muted text-xs flex-1">{course.type}</Text>
                <View className="flex-1 items-start">
                  <View className="bg-success/20 px-2 py-1 rounded">
                    <Text className="text-success text-xs font-semibold">{course.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
