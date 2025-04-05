import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';

declare global {
  interface Window {
    electronDebug: {
      showLogs: () => Promise<string>;
      getAppInfo: () => {
        versions: Record<string, string>;
        platform: string;
        arch: string;
      };
    };
  }
}

export const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [appInfo, setAppInfo] = useState<any>(null);

  useEffect(() => {
    if (window.electronDebug) {
      setAppInfo(window.electronDebug.getAppInfo());
    }
  }, []);

  const handleShowLogs = async () => {
    if (window.electronDebug) {
      await window.electronDebug.showLogs();
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Listen for Ctrl+Shift+D to toggle the debug panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        toggleVisibility();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-0 right-0 p-2 z-50">
        <div 
          className="text-xs opacity-50 hover:opacity-100 cursor-pointer"
          onClick={toggleVisibility}
        >
          Debug
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 p-4 bg-gray-100 dark:bg-gray-800 border shadow-lg z-50 max-w-md overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Panel</h3>
        <Button variant="ghost" size="sm" onClick={toggleVisibility}>Close</Button>
      </div>

      <div className="text-xs space-y-2">
        <div>
          <Button variant="outline" size="sm" onClick={handleShowLogs}>
            Show Logs
          </Button>
          <span className="ml-2">Press F12 to open DevTools</span>
        </div>

        {appInfo && (
          <div>
            <h4 className="font-semibold">App Info:</h4>
            <div className="pl-2">
              <div>Platform: {appInfo.platform}</div>
              <div>Architecture: {appInfo.arch}</div>
              <div>Electron: {appInfo.versions.electron}</div>
              <div>Chrome: {appInfo.versions.chrome}</div>
              <div>Node: {appInfo.versions.node}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};