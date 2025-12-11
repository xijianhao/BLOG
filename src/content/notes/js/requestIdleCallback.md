---
title: RequestIdleCallback
notebook: js
date: 2024-08-22
tags: ['基础', '性能优化', '浏览器']
excerpt: 浏览器提供的在空闲时间执行低优先级任务的API，用于性能优化和任务调度
order: 10
---

# RequestIdleCallback 核心要点

## 1. 什么是 requestIdleCallback

`requestIdleCallback` 是浏览器提供的 API，用于在**浏览器空闲时间**执行低优先级的任务，避免阻塞关键渲染任务，从而提升页面性能和用户体验。

### 核心概念

- **空闲时间（Idle Time）**：浏览器完成当前帧的所有工作后，到下一帧开始之前的时间
- **低优先级任务**：不紧急、可以延后执行的任务（如数据预加载、日志上报、埋点统计等）
- **时间切片**：将大任务拆分成小任务，在空闲时间分批执行

## 2. 基本语法

```javascript
const handleIdleCallback = (deadline) => {
  // deadline.timeRemaining() 返回当前帧剩余时间（毫秒）
  // deadline.didTimeout 表示是否超时
  
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    // 执行任务
    doWork();
  }
  
  // 如果还有任务，继续调度
  if (tasks.length > 0) {
    requestIdleCallback(handleIdleCallback);
  }
};

const idleCallbackId = requestIdleCallback(handleIdleCallback, {
  timeout: 1000  // 可选：超时时间（毫秒）
});

// 取消回调
cancelIdleCallback(idleCallbackId);
```

### 参数说明

1. **callback**：回调函数，接收 `IdleDeadline` 对象
   - `deadline.timeRemaining()`：返回当前帧剩余可用时间（毫秒），通常 ≤ 5ms
   - `deadline.didTimeout`：布尔值，表示是否因为超时而触发回调

2. **options**（可选）：
   - `timeout`：超时时间（毫秒），如果指定时间内没有空闲时间，会强制执行回调

### 返回值

返回一个 ID（数字），可用于 `cancelIdleCallback()` 取消回调。

## 3. 浏览器渲染流程中的位置

```
[ Frame Start ]
     ↓
1. 处理用户输入（Input Events）
     ↓
2. 执行 requestAnimationFrame 回调（rAF）
     ↓
3. 样式计算（Style）
     ↓
4. 布局（Layout）
     ↓
5. 绘制（Paint）
     ↓
6. 合成（Composite）
     ↓
[ 空闲时间 ← requestIdleCallback 在这里执行 ]
     ↓
[ Frame End → 显示到屏幕 ]
```

**关键点**：
- `requestIdleCallback` 在**每一帧渲染完成后**执行
- 如果当前帧没有空闲时间，会推迟到下一帧
- 如果设置了 `timeout`，超时后会强制执行（即使不在空闲时间）

## 4. 使用场景

### 4.1 数据预加载

```javascript
function prefetchData() {
  requestIdleCallback((deadline) => {
    while (deadline.timeRemaining() > 0 && prefetchQueue.length > 0) {
      const url = prefetchQueue.shift();
      fetch(url).then(data => {
        cache.set(url, data);
      });
    }
    
    if (prefetchQueue.length > 0) {
      requestIdleCallback(prefetchData);
    }
  });
}
```

### 4.2 日志上报和埋点

```javascript
function reportLogs() {
  requestIdleCallback((deadline) => {
    if (deadline.timeRemaining() > 0 && logs.length > 0) {
      const batch = logs.splice(0, 10); // 批量上报
      sendToServer(batch);
    }
    
    if (logs.length > 0) {
      requestIdleCallback(reportLogs);
    }
  }, { timeout: 2000 }); // 2秒内必须上报
}
```

### 4.3 长列表虚拟滚动

```javascript
function renderVisibleItems() {
  requestIdleCallback((deadline) => {
    while (deadline.timeRemaining() > 0 && itemsToRender.length > 0) {
      const item = itemsToRender.shift();
      renderItem(item);
    }
    
    if (itemsToRender.length > 0) {
      requestIdleCallback(renderVisibleItems);
    } else {
      // 渲染完成
      onRenderComplete();
    }
  });
}
```

### 4.4 非关键 DOM 更新

