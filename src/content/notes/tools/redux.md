---
title: Redux
notebook: tools
date: 2024-04-03
tags: ['前端']
excerpt: Redux是一个可预测且可维护的全局状态管理js库
order: 3
---

（ 副作用是任何对外部世界有显著影响的代码 ）

# 核心概念
Redux是一个可预测全局状态管理库，主要提供的是 **单一数据源+单向数据流** 的模式。使状态变化可预测，可追踪。

**Redux的核心三大原则**

- **单一数据源**：整个应用的状态存储在一个store中，是一个js对象树
- **状态是只读的**：唯一改变state的方式是dispatch一个action
- **状态变更由纯函数完成**：使用reducer函数接受旧的state和action，返回新state。reducer必须是纯函数。

**Redux工作流程**

组件派发 action → store 接收 action 并传给 reducer → reducer 计算新 state → store 更新 state → 组件感知 state 变化并重新渲染。

# 核心组成

### store

### Action

### Reducer



# 配合React使用

### react-redux

### 