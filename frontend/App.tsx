import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Button,
  TextInput,
  Keyboard,
  TouchableOpacity, // Import TouchableOpacity for a more flexible button style
} from 'react-native';

import { AntDesign } from '@expo/vector-icons'; // Import an icon library if you prefer icons over text buttons

// Define the type for a Todo item based on your server response
interface Todo {
  id: number; // Assuming each todo has a unique ID
  title: string; // Or whatever property holds the todo text/title
  // Add other properties if they exist, e.g., completed: boolean;
}

// *** IMPORTANT: Replace with your actual API endpoint ***
// For POST requests, the endpoint is often the same as the GET endpoint for the collection.
// For DELETE requests, it's typically API_URL/id
const API_URL = 'https://demo-backend-s8r24.ondigitalocean.app';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true); // State for initial load
  const [isRefreshing, setIsRefreshing] = useState(false); // State for pull-to-refresh
  const [error, setError] = useState<string | null>(null); // State to track errors

  // --- State for Adding Todo ---
  const [isAddingTodo, setIsAddingTodo] = useState(false); // Controls visibility of input area
  const [newTodoTitle, setNewTodoTitle] = useState(''); // Holds the text input value
  const [isSavingTodo, setIsSavingTodo] = useState(false); // State for saving indicator
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null); // Feedback message after save
  // --- End State for Adding Todo ---

  // --- State for Deleting Todo ---
  // Using a Set to easily check if an ID is currently being deleted
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null); // Optional feedback for delete
  // --- End State for Deleting Todo ---


  // Function to fetch data - reusable for initial load and refreshing
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { _, todos } = await response.json();
      const data: Todo[] = todos;
      setTodos(data);
      setError(null); // Clear any previous errors on successful fetch
    } catch (e: any) {
      console.error('Error fetching todos:', e);
      setError(e.message || 'An error occurred fetching todos.');
      // setTodos([]); // Optionally clear existing todos on error during refresh if you want
    }
  }, []); // Empty dependency array because API_URL is a constant

  // Effect for initial data fetch on component mount
  useEffect(() => {
    setLoading(true); // Start loading indicator
    fetchData().finally(() => setLoading(false)); // Stop loading indicator when fetch is done
  }, [fetchData]); // fetchData is a dependency since it's defined outside useEffect

  // Function to handle the pull-to-refresh action
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true); // Start refreshing indicator
    await fetchData(); // Fetch data
    setIsRefreshing(false); // Stop refreshing indicator when fetch is done
  }, [fetchData]); // fetchData is a dependency

  // --- Functions for Adding Todo (from previous step) ---

  const handleAddButtonPress = () => {
    setIsAddingTodo(true); // Show the input area
    setSaveFeedback(null); // Clear previous feedback
  };

  const handleCancelAdd = () => {
    setIsAddingTodo(false); // Hide the input area
    setNewTodoTitle(''); // Clear the input field
    setSaveFeedback(null); // Clear previous feedback
    Keyboard.dismiss(); // Dismiss the keyboard
  };

  const handleSaveTodo = useCallback(async () => {
    if (!newTodoTitle.trim()) { // Prevent saving empty title
      setSaveFeedback('Todo title cannot be empty.');
      return;
    }

    setIsSavingTodo(true); // Show saving indicator
    setSaveFeedback(null); // Clear previous feedback
    Keyboard.dismiss(); // Dismiss keyboard before saving

    // *** IMPORTANT: Adjust the request body structure to match your backend ***
    const todoDataToSend = {
      title: newTodoTitle,
      // Add other default properties your backend might expect, e.g., completed: false
    };

    try {
      const response = await fetch(API_URL, { // Assuming POST to the same API_URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers your backend requires (e.g., authentication tokens)
        },
        body: JSON.stringify(todoDataToSend),
      });

      if (!response.ok) {
        // Attempt to read error message from backend response body if available
        const errorBody = await response.text(); // or .json() if backend returns JSON errors
        throw new Error(`Failed to add todo: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`);
      }

      // We could read the response and add the item directly, but re-fetching is simpler here
      await fetchData(); // Re-fetch the list to include the new todo

      setNewTodoTitle(''); // Clear input
      setIsAddingTodo(false); // Hide input area
      setSaveFeedback('Todo added successfully!');

      // Optional: Clear feedback after a few seconds
      setTimeout(() => {
        setSaveFeedback(null);
      }, 3000);

    } catch (e: any) {
      console.error('Error saving todo:', e);
      setSaveFeedback(e.message || 'An error occurred while saving todo.');
      // Keep input area open to allow user to try again
    } finally {
      setIsSavingTodo(false); // Stop saving indicator
    }
  }, [newTodoTitle, fetchData]); // Depend on newTodoTitle and fetchData

  // --- End Functions for Adding Todo ---

  // --- New Function for Deleting Todo ---
  const deleteTodo = useCallback(async (id: number) => {
    // Prevent deleting if this ID is already being deleted
    if (deletingIds.has(id)) {
      return;
    }

    // Add ID to the set of deleting IDs
    setDeletingIds(prev => new Set(prev).add(id));
    setDeleteFeedback(null); // Clear previous delete feedback

    // *** IMPORTANT: Adjust the DELETE URL structure to match your backend ***
    const deleteUrl = `${API_URL}/${id}`; // Assuming DELETE endpoint is API_URL/id

    try {
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          // Add any headers your backend requires (e.g., authentication tokens)
        },
      });

      if (!response.ok) {
        const errorBody = await response.text(); // or .json()
        throw new Error(`Failed to delete todo ${id}: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`);
      }

      // If successful, remove the item from the local state directly
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      setDeleteFeedback(`Todo ${id} deleted successfully!`);

      // Optional: Clear feedback after a few seconds
      setTimeout(() => {
        setDeleteFeedback(null);
      }, 3000);


    } catch (e: any) {
      console.error('Error deleting todo:', e);
      setDeleteFeedback(e.message || `An error occurred while deleting todo ${id}.`);
    } finally {
      // Remove ID from the set of deleting IDs
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [deletingIds, setTodos]); // Depend on deletingIds and setTodos

  // --- End New Function for Deleting Todo ---


  // Function to render each individual todo item
  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      {/* Optional: Show a spinner next to the item while deleting */}
      {deletingIds.has(item.id) && (
        <ActivityIndicator size="small" color="#888" style={{ marginRight: 10 }} />
      )}
      <Text style={styles.todoText}>{item.title}</Text>
      {/* Add other details here if needed */}

      {/* Delete Button */}
      {/* Using TouchableOpacity with text, you could replace with <AntDesign name="delete" size={24} color="red" /> if using icons */}
      <TouchableOpacity
        onPress={() => deleteTodo(item.id)} // Call deleteTodo with the item's ID
        style={styles.deleteButton}
        disabled={deletingIds.has(item.id)} // Disable button if this item is being deleted
      >
        {/* Show text or a specific smaller indicator if deleting */}
        {deletingIds.has(item.id) ? (
          <Text style={styles.deleteButtonTextDisabled}>...</Text> // Indicate state
        ) : (
          <Text style={styles.deleteButtonText}>X</Text> // Or replace with icon
        )}
      </TouchableOpacity>

    </View>
  );

  // --- Conditional rendering for initial state ---
  if (loading && todos.length === 0) { // Only show full loading screen if no data is loaded yet
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading todos...</Text>
      </SafeAreaView>
    );
  }
  if (error && todos.length === 0 && !isRefreshing && !loading) { // Only show full error screen if no data and not loading/refreshing
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }
  // --- End conditional rendering for initial state ---


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>My Todos</Text>

      {/* Conditional render for adding todo area */}
      {isAddingTodo ? (
        <View style={styles.addTodoContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter new todo title"
            value={newTodoTitle}
            onChangeText={setNewTodoTitle} // Update state on text change
            editable={!isSavingTodo} // Disable input while saving
          />
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={handleCancelAdd}
              color="#888" // Muted color for cancel
              disabled={isSavingTodo} // Disable while saving
            />
            <Button
              title={isSavingTodo ? 'Saving...' : 'Save Todo'}
              onPress={handleSaveTodo}
              disabled={isSavingTodo || !newTodoTitle.trim()} // Disable while saving or if title is empty
            />
          </View>
          {/* Display save feedback message */}
          {saveFeedback && <Text style={[styles.feedbackText, { color: saveFeedback.includes('Error') ? 'red' : 'green' }]}>{saveFeedback}</Text>}
        </View>
      ) : (
        // Show "Add Todo" button when not adding
        <View style={styles.addButtonContainer}>
          <Button
            title="Add New Todo"
            onPress={handleAddButtonPress}
          />
        </View>
      )}

      {/* Display main fetch error message (if any error occurred during fetch but some data exists) */}
      {error && todos.length > 0 && <Text style={styles.errorTextSmall}>{error}</Text>}

      {/* Display delete feedback message */}
      {deleteFeedback && <Text style={[styles.feedbackText, { color: deleteFeedback.includes('Error') ? 'red' : 'green' }]}>{deleteFeedback}</Text>}


      {/* Render list or "No todos found" message */}
      {todos.length === 0 && !loading && !isRefreshing && !isAddingTodo && !error && !saveFeedback && !deleteFeedback ? ( // Adjust condition slightly
        <Text style={styles.noTodosText}>No todos found.</Text> // Added a style for this
      ) : (
        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        // Optional: Prevent scrolling/interactions with the list while adding/saving
        // pointerEvents={isAddingTodo || isSavingTodo ? 'none' : 'auto'}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center', // Align items within SafeAreaView if needed for centering
    // justifyContent: 'center', // Justify content within SafeAreaView if needed for centering
    paddingTop: StatusBar.currentHeight, // Add padding for status bar on Android
  },
  listContainer: {
    // alignItems: 'center', // Optionally center list items if they don't take full width
    paddingHorizontal: 10,
    paddingBottom: 20, // Add padding at the bottom
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center', // Center the title
  },
  // --- Updated todoItem style with flexbox ---
  todoItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row', // Arrange children in a row
    alignItems: 'center', // Vertically align items in the row
    justifyContent: 'space-between', // Put space between text and button
    width: '100%',
  },
  todoText: {
    fontSize: 18,
    flex: 1, // Allow text to take up available space
    marginRight: 10, // Add space between text and button
  },
  // --- End Updated todoItem style ---
  errorText: { // For full-screen error
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorTextSmall: { // For error shown alongside list
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  noTodosText: { // Style for "No todos found" message
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  // --- Styles for Adding Todo ---
  addButtonContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  addTodoContainer: {
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#eef', // Light background for input area
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Space out buttons
    marginTop: 5,
  },
  feedbackText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    // color is set conditionally in the component
  },
  // --- End Styles for Adding Todo ---

  // --- New Styles for Delete Button ---
  deleteButton: {
    backgroundColor: 'red',
    borderRadius: 15, // Make it roundish
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10, // Space from text
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButtonTextDisabled: {
    color: '#ccc', // Muted color when disabled
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- End New Styles for Delete Button ---
});