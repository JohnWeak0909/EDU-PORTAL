import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, TouchableOpacity, Modal, Alert, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function TeacherAnnouncementsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");

  const [isSelectingTarget, setIsSelectingTarget] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isGlobal, setIsGlobal] = useState(true);
  const [sendToAllSections, setSendToAllSections] = useState(true);

  const classesQuery = trpc.classes.byTeacher.useQuery();
  const createMutation = trpc.announcements.create.useMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    await classesQuery.refetch();
    setRefreshing(false);
  };

  const selectedClass = classesQuery.data?.find(c => c.id === selectedClassId);

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter announcement title");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Error", "Please enter announcement message");
      return;
    }
    if (!isGlobal && !selectedClassId) {
      Alert.alert("Error", "Please select a class");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        priority: priority ?? "normal",
        isGlobal: isGlobal,
        courseId: isGlobal ? undefined : (selectedClassId ?? undefined),
        section: isGlobal || sendToAllSections ? undefined : (selectedSection ?? undefined),
      });

      Alert.alert("Success", "Announcement posted successfully");
      setTitle("");
      setContent("");
      setPriority("normal");
    } catch (error) {
      Alert.alert("Error", "Failed to post announcement");
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
          <Text className="text-background/90 text-sm">Post Announcement</Text>
          <Text className="text-background text-2xl font-bold">New Announcement</Text>
        </View>

        {/* Form */}
        <View className="px-6 py-4 gap-4">
          {/* Visibility Options */}
          <View className="bg-surface rounded-lg p-3 border border-border gap-3">
            <Text className="text-sm font-semibold text-foreground mb-1">Send To</Text>
            
            <TouchableOpacity
              className="flex-row items-center gap-2"
              onPress={() => {
                setIsGlobal(true);
                setSelectedClassId(null);
                setSelectedSection(null);
              }}
            >
              <Text className={`text-base ${isGlobal ? "text-primary" : "text-muted"}`}>
                {isGlobal ? "☑️" : "☐"}
              </Text>
              <Text className="text-foreground text-sm">All Students (Global)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-2"
              onPress={() => setIsGlobal(false)}
            >
              <Text className={`text-base ${!isGlobal ? "text-primary" : "text-muted"}`}>
                {!isGlobal ? "☑️" : "☐"}
              </Text>
              <Text className="text-foreground text-sm">Specific Class</Text>
            </TouchableOpacity>
          </View>

          {!isGlobal && (
            <>
              {/* Class Selection */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Select Class *</Text>
                <TouchableOpacity
                  className="bg-surface border border-border rounded-lg px-4 py-3"
                  onPress={() => setIsSelectingTarget(true)}
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
            </>
          )}

          {/* Title */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Title *</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="Announcement title"
              placeholderTextColor="#687076"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Priority */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Priority</Text>
            <View className="bg-surface rounded-lg border border-border p-2 flex-row gap-2">
              {["low", "normal", "high"].map((level) => (
                <TouchableOpacity
                  key={level}
                  className={`flex-1 py-2 rounded items-center ${priority === level ? "bg-primary" : "bg-background"}`}
                  onPress={() => setPriority(level)}
                >
                  <Text className={priority === level ? "text-background font-semibold text-xs" : "text-muted text-xs"}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Message */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-2">Message *</Text>
            <TextInput
              className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground min-h-[120px]"
              placeholder="Write your announcement..."
              placeholderTextColor="#687076"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Post Button */}
          <TouchableOpacity
            className="bg-primary rounded-lg py-4 items-center mt-4"
            onPress={handlePost}
            disabled={createMutation.isPending}
          >
            <Text className="text-background font-bold">
              {createMutation.isPending ? "Posting..." : "Post Announcement"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Class Selection Modal */}
      <Modal visible={isSelectingTarget} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-2xl p-6 gap-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-foreground text-xl font-bold">Select Class</Text>
              <TouchableOpacity onPress={() => setIsSelectingTarget(false)}>
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
                      setIsSelectingTarget(false);
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
