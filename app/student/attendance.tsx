import { ScrollView, Text, View } from "react-native";

import { TouchableOpacity } from "@/components/ui/touchable";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/screen-header";
import { useState } from "react";

export default function AttendanceScreen() {
  const [course, setCourse] = useState("all");
  const [attendanceData] = useState([
    { id: 1, course: "Data Structures", present: 28, absent: 2, late: 1, percentage: 93 },
    { id: 2, course: "Web Development", present: 25, absent: 3, late: 2, percentage: 89 },
    { id: 3, course: "Database Systems", present: 29, absent: 1, late: 0, percentage: 97 },
  ]);

  const filteredData = course === "all" ? attendanceData : attendanceData.filter(a => a.course === course);

  return (
    <ScreenContainer className="bg-background">
      <ScreenHeader title="Attendance" subtitle="Track your attendance" />
      <ScrollView>

        {/* Overall Attendance */}
        <View className="px-6 py-6">
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-muted text-sm mb-2">Overall Attendance</Text>
            <Text className="text-4xl font-bold text-foreground">92%</Text>
            <View className="mt-4 bg-border rounded-full h-2 overflow-hidden">
              <View className="bg-success h-full" style={{ width: "92%" }} />
            </View>
            <Text className="text-muted text-xs mt-2">28 Present • 2 Absent • 1 Late</Text>
          </View>
        </View>

        {/* Course Filter */}
        <View className="px-6 gap-2 pb-4">
          <Text className="text-foreground font-semibold text-sm">Filter by Course</Text>
          <View className="flex-row gap-2 flex-wrap">
            <TouchableOpacity
              className={`px-4 py-2 rounded-lg border-2 ${
                course === "all"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
              onPress={() => setCourse("all")}
            >
              <Text className={course === "all" ? "text-white font-semibold" : "text-foreground"}>
                All
              </Text>
            </TouchableOpacity>
            {attendanceData.map((item) => (
              <TouchableOpacity
                key={item.id}
                className={`px-4 py-2 rounded-lg border-2 ${
                  course === item.course
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
                onPress={() => setCourse(item.course)}
              >
                <Text className={course === item.course ? "text-white font-semibold text-xs" : "text-foreground text-xs"}>
                  {item.course.split(" ")[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Attendance by Course */}
        <View className="px-6 pb-6 gap-3">
          {filteredData.map((item) => (
            <View key={item.id} className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-foreground font-semibold mb-3">{item.course}</Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <View className="bg-success/20 rounded px-3 py-2">
                      <Text className="text-success font-semibold text-sm">Present: {item.present}</Text>
                    </View>
                  </View>
                  <View className="flex-1 ml-2">
                    <View className="bg-error/20 rounded px-3 py-2">
                      <Text className="text-error font-semibold text-sm">Absent: {item.absent}</Text>
                    </View>
                  </View>
                  <View className="flex-1 ml-2">
                    <View className="bg-warning/20 rounded px-3 py-2">
                      <Text className="text-warning font-semibold text-sm">Late: {item.late}</Text>
                    </View>
                  </View>
                </View>
                <View className="bg-border rounded-full h-2 overflow-hidden">
                  <View
                    className="bg-primary h-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </View>
                <Text className="text-muted text-xs">{item.percentage}% attendance</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
