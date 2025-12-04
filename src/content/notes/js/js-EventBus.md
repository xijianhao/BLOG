---
title:  EventBus 事件总线
notebook: js
date: 2024-05-14
tags: ['js', '进阶']
excerpt: 订阅发布模式 直接上代码
order: 20
---

# 代码

``` javascript
class EventBus {
  constructor() {
    // 使用 Map 存储：key 为事件名，value 为 Set（去重 + 快速删除）
    this.events = new Map();
  }

  // 订阅事件
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return this;
  }

  // 一次性订阅
  once(event, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }

  // 取消订阅
  off(event, callback) {
    if (!this.events.has(event)) return this;

    if (!callback) {
      // 移除整个事件
      this.events.delete(event);
      return this;
    }

    const listeners = this.events.get(event);
    listeners.delete(callback);
    if (listeners.size === 0) {
      this.events.delete(event); // 清理空 Set
    }
    return this;
  }

  // 发布事件
  emit(event, ...args) {
    if (!this.events.has(event)) return false;

    // 注意：遍历时允许在回调中移除监听器（所以先复制一份）
    const listeners = [...this.events.get(event)];
    for (const callback of listeners) {
      callback(...args);
    }
    return true;
  }

  // 获取监听器数量（可选）
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).size : 0;
  }
}
```