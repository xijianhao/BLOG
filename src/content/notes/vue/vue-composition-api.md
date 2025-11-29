---
title: Vue 3 Composition API
notebook: vue
date: 2024-01-18
tags: ['vue', 'composition-api']
excerpt: Vue 3 Composition API 的使用指南
order: 1
---

# Vue 3 Composition API

Composition API 是 Vue 3 引入的新特性，提供了更好的逻辑复用和代码组织方式。

## setup 函数

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

## 响应式 API

- `ref`: 用于基本类型
- `reactive`: 用于对象
- `computed`: 计算属性
- `watch`: 监听器

