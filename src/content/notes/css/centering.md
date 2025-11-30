---
title: 居中对齐
notebook: css
date: 2025-02-22
tags: ['对齐', '居中', '布局技巧']
excerpt: CSS 居中对齐的完整指南，包括水平居中、垂直居中、完全居中及各种场景下的最佳实践
order: 7
---

# 居中对齐

居中对齐是前端开发中最常见的需求之一。本文涵盖各种居中场景和最佳实践。

## 水平居中

### 1. 行内元素（inline/inline-block）

```css
/* 方法1：text-align（父元素设置） */
.parent {
  text-align: center;
}

/* 方法2：margin auto（元素设置） */
.inline-block {
  display: inline-block;
  margin: 0 auto; /* 无效，inline-block 不支持 */
}

/* ✅ 正确：父元素 text-align */
.parent {
  text-align: center;
}
```

### 2. 块级元素

```css
/* 固定宽度 + margin auto */
.block {
  width: 300px;
  margin: 0 auto;
}

/* 最大宽度 + margin auto（响应式） */
.block {
  max-width: 800px;
  margin: 0 auto;
}
```

### 3. Flexbox

```css
/* 容器设置 */
.container {
  display: flex;
  justify-content: center;
}

/* 项目自动居中 */
```

### 4. Grid

```css
.container {
  display: grid;
  justify-items: center; /* 所有项目居中 */
}

/* 或单个项目 */
.item {
  justify-self: center;
}
```

## 垂直居中

### 1. 单行文本

```css
/* line-height = height */
.text {
  height: 100px;
  line-height: 100px;
}
```

### 2. 块级元素（已知高度）

```css
/* 方法1：绝对定位 + 负 margin */
.parent {
  position: relative;
  height: 400px;
}

.child {
  position: absolute;
  top: 50%;
  margin-top: -50px; /* 负值 = 元素高度的一半 */
  height: 100px;
}

/* 方法2：绝对定位 + transform */
.child {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
```

### 3. Flexbox

```css
.container {
  display: flex;
  align-items: center;
  height: 100vh; /* 需要高度 */
}
```

### 4. Grid

```css
.container {
  display: grid;
  align-items: center;
  height: 100vh;
}

/* 或单个项目 */
.item {
  align-self: center;
}
```

## 完全居中（水平 + 垂直）

### 1. 绝对定位 + transform（经典方法）

```css
.parent {
  position: relative;
  height: 100vh;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**优点**：
- 不需要知道元素尺寸
- 兼容性好

**缺点**：
- 需要父元素有定位上下文
- transform 可能影响其他属性

### 2. Flexbox（现代推荐）

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

**优点**：
- 代码简洁
- 不需要定位
- 响应式友好

### 3. Grid（现代推荐）

```css
.container {
  display: grid;
  place-items: center; /* justify-items + align-items */
  height: 100vh;
}
```

**优点**：
- 代码最简洁
- 不需要定位

### 4. 绝对定位 + margin auto

```css
.parent {
  position: relative;
  height: 100vh;
}

.child {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 300px;
  height: 200px;
}
```

**优点**：
- 不需要 transform
- 兼容性好

**缺点**：
- 需要知道元素尺寸

### 5. 表格布局（传统方法）

```css
.parent {
  display: table;
  width: 100%;
  height: 100vh;
}

.child {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
```

## 特定场景的居中

### 1. 图片居中

```css
/* 方法1：父元素 text-align */
.container {
  text-align: center;
}

/* 方法2：display block + margin */
img {
  display: block;
  margin: 0 auto;
}

/* 方法3：Flexbox */
.container {
  display: flex;
  justify-content: center;
}
```

### 2. 文本居中

```css
/* 水平居中 */
.text {
  text-align: center;
}

/* 垂直居中（单行） */
.text {
  line-height: 100px;
  height: 100px;
}

/* 垂直居中（多行） */
.text {
  display: flex;
  align-items: center;
  height: 100px;
}
```

### 3. 按钮居中

```css
/* 方法1：父元素 text-align */
.button-container {
  text-align: center;
}

/* 方法2：Flexbox */
.button-container {
  display: flex;
  justify-content: center;
}

/* 方法3：Grid */
.button-container {
  display: grid;
  justify-items: center;
}
```

### 4. 表单元素居中

```css
/* 表单整体居中 */
.form {
  max-width: 500px;
  margin: 0 auto;
}

/* 表单内部元素 */
.form-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.label {
  flex: 0 0 120px;
  text-align: right;
}
```

### 5. 模态框居中

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
}
```

### 6. 卡片网格居中

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  justify-items: center; /* 卡片内容居中 */
}

