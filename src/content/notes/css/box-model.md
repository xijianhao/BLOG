---
title: 盒模型
notebook: css
date: 2023-06-15
tags: ['基础', '盒模型', '布局']
excerpt: CSS 盒模型的深入理解，包括标准盒模型、IE 盒模型、box-sizing 的使用和最佳实践
order: 1
---

# 盒模型（Box Model）

盒模型是 CSS 布局的基础，理解盒模型对于掌握 CSS 至关重要。

## 盒模型的组成

CSS 盒模型由四个部分组成，从内到外：

1. **Content（内容区）**：元素的实际内容
2. **Padding（内边距）**：内容与边框之间的空间
3. **Border（边框）**：围绕内边距的线条
4. **Margin（外边距）**：元素与其他元素之间的空间

```
┌─────────────────────────────────┐ ← Margin（外边距）
│  ┌───────────────────────────┐ │
│  │ ┌─────────────────────────┐│ │ ← Border（边框）
│  │ │ ┌─────────────────────┐││ │
│  │ │ │  Padding（内边距）  │││ │
│  │ │ │  ┌───────────────┐  │││ │
│  │ │ │  │   Content    │  │││ │
│  │ │ │  │  （内容区）   │  │││ │
│  │ │ │  └───────────────┘  │││ │
│  │ │ └─────────────────────┘││ │
│  │ └─────────────────────────┘│ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

## 两种盒模型

### 1. 标准盒模型（content-box）

**默认值**，元素的宽度和高度只包括内容区。

```css
.box {
  box-sizing: content-box; /* 默认值 */
  width: 200px;
  padding: 20px;
  border: 5px solid black;
  /* 实际占用宽度 = 200 + 20*2 + 5*2 = 250px */
}
```

**计算公式**：
- 总宽度 = width + padding-left + padding-right + border-left + border-right
- 总高度 = height + padding-top + padding-bottom + border-top + border-bottom

### 2. IE 盒模型（border-box）

元素的宽度和高度包括内容、内边距和边框。

```css
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid black;
  /* 实际占用宽度 = 200px（内容区自动缩小） */
}
```

**计算公式**：
- 总宽度 = width（已包含 padding 和 border）
- 总高度 = height（已包含 padding 和 border）

## box-sizing 的使用

### 全局设置（推荐）

```css
/* 现代最佳实践：全局使用 border-box */
*, *::before, *::after {
  box-sizing: border-box;
}
```

**优势**：
- 更直观：设置 `width: 100%` 就是 100%，不会溢出
- 更易维护：不需要计算 padding 和 border
- 更符合直觉：与设计工具（Figma、Sketch）一致

### 特定元素使用 content-box

```css
/* 某些情况下需要 content-box */
.code-block {
  box-sizing: content-box;
  width: 100%;
  /* 需要精确控制内容宽度时 */
}
```

## Margin 的特殊行为

### Margin 折叠（Collapsing）

相邻元素的垂直 margin 会折叠（取较大值）。

```css
.box1 {
  margin-bottom: 20px;
}

.box2 {
  margin-top: 30px;
}

/* 实际间距 = max(20px, 30px) = 30px */
```

**折叠规则**：
- 只发生在**垂直方向**（block 方向）
- 只发生在**相邻元素**之间
- 父子元素的 margin 也会折叠（如果父元素没有 border/padding）

**避免折叠的方法**：
```css
/* 方法1：使用 padding 替代 */
.container {
  padding-top: 20px; /* 替代 margin */
}

/* 方法2：使用 border */
.container {
  border-top: 1px solid transparent;
}

/* 方法3：使用 flex/grid */
.container {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 替代 margin */
}
```

### 负 Margin

负 margin 可以创建重叠效果。

```css
.overlap {
  margin-top: -20px; /* 向上移动，与上方元素重叠 */
}

/* 经典应用：圣杯布局 */
.main {
  margin-left: -200px; /* 与左侧栏重叠 */
}
```

## Padding vs Margin

### 何时使用 Padding

- 元素**内部**的空间调整
- 背景色/图片需要延伸到边缘
- 点击区域需要扩大

```css
.button {
  padding: 12px 24px; /* 按钮内部空间 */
  background: blue; /* 背景延伸到 padding */
}
```

### 何时使用 Margin

- 元素**之间**的间距
- 元素与父容器的间距
- 不需要背景色延伸

```css
.card {
  margin-bottom: 20px; /* 卡片之间的间距 */
}
```

## 盒模型的调试

### 浏览器 DevTools

1. 选中元素，查看 Computed 面板
2. 查看盒模型可视化图
3. 检查每个属性的计算值

### 常见问题

**问题1：元素溢出父容器**

```css
/* 错误 */
.container {
  width: 100%;
  padding: 20px; /* 导致溢出 */
}

/* 解决 */
.container {
  width: 100%;
  padding: 20px;
  box-sizing: border-box; /* 关键 */
}
```

**问题2：inline 元素的 margin/padding**

```css
/* inline 元素只支持水平方向的 margin/padding */
span {
  margin-top: 20px; /* 无效 */
  margin-left: 20px; /* 有效 */
  padding-top: 20px; /* 无效（视觉上） */
  padding-left: 20px; /* 有效 */
}

/* 使用 inline-block */
span {
  display: inline-block;
  margin-top: 20px; /* 现在有效 */
}
```

## 现代布局中的盒模型

### Flexbox 中的盒模型

```css
.flex-container {
  display: flex;
  gap: 20px; /* 替代 margin，避免折叠 */
}

.flex-item {
  flex: 1;
  /* width 在 flex 中表现不同 */
  /* 实际宽度 = flex-basis + padding + border */
}
```

### Grid 中的盒模型

```css
.grid-container {
  display: grid;
  gap: 20px; /* 替代 margin */
}

.grid-item {
  /* width/height 在 grid 中更直观 */
  /* 使用 border-box 更符合预期 */
}
```

## 最佳实践

1. **全局设置 border-box**：让布局更直观
2. **使用 gap 替代 margin**：在 flex/grid 中避免折叠
3. **理解 margin 折叠**：避免意外的间距问题
4. **合理使用 padding 和 margin**：padding 用于内部，margin 用于外部
5. **调试时查看 Computed 值**：理解最终的计算结果

## 总结

- **标准盒模型**：width/height 只包括内容
- **IE 盒模型**：width/height 包括内容、padding、border
- **推荐使用 border-box**：更符合现代开发习惯
- **Margin 会折叠**：垂直方向相邻元素
- **合理选择 padding/margin**：根据使用场景

