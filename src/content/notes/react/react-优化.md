---
title: React优化
notebook: react
date: 2025-09-02
tags: ['react', '进阶']
excerpt: React中都可以做哪些优化
order: 6
---

# 组件层级优化

### 避免不必要的渲染

- 使用`React.memo` 对函数组件做浅比较，防止父组件更新导致子组件无意义的重复渲染。
- 使用useMemo缓存计算结果 useCallback缓存函数的引用，避免子组件因props函数变化而重复渲染。
- 合理拆分组件，将频繁更新的部分与静态内容分离，限制重渲染范围。
- 避免内联对象/函数作为props，因为每次渲染都会创建新的对象

# 状态管理优化

主要是尽量要把状态尽可能靠近使用它的组件，就比如useContext适合跨多层传递全剧状态，但任何Context更新都会导致消费者重渲染。
这时候我们就要拆分Context、避免一个Context变更影响无关组件。
或者考虑其他状态管理库，比如Mobx，这种，提供更细粒度的订阅机制。

# 列表与虚拟滚动

- 列表项要设置稳定的key，避免DOM错误复用。
- 长列表使用虚拟滚动，只渲染可视区域内的元素。


# 懒加载与代码分割

- 组件的动态导入
- 路由级的代码分割，结合React Router实现按路由拆包，减少首屏JS体积。
- 组件级懒加载、比如对模态框、Tab内容等非立即可见组件延迟加载。

---

# 构建与打包优化

- 首先肯定要确保使用生产模式构建，移除调试代码和开发警告。
- 尽量使用支持Tree Shaking的库 以及UI库这种的做按需引入。
- 我们可以分析Bundle体积，使用 webpack-bundle-analyzer 或 Vite 的 rollup-plugin-visualizer 查找大体积依赖。
- 预加载关键资源，使用`<link rel="preload">` 或 `React.lazy` + `import()` 预加载关键路由。

# 渲染性能监控



通常我会先通过 Profiler 或 Lighthouse 定位问题，再针对性优化，避免过早优化带来的复杂性。