---
title: 自适应布局方案
notebook: css
date: 2024-01-10
tags: ['布局', '响应式', '现代CSS']
excerpt: 最新的现代自适应布局解决方案，包括 Container Queries、CSS Grid、Flexbox 等
order: 0
---

# 自适应布局方案

现代前端开发中的自适应布局解决方案，涵盖最新的 CSS 特性和最佳实践。

## 1. Container Queries（容器查询）

容器查询是 CSS 的新特性，允许根据容器的尺寸而非视口尺寸来应用样式，这是响应式设计的重大突破。

### 基本用法

```css
/* 定义容器上下文 */
.card-container {
  container-type: inline-size;
  container-name: card;
}

/* 根据容器宽度应用样式 */
@container card (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}

/* 简写形式 */
.card-container {
  container: card / inline-size;
}
```

### 容器查询单位

```css
/* cqw: 容器查询宽度单位（1% 的容器宽度） */
.card {
  padding: 2cqw;
}

/* cqh: 容器查询高度单位 */
.sidebar {
  height: 50cqh;
}

/* cqi: 容器查询内联尺寸单位 */
.text {
  font-size: clamp(1rem, 2cqi, 1.5rem);
}

/* cqb: 容器查询块尺寸单位 */
.box {
  margin: 1cqb;
}

/* cqmin/cqmax: 取较小/较大的值 */
.element {
  size: cqmin(10cqw, 5cqh);
}
```

### 浏览器支持

- Chrome 105+
- Firefox 110+
- Safari 16.0+
- 需要 `@container` polyfill 支持旧浏览器

## 2. CSS Grid 现代布局

CSS Grid 是最强大的二维布局系统，适合复杂的自适应布局。

### 响应式网格

```css
/* 自动填充，最小 250px，最大 1fr */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* 自动适应，更智能的分配 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
```

### 命名网格线

```css
.layout {
  display: grid;
  grid-template-columns: 
    [sidebar-start] 250px 
    [sidebar-end main-start] 1fr 
    [main-end];
  grid-template-rows: 
    [header-start] auto 
    [header-end content-start] 1fr 
    [content-end footer-start] auto 
    [footer-end];
}

.header {
  grid-column: main;
  grid-row: header;
}
```

### Subgrid（子网格）

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
  grid-template-columns: subgrid;
  /* 子网格自动继承父网格的列定义 */
}
```

**浏览器支持**：Firefox 71+, Safari 16.0+, Chrome 117+

## 3. Flexbox 灵活布局

Flexbox 适合一维布局，是现代 UI 组件的基础。

### 响应式 Flexbox

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.item {
  flex: 1 1 300px; /* 基础 300px，可伸缩 */
  min-width: 0; /* 防止内容溢出 */
}
```

### 现代 Flexbox 技巧

```css
/* 自动间距（gap 属性） */
.flex-container {
  display: flex;
  gap: 1rem; /* 替代 margin 的更好方案 */
}

/* 内容对齐 */
.flex-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 响应式换行 */
.flex-container {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
}
```

## 4. 现代响应式单位

### clamp() - 流体尺寸

```css
/* 语法：clamp(最小值, 理想值, 最大值) */
.heading {
  font-size: clamp(1.5rem, 4vw + 1rem, 3rem);
}

.container {
  width: clamp(300px, 90vw, 1200px);
  padding: clamp(1rem, 5vw, 3rem);
}
```

### min() 和 max()

```css
/* 取较小值 */
.sidebar {
  width: min(300px, 100%);
}

/* 取较大值 */
.content {
  padding: max(1rem, env(safe-area-inset-top));
}

/* 组合使用 */
.card {
  width: min(100%, max(300px, 50vw));
}
```

### 视口单位 vw/vh/vmin/vmax

```css
/* 现代视口单位（考虑浏览器 UI） */
.fullscreen {
  width: 100dvw; /* 动态视口宽度 */
  height: 100dvh; /* 动态视口高度 */
}

/* 小视口单位（移动端） */
.mobile {
  width: 100svw;
  height: 100svh;
}

/* 大视口单位（桌面端） */
.desktop {
  width: 100lvw;
  height: 100lvh;
}
```

