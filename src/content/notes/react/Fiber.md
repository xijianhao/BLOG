---
title: Fiber
notebook: react
date: 2025-03-25
tags: ['react', '进阶', '概念']
excerpt:  React16引入的核心架构革新，也是实现并发渲染（Concurrent Rendering）的基础。
order: 3
---

# 概念

Fiber 是 React 为了实现并发渲染而重构的核心架构。它的本质是把组件树的更新过程从递归改为基于链表的迭代遍历，每个组件对应一个 Fiber 节点，节点中不仅保存组件信息，还记录工作状态、副作用、优先级等。

Fiber 通过 双缓存机制（current / workInProgress） 实现安全的增量更新；利用 Scheduler 在浏览器空闲时执行工作，并支持高优先级更新打断低优先级任务。

整个 reconcile 过程分为 beginWork（向下构建子树）和 completeWork（向上收集副作用），每处理一个 Fiber 节点就检查是否需要让出主线程。这种设计使得 React 能够在保持 UI 流畅的同时，完成复杂的更新逻辑。

可以说，Fiber 不是一种数据结构，而是一套可中断、可恢复、可调度的工作协调机制。


# 起源

在 React 15 及之前，React 使用 递归 + 同步 的方式构建和更新组件树（称为 Stack Reconciler）：

浏览器主线程 = 渲染 + JS + 用户输入。长时间 JS 运行会阻塞用户交互！

- 一旦开始更新，就必须一口气完成整个树的 diff 和 DOM 操作
- 如果组件树很大（比如上千节点），这个过程会长时间占用主线程
- 导致卡顿、掉帧、交互无响应



**Fiber的目标**：把渲染/更新工作拆成小块，利用浏览器空闲时间执行，支持中断、恢复、优先级调度。

这就是 增量渲染（Incremental Rendering）。

**Fiber的核心思想**：用链表+工作单元 替换递归

关键转变：递归调用+不可中断+无优先级概念 -> 迭代遍历+可中断可恢复+支持lane优先级调度


## Fiber节点数据结构

``` typescript
interface Fiber {
  // 1. 标识信息
  type: Function | string;        // 组件类型
  key: string | null;            // 列表项的key
  tag: WorkTag;                  // Fiber 类型标记（FunctionComponent, ClassComponent等）
  
  // 2. 状态数据
  stateNode: any;                // 对应的真实DOM或组件实例
  memoizedProps: Props;          // 上次渲染的props
  memoizedState: any;            // 上次渲染的state
  pendingProps: Props;           // 新的待处理的props
  
  // 3. 链表结构（核心！）
  return: Fiber | null;          // 父节点
  child: Fiber | null;           // 第一个子节点
  sibling: Fiber | null;         // 右边的兄弟节点
  index: number;                 // 在父节点children中的索引
  
  // 4. 副作用
  flags: Flags;                  // 标记需要执行的操作（增、删、更新）
  subtreeFlags: Flags;           // 子树中的副作用标记
  deletions: Fiber[] | null;     // 待删除的子节点
  
  // 5. 调度相关
  lanes: Lanes;                  // 优先级车道
  childLanes: Lanes;             // 子节点的优先级
  
  // 6. 双缓存技术
  alternate: Fiber | null;       // 指向workInProgress树或current树
}
```

## 关键转变：递归 -> 链表遍历

``` javascript
// 递归版本（旧）
function traverse(element) {
  // 处理当前节点
  process(element);
  
  // 递归子节点
  element.children.forEach(child => {
    traverse(child);
  });
}

// Fiber 链表版本（新）
function workLoop() {
  while (nextUnitOfWork !== null) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 这里可以中断！检查是否还有时间
    if (shouldYield()) {
      // 让出主线程
      return;
    }
  }
}

function performUnitOfWork(fiber) {
  // 1. 开始工作：处理当前fiber
  beginWork(fiber);
  
  // 2. 如果有子节点，返回子节点作为下一个工作单元
  if (fiber.child) {
    return fiber.child;
  }
  
  // 3. 没有子节点，处理兄弟节点
  let current = fiber;
  while (current) {
    // 完成当前节点
    completeWork(current);
    
    // 如果有兄弟节点，返回兄弟节点
    if (current.sibling) {
      return current.sibling;
    }
    
    // 否则返回父节点，继续向上
    current = current.return;
  }
  
  return null;
}
```

