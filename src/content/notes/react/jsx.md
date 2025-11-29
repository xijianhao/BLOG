---
title: JSX
notebook: react
date: 2024-11-29
tags: ['react', 'jsx', '基础']
excerpt: JSX 语法扩展、转换过程以及相关概念解析
order: 1
---

# JSX 是什么

JSX 是一个语法扩展。我们可以使用它来以声明式的方式编写 UI 结构。好处是它使代码更具可读性和可维护性。

## JSX 转换为真实 DOM 的过程

1. 编写 JSX 模板后，会调用 babel 插件将其转换为 `React.createElement` 调用来创建 React 元素。

2. React 元素是一个轻量级的 JS 对象，主要描述要渲染的类型、属性和子元素。

3. 当我们将 React 元素传递给 `root.render` 时，React 启动协调过程（Reconciliation），递归执行组件，并将所有 React 元素形成 Fiber 树。

4. 如果状态发生变化，React 会生成一个新的 Fiber 树，并与旧树进行比较。这个比较过程依赖于 diff 算法来找到需要更新的部分。

5. 最后，在 Commit 阶段，React 批量更新真实 DOM。如果是首次渲染，会插入到容器中。如果是后续更新，只会修补变化的部分。

## 为什么文件中没有使用 react，但是也需要引入 react？

因为 JSX 本身需要被编译成 `react.createElement`。不过在 17 版本之后，如果不使用 hooks，只是简单的标签，也不一定需要。

## 为什么 react 组件要大写开头？

当编译成 `react.createElement` 时，小写字母会作为字符串传递，被当作 HTML 标签处理。如果 HTML 没有对应的标签，就会报错。

大写字母会作为变量传递，React 会识别为自定义组件，从而避免错误。

## react 为什么不能返回多个元素？

1. 因为 React 组件最终会被编译成一个 render 函数，而一个函数只能返回一个值。

2. 而且虚拟 DOM 是树形结构，只能有一个根节点，否则无法确定如何更新。

   ```javascript
   // 如果想返回多个元素，可以使用 `Fragment` 标签，或者返回一个数组
   ```

