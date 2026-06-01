import React, { useState, useCallback } from "react";
import { ScrollView, View, Text, TouchableOpacity, RefreshControl, Alert, Modal, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function TeacherAttendanceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isSelectingClass, setIsSelectingClass] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState<Record<number, string>>({});

  const classesQuery = trpc.classes.byTeacher.useQuery();
  const recordMutation = trpc.attendanceManagement.record.useMutation();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await classesQuery.refetch();
    setRefreshing(false);
  }, [classesQuery]);

  const handleSelectClass = (classId: number) => {
    setSelectedClassId(classId);
    setIsSelectingClass(false);
  };

  const handleMarkAttendance = async () => {
    if (!selectedClassId) {
      Alert.alert("Error", "Please select a class first");
      return;
    }

    const recordsToSave = Object.entries(attendanceData);
    if (recordsToSave.length === 0) {
      Alert.alert("Error", "Mark attendance for at least one student");
      return;
    }

    try {
      for (const [studentId, status] of recordsToSave) {
        await recordMutation.mutateAsync({
          classId: selectedClassId,
          studentId: parseInt(studentId),
          date: new Date(selectedDate),
          status: status as "present" | "absent" | "late" | "excused",
        });
      }
      Alert.alert("Success", "Attendance marked successfully");
      setAttendanceData({});
    } catch (error) {
      Alert.alert("Error", "Failed to mark attendance");
    }
  };

  const selectedClass = classesQuery.data?.find(c => c.id === selectedClassId);
  const classStudentsQuery = trpc.classes.students.useQuery(
    { classId: selectedClassId! },
    { enabled: !!selectedClassId }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500/20";
      case "absent":
        return "bg-red-500/20";
      case "late":
        return "bg-yellow-500/20";
      case "excused":
        return "bg-blue-500/20";
      default:
        return "bg-surface";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-500";
      case "absent":
        return "text-red-500";
      case "late":
        return "text-yellow-500";
      case "excused":
        return "text-blue-500";
      default:
        return "text-muted";
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View className="bg-primary px-6 py-6 gap-3">
          <TouchableOpacity onPress={() => router.back()} className="mb-2">
            <Text className="text-background/80 text-sm">← Back</Text>
          </TouchableOpacity>
          <Text className="text-background/90 text-sm">Manage Attendance</Text>
          <Text className="text-background text-2xl font-bold">Mark Attendance</Text>
        </View>

        {/* Class Selection */}
        <View className="px-6 py-4 gap-3">
          <TouchableOpacity
            className="bg-surface border border-border rounded-lg px-4 py-3"
            onPress={() => setIsSelectingClass(true)}
          >
            <Text className="text-muted text-xs mb-1">Selected Class</Text>
            <Text className="text-foreground font-semibold">
              {selectedClass ? `${selectedClass.className} - Section ${selectedClass.section}` : "Select a class"}
            </Text>
          </TouchableOpacity>

          <View className="bg-surface border border-border rounded-lg px-4 py-3">
            <Text className="text-muted text-xs mb-1">Date</Text>
            <Text className="text-foreground font-semibold">{selectedDate}</Text>
          </View>
        </View>

        {/* Students List */}
        {selectedClassId && classStudentsQuery.data && classStudentsQuery.data.length > 0 && (
          <View className="px-6 py-4">
            <Text className="text-foreground font-semibold mb-3">Mark Students</Text>
            {classStudentsQuery.data.map((student: any) => (
              <View key={student.id} className={`rounded-lg p-3 mb-2 ${getStatusColor(attendanceData[student.id] || "")}`}>
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-foreground font-medium">{student.fullName}</Text>
                    <Text className="text-muted text-xs">{student.studentId}</Text>
                  </View>
                  <View className="flex-row gap-1">
                    {["present", "absent", "late", "excused"].map((status) => (
                      <TouchableOpacity
                        key={status}
                        className={`px-2 py-1 rounded ${
                          attendanceData[student.id] === status ? "bg-primary" : "bg-surface border border-border"
                        }`}
                        onPress={() =>
                          setAttendanceData({
                            ...attendanceData,
                            [student.id]: status,
                          })
                        }
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            attendanceData[student.id] === status ? "text-background" : getStatusTextColor(status)
                          }`}
                        >
                          {status.charAt(0).toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              className="bg-primary rounded-lg px-4 py-3 items-center mt-4"
              onPress={handleMarkAttendance}
              disabled={recordMutation.isPending}
            >
              <Text className="text-background font-bold">
                {recordMutation.isPending ? "Saving..." : "Save Attendance"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!selectedClassId && (
          <View className="px-6 py-6">
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-muted text-sm">Select a class to mark attendance</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Class Selection Modal */}
      <Modal visible={isSelectingClass} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-2xl p-6 gap-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-foreground text-xl font-bold">Select Class</Text>
              <TouchableOpacity onPress={() => setIsSelectingClass(false)}>
                <Text className="text-muted text-2xl">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {classesQuery.data?.map((cls: any) => (
                <TouchableOpacity
                  key={cls.id}
                  className="bg-surface border border-border rounded-lg px-4 py-3 mb-2 flex-row justify-between items-center"
                  onPress={() => handleSelectClass(cls.id)}
                >
                  <View>
                    <Text className="text-foreground font-semibold">{cls.className}</Text>
                    <Text className="text-muted text-xs">Section: {cls.section}</Text>
                  </View>
                  <Text className="text-primary">→</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
