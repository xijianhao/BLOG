---
title: Web Worker
notebook: browser
date: 2025-09-04
tags: ['网络', 'JavaScript', '多线程']
excerpt: Web Worker 让 JavaScript 拥有多线程能力，可在后台执行耗时任务而不阻塞主线程
order: 10
---

# 什么是 Web Worker

Web Worker 是 HTML5 提供的一种浏览器 API，它允许在浏览器后台独立于主线程运行脚本。这意味着你可以执行耗时的计算任务，而不会阻塞用户界面的响应。

## 为什么需要 Web Worker

JavaScript 是**单线程**语言，所有任务都在一个线程上执行。当执行耗时任务时（如复杂计算、大数据处理），会导致：

- 页面卡顿、无响应
- 用户交互被阻塞
- 动画掉帧

Web Worker 的出现就是为了解决这个问题，让 JavaScript 具备**多线程**能力。

---

# 工作原理

```
┌─────────────────────────────────────────────────────────┐
│                      浏览器进程                          │
│  ┌─────────────────┐      ┌─────────────────┐          │
│  │    主线程        │      │   Worker 线程   │          │
│  │                 │      │                 │          │
│  │  - DOM 操作     │      │  - 独立运行环境  │          │
│  │  - UI 渲染      │◄────►│  - 无法访问 DOM  │          │
│  │  - 事件处理     │ 消息  │  - 执行耗时任务  │          │
│  │                 │ 通信  │                 │          │
│  └─────────────────┘      └─────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

### 核心特点

1. **独立线程**：Worker 在独立的线程中运行，与主线程并行执行
2. **隔离环境**：Worker 有自己的全局作用域（`self`），无法访问主线程的 `window`、`document` 等对象
3. **消息通信**：主线程与 Worker 通过 `postMessage` 和 `onmessage` 进行通信
4. **数据拷贝**：传递的数据会被**结构化克隆**（深拷贝），而非共享内存

---

# Web Worker 的类型

## 1. Dedicated Worker（专用 Worker）

最常用的类型，只能被创建它的脚本使用。

```javascript
// 创建 Worker
const worker = new Worker('worker.js');
```

## 2. Shared Worker（共享 Worker）

可以被多个脚本共享，适合多个页面/iframe 之间共享数据。

```javascript
const sharedWorker = new SharedWorker('shared-worker.js');
```

## 3. Service Worker

特殊类型的 Worker，主要用于：
- 离线缓存
- 网络请求拦截
- 推送通知

---

# 基础用法

## 主线程代码

```javascript
// main.js

// 1. 创建 Worker
const worker = new Worker('worker.js');

// 2. 向 Worker 发送消息
worker.postMessage({ type: 'calculate', data: [1, 2, 3, 4, 5] });

// 3. 接收 Worker 返回的消息
worker.onmessage = function(event) {
  console.log('收到 Worker 结果:', event.data);
};

// 4. 错误处理
worker.onerror = function(error) {
  console.error('Worker 错误:', error.message);
};

// 5. 终止 Worker
// worker.terminate();
```

## Worker 线程代码

```javascript
// worker.js

// 监听主线程消息
self.onmessage = function(event) {
  const { type, data } = event.data;

  if (type === 'calculate') {
    // 执行耗时计算
    const result = data.reduce((sum, num) => sum + num, 0);

    // 返回结果给主线程
    self.postMessage({ result });
  }
};

// Worker 内部也可以主动关闭自己
// self.close();
```

---

# 高级用法

## 1. 使用 Blob 创建内联 Worker

不需要单独的 Worker 文件：

```javascript
const workerCode = `
  self.onmessage = function(e) {
    const result = e.data * 2;
    self.postMessage(result);
  };
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));

worker.postMessage(10);
worker.onmessage = (e) => console.log(e.data); // 20
```

## 2. 使用 Transferable Objects 提高性能

对于大型数据（如 ArrayBuffer），可以使用**转移**而非拷贝：

```javascript
// 主线程
const buffer = new ArrayBuffer(1024 * 1024); // 1MB 数据

// 转移所有权（零拷贝），第二个参数是要转移的对象数组
worker.postMessage(buffer, [buffer]);

// 注意：转移后主线程无法再访问 buffer
console.log(buffer.byteLength); // 0
```

## 3. 在 Worker 中导入脚本

```javascript
// worker.js
importScripts('helper1.js', 'helper2.js');

// 或者在支持 ES Module 的环境中
// import { helper } from './helper.js';
```

## 4. ES Module Worker

```javascript
// 创建支持 ES Module 的 Worker
const worker = new Worker('worker.js', { type: 'module' });
```

```javascript
// worker.js (ES Module)
import { compute } from './utils.js';

self.onmessage = (e) => {
  const result = compute(e.data);
  self.postMessage(result);
};
```

---

# Worker 中可用的 API

Worker 线程中**可以使用**：

