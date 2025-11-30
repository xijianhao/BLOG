---
title: Flexbox 布局
notebook: css
date: 2024-09-12
tags: ['布局', 'Flexbox', '一维布局']
excerpt: Flexbox 布局的完整指南，包括容器属性、项目属性、常见布局模式及最佳实践
order: 5
---

# Flexbox 布局

Flexbox（弹性盒子布局）是 CSS3 引入的强大的一维布局系统，适合在单个方向上排列元素。

## 基本概念

### Flex 容器和 Flex 项目

```css
/* 容器：设置 display: flex */
.container {
  display: flex; /* 或 inline-flex */
}

/* 项目：容器的直接子元素 */
.item {
  /* 自动成为 flex 项目 */
}
```

### 主轴和交叉轴

- **主轴（Main Axis）**：`flex-direction` 定义的方向
- **交叉轴（Cross Axis）**：垂直于主轴的方向

```
flex-direction: row (默认)
┌─────────────────────────┐
│ → → → → → → → → → → → │ 主轴（水平）
│                         │
│         ↓               │ 交叉轴（垂直）
│         ↓               │
└─────────────────────────┘
```

## 容器属性

### display

```css
.container {
  display: flex; /* 块级 flex 容器 */
  display: inline-flex; /* 行内 flex 容器 */
}
```

### flex-direction

定义主轴方向。

```css
.container {
  flex-direction: row;         /* 默认：水平，从左到右 */
  flex-direction: row-reverse; /* 水平，从右到左 */
  flex-direction: column;      /* 垂直，从上到下 */
  flex-direction: column-reverse; /* 垂直，从下到上 */
}
```

### flex-wrap

定义是否换行。

```css
.container {
  flex-wrap: nowrap;    /* 默认：不换行 */
  flex-wrap: wrap;      /* 换行 */
  flex-wrap: wrap-reverse; /* 反向换行 */
}
```

### flex-flow

`flex-direction` 和 `flex-wrap` 的简写。

```css
.container {
  flex-flow: row wrap; /* direction wrap */
}
```

### justify-content

定义项目在**主轴**上的对齐方式。

```css
.container {
  justify-content: flex-start;    /* 默认：起点对齐 */
  justify-content: flex-end;      /* 终点对齐 */
  justify-content: center;         /* 居中 */
  justify-content: space-between;  /* 两端对齐，项目间相等 */
  justify-content: space-around;  /* 项目两侧相等 */
  justify-content: space-evenly;  /* 项目间和两侧都相等 */
}
```

### align-items

定义项目在**交叉轴**上的对齐方式。

```css
.container {
  align-items: stretch;    /* 默认：拉伸填满 */
  align-items: flex-start; /* 起点对齐 */
  align-items: flex-end;   /* 终点对齐 */
  align-items: center;     /* 居中 */
  align-items: baseline;   /* 基线对齐 */
}
```

### align-content

定义**多行**在交叉轴上的对齐方式（单行无效）。

```css
.container {
  align-content: stretch;      /* 默认：拉伸 */
  align-content: flex-start;   /* 起点对齐 */
  align-content: flex-end;      /* 终点对齐 */
  align-content: center;        /* 居中 */
  align-content: space-between; /* 两端对齐 */
  align-content: space-around;  /* 两侧相等 */
}
```

### gap

定义项目之间的间距（现代属性）。

```css
.container {
  gap: 1rem;           /* 统一间距 */
  gap: 1rem 2rem;      /* 行间距 列间距 */
  row-gap: 1rem;       /* 行间距 */
  column-gap: 2rem;    /* 列间距 */
}
```

## 项目属性

### flex-grow

定义项目的放大比例。

```css
.item {
  flex-grow: 0; /* 默认：不放大 */
  flex-grow: 1; /* 放大，占据剩余空间 */
  flex-grow: 2; /* 放大比例是 1 的两倍 */
}
```

### flex-shrink

定义项目的缩小比例。

```css
.item {
  flex-shrink: 1; /* 默认：可以缩小 */
  flex-shrink: 0; /* 不缩小 */
  flex-shrink: 2; /* 缩小比例是 1 的两倍 */
}
```

### flex-basis

定义项目在分配空间之前的初始大小。

```css
.item {
  flex-basis: auto;   /* 默认：根据内容 */
  flex-basis: 200px;  /* 固定宽度 */
  flex-basis: 30%;    /* 百分比 */
  flex-basis: 0;      /* 不考虑内容，完全按比例分配 */
}
```

### flex

`flex-grow`、`flex-shrink`、`flex-basis` 的简写。

```css
.item {
  flex: 1;              /* flex: 1 1 0% */
  flex: 0 1 auto;       /* 默认值 */
  flex: 1 0 200px;      /* grow shrink basis */
  flex: none;           /* flex: 0 0 auto */
  flex: auto;           /* flex: 1 1 auto */
}
```

**常用值**：
- `flex: 1`：等分剩余空间
- `flex: 0 0 auto`：不伸缩，保持原始大小
- `flex: none`：等同于 `flex: 0 0 auto`

