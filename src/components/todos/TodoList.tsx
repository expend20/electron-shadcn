import React, { useState } from "react";
import { useTodo } from "@/context/TodoContext";
import { TodoItem } from "@/components/todos/TodoItem";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "active" | "completed";

export function TodoList() {
  const { todos } = useTodo();
  const [filter, setFilter] = useState<FilterType>("all");
  const { t } = useTranslation();

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  // Sort by created date (newest first)
  const sortedTodos = [...filteredTodos].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex gap-2 justify-center">
        <Button
          variant={filter === "all" ? "default" : "outline"} 
          onClick={() => setFilter("all")}
          data-testid="filter-all"
        >
          {t("all")}
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"} 
          onClick={() => setFilter("active")}
          data-testid="filter-active"
        >
          {t("active")}
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"} 
          onClick={() => setFilter("completed")}
          data-testid="filter-completed"
        >
          {t("completed")}
        </Button>
      </div>

      <div className="flex flex-col gap-2" data-testid="todo-list">
        {sortedTodos.length > 0 ? (
          sortedTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))
        ) : (
          <p className="text-center text-muted-foreground">{t("noTodos")}</p>
        )}
      </div>

      {todos.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {t("totalTodos", { count: todos.length })} • {t("completedTodos", { count: todos.filter(t => t.completed).length })}
        </p>
      )}
    </div>
  );
}