| API | 说明 |
|-----|------|
| `self` | Worker 全局对象 |
| `postMessage` / `onmessage` | 消息通信 |
| `setTimeout` / `setInterval` | 定时器 |
| `fetch` / `XMLHttpRequest` | 网络请求 |
| `IndexedDB` | 本地存储 |
| `WebSocket` | 实时通信 |
| `crypto` | 加密 API |
| `console` | 调试输出 |

Worker 线程中**不能使用**：

| API | 原因 |
|-----|------|
| `window` | 无浏览器窗口上下文 |
| `document` | 无法操作 DOM |
| `parent` | 无父级引用 |
| `alert()` / `confirm()` | 无 UI 交互能力 |
| `localStorage` | 同步 API，不适合 Worker |

---

# 实际应用场景

## 1. 大数据计算

```javascript
// 计算大量数据的统计值
worker.postMessage({
  type: 'statistics',
  data: hugeDataArray // 百万级数据
});
```

## 2. 图片/视频处理

```javascript
// 图片滤镜处理
const imageData = canvas.getContext('2d').getImageData(0, 0, w, h);
worker.postMessage({ imageData }, [imageData.data.buffer]);
```

## 3. 文件解析

```javascript
// 解析大型 Excel、CSV、JSON 文件
worker.postMessage({ type: 'parse', file: largeFile });
```

## 4. 加密/解密

```javascript
// 执行加密运算
worker.postMessage({
  type: 'encrypt',
  data: sensitiveData,
  algorithm: 'AES-GCM'
});
```

## 5. 实时搜索/排序

```javascript
// 大列表的实时过滤和排序
worker.postMessage({
  type: 'filter',
  list: bigList,
  keyword: searchText
});
```

## 6. WebAssembly 执行

```javascript
// 在 Worker 中运行 WASM 模块
worker.postMessage({ type: 'runWasm', wasmModule });
```

---

# 封装 Worker 的 Promise 化调用

实际项目中，可以封装成更易用的 Promise 形式：

```javascript
class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workers = [];
    this.taskQueue = [];
    this.availableWorkers = [];

    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  run(data) {
    return new Promise((resolve, reject) => {
      const task = { data, resolve, reject };

      if (this.availableWorkers.length > 0) {
        this._runTask(task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }

  _runTask(task) {
    const worker = this.availableWorkers.pop();

    worker.onmessage = (e) => {
      task.resolve(e.data);
      this._releaseWorker(worker);
    };

    worker.onerror = (e) => {
      task.reject(e);
      this._releaseWorker(worker);
    };

    worker.postMessage(task.data);
  }

  _releaseWorker(worker) {
    this.availableWorkers.push(worker);
    if (this.taskQueue.length > 0) {
      this._runTask(this.taskQueue.shift());
    }
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
  }
}

// 使用示例
const pool = new WorkerPool('compute-worker.js', 4);

async function processData(data) {
  const result = await pool.run(data);
  console.log(result);
}
```

---

# 性能对比示例

## 不使用 Worker（主线程阻塞）

```javascript
function heavyTask() {
  let sum = 0;
  for (let i = 0; i < 1e9; i++) {
    sum += i;
  }
  return sum;
}

// 执行期间页面完全卡死
console.log(heavyTask());
```

## 使用 Worker（主线程不阻塞）

```javascript
// main.js
const worker = new Worker('heavy-worker.js');

worker.postMessage('start');
worker.onmessage = (e) => console.log('结果:', e.data);

// 页面依然可以正常交互
console.log('Worker 在后台计算中...');
```

```javascript
// heavy-worker.js
self.onmessage = () => {
  let sum = 0;
  for (let i = 0; i < 1e9; i++) {
    sum += i;
  }
  self.postMessage(sum);
};
```

---

# 注意事项与最佳实践

1. **同源限制**：Worker 脚本必须与主页面同源
2. **通信开销**：频繁通信会带来性能损耗，尽量批量传递数据
3. **内存管理**：及时 `terminate()` 不再使用的 Worker
4. **错误处理**：始终添加 `onerror` 处理器
5. **调试**：Chrome DevTools 的 Sources 面板可以调试 Worker
6. **降级方案**：为不支持 Worker 的环境提供降级

```javascript
// 检测是否支持 Web Worker
if (typeof Worker !== 'undefined') {
  // 使用 Worker
} else {
  // 降级到主线程执行
}
```

---

# 浏览器兼容性

| 浏览器 | Dedicated Worker | Shared Worker | ES Module Worker |
|--------|------------------|---------------|------------------|
| Chrome | ✅ 4+ | ✅ 5+ | ✅ 80+ |
| Firefox | ✅ 3.5+ | ✅ 29+ | ✅ 114+ |
| Safari | ✅ 4+ | ❌ | ✅ 15+ |
| Edge | ✅ 12+ | ✅ 79+ | ✅ 80+ |

---

# 总结

Web Worker 是处理 JavaScript 性能问题的重要工具：

- ✅ 将耗时任务移至后台线程
- ✅ 保持 UI 流畅响应
- ✅ 充分利用多核 CPU
- ❌ 不适合简单任务（创建 Worker 有开销）
- ❌ 不能操作 DOM

**使用原则**：当任务执行时间 > 50ms 时，考虑使用 Web Worker。