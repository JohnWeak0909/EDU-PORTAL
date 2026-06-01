import React, { useState, useCallback } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, RefreshControl, Alert, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function TeacherClassesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const [formData, setFormData] = useState({
    className: "",
    subject: "",
    section: "",
    schoolYear: "",
    description: "",
  });

  const classesQuery = trpc.classes.byTeacher.useQuery();
  const createMutation = trpc.classes.create.useMutation();
  const updateMutation = trpc.classes.update.useMutation();
  const deleteMutation = trpc.classes.delete.useMutation();
  const archiveMutation = trpc.classes.archive.useMutation();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await classesQuery.refetch();
    setRefreshing(false);
  }, [classesQuery]);

  const resetForm = () => {
    setFormData({
      className: "",
      subject: "",
      section: "",
      schoolYear: "",
      description: "",
    });
    setSelectedClass(null);
  };

  const handleAddClass = async () => {
    if (!formData.className || !formData.subject || !formData.section || !formData.schoolYear) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      Alert.alert("Success", "Class created successfully");
      resetForm();
      setIsAddModalVisible(false);
      await classesQuery.refetch();
    } catch (error) {
      Alert.alert("Error", "Failed to create class");
    }
  };

  const handleEditClass = async () => {
    if (!selectedClass) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedClass.id,
        ...formData,
      });
      Alert.alert("Success", "Class updated successfully");
      resetForm();
      setIsEditModalVisible(false);
      await classesQuery.refetch();
    } catch (error) {
      Alert.alert("Error", "Failed to update class");
    }
  };

  const handleDeleteClass = (cls: any) => {
    Alert.alert("Delete Class", `Delete ${cls.className}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ id: cls.id });
            Alert.alert("Success", "Class deleted successfully");
            await classesQuery.refetch();
          } catch (error) {
            Alert.alert("Error", "Failed to delete class");
          }
        },
      },
    ]);
  };

  const handleArchiveClass = (cls: any) => {
    Alert.alert("Archive Class", `Archive ${cls.className}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Archive",
        style: "default",
        onPress: async () => {
          try {
            await archiveMutation.mutateAsync({ id: cls.id });
            Alert.alert("Success", "Class archived successfully");
            await classesQuery.refetch();
          } catch (error) {
            Alert.alert("Error", "Failed to archive class");
          }
        },
      },
    ]);
  };

  const openEditModal = (cls: any) => {
    setSelectedClass(cls);
    setFormData({
      className: cls.className,
      subject: cls.subject,
      section: cls.section,
      schoolYear: cls.schoolYear,
      description: cls.description || "",
    });
    setIsEditModalVisible(true);
  };

  const renderClassCard = (cls: any) => (
    <View key={cls.id} className="bg-surface rounded-lg p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start gap-3">
        <View className="flex-1">
          <Text className="text-foreground font-semibold text-base">{cls.className}</Text>
          <Text className="text-muted text-xs mt-1">{cls.subject}</Text>
          <Text className="text-muted text-xs">Section: {cls.section} • {cls.schoolYear}</Text>
          {cls.description && <Text className="text-muted text-xs mt-2">{cls.description}</Text>}
        </View>
        <TouchableOpacity
          className="bg-primary/20 px-3 py-2 rounded"
          onPress={() => {
            Alert.alert("Class Management", `${cls.className} (${cls.section}) - ${cls.subject}\n\nManage students and assignments through the dashboard.`);
          }}
        >
          <Text className="text-primary text-xs font-semibold">Manage</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row gap-2 mt-4">
        <TouchableOpacity
          className="flex-1 bg-primary/20 px-3 py-2 rounded items-center"
          onPress={() => openEditModal(cls)}
        >
          <Text className="text-primary text-xs font-semibold">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-yellow-500/20 px-3 py-2 rounded items-center"
          onPress={() => handleArchiveClass(cls)}
        >
          <Text className="text-yellow-500 text-xs font-semibold">Archive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-red-500/20 px-3 py-2 rounded items-center"
          onPress={() => handleDeleteClass(cls)}
        >
          <Text className="text-red-500 text-xs font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text className="text-background/90 text-sm">Manage Classes</Text>
          <Text className="text-background text-2xl font-bold">Classes</Text>
        </View>

        {/* Add Button */}
        <View className="px-6 py-4">
          <TouchableOpacity
            className="bg-primary rounded-lg px-4 py-3 flex-row items-center justify-center gap-2"
            onPress={() => setIsAddModalVisible(true)}
          >
            <Text className="text-background text-lg">➕</Text>
            <Text className="text-background font-semibold">Create Class</Text>
          </TouchableOpacity>
        </View>

        {/* Classes List */}
        <View className="px-6 py-4">
          {classesQuery.data && classesQuery.data.length > 0 ? (
            classesQuery.data.map(renderClassCard)
          ) : (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-muted text-sm">No classes created yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Class Modal */}
      <Modal visible={isAddModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-2xl p-6 gap-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-foreground text-xl font-bold">Create Class</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Text className="text-muted text-2xl">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
                placeholder="Class Name"
                placeholderTextColor="#888"
                value={formData.className}
                onChangeText={(text) => setFormData({ ...formData, className: text })}
              />
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
                placeholder="Subject"
                placeholderTextColor="#888"
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
              />
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
                placeholder="Section (e.g., A, B, C)"
                placeholderTextColor="#888"
                value={formData.section}
                onChangeText={(text) => setFormData({ ...formData, section: text })}
              />
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
                placeholder="School Year"
                placeholderTextColor="#888"
                value={formData.schoolYear}
                onChangeText={(text) => setFormData({ ...formData, schoolYear: text })}
              />
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-6"
                placeholder="Description (optional)"
                placeholderTextColor="#888"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                className="bg-primary rounded-lg px-4 py-3 items-center"
                onPress={handleAddClass}
                disabled={createMutation.isPending}
              >
                <Text className="text-background font-bold">
                  {createMutation.isPending ? "Creating..." : "Create Class"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Class Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-2xl p-6 gap-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-foreground text-xl font-bold">Edit Class</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Text className="text-muted text-2xl">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
                placeholder="Class Name"
                placeholderTextColor="#888"
                value={formData.className}
                onChangeText={(text) => setFormData({ ...formData, className: text })}
              />
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
                placeholder="Subject"
                placeholderTextColor="#888"
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
              />
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
                placeholder="Section (e.g., A, B, C)"
                placeholderTextColor="#888"
                value={formData.section}
                onChangeText={(text) => setFormData({ ...formData, section: text })}
              />
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-3"
                placeholder="School Year"
                placeholderTextColor="#888"
                value={formData.schoolYear}
                onChangeText={(text) => setFormData({ ...formData, schoolYear: text })}
              />
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground mb-6"
                placeholder="Description (optional)"
                placeholderTextColor="#888"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                className="bg-primary rounded-lg px-4 py-3 items-center"
                onPress={handleEditClass}
                disabled={updateMutation.isPending}
              >
                <Text className="text-background font-bold">
                  {updateMutation.isPending ? "Updating..." : "Update Class"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
