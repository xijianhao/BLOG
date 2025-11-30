---
title: CSS 继承机制
notebook: css
date: 2023-08-20
tags: ['基础', '继承', '层叠']
excerpt: CSS 继承机制的深入理解，包括可继承属性、继承规则、层叠优先级及实际应用场景
order: 4
---

# CSS 继承机制

CSS 继承是样式传递的重要机制，理解继承规则对于编写可维护的 CSS 代码至关重要。

## 什么是继承

继承是指子元素自动获得父元素的某些 CSS 属性值。

```css
.parent {
  color: blue;
  font-size: 16px;
}

/* .child 自动继承 color 和 font-size */
.child {
  /* 不需要显式设置，已经继承了父元素的样式 */
}
```

## 可继承的属性

### 文本相关属性

```css
/* 这些属性会被继承 */
color
font-family
font-size
font-weight
font-style
font-variant
line-height
letter-spacing
word-spacing
text-align
text-indent
text-transform
text-decoration
text-shadow
white-space
```

### 列表相关属性

```css
list-style
list-style-type
list-style-position
list-style-image
```

### 表格相关属性

```css
border-collapse
border-spacing
caption-side
```

### 其他属性

```css
cursor
visibility
```

## 不可继承的属性

### 布局相关

```css
/* 这些属性不会被继承 */
width
height
margin
padding
border
display
position
top, left, right, bottom
float
clear
```

### 背景相关

```css
background
background-color
background-image
background-position
background-repeat
```

### 盒模型相关

```css
box-sizing
overflow
z-index
```

## 继承的优先级

继承的值优先级**最低**，会被其他规则覆盖。

```css
/* 优先级从高到低 */
.element {
  color: red;        /* 1. 直接设置（最高） */
}

.parent {
  color: blue;        /* 2. 继承的值（最低） */
}
```

## 强制继承

使用 `inherit` 关键字可以强制继承父元素的值。

```css
.button {
  border: inherit; /* 强制继承父元素的 border */
  background: inherit; /* 强制继承父元素的 background */
}

/* 即使 border 和 background 不可继承，也能通过 inherit 继承 */
```

### inherit 的使用场景

**1. 覆盖不可继承的属性**

```css
.card {
  border: 1px solid #ccc;
}

.card-highlight {
  border: inherit; /* 继承父元素的 border */
}
```

**2. 重置为父元素值**

```css
.link {
  color: blue;
}

.link:hover {
  color: red;
}

.link:active {
  color: inherit; /* 恢复为父元素的 color */
}
```

## 阻止继承

使用 `initial`、`unset`、`revert` 可以阻止继承。

### initial

设置为属性的**初始值**（浏览器默认值）。

```css
.text {
  color: initial; /* 恢复为浏览器默认（通常是 black） */
  font-size: initial; /* 恢复为浏览器默认（通常是 16px） */
}
```

### unset

如果是可继承属性，则继承；如果是不可继承属性，则恢复初始值。

```css
.text {
  color: unset; /* 继承父元素（因为 color 可继承） */
  width: unset; /* 恢复初始值 auto（因为 width 不可继承） */
}
```

### revert

恢复为**用户代理样式表**（浏览器默认样式）的值。

```css
.heading {
  font-size: revert; /* 恢复为浏览器的 h1-h6 默认字体大小 */
  font-weight: revert; /* 恢复为浏览器的默认字重 */
}
```

## 继承的实际应用

### 1. 全局字体设置

```css
/* 在 body 或 html 设置，所有元素继承 */
html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
}

/* 所有子元素自动继承，无需重复设置 */
```

### 2. 组件样式继承

```css
.card {
  font-family: 'Custom Font', sans-serif;
  color: #333;
}

/* 卡片内的所有文本自动继承 */
.card h2,
.card p,
.card span {
  /* 自动继承 font-family 和 color */
}
```

### 3. 主题切换

```css
/* 通过改变根元素颜色，所有元素自动更新 */
:root {
  --text-color: #333;
  --bg-color: #fff;
}

[data-theme="dark"] {
  --text-color: #fff;
  --bg-color: #333;
}

body {
  color: var(--text-color);
  background: var(--bg-color);
}

/* 所有元素自动继承新的颜色 */
```

