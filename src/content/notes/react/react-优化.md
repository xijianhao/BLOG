---
title: React优化
notebook: react
date: 2025-09-02
tags: ['react', '进阶']
excerpt: React中都可以做哪些优化
order: 6
---

# 检测工具

### React DevTools Profiler

记录组件渲染耗时，高亮重渲染、分析commit阶段。

### Chrome DevTools Performance
分析主线程任务、FPS、长任务（Long Tasks）、布局抖动等


# 组件层级优化

### 避免不必要的渲染

- 使用`React.memo` 对函数组件做浅比较，防止父组件更新导致子组件无意义的重复渲染。
- 使用useMemo缓存计算结果 useCallback缓存函数的引用，避免子组件因props函数变化而重复渲染。
- 合理拆分组件，将频繁更新的部分与静态内容分离，限制重渲染范围。
- 避免内联对象/函数作为props，因为每次渲染都会创建新的对象

### 状态管理优化

主要是尽量要把状态尽可能靠近使用它的组件，就比如useContext适合跨多层传递全剧状态，但任何Context更新都会导致消费者重渲染。
这时候我们就要拆分Context、避免一个Context变更影响无关组件。
或者考虑其他状态管理库，比如Mobx，这种，提供更细粒度的订阅机制。

### 列表与虚拟滚动

- 列表项要设置稳定的key，避免DOM错误复用。
- 长列表使用虚拟滚动，只渲染可视区域内的元素。


### 懒加载、预加载

- **组件懒加载**：React.lazy + Suspense
- **组件预加载** 常用于当用户hover时动态import lazy的组件。
- **webpack魔法注释**：lazy(() => import(/* webpackChunkName: "dashboard" */ './Dashboard')) 

---

# 构建层优化

### 代码分割

**路由级分割**：每个页面独立chunk
**组件级分割**：重型组件动态加载
**第三方库分离**：将react、loadsh等提取到vendor chunk
``` javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 提取 node_modules 到 vendor
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        // 提取公共业务代码
        common: {
          minChunks: 2,
          name: 'common',
        }
      }
    }
  }
};
```

### Tree Shaking
默认开启，但是要使用ES Module

### 资源压缩与格式优化

