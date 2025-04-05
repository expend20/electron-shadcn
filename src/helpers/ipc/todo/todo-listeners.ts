import { ipcMain } from 'electron';
import { DatabaseService } from '../../db/database';
import { TODO_CHANNELS } from './todo-channels';
import { Todo } from '@/types/todo';

interface TodoRow {
  id: string;
  text: string;
  completed: number;
  createdAt: string;
  order: number;
}

/**
 * Register IPC listeners for todo operations
 */
export function registerTodoListeners() {
  const dbService = DatabaseService.getInstance();

  // Get all todos
  ipcMain.handle(TODO_CHANNELS.GET_ALL, async () => {
    try {
      const todos = dbService.getAllTodos() as TodoRow[];
      // Convert SQLite integer to boolean and string date to Date object
      return todos.map(todo => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed === 1,
        createdAt: new Date(todo.createdAt),
        order: todo.order
      }));
    } catch (error) {
      console.error('Error getting todos:', error);
      throw error;
    }
  });

  // Add a new todo
  ipcMain.handle(TODO_CHANNELS.ADD, async (_, todo: Omit<Todo, 'order'>) => {
    try {
      // Convert Date object to string for SQLite storage
      const todoToSave = {
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        createdAt: todo.createdAt.toISOString()
      };
      return dbService.addTodo(todoToSave);
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  });

  // Toggle todo completion status
  ipcMain.handle(TODO_CHANNELS.TOGGLE, async (_, id, completed) => {
    try {
      return dbService.toggleTodo(id, completed);
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw error;
    }
  });

  // Edit todo text
  ipcMain.handle(TODO_CHANNELS.EDIT, async (_, id, text) => {
    try {
      return dbService.editTodo(id, text);
    } catch (error) {
      console.error('Error editing todo:', error);
      throw error;
    }
  });

  // Delete todo
  ipcMain.handle(TODO_CHANNELS.DELETE, async (_, id) => {
    try {
      return dbService.deleteTodo(id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  });

  // Update todo order
  ipcMain.handle(TODO_CHANNELS.UPDATE_ORDER, async (_, todosOrder: Array<{ id: string; order: number }>) => {
    try {
      return dbService.updateTodoOrder(todosOrder);
    } catch (error) {
      console.error('Error updating todo order:', error);
      throw error;
    }
  });
}

/**
 * Unregister IPC listeners for todo operations
 */
export function unregisterTodoListeners() {
  ipcMain.removeHandler(TODO_CHANNELS.GET_ALL);
  ipcMain.removeHandler(TODO_CHANNELS.ADD);
  ipcMain.removeHandler(TODO_CHANNELS.TOGGLE);
  ipcMain.removeHandler(TODO_CHANNELS.EDIT);
  ipcMain.removeHandler(TODO_CHANNELS.DELETE);
  ipcMain.removeHandler(TODO_CHANNELS.UPDATE_ORDER);
}