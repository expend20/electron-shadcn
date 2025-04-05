const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the app path from the out directory
function findAppExecutable() {
  const outDir = path.join(__dirname, 'out');
  
  if (!fs.existsSync(outDir)) {
    console.error('Error: No "out" directory found. Have you packaged the app with `npm run package`?');
    process.exit(1);
  }

  // Check for .exe on Windows
  if (process.platform === 'win32') {
    const exeFolders = fs.readdirSync(outDir).filter(folder => folder.includes('-win32-x64'));
    
    if (exeFolders.length === 0) {
      console.error('Error: No Windows executable folder found in the "out" directory.');
      process.exit(1);
    }
    
    const exeFolder = exeFolders[0]; // Use the first matching folder
    
    // Find any exe in the folder, don't rely on specific naming
    const folderPath = path.join(outDir, exeFolder);
    const files = fs.readdirSync(folderPath);
    const exeFile = files.find(file => file.endsWith('.exe'));
    
    if (!exeFile) {
      console.error(`Error: No executable found in folder: ${folderPath}`);
      process.exit(1);
    }
    
    const exePath = path.join(folderPath, exeFile);
    console.log(`Found executable: ${exePath}`);
    
    return exePath;
  }
  
  // Add support for Mac and Linux if needed
  console.error('Error: Only Windows is supported by this script currently.');
  process.exit(1);
}

// Configure environment variables for debugging
const debugEnv = {
  ...process.env,
  ELECTRON_ENABLE_LOGGING: '1',
  ELECTRON_ENABLE_STACK_DUMPING: '1',
  NODE_ENV: 'development', // Force development mode
  DEBUG: 'electron*,v8*' // Enable Node.js debugging
};

// Run the app with debug flags
function runWithDebug() {
  const appPath = findAppExecutable();
  console.log(`Starting app in debug mode: ${appPath}`);
  
  // Create a log file for stdout/stderr
  const logStream = fs.createWriteStream(path.join(__dirname, 'debug-output.log'), { flags: 'a' });
  logStream.write(`\n\n--- Debug session started at ${new Date().toISOString()} ---\n`);
  
  // Launch with debug flags
  const child = spawn(appPath, [
    '--disable-http-cache',
    '--trace-warnings',
    '--js-flags="--expose_gc --trace-gc"',
    '--auto-open-devtools-for-tabs'
  ], { 
    env: debugEnv,
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  // Pipe stdout/stderr to console and log file
  child.stdout.on('data', (data) => {
    console.log(data.toString());
    logStream.write(data);
  });
  
  child.stderr.on('data', (data) => {
    console.error(data.toString());
    logStream.write(data);
  });
  
  child.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
    logStream.write(`\n--- Debug session ended with code ${code} at ${new Date().toISOString()} ---\n`);
    logStream.end();
  });
  
  child.on('error', (err) => {
    console.error('Failed to start process:', err);
    logStream.write(`\n--- Error starting process: ${err.message} ---\n`);
    logStream.end();
  });
}

// Run the app with debugging
runWithDebug();