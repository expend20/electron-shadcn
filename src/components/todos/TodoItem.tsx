import React, { useState } from "react";
import { useTodo } from "@/context/TodoContext";
import { Todo } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, removeTodo, editTodo } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const { t } = useTranslation();

  const handleEdit = () => {
    if (isEditing) {
      if (editText.trim()) {
        editTodo(todo.id, editText.trim());
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEdit();
    } else if (e.key === "Escape") {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-md bg-card p-2">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        data-testid={`todo-checkbox-${todo.id}`}
      />
      
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleEdit}
          autoFocus
          className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          data-testid={`todo-edit-input-${todo.id}`}
        />
      ) : (
        <span 
          className={`flex-1 ${todo.completed ? "text-muted-foreground line-through" : ""}`}
          data-testid={`todo-text-${todo.id}`}
        >
          {todo.text}
        </span>
      )}
      
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleEdit}
          data-testid={`todo-edit-button-${todo.id}`}
        >
          {isEditing ? t("save") : t("edit")}
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => removeTodo(todo.id)}
          data-testid={`todo-delete-button-${todo.id}`}
        >
          {t("delete")}
        </Button>
      </div>
    </div>
  );
}