# 校園跑腿 APP - 完整部署指南

## 📋 目錄

1. [快速開始](#快速開始)
2. [Supabase 設定](#supabase-設定)
3. [GitHub 推送](#github-推送)
4. [Vercel 部署](#vercel-部署)
5. [測試和驗證](#測試和驗證)
6. [常見問題](#常見問題)

---

## 快速開始

### 前置要求

- Node.js 18+ 和 pnpm
- GitHub 帳號（ken0941122-star）
- Vercel 帳號（用 GitHub 登入）
- Supabase 帳號（已設定）

### 5 分鐘快速部署

```bash
# 1. 解壓源代碼
unzip campus-errand-source.zip
cd campus-errand

# 2. 安裝依賴
pnpm install

# 3. 設定環境變數
echo "EXPO_PUBLIC_SUPABASE_URL=https://zptamzjsqhikzcqoydyj.supabase.co" > .env.local
echo "EXPO_PUBLIC_SUPABASE_ANON_KEY=sbp_4b5a4ac52d6a1ba9bf491a7646eec3db34a705c5" >> .env.local

# 4. 推送到 GitHub
git remote add origin https://github.com/ken0941122-star/campus-errand.git
git branch -M main
git push -u origin main

# 5. 在 Vercel 部署（見下面的詳細步驟）
```

---

## Supabase 設定

### ✅ 已完成

- 資料表已建立（profiles、errands、bids、messages、transactions、reviews）
- RLS 規則已設定
- 環境變數已配置

### 驗證 Supabase 連接

```bash
pnpm test lib/supabase.test.ts
```

應該看到：
```
✓ lib/supabase.test.ts (3 tests) 171ms
Test Files  1 passed (1)
Tests  3 passed (3)
```

---

## GitHub 推送

### 詳細步驟

#### 步驟 1：在 GitHub 建立倉庫

1. 進入 https://github.com/new
2. 填寫：
   - Repository name: `campus-errand`
   - Description: `Campus errand service mobile app with Supabase`
   - Visibility: Public
3. 點「Create repository」

#### 步驟 2：推送代碼

```bash
# 進入專案目錄
cd campus-errand

# 設定 Git 用戶（如果還沒設定）
git config --global user.name "Ken"
git config --global user.email "ken@example.com"

# 新增遠端倉庫
git remote add origin https://github.com/ken0941122-star/campus-errand.git

# 推送代碼
git branch -M main
git push -u origin main
```

#### 步驟 3：驗證推送

進入 https://github.com/ken0941122-star/campus-errand，確認代碼已上傳

### 後續更新

每次修改代碼後：

```bash
git add .
git commit -m "描述你的修改"
git push
```

---

## Vercel 部署

### 詳細步驟

#### 步驟 1：登入 Vercel

1. 進入 https://vercel.com
2. 點「Sign In」
3. 選「Continue with GitHub」
4. 授權 Vercel

#### 步驟 2：匯入專案

1. 進入 Dashboard
2. 點「Add New...」→「Project」
3. 選「Import Git Repository」
4. 搜尋並選擇 `campus-errand`
5. 點「Import」

#### 步驟 3：設定專案

在「Configure Project」頁面：

**Build Settings:**
```
Framework Preset: Other
Root Directory: ./
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
```

**Environment Variables:**

新增以下變數：

| 名稱 | 值 |
|------|-----|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://zptamzjsqhikzcqoydyj.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `sbp_4b5a4ac52d6a1ba9bf491a7646eec3db34a705c5` |

#### 步驟 4：部署

1. 確認所有設定正確
2. 點「Deploy」
3. 等待部署完成（2-5 分鐘）

#### 步驟 5：驗證部署

部署完成後，你會得到一個 URL，例如：

```
https://campus-errand-abc123.vercel.app
```

點「Visit」查看應用

---

## 測試和驗證

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
3. 測試功能

### 驗證後端 API

```bash
# 測試健康檢查
curl https://campus-errand-abc123.vercel.app/api/health

# 測試 tRPC 端點
curl https://campus-errand-abc123.vercel.app/api/trpc/tasks.list
```

---

## 常見問題

### Q: 推送到 GitHub 時出現認證錯誤

**解決方法：**
1. 使用 GitHub Personal Access Token
2. 進入 https://github.com/settings/tokens
3. 點「Generate new token」
4. 勾選 `repo` 權限
5. 複製 Token
6. 推送時用 Token 作為密碼

### Q: Vercel 部署失敗

**解決方法：**
1. 進入 Vercel Dashboard
2. 點「Deployments」
3. 查看失敗部署的「Build Logs」
4. 找出錯誤原因
5. 修復代碼並推送到 GitHub
6. Vercel 會自動重新部署

### Q: 環境變數沒有生效

**解決方法：**
1. 確認環境變數已正確設定
2. 在 Vercel 重新部署
3. 清除瀏覽器快取
4. 檢查代碼是否正確讀取環境變數

### Q: 如何查看 Vercel 的日誌？

**解決方法：**
1. 進入 Vercel Dashboard
2. 選擇你的專案
3. 進入「Logs」標籤
4. 查看應用日誌

### Q: 如何回滾到上一個版本？

**解決方法：**
1. 進入 Vercel Dashboard
2. 進入「Deployments」
3. 找到想要回滾的版本
4. 點「...」→「Redeploy」

---

## 架構概覽

```
┌─────────────────────────────────────────────────────────┐
│                    Expo Mobile App                       │
│  (iOS/Android via Expo Go 或 EAS Build)                 │
│                                                          │
│  使用 Supabase Client 連接雲端資料庫                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ├─→ Supabase
                     │   ├─ PostgreSQL Database
                     │   ├─ Authentication
                     │   └─ Real-time Subscriptions
                     │
                     └─→ Vercel (Optional Backend API)
                         ├─ Express Server
                         ├─ tRPC API
                         └─ Environment Variables

┌─────────────────────────────────────────────────────────┐
│                  GitHub (Version Control)               │
│  - Source code repository                               │
│  - Automatic deployment trigger to Vercel               │
└─────────────────────────────────────────────────────────┘
```

---

## 下一步

### 立即需要做

1. **修改 UI 頁面整合 Supabase**
   - 建立登入/註冊頁面
   - 修改首頁使用 `useSupabaseErrands`
   - 修改發單頁面
   - 修改我的訂單頁面
   - 修改個人頁面

2. **測試端到端流程**
   - 測試登入
   - 測試建立任務
   - 測試接單
   - 測試評價

3. **設定 CI/CD**
   - 新增自動測試
   - 設定 GitHub Actions

### 未來優化

- 新增實時訂閱（Supabase Realtime）
- 新增推播通知
- 新增支付整合
- 新增聊天功能
- 新增交易記錄功能

---

## 相關文件

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase 詳細設定
- [GITHUB_SETUP.md](./GITHUB_SETUP.md) - GitHub 推送詳細步驟
- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Vercel 部署詳細步驟

---

## 聯絡和支援

如有問題，請檢查：
1. 相關的設定文件
2. Supabase 儀表板的 Logs
3. Vercel 的 Build Logs
4. 本地開發伺服器的終端輸出

---

**最後更新：2026-04-27**
