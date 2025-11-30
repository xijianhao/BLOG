---
title: React Hooks 详解
notebook: react
date: 2024-01-15
tags: ['react', 'hooks', '基础']
excerpt: 深入理解 React Hooks 的使用方法和最佳实践
order: 3
---

# React Hooks 详解

React Hooks 是 React 16.8 引入的新特性，让我们可以在函数组件中使用状态和其他 React 特性。

## useState

`useState` 是最常用的 Hook，用于在函数组件中添加状态。

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

## useEffect

`useEffect` 用于处理副作用，相当于类组件中的 `componentDidMount`、`componentDidUpdate` 和 `componentWillUnmount` 的组合。

```javascript
import { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `你点击了 ${count} 次`;
  });

  return (
    <div>
      <p>你点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>
        点击我
      </button>
    </div>
  );
}
```

## 自定义 Hooks

我们可以创建自定义 Hooks 来复用状态逻辑。

```javascript
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}
```

