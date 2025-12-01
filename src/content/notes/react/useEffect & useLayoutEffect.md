---
title: useEffect & useLayoutEffect
notebook: react
date: 2025-03-23
tags: ['react', '基础', '概念']
excerpt: 总结两个副作用本质的区别
order: 3
---

# useEffect

useEffect主要用于`声明副作用`，这些副作用会在组件每次渲染完成后，由React异步调度执行。

副作用指的就是 函数执行时，除了返回值以外，还对外界造成了影响的函数。

useEffect有两个参数，第一个参数我们可以传一个回调函数，里面写副作用的逻辑，第二个参数是`依赖项数组`（deps），react会浅比较依赖项数组新旧变化，来判断是否需要执行effect。
只要有一个依赖项有变化就会执行effect。

它还可以返回一个函数，称之为`清理函数`，这个清理函数会在`Effect重新执行前` 或者 `组件卸载时`执行，防止内存泄漏和逻辑错误。


## useEffect执行顺序

``` text

组件渲染 (Render)
        ⬇
声明useEffect(fn,deps)
        ⬇
React 比较deps与上次是否相同
        ├─  否 -> 记录需要执行
        └─  是 -> 跳过
        ⬇
Commit 阶段：更新DOM -> 浏览器Paint
        ⬇
按声明顺序 异步执行 所有需要执行的effect
        ⬇
若返回清理函数 -> 储存起来
        ⬇
下次effect执行前 或者 组件卸载时 -> 执行清理

```


# useLayoutEffect

首先它的作用跟useEffect一样，都是用来处理副作用的，区别在于`执行时机的不同`。useEffect是在commit阶段更新DOM 并且 浏览器渲染完成后执行。useLayoutEffect是在更新DOM后，浏览器渲染前同步执行。

此时它是可以拿到DOM更新后的信息，再执行相应的事件，目的是确保用户只看到最终的画面。

但同时他是同步执行的，浏览器必须等它跑完才能把画面画出来，会阻塞主线程。使用时要避免复杂计算和大量的DOM操作。

## useLayoutEffect执行顺序

``` text
组件渲染 (Render)
        ⬇
声明 useLayoutEffect(fn, deps)
        ⬇
React 比较 deps 与上次是否相同
        ├─ 否 → 记录需要执行
        └─ 是 → 跳过
        ⬇
Commit 阶段：
   ├─ 更新 DOM（Mutation）
   └─ 👉 同步执行所有“需要执行”的 useLayoutEffect（在浏览器 Paint 之前）
        ⬇
若返回清理函数 → 储存起来
        ⬇
下次 useLayoutEffect 执行前 或 组件卸载时 → 执行清理函数
```