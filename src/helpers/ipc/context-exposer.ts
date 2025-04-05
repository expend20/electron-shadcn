import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeTodoContext } from "./todo/todo-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeTodoContext();
}