# Fiber架构的双缓存机制

“React 的双缓存机制通过每个 Fiber 节点的 alternate 字段实现。每次更新时，React 会基于当前的 current 树创建或复用一棵 workInProgress 树。这棵树在后台构建，完全不影响当前 UI。

构建过程中，如果被高优先级更新打断，可以直接丢弃 workInProgress，因为 current 树始终完整。

当更新完成后，在 Commit 阶段通过一句 root.current = finishedWork 完成切换，时间复杂度 O(1)。

这种设计使得 React 能安全地实现可中断渲染，是并发模式的基石。”

react同时维护两棵树，实现无闪烁更新。
他会保存当前树，和正在构建的树，通过调度完成渲染后，react直接把切换指针即可。
- current 树：当前显示在屏幕上的 Fiber 树
- workInProgress 树：正在构建的新 Fiber 树

构建完成后，两者互换（root.current = workInProgress） 切换指针即可，实现 O(1) 切换


``` javascript
// 双缓存数据结构
let currentRoot = null;      // 当前屏幕上显示的树
let workInProgressRoot = null; // 正在构建的树
let nextUnitOfWork = null;   // 下一个工作单元

function render(element, container) {
  // 1. 创建 workInProgress 根节点
  workInProgressRoot = {
    stateNode: container,
    element: {
      props: { children: [element] }
    },
    alternate: currentRoot  // 指向current树
  };
  
  nextUnitOfWork = workInProgressRoot;
  
  // 2. 开始调度
  scheduleCallbackWithPriority(
    performConcurrentWorkOnRoot,
    lanes
  );
}

function commitRoot() {
  // 3. 完成渲染后，切换指针
  container.appendChild(workInProgressRoot.child.stateNode);
  currentRoot = workInProgressRoot;  // 重要！切换current指针
  workInProgressRoot = null;
}
```

``` text
当前帧：current tree → 用户看到的内容
构建中：workInProgress tree → 后台构建新的树
提交后：workInProgress → current（交换指针）
```

# 优先级调度机制：Lane模型

Fiber引入了精细的优先级控制。采用31位的二进制表示车道的优先级

``` typescript 
// 优先级定义（数字越小优先级越高）
const SyncLane: Lane = 0b0000000000000000000000000000001; // 同步优先级，最高优先级  车道占用：1
const InputContinuousLane: Lane = 0b0000000000000000000000000000100; // 连续输入优先级 如 滚动、拖拽 车道占用3
const DefaultLane: Lane = 0b0000000000000000000000000010000; // 默认优先级 普通状态更新 车道占用：20
const IdleLane: Lane = 0b0100000000000000000000000000000; // 空闲优先级 低优先级任务 车道占用：1
const OffscreenLane: Lane = 0b1000000000000000000000000000000; // 李屏内容优先级 预渲染 车道占用：1

// 调度示例
function scheduleUpdate(fiber, lane) {
  // 1. 标记更新到fiber和根节点
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  const root = markUpdateLaneFromFiberToRoot(fiber);
  
  // 2. 根据优先级安排调度
  if (lane === SyncLane) {
    // 同步更新，立即执行
    performSyncWorkOnRoot(root);
  } else {
    // 并发更新，可中断
    ensureRootIsScheduled(root);
  }
}
```

# Fiber工作流程的三个阶段

## 阶段一： Render/Reconciliation （可中断）
``` text 
1. beginWork() - 向下遍历
   ↓
2. 比较 props，决定是否复用
   ↓
3. 标记 flags（增、删、更新）
   ↓
4. 生成 effect list（副作用链表）
```
## 阶段二： Commit（不可中断）
``` text 
1. commitBeforeMutationEffects() - DOM 变更前
   ↓
2. commitMutationEffects() - 执行DOM操作
   ↓
3. commitLayoutEffects() - DOM 变更后（调用生命周期）
```
## 阶段三： cleanup
- 清理副作用
- 准备下一轮更新


# 为什么Fiber能提高性能


## 时间切片
``` javascript
// React 的调度器实现
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
  
  // 使用 requestIdleCallback 或 MessageChannel
  if (workInProgress !== null) {
    // 还有工作，下次继续
    scheduleCallback(workLoopConcurrent);
  }
}
```
## 优先级驱动的更新
- 用户交互（点击、输入）：最高优先级
- 数据更新：中等优先级
- 懒加载：低优先级