```javascript
function updateNonCriticalUI() {
  requestIdleCallback((deadline) => {
    // 更新不影响首屏的 UI 元素
    updateRecommendations();
    updateRelatedArticles();
    updateAdvertisements();
  });
}
```

## 5. 与 requestAnimationFrame 的区别

| 特性 | requestAnimationFrame | requestIdleCallback |
|------|----------------------|---------------------|
| **执行时机** | 每一帧**开始前**执行 | 每一帧**结束后**的空闲时间执行 |
| **优先级** | 高优先级（动画、交互） | 低优先级（后台任务） |
| **用途** | 动画、视觉更新 | 数据预加载、日志上报、非关键任务 |
| **执行频率** | 每帧都执行（60fps = 16.67ms） | 只在有空闲时间时执行 |
| **剩余时间** | 无 | 有（`deadline.timeRemaining()`） |
| **超时机制** | 无 | 支持 `timeout` 选项 |

### 配合使用示例

```javascript
// 高优先级：动画更新
function animate() {
  updateAnimation();
  requestAnimationFrame(animate);
}

// 低优先级：后台任务
function doBackgroundWork() {
  requestIdleCallback((deadline) => {
    while (deadline.timeRemaining() > 0) {
      processBackgroundTask();
    }
    requestIdleCallback(doBackgroundWork);
  });
}

// 启动
requestAnimationFrame(animate);
requestIdleCallback(doBackgroundWork);
```

## 6. 注意事项和最佳实践

### 6.1 不要执行耗时操作

```javascript
// ❌ 错误：执行耗时操作
requestIdleCallback(() => {
  heavyComputation(); // 可能阻塞渲染
});

// ✅ 正确：拆分任务
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    const task = tasks.shift();
    task(); // 执行小任务
  }
});
```

### 6.2 不要操作 DOM（除非必要）

```javascript
// ⚠️ 谨慎：DOM 操作可能触发重排/重绘
requestIdleCallback((deadline) => {
  if (deadline.timeRemaining() > 0) {
    // 只更新不影响布局的属性
    element.style.opacity = '0.5';
  }
});
```

### 6.3 使用 timeout 确保关键任务执行

```javascript
// 重要但非紧急的任务，设置超时确保执行
requestIdleCallback(reportAnalytics, { timeout: 2000 });
```

### 6.4 及时取消回调

```javascript
let idleCallbackId;

function startWork() {
  idleCallbackId = requestIdleCallback(doWork);
}

function stopWork() {
  if (idleCallbackId) {
    cancelIdleCallback(idleCallbackId);
    idleCallbackId = null;
  }
}
```

### 6.5 检查浏览器支持

```javascript
if ('requestIdleCallback' in window) {
  requestIdleCallback(doWork);
} else {
  // Polyfill 或降级方案
  setTimeout(doWork, 1);
}
```

## 7. Polyfill 实现

由于 `requestIdleCallback` 兼容性有限，可以使用 `setTimeout` 实现降级：

```javascript
window.requestIdleCallback = window.requestIdleCallback || function(callback, options) {
  const timeout = options?.timeout || 0;
  const start = performance.now();
  
  return setTimeout(() => {
    const deadline = {
      timeRemaining: () => Math.max(0, 50 - (performance.now() - start)),
      didTimeout: timeout > 0 && (performance.now() - start) >= timeout
    };
    callback(deadline);
  }, 1);
};

window.cancelIdleCallback = window.cancelIdleCallback || function(id) {
  clearTimeout(id);
};
```

## 8. React 中的应用

React 16+ 的 **Fiber 架构**使用了类似 `requestIdleCallback` 的机制：

```javascript
// React 内部实现（简化版）
function workLoop(deadline) {
  while (deadline.timeRemaining() > 0 && workInProgress !== null) {
    workInProgress = performUnitOfWork(workInProgress);
  }
  
  if (workInProgress !== null) {
    scheduleCallback(workLoop);
  }
}
```

**React 的优势**：
- 自定义调度器，不依赖浏览器 API
- 更好的优先级控制（Immediate、UserBlocking、Normal、Low、Idle）
- 支持任务中断和恢复

## 9. 常见面试题

### Q1: requestIdleCallback 是什么？有什么作用？

**答案**：
- 浏览器提供的 API，用于在空闲时间执行低优先级任务
- 避免阻塞关键渲染任务，提升页面性能
- 适合执行数据预加载、日志上报、非关键 UI 更新等任务

