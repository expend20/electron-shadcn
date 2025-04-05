const path = require('path');
const fs = require('fs');

// This script will print the location of the app logs without needing to run the full app
// You can run it with: node find-logs.js

// Get the app name from package.json
let appName;
try {
  const packageJson = require('./package.json');
  appName = packageJson.name;
  console.log(`App name from package.json: ${appName}`);
} catch (error) {
  console.error('Could not read package.json:', error);
  appName = 'electron-shadcn';
}

// Calculate the standard Electron userData path for different platforms
function getUserDataPath() {
  const platform = process.platform;
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  
  let appDataPath;
  
  if (platform === 'win32') {
    appDataPath = process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');
    return path.join(appDataPath, appName);
  } else if (platform === 'darwin') {
    return path.join(homeDir, 'Library', 'Application Support', appName);
  } else {
    // Linux
    const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config');
    return path.join(xdgConfigHome, appName);
  }
}

// Get potential log file paths
function getPotentialLogPaths() {
  const userDataPath = getUserDataPath();
  
  return [
    path.join(userDataPath, 'app-logs.txt'),
    path.join(userDataPath, 'logs.txt'),
    path.join(userDataPath, 'main.log'),
    path.join(process.cwd(), 'app-logs.txt'),
    path.join(process.cwd(), 'logs', 'app-logs.txt'),
    path.join(process.cwd(), 'debug-output.log'),
  ];
}

// Main function
function findLogs() {
  console.log('Searching for log files...');
  console.log('User data directory should be at:', getUserDataPath());
  
  const potentialPaths = getPotentialLogPaths();
  
  console.log('\nChecking these locations:');
  let foundLogs = false;
  
  potentialPaths.forEach(logPath => {
    console.log(`- ${logPath}`);
    if (fs.existsSync(logPath)) {
      console.log(`  ✓ FOUND! Log file exists at this location`);
      
      try {
        // Print last few lines of the log
        const logContent = fs.readFileSync(logPath, 'utf8');
        const logLines = logContent.split('\n').filter(line => line.trim());
        
        console.log('\nLast 10 log entries:');
        logLines.slice(-10).forEach(line => console.log(line));
        
        foundLogs = true;
      } catch (err) {
        console.log(`  Error reading log file: ${err.message}`);
      }
    }
  });
  
  if (!foundLogs) {
    console.log('\nNo log files found at the expected locations.');
    
    // If on Windows, look at common temp directories
    if (process.platform === 'win32') {
      console.log('\nChecking Windows temp directories:');
      const tempDirs = [
        process.env.TEMP,
        process.env.TMP,
        'C:\\Windows\\Temp'
      ];
      
      tempDirs.forEach(dir => {
        if (!dir || !fs.existsSync(dir)) return;
        
        console.log(`Looking in ${dir}...`);
        try {
          const files = fs.readdirSync(dir);
          const logFiles = files.filter(f => 
            f.includes(appName) || 
            f.includes('electron') || 
            f.endsWith('.log') || 
            f.endsWith('.txt')
          ).slice(0, 10); // Limit to first 10 matches
          
          if (logFiles.length > 0) {
            console.log('Potential log files:');
            logFiles.forEach(file => console.log(`- ${path.join(dir, file)}`));
          }
        } catch (err) {
          console.log(`Could not read directory: ${err.message}`);
        }
      });
    }
  }
}

findLogs();