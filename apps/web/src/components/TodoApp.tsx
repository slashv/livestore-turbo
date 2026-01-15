import { createTodoActions } from '@repo/core'
import {
  type Filter,
  countActiveTodos,
  filterTodos,
  hasCompletedTodos,
  visibleTodosQuery,
} from '@repo/core'
import { tables } from '@repo/schema'
import { useAppStore } from '~/livestore/store'

export function TodoApp() {
  const store = useAppStore()

  // Reactive queries using LiveStore
  const todos = store.useQuery(visibleTodosQuery)
  const uiState = store.useQuery(tables.uiState.get())

  const actions = createTodoActions(store)
  const filteredTodos = filterTodos(todos, uiState.filter)
  const activeCount = countActiveTodos(todos)
  const hasCompleted = hasCompletedTodos(todos)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    actions.addTodo(uiState.newTodoText)
    actions.setNewTodoText('')
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-4xl font-thin text-center text-rose-800 mb-8">todos</h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* New Todo Input */}
        <form onSubmit={handleSubmit} className="border-b border-gray-200">
          <input
            type="text"
            value={uiState.newTodoText}
            onChange={(e) => actions.setNewTodoText(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-4 py-4 text-lg placeholder-gray-400 focus:outline-none"
          />
        </form>

        {/* Todo List */}
        {filteredTodos.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {filteredTodos.map((todo) => (
              <li key={todo.id} className="flex items-center px-4 py-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => actions.toggleTodo(todo.id, todo.completed)}
                  className="h-5 w-5 rounded-full border-2 border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span
                  className={`flex-1 ml-3 text-lg ${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  type="button"
                  onClick={() => actions.deleteTodo(todo.id)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Delete todo"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {todos.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between text-sm text-gray-500">
            <span>
              {activeCount} {activeCount === 1 ? 'item' : 'items'} left
            </span>

            <div className="flex gap-2">
              {(['all', 'active', 'completed'] as Filter[]).map((filter) => (
                <button
                  type="button"
                  key={filter}
                  onClick={() => actions.setFilter(filter)}
                  className={`px-2 py-1 rounded border ${
                    uiState.filter === filter
                      ? 'border-rose-300 text-rose-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {hasCompleted && (
              <button
                type="button"
                onClick={actions.clearCompleted}
                className="hover:underline hover:text-gray-700"
              >
                Clear completed
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-center text-gray-400 text-sm mt-8">
        Double-click to edit a todo
        <br />
        <span className="text-xs">Synced with LiveStore</span>
      </p>
    </div>
  )
}
