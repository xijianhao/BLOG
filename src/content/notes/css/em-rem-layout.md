---
title: em rem 布局
notebook: css
date: 2024-07-08
tags: ['单位', '响应式', '布局']
excerpt: em 和 rem 单位的深入理解，使用场景、计算方式、最佳实践及与现代响应式单位的对比
order: 3
---

# em 和 rem 布局

`em` 和 `rem` 是相对单位，在响应式设计中非常重要。理解它们的区别和使用场景是前端开发的基础。

## 单位对比

### px（绝对单位）

```css
.text {
  font-size: 16px; /* 固定值，不受其他因素影响 */
}
```

**特点**：
- 绝对单位，固定大小
- 不受父元素影响
- 不利于响应式设计

### em（相对单位）

`em` 相对于**当前元素**的 `font-size`。

```css
.parent {
  font-size: 16px;
}

.child {
  font-size: 1.5em; /* 16px × 1.5 = 24px */
  padding: 1em; /* 24px × 1 = 24px（相对于当前 font-size） */
  margin: 0.5em; /* 24px × 0.5 = 12px */
}
```

**关键点**：
- 如果元素没有设置 `font-size`，继承父元素的
- `em` 用于非 `font-size` 属性时，相对于**当前元素**的 `font-size`
- `em` 用于 `font-size` 属性时，相对于**父元素**的 `font-size`

### rem（相对单位）

`rem` 相对于**根元素（html）**的 `font-size`。

```css
html {
  font-size: 16px; /* 根字体大小 */
}

.text {
  font-size: 1.5rem; /* 16px × 1.5 = 24px */
  padding: 1rem; /* 16px × 1 = 16px（相对于根元素） */
  margin: 0.5rem; /* 16px × 0.5 = 8px */
}
```

**关键点**：
- 始终相对于根元素（html）的 `font-size`
- 不受父元素影响
- 更可预测，适合全局布局

## em 的嵌套问题

`em` 会累积，导致嵌套时计算复杂。

```css
.parent {
  font-size: 16px;
}

.child {
  font-size: 1.5em; /* 16px × 1.5 = 24px */
}

.grandchild {
  font-size: 1.5em; /* 24px × 1.5 = 36px（累积） */
}
```

**解决方案**：使用 `rem` 避免累积。

```css
.parent {
  font-size: 16px;
}

.child {
  font-size: 1.5rem; /* 16px × 1.5 = 24px */
}

.grandchild {
  font-size: 1.5rem; /* 16px × 1.5 = 24px（不累积） */
}
```

## 使用场景

### 使用 em 的场景

**1. 组件内部相对尺寸**

```css
.button {
  font-size: 16px;
  padding: 0.75em 1.5em; /* 相对于按钮字体大小 */
  border-radius: 0.25em; /* 相对于按钮字体大小 */
}

/* 按钮大小变化时，padding 和 border-radius 自动调整 */
.button-large {
  font-size: 20px; /* padding 和 border-radius 自动放大 */
}
```

**2. 文本相关的间距**

```css
.heading {
  font-size: 2em; /* 相对于父元素 */
  margin-bottom: 0.5em; /* 相对于当前 font-size，保持比例 */
}
```

**3. 媒体查询中的响应式字体**

```css
@media (max-width: 768px) {
  .container {
    font-size: 0.875em; /* 相对于父元素缩小 */
  }
}
```

### 使用 rem 的场景

**1. 全局布局和间距**

```css
.container {
  max-width: 75rem; /* 1200px（假设根字体 16px） */
  padding: 2rem; /* 32px */
  margin: 0 auto;
}

.card {
  margin-bottom: 1.5rem; /* 24px，全局统一 */
}
```

**2. 字体大小**

```css
h1 { font-size: 2.5rem; } /* 40px */
h2 { font-size: 2rem; }   /* 32px */
h3 { font-size: 1.5rem; } /* 24px */
p  { font-size: 1rem; }   /* 16px */
```

**3. 响应式根字体大小**

```css
html {
  font-size: 16px; /* 默认 */
}

@media (min-width: 768px) {
  html {
    font-size: 18px; /* 大屏幕增大 */
  }
}

@media (min-width: 1200px) {
  html {
    font-size: 20px; /* 超大屏幕 */
  }
}

/* 所有使用 rem 的元素自动响应 */
```

## 最佳实践

### 1. 设置合理的根字体大小

```css
/* 方法1：固定值（推荐） */
html {
  font-size: 16px; /* 浏览器默认，清晰明确 */
}

/* 方法2：百分比（相对于浏览器默认） */
html {
  font-size: 100%; /* 16px（如果浏览器默认是 16px） */
}

/* 方法3：响应式根字体 */
html {
  font-size: clamp(14px, 1vw + 0.5rem, 18px);
}
```

