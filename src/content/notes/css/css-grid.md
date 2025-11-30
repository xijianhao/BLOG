---
title: CSS Grid 布局
notebook: css
date: 2025-01-18
tags: ['布局', 'Grid', '二维布局']
excerpt: CSS Grid 布局的完整指南，包括网格容器、网格项目、网格线、区域及复杂布局模式
order: 6
---

# CSS Grid 布局

CSS Grid 是最强大的二维布局系统，可以同时控制行和列，适合复杂的页面布局。

## 基本概念

### 网格容器和网格项目

```css
/* 容器：设置 display: grid */
.container {
  display: grid; /* 或 inline-grid */
}

/* 项目：容器的直接子元素 */
.item {
  /* 自动成为网格项目 */
}
```

### 网格术语

- **Grid Container（网格容器）**：`display: grid` 的元素
- **Grid Item（网格项目）**：容器的直接子元素
- **Grid Line（网格线）**：划分网格的线
- **Grid Track（网格轨道）**：两条网格线之间的空间
- **Grid Cell（网格单元格）**：最小的网格单位
- **Grid Area（网格区域）**：一个或多个网格单元格

```
┌─────┬─────┬─────┐
│  1  │  2  │  3  │ ← Grid Line
├─────┼─────┼─────┤
│  4  │  5  │  6  │
├─────┼─────┼─────┤
│  7  │  8  │  9  │
└─────┴─────┴─────┘
     ↑ Grid Track
```

## 容器属性

### display

```css
.container {
  display: grid; /* 块级网格容器 */
  display: inline-grid; /* 行内网格容器 */
}
```

### grid-template-columns

定义列的大小。

```css
.container {
  /* 固定宽度 */
  grid-template-columns: 200px 200px 200px;
  
  /* 使用 fr（分数单位） */
  grid-template-columns: 1fr 2fr 1fr; /* 1:2:1 比例 */
  
  /* 混合单位 */
  grid-template-columns: 200px 1fr 100px;
  
  /* repeat() 函数 */
  grid-template-columns: repeat(3, 1fr); /* 3 列，每列 1fr */
  grid-template-columns: repeat(3, 200px);
  
  /* auto-fill 和 auto-fit */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  
  /* minmax() 函数 */
  grid-template-columns: minmax(200px, 1fr) 1fr 1fr;
}
```

### grid-template-rows

定义行的大小。

```css
.container {
  grid-template-rows: 100px 200px 100px;
  grid-template-rows: 1fr 2fr 1fr;
  grid-template-rows: repeat(3, auto);
}
```

### grid-template-areas

通过命名区域定义布局。

```css
.container {
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

### grid-template

`grid-template-rows`、`grid-template-columns`、`grid-template-areas` 的简写。

```css
.container {
  grid-template:
    "header header" 60px
    "sidebar main" 1fr
    "footer footer" 40px
    / 200px 1fr;
}
```

### gap

定义网格线之间的间距。

```css
.container {
  gap: 1rem;           /* 统一间距 */
  gap: 1rem 2rem;      /* 行间距 列间距 */
  row-gap: 1rem;       /* 行间距 */
  column-gap: 2rem;    /* 列间距 */
}
```

### justify-items

定义项目在**列方向**（水平）的对齐方式。

```css
.container {
  justify-items: stretch;    /* 默认：拉伸 */
  justify-items: start;      /* 起点对齐 */
  justify-items: end;        /* 终点对齐 */
  justify-items: center;     /* 居中 */
}
```

### align-items

定义项目在**行方向**（垂直）的对齐方式。

```css
.container {
  align-items: stretch;    /* 默认：拉伸 */
  align-items: start;      /* 起点对齐 */
  align-items: end;        /* 终点对齐 */
  align-items: center;     /* 居中 */
  align-items: baseline;   /* 基线对齐 */
}
```

### place-items

`align-items` 和 `justify-items` 的简写。

```css
.container {
  place-items: center;        /* align justify */
  place-items: start end;     /* align justify */
}
```

### justify-content

定义整个网格在**列方向**的对齐方式（当网格小于容器时）。

```css
.container {
  justify-content: start;      /* 默认：起点 */
  justify-content: end;        /* 终点 */
  justify-content: center;     /* 居中 */
  justify-content: space-between;
  justify-content: space-around;
  justify-content: space-evenly;
  justify-content: stretch;
}
```

### align-content

定义整个网格在**行方向**的对齐方式。

```css
.container {
  align-content: start;
  align-content: end;
  align-content: center;
  align-content: space-between;
  align-content: space-around;
  align-content: space-evenly;
  align-content: stretch;
}
```

### grid-auto-columns

定义隐式创建的列的大小。

```css
.container {
  grid-template-columns: repeat(3, 1fr);
  grid-auto-columns: 100px; /* 超出 3 列的项目使用 100px */
}
```

### grid-auto-rows

定义隐式创建的行的大小。

```css
.container {
  grid-auto-rows: minmax(100px, auto);
}
```

### grid-auto-flow

定义自动放置项目的算法。

```css
.container {
  grid-auto-flow: row;        /* 默认：按行 */
  grid-auto-flow: column;     /* 按列 */
  grid-auto-flow: dense;      /* 密集填充 */
  grid-auto-flow: row dense;  /* 按行密集 */
}
```

## 项目属性

### grid-column-start / grid-column-end

定义项目在列方向的起始和结束位置。

```css
.item {
  grid-column-start: 1;
  grid-column-end: 3; /* 跨越 2 列 */
  
  /* 使用网格线名称 */
  grid-column-start: col-start;
  grid-column-end: col-end;
}
```

### grid-row-start / grid-row-end

定义项目在行方向的起始和结束位置。

```css
.item {
  grid-row-start: 1;
  grid-row-end: 3; /* 跨越 2 行 */
}
```

### grid-column

`grid-column-start` 和 `grid-column-end` 的简写。

```css
.item {
  grid-column: 1 / 3;        /* start / end */
  grid-column: 1 / span 2;   /* 从 1 开始，跨越 2 列 */
  grid-column: span 2;       /* 跨越 2 列 */
  grid-column: 1 / -1;       /* 从 1 到最后一列 */
}
```

### grid-row

`grid-row-start` 和 `grid-row-end` 的简写。

```css
.item {
  grid-row: 1 / 3;
  grid-row: 1 / span 2;
}
```

### grid-area

定义项目占据的区域。

```css
.item {
  /* 方式1：使用命名区域 */
  grid-area: header;
  
  /* 方式2：使用行和列 */
  grid-area: 1 / 1 / 3 / 3; /* row-start / col-start / row-end / col-end */
  
  /* 方式3：简写 */
  grid-area: 1 / 1 / span 2 / span 2;
}
```

### justify-self

覆盖容器的 `justify-items`，定义单个项目的列方向对齐。

```css
.item {
  justify-self: stretch;  /* 默认 */
  justify-self: start;
  justify-self: end;
  justify-self: center;
}
```

### align-self

覆盖容器的 `align-items`，定义单个项目的行方向对齐。

```css
.item {
  align-self: stretch;  /* 默认 */
  align-self: start;
  align-self: end;
  align-self: center;
}
```

### place-self

`align-self` 和 `justify-self` 的简写。

```css
.item {
  place-self: center;        /* align justify */
  place-self: start end;     /* align justify */
}
```

## 命名网格线

### 列线命名

```css
.container {
  grid-template-columns: 
    [sidebar-start] 200px 
    [sidebar-end main-start] 1fr 
    [main-end];
}

