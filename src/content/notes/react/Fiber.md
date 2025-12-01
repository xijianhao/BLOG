---
title: Fiber
notebook: react
date: 2025-03-25
tags: ['react', '进阶', '概念']
excerpt:  React16引入的核心架构革新，也是实现并发渲染（Concurrent Rendering）的基础。
order: 3
---

# 概念

React Fiber 相当于虚拟DOM的增强版，React15以及之前更新过程是递归遍历虚拟DOM树，整个过程同步执行，不可中断，如果组件树很大，就可能造成页面卡顿等异常。
React16重构了协调引擎，它就是把原本递归、不可中断的更新过程，改造成了 `可中断`、`可恢复`、`可优先级调度`的增量式更新机制。

目标是为了让React 能够 `分片工作` + `中断` +  `恢复` + `优先级调度`， 实现流畅的UI体验。

React 15及之前：

每一个Fiber呢就是一个工作单元，每个React元素在内存中都会对应一个Fiber节点；

节点包含组件信息 type props 还有
- 父/子/兄弟指针
- 副作用列表
- 优先级
- 工作状态

