import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  lng: "en",
  resources: {
    en: {
      translation: {
        appName: "Todo List",
        titleHomePage: "Manage Your Tasks",
        titleSecondPage: "Second Page",
        titleSettingsPage: "Customize Your Experience",
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
        completedTodos_plural: "{{count}} completed tasks",
        settings: "Settings",
        appearance: "Appearance",
        theme: "Theme"
      }
    }
  }
});
