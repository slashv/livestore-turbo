import { nanoid } from '@livestore/livestore'
import type { Store } from '@livestore/livestore'
import { events, type schema } from '@repo/schema'
import type { Filter } from './queries'

type AppStore = Store<typeof schema>

// Actions for todo operations
export function createTodoActions(store: AppStore) {
  return {
    addTodo: (text: string) => {
      if (text.trim()) {
        store.commit(events.todoCreated({ id: nanoid(), text: text.trim() }))
      }
    },

    toggleTodo: (id: string, completed: boolean) => {
      if (completed) {
        store.commit(events.todoUncompleted({ id }))
      } else {
        store.commit(events.todoCompleted({ id }))
      }
    },

    deleteTodo: (id: string) => {
      store.commit(events.todoDeleted({ id, deletedAt: new Date() }))
    },

    clearCompleted: () => {
      store.commit(events.todoClearedCompleted({ deletedAt: new Date() }))
    },

    setFilter: (filter: Filter) => {
      store.commit(events.uiStateSet({ filter }))
    },

    setNewTodoText: (newTodoText: string) => {
      store.commit(events.uiStateSet({ newTodoText }))
    },
  }
}
