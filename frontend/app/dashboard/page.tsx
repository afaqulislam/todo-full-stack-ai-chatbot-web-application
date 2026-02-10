'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/auth-context';
import { useNotification } from '@/components/notifications';
import { todoApi, authApi } from '@/src/utils/api';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Select, Badge } from '@/components/ui';

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'completed';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, authState, logout } = useAuth();
  const { showNotification } = useNotification();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in-progress' | 'completed'
  });
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'todo' as 'todo' | 'in-progress' | 'completed'
  });
  const [todosFetched, setTodosFetched] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Mark as mounted after initial render to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  const fetchTodos = useCallback(async () => {
    try {
      const data = await todoApi.getTodos(logout);
      setTodos(data);
      setTodosFetched(true);
    } catch (err: any) {
      console.error('Error fetching todos:', err);
      setError(err.message || 'Failed to fetch todos');
      // Additional logging for debugging network issues
      if (err.message && err.message.includes('Network error')) {
        console.error('Network connectivity issue detected - backend may be down or unreachable');
      }
      // Still set todosFetched to true to show dashboard even with error
      setTodosFetched(true);
    }
  }, [logout]);

  // Handle auth state changes
  useEffect(() => {
    // Only redirect to login if authState is definitively unauthenticated
    if (authState === 'unauthenticated') {
      router.replace('/auth/login');
      return;
    }

    if (authState === 'authenticated') {
      // Only fetch todos if user is authenticated and session is valid
      fetchTodos();
    }
  }, [authState, router, logout, fetchTodos]);

  const handleLogout = () => {
    logout();
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodo.title.trim() || isAddingTodo) return;

    // Set loading state to prevent duplicate submissions
    setIsAddingTodo(true);

    // Prepare todo data with new fields
    const todoData = {
      title: newTodo.title,
      description: newTodo.description,
      priority: newTodo.priority || 'medium',
      status: newTodo.status || 'todo'
    };

    // Optimistic UI update - add the task immediately with a temporary ID
    const tempId = `temp-${Date.now()}`;
    const newTask = {
      id: tempId,
      title: newTodo.title,
      description: newTodo.description,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id || '',
      priority: newTodo.priority || 'medium', // Default priority
      status: newTodo.status || 'todo' // Default status
    };

    // Add to the list immediately
    setTodos([newTask, ...todos]);
    setNewTodo({ title: '', description: '', priority: 'medium', status: 'todo' });

    // ⛔ STOP spinner immediately (THIS IS THE FIX)
    setIsAddingTodo(false);

    try {
      const createdTodo = await todoApi.createTodo(todoData, logout);
      // Replace the temporary task with the actual created task
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === tempId ? createdTodo : todo
        )
      );

      // Show success notification
      showNotification('success', 'Todo added successfully!');
    } catch (err: any) {
      console.error('Error creating todo:', err);
      setError(err.message || 'Failed to create todo');
      // Remove the temporary task if creation failed
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== tempId));

      // Show error notification
      showNotification('error', err.message || 'Failed to add todo');
    }
  };

  const handleToggleComplete = async (id: string) => {
    // Find the current todo to get its current state
    const currentTodo = todos.find(todo => todo.id === id);
    if (!currentTodo) return;

    const newCompletedState = !currentTodo.completed;

    // Optimistic UI update - toggle immediately
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id
          ? {
            ...todo,
            completed: newCompletedState,
            status: newCompletedState ? 'completed' : 'todo'
          }
          : todo
      )
    );

    try {
      const updatedTodo = await todoApi.toggleTodo(id, logout);
      // Update with server response to ensure consistency
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id
            ? {
              ...updatedTodo,
              completed: updatedTodo.completed,
              status: updatedTodo.completed ? 'completed' : 'todo'
            }
            : todo
        )
      );

      // Show success notification
      showNotification('success', `Todo marked as ${newCompletedState ? 'completed' : 'incomplete'}!`);
    } catch (err: any) {
      console.error('Error toggling todo:', err);
      setError(err.message || 'Failed to update todo');
      // Revert the change if the API call failed
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id
            ? {
              ...todo,
              completed: !newCompletedState, // Revert to original state
              status: !newCompletedState ? 'completed' : 'todo'
            }
            : todo
        )
      );

      // Show error notification
      showNotification('error', err.message || 'Failed to update todo');
    }
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditForm({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority || 'medium',
      status: todo.status || 'todo'
    });
  };

  const handleUpdateTodo = async (e: React.FormEvent) => {
    setUpdateLoading(true);
    e.preventDefault();

    if (!editingTodo) return;

    // Optimistic UI update - update immediately
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === editingTodo.id
          ? {
            ...todo,
            title: editForm.title,
            description: editForm.description,
            priority: editForm.priority || 'medium', // Use the priority from editForm
            status: editForm.status || 'todo' // Use the status from editForm
          }
          : todo
      )
    );

    try {
      const updatedTodo = await todoApi.updateTodo(
        editingTodo.id,
        {
          title: editForm.title,
          description: editForm.description,
          priority: editForm.priority || 'medium',
          status: editForm.status || 'todo'
        },
        logout
      );
      // Update with server response to ensure consistency
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === editingTodo.id ? updatedTodo : todo
        )
      );
      setEditingTodo(null);
      setEditForm({ title: '', description: '', priority: 'medium', status: 'todo' });

      // Show success notification
      showNotification('success', 'Todo updated successfully!');
    } catch (err: any) {
      console.error('Error updating todo:', err);
      setError(err.message || 'Failed to update todo');
      // Revert the change if the API call failed
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === editingTodo.id ? editingTodo : todo
        )
      );
      setEditingTodo(null);
      setEditForm({ title: '', description: '', priority: 'medium', status: 'todo' });

      // Show error notification
      showNotification('error', err.message || 'Failed to update todo');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setEditForm({ title: '', description: '', priority: 'medium', status: 'todo' });
  };

  const handleDeleteTodo = async (id: string) => {
    setDeleteConfirmation({ show: true, id });
  };

  const confirmDeleteTodo = async () => {
    if (!deleteConfirmation.id) return;
    setDeleteLoading(true);

    const id = deleteConfirmation.id;
    setDeletingId(id);

    const deletedTodo = todos.find(t => t.id === id);
    setTodos(prev => prev.filter(t => t.id !== id));

    try {
      await todoApi.deleteTodo(id, logout);
      showNotification('success', 'Todo deleted');
    } catch (err: any) {
      if (deletedTodo) {
        setTodos(prev => [deletedTodo, ...prev]);
      }
      showNotification('error', 'Delete failed');
    } finally {
      setDeletingId(null);
      setDeleteConfirmation({ show: false, id: null });
      setDeleteLoading(false);
    }
  };

  const cancelDeleteTodo = () => {
    setDeleteConfirmation({ show: false, id: null });
  };

  // Calculate summary statistics
  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.status === 'completed').length;
  const pendingTasks = todos.filter(todo => todo.status !== 'completed').length;
  const highPriorityTasks = todos.filter(todo => todo.priority === 'high' && !todo.completed).length;
  const inProgressTasks = todos.filter(todo => todo.status === 'in-progress').length;

  // Show dashboard after all conditions are met
  // Handle unknown auth state by returning nothing until auth is determined
  if (authState === 'unknown') {
    return null; // Wait for auth state to be determined
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-200">
      {/* Main content */}
      <div className="w-full">
        {/* Main Content */}
        <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-7xl w-full">
            {/* Welcome Banner */}
            <div className="rounded-2xl p-8 mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Welcome back, {user?.first_name} {user?.last_name} !
                  </h2>
                  <p className="text-sm !text-blue-100">
                    Here&apos;s what you need to tackle today. You have {highPriorityTasks} high priority tasks.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <div className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Active Session
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="transform hover:scale-[1.02] transition-transform duration-200 bg-white border border-gray-200 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{totalTasks}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="transform hover:scale-[1.02] transition-transform duration-200 bg-white border border-gray-200 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{completedTasks}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100 text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="transform hover:scale-[1.02] transition-transform duration-200 bg-white border border-gray-200 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{inProgressTasks}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="transform hover:scale-[1.02] transition-transform duration-200 bg-white border border-gray-200 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 h-2"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">High Priority</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{highPriorityTasks}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-100 text-red-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Task Form */}
            <Card className="mb-8 bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-gray-900 text-xl font-semibold">Add New Task</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTodo} className="flex flex-col gap-4">
                  <div className="w-full">
                    <Input
                      type="text"
                      value={newTodo.title}
                      onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                      placeholder="What needs to be done?"
                      className="w-full bg-white text-gray-900 border-gray-300 rounded-lg py-3 px-4 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <Textarea
                      value={newTodo.description}
                      onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full mt-3 bg-white text-gray-900 border-gray-300 rounded-lg py-3 px-4 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select
                      value={newTodo.priority}
                      onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="flex-1 bg-white text-gray-900 border-gray-300 rounded-lg py-2 px-3 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </Select>
                    <Button type="submit" variant="primary" size="md" className="py-3 px-6 flex-1 min-w-[140px] font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200" disabled={isAddingTodo}>
                      <div className="flex items-center justify-center space-x-2">
                        {isAddingTodo ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Task</span>
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Task List */}
            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 h-2"></div>
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
                <CardTitle className="text-gray-900 text-xl font-semibold">Your Tasks</CardTitle>
                <span className="text-sm text-gray-700 bg-gray-200 px-3 py-1 rounded-full">
                  {todos.length} {todos.length === 1 ? 'task' : 'tasks'}
                </span>
              </CardHeader>
              <CardContent className="p-6">
                {todos.length === 0 ? (
                  <div className="p-12 text-center rounded-xl bg-gray-50 border border-gray-200">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                    <p className="text-sm text-gray-600">Get started by adding a new task above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todos.map((todo) => (
                      <Card key={todo.id} className={`p-5 transition-all duration-200 hover:shadow-md border-l-4 ${todo.priority === 'high' ? 'border-l-red-500' :
                        todo.priority === 'medium' ? 'border-l-yellow-500' :
                          'border-l-green-500'
                        }`}>
                        <div className="flex items-start space-x-4">
                          <button
                            onClick={() => handleToggleComplete(todo.id)}
                            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${todo.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-400 hover:border-green-600'
                              }`}
                          >
                            {todo.completed && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {todo.title}
                            </h3>
                            {todo.description && (
                              <p className={`text-sm mt-2 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-600'}`}>
                                {todo.description}
                              </p>
                            )}

                            <div className="flex items-center space-x-3 mt-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(todo.priority || 'medium') === 'high'
                                ? 'bg-red-100 text-red-800'
                                : (todo.priority || 'medium') === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                                }`}>
                                <div className={`w-2 h-2 rounded-full mr-1.5 ${(todo.priority || 'medium') === 'high' ? 'bg-red-500' :
                                  (todo.priority || 'medium') === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}></div>
                                {(todo.priority || 'medium').charAt(0).toUpperCase() + (todo.priority || 'medium').slice(1)} Priority
                              </span>

                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(todo.status || 'todo') === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : (todo.status || 'todo') === 'in-progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                                }`}>
                                <div className={`w-2 h-2 rounded-full mr-1.5 ${(todo.status || 'todo') === 'completed' ? 'bg-green-500' :
                                  (todo.status || 'todo') === 'in-progress' ? 'bg-blue-500' : 'bg-gray-500'
                                  }`}></div>
                                {(todo.status || 'todo').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </span>
                            </div>
                            
                          </div>

                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEdit(todo)}
                              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTodo(todo.id)}
                              className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Edit Todo Modal */}
      {editingTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 bg-white border border-gray-200 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <CardTitle className="text-gray-900 text-lg font-semibold">Edit Task</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>

            <form onSubmit={handleUpdateTodo}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Title</label>
                  <Input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                    className="bg-white text-gray-900 border-gray-300 rounded-lg py-3 px-4 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="bg-white text-gray-900 border-gray-300 rounded-lg py-3 px-4 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Priority</label>
                    <Select
                      value={editForm.priority}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="bg-white text-gray-900 border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Status</label>
                    <Select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'todo' | 'in-progress' | 'completed' })}
                      className="bg-white text-gray-900 border-gray-300 rounded-lg py-2 px-4 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <Button type="button" onClick={handleCancelEdit} variant="outline" size="md" className="flex-1 font-medium py-3 border-gray-300 hover:bg-gray-50 text-gray-700">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="py-3 px-6 flex-1 min-w-[140px] font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
                  disabled={updateLoading}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {updateLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Update Task</span>
                    )}
                  </div>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm p-6 bg-white border border-gray-200 shadow-2xl rounded-2xl">
            <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <CardTitle className="text-gray-900 text-lg font-semibold">Confirm Delete</CardTitle>
            </div>
            <p className="mb-6 text-sm text-gray-600">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex space-x-3">
              <Button onClick={cancelDeleteTodo} variant="outline" size="md" className="flex-1 font-medium py-3 border-gray-300 hover:bg-gray-50 text-gray-700">
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteTodo}
                variant="destructive"
                size="md"
                className="py-3 px-6 flex-1 min-w-[140px] font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg"
                disabled={deleteLoading}
              >
                <div className="flex items-center justify-center space-x-2">
                  {deleteLoading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Task</span>
                  )}
                </div>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}