## 5. 逻辑属性（Logical Properties）

逻辑属性使布局与文本方向无关，支持 RTL 和多语言。

```css
/* 传统属性 → 逻辑属性 */
margin-top → margin-block-start
margin-bottom → margin-block-end
margin-left → margin-inline-start
margin-right → margin-inline-end

width → inline-size
height → block-size

border-left → border-inline-start
border-right → border-inline-end

/* 使用示例 */
.card {
  padding-block: 1rem; /* 上下 */
  padding-inline: 1.5rem; /* 左右 */
  margin-inline: auto; /* 左右居中 */
  border-inline-start: 2px solid blue;
}
```

## 6. 媒体查询增强

### 范围语法（Range Syntax）

```css
/* 旧语法 */
@media (min-width: 768px) and (max-width: 1024px) {
  /* ... */
}

/* 新范围语法 */
@media (768px <= width <= 1024px) {
  /* ... */
}

@media (width >= 768px) {
  /* ... */
}

@media (height <= 600px) {
  /* ... */
}
```

### 容器查询 vs 媒体查询

```css
/* 媒体查询：基于视口 */
@media (min-width: 768px) {
  .card {
    grid-template-columns: 1fr 2fr;
  }
}

/* 容器查询：基于容器 */
@container (min-width: 400px) {
  .card {
    grid-template-columns: 1fr 2fr;
  }
}
```

## 7. 现代布局模式

### 12 列网格系统（Grid）

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

/* 响应式 */
@media (max-width: 768px) {
  .col-md-12 { grid-column: span 12; }
}
```

### 圣杯布局（Holy Grail Layout）

```css
.holy-grail {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .holy-grail {
    grid-template-areas:
      "header"
      "nav"
      "main"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

### 卡片网格布局

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 1.5rem;
  container-type: inline-size;
}

@container (min-width: 600px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}
```

## 8. 实用工具类

### 响应式间距

```css
:root {
  --space-xs: clamp(0.5rem, 2vw, 1rem);
  --space-sm: clamp(1rem, 3vw, 1.5rem);
  --space-md: clamp(1.5rem, 4vw, 2rem);
  --space-lg: clamp(2rem, 5vw, 3rem);
  --space-xl: clamp(3rem, 6vw, 4rem);
}
```

### 响应式字体

```css
:root {
  --font-size-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --font-size-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --font-size-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --font-size-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
  --font-size-3xl: clamp(2rem, 1.6rem + 2vw, 3rem);
}
```

## 9. 性能优化

### 使用 `content-visibility`

```css
.long-list {
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
```

### 使用 `will-change` 谨慎

```css
/* 只在需要时使用 */
.animated-element {
  will-change: transform;
}

/* 动画结束后移除 */
.animated-element.animation-complete {
  will-change: auto;
}
```

## 10. 最佳实践总结

1. **优先使用 Container Queries**：组件级别的响应式设计
2. **Grid + Flexbox 组合**：Grid 用于整体布局，Flexbox 用于组件内部
3. **使用 clamp() 实现流体设计**：减少媒体查询的使用
4. **采用逻辑属性**：提高国际化支持
5. **利用现代视口单位**：`dvw`/`dvh` 替代 `vw`/`vh`
6. **性能优化**：合理使用 `content-visibility` 和 `contain`

## 浏览器兼容性检查

- [Can I Use - Container Queries](https://caniuse.com/css-container-queries)
- [Can I Use - CSS Grid](https://caniuse.com/css-grid)
- [Can I Use - Subgrid](https://caniuse.com/css-subgrid)
- [Can I Use - Logical Properties](https://caniuse.com/css-logical-props)

## 参考资料

- [MDN - CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [CSS-Tricks - A Complete Guide to CSS Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Modern CSS Solutions](https://moderncss.dev/)