### align-self

覆盖容器的 `align-items`，定义单个项目的交叉轴对齐。

```css
.item {
  align-self: auto;      /* 默认：继承 align-items */
  align-self: flex-start;
  align-self: flex-end;
  align-self: center;
  align-self: baseline;
  align-self: stretch;
}
```

### order

定义项目的排列顺序。

```css
.item {
  order: 0; /* 默认：按文档顺序 */
  order: 1; /* 数字越大越靠后 */
  order: -1; /* 负数靠前 */
}
```

## 常见布局模式

### 1. 水平居中

```css
.container {
  display: flex;
  justify-content: center;
}
```

### 2. 垂直居中

```css
.container {
  display: flex;
  align-items: center;
  height: 100vh; /* 需要高度 */
}
```

### 3. 完全居中

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

### 4. 两端对齐

```css
.container {
  display: flex;
  justify-content: space-between;
}
```

### 5. 等分布局

```css
.container {
  display: flex;
}

.item {
  flex: 1; /* 等分空间 */
}
```

### 6. 固定 + 自适应

```css
.container {
  display: flex;
}

.sidebar {
  flex: 0 0 250px; /* 固定宽度，不伸缩 */
}

.main {
  flex: 1; /* 占据剩余空间 */
}
```

### 7. 响应式导航

```css
.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-item {
  flex: 1 1 200px; /* 最小 200px，可伸缩 */
}
```

### 8. 卡片布局

```css
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.card {
  flex: 1 1 300px; /* 最小 300px，可伸缩 */
  max-width: 400px;
}
```

### 9. 粘性页脚

```css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1; /* 占据剩余空间 */
}

.footer {
  /* 自动推到底部 */
}
```

### 10. 表单布局

```css
.form-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.label {
  flex: 0 0 120px; /* 固定标签宽度 */
}

.input {
  flex: 1; /* 输入框占据剩余空间 */
}
```

## 高级技巧

### 1. 使用 gap 替代 margin

```css
/* ❌ 使用 margin */
.container {
  display: flex;
}

.item {
  margin-right: 1rem;
}

.item:last-child {
  margin-right: 0; /* 需要处理最后一个 */
}

/* ✅ 使用 gap */
.container {
  display: flex;
  gap: 1rem; /* 自动处理间距 */
}
```

### 2. flex: 1 vs flex: auto

```css
/* flex: 1 - 不考虑内容，完全按比例 */
.item {
  flex: 1; /* flex: 1 1 0% */
}

/* flex: auto - 考虑内容，再按比例 */
.item {
  flex: auto; /* flex: 1 1 auto */
}
```

### 3. 防止项目收缩

```css
.item {
  flex-shrink: 0; /* 不收缩 */
  min-width: 0; /* 允许内容收缩（重要） */
}
```

### 4. 响应式 Flexbox

```css
.container {
  display: flex;
  flex-direction: row;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
```

## 常见问题

### 问题1：项目溢出容器

```css
/* ❌ 问题 */
.container {
  display: flex;
}

.item {
  flex: 1;
  min-width: 300px; /* 可能导致溢出 */
}

/* ✅ 解决 */
.container {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
}

.item {
  flex: 1 1 300px; /* 最小 300px，可换行 */
  min-width: 0; /* 允许收缩 */
}
```

### 问题2：文本溢出

```css
/* ❌ 问题：文本不换行 */
.item {
  flex: 1;
}

/* ✅ 解决 */
.item {
  flex: 1;
  min-width: 0; /* 关键：允许收缩 */
  word-wrap: break-word;
}
```

### 问题3：等高列

```css
/* ✅ Flexbox 自动实现等高 */
.container {
  display: flex;
  align-items: stretch; /* 默认值 */
}

.item {
  /* 自动等高 */
}
```

## 最佳实践

1. **优先使用 gap**：替代 margin，更简洁
2. **理解 flex 简写**：`flex: 1` 是最常用的
3. **设置 min-width: 0**：防止内容溢出
4. **合理使用 flex-wrap**：响应式布局
5. **避免嵌套过深**：保持结构简单
6. **使用 align-items**：统一交叉轴对齐
7. **利用 order**：调整视觉顺序

## Flexbox vs Grid

| 特性 | Flexbox | Grid |
|-----|---------|------|
| 维度 | 一维（行或列） | 二维（行和列） |
| 适用场景 | 组件内部、导航栏 | 整体页面布局 |
| 对齐 | 简单直观 | 更强大 |
| 浏览器支持 | 很好 | 很好 |

**建议**：
- **Flexbox**：组件内部、一维布局
- **Grid**：整体布局、二维布局
- **组合使用**：Grid 布局整体，Flexbox 布局组件

## 总结

- **Flexbox**：一维布局系统
- **容器属性**：控制整体布局
- **项目属性**：控制单个项目
- **常用模式**：居中、等分、响应式
- **最佳实践**：使用 gap、理解 flex 简写、设置 min-width: 0

