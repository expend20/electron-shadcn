import React from "react";
import { useTranslation } from "react-i18next";
import ToggleTheme from "@/components/ToggleTheme";
import Footer from "@/components/template/Footer";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="font-mono text-3xl font-bold">{t("settings")}</h1>
          <p className="text-sm uppercase text-muted-foreground">
            {t("titleSettingsPage")}
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold mb-4">{t("appearance")}</h2>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">{t("theme")}</span>
              <ToggleTheme />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 