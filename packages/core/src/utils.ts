import type { Filter, Todo } from './queries'

export function filterTodos(todos: readonly Todo[], filter: Filter): readonly Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter((todo) => !todo.completed)
    case 'completed':
      return todos.filter((todo) => todo.completed)
    default:
      return todos
  }
}

export function countActiveTodos(todos: readonly Todo[]): number {
  return todos.filter((todo) => !todo.completed).length
}

export function hasCompletedTodos(todos: readonly Todo[]): boolean {
  return todos.some((todo) => todo.completed)
}
