---
title: EventLoop 事件循环
notebook: js
date: 2024-09-30
tags: ['基础']
excerpt: JS事件循环机制：调用栈、宏任务队列、微任务队列的执行流程与原理
order: 1
---


# 背景

首先js是单线程语言，同一时间做能做一件事，执行代码时主线程是从上而下依次执行。

所以为了处理异步操作的时候，不阻塞主线程，就引入了事件循环机制。

它可以通过协调同步任务和异步任务的执行顺序，实现非阻塞的异步编程。

# 核心组成

## 调用栈
	作用是存放正在执行的函数，遵循先进后出原则，同步代码直接执行

## 宏任务队列
	存放宏任务的回调，常见的宏任务包括：
	- setTimeout、setInterval
	- I/O 操作（文件读写、网络请求等）
	- UI 渲染（浏览器环境）
	- 整体 script 脚本
	- setImmediate（Node.js 环境）
	- MessageChannel

## 微任务队列
	存放微任务回调，常见的微任务包括：
	- Promise.then、Promise.catch、Promise.finally
	- async/await（本质是 Promise）
	- queueMicrotask()
	- MutationObserver（浏览器环境）
	- process.nextTick（Node.js 环境，优先级最高）


# 执行流程

每一轮的事件循环、会执行一个宏任务，执行过程中遇到同步代码，直接进入调用栈执行，其次遇到微任务，加入微任务队列，遇到宏任务，加入宏任务队列。

当前宏任务执行完毕后，会立即执行完整个微任务队列。再从宏任务队列中取下一个宏任务，开始下一轮的循环。

## 浏览器环境下的完整流程

1. 执行一个宏任务（从宏任务队列取出）
2. 执行过程中产生的微任务加入微任务队列
3. 宏任务执行完毕后，清空整个微任务队列
4. 检查是否需要渲染（浏览器环境下，通常每 16ms 渲染一次）
5. 从宏任务队列取下一个宏任务，开始新一轮循环

# async/await 的执行机制

async/await 本质上是 Promise 的语法糖，执行机制如下：

- async 函数返回一个 Promise 对象
- await 后面的代码会暂停执行，等待 Promise 解决
- await 后面的代码会被包装成微任务，放入微任务队列
- 函数执行到 await 时，会先执行 await 后面的表达式，然后将后续代码作为微任务

```javascript
async function test() {
  console.log(1);
  await Promise.resolve();
  console.log(2); // 这部分会作为微任务
}
console.log(3);
test();
console.log(4);
// 输出顺序：3, 1, 4, 2
```

# 执行顺序示例

```javascript
console.log('1'); // 同步代码

setTimeout(() => {
  console.log('2'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // 微任务
});

console.log('4'); // 同步代码

// 输出顺序：1, 4, 3, 2
// 解释：同步代码先执行(1,4)，然后执行微任务(3)，最后执行宏任务(2)
```

