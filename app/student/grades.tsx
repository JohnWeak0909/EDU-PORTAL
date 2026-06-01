import { ScrollView, Text, View } from "react-native";

import { TouchableOpacity } from "@/components/ui/touchable";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/screen-header";
import { useState } from "react";

export default function GradesScreen() {
  const [semester, setSemester] = useState("5");
  const [grades, setGrades] = useState([
    { id: 1, course: "Data Structures", grade: "A", marks: 92, total: 100, percentage: "92%" },
    { id: 2, course: "Web Development", grade: "A-", marks: 88, total: 100, percentage: "88%" },
    { id: 3, course: "Database Systems", grade: "B+", marks: 85, total: 100, percentage: "85%" },
    { id: 4, course: "Software Engineering", grade: "A", marks: 90, total: 100, percentage: "90%" },
  ]);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-success/20";
    if (grade.startsWith("B")) return "bg-primary/20";
    if (grade.startsWith("C")) return "bg-warning/20";
    return "bg-error/20";
  };

  const getGradeTextColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-success";
    if (grade.startsWith("B")) return "text-primary";
    if (grade.startsWith("C")) return "text-warning";
    return "text-error";
  };

  return (
    <ScreenContainer className="bg-background">
      <ScreenHeader title="Grades" subtitle={`Semester ${semester}`} />
      <ScrollView>

        {/* GPA Card */}
        <View className="px-6 py-6">
          <View className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 gap-2">
            <Text className="text-white/80 text-sm">Current GPA</Text>
            <Text className="text-white text-4xl font-bold">3.88</Text>
            <Text className="text-white/70 text-xs">Excellent Performance</Text>
          </View>
        </View>

        {/* Semester Filter */}
        <View className="px-6 gap-2 pb-4">
          <Text className="text-foreground font-semibold text-sm">Select Semester</Text>
          <View className="flex-row gap-2 flex-wrap">
            {["3", "4", "5", "6"].map((sem) => (
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

        {/* Grades List */}
        <View className="px-6 pb-6 gap-3">
          {grades.map((grade) => (
            <View key={grade.id} className="bg-surface rounded-lg p-4 border border-border">
              <View className="flex-row justify-between items-start gap-3">
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">{grade.course}</Text>
                  <View className="flex-row gap-2 mt-2">
                    <View className="bg-primary/10 rounded px-2 py-1">
                      <Text className="text-xs text-foreground font-semibold">{grade.marks}/{grade.total}</Text>
                    </View>
                    <View className="bg-primary/10 rounded px-2 py-1">
                      <Text className="text-xs text-foreground font-semibold">{grade.percentage}</Text>
                    </View>
                  </View>
                </View>
                <View className={`${getGradeColor(grade.grade)} rounded-lg px-3 py-2 items-center`}>
                  <Text className={`${getGradeTextColor(grade.grade)} font-bold text-lg`}>{grade.grade}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
