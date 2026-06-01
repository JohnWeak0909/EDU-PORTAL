import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function StudentAssignmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isSubmissionModalVisible, setIsSubmissionModalVisible] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<string>("");

  const assignmentsQuery = trpc.studentDashboard.myAssignments.useQuery();
  const submissionsQuery = trpc.studentDashboard.mySubmissions.useQuery();
  const createSubmissionMutation = trpc.submissions.create.useMutation();
  const updateSubmissionMutation = trpc.submissions.updateStatus.useMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    await assignmentsQuery.refetch();
    await submissionsQuery.refetch();
    setRefreshing(false);
  };

  const getAssignmentStatus = (assignmentId: number) => {
    const submission = submissionsQuery.data?.find(s => s.assignmentId === assignmentId);
    return submission?.status || "pending";
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !submissionFile) {
      Alert.alert("Error", "Please select a file to submit");
      return;
    }

    try {
      const existingSubmission = submissionsQuery.data?.find(s => s.assignmentId === selectedAssignment.id);
      
      if (existingSubmission) {
        await updateSubmissionMutation.mutateAsync({
          id: existingSubmission.id,
          status: "submitted",
          submittedAt: new Date(),
        });
      } else {
        await createSubmissionMutation.mutateAsync({
          assignmentId: selectedAssignment.id,
        });
      }

      Alert.alert("Success", "Assignment submitted successfully");
      setSubmissionFile("");
      setIsSubmissionModalVisible(false);
      setSelectedAssignment(null);
      await submissionsQuery.refetch();
    } catch (error) {
      Alert.alert("Error", "Failed to submit assignment");
    }
  };

  const isDueToday = (dueDate: Date) => {
    const today = new Date().toDateString();
    return new Date(dueDate).toDateString() === today;
  };

  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const renderAssignmentCard = (assignment: any) => {
    const status = getAssignmentStatus(assignment.id);
    const dueDate = new Date(assignment.dueDate);
    const isOverdueAssignment = isOverdue(dueDate);
    const isDueTodayAssignment = isDueToday(dueDate);

    return (
      <View 
        key={assignment.id} 
        className="bg-surface rounded-lg p-4 mb-3 border border-border"
      >
        <View className="flex-row justify-between items-start gap-3">
          <View className="flex-1">
            <Text className="text-foreground font-semibold text-base">{assignment.title}</Text>
            <Text className="text-muted text-xs mt-1">by {assignment.className}</Text>
            {assignment.description && (
              <Text className="text-muted text-xs mt-2 leading-4">{assignment.description}</Text>
            )}
            <View className="flex-row gap-2 mt-3">
              <View className={`px-2 py-1 rounded ${isOverdueAssignment ? "bg-red-500/20" : isDueTodayAssignment ? "bg-yellow-500/20" : "bg-blue-500/20"}`}>
                <Text className={`text-xs font-semibold ${isOverdueAssignment ? "text-red-500" : isDueTodayAssignment ? "text-yellow-500" : "text-blue-500"}`}>
                  Due: {formatDate(dueDate)}
                </Text>
              </View>
              {assignment.maxScore && (
                <View className="bg-primary/20 px-2 py-1 rounded">
                  <Text className="text-xs font-semibold text-primary">Max Score: {assignment.maxScore}</Text>
                </View>
              )}
            </View>
          </View>
          <View className={`px-2 py-1 rounded ${status === "graded" ? "bg-green-500/20" : status === "submitted" ? "bg-blue-500/20" : "bg-gray-500/20"}`}>
            <Text className={`text-xs font-semibold ${status === "graded" ? "text-green-500" : status === "submitted" ? "text-blue-500" : "text-gray-500"}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        </View>

        {assignment.instructions && (
          <View className="mt-3 bg-background rounded px-3 py-2">
            <Text className="text-muted text-xs font-semibold mb-1">Instructions:</Text>
            <Text className="text-muted text-xs">{assignment.instructions}</Text>
          </View>
        )}

        <View className="flex-row gap-2 mt-4">
          <TouchableOpacity
            className="flex-1 bg-primary/20 px-3 py-2 rounded items-center active:opacity-70"
            onPress={() => {
              setSelectedAssignment(assignment);
              setIsSubmissionModalVisible(true);
            }}
          >
            <Text className="text-primary font-semibold text-xs">Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-primary/40 px-3 py-2 rounded items-center active:opacity-70"
            onPress={() => {
              Alert.alert("Assignment Details", assignment.title + "\n\n" + (assignment.instructions || assignment.description || "No details available"));
            }}
          >
            <Text className="text-primary font-semibold text-xs">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
          <Text className="text-background/90 text-sm">My Assignments</Text>
          <Text className="text-background text-2xl font-bold">Assignments</Text>
        </View>

        {/* Assignments List */}
        <View className="px-6 py-4">
          {assignmentsQuery.isLoading ? (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-muted text-sm">Loading assignments...</Text>
            </View>
          ) : assignmentsQuery.data && assignmentsQuery.data.length > 0 ? (
            assignmentsQuery.data.map(renderAssignmentCard)
          ) : (
            <View className="bg-surface rounded-lg p-6 border border-border items-center">
              <Text className="text-4xl mb-2">📋</Text>
              <Text className="text-muted text-sm">No assignments available</Text>
              <Text className="text-muted text-xs mt-1">Enroll in classes to see assignments</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submission Modal */}
      <Modal visible={isSubmissionModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-2xl p-6 gap-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-foreground text-xl font-bold">Submit Assignment</Text>
              <TouchableOpacity onPress={() => setIsSubmissionModalVisible(false)}>
                <Text className="text-muted text-2xl">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {selectedAssignment && (
                <>
                  <Text className="text-foreground font-semibold mb-2">{selectedAssignment.title}</Text>

                  <View className="bg-surface border border-border rounded-lg p-4 mb-4">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-muted text-xs">Assignment Title</Text>
                      <Text className="text-foreground font-semibold text-sm">{selectedAssignment.title}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-muted text-xs">Due Date</Text>
                      <Text className="text-foreground font-semibold text-sm">{formatDate(selectedAssignment.dueDate)}</Text>
                    </View>
                    {selectedAssignment.maxScore && (
                      <View className="flex-row justify-between">
                        <Text className="text-muted text-xs">Max Score</Text>
                        <Text className="text-foreground font-semibold text-sm">{selectedAssignment.maxScore}</Text>
                      </View>
                    )}
                  </View>

                  <Text className="text-foreground font-semibold mb-2">Select File</Text>
                  <TouchableOpacity
                    className="bg-surface border-2 border-dashed border-primary rounded-lg px-4 py-6 items-center mb-4"
                    onPress={() => setSubmissionFile("selected_file.pdf")}
                  >
                    <Text className="text-2xl mb-2">📎</Text>
                    <Text className="text-primary font-semibold text-sm">
                      {submissionFile ? submissionFile : "Choose File"}
                    </Text>
                    <Text className="text-muted text-xs mt-1">Supported: PDF, DOCX, PPTX, JPG, PNG</Text>
                  </TouchableOpacity>

                  <View className="bg-blue-500/20 rounded-lg p-3 mb-4">
                    <Text className="text-blue-500 text-xs">
                      💡 Are you sure you want to submit this assignment? You can submit only once.
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="bg-primary rounded-lg px-4 py-3 items-center"
                    onPress={handleSubmitAssignment}
                    disabled={!submissionFile || createSubmissionMutation.isPending}
                  >
                    <Text className="text-background font-bold">
                      {createSubmissionMutation.isPending ? "Submitting..." : "Submit Assignment"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
