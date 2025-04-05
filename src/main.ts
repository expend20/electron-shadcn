import { app, BrowserWindow, ipcMain, dialog } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
// "electron-squirrel-startup" seems broken when packaging with vite
//import started from "electron-squirrel-startup";
import path from "path";
import fs from 'fs';
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { DatabaseService } from "./helpers/db/database";

const inDevelopment = process.env.NODE_ENV === "development";

// Setup logging to file
const userDataPath = app.getPath('userData');
const logFilePath = path.join(userDataPath, 'app-logs.txt');

// Show log path on startup - helpful for debugging blank window issues
function showLogPathDialog() {
  logger.log(`Logs are being written to: ${logFilePath}`);
  logger.log(`User data path: ${userDataPath}`);
}

const logger = {
  log: (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}\n`;
    console.log(message);
    fs.appendFileSync(logFilePath, logMessage);
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    const errorStr = error ? `\n${error.stack || error.toString()}` : '';
    const logMessage = `[${timestamp}] ERROR: ${message}${errorStr}\n`;
    console.error(message, error || '');
    fs.appendFileSync(logFilePath, logMessage);
  }
};

// Log startup information immediately
logger.log(`Starting app with Electron v${process.versions.electron}`);
logger.log(`Running in ${inDevelopment ? 'development' : 'production'} mode`);
logger.log(`User data path: ${userDataPath}`);
logger.log(`Log file path: ${logFilePath}`);

function createWindow() {
  logger.log("Starting to create window");
  
  // Show debug dialog with log path - helps with blank window debugging
  showLogPathDialog();
  
  const preload = path.join(__dirname, "preload.js");
  logger.log(`Preload path: ${preload}`);
  logger.log(`preload exists: ${fs.existsSync(preload)}`);
  
  const mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    webPreferences: {
      devTools: true, // Always enable DevTools for debugging
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
      scrollBounce: true, // Enable smooth scrolling
    },
    titleBarStyle: "hidden",
    show: false, // Don't show until ready-to-show
  });
  
  // Log when window is created
  mainWindow.once('ready-to-show', () => {
    logger.log('Window ready to show');
    mainWindow.show();
  });
  
  registerListeners(mainWindow);

  // Add error handling
  mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
    logger.error(`Failed to load: ${errorCode} - ${errorDescription}`);
  });

  // Log all console messages from renderer
  mainWindow.webContents.on('console-message', (_, level, message, line, sourceId) => {
    const levels = ['verbose', 'info', 'warning', 'error'];
    logger.log(`[Renderer Console][${levels[level]}] ${message} (${sourceId}:${line})`);
  });

  // Create a menu item to open the log file
  ipcMain.handle('show-logs', () => {
    if (fs.existsSync(logFilePath)) {
      logger.log(`Logs are stored at: ${logFilePath}`);
    }
    return logFilePath;
  });

  // Add handler to clear todo data
  ipcMain.handle('clear-todo-data', () => {
    const dbService = DatabaseService.getInstance();
    const result = dbService.clearAllData();
    logger.log('Todo data cleared');
    return result;
  });

  // Add handlers for database operations
  ipcMain.handle('get-db-status', () => {
    const dbService = DatabaseService.getInstance();
    const status = dbService.getStatus();
    logger.log(`Database status: ${status}`);
    return status;
  });

  ipcMain.handle('clear-all-data', () => {
    const dbService = DatabaseService.getInstance();
    const result = dbService.clearAllData();
    logger.log(`Clear data result: ${result}`);
    return result;
  });

  // Add key shortcut to open developer tools even in packaged app
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key.toLowerCase() === 'f12' || (input.control && input.key.toLowerCase() === 'i')) {
      logger.log('DevTools hotkey detected, opening DevTools');
      mainWindow.webContents.openDevTools();
      event.preventDefault();
    }
  });
  
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    logger.log(`Loading URL: ${MAIN_WINDOW_VITE_DEV_SERVER_URL}`);
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    const htmlPath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
    logger.log(`Loading file: ${htmlPath}`);
    
    try {
      if (fs.existsSync(htmlPath)) {
        logger.log(`HTML file exists at: ${htmlPath}`);
      } else {
        logger.error(`HTML file does not exist at: ${htmlPath}`);
        
        // Try to find the actual location by exploring various paths
        const rendererDir = path.join(__dirname, '../renderer');
        if (fs.existsSync(rendererDir)) {
          logger.log(`Renderer directory exists. Contents: ${fs.readdirSync(rendererDir).join(', ')}`);
          
          // Try to find index.html in various locations
          const potentialPaths = [
            path.join(rendererDir, 'index.html'),
            path.join(rendererDir, 'main_window', 'index.html'),
            path.join(rendererDir, MAIN_WINDOW_VITE_NAME, 'index.html'),
            path.join(__dirname, 'renderer', 'index.html')
          ];
          
          for (const potentialPath of potentialPaths) {
            logger.log(`Checking for HTML at: ${potentialPath}, exists: ${fs.existsSync(potentialPath)}`);
          }
        } else {
          logger.error(`Renderer directory doesn't exist at: ${rendererDir}`);
          // Look at the parent directories
          logger.log(`__dirname: ${__dirname}`);
          logger.log(`Parent directory contents: ${fs.readdirSync(path.dirname(__dirname)).join(', ')}`);
        }
      }
      
      // Attempt to load the file anyway
      mainWindow.loadFile(htmlPath);
    } catch (error) {
      logger.error('Error loading HTML file:', error);
    }
  }

  logger.log("Window created successfully");
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    logger.log(`Extensions installed successfully: ${result.name}`);
  } catch (error) {
    logger.error("Failed to install extensions", error);
  }
}

// Initialize the database
function initializeDatabase() {
  try {
    // This will create the database file and tables if they don't exist
    DatabaseService.getInstance();
    logger.log('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
  }
}

app.whenReady()
  .then(() => {
    logger.log('App is ready');
    return initializeDatabase();
  })
  .then(() => {
    logger.log('Database initialized');
    return createWindow();
  })
  .then(() => {
    logger.log('Window created');
    if (inDevelopment) {
      return installExtensions();
    }
  })
  .catch((error) => {
    logger.error('Error during app startup:', error);
  });

//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//osX only ends
