import React, { useState } from "react";
import { useTodo } from "@/context/TodoContext";
import { TodoItem } from "@/components/todos/TodoItem";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Todo } from "@/types/todo";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

type FilterType = "all" | "active" | "completed";

export function TodoList() {
  const { todos, loading, reorderTodos } = useTodo();
  const [filter, setFilter] = useState<FilterType>("all");
  const { t } = useTranslation();

  const sensors = useSensors(
    useSensor(PointerSensor), 
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter todos based on the current filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  // Get IDs of filtered todos for SortableContext
  const filteredTodoIds = filteredTodos.map((todo) => todo.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the index of the items in the currently *filtered* list
      const oldIndex = filteredTodos.findIndex((todo) => todo.id === active.id);
      const newIndex = filteredTodos.findIndex((todo) => todo.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return; // Should not happen

      // Determine the new order based on the *filtered* list
      const reorderedFilteredItems = arrayMove(filteredTodos, oldIndex, newIndex);

      // Create a map of the new order based on IDs from the reordered filtered list
      const newOrderMap = new Map<string, number>();
      reorderedFilteredItems.forEach((item, index) => {
        newOrderMap.set(item.id, index);
      });

      // Create the new full list by sorting the original `todos` based on the new order derived from the filtered view
      const newFullTodosOrder = [...todos].sort((a, b) => {
        const orderA = newOrderMap.has(a.id) ? newOrderMap.get(a.id)! : Infinity;
        const orderB = newOrderMap.has(b.id) ? newOrderMap.get(b.id)! : Infinity;
        // Items not in the filtered list maintain their relative order at the end
        if (orderA === Infinity && orderB === Infinity) {
           return todos.indexOf(a) - todos.indexOf(b); // Maintain original relative order
        }
        return orderA - orderB;
      });

      reorderTodos(newFullTodosOrder);
    }
  }

  return (
    <div className="flex w-full flex-col gap-4 h-[calc(100vh-300px)]">
      {/* Filter Buttons */}
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        {/* Use filteredTodoIds for SortableContext items */}
        <SortableContext items={filteredTodoIds} strategy={verticalListSortingStrategy}>
          <div 
            className="relative flex-1 overflow-y-auto pr-2 min-h-0 space-y-2" // Added space-y-2 back
            data-testid="todo-list"
          >
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            // Render filteredTodos 
            ) : filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} /> // Pass todo, useSortable handles the rest
              ))
            ) : (
              <p className="text-center text-muted-foreground">{t("noTodos")}</p>
            )}
            {/* No explicit placeholder needed like in react-beautiful-dnd */}
          </div>
        </SortableContext>
      </DndContext>

      {/* Todo count */}
      {!loading && todos.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {t("totalTodos", { count: todos.length })} • {t("completedTodos", { count: todos.filter(t => t.completed).length })}
        </p>
      )}
    </div>
  );
}