import { tables } from '@repo/schema'

// Todo type derived from the table schema
export type Todo = {
  id: string
  text: string
  completed: boolean
  deletedAt: Date | null
}

export type Filter = 'all' | 'active' | 'completed'

// Query for visible (non-deleted) todos
export const visibleTodosQuery = tables.todos.select().where({ deletedAt: null })

// Query for active (non-completed, non-deleted) todos
export const activeTodosQuery = tables.todos.select().where({ completed: false, deletedAt: null })

// Query for completed (non-deleted) todos
export const completedTodosQuery = tables.todos.select().where({ completed: true, deletedAt: null })
