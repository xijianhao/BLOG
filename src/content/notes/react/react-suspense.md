---
title: Suspense
notebook: react
date: 2024-11-29
tags: ['react','进阶']
excerpt: React Suspense 的核心概念、用法以及数据获取和代码分割的应用
order: 4
---

# 什么是 Suspense

Suspense 是 React 的 Fiber 架构支持一种特殊的机制：当组件在渲染过程中“抛出一个 Promise”时，React 会暂停该分支的渲染，并向上查找最近的 <Suspense> 边界，显示其 fallback 内容。

它主要解决两个场景：
1. **代码分割**：配合 `React.lazy` 实现组件的懒加载
2. **数据获取**：在 React 18+ 中支持异步数据获取的 Suspense

# 基本用法

```javascript
import { Suspense } from 'react';

<Suspense fallback={<Loading />}>
  <SomeComponent />
</Suspense>
```

当 `SomeComponent` 或其子组件触发 Suspense 时（比如正在加载），会显示 `fallback` 中的内容，直到加载完成。

# 代码分割（React.lazy）

最常见的用法是配合 `React.lazy` 实现路由或组件的按需加载，减少首屏 bundle 体积。

```javascript
import { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

## 工作原理

1. `React.lazy` 接收一个返回 Promise 的函数（通常是动态 `import()`）
2. 当组件首次渲染时，React 会触发这个 Promise
3. 在 Promise 未 resolve 前，React 会向上查找最近的 `Suspense` 边界
4. 显示该 `Suspense` 的 `fallback` UI
5. Promise resolve 后，渲染实际组件

## 注意事项

- `React.lazy` 只能用于默认导出（default export）的组件
- 必须配合 `Suspense` 使用，否则会报错
- 如果导入失败，需要配合错误边界（Error Boundary）处理

# 数据获取（React 18+）

在 React 18 中，Suspense 支持了数据获取场景。当组件在渲染过程中"抛出"一个 Promise 时，Suspense 会捕获它并显示 fallback。

```javascript
// 数据获取函数
function fetchUserData(userId) {
  let status = 'pending';
  let result;
  
  const promise = fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(data => {
      status = 'success';
      result = data;
    })
    .catch(error => {
      status = 'error';
      result = error;
    });
  
  return {
    read() {
      if (status === 'pending') throw promise;
      if (status === 'error') throw result;
      return result;
    }
  };
}

// 组件中使用
function UserProfile({ userId }) {
  const userData = fetchUserData(userId);
  return <div>{userData.read().name}</div>;
}

// 在 Suspense 中使用
<Suspense fallback={<UserSkeleton />}>
  <UserProfile userId={1} />
</Suspense>
```

## 工作原理

1. 组件调用 `read()` 方法时，如果数据还在加载（pending），会 throw 一个 Promise
2. React 捕获这个 Promise，向上查找 `Suspense` 边界
3. 显示 fallback，同时等待 Promise resolve
4. Promise resolve 后，React 重新渲染组件，此时 `read()` 返回数据

# 嵌套 Suspense

可以嵌套多个 `Suspense` 边界，实现更细粒度的加载控制。

```javascript
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<ArticleSkeleton />}>
    <Article />
  </Suspense>
  <Suspense fallback={<CommentsSkeleton />}>
    <Comments />
  </Suspense>
</Suspense>
```

这样不同部分可以独立显示加载状态，提升用户体验。

# 与错误边界配合

Suspense 只处理"加载中"状态，不处理错误。需要配合错误边界（Error Boundary）来处理加载失败的情况。

```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}

<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <LazyComponent />
  </Suspense>
</ErrorBoundary>
```

# 最佳实践

1. **合理设置 fallback**：fallback 应该与最终内容在布局上相似，避免布局跳动
2. **粒度控制**：根据业务需求设置 Suspense 边界，平衡用户体验和代码复杂度
3. **错误处理**：始终配合错误边界使用，处理加载失败的情况
4. **预加载**：对于关键路由，可以在用户可能访问前预加载
5. **避免过度使用**：不是所有异步操作都需要 Suspense，简单的 loading 状态用 state 即可

# 与传统 loading 的区别

| 方式 | 传统 loading | Suspense |
|------|-------------|----------|
| 控制方式 | 手动管理 loading 状态 | 声明式，自动处理 |
| 代码复杂度 | 需要在每个组件中处理 | 统一在边界处理 |
| 嵌套处理 | 需要逐层传递状态 | 自动向上查找边界 |
| 用户体验 | 可能出现闪烁 | 更平滑的过渡 |