### 2. 混合使用 em 和 rem

```css
/* 全局布局用 rem */
.container {
  max-width: 75rem;
  padding: 2rem;
}

/* 组件内部用 em */
.button {
  font-size: 1rem; /* 基准 */
  padding: 0.75em 1.5em; /* 相对于按钮字体 */
  border-radius: 0.25em;
}

/* 文本相关用 em */
.heading {
  font-size: 2rem; /* 相对于根 */
  line-height: 1.2em; /* 相对于当前字体 */
  margin-bottom: 0.5em; /* 相对于当前字体 */
}
```

### 3. 使用 CSS 变量增强可维护性

```css
:root {
  --font-size-base: 16px;
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-md: 1rem;       /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
}

.card {
  padding: var(--spacing-md);
  font-size: var(--font-size-md);
}
```

## 响应式设计中的应用

### 移动优先策略

```css
/* 基础样式（移动端） */
html {
  font-size: 14px;
}

.container {
  padding: 1rem; /* 14px */
}

/* 平板 */
@media (min-width: 768px) {
  html {
    font-size: 16px;
  }
  
  .container {
    padding: 1.5rem; /* 24px */
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  html {
    font-size: 18px;
  }
  
  .container {
    padding: 2rem; /* 36px */
  }
}
```

### 使用 clamp() 实现流体字体

```css
/* 结合 rem 和 clamp */
.heading {
  font-size: clamp(1.5rem, 4vw + 1rem, 3rem);
  /* 最小 1.5rem，理想值根据视口，最大 3rem */
}
```

## 常见问题和解决方案

### 问题1：em 累积导致字体过大

```css
/* ❌ 问题 */
.menu {
  font-size: 1.2em;
}

.menu-item {
  font-size: 1.2em; /* 累积：1.2 × 1.2 = 1.44 */
}

.menu-item-link {
  font-size: 1.2em; /* 累积：1.2 × 1.2 × 1.2 = 1.728 */
}

/* ✅ 解决：使用 rem */
.menu {
  font-size: 1.2rem;
}

.menu-item {
  font-size: 1.2rem; /* 不累积 */
}

.menu-item-link {
  font-size: 1.2rem; /* 不累积 */
}
```

### 问题2：用户修改浏览器字体大小

```css
/* 使用 rem 可以响应用户设置 */
html {
  font-size: 100%; /* 尊重用户设置 */
}

.text {
  font-size: 1rem; /* 随用户设置变化 */
}

/* 如果使用 px，不会响应用户设置 */
.text-fixed {
  font-size: 16px; /* 固定，不响应 */
}
```

### 问题3：计算复杂

```css
/* ❌ 难以计算 */
.container {
  font-size: 18px;
  padding: 1.333em; /* 是多少？18 × 1.333 = 24px */
}

/* ✅ 使用 rem 更直观 */
.container {
  font-size: 18px;
  padding: 1.5rem; /* 24px（假设根字体 16px） */
}
```

## 与现代单位的对比

### rem vs vw/vh

```css
/* rem：相对于根字体，可预测 */
.container {
  width: 50rem; /* 800px（根字体 16px） */
}

/* vw：相对于视口，可能过大或过小 */
.container {
  width: 50vw; /* 视口宽度的一半 */
}
```

### rem vs clamp()

```css
/* rem：固定比例 */
.heading {
  font-size: 2rem; /* 32px */
}

/* clamp()：流体响应 */
.heading {
  font-size: clamp(1.5rem, 4vw + 1rem, 3rem);
  /* 更灵活，但 rem 更简单 */
}
```

## 最佳实践总结

1. **根字体用 px 或 %**：设置明确的基准值
2. **全局布局用 rem**：可预测，不累积
3. **组件内部用 em**：保持相对比例
4. **文本相关用 em**：保持行高、间距比例
5. **混合使用**：根据场景选择
6. **使用 CSS 变量**：提高可维护性
7. **响应式根字体**：适配不同屏幕

## 单位选择指南

| 场景 | 推荐单位 | 原因 |
|-----|---------|------|
| 根字体大小 | px / % | 明确基准 |
| 全局布局 | rem | 可预测，统一 |
| 组件内部 | em | 保持比例 |
| 字体大小 | rem | 统一管理 |
| 间距 | rem | 全局一致 |
| 边框、圆角 | em | 相对字体 |
| 响应式字体 | clamp() | 更灵活 |

## 总结

- **em**：相对于当前元素字体，适合组件内部
- **rem**：相对于根元素字体，适合全局布局
- **em 会累积**：嵌套时注意
- **rem 更可预测**：推荐用于布局
- **混合使用**：根据场景选择
- **响应式根字体**：实现整体缩放

