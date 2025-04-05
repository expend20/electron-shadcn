import React from "react";
import { useTranslation } from "react-i18next";
import Footer from "@/components/template/Footer";
import { TodoInput } from "@/components/todos/TodoInput";
import { TodoList } from "@/components/todos/TodoList";
import { TodoProvider } from "@/context/TodoContext";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="font-mono text-3xl font-bold">{t("appName")}</h1>
          <p className="text-sm uppercase text-muted-foreground" data-testid="pageTitle">
            {t("titleHomePage")}
          </p>
        </div>

        <TodoProvider>
          <div className="mx-auto flex w-full max-w-md flex-col gap-6">
            <TodoInput />
            <TodoList />
          </div>
        </TodoProvider>
      </div>
      <Footer />
    </div>
  );
}
