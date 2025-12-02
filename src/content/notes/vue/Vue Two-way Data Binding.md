---
title: Vue双向绑定
notebook: vue
date: 2025-04-09
tags: ['vue', '基础']
excerpt: 理解Vue中双向绑定的原理和作用
order: 1
---

# 概念
**双向绑定** 是指 `数据` 与 `视图` 之间的自动同步，`数据变化->视图自动更新`、`视图变化->数据自动更新`。

Vue是通过`响应式系统`+`v-model语法糖`模拟出来的双向绑定的效果，底层仍然是单向数据流。

# 响应式系统

### Vue2实现方式：

- 使用 `Object.defineProperty()` 劫持 `data`对象的所有属性
- 在 `getter` 中进行 **依赖收集** （收集Watcher）
- 在 `setter` 中进行 **派发更新**（通知Watcher重新渲染）

```javascript
Object.defineProperty(data, 'message', {
  get() {
    // 收集当前渲染函数对应的 Watcher
    dep.depend();
    return value;
  },
  set(newVal) {
    value = newVal;
    // 通知所有依赖此属性的 Watcher 更新
    dep.notify();
  }
});
```

### vue3实现方式：

- 使用 `Proxy` 代理整个响应式对象
- 支持` 动态新增/删除属性` 、 `数组索引修改` 等场景
- 性能更好，`嵌套对象懒代理`（访问时才递归 reactive）

```javascript
const reactiveData = new Proxy(data, {
  get(target, key) {
    track(target, key); // 依赖收集
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    trigger(target, key); // 派发更新
    return true;
  }
});
```

# v-model 语法糖

本质上是对表单元素的value和onChange的集成

```vue
<!-- 模板写法 -->
<input v-model="message" />

<!-- 编译后等价于 -->
<input 
  :value="message" 
  @input="message = $event.target.value" 
/>
```