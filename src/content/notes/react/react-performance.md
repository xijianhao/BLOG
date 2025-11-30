---
title: React 性能优化技巧
notebook: react
date: 2024-01-20
tags: ['react', '性能优化']
excerpt: 提升 React 应用性能的实用技巧
order: 4
---

# React 性能优化技巧

## 1. 使用 React.memo

`React.memo` 是一个高阶组件，用于优化函数组件的渲染性能。

```javascript
const MyComponent = React.memo(function MyComponent({ name }) {
  return <div>{name}</div>;
});
```

## 2. 使用 useMemo 和 useCallback

`useMemo` 用于缓存计算结果，`useCallback` 用于缓存函数。

```javascript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

## 3. 代码分割

使用 `React.lazy` 和 `Suspense` 进行代码分割。

```javascript
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtherComponent />
    </Suspense>
  );
}
```

