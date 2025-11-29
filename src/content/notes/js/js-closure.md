---
title: JavaScript 闭包详解
notebook: js
date: 2024-01-10
tags: ['javascript', '闭包', '基础']
excerpt: 深入理解 JavaScript 闭包的概念和应用
order: 1
---

# JavaScript 闭包详解

闭包是 JavaScript 中一个重要的概念，指的是函数可以访问其外部作用域的变量。

## 什么是闭包

闭包是指有权访问另一个函数作用域中变量的函数。

```javascript
function outerFunction(x) {
  // 外部函数的变量
  const outerVariable = x;
  
  // 内部函数（闭包）
  function innerFunction(y) {
    console.log(outerVariable + y);
  }
  
  return innerFunction;
}

const closure = outerFunction(10);
closure(5); // 输出: 15
```

## 闭包的应用

### 1. 数据私有化

```javascript
function createCounter() {
  let count = 0;
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
```

### 2. 函数工厂

```javascript
function multiplyBy(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = multiplyBy(2);
const triple = multiplyBy(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

