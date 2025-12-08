---
title: Vue2 vs Vue3 深度对比
notebook: vue
date: 2025-01-27
tags: ['vue', '原理', '对比']
excerpt: 从原理层面深度解析 Vue 2 和 Vue 3 的核心区别，包括响应式系统、编译优化、API 设计等
order: 4
---

# 核心区别

## 响应式系统重构

### Vue 2: Object.defineProperty

Vue 2 使用 `Object.defineProperty` 来劫持对象的属性访问，实现响应式。

**实现原理：**

```javascript
// Vue 2 响应式实现简化版
function defineReactive(obj, key, val) {
  const dep = new Dep(); // 依赖收集器
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 依赖收集：当前 Watcher 订阅此属性
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 派发更新：通知所有订阅者
      dep.notify();
    }
  });
}
```

**局限性：**

1. **无法监听数组索引变化**：Vue 2 重写了数组的 7 个方法（push、pop、shift、unshift、splice、sort、reverse）来触发更新
2. **无法监听对象属性的新增/删除**：需要使用 `Vue.set()` 或 `this.$set()`
3. **深度监听需要递归**：初始化时递归遍历所有属性，性能开销大
4. **无法监听 Map、Set 等数据结构**

```javascript
// Vue 2 的问题示例
const vm = new Vue({
  data: {
    obj: { a: 1 }
  }
});

vm.obj.b = 2; // ❌ 无法响应式
vm.$set(vm.obj, 'b', 2); // ✅ 必须使用 $set

vm.arr[0] = 100; // ❌ 无法响应式
vm.$set(vm.arr, 0, 100); // ✅ 必须使用 $set
```

### Vue 3: Proxy

Vue 3 使用 `Proxy` 代理整个对象，从根本上解决了 Vue 2 的局限性。

**实现原理：**

```javascript
// Vue 3 响应式实现简化版
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      track(target, key);
      
      const res = Reflect.get(target, key, receiver);
      
      // 懒代理：只有访问到嵌套对象时才进行代理
      if (isObject(res)) {
        return reactive(res);
      }
      
      return res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      // 只有值真正改变时才触发更新
      if (oldValue !== value) {
        trigger(target, key);
      }
      
      return result;
    },
    deleteProperty(target, key) {
      const hadKey = hasOwn(target, key);
      const result = Reflect.deleteProperty(target, key);
      
      if (hadKey) {
        trigger(target, key);
      }
      
      return result;
    }
  });
}
```

**优势：**

1. **支持数组索引和 length 变化**：直接监听数组操作
2. **支持动态添加/删除属性**：无需 `$set`
3. **懒代理机制**：只有访问到的嵌套对象才会被代理，性能更好
4. **支持 Map、Set、WeakMap、WeakSet** 等数据结构
5. **更细粒度的依赖追踪**：可以追踪到具体的属性访问

```javascript
// Vue 3 的优势
const state = reactive({
  obj: { a: 1 },
  arr: [1, 2, 3]
});

state.obj.b = 2; // ✅ 自动响应式
state.arr[0] = 100; // ✅ 自动响应式
state.arr.length = 0; // ✅ 自动响应式
```

**性能对比：**

- **初始化性能**：Vue 3 的懒代理机制，只在访问时才创建代理，初始化更快
- **更新性能**：Proxy 的拦截器是原生实现，比 `Object.defineProperty` 更快
- **内存占用**：懒代理减少了不必要的代理对象创建

## 二、编译优化

### Vue 2: 全量 Diff

Vue 2 在更新时会对整个虚拟 DOM 树进行 diff 比较，即使某些节点是静态的。

**编译结果：**

```javascript
// Vue 2 模板
<div>
  <p>静态文本</p>
  <p>{{ dynamic }}</p>
</div>

// 编译后的渲染函数（简化）
function render() {
  return _c('div', [
    _c('p', [_v('静态文本')]),  // 每次都要 diff
    _c('p', [_v(_s(dynamic))])  // 动态节点
  ]);
}
```

**问题：**
- 静态节点也会参与 diff，浪费性能
- 无法跳过静态子树
- diff 算法需要遍历整个树

### Vue 3: 静态提升 + PatchFlag

Vue 3 通过编译时优化，大幅提升运行时性能。

**1. 静态提升（Static Hoisting）**

```javascript
// Vue 3 模板
<div>
  <p>静态文本</p>
  <p>{{ dynamic }}</p>
</div>

// 编译后的渲染函数（简化）
const _hoisted_1 = _createVNode('p', null, '静态文本', -1 /* HOISTED */);

function render(_ctx) {
  return _openBlock(), _createBlock('div', null, [
    _hoisted_1,  // 静态节点被提升，只创建一次
    _createVNode('p', null, _toDisplayString(_ctx.dynamic), 1 /* TEXT */)
  ]);
}
```

**优势：**
- 静态节点在编译时提取，只创建一次
- 更新时直接复用，不参与 diff

**2. PatchFlag（补丁标志）**

