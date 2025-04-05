import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import ElectronStore from 'electron-store';

// Import better-sqlite3 using a runtime require instead of an import
// to avoid Vite bundling issues with native modules
// If this fails, the application will throw an error during startup.
const Database = require('better-sqlite3');

interface StoreSchema {
  dbPath: string;
  // Removed todos from StoreSchema as it was only used by the fallback
}

const store = new ElectronStore<StoreSchema>();
const DB_NAME = 'todos.db';

// MemoryDatabaseFallback class removed entirely

export class DatabaseService {
  private static instance: DatabaseService;
  private db: any; // Type could be improved if better-sqlite3 types are available
  // isMemoryFallback flag removed

  private constructor() {
    try {
      // Determine the database path (user data directory)
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, DB_NAME);
      
      console.log('Database path:', dbPath);
      console.log('User data directory:', userDataPath);

      // Store the database path in electron-store for the renderer process to access
      store.set('dbPath' as keyof StoreSchema, dbPath);
      
      // Create directory if it doesn't exist
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Initialize the database connection directly
      // Removed check for sqliteAvailable and fallback logic
      this.db = new Database(dbPath);
        
      // Create todos table if it doesn't exist
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS todos (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          createdAt TEXT NOT NULL,
          "order" INTEGER NOT NULL
        )
      `);
      
      console.log(`Database initialized successfully with SQLite`);
    } catch (error) {
      console.error('CRITICAL: Error initializing SQLite database:', error);
      // If any error occurs during DB initialization, rethrow to halt startup
      // Removed fallback logic
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Get all todos
  public getAllTodos() {
    try {
      const stmt = this.db.prepare(`
        SELECT id, text, completed, createdAt, "order"
        FROM todos
        ORDER BY "order" ASC
      `);
      
      return stmt.all();
    } catch (error) {
      console.error('Error getting todos:', error);
      return []; // Or rethrow, depending on desired error handling
    }
  }

  // Add a new todo
  public addTodo(todo: { id: string; text: string; completed: boolean; createdAt: string }) {
    try {
      // Get the current max order
      const maxOrderStmt = this.db.prepare(`SELECT MAX("order") as maxOrder FROM todos`);
      const result = maxOrderStmt.get();
      const maxOrder = result?.maxOrder ?? -1; // Handle case where table is empty
      const newOrder = maxOrder + 1;

      const stmt = this.db.prepare(`
        INSERT INTO todos (id, text, completed, createdAt, "order")
        VALUES (?, ?, ?, ?, ?)
      `);
      
      return stmt.run(
        todo.id,
        todo.text,
        todo.completed ? 1 : 0,
        todo.createdAt,
        newOrder
      );
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  }

  // Update a todo's completion status
  public toggleTodo(id: string, completed: boolean) {
    try {
      const stmt = this.db.prepare(`
        UPDATE todos
        SET completed = ?
        WHERE id = ?
      `);
      
      return stmt.run(completed ? 1 : 0, id);
    } catch (error) {
      console.error('Error toggling todo:', error);
      throw error;
    }
  }

  // Update a todo's text
  public editTodo(id: string, text: string) {
    try {
      const stmt = this.db.prepare(`
        UPDATE todos
        SET text = ?
        WHERE id = ?
      `);
      
      return stmt.run(text, id);
    } catch (error) {
      console.error('Error editing todo:', error);
      throw error;
    }
  }

  // Delete a todo
  public deleteTodo(id: string) {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM todos
        WHERE id = ?
      `);
      
      return stmt.run(id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  // Update the order of multiple todos
  public updateTodoOrder(todosOrder: Array<{ id: string; order: number }>) {
    // Removed isMemoryFallback check

    // Use a transaction for atomicity and performance with SQLite
    const updateStmt = this.db.prepare(`
      UPDATE todos
      SET "order" = ?
      WHERE id = ?
    `);
    
    const transaction = this.db.transaction((items: Array<{ id: string; order: number }>) => {
      let totalChanges = 0;
      for (const item of items) {
        const result = updateStmt.run(item.order, item.id);
        totalChanges += result.changes;
      }
      return { changes: totalChanges };
    });

    try {
      return transaction(todosOrder);
    } catch (error) {
      console.error('Error updating todo order:', error);
      throw error;
    }
  }

  // Get database status
  public getStatus() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, DB_NAME);
    const storePath = path.join(userDataPath, 'config.json');
    
    return {
      // Removed isMemoryFallback and sqliteAvailable
      dbPath,
      storePath,
      storeExists: fs.existsSync(storePath),
      dbExists: fs.existsSync(dbPath)
    };
  }

  // Clear all data
  public clearAllData() {
    try {
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, DB_NAME);
      
      // Clear SQLite database
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }
      
      // Clear Electron Store data
      // Removed store.delete('todos')
      store.delete('dbPath' as keyof StoreSchema);
      
      // Reinitialize the database (will create a new empty file)
      if (this.db) { // Close existing connection if open
        this.db.close();
      }
      this.db = new Database(dbPath);
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS todos (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0,
          createdAt TEXT NOT NULL,
          "order" INTEGER NOT NULL
        )
      `);
      
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // Close the database connection
  public close() {
    if (this.db) {
      try {
        this.db.close();
      } catch (error) {
        console.error('Error closing database:', error);
      }
    }
  }
}