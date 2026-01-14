# 🔐 后端代理设置指南

为了保护 DeepSeek API Key 的安全性，建议使用后端代理来转发 API 请求。

## 📋 设置步骤

### 1. 安装依赖

```bash
npm install express cors dotenv concurrently
```

### 2. 创建环境变量文件

创建 `.env` 文件（不要提交到 Git）：

```bash
# .env
DEEPSEEK_API_KEY=sk-your-api-key-here
PORT=3001
```

**⚠️ 重要**：将 `.env` 添加到 `.gitignore` 文件中，避免泄露 API Key。

### 3. 启动服务器

有两种方式启动：

#### 方式1：同时启动前后端（推荐）

```bash
npm run dev:full
```

这会同时启动：
- 后端代理服务器（端口 3001）
- 前端开发服务器（端口 8000）

#### 方式2：分别启动

**终端1 - 启动后端：**
```bash
npm run server
```

**终端2 - 启动前端：**
```bash
npm run dev
```

### 4. 验证设置

- 后端服务器应该显示：`🚀 后端代理服务器运行在 http://localhost:3001`
- 访问 `http://localhost:3001/health` 应该返回 `{"status":"ok"}`

## 🔧 配置说明

### 前端配置（index.html）

```javascript
const DEEPSEEK_CONFIG = {
    useProxy: true, // 使用后端代理（推荐）
    proxyURL: 'http://localhost:3001/api/tarot-reading',
    model: 'deepseek-reasoner'
};
```

### 后端配置（.env）

```env
DEEPSEEK_API_KEY=sk-your-actual-api-key
PORT=3001
```

## 🚀 生产环境部署

在生产环境中：

1. **后端服务器**：部署到服务器（如 Vercel, Railway, Heroku 等）
2. **环境变量**：在部署平台设置 `DEEPSEEK_API_KEY`
3. **前端配置**：将 `proxyURL` 改为生产环境的后端地址

### 示例：Vercel 部署

1. 创建 `vercel.json`：
```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server.js" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

2. 在 Vercel 项目设置中添加环境变量 `DEEPSEEK_API_KEY`

## 🔒 安全优势

使用后端代理的好处：

- ✅ API Key 不会暴露在浏览器代码中
- ✅ 可以添加访问限制和频率限制
- ✅ 可以记录 API 调用日志
- ✅ 可以添加用户认证

## 📝 注意事项

- 开发环境：确保前后端都在运行
- 生产环境：后端需要部署到可访问的服务器
- CORS：后端已配置 CORS，允许跨域请求
- 端口：默认后端端口 3001，可以在 `.env` 中修改