### Q2: requestIdleCallback 和 requestAnimationFrame 的区别？

**答案**：
- **执行时机**：rAF 在帧开始前，rIC 在帧结束后的空闲时间
- **优先级**：rAF 高优先级（动画），rIC 低优先级（后台任务）
- **用途**：rAF 用于动画，rIC 用于非关键任务
- **剩余时间**：rIC 提供 `timeRemaining()` 检查剩余时间

### Q3: 什么时候会执行 requestIdleCallback？

**答案**：
- 在每一帧渲染完成后，如果还有空闲时间
- 如果设置了 `timeout`，超时后会强制执行（即使不在空闲时间）
- 如果当前帧没有空闲时间，会推迟到下一帧

### Q4: deadline.timeRemaining() 返回什么？通常是多少？

**答案**：
- 返回当前帧剩余可用时间（毫秒）
- 通常 ≤ 5ms（一帧约 16.67ms，减去渲染时间后剩余）
- 用于判断是否还有时间执行任务

### Q5: 在 requestIdleCallback 中应该做什么？不应该做什么？

**答案**：
- **应该做**：轻量级任务、数据预加载、日志上报、非关键计算
- **不应该做**：耗时操作、大量 DOM 操作、影响布局的操作
- **原则**：任务要短小，可拆分，不阻塞渲染

### Q6: 如何确保重要任务一定会执行？

**答案**：
- 使用 `timeout` 选项设置超时时间
- 超时后即使不在空闲时间也会执行
- 或者使用 `requestAnimationFrame` 或 `setTimeout` 执行高优先级任务

### Q7: React Fiber 和 requestIdleCallback 的关系？

**答案**：
- React Fiber 借鉴了 `requestIdleCallback` 的思想
- 但 React 实现了自定义调度器，不直接使用浏览器 API
- 提供了更细粒度的优先级控制和任务中断/恢复能力

## 10. 实际应用示例

### 示例 1：图片懒加载优化

```javascript
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  function loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
  }
  
  function processImages(deadline) {
    while (deadline.timeRemaining() > 0 && images.length > 0) {
      const img = images[0];
      if (isInViewport(img)) {
        loadImage(img);
        images.splice(0, 1);
      } else {
        images.splice(0, 1);
      }
    }
    
    if (images.length > 0) {
      requestIdleCallback(processImages);
    }
  }
  
  requestIdleCallback(processImages);
}
```

### 示例 2：批量处理数据

```javascript
function processLargeDataset(data) {
  const chunks = chunkArray(data, 100); // 每批处理 100 条
  let currentIndex = 0;
  
  function processChunk(deadline) {
    while (deadline.timeRemaining() > 0 && currentIndex < chunks.length) {
      const chunk = chunks[currentIndex];
      processChunkData(chunk);
      currentIndex++;
    }
    
    if (currentIndex < chunks.length) {
      requestIdleCallback(processChunk);
    } else {
      onComplete();
    }
  }
  
  requestIdleCallback(processChunk);
}
```

## 11. 浏览器兼容性

| 浏览器 | 支持版本 |
|--------|---------|
| Chrome | 47+ |
| Firefox | 55+ |
| Safari | ❌ 不支持 |
| Edge | 79+ |

**注意**：Safari 不支持，需要使用 Polyfill 或降级方案。

## 12. 总结

### 核心要点

1. **执行时机**：在每一帧渲染完成后的空闲时间
2. **适用场景**：低优先级、可延后的任务
3. **时间控制**：通过 `deadline.timeRemaining()` 检查剩余时间
4. **超时机制**：使用 `timeout` 确保重要任务执行
5. **任务拆分**：将大任务拆分成小任务分批执行

### 使用原则

- ✅ 任务要短小、可拆分
- ✅ 不阻塞关键渲染流程
- ✅ 及时取消不需要的回调
- ✅ 检查浏览器支持，提供降级方案
- ❌ 不要执行耗时操作
- ❌ 不要大量操作 DOM

### 面试重点

- ✅ 理解空闲时间的概念
- ✅ 掌握与 requestAnimationFrame 的区别
- ✅ 知道适用场景和注意事项
- ✅ 了解 React Fiber 的关系
- ✅ 能够实现简单的 Polyfill

---

**参考资源**：
- [MDN - requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)
- [W3C - RequestIdleCallback](https://w3c.github.io/requestidlecallback/)