.card {
  width: 100%;
  max-width: 400px;
}
```

## 响应式居中

### 1. 使用 clamp()

```css
.container {
  width: clamp(300px, 90vw, 1200px);
  margin: 0 auto;
  padding: clamp(1rem, 5vw, 3rem);
}
```

### 2. 使用 max-width

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

### 3. 移动端适配

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

## 常见问题和解决方案

### 问题1：margin auto 不生效

```css
/* ❌ 问题：inline 元素不支持 margin auto */
.inline {
  margin: 0 auto; /* 无效 */
}

/* ✅ 解决：改为 block 或 inline-block */
.inline {
  display: block;
  margin: 0 auto;
}
```

### 问题2：绝对定位居中时元素被裁剪

```css
/* ❌ 问题：父元素 overflow: hidden */
.parent {
  position: relative;
  overflow: hidden;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* 可能被裁剪 */
}

/* ✅ 解决：调整父元素或使用其他方法 */
.parent {
  position: relative;
  /* 移除 overflow: hidden，或使用 Flexbox */
}
```

### 问题3：Flexbox 居中需要高度

```css
/* ❌ 问题：没有高度，垂直居中无效 */
.container {
  display: flex;
  align-items: center; /* 无效 */
}

/* ✅ 解决：设置高度 */
.container {
  display: flex;
  align-items: center;
  min-height: 100vh; /* 或固定高度 */
}
```

### 问题4：Grid 居中需要高度

```css
/* ❌ 问题：没有高度，垂直居中无效 */
.container {
  display: grid;
  place-items: center; /* 垂直居中无效 */
}

/* ✅ 解决：设置高度 */
.container {
  display: grid;
  place-items: center;
  min-height: 100vh;
}
```

## 最佳实践

### 1. 选择合适的居中方法

| 场景 | 推荐方法 | 原因 |
|-----|---------|------|
| 简单水平居中 | `margin: 0 auto` | 简单直接 |
| 完全居中（现代） | Flexbox | 代码简洁 |
| 完全居中（兼容） | 绝对定位 + transform | 兼容性好 |
| 文本居中 | `text-align: center` | 语义明确 |
| 响应式居中 | `max-width + margin auto` | 灵活 |

### 2. 使用现代方法优先

```css
/* ✅ 推荐：Flexbox */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ✅ 推荐：Grid */
.container {
  display: grid;
  place-items: center;
}

/* ⚠️ 传统方法：绝对定位（兼容性需要时使用） */
.container {
  position: relative;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 3. 避免过度使用绝对定位

```css
/* ❌ 不推荐：所有居中都用绝对定位 */
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* ✅ 推荐：根据场景选择 */
.block-centered {
  margin: 0 auto; /* 水平居中用 margin */
}

.flex-centered {
  display: flex;
  justify-content: center;
  align-items: center; /* 完全居中用 Flexbox */
}
```

### 4. 考虑响应式

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

## 居中方法对比

| 方法 | 优点 | 缺点 | 适用场景 |
|-----|------|------|---------|
| margin auto | 简单、兼容性好 | 只支持水平 | 块级元素水平居中 |
| text-align | 简单 | 只支持行内元素 | 文本、行内元素 |
| Flexbox | 代码简洁、灵活 | 需要容器高度 | 现代浏览器，完全居中 |
| Grid | 代码最简洁 | 需要容器高度 | 现代浏览器，完全居中 |
| 绝对定位 | 兼容性好 | 需要定位上下文 | 兼容性要求高 |
| transform | 不需要知道尺寸 | 可能影响其他属性 | 未知尺寸元素 |

## 总结

- **水平居中**：`margin: 0 auto`（块级）、`text-align: center`（行内）、Flexbox/Grid
- **垂直居中**：Flexbox `align-items`、Grid `align-items`、绝对定位 + transform
- **完全居中**：Flexbox（推荐）、Grid（推荐）、绝对定位 + transform（兼容）
- **选择原则**：现代浏览器用 Flexbox/Grid，兼容性要求用传统方法
- **最佳实践**：根据场景选择，考虑响应式，避免过度使用绝对定位

