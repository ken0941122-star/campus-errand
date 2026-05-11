# Supabase + Vercel + GitHub 整合指南

## 概述

本指南說明如何將校園跑腿 APP 與 Supabase、Vercel 和 GitHub 整合，實現雲端資料庫同步和自動部署。

---

## 第 1 步：Supabase 設定（已完成）

### ✅ 已完成的工作

- 建立了 6 個資料表：`profiles`、`errands`、`bids`、`messages`、`transactions`、`reviews`
- 設定了行級安全性 (RLS) 規則
- 建立了自動更新 `updated_at` 的觸發器

### 環境變數

```
EXPO_PUBLIC_SUPABASE_URL=https://zptamzjsqhikzcqoydyj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sbp_4b5a4ac52d6a1ba9bf491a7646eec3db34a705c5
```

---

## 第 2 步：Expo 應用整合（已完成）

### ✅ 已安裝的套件

```bash
pnpm add @supabase/supabase-js
```

### ✅ 已建立的檔案

| 檔案 | 說明 |
|------|------|
| `lib/supabase.ts` | Supabase Client 初始化 |
| `hooks/use-supabase-auth.ts` | 認證 Hook（登入/註冊/登出） |
| `hooks/use-supabase-errands.ts` | 任務操作 Hook |
| `hooks/use-supabase-bids.ts` | 接單操作 Hook |
| `hooks/use-supabase-reviews.ts` | 評價操作 Hook |

### 使用範例

```tsx
import { useSupabaseAuth } from '@/hooks/use-supabase-auth';
import { useSupabaseErrands } from '@/hooks/use-supabase-errands';

export function MyComponent() {
  const { user, signIn, signUp } = useSupabaseAuth();
  const { errands, createErrand, fetchOpenErrands } = useSupabaseErrands();

  // 登入
  const handleSignIn = async () => {
    const { user, error } = await signIn('user@example.com', 'password');
    if (error) console.error(error);
  };

  // 建立任務
  const handleCreateErrand = async () => {
    const { data, error } = await createErrand({
      user_id: user!.id,
      title: '幫我買咖啡',
      description: '中杯美式',
      category: 'food',
      location: '圖書館',
      reward: 50,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'open',
    });
    if (error) console.error(error);
  };

  // 取得任務
  useEffect(() => {
    fetchOpenErrands();
  }, []);

  return (
    <View>
      {/* UI 代碼 */}
    </View>
  );
}
```

---

## 第 3 步：GitHub 版本控制設定

### 初始化 Git 倉庫

```bash
cd /home/ubuntu/campus-errand
git init
git add .
git commit -m "Initial commit: Supabase integration"
```

### 在 GitHub 建立新倉庫

1. 登入 GitHub：https://github.com
2. 點「New Repository」
3. 倉庫名稱：`campus-errand`
4. 描述：`Campus errand service mobile app with Supabase`
5. 選「Public」或「Private」
6. 點「Create repository」

### 推送代碼到 GitHub

```bash
git remote add origin https://github.com/ken0941122-star/campus-errand.git
git branch -M main
git push -u origin main
```

### .gitignore 檔案

確保以下檔案被忽略：

```
node_modules/
.env
.env.local
.env.*.local
dist/
build/
.DS_Store
*.log
```

---

## 第 4 步：Vercel 部署設定

### 連接 Vercel 到 GitHub

1. 登入 Vercel：https://vercel.com
2. 點「Add New...」→「Project」
3. 選「Import Git Repository」
4. 授權 GitHub 存取
5. 選擇 `campus-errand` 倉庫
6. 點「Import」

### 設定環境變數

在 Vercel 專案設定中，新增以下環境變數：

| 名稱 | 值 |
|------|-----|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://zptamzjsqhikzcqoydyj.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `sbp_4b5a4ac52d6a1ba9bf491a7646eec3db34a705c5` |

### 部署後端伺服器

1. 在 Vercel 儀表板選擇你的專案
2. 進入「Settings」→「Environment Variables」
3. 新增上面的環境變數
4. 進入「Deployments」，Vercel 會自動部署最新代碼

---

## 第 5 步：測試整合

### 本地測試

```bash
# 安裝依賴
pnpm install

# 執行測試
pnpm test

# 啟動開發伺服器
pnpm dev
```

### 在 Expo Go 測試

1. 安裝 Expo Go 應用（iOS/Android）
2. 掃描開發伺服器的 QR Code
3. 測試登入、建立任務、接單等功能

---

## 第 6 步：後續步驟

### 立即需要做

- [ ] 修改首頁使用 `useSupabaseErrands` Hook
- [ ] 修改發單頁面使用 `useSupabaseAuth` 和 `useSupabaseErrands`
- [ ] 修改我的訂單頁面使用 Supabase 查詢
- [ ] 修改個人頁面使用 `useSupabaseAuth` 和 `useSupabaseReviews`
- [ ] 測試端到端流程

### 未來優化

- [ ] 新增實時訂閱（Supabase Realtime）
- [ ] 新增推播通知
- [ ] 新增支付整合
- [ ] 新增聊天功能（使用 `messages` 表）
- [ ] 新增交易記錄功能（使用 `transactions` 表）

---

## 常見問題

### Q: 如何重置 Supabase 資料？

進入 Supabase 儀表板 → Settings → Danger Zone → Reset Database

### Q: 如何查看 Supabase 日誌？

進入 Supabase 儀表板 → Logs → Edge Function Logs

### Q: 如何在本地測試 RLS 規則？

使用 Supabase 的 SQL Editor 測試，或在應用中登入後測試

### Q: Vercel 部署失敗怎麼辦？

1. 檢查環境變數是否正確設定
2. 檢查 GitHub 代碼是否有語法錯誤
3. 查看 Vercel 的 Build Logs 找出問題

---

## 架構圖

```
┌─────────────────────────────────────────────────────────┐
│                    Expo Mobile App                       │
│  (iOS/Android via Expo Go 或 EAS Build)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ├─→ Supabase Client
                     │   (Authentication + Database)
                     │
                     └─→ Vercel Backend (Optional)
                         (Express + tRPC API)
                         
┌─────────────────────────────────────────────────────────┐
│                  Supabase (Backend)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                             │   │
│  │  - profiles, errands, bids, messages, etc.       │   │
│  │  - Row Level Security (RLS)                      │   │
│  │  - Real-time Subscriptions                       │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Authentication                                  │   │
│  │  - Email/Password                                │   │
│  │  - OAuth (Google, GitHub, etc.)                  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  GitHub (Version Control)               │
│  - Source code repository                               │
│  - Automatic deployment trigger to Vercel               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Vercel (Hosting)                        │
│  - Backend API server deployment                        │
│  - Automatic CI/CD from GitHub                          │
│  - Environment variables management                     │
└─────────────────────────────────────────────────────────┘
```

---

## 聯絡方式

如有問題，請檢查：
1. Supabase 儀表板的 Logs
2. Vercel 的 Build Logs
3. 本地開發伺服器的終端輸出
