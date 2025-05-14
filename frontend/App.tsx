import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StatusBar,
  Button,
  TextInput,
  Keyboard,
  TouchableOpacity,
} from 'react-native';

interface Todo {
  id: number;
  title: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [deleteId, setDeleteId] = useState(0);

  const fetchTodos = useCallback(async () => {
    const response = await fetch(API_URL);
    const data: Todo[] = await response.json();
    setTodos(data);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleRefresh = useCallback(async () => {
    await fetchTodos();
  }, [fetchTodos]);

  const handleAddButtonPress = () => {
    setIsAddingTodo(true);
  };

  const handleCancelButtonPress = () => {
    setIsAddingTodo(false);
    setNewTodoTitle('');
    Keyboard.dismiss();
  };

  const handleSaveTodo = useCallback(async () => {
    Keyboard.dismiss();
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTodoTitle }),
    });

    await fetchTodos();

    setNewTodoTitle('');
    setIsAddingTodo(false);
  }, [newTodoTitle, fetchTodos]);

  const deleteTodo = useCallback(async (id: number) => {
    setDeleteId(id);
    const deleteUrl = `${API_URL}/${id}`;
    await fetch(deleteUrl, { method: 'DELETE' });
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    setDeleteId(0);
  }, [deleteId, setTodos]);

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={
      { flexDirection: "row", marginVertical: 5, borderRadius: 5, borderWidth: 1, padding: 15, alignItems: "center" }
    }>
      <Text style={{ flex: 1, fontSize: 20 }}>{item.title}</Text>
      <TouchableOpacity onPress={() => deleteTodo(item.id)}>
        <Text style={{ color: "red", paddingLeft: 10 }}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar />
      <Text style={{ fontSize: 28, fontWeight: "bold", marginVertical: 20, textAlign: "center" }}>My Todos</Text>

      {
        isAddingTodo ? (
          <View style={{ paddingVertical: 10 }}>
            <TextInput
              style={{ height: 40, fontSize: 20, textAlign: "center" }}
              placeholder="Enter new todo title"
              value={newTodoTitle}
              onChangeText={setNewTodoTitle}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 5 }}>
              <Button title="Cancel" onPress={handleCancelButtonPress} color="#888" />
              <Button title={'Save Todo'} onPress={handleSaveTodo} disabled={!newTodoTitle.trim()} />
            </View>
          </View>
        ) : (
          <View style={{ marginVertical: 20 }}>
            <Button title="Add New Todo" onPress={handleAddButtonPress} />
          </View>
        )
      }

      {
        todos.length === 0 ? (
          <Text style={{ textAlign: "center", fontSize: 20, color: "gray", marginTop: 10 }}>No todos found.</Text>
        ) : (
          <FlatList
            data={todos}
            renderItem={renderTodoItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            refreshing={false}
            onRefresh={handleRefresh}
          />
        )
      }
    </SafeAreaView >
  );
}