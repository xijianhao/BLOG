---
title:  ES6
notebook: js
date: 2024-05-12
tags: ['基础']
excerpt: 巩固ES6常用知识点
order: 2
---

# let / const
作用：解决 var 的变量提升、作用域混乱问题。
**关键点：**
- 块级作用域（{} 内）
- 不存在变量提升（TDZ：暂时性死区）
- const 声明的是引用不可变，不是值不可变（对对象/数组仍可修改内部属性）

# 箭头函数
- 没有自己的 this，继承外层作用域的 this
- 不能作为构造函数（无 prototype）
- 无 arguments，可用 rest 参数替代

# 模板字符串
- 使用反引号 `Hello ${name}`
- 支持多行、表达式插值、标签模板（高级用法）

# 解构赋值
- 通过...可以对数组或者对象进行结构

# 默认参数&剩余参数
```javascript
function foo(a = 1, b = 2) { ... }

function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // numbers = [1,2,3]
```

# Promise
- 解决回调地狱（Callback Hell）
- 三种状态：pending → fulfilled / rejected
- 链式调用 .then().catch()
- 静态方法：Promise.all, Promise.race, Promise.resolve/reject

# 模块化（import/export）
- ES6 原生模块（静态分析，编译时确定依赖）
- 与 CommonJS（Node.js）区别：值拷贝 vs 引用绑定

# Class类
- 本质仍是基于原型的语法糖
- 支持 constructor、static 方法、继承（extends + super）

# Set/Map
- Set：唯一值集合（可去重）
- Map：键值对集合，key 可为任意类型（包括对象）

# Symbol 唯一标识符
- 创建唯一key，避免属性名冲突
- 常用于“私有”属性

# Generator/Iterator
- function* 生成器，可暂停/恢复执行
- 通过 yield 产出值
- 配合 for...of 使用

# Proxy/Reflect
- Proxy 拦截对象操作
- Reflect 提供与Proxy拦截方法对应的静态方法