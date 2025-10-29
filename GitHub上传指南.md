# GitHub上传指南

## 📋 准备工作

### 1. 创建GitHub账号
- 访问 https://github.com
- 点击 "Sign up" 注册账号（如果已有账号跳过此步）

### 2. 在GitHub创建新仓库
1. 登录GitHub
2. 点击右上角 `+` → `New repository`
3. 填写信息：
   - **Repository name**: `tavern-memory-helper`（可以改成你喜欢的名字）
   - **Description**: `酒馆助手记忆管理脚本`
   - **选择 Public**（必须是公开仓库才能用jsdelivr CDN）
   - ❌ **不要勾选** "Add a README file"
   - ❌ **不要勾选** "Add .gitignore"
   - ❌ **不要勾选** "Choose a license"
4. 点击 `Create repository`
5. **记下仓库地址**，类似：`https://github.com/你的用户名/tavern-memory-helper.git`

---

## 🚀 上传代码到GitHub

### 方式一：使用命令行（推荐）

在项目文件夹下打开PowerShell或命令行，依次运行以下命令：

#### 1. 配置Git用户信息（如果是第一次使用Git）
```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你的GitHub邮箱"
```
**注意**：把上面的引号内容替换为你的实际信息，例如：
```bash
git config --global user.name "mzrodyu"
git config --global user.email "mzrodyu@example.com"
```

#### 2. 添加所有文件到Git
```bash
git add .
```

#### 3. 创建第一个提交
```bash
git commit -m "Initial commit: 记忆管理脚本 v1.0"
```

#### 4. 添加远程仓库
```bash
git remote add origin https://github.com/你的用户名/仓库名.git
```
**注意**：把上面的地址替换为你在GitHub创建的仓库地址，例如：
```bash
git remote add origin https://github.com/mzrodyu/tavern-memory-helper.git
```

#### 5. 推送到GitHub
```bash
git branch -M main
git push -u origin main
```

如果推送时要求输入用户名和密码：
- **用户名**：你的GitHub用户名
- **密码**：使用 Personal Access Token（不是GitHub密码）

---

### 如何获取 Personal Access Token（如果需要）

1. 登录GitHub
2. 点击右上角头像 → `Settings`
3. 左侧菜单最底部 → `Developer settings`
4. 点击 `Personal access tokens` → `Tokens (classic)`
5. 点击 `Generate new token` → `Generate new token (classic)`
6. 设置：
   - **Note**: `Tavern Helper Upload`
   - **Expiration**: `90 days` 或 `No expiration`
   - **Select scopes**: 勾选 `repo` (完整的仓库权限)
7. 点击 `Generate token`
8. **复制token并保存**（只显示一次！）
9. 在Git推送时，用这个token作为密码

---

### 方式二：使用GitHub Desktop（图形界面）

#### 1. 下载并安装GitHub Desktop
- 访问 https://desktop.github.com/
- 下载并安装

#### 2. 登录GitHub账号
- 打开GitHub Desktop
- File → Options → Accounts → Sign in

#### 3. 添加本地仓库
- File → Add local repository
- 选择你的项目文件夹 `tavern_helper_template-main`
- 如果提示"未初始化"，点击 `create a repository`

#### 4. 提交更改
- 在左侧看到所有更改的文件
- 在底部 Summary 输入：`Initial commit: 记忆管理脚本`
- 点击 `Commit to main`

#### 5. 发布到GitHub
- 点击顶部的 `Publish repository`
- 确认名称为 `tavern-memory-helper`
- ❌ 取消勾选 "Keep this code private"（要用CDN必须公开）
- 点击 `Publish Repository`

---

## ✅ 上传成功后的步骤

### 1. 获取jsdelivr CDN链接
上传成功后，你的文件可以通过以下地址访问：
```
https://testingcf.jsdelivr.net/gh/你的用户名/仓库名/dist/记忆/index.js
```
例如：
```
https://testingcf.jsdelivr.net/gh/mzrodyu/tavern-memory-helper/dist/记忆/index.js
```

### 2. 更新JSON配置文件
编辑 `dist/记忆/记忆管理.json`，将：
```json
"content": "import 'https://testingcf.jsdelivr.net/gh/你的GitHub用户名/你的仓库名/dist/记忆/index.js'"
```
改为：
```json
"content": "import 'https://testingcf.jsdelivr.net/gh/mzrodyu/tavern-memory-helper/dist/记忆/index.js'"
```
（替换为你的实际地址）

### 3. 重新提交并推送更新
```bash
git add dist/记忆/记忆管理.json
git commit -m "更新jsdelivr链接"
git push
```

### 4. 导入到酒馆
- 将更新后的 `dist/记忆/记忆管理.json` 导入到酒馆助手
- 完成！

---

## 🔄 后续更新代码

每次修改代码后，运行以下命令更新：

```bash
# 1. 构建最新代码
pnpm run build

# 2. 添加更改
git add .

# 3. 提交更改
git commit -m "更新说明，如：修复表格功能"

# 4. 推送到GitHub
git push
```

jsdelivr CDN会在几分钟内自动更新，酒馆用户重新加载脚本即可获得最新版本！

---

## ❓ 常见问题

### Q: 推送时提示 "authentication failed"
A: 使用Personal Access Token而不是密码，参考上面的"如何获取 Personal Access Token"

### Q: 推送时提示 "remote: Repository not found"
A: 检查仓库地址是否正确，用户名和仓库名是否拼写错误

### Q: jsdelivr链接访问404
A: 
1. 确认仓库是Public（公开）
2. 等待几分钟让CDN更新
3. 检查文件路径是否正确

### Q: 如何删除之前错误的提交
A: 
```bash
# 回退到上一个提交
git reset --soft HEAD~1

# 强制推送（慎用！）
git push -f
```

---

## 📞 需要帮助？

如果遇到问题：
1. 检查命令是否完全按照上面的步骤执行
2. 确认Git已正确安装（运行 `git --version` 检查）
3. 确认网络连接正常
4. 查看错误提示信息

祝你上传顺利！🎉