.sidebar {
  grid-column: sidebar-start / sidebar-end;
}

.main {
  grid-column: main-start / main-end;
}
```

### 行线命名

```css
.container {
  grid-template-rows: 
    [header-start] auto 
    [header-end content-start] 1fr 
    [content-end footer-start] auto 
    [footer-end];
}
```

## 常见布局模式

### 1. 12 列网格系统

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

.col-1 { grid-column: span 1; }
.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-12 { grid-column: span 12; }
```

### 2. 圣杯布局

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

### 3. 响应式卡片网格

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

### 4. 瀑布流布局

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 10px; /* 小行高 */
  gap: 1rem;
}

.item {
  grid-row-end: span var(--row-span); /* 通过 JS 计算 */
}
```

### 5. 不对称布局

```css
.asymmetric {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1rem;
}

.featured {
  grid-column: 1 / -1; /* 跨越所有列 */
}
```

### 6. 表单布局

```css
.form {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: center;
}

.label {
  justify-self: end;
}
```

## Subgrid（子网格）

Subgrid 允许子元素继承父网格的轨道定义。

```css
.parent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.child-grid {
  display: grid;
  grid-column: span 2;
  grid-template-columns: subgrid; /* 继承父网格的列定义 */
  grid-template-rows: subgrid;    /* 继承父网格的行定义 */
}
```

**浏览器支持**：Firefox 71+, Safari 16.0+, Chrome 117+

## 高级技巧

### 1. 使用 minmax() 实现响应式

```css
.container {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  /* 最小 250px，最大 1fr，自动适应 */
}
```

### 2. 使用 auto-fill vs auto-fit

```css
/* auto-fill：创建尽可能多的列，即使为空 */
.container {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* auto-fit：折叠空列，填充可用空间 */
.container {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

### 3. 使用负网格线

```css
.item {
  grid-column: 1 / -1; /* 从第一列到最后一列 */
  grid-row: 1 / -1;    /* 从第一行到最后一行 */
}
```

### 4. 使用 fr 单位

```css
.container {
  grid-template-columns: 200px 1fr 2fr;
  /* 固定 200px，剩余空间按 1:2 分配 */
}
```

## 常见问题

### 问题1：项目溢出

```css
/* ✅ 使用 minmax() 防止溢出 */
.container {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```

### 问题2：隐式行高度不一致

```css
/* ✅ 设置 grid-auto-rows */
.container {
  grid-auto-rows: minmax(100px, auto);
}
```

### 问题3：响应式布局

```css
.container {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }
}
```

## 最佳实践

1. **使用 grid-template-areas**：直观的布局定义
2. **使用 gap 替代 margin**：更简洁
3. **使用 fr 单位**：灵活分配空间
4. **使用 minmax()**：响应式设计
5. **命名网格线**：提高可读性
6. **合理使用 auto-fill/auto-fit**：自动响应式
7. **组合 Grid 和 Flexbox**：Grid 布局整体，Flexbox 布局组件

## Grid vs Flexbox

| 特性 | Grid | Flexbox |
|-----|------|---------|
| 维度 | 二维（行和列） | 一维（行或列） |
| 适用场景 | 整体页面布局 | 组件内部布局 |
| 对齐 | 更强大 | 简单直观 |
| 重叠 | 支持 | 不支持 |

**建议**：
- **Grid**：整体布局、复杂二维布局
- **Flexbox**：组件内部、一维布局
- **组合使用**：Grid 布局整体，Flexbox 布局组件

## 总结

- **Grid**：最强大的二维布局系统
- **容器属性**：定义网格结构
- **项目属性**：控制项目位置
- **常用模式**：12 列网格、圣杯布局、响应式卡片
- **最佳实践**：使用 gap、fr、minmax()、grid-template-areas

