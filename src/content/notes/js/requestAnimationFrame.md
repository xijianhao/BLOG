---
title: RAF（RequestAnimationFrame）
notebook: js
date: 2024-08-22
tags: ['基础']
excerpt: 浏览器提供的一种执行动画的API
order: 10
---

# 概念

`requestAnimationFrame` 是浏览器提供的一种用于执行动画的 API。它告诉浏览器你希望执行一个动画，并请求浏览器在下一次重绘之前调用指定的回调函数来更新动画帧。

``` javascript
window.requestAnimationFrame(callback);
```

- callback：将在下一次重绘前被调用的函数，接收一个 DOMHighResTimeStamp 参数（表示当前时间，单位为毫秒，精度高于 Date.now()）。

- 返回值是一个整数（requestId），可用于通过 cancelAnimationFrame(requestId) 取消该回调。

# 原理

## 与浏览器渲染机制绑定

现代浏览器的渲染流程大致如下：

- Javascript执行，其中也包括rAF回调
- 样式计算 style
- 布局 layout / reflow
- 绘制 paint
- 合成 composite

requestAnimationFrame 的回调会在JS执行阶段、在样式计算之前被调用，确保你在每一帧开始时就能修改 DOM 或 CSS 属性，从而让这些变更参与本帧的渲染流程。

## 自动匹配屏幕刷新率

- 如果是刷新率为60Hz，即每（1000/60）16.67ms刷新一次。
- raf会自动以接近这个频率调用回调
- 在高刷屏上，raf也相应提高调用频率。
- 在后端标签页或者不可见元素中，浏览器还会自动降低调用频率 甚至暂停。

# 每一帧的标准流水线
``` text 
[ Frame Start ]
     ↓
1. 处理用户输入（Input Events）
     ↓
2. 执行 requestAnimationFrame 回调（rAF）
     ↓
3. 执行 Resize / Scroll / IntersectionObserver 等微任务（部分在 rAF 前后）
     ↓
4. 样式计算（Style / Recalculate Style）
     ↓
5. 布局（Layout / Reflow）
     ↓
6. 更新图层树（Update Layer Tree）
     ↓
7. 绘制（Paint / Rasterization）
     ↓
8. 合成（Composite）
     ↓
[ Frame End → 显示到屏幕 ]
```

# 与setTimeout/setIntercal 的对比

| 特性 | setTimeout(fn, 16) | requestAnimationFrame |
|------|-------------------|----------------------|
| 帧同步 | ❌ 不与屏幕刷新同步，可能丢帧或重复渲染 | ✅ 与屏幕刷新严格同步 |
| 能效 | ❌ 即使页面不可见也会执行 | ✅ 页面不可见时自动暂停或降频 |
| 精度 | ❌ 定时器有最小延迟（通常 ≥4ms）且不精确 | ✅ 高精度时间戳 + 帧对齐 |
| 流畅度 | ❌ 容易出现卡顿、跳帧 | ✅ 更平滑、更高效 |

# 使用过程中需要注意哪些？

1. 频繁读写 DOM 导致强制同步布局
2. 并非完全保证60fps，如果js执行时间过长也会掉帧。可以结合performance.now 监控帧耗时。
3. 及时取消rAF，避免内存泄漏。
4. 非视觉任务、不关心渲染的逻辑不适用。