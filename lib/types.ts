// ===== 資料類型定義 =====

export type TaskCategory = 'food' | 'document' | 'shopping' | 'other';

export const TASK_CATEGORIES: { key: TaskCategory; label: string; icon: string }[] = [
  { key: 'food', label: '餐飲', icon: '🍔' },
  { key: 'document', label: '文件', icon: '📄' },
  { key: 'shopping', label: '購物', icon: '🛍️' },
  { key: 'other', label: '其他', icon: '📦' },
];

export type TaskStatus = 'open' | 'accepted' | 'completed' | 'cancelled';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: '待接單',
  accepted: '進行中',
  completed: '已完成',
  cancelled: '已取消',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  open: '#FF6B35',
  accepted: '#F59E0B',
  completed: '#22C55E',
  cancelled: '#8A8FA3',
};

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  pickupLocation: string;
  deliveryLocation: string;
  reward: number;
  deadline: string; // ISO string
  status: TaskStatus;
  publisherId: string;
  publisherName: string;
  publisherRating: number;
  acceptorId?: string;
  acceptorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  taskId: string;
  task: Task;
  publisherId: string;
  acceptorId: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  rating: number;
  totalPublished: number;
  totalAccepted: number;
  completionRate: number;
  reviews: Review[];
}
