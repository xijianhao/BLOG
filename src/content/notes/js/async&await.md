---
title: async & await
notebook: js
date: 2024-05-10
tags: ['基础']
excerpt: 理解 async 和 await 是什么、原理以及在异步编程中起到什么作用
order: 4
---

# 概念
`async/await`是基于Promise的语法糖，它能用写同步代码的方式处理异步操作，底层仍是Promise，代码更清晰、错误处理更直观。

# 基本语法
### async函数
- 在函数前加 async，该函数自动返回一个 Promise
- 即使你 return 一个普通值，也会被包装成 Promise.resolve(value)

### await表达式
- 只能在 async 函数内部使用
- 暂停函数执行，等待 Promise 完成（fulfilled 或 rejected）
- 如果 await 后面不是 Promise，会自动用 Promise.resolve() 包装

# 执行机制

await并不会阻塞整个JS主线程，它利用了Promise+微任务机制，只暂停当前函数的执行上下文，把控制权交还给事件循环。

# 并发 & 串行

- 需要前一步结果 → 用 await 串行
- 多个独立异步操作 → 用 Promise.all + await 并发

``` javascript
async function fast() {
  const userPromise = fetchUser();   // 立即发起请求
  const postsPromise = fetchPosts(); // 立即发起请求

  const user = await userPromise;    // 等待结果
  const posts = await postsPromise;  // 等待结果 → 总耗时 ~1s
  return { user, posts };
}

// 或更简洁：
async function fastest() {
  const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
  return { user, posts };
}
```