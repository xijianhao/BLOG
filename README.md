# 📚 KeGoLog

一个基于 Astro 构建的个人知识库系统，用于管理和展示各种类型的笔记。

## ✨ 功能特性

- 📖 **多笔记本管理**：支持创建多个笔记本分类（如 React、Vue、JavaScript、做饭等）
- 📝 **笔记列表**：每个笔记本下可以包含多篇笔记
- 🎨 **现代化 UI**：美观的渐变背景和卡片式设计
- 🔍 **标签系统**：为笔记添加标签便于分类
- 📱 **响应式设计**：完美适配移动端和桌面端
- ⚡ **静态生成**：基于 Astro 的静态站点生成，性能优异

## 🚀 快速开始

### 安装依赖

```sh
pnpm install
```

### 启动开发服务器

```sh
pnpm dev
```

访问 `http://localhost:4321` 查看效果。

### 构建生产版本

```sh
pnpm build
```

### 预览生产构建

```sh
pnpm preview
```

## 📁 项目结构

```
/
├── src/
│   ├── content/          # 内容管理
│   │   ├── notebooks/   # 笔记本配置
│   │   ├── notes/       # 笔记内容
│   │   └── config.ts    # Content Collections 配置
│   ├── components/      # 组件
│   │   ├── NotebookCard.astro
│   │   └── NoteCard.astro
│   ├── layouts/         # 布局
│   │   └── Layout.astro
│   ├── pages/           # 页面路由
│   │   ├── index.astro  # 首页
│   │   └── notebooks/   # 笔记本和笔记页面
│   └── utils/           # 工具函数
│       └── notebooks.ts
└── package.json
```

## 📝 添加新笔记本

在 `src/content/notebooks/` 目录下创建新的 Markdown 文件，例如 `typescript.md`：

```markdown
---
title: TypeScript
description: TypeScript 学习笔记
icon: 📘
color: #3178c6
order: 5
---

# TypeScript 笔记本

这里收集了所有关于 TypeScript 的学习笔记。
```

## 📄 添加新笔记

在 `src/content/notes/` 目录下创建新的 Markdown 文件，例如 `typescript-basics.md`：

```markdown
---
title: TypeScript 基础
notebook: typescript
date: 2024-01-30
tags: ['typescript', '基础']
excerpt: TypeScript 的基础语法和类型系统
order: 1
---

# TypeScript 基础

这里是笔记内容...
```

**注意**：`notebook` 字段必须与笔记本的 slug（文件名）匹配。

## 🎨 自定义样式

- 修改 `src/layouts/Layout.astro` 中的全局样式
- 修改各个组件中的样式来调整外观
- 笔记本颜色通过 `color` 字段自定义

## 📚 示例笔记本

系统已包含以下示例笔记本：

- ⚛️ **React** - React 学习笔记和最佳实践
- 🖖 **Vue** - Vue.js 框架学习笔记
- 📜 **JavaScript** - JavaScript 核心知识
- 🍳 **做饭** - 美食制作和烹饪技巧