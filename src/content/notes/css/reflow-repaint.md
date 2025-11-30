---
title: 重排和重绘
notebook: css
date: 2024-03-25
tags: ['性能优化', '渲染', '浏览器']
excerpt: 深入理解浏览器渲染机制，重排（Reflow）和重绘（Repaint）的原理、触发条件及性能优化策略
order: 2
---

# 重排和重绘（Reflow & Repaint）

理解浏览器的渲染机制对于性能优化至关重要。重排和重绘是影响页面性能的两个关键因素。

## 浏览器渲染流程

浏览器渲染页面需要经过以下步骤：

```
1. 解析 HTML → DOM 树
2. 解析 CSS → CSSOM 树
3. 合并 DOM + CSSOM → 渲染树（Render Tree）
4. 布局（Layout/Reflow）→ 计算元素位置和大小
5. 绘制（Paint）→ 填充像素
6. 合成（Composite）→ 图层合成
```

## 重排（Reflow/Layout）

重排是指浏览器重新计算元素的几何属性（位置、大小），并重新布局。

### 触发重排的操作

**几何属性变化**：
```css
/* 这些属性会触发重排 */
width, height
padding, margin
border-width
top, left, right, bottom
position
display
```

**布局相关属性**：
```css
flex-direction
align-items, justify-content
grid-template-columns
gap
```

**获取布局信息**（强制同步重排）：
```javascript
// 这些操作会强制浏览器立即重排
element.offsetWidth
element.offsetHeight
element.clientWidth
element.clientHeight
element.scrollWidth
element.scrollHeight
element.getBoundingClientRect()
window.getComputedStyle(element)
```

### 重排的影响范围

重排是**级联**的，会影响：

1. **当前元素**：元素本身
2. **子元素**：所有子元素
3. **后续兄弟元素**：后面的兄弟元素
4. **父元素**：可能影响父元素

```html
<div class="parent">
  <div class="child1">Child 1</div>
  <div class="child2">Child 2</div> <!-- 也会受影响 -->
</div>
```

## 重绘（Repaint）

重绘是指浏览器重新绘制元素的外观，但不改变布局。

### 触发重绘的属性

**视觉属性**（不改变布局）：
```css
color
background-color
background-image
border-color
border-radius
box-shadow
outline
opacity
visibility
```

### 重绘 vs 重排

- **重排**：改变布局 → 必须重绘
- **重绘**：只改变外观 → 不需要重排

**性能影响**：重排 > 重绘

## 性能优化策略

### 1. 批量 DOM 操作

**❌ 错误做法**：
```javascript
// 每次操作都触发重排
element.style.width = '100px';
element.style.height = '100px';
element.style.padding = '10px';
// 触发 3 次重排
```

**✅ 正确做法**：
```javascript
// 方法1：使用 class
element.className = 'new-style';

// 方法2：使用 cssText
element.style.cssText = 'width: 100px; height: 100px; padding: 10px;';

// 方法3：使用 DocumentFragment
const fragment = document.createDocumentFragment();
fragment.appendChild(newElement);
container.appendChild(fragment);
```

### 2. 使用 transform 和 opacity

`transform` 和 `opacity` 只触发**合成（Composite）**，不触发重排和重绘。

```css
/* ❌ 触发重排 */
.element {
  left: 100px;
  top: 100px;
}

/* ✅ 只触发合成，性能更好 */
.element {
  transform: translate(100px, 100px);
}
```

**合成层属性**（只触发合成）：
- `transform`
- `opacity`
- `filter`
- `will-change`

### 3. 避免强制同步布局

**❌ 错误做法**（强制同步重排）：
```javascript
// 读取 → 写入 → 读取 → 写入
const width = element.offsetWidth; // 强制重排
element.style.width = width + 10 + 'px'; // 触发重排
const height = element.offsetHeight; // 再次强制重排
element.style.height = height + 10 + 'px'; // 触发重排
```

