---
title: EventLoop 事件循环
notebook: js
date: 2024-09-30
tags: ['基础']
excerpt: JS事件循环机制：调用栈、宏任务队列、微任务队列的执行流程与原理
order: 1
---
A F,[C,G][B ]

# 背景

一句话概括：js是单线程语言，同一时间做能做一件事，执行代码时主线程是从上而下依次执行，事件循环就是通过协调同步任务和异步任务的执行顺序，实现非阻塞的异步编程。

每一轮的事件循环、会执行一个宏任务，执行过程中遇到同步代码，直接进入调用栈执行，其次遇到微任务，加入微任务队列，遇到宏任务，加入宏任务队列。

当前宏任务执行完毕后，会立即执行完整个微任务队列。再从宏任务队列中取下一个宏任务，开始下一轮的循环。


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
	- MessageChannel 高优先级 setTimeout

## 微任务队列
	存放微任务回调，常见的微任务包括：
	- Promise.then、Promise.catch、Promise.finally
	- async/await（本质是 Promise）
	- queueMicrotask()
	- MutationObserver（浏览器环境）
	- process.nextTick（Node.js 环境，优先级最高）

start end promise1,micro1,promise2  promise3  raf1 p3 message1 p2 timeout1 p1 timeout2 p3 

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


# 示例1

```javascript
console.log(1); // 同步

setTimeout(() => {
  console.log(2); // 宏任务
  Promise.resolve().then(() => console.log(3));
}, 0);

async function async1() {
  console.log(4);
  await async2();
  console.log(5); // 单独的延时微任务队列，当执行完所有的微任务队列后执行
}

async function async2() {
  console.log(6);
  return Promise.resolve().then(() => console.log(7));
}

async1();

queueMicrotask(() => {
  console.log(8);
  Promise.resolve().then(() => console.log(9));
});

new Promise(resolve => {
  console.log(10);
  resolve();
}).then(() => console.log(11));

console.log(12);

// 1,4,6,10,12,7,8,11,9,5,2,3
```

# 示例2

``` javascript
async function foo() {
  console.log(1);
  await bar();
  console.log(2);
}

async function bar() {
  console.log(3);
  return Promise.resolve().then(() => {
    console.log(4);
  });
}

console.log(5);

Promise.resolve()
  .then(() => {
    console.log(6);
    return Promise.resolve().then(() => console.log(7));
  })
  .then(() => console.log(8));

foo();

queueMicrotask(() => console.log(9));

new Promise((resolve) => {
  console.log(10);
  resolve();
}).then(() => console.log(11));

setTimeout(() => console.log(12), 0);

console.log(13);
// 5，1，3，10，13，6，4，9，11，7，2，8，12
```