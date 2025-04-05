import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "./helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import "./localization/i18n";
import { router } from "./routes/router";
import { RouterProvider } from "@tanstack/react-router";
import { DebugPanel } from "./components/DebugPanel";

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    syncThemeWithLocal();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <DebugPanel />
    </>
  );
}

const root = createRoot(document.getElementById("app")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
