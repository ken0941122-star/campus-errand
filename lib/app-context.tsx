import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { Task, Order, Review, UserProfile } from './types';
import {
  getTasks, saveTasks, addTask, updateTask,
  getOrders, addOrder, updateOrder,
  getReviews, addReview,
  getUser, saveUser,
  generateId,
  removeExpiredTasks,
} from './storage';

// ===== State =====
interface AppState {
  tasks: Task[];
  orders: Order[];
  reviews: Review[];
  user: UserProfile;
  loading: boolean;
}

const DEFAULT_USER: UserProfile = {
  id: 'local_user',
  name: '我',
  rating: 5.0,
  totalPublished: 0,
  totalAccepted: 0,
  completionRate: 100,
  reviews: [],
};

// ===== Actions =====
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'UPDATE_USER_NAME'; payload: string };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((o) => (o.id === action.payload.id ? action.payload : o)),
      };
    case 'SET_REVIEWS':
      return { ...state, reviews: action.payload };
    case 'ADD_REVIEW':
      return { ...state, reviews: [action.payload, ...state.reviews] };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER_NAME':
      return { ...state, user: { ...state.user, name: action.payload } };
    default:
      return state;
  }
}

// ===== Context =====
interface AppContextValue {
  state: AppState;
  publishTask: (data: Omit<Task, 'id' | 'status' | 'publisherId' | 'publisherName' | 'publisherRating' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  acceptTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  submitReview: (orderId: string, revieweeId: string, rating: number, comment: string) => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    tasks: [],
    orders: [],
    reviews: [],
    user: DEFAULT_USER,
    loading: true,
  });

  // Load initial data and clean expired tasks
  useEffect(() => {
    async function load() {
      await removeExpiredTasks();
      const [tasks, orders, reviews, user] = await Promise.all([
        getTasks(),
        getOrders(),
        getReviews(),
        getUser(),
      ]);
      dispatch({ type: 'SET_TASKS', payload: tasks });
      dispatch({ type: 'SET_ORDERS', payload: orders });
      dispatch({ type: 'SET_REVIEWS', payload: reviews });
      dispatch({ type: 'SET_USER', payload: user ?? DEFAULT_USER });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
    load();

    // Clean expired tasks every 5 minutes
    const interval = setInterval(() => {
      removeExpiredTasks();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const publishTask = useCallback(async (data: Omit<Task, 'id' | 'status' | 'publisherId' | 'publisherName' | 'publisherRating' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...data,
      id: generateId(),
      status: 'open',
      publisherId: state.user.id,
      publisherName: state.user.name,
      publisherRating: state.user.rating,
      createdAt: now,
      updatedAt: now,
    };
    await addTask(task);
    dispatch({ type: 'ADD_TASK', payload: task });
    // Update user stats
    const updatedUser = {
      ...state.user,
      totalPublished: state.user.totalPublished + 1,
    };
    await saveUser(updatedUser);
    dispatch({ type: 'SET_USER', payload: updatedUser });
  }, [state.user]);

  const acceptTask = useCallback(async (taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task || task.status !== 'open') return;
    const now = new Date().toISOString();
    const updatedTask: Task = {
      ...task,
      status: 'accepted',
      acceptorId: state.user.id,
      acceptorName: state.user.name,
      updatedAt: now,
    };
    await updateTask(updatedTask);
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    // Create order
    const order: Order = {
      id: generateId(),
      taskId,
      task: updatedTask,
      publisherId: task.publisherId,
      acceptorId: state.user.id,
      status: 'accepted',
      createdAt: now,
      updatedAt: now,
    };
    await addOrder(order);
    dispatch({ type: 'ADD_ORDER', payload: order });
    // Update user stats
    const updatedUser = {
      ...state.user,
      totalAccepted: state.user.totalAccepted + 1,
    };
    await saveUser(updatedUser);
    dispatch({ type: 'SET_USER', payload: updatedUser });
  }, [state.tasks, state.user]);

  const deleteTask = useCallback(async (taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task || task.publisherId !== state.user.id) return; // Only allow publisher to delete
    await saveTasks(state.tasks.filter((t) => t.id !== taskId));
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  }, [state.tasks, state.user.id]);

  const completeOrder = useCallback(async (orderId: string) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;
    const now = new Date().toISOString();
    const updatedOrder: Order = { ...order, status: 'completed', updatedAt: now };
    const updatedTask: Task = { ...order.task, status: 'completed', updatedAt: now };
    await updateOrder(updatedOrder);
    await updateTask(updatedTask);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  }, [state.orders]);

  const cancelOrder = useCallback(async (orderId: string) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;
    const now = new Date().toISOString();
    const updatedOrder: Order = { ...order, status: 'cancelled', updatedAt: now };
    const updatedTask: Task = { ...order.task, status: 'cancelled', updatedAt: now };
    await updateOrder(updatedOrder);
    await updateTask(updatedTask);
    dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  }, [state.orders]);

  const submitReview = useCallback(async (orderId: string, revieweeId: string, rating: number, comment: string) => {
    const review: Review = {
      id: generateId(),
      orderId,
      reviewerId: state.user.id,
      revieweeId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    await addReview(review);
    dispatch({ type: 'ADD_REVIEW', payload: review });
  }, [state.user.id]);

  const updateUserName = useCallback(async (name: string) => {
    const updatedUser = { ...state.user, name };
    await saveUser(updatedUser);
    dispatch({ type: 'UPDATE_USER_NAME', payload: name });
  }, [state.user]);

  return (
    <AppContext.Provider value={{ state, publishTask, acceptTask, deleteTask, completeOrder, cancelOrder, submitReview, updateUserName }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
