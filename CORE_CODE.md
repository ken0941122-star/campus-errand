# 校園跑腿 APP - 核心程式碼文檔

## 目錄
1. [資料類型定義](#資料類型定義)
2. [全域狀態管理](#全域狀態管理)
3. [本地儲存](#本地儲存)
4. [發單功能](#發單功能)
5. [接單功能](#接單功能)
6. [訂單管理](#訂單管理)
7. [評價系統](#評價系統)

---

## 資料類型定義

### Task（任務）
```typescript
interface Task {
  id: string;                    // 唯一識別符
  title: string;                 // 任務標題
  description: string;           // 詳細描述
  category: TaskCategory;        // 類別：food | document | shopping | other
  pickupLocation: string;        // 取件地點
  deliveryLocation: string;      // 送達地點
  reward: number;                // 報酬金額
  deadline: string;              // 截止時間（ISO 8601）
  status: TaskStatus;            // 狀態：open | accepted | completed | cancelled
  publisherId: string;           // 發布者 ID
  publisherName: string;         // 發布者暱稱
  publisherRating: number;       // 發布者評分
  acceptorId?: string;           // 接單者 ID（可選）
  acceptorName?: string;         // 接單者暱稱（可選）
  createdAt: string;             // 建立時間
  updatedAt: string;             // 更新時間
}
```

### Order（訂單）
```typescript
interface Order {
  id: string;                    // 訂單 ID
  taskId: string;                // 關聯的任務 ID
  task: Task;                    // 完整任務資訊
  publisherId: string;           // 發布者 ID
  acceptorId: string;            // 接單者 ID
  status: TaskStatus;            // 訂單狀態
  createdAt: string;             // 建立時間
  updatedAt: string;             // 更新時間
}
```

### Review（評價）
```typescript
interface Review {
  id: string;                    // 評價 ID
  orderId: string;               // 關聯的訂單 ID
  reviewerId: string;            // 評價者 ID
  revieweeId: string;            // 被評價者 ID
  rating: number;                // 星級（1-5）
  comment: string;               // 評語
  createdAt: string;             // 建立時間
}
```

### UserProfile（用戶資料）
```typescript
interface UserProfile {
  id: string;                    // 用戶 ID
  name: string;                  // 暱稱
  rating: number;                // 平均評分
  totalPublished: number;        // 發布任務數
  totalAccepted: number;         // 接單數
  completionRate: number;        // 完成率
  reviews: Review[];             // 收到的評價
}
```

---

## 全域狀態管理

### AppContext 結構
```typescript
interface AppContextValue {
  state: AppState;
  publishTask: (data: Omit<Task, ...>) => Promise<void>;
  acceptTask: (taskId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  submitReview: (orderId: string, revieweeId: string, rating: number, comment: string) => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
}
```

### 使用方式
```typescript
import { useApp } from '@/lib/app-context';

export default function MyComponent() {
  const { state, publishTask, acceptTask } = useApp();
  
  // 訪問狀態
  const allTasks = state.tasks;
  const myOrders = state.orders;
  const userInfo = state.user;
  
  // 發布任務
  await publishTask({
    title: '幫我買飲料',
    description: '7-11 買一杯中杯美式',
    category: 'food',
    pickupLocation: '學生餐廳一樓',
    deliveryLocation: '宿舍 A 棟 302',
    reward: 30,
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  });
}
```

---

## 本地儲存

### AsyncStorage 鍵值
```typescript
const KEYS = {
  TASKS: 'campus_errand_tasks',      // 所有任務
  ORDERS: 'campus_errand_orders',    // 所有訂單
  REVIEWS: 'campus_errand_reviews',  // 所有評價
  USER: 'campus_errand_user',        // 用戶資料
};
```

### 儲存 API
```typescript
// 任務
async function getTasks(): Promise<Task[]>
async function addTask(task: Task): Promise<void>
async function updateTask(updated: Task): Promise<void>

// 訂單
async function getOrders(): Promise<Order[]>
async function addOrder(order: Order): Promise<void>
async function updateOrder(updated: Order): Promise<void>

// 評價
async function getReviews(): Promise<Review[]>
async function addReview(review: Review): Promise<void>

// 用戶
async function getUser(): Promise<UserProfile | null>
async function saveUser(user: UserProfile): Promise<void>

// 工具函數
function generateId(): string  // 生成唯一 ID
function formatDeadline(isoString: string): string  // 格式化截止時間
```

---

## 發單功能

### 發單表單（PublishScreen）
```typescript
import { useApp } from '@/lib/app-context';
import { trpc } from '@/lib/trpc';

export default function PublishScreen() {
  const { publishTask } = useApp();
  const createTaskMutation = (trpc as any).tasks.create.useMutation();
  
  const handleSubmit = async () => {
    // 驗證表單
    if (!title.trim()) return;
    if (!pickupLocation.trim()) return;
    if (!deliveryLocation.trim()) return;
    
    // 計算截止時間
    const deadline = new Date(Date.now() + deadlineHours * 60 * 60 * 1000).toISOString();
    
    // 發布到本地
    await publishTask({
      title,
      description,
      category,
      pickupLocation,
      deliveryLocation,
      reward,
      deadline,
    });
    
    // 發布到雲端（可選）
    await createTaskMutation.mutateAsync({
      title,
      description,
      category,
      pickupLocation,
      deliveryLocation,
      reward: reward.toString(),
      deadline: new Date(deadline),
    });
  };
}
```

### 表單欄位
- **任務類別**：food（餐飲）、document（文件）、shopping（購物）、other（其他）
- **任務標題**：最多 40 字
- **詳細說明**：最多 200 字（可選）
- **取件地點**：必填
- **送達地點**：必填
- **報酬金額**：必填，單位為元
- **截止時間**：小時數（預設 2 小時）

---

## 接單功能

### 任務列表（HomeScreen）
```typescript
import { useApp } from '@/lib/app-context';
import { trpc } from '@/lib/trpc';

export default function HomeScreen() {
  const { state } = useApp();
  
  // 查詢雲端任務
  const { data: cloudTasks = [] } = trpc.tasks.list.useQuery();
  
  // 合併本地和雲端任務
  const allTasks = useMemo(() => 
    [...state.tasks, ...cloudTasks], 
    [state.tasks, cloudTasks]
  );
  
  // 篩選開放任務
  const openTasks = useMemo(() => {
    return allTasks.filter(t => {
      if (t.status !== 'open') return false;
      if (selectedCat !== 'all' && t.category !== selectedCat) return false;
      if (search && !t.title.includes(search)) return false;
      return true;
    });
  }, [allTasks, selectedCat, search]);
}
```

### 任務卡片
```typescript
const renderTask = ({ item }: ListRenderItemInfo<Task>) => (
  <TouchableOpacity onPress={() => router.push(`/task/${item.id}`)}>
    <View style={s.card}>
      <View style={s.cardTop}>
        <View>
          <Text style={s.categoryBadge}>{item.category}</Text>
          <Text style={s.cardTitle}>{item.title}</Text>
          <Text style={s.cardDesc}>{item.description}</Text>
        </View>
        <Text style={s.rewardText}>${item.reward}</Text>
      </View>
      <View style={s.cardBottom}>
        <Text style={s.locationText}>{item.pickupLocation}</Text>
        <Text style={s.deadlineText}>{formatDeadline(item.deadline)}</Text>
      </View>
    </View>
  </TouchableOpacity>
);
```

### 任務詳情頁面（TaskDetailScreen）
```typescript
import { useLocalSearchParams } from 'expo-router';
import { useApp } from '@/lib/app-context';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const { state, acceptTask } = useApp();
  
  const task = state.tasks.find(t => t.id === id);
  
  const handleAccept = async () => {
    await acceptTask(id as string);
    // 接單成功後導向訂單頁面
    router.push('/(tabs)/orders');
  };
}
```

---

## 訂單管理

### 訂單列表（OrdersScreen）
```typescript
import { useApp } from '@/lib/app-context';

export default function OrdersScreen() {
  const { state } = useApp();
  const [tab, setTab] = useState<'published' | 'accepted'>('published');
  
  // 我發出的訂單
  const publishedOrders = state.orders.filter(o => 
    o.publisherId === state.user.id
  );
  
  // 我接的訂單
  const acceptedOrders = state.orders.filter(o => 
    o.acceptorId === state.user.id
  );
  
  const displayOrders = tab === 'published' ? publishedOrders : acceptedOrders;
}
```

### 訂單狀態流程
```
待接單 (open)
  ↓
進行中 (accepted) ← 接單後
  ↓
已完成 (completed) ← 確認完成
  ↓
已取消 (cancelled) ← 取消訂單
```

### 訂單操作
```typescript
const { completeOrder, cancelOrder } = useApp();

// 確認完成
await completeOrder(orderId);

// 取消訂單
await cancelOrder(orderId);
```

---

## 評價系統

### 提交評價（ReviewScreen）
```typescript
import { useApp } from '@/lib/app-context';

export default function ReviewScreen() {
  const { orderId } = useLocalSearchParams();
  const { submitReview, state } = useApp();
  
  const order = state.orders.find(o => o.id === orderId);
  const revieweeId = order.publisherId === state.user.id 
    ? order.acceptorId 
    : order.publisherId;
  
  const handleSubmit = async (rating: number, comment: string) => {
    await submitReview(orderId as string, revieweeId, rating, comment);
  };
}
```

### 評價卡片
```typescript
const renderReview = (review: Review) => (
  <View style={s.reviewCard}>
    <View style={s.reviewHeader}>
      <Text style={s.reviewerName}>{review.reviewerId}</Text>
      <View style={s.stars}>
        {[...Array(5)].map((_, i) => (
          <Text key={i} style={s.star}>
            {i < review.rating ? '⭐' : '☆'}
          </Text>
        ))}
      </View>
    </View>
    <Text style={s.reviewComment}>{review.comment}</Text>
    <Text style={s.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
  </View>
);
```

### 個人頁面評價統計
```typescript
export default function ProfileScreen() {
  const { state } = useApp();
  
  const myReviews = state.reviews.filter(r => 
    r.revieweeId === state.user.id
  );
  
  const avgRating = myReviews.length > 0
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
    : 'N/A';
  
  return (
    <View>
      <Text>平均評分: {avgRating}</Text>
      <Text>評價數: {myReviews.length}</Text>
      <Text>發布任務: {state.user.totalPublished}</Text>
      <Text>接單數: {state.user.totalAccepted}</Text>
    </View>
  );
}
```

---

## 常用工具函數

### 生成唯一 ID
```typescript
import { generateId } from '@/lib/storage';

const taskId = generateId();  // 例：1a2b3c4d5e
```

### 格式化截止時間
```typescript
import { formatDeadline } from '@/lib/storage';

formatDeadline('2026-03-23T10:00:00Z');  // 例：2 小時 30 分鐘後
```

### 計算截止時間
```typescript
const hours = 2;
const deadline = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
```

---

## 後端 API（tRPC）

### Tasks Router
```typescript
tasks: router({
  list: publicProcedure.query(async () => {
    // 返回所有任務
    return [];
  }),
  
  create: publicProcedure.input(zod.object({
    title: zod.string(),
    description: zod.string().optional(),
    category: zod.string(),
    pickupLocation: zod.string(),
    deliveryLocation: zod.string(),
    reward: zod.string(),
    deadline: zod.date(),
  })).mutation(async ({ input }) => {
    // 建立任務
    return { success: true };
  }),
  
  get: publicProcedure.input(zod.object({ 
    id: zod.number() 
  })).query(async ({ input }) => {
    // 取得單個任務
    return null;
  }),
  
  accept: publicProcedure.input(zod.object({ 
    taskId: zod.number() 
  })).mutation(async ({ input }) => {
    // 接受任務
    return { success: true };
  }),
})
```

### 前端調用
```typescript
import { trpc } from '@/lib/trpc';

// 查詢
const { data: tasks } = trpc.tasks.list.useQuery();

// 變更
const createMutation = trpc.tasks.create.useMutation();
await createMutation.mutateAsync({
  title: '...',
  category: '...',
  // ...
});
```

---

## 最佳實踐

### 1. 表單驗證
```typescript
// ✅ 好
if (!title.trim()) {
  Alert.alert('請填寫任務標題');
  return;
}

// ❌ 不好
if (!title) {
  // 沒有檢查空白
}
```

### 2. 非同步操作
```typescript
// ✅ 好
try {
  setLoading(true);
  await publishTask(data);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
} catch (error) {
  Alert.alert('錯誤', error.message);
} finally {
  setLoading(false);
}

// ❌ 不好
await publishTask(data);  // 沒有錯誤處理
```

### 3. 狀態更新
```typescript
// ✅ 好
const updatedUser = { ...state.user, name: newName };
await saveUser(updatedUser);
dispatch({ type: 'SET_USER', payload: updatedUser });

// ❌ 不好
state.user.name = newName;  // 直接修改狀態
```

### 4. 列表渲染
```typescript
// ✅ 好
<FlatList
  data={tasks}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <TaskCard task={item} />}
/>

// ❌ 不好
{tasks.map(task => <TaskCard key={task.id} task={task} />)}
// 在 ScrollView 中使用 map 會導致性能問題
```

---

## 文件結構
```
campus-errand/
├── app/                          # 頁面
│   ├── _layout.tsx              # 根佈局
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab 導覽
│   │   ├── index.tsx            # 首頁（探索）
│   │   ├── publish.tsx          # 發單
│   │   ├── orders.tsx           # 訂單
│   │   └── profile.tsx          # 個人頁面
│   ├── task/[id].tsx            # 任務詳情
│   ├── order/[id].tsx           # 訂單詳情
│   └── review/[orderId].tsx     # 評價
├── lib/
│   ├── types.ts                 # 資料類型
│   ├── storage.ts               # 本地儲存
│   ├── app-context.tsx          # 全域狀態
│   └── trpc.ts                  # tRPC 客戶端
├── server/
│   ├── routers.ts               # API 路由
│   └── db.ts                    # 資料庫查詢
└── components/                  # 可重用元件
```

---

## 快速開始

### 1. 發布任務
```typescript
const { publishTask } = useApp();
await publishTask({
  title: '幫我買飲料',
  category: 'food',
  pickupLocation: '學生餐廳',
  deliveryLocation: '宿舍 A 棟',
  reward: 30,
  deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
});
```

### 2. 接受任務
```typescript
const { acceptTask } = useApp();
await acceptTask(taskId);
```

### 3. 完成訂單
```typescript
const { completeOrder } = useApp();
await completeOrder(orderId);
```

### 4. 提交評價
```typescript
const { submitReview } = useApp();
await submitReview(orderId, revieweeId, 5, '非常滿意！');
```

---

## 常見問題

### Q: 如何修改用戶暱稱？
A: 使用 `updateUserName` 函數：
```typescript
const { updateUserName } = useApp();
await updateUserName('新暱稱');
```

### Q: 如何查看我發出的訂單？
A: 在訂單頁面篩選 `publisherId === state.user.id`

### Q: 如何計算平均評分？
A: 
```typescript
const myReviews = state.reviews.filter(r => r.revieweeId === userId);
const avgRating = myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length;
```

### Q: 如何清除所有本地資料？
A: 使用個人頁面的「清除所有資料」按鈕（測試用）

---

## 聯絡與支援

如有任何問題或建議，歡迎提出 Issue 或 Pull Request。
