import React, { createContext, useContext, useState, useEffect } from "react";
import { Todo } from "@/types/todo";

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  reorderTodos: (newOrder: Todo[]) => void;
  loading: boolean;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load todos from SQLite database on component mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setLoading(true);
        const todoData = await window.todoDB.getAll();
        setTodos(todoData);
      } catch (error) {
        console.error("Failed to load todos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, []);

  const addTodo = async (text: string) => {
    const tempId = crypto.randomUUID();
    const newTodo = {
      id: tempId,
      text,
      completed: false,
      createdAt: new Date(),
      order: -1
    };
    
    setTodos((prev) => [newTodo, ...prev]);

    try {
      const todoToSend = { 
        id: newTodo.id,
        text: newTodo.text,
        completed: newTodo.completed,
        createdAt: newTodo.createdAt
      };
      await window.todoDB.add(todoToSend);
    } catch (error) {
      console.error("Failed to add todo:", error);
      setTodos((prev) => prev.filter(todo => todo.id !== tempId));
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;
      
      const newCompletedState = !todo.completed;
      
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: newCompletedState } : t
        )
      );

      await window.todoDB.toggle(id, newCompletedState);
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      const originalTodo = todos.find((t) => t.id === id);
      if (originalTodo) {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, completed: originalTodo.completed } : t
          )
        );
      }
    }
  };

  const removeTodo = async (id: string) => {
    const originalTodos = [...todos];
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

    try {
      await window.todoDB.delete(id);
      const remainingTodos = originalTodos.filter(t => t.id !== id);
      const todosOrder = remainingTodos.map((todo, index) => ({ id: todo.id, order: index }));
      await window.todoDB.updateOrder(todosOrder);

    } catch (error) {
      console.error("Failed to remove todo:", error);
      setTodos(originalTodos);
    }
  };

  const editTodo = async (id: string, text: string) => {
    const originalTodo = todos.find((t) => t.id === id);
    if (!originalTodo) return;
    const originalText = originalTodo.text;

    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text } : todo))
    );

    try {
      await window.todoDB.edit(id, text);
    } catch (error) {
      console.error("Failed to edit todo:", error);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, text: originalText } : todo))
      );
    }
  };

  const reorderTodos = async (newOrder: Todo[]) => {
    setTodos(newOrder);

    const todosOrder = newOrder.map((todo, index) => ({
      id: todo.id,
      order: index,
    }));

    try {
      await window.todoDB.updateOrder(todosOrder);
    } catch (error) {
      console.error("Failed to update todo order:", error);
    }
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, removeTodo, editTodo, reorderTodos, loading }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodo() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
}