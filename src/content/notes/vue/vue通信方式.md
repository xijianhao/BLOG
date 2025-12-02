---
title: Vue通信方式
notebook: vue
date: 2025-04-10
tags: ['vue', '基础']
excerpt: 整理Vue中常用的几种通信方式
order: 2
---

# 1. 自定义事件 Props / Events （父子通信）

父组件 → 子组件 (Props)

子组件 → 父组件 (自定义事件)
- 父组件通过`@事件名`传入函数并监听
- 子组件执行`$emit`通知父组件执行

# Vuex / Pinia


# X. Event Bus 事件总线 Vue2适用 过时

是一种 全局事件中心，用于跨层级组件通信。

本质上是一个空的Vue示例，作为中介收发事件。

**核心原理**
- 所有组件共享同一个EventBus实例。
- 通过 `$emit` 广播事件，通过 `$on` 订阅，通过`$off`移除监听。
- 本质上是`观察者模式` 发布订阅模式的应用。

**缺点**
 - 内存泄漏，必须要在`beforeDestory`中`$off`移除监听，不然组件销毁后监听器仍然存在。
 - 调试困难，来源和去向不直观，难以追踪。
 - 命名冲突，全局事件名容易重复
 - 耦合隐式，表面解耦，实则通过字符串事件名形成隐式依赖，不利于维护。

 “Event Bus 虽然简单，但在中大型项目中容易失控。我们后来改用 Vuex/Pinia 管理状态，或通过 provide/inject + 响应式数据 实现更可控的跨组件通信。”

**事件总线**
``` javascript
class EventBus {
  constructor() {
    this.events = {};
  }
  $on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  $emit(event, ...args) {
    (this.events[event] || []).forEach(cb => cb(...args));
  }
  $off(event, callback) {
    if (!this.events[event]) return;
    if (!callback) {
      delete this.events[event];
    } else {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}
export const EventBus = new EventBus();
```