import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        appName: "Todo List",
        titleHomePage: "Manage Your Tasks",
        titleSecondPage: "Second Page",
        todoInputPlaceholder: "What needs to be done?",
        addTodo: "Add",
        edit: "Edit",
        save: "Save",
        delete: "Delete",
        all: "All",
        active: "Active",
        completed: "Completed",
        noTodos: "No tasks to display",
        totalTodos: "{{count}} total task",
        totalTodos_plural: "{{count}} total tasks",
        completedTodos: "{{count}} completed task",
        completedTodos_plural: "{{count}} completed tasks"
      },
    },
    "pt-BR": {
      translation: {
        appName: "Lista de Tarefas",
        titleHomePage: "Gerencie Suas Tarefas",
        titleSecondPage: "Segunda Página",
        todoInputPlaceholder: "O que precisa ser feito?",
        addTodo: "Adicionar",
        edit: "Editar",
        save: "Salvar",
        delete: "Excluir",
        all: "Todas",
        active: "Ativas",
        completed: "Concluídas",
        noTodos: "Nenhuma tarefa para exibir",
        totalTodos: "{{count}} tarefa no total",
        totalTodos_plural: "{{count}} tarefas no total",
        completedTodos: "{{count}} tarefa concluída",
        completedTodos_plural: "{{count}} tarefas concluídas"
      },
    },
  },
});
