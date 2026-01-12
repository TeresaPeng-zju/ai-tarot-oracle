# 🔮 AI 塔罗星阵

一个基于 Three.js 和 MediaPipe 的交互式塔罗牌应用，支持手势控制和鼠标操作。

## 📁 项目结构

```
AI塔罗/
├── index.html              # HTML 入口文件
├── src/                    # 源代码目录
│   ├── main.ts            # 主应用逻辑（TypeScript）
│   ├── styles.less        # 样式文件（LESS）
│   ├── config.ts          # 配置常量
│   ├── data.ts            # 塔罗牌数据
│   ├── shaders.ts         # 着色器代码
│   └── types.d.ts         # TypeScript 类型声明
├── tarot-card-back.jpg    # 卡牌背面图片
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
└── vite.config.js         # Vite 配置
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

浏览器会自动打开 `http://localhost:8000`，开始你的塔罗之旅！

## 📋 可用命令

- `npm run dev` - 启动开发服务器（支持热重载）
- `npm run build` - 构建生产版本
- `npm run preview` - 预览构建后的版本

## 🎮 操作说明

### 手势控制

- **🖐 张开手掌（Open）**：左右移动手掌来浏览卡牌堆
- **☝ 伸出食指（Point）**：瞄准卡牌，光标会跟随手指
- **👌 捏合（Pinch）**：抽取并查看选中的卡牌
- **✊ 握拳（Fist）**：销毁当前显示的卡牌，继续下一张

### 鼠标操作

- **移动鼠标**：控制光标位置
- **左右移动**：当鼠标移到屏幕边缘时，可以滚动浏览卡牌
- **左键点击**：在瞄准模式下点击抽取卡牌
- **右键点击**：销毁当前卡牌（模拟握拳手势）

## ⚙️ 技术栈

- **Three.js** - 3D 图形渲染
- **MediaPipe** - 手势识别
- **TypeScript** - 类型安全的 JavaScript
- **LESS** - CSS 预处理器
- **Vite** - 现代化构建工具

## 🔧 故障排除

### 摄像头无法启动

- ✅ 确保使用 `localhost` 访问（Vite 默认已配置）
- ✅ 检查浏览器权限，允许访问摄像头
- ✅ 如果摄像头不可用，可以使用鼠标操作

### 端口被占用

如果 8000 端口被占用，可以修改 `vite.config.js` 中的 `port` 配置。

### 首次运行

首次运行需要执行 `npm install` 安装依赖。

### 类型错误

如果遇到 TypeScript 类型错误，请确保：
- 已安装所有依赖：`npm install`
- TypeScript 版本兼容：项目使用 TypeScript 5.3+

## 📝 开发说明

### 代码组织

- **main.ts** - 包含 `TarotSpace` 类，负责应用的核心逻辑
- **data.ts** - 塔罗牌数据定义（22 张大阿卡纳 + 56 张小阿卡纳）
- **config.ts** - 应用配置常量
- **shaders.ts** - WebGL 着色器代码（用于灰烬粒子效果）
- **styles.less** - 全局样式

### 修改配置

编辑 `src/config.ts` 可以调整：
- 卡牌排列参数
- 滚动速度
- 光标平滑度
- 相机位置

---

**享受你的塔罗之旅！** 🔮✨