## 继承的陷阱

### 问题1：意外的继承

```css
/* ❌ 问题：所有链接都变成红色 */
.parent {
  color: red;
}

.parent a {
  /* 继承了 color: red，但链接应该有自己的颜色 */
}

/* ✅ 解决：显式设置链接颜色 */
.parent {
  color: red;
}

.parent a {
  color: blue; /* 覆盖继承 */
}
```

### 问题2：font-size 继承导致字体过大

```css
/* ❌ 问题：嵌套时字体累积 */
.parent {
  font-size: 1.2em; /* 相对于父元素 */
}

.child {
  font-size: 1.2em; /* 相对于 .parent，累积放大 */
}

/* ✅ 解决：使用 rem 避免继承累积 */
.parent {
  font-size: 1.2rem; /* 相对于根元素 */
}

.child {
  font-size: 1.2rem; /* 相对于根元素，不累积 */
}
```

### 问题3：line-height 继承导致行高问题

```css
/* ❌ 问题：line-height 继承数值，子元素字体变化时比例不对 */
.parent {
  font-size: 16px;
  line-height: 24px; /* 固定值 */
}

.child {
  font-size: 32px; /* 字体变大，但 line-height 还是 24px，比例不对 */
}

/* ✅ 解决：使用无单位数值 */
.parent {
  font-size: 16px;
  line-height: 1.5; /* 无单位，相对于当前字体 */
}

.child {
  font-size: 32px; /* line-height 自动计算为 48px */
}
```

## 层叠和继承的关系

### CSS 层叠优先级

```
1. 重要性（!important）
2. 来源（作者样式 > 用户样式 > 浏览器默认）
3. 特异性（Specificity）
4. 顺序（后写的覆盖先写的）
5. 继承（最低优先级）
```

### 特异性计算

```css
/* 特异性：0,0,0,1 */
div { }

/* 特异性：0,0,1,0 */
.class { }

/* 特异性：0,1,0,0 */
#id { }

/* 特异性：1,0,0,0 */
style="..." { }

/* 继承的值：无特异性，最低优先级 */
```

## 最佳实践

### 1. 利用继承减少代码

```css
/* ❌ 重复设置 */
.card h1 { color: #333; }
.card h2 { color: #333; }
.card p { color: #333; }
.card span { color: #333; }

/* ✅ 利用继承 */
.card {
  color: #333; /* 所有子元素自动继承 */
}
```

### 2. 使用 CSS 变量增强继承

```css
:root {
  --primary-color: #007bff;
  --font-family: -apple-system, sans-serif;
}

/* 变量可以"继承"到所有元素 */
body {
  color: var(--primary-color);
  font-family: var(--font-family);
}
```

### 3. 合理使用 initial/unset/revert

```css
/* 重置按钮样式 */
.button {
  font: initial; /* 恢复浏览器默认字体 */
  border: initial;
  background: initial;
}

/* 或者使用 all: unset */
.button {
  all: unset; /* 重置所有属性 */
  /* 然后重新设置需要的样式 */
}
```

### 4. 注意不可继承属性的影响

```css
/* margin/padding 不会继承，需要显式设置 */
.card {
  margin-bottom: 1rem;
}

.card-item {
  /* margin-bottom 不会继承，需要单独设置 */
  margin-bottom: 0.5rem;
}
```

## 继承 vs 层叠

### 继承

- 从父元素传递到子元素
- 只适用于可继承属性
- 优先级最低

### 层叠

- 多个规则竞争同一个属性
- 适用于所有属性
- 通过特异性、顺序等决定

```css
/* 层叠：多个规则竞争 */
.parent .child { color: red; }  /* 特异性更高 */
.child { color: blue; }         /* 被覆盖 */

/* 继承：从父元素传递 */
.parent {
  color: green; /* 子元素继承 */
}
```

## 总结

- **可继承属性**：主要是文本、字体、列表相关
- **不可继承属性**：主要是布局、背景、盒模型相关
- **继承优先级最低**：会被直接设置的样式覆盖
- **inherit**：强制继承不可继承的属性
- **initial/unset/revert**：阻止继承，恢复默认值
- **利用继承**：减少重复代码，提高可维护性
- **注意陷阱**：避免意外的继承导致样式问题

