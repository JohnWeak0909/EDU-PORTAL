import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              {this.state.error.message || "An unexpected error occurred."}
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => this.setState({ error: null })}>
              <Text style={styles.buttonText}>Try again</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 24,
    justifyContent: "center",
  },
  content: {
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#11181C",
  },
  message: {
    fontSize: 14,
    color: "#687076",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#0a7ea4",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