```javascript
// Vue 3 编译优化
<div>
  <p class="static">静态</p>
  <p :class="dynamic">动态 class</p>
  <p>{{ text }}</p>
  <p :id="id">{{ text }}</p>
</div>

// 编译后（简化）
function render(_ctx) {
  return _openBlock(), _createBlock('div', null, [
    _createVNode('p', { class: 'static' }, '静态', -1 /* HOISTED */),
    _createVNode('p', { class: _ctx.dynamic }, null, 2 /* CLASS */),
    _createVNode('p', null, _toDisplayString(_ctx.text), 1 /* TEXT */),
    _createVNode('p', { id: _ctx.id }, _toDisplayString(_ctx.text), 9 /* TEXT, PROPS */, ['id'])
  ]);
}
```

**PatchFlag 类型：**
- `1`: TEXT - 动态文本内容
- `2`: CLASS - 动态 class
- `4`: STYLE - 动态 style
- `8`: PROPS - 动态属性
- `16`: FULL_PROPS - 有 key 的动态属性
- `32`: HYDRATE_EVENTS - 事件监听器
- `64`: STABLE_FRAGMENT - 子节点顺序不变的 Fragment
- `128`: KEYED_FRAGMENT - 带 key 的 Fragment
- `256`: UNKEYED_FRAGMENT - 不带 key 的 Fragment
- `512`: NEED_PATCH - 需要 patch 的节点
- `1024`: DYNAMIC_SLOTS - 动态插槽
- `-1`: HOISTED - 静态提升节点

**优势：**
- 运行时只需检查标记的动态部分，跳过静态内容
- 更精确的更新，减少不必要的比较

**3. Block Tree**

Vue 3 引入了 Block 概念，将动态节点组织成树状结构。

```javascript
// Block Tree 结构
function render() {
  return _openBlock(), _createBlock('div', null, [
    // 静态节点
    _hoisted_1,
    // 动态 Block
    _createBlock(Fragment, { key: 0 }, [
      _createVNode('p', null, _ctx.dynamic1, 1),
      _createVNode('p', null, _ctx.dynamic2, 1)
    ], 64 /* STABLE_FRAGMENT */)
  ]);
}
```

**优势：**
- 只 diff 动态节点，跳过静态子树
- 更高效的更新算法

**性能提升：**
- **首次渲染**：提升约 55%
- **更新性能**：提升约 133%
- **内存占用**：减少约 41%

## 三、Composition API

### Vue 2: Options API

Vue 2 使用 Options API，通过选项对象组织代码。

```javascript
// Vue 2 Options API
export default {
  data() {
    return {
      count: 0,
      message: 'Hello'
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    }
  },
  methods: {
    increment() {
      this.count++;
    }
  },
  mounted() {
    console.log('mounted');
  }
};
```

**问题：**
- 逻辑分散：相关逻辑分散在不同选项中
- 代码复用困难：需要通过 mixin 或 HOC，但容易造成命名冲突
- TypeScript 支持不友好：类型推导困难

### Vue 3: Composition API

Vue 3 引入 Composition API，提供更灵活的逻辑组织方式。

```javascript
// Vue 3 Composition API
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    // 相关逻辑聚合在一起
    const count = ref(0);
    const message = ref('Hello');
    
    const doubleCount = computed(() => count.value * 2);
    
    const increment = () => {
      count.value++;
    };
    
    onMounted(() => {
      console.log('mounted');
    });
    
    return {
      count,
      message,
      doubleCount,
      increment
    };
  }
};
```

**优势：**

1. **逻辑复用**：通过组合式函数（Composables）实现逻辑复用

```javascript
// 可复用的逻辑
function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  
  const increment = () => count.value++;
  const decrement = () => count.value--;
  const reset = () => count.value = initialValue;
  
  return { count, increment, decrement, reset };
}

// 在组件中使用
export default {
  setup() {
    const { count, increment } = useCounter(10);
    return { count, increment };
  }
};
```

2. **更好的 TypeScript 支持**：完整的类型推导

```typescript
// Vue 3 + TypeScript
import { ref, Ref } from 'vue';

function useCounter(): {
  count: Ref<number>;
  increment: () => void;
} {
  const count = ref<number>(0);
  const increment = () => count.value++;
  
  return { count, increment };
}
```

3. **逻辑聚合**：相关逻辑组织在一起，更易维护

**Vue 3.2+ `<script setup>` 语法糖：**

```vue
<script setup>
import { ref, computed } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

const increment = () => count.value++;
</script>

<template>
  <button @click="increment">{{ count }} - {{ doubleCount }}</button>
</template>
```

**更简洁，自动暴露变量和方法。**

## 四、性能优化

### 1. Tree-shaking 支持

Vue 3 采用 ES Module 构建，支持 Tree-shaking。

```javascript
// Vue 2: 全量引入
import Vue from 'vue'; // 引入整个 Vue，即使只用了部分功能

// Vue 3: 按需引入
import { ref, reactive, computed } from 'vue'; // 只打包使用的 API
```

