import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, Modal, Alert, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function TeacherAssignmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("");
  
  const [isSelectingClass, setIsSelectingClass] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sendToAllSections, setSendToAllSections] = useState(true);

  const classesQuery = trpc.classes.byTeacher.useQuery();
  const createMutation = trpc.classAssignments.create.useMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    await classesQuery.refetch();
    setRefreshing(false);
  };

  const selectedClass = classesQuery.data?.find(c => c.id === selectedClassId);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter assignment title");
      return;
    }
    if (!selectedClassId) {
      Alert.alert("Error", "Please select a class");
      return;
    }

    try {
      await createMutation.mutateAsync({
        classId: selectedClassId ?? 0,
        title: title.trim(),
        description: description.trim() || undefined,
        instructions: instructions.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        maxScore: maxScore ? parseInt(maxScore) : undefined,
      });

      Alert.alert("Success", "Assignment created successfully");
      setTitle("");
      setDescription("");
      setInstructions("");
      setDueDate("");
      setMaxScore("");
      setSelectedClassId(null);
      setSelectedSection(null);
    } catch (error) {
      Alert.alert("Error", "Failed to create assignment");
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View className="bg-primary px-6 py-6 gap-3">
          <TouchableOpacity onPress={() => router.back()} className="mb-2">
            <Text className="text-background/80 text-sm">← Back</Text>
          </TouchableOpacity>
          <Text className="text-background/90 text-sm">Create Assignment</Text>
          <Text className="text-background text-2xl font-bold">New Assignment</Text>
        </View>

        {/* Form */}
        <View className="px-6 py-4 gap-4">
          {/* Class Selection */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Select Class *</Text>
            <TouchableOpacity
              className="bg-surface border border-border rounded-lg px-4 py-3"
              onPress={() => setIsSelectingClass(true)}
            >
              <Text className={selectedClassId ? "text-foreground font-semibold" : "text-muted"}>
                {selectedClass ? `${selectedClass.className} - Section ${selectedClass.section}` : "Tap to select class"}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedClassId && !sendToAllSections && (
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Specific Section</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="e.g. A, B, or leave empty for all"
                placeholderTextColor="#687076"
                value={selectedSection || ""}
                onChangeText={setSelectedSection}
              />
            </View>
          )}

          {selectedClassId && (
            <View className="bg-surface rounded-lg p-3 border border-border">
              <TouchableOpacity
                className="flex-row items-center gap-2"
                onPress={() => setSendToAllSections(!sendToAllSections)}
              >
                <Text className={`text-base ${sendToAllSections ? "text-primary" : "text-muted"}`}>
                  {sendToAllSections ? "☑️" : "☐"}
                </Text>
                <Text className="text-foreground text-sm">Send to all sections</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Title */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Assignment Title *</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="e.g. Lab Report 3"
              placeholderTextColor="#687076"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Description</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground min-h-[80px]"
              placeholder="Brief description of the assignment"
              placeholderTextColor="#687076"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Instructions */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Instructions</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground min-h-[100px]"
              placeholder="Detailed instructions for students..."
              placeholderTextColor="#687076"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Due Date */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Due Date</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#687076"
              value={dueDate}
              onChangeText={setDueDate}
            />
          </View>

          {/* Max Score */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Max Score</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="e.g. 100"
              placeholderTextColor="#687076"
              value={maxScore}
              onChangeText={setMaxScore}
              keyboardType="number-pad"
            />
          </View>

          {/* Create Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg py-4 items-center mt-4"
            onPress={handleCreate}
            disabled={createMutation.isPending}
          >
            <Text className="text-background font-bold">
              {createMutation.isPending ? "Creating..." : "Create Assignment"}
            </Text>
          </TouchableOpacity>
        </View>
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
              {classesQuery.data && classesQuery.data.length > 0 ? (
                classesQuery.data.map((cls: any) => (
                  <TouchableOpacity
                    key={cls.id}
                    className={`rounded-lg px-4 py-3 mb-2 ${selectedClassId === cls.id ? "bg-primary/20 border-2 border-primary" : "bg-surface border border-border"}`}
                    onPress={() => {
                      setSelectedClassId(cls.id);
                      setIsSelectingClass(false);
                    }}
                  >
                    <Text className="text-foreground font-semibold">{cls.className}</Text>
                    <Text className="text-muted text-xs">Section: {cls.section} • {cls.subject}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="bg-surface rounded-lg p-6 border border-border items-center">
                  <Text className="text-muted text-sm">No classes available</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
