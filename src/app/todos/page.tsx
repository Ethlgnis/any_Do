"use client";

import { useAppContext } from '../../context/AppContext';
import TodoSection from '../../sections/TodoSection';

export default function TodosPage() {
    const { todos, handleTodoAdd, handleTodoUpdate, handleTodoDelete, searchQuery } = useAppContext();

    return (
        <TodoSection
            todos={todos}
            onAdd={handleTodoAdd}
            onUpdate={handleTodoUpdate}
            onDelete={handleTodoDelete}
            searchQuery={searchQuery}
        />
    );
}