**✅ 正确做法**（批量操作）：
```javascript
// 先读取所有值
const width = element.offsetWidth;
const height = element.offsetHeight;

// 再批量写入
element.style.width = width + 10 + 'px';
element.style.height = height + 10 + 'px';
// 只触发一次重排
```

### 4. 使用虚拟滚动

对于长列表，使用虚拟滚动只渲染可见区域。

```javascript
// 使用 Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 加载内容
    }
  });
});
```

### 5. 使用 will-change 提示

提前告诉浏览器哪些属性会变化。

```css
.animated-element {
  will-change: transform;
  /* 浏览器会提前优化 */
}

/* 动画结束后移除 */
.animated-element.animation-complete {
  will-change: auto;
}
```

**注意**：不要过度使用 `will-change`，会消耗内存。

### 6. 使用 contain 属性

限制重排的影响范围。

```css
.widget {
  contain: layout style paint;
  /* 限制重排只影响当前元素 */
}
```

**contain 值**：
- `layout`：限制布局影响
- `style`：限制样式影响
- `paint`：限制绘制影响
- `size`：限制尺寸计算

### 7. 使用 content-visibility

跳过不可见内容的渲染。

```css
.long-list {
  content-visibility: auto;
  contain-intrinsic-size: 200px;
  /* 只渲染可见部分 */
}
```

## 性能监控

### Chrome DevTools

1. **Performance 面板**：
   - 录制页面性能
   - 查看重排和重绘的时间线
   - 分析性能瓶颈

2. **Rendering 面板**：
   - 开启 "Paint flashing"：高亮重绘区域
   - 开启 "Layout Shift Regions"：显示布局变化

### 代码监控

```javascript
// 监控重排
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'measure') {
      console.log('Layout time:', entry.duration);
    }
  }
});
observer.observe({ entryTypes: ['measure'] });

// 测量布局时间
performance.mark('layout-start');
// ... DOM 操作
performance.mark('layout-end');
performance.measure('layout', 'layout-start', 'layout-end');
```

## 常见性能问题

### 问题1：频繁读取布局属性

```javascript
// ❌ 每次循环都触发重排
for (let i = 0; i < items.length; i++) {
  items[i].style.left = items[i].offsetLeft + 10 + 'px';
}

// ✅ 批量读取和写入
const offsets = items.map(item => item.offsetLeft);
items.forEach((item, i) => {
  item.style.left = offsets[i] + 10 + 'px';
});
```

### 问题2：动画使用 left/top

```css
/* ❌ 触发重排 */
@keyframes move {
  from { left: 0; }
  to { left: 100px; }
}

/* ✅ 只触发合成 */
@keyframes move {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
```

### 问题3：隐藏元素时操作 DOM

```javascript
// ❌ 隐藏后操作，显示时触发大量重排
element.style.display = 'none';
// ... 大量 DOM 操作
element.style.display = 'block'; // 触发重排

// ✅ 使用 DocumentFragment
const fragment = document.createDocumentFragment();
// ... 操作 fragment
container.appendChild(fragment);
```

## 最佳实践总结

1. **批量 DOM 操作**：减少重排次数
2. **使用 transform/opacity**：只触发合成
3. **避免强制同步布局**：先读后写
4. **使用虚拟滚动**：长列表优化
5. **合理使用 will-change**：提前优化
6. **使用 contain**：限制影响范围
7. **监控性能**：使用 DevTools 分析

## 性能对比

| 操作类型 | 性能影响 | 触发阶段 |
|---------|---------|---------|
| 几何属性变化 | 高 | 重排 + 重绘 |
| 视觉属性变化 | 中 | 重绘 |
| transform/opacity | 低 | 合成 |
| will-change | 极低 | 预优化 |

## 总结

- **重排**：改变布局，性能开销大
- **重绘**：改变外观，性能开销中等
- **合成**：只改变图层，性能开销小
- **优化原则**：减少重排 → 减少重绘 → 使用合成

