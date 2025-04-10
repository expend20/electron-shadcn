// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Vite
// plugin that tells the Electron app where to look for the Vite-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Preload types
interface ThemeModeContext {
  toggle: () => Promise<boolean>;
  dark: () => Promise<void>;
  light: () => Promise<void>;
  system: () => Promise<boolean>;
  current: () => Promise<"dark" | "light" | "system">;
}
interface ElectronWindow {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
}

// Todo database API types
interface TodoDB {
  getAll: () => Promise<import('./types/todo').Todo[]>;
  add: (todo: Omit<import('./types/todo').Todo, 'order'>) => Promise<void>;
  toggle: (id: string, completed: boolean) => Promise<void>;
  edit: (id: string, text: string) => Promise<void>;
  delete: (id: string) => Promise<void>;
  updateOrder: (todosOrder: Array<{ id: string; order: number }>) => Promise<void>;
}

declare interface Window {
  themeMode: ThemeModeContext;
  electronWindow: ElectronWindow;
  todoDB: TodoDB;
}
