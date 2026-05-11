import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Order, Review, UserProfile } from './types';

const KEYS = {
  TASKS: 'campus_errand_tasks',
  ORDERS: 'campus_errand_orders',
  REVIEWS: 'campus_errand_reviews',
  USER: 'campus_errand_user',
};

// ===== Tasks =====
export async function getTasks(): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(KEYS.TASKS);
  return raw ? JSON.parse(raw) : [];
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
}

export async function addTask(task: Task): Promise<void> {
  const tasks = await getTasks();
  tasks.unshift(task);
  await saveTasks(tasks);
}

export async function updateTask(updated: Task): Promise<void> {
  const tasks = await getTasks();
  const idx = tasks.findIndex((t) => t.id === updated.id);
  if (idx !== -1) {
    tasks[idx] = updated;
    await saveTasks(tasks);
  }
}

export async function removeExpiredTasks(): Promise<void> {
  const tasks = await getTasks();
  const now = new Date().getTime();
  const filtered = tasks.filter((t) => {
    const deadline = new Date(t.deadline).getTime();
    return deadline > now || t.status !== 'open'; // Keep non-expired or non-open tasks
  });
  if (filtered.length < tasks.length) {
    await saveTasks(filtered);
  }
}

// ===== Orders =====
export async function getOrders(): Promise<Order[]> {
  const raw = await AsyncStorage.getItem(KEYS.ORDERS);
  return raw ? JSON.parse(raw) : [];
}

export async function saveOrders(orders: Order[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
}

export async function addOrder(order: Order): Promise<void> {
  const orders = await getOrders();
  orders.unshift(order);
  await saveOrders(orders);
}

export async function updateOrder(updated: Order): Promise<void> {
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.id === updated.id);
  if (idx !== -1) {
    orders[idx] = updated;
    await saveOrders(orders);
  }
}

// ===== Reviews =====
export async function getReviews(): Promise<Review[]> {
  const raw = await AsyncStorage.getItem(KEYS.REVIEWS);
  return raw ? JSON.parse(raw) : [];
}

export async function addReview(review: Review): Promise<void> {
  const reviews = await getReviews();
  reviews.unshift(review);
  await AsyncStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
}

// ===== User =====
export async function getUser(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export async function saveUser(user: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

// ===== Helpers =====
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function isTaskExpired(deadline: string): boolean {
  return new Date(deadline).getTime() < new Date().getTime();
}

export function formatDeadline(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff < 0) return '已過期';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} 天後`;
  }
  if (hours > 0) return `${hours} 小時 ${minutes} 分鐘後`;
  return `${minutes} 分鐘後`;
}
