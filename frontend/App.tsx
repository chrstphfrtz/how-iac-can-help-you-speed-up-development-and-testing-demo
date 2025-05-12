import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator, // Optional: Add a loading indicator
  SafeAreaView, // To handle notches and status bar
  StatusBar, // To handle status bar style
} from 'react-native';

// Define the type for a Todo item based on your server response
// Adjust this interface to match the actual structure of your JSON objects
interface Todo {
  id: number; // Assuming each todo has a unique ID
  title: string; // Or whatever property holds the todo text/title
  // Add other properties if they exist, e.g., completed: boolean;
}

// *** IMPORTANT: Replace with your actual API endpoint ***
const API_URL = 'YOUR_SERVER_TODO_LIST_API_ENDPOINT';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true); // State to track loading
  const [error, setError] = useState<string | null>(null); // State to track errors

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(API_URL);

        // Check if the request was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Todo[] = await response.json();
        setTodos(data);
      } catch (e: any) {
        console.error('Error fetching todos:', e);
        setError(e.message || 'An error occurred fetching todos.');
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchTodos();
  }, []); // Empty dependency array means this effect runs only once after the initial render

  // Function to render each individual todo item in the list
  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <Text style={styles.todoText}>{item.title}</Text>
      {/* Add other details here if needed, e.g., a checkbox for completed */}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading todos...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" /> {/* Optional: Control status bar appearance */}
      <Text style={styles.title}>My Todos</Text>

      {todos.length === 0 ? (
        <Text>No todos found.</Text>
      ) : (
        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id.toString()} // Use a unique key for each item
          contentContainerStyle={styles.listContainer} // Style for the content inside the list
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center', // Centering initially for loading/error
    paddingTop: StatusBar.currentHeight, // Add padding for status bar on Android
  },
  listContainer: {
    alignSelf: 'stretch', // Make list content take full width
    paddingHorizontal: 10, // Add some horizontal padding
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  todoItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%', // Ensure item takes full width
  },
  todoText: {
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});