**效果：**
- 未使用的 API 会被打包工具移除
- 打包体积减少约 41%

### 2. 更小的包体积

- Vue 2: ~34KB (gzipped)
- Vue 3: ~10KB (gzipped) - 仅核心功能
- 完整功能: ~30KB (gzipped)

### 3. 更快的创建和更新

- **组件实例创建**：提升约 40%
- **Props 验证**：仅在开发环境进行
- **更高效的虚拟 DOM**

## 五、API 变化

### 1. 全局 API 调整

**Vue 2:**
```javascript
import Vue from 'vue';

Vue.component('MyComponent', { /* ... */ });
Vue.directive('my-directive', { /* ... */ });
Vue.mixin({ /* ... */ });
Vue.use(plugin);

const app = new Vue({ /* ... */ });
```

**Vue 3:**
```javascript
import { createApp } from 'vue';

const app = createApp({ /* ... */ });

app.component('MyComponent', { /* ... */ });
app.directive('my-directive', { /* ... */ });
app.mixin({ /* ... */ });
app.use(plugin);

app.mount('#app');
```

**优势：**
- 支持多个应用实例
- 更好的 Tree-shaking
- 避免全局污染

### 2. 组件实例 API

**移除的 API：**
- `$listeners` - 合并到 `$attrs`
- `$scopedSlots` - 统一为 `$slots`
- `filter` - 过滤器已移除

**新增的 API：**
- `$attrs` - 包含所有未声明的 props 和事件
- `emits` 选项 - 显式声明组件会触发的事件

### 3. 生命周期调整

```javascript
// Vue 2
beforeCreate -> created -> beforeMount -> mounted -> ...

// Vue 3 Composition API
setup() // 替代 beforeCreate 和 created
onBeforeMount()
onMounted()
onBeforeUpdate()
onUpdated()
onBeforeUnmount() // 改名（之前是 beforeDestroy）
onUnmounted() // 改名（之前是 destroyed）
```

## 六、新特性

### 1. 多根节点（Fragment）

**Vue 2:**
```vue
<template>
  <div> <!-- 必须有一个根元素 -->
    <header></header>
    <main></main>
  </div>
</template>
```

**Vue 3:**
```vue
<template>
  <header></header>
  <main></main>
  <!-- 可以有多个根节点 -->
</template>
```

### 2. Teleport

将组件渲染到 DOM 树的其他位置。

```vue
<template>
  <div>
    <button @click="show = true">打开弹窗</button>
    <Teleport to="body">
      <div v-if="show" class="modal">
        <p>这是弹窗内容</p>
      </div>
    </Teleport>
  </div>
</template>
```

**应用场景：** 模态框、提示框、下拉菜单等需要挂载到 body 的组件。

### 3. Suspense

异步组件加载时的占位符。

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
</template>
```

### 4. 自定义渲染器 API

Vue 3 将渲染逻辑与核心逻辑分离，可以自定义渲染器。

```javascript
import { createRenderer } from 'vue';

const { createApp } = createRenderer({
  // 自定义渲染逻辑
  createElement,
  insert,
  remove,
  // ...
});
```

**应用场景：** 小程序、Canvas、WebGL 等非 DOM 环境。

## 七、TypeScript 支持

### Vue 2: 有限的 TypeScript 支持

- 需要额外的类型定义
- Options API 类型推导不完善
- 需要额外的配置

### Vue 3: 原生 TypeScript 支持

- 使用 TypeScript 重写
- 完整的类型定义
- 更好的类型推导
- Composition API 天然支持 TypeScript

```typescript
// Vue 3 + TypeScript 示例
import { defineComponent, ref, PropType } from 'vue';

interface User {
  name: string;
  age: number;
}

export default defineComponent({
  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    }
  },
  setup(props) {
    const count = ref<number>(0);
    // 完整的类型推导
    return { count };
  }
});
```

## 八、兼容性

### Vue 2
- 支持 IE 11
- 更广泛的浏览器兼容性

### Vue 3
- 不支持 IE 11
- 需要现代浏览器（支持 Proxy）
- 更好的性能

## 总结

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式系统 | Object.defineProperty | Proxy |
| 编译优化 | 全量 Diff | 静态提升 + PatchFlag |
| API 风格 | Options API | Composition API + Options API |
| 包体积 | ~34KB | ~10KB (核心) |
| TypeScript | 有限支持 | 原生支持 |
| 性能 | 基准 | 提升 55%+ |
| 多根节点 | ❌ | ✅ |
| Teleport | ❌ | ✅ |
| Suspense | ❌ | ✅ |
| 自定义渲染器 | ❌ | ✅ |

Vue 3 在保持 API 兼容性的同时，通过底层重构带来了显著的性能提升和更好的开发体验。对于新项目，建议直接使用 Vue 3；对于现有 Vue 2 项目，可以通过渐进式迁移策略升级。

