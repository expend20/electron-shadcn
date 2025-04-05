import { contextBridge, ipcRenderer } from 'electron';
import { Todo } from '@/types/todo';
import { TODO_CHANNELS } from './todo-channels';

/**
 * Expose todo IPC methods to the renderer process
 */
export function exposeTodoContext() {
  contextBridge.exposeInMainWorld('todoDB', {
    // Get all todos
    getAll: async (): Promise<Todo[]> => {
      return ipcRenderer.invoke(TODO_CHANNELS.GET_ALL);
    },

    // Add a new todo
    add: async (todo: Omit<Todo, 'order'>): Promise<void> => {
      return ipcRenderer.invoke(TODO_CHANNELS.ADD, todo);
    },

    // Toggle todo completion status
    toggle: async (id: string, completed: boolean): Promise<void> => {
      return ipcRenderer.invoke(TODO_CHANNELS.TOGGLE, id, completed);
    },

    // Edit todo text
    edit: async (id: string, text: string): Promise<void> => {
      return ipcRenderer.invoke(TODO_CHANNELS.EDIT, id, text);
    },

    // Delete todo
    delete: async (id: string): Promise<void> => {
      return ipcRenderer.invoke(TODO_CHANNELS.DELETE, id);
    },

    // Update todo order
    updateOrder: async (todosOrder: Array<{ id: string; order: number }>): Promise<void> => {
      return ipcRenderer.invoke(TODO_CHANNELS.UPDATE_ORDER, todosOrder);
    }
  });
}