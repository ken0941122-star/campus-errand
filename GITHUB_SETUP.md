# GitHub 推送完整指南

## 步驟 1：在 GitHub 建立新倉庫

### 1.1 登入 GitHub

1. 開啟瀏覽器，進入 https://github.com
2. 登入你的帳號 `ken0941122-star`

### 1.2 建立新倉庫

1. 點擊右上角的 **「+」** 圖示
2. 選擇 **「New repository」**

### 1.3 填寫倉庫資訊

| 欄位 | 值 |
|------|-----|
| **Repository name** | `campus-errand` |
| **Description** | `Campus errand service mobile app with Supabase` |
| **Visibility** | 選 **「Public」** 或 **「Private」**（推薦 Public） |
| **Initialize this repository** | 不勾選（我們已有本地代碼） |

### 1.4 建立倉庫

點擊 **「Create repository」** 按鈕

### 1.5 複製倉庫 URL

建立完後，你會看到一個頁面，頁面上會顯示：

```
https://github.com/ken0941122-star/campus-errand.git
```

**複製這個 URL，下一步會用到。**

---

## 步驟 2：本地推送代碼到 GitHub

### 2.1 開啟終端機

在你的電腦上開啟終端機（Terminal / Command Prompt）

### 2.2 進入專案目錄

```bash
cd campus-errand
```

### 2.3 設定 Git 用戶資訊（如果還沒設定）

```bash
git config --global user.name "你的名字"
git config --global user.email "你的郵箱@example.com"
```

例如：
```bash
git config --global user.name "Ken"
git config --global user.email "ken@example.com"
```

### 2.4 新增遠端倉庫

```bash
git remote add origin https://github.com/ken0941122-star/campus-errand.git
```

**注意：** 將 `ken0941122-star` 替換成你的 GitHub 用戶名

### 2.5 驗證遠端倉庫

```bash
git remote -v
```

你應該會看到：
```
origin  https://github.com/ken0941122-star/campus-errand.git (fetch)
origin  https://github.com/ken0941122-star/campus-errand.git (push)
```

### 2.6 推送代碼到 GitHub

```bash
git branch -M main
git push -u origin main
```

**第一次推送時，可能會要求輸入 GitHub 帳號和密碼。**

#### 使用 GitHub Token（推薦）

如果出現認證問題，使用 Personal Access Token：

1. 進入 GitHub Settings：https://github.com/settings/tokens
2. 點「Generate new token」
3. 勾選 `repo` 權限
4. 複製 Token
5. 推送時，用戶名輸入 `ken0941122-star`，密碼輸入 Token

### 2.7 驗證推送成功

進入 https://github.com/ken0941122-star/campus-errand，確認代碼已上傳

---

## 步驟 3：設定 .gitignore

確保以下檔案不會被推送到 GitHub：

**檔案位置：** 專案根目錄 `.gitignore`

```
# Dependencies
node_modules/
pnpm-lock.yaml
yarn.lock
package-lock.json

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
.expo/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.cache/
.turbo/
```

---

## 步驟 4：後續更新代碼

每次修改代碼後，用以下命令推送到 GitHub：

```bash
# 查看修改的檔案
git status

# 新增所有修改
git add .

# 提交修改
git commit -m "描述你的修改"

# 推送到 GitHub
git push
```

### 提交訊息範例

```bash
git commit -m "feat: 新增登入頁面"
git commit -m "fix: 修復任務列表顯示問題"
git commit -m "docs: 更新 README"
git commit -m "refactor: 優化 Supabase 查詢"
```

---

## 常見問題

### Q: 推送時出現 "fatal: not a git repository"

**解決方法：**
```bash
cd campus-errand
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ken0941122-star/campus-errand.git
git push -u origin main
```

### Q: 推送時出現 "Authentication failed"

**解決方法：**
1. 使用 GitHub Personal Access Token（見上面的步驟）
2. 或者在 GitHub Desktop 應用中登入

### Q: 如何修改已推送的提交訊息？

```bash
git commit --amend -m "新的提交訊息"
git push --force-with-lease
```

### Q: 如何回退到上一個版本？

```bash
git log  # 查看提交歷史
git revert <commit-hash>  # 回退到某個版本
git push
```

---

## 檢查清單

- [ ] 在 GitHub 建立了 `campus-errand` 倉庫
- [ ] 複製了倉庫 URL
- [ ] 本地設定了 Git 用戶資訊
- [ ] 執行了 `git remote add origin`
- [ ] 執行了 `git push -u origin main`
- [ ] 驗證代碼已上傳到 GitHub
- [ ] 設定了 `.gitignore`

---

## 下一步

完成 GitHub 推送後，進行 **Vercel 部署設定**（見 VERCEL_SETUP.md）
