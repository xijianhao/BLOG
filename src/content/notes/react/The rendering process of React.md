---
title: React渲染流程
notebook: react
date: 2025-01-13
tags: ['react', '进阶']
excerpt: React渲染流程的核心层
order: 2
---

# 背景

react 18 引入了并发模式（Concurrent Mode）,将整个更新过程分为了两个主要阶段：

1. Render Phase 渲染阶段
 - 包括Schedule调度 -> Reconcile协调
 - 可中断、可暂停、可恢复

2. Commit Phase 提交阶段
 - 将变更同步应用到DOM
 - 不可中断


# 第一阶段：调度触发 schedule阶段

**核心目标**：决定 `什么时候开始更新` 以及 `以什么优先级更新`。

**关键点**：Schedule阶段`不涉及DOM操作`，也`不构建FIber树`，只负责**安排后续工作如何执行。**

**总结**：

“在 React 的并发渲染机制中，Schedule 阶段是整个更新流程的第一步。它的核心作用是决定更新的时机和优先级。

当我们调用 setState 或触发其他状态更新时，React 会创建一个 Update 对象，并根据触发源（比如用户点击 or 定时器）赋予它一个优先级 —— 这个优先级在 React 18 中由 Lane 模型表示。

接着，React 会通过内部的 Scheduler 模块，把后续的 reconciler 工作（也就是构建新的 Fiber 树）作为一个回调任务调度出去。Scheduler 会利用浏览器的空闲时间（通过类似 requestIdleCallback 的机制）来执行这个任务，并且支持高优先级更新打断低优先级更新，从而保证用户交互的流畅性。

所以，Schedule 阶段本身不进行 DOM 操作，也不 diff 组件，它只是一个‘智能调度器’，为后续的协调和提交阶段做准备。”

## 触发更新

-  首先 用户触发更新，比如setState，
-  React将这些更新封装成一个`Update`对象,并加入到Fiber节点的updateQueue中。

## 确定更新的优先级 Lane模型
- React 18 使用lane车道模型代替旧的expirationTime，来表示更新的优先级。
- 不同来源的更新有不同的优先级：
  - 用户交互 高优先级
  - 数据获取 中优先级
  - 自动批处理或低优先级任务 - 低优先级

## 调度任务 通过Scheduler
- React 调用 Scheduler.unstable_scheduleCallback，把后续的 reconcile 工作（即构建 work-in-progress 树）交给 Scheduler（调度器）。
- Scheduler 基于 浏览器的 MessageChannel + 微任务/宏任务机制，利用 requestIdleCallback 的 polyfill，在浏览器空闲时执行任务。
- 如果有更高优先级的更新进来，当前低优先级任务会被 打断（interrupted），让出主线程。




# 第二阶段：Reconcile阶段 协调 render阶段

**核心目标**：
- 根据当前状态和新的状态，生成新的Fiber树(work-in-progress tree)。
- 找出需要变更的部分（diff）
- 为Commit阶段准备 `副作用列表`

**总结**：

“React 的更新流程在并发模式下分为两个主要阶段：Render Phase 和 Commit Phase。

Render Phase 包括 Schedule 和 Reconcile。Schedule 阶段负责根据更新来源分配优先级（Lane 模型），并通过 Scheduler 在浏览器空闲时调度任务；Reconcile 阶段则从根节点开始，递归调用组件函数，利用 Diff 算法构建新的 Fiber 树，并收集需要执行的副作用。这个阶段是可中断的，支持高优更新打断低优任务。

Commit Phase 是不可中断的，它分三步：首先在 Mutation 前做快照，然后批量更新 DOM，接着同步执行 useLayoutEffect 和生命周期方法，最后在 Paint 之后异步执行 useEffect。

整个设计的核心思想是：把 CPU 密集型工作（Reconcile）拆分成小块，在浏览器空闲时执行；而 DOM 操作（Commit）则集中、快速完成，保证一致性。”

## 从根节点开始遍历（beginWork）

这里就是JSX 被“执行”的地方 —— 组件函数被调用！

- React 从 root fiber 开始，递归调用 beginWork。
- 对每个 Fiber 节点：
  - 判断是否需要更新（通过比较 props、state、context 等）
  - 如果是函数组件 → 调用函数，获取 children
  - 如果是类组件 → 调用 render()
  - 如果是 HostComponent（如 div）→ 直接处理子节点



## Diff 算法（协调算法）
React 使用高效的 O(n) 启发式 Diff 算法，核心规则：

- 只对同层级节点进行比较（不跨层级移动）
- 依赖 key 来识别元素是否可复用
  - 有 key：按 key 匹配，移动/复用
  - 无 key：按 index 匹配，容易误判（导致性能问题或状态错乱）

## 构建 work-in-progress Fiber 树
- 新树（WIP）与旧树（current）并存
- 每个新 Fiber 节点会指向其旧版本（alternate 字段）
- 如果某个节点无需更新，React 会复用旧 Fiber 节点（bailout）

## 收集副作用（completeWork）
- 在“回溯”阶段（从子到父），调用 completeWork
- 为需要 DOM 操作的节点（如新增、删除、更新）打上 effectTag（如 Placement、Update、Deletion）
- 构建一条副作用链表（effect list），供 Commit 阶段快速遍历


# 第三阶段：提交 commit阶段

**重点**：此阶段不可中断，必须一气呵成，否则会导致UI不一致。

**核心目标**：
- 将Reconcile阶段计算出的变更同步到DOM上
- 执行生命周期方法/Hook副作用（useEffect、useLayoutEffect）

**总结**：

“Commit 阶段是 React 更新流程的最后一步，它本身已经包含了 DOM 更新和副作用的执行。具体分为三个子阶段：

第一，在 DOM 修改前执行 getSnapshotBeforeUpdate；

第二，批量应用所有 DOM 变更；

第三，在浏览器重绘前同步执行 useLayoutEffect 和生命周期方法。

等这些都完成后，浏览器才会真正 paint 新的 UI。

而 useEffect 会被 React 异步调度到 paint 之后执行，确保不阻塞渲染。

所以，Commit 阶段结束后，React 的本次更新就完全结束了。”

## Before Mutation（变更前）
主要用于触发 getSnapshotBeforeUpdate（类组件）
准备一些 DOM 变更前的快照（比如滚动位置）

## Mutation（变更）
实际操作 DOM：
插入（Placement）
更新属性（Update）
删除节点（Deletion）
此时 DOM 已更新，但屏幕尚未重绘

##  Layout（布局）
同步执行以下内容（在浏览器 paint 之前）：
- useLayoutEffect（函数组件）
- componentDidMount / componentDidUpdate（类组件）
- 可以安全读取 DOM 布局（如 offsetHeight），并同步修改（但要小心性能）

## After Paint（Paint 之后）

异步执行 useEffect 的 destroy/create 函数
触发 passive effect（不会阻塞渲染）