---
title: React 事件机制
notebook: react
date: 2025-11-30
tags: ['react', '基础', '概念']
excerpt: React核心设计之一 统一了不同浏览器的行为，提供了更好的性能和开发体验。
order: 2
---

# 什么是React事件机制？

React 没有直接使用原生的DOM事件，而是基于原生事件封装了一层自己的事件系统，通过`事件委托`和`合成事件`从而达到`统一不同浏览器的行为`和`减少原生监听器的数量，减少内存占用`的作用。

# 核心特点

事件委托：React不会在每个DOM元素直接绑定事件处理器，而是把所有的事件统一委托到root容器上。

合成事件：就是React封装的统一事件接口的对象，称之为SyntheticEvent（/sɪnˈθɛtɪk ɪˈvɛnt/）。

## 事件委托

两个核心的关键机制：`事件冒泡`子元素触发的事件会逐层向上传播到父元素 + `event.target的精准定位` 无论监听器绑在哪儿，event.target始终指向实际被点击的元素。


## 合成事件

合成事件（SyntheticEvent）是 React 为了统一浏览器差异、提升性能和可控性，对原生 DOM 事件进行封装的跨浏览器兼容事件对象，它通过事件委托在根容器统一监听，并在回调中动态提供标准化的事件接口。

``` javascript
// 简化版 SyntheticEvent 结构
class SyntheticEvent {
  constructor(reactName, reactEventType, nativeEvent, targetInst) {
    this.nativeEvent = nativeEvent; // 原生事件对象
    this.target = nativeEvent.target;
    this.currentTarget = null; // 动态设置
    this.type = reactEventType;
    this._dispatchInstances = targetInst; // 对应的 Fiber 实例
    // ...
  }

  preventDefault() {
    this.defaultPrevented = true;
    const nativeEvent = this.nativeEvent;
    if (nativeEvent.preventDefault) {
      nativeEvent.preventDefault();
    } else {
      nativeEvent.returnValue = false; // IE 兼容
    }
  }

  stopPropagation() {
    this.propagationStopped = true;
    const nativeEvent = this.nativeEvent;
    if (nativeEvent.stopPropagation) {
      nativeEvent.stopPropagation();
    } else {
      nativeEvent.cancelBubble = true; // IE
    }
  }
}
```


# 当用户点击时 如何找到对应的事件？

React 利用原生事件冒泡到 root 容器 → 通过 event.target 找到对应 DOM → 通过 DOM 上的内部属性找到 Fiber 节点 → 沿 Fiber 树向上遍历收集监听器 → 按冒泡顺序执行回调，并传入 SyntheticEvent。

## step1：用户点击，原生事件冒泡到root容器。

用户点击某个按钮，比如`<button onClick={hadnleClick}>`。
浏览器触发原生的click事件，并按DOM树向上冒泡。
由于React在应用根节点注册了统一的监听器
原生时间最终到达rootContainer，触发统一的入口函数 dispatchEvent

``` javascript
rootContainer.addEventListener('click', dispatchEvent, false);
```
## Step 2：通过 nativeEvent.target 找到对应的 Fiber 节点

react会在DOM节点挂在Fiber引用，当创建DOM节点时，React会把对应的Fiber实例挂到DOM上的一个内部属性。
``` javascript
// 伪代码：创建 DOM 时绑定 Fiber
const domElement = document.createElement('button');
domElement.__reactFiber$xyz123 = fiber; // 👈 关键映射！
```

然后react有一个工具函数`getClosestInstanceFromNode`，从`event.target`开始向上遍历DOM,知道找到带有这个内部属性的节点，并返回对应的Fiber实例。

```javascript
function getClosestInstanceFromNode(targetNode) {
  let node = targetNode;
  while (node !== null) {
    const fiber = getInstanceFromNode(node); // 读取 __reactFiber$...
    if (fiber !== null) return fiber;
    node = node.parentNode;
  }
  return null;
}
```

## Step3: 沿Fiber数向上遍历，收集所有匹配的事件监听器

有了这个targetFiber，但事件可能在父组件上定义。
接下来React开始模拟冒泡，遍历Fiber的return链。

从`targetFiber`开始，沿着`fiber.return`向上走到root。
检查每个fiber的props是否包含当前的事件类型，比如onClick。
如果有，就把`listener，fiber`加入队列。

```javascript
// 伪代码：收集监听器
const listeners = [];
let current = targetFiber;
while (current !== null) {
  const listener = current.memoizedProps?.onClick;
  if (listener) {
    listeners.unshift(listener); // 冒泡：子 -> 父，所以 unshift 保证顺序
  }
  current = current.return;
}
```

## Step4：最后依次执行监听器，传入SyntheticEvent
对收集到的每个监听器，react创建一个SyntheticEvent实例。
动态设置`currentTarget`为当前Fiber对应的Dom元素。
最后调用用户定义的回调函数。


``` text 
[用户点击 button]
        ↓
[浏览器原生 click 事件触发，并冒泡]
        ↓
[到达 React root 容器（如 #root）]
        ↓
[触发 React 统一监听器：dispatchEvent(click, nativeEvent)]
        ↓
[通过 nativeEvent.target 找到 DOM 元素]
        ↓
[从 DOM 元素读取 __reactFiber$... → 获取 targetFiber]
        ↓
[沿 Fiber 树向上遍历（targetFiber → parentFiber → ... → root）]
        ↓
[检查每个 Fiber 的 props，收集所有 onClick 回调]
        ↓
[按冒泡顺序（子 → 父）依次执行：
    - 创建 SyntheticEvent 实例
    - 设置 e.currentTarget = 当前 Fiber 对应的 DOM
    - 调用用户回调函数]
        ↓
[完成]

```

# 简化版源码实现
```javascript
// ========== 1. Fiber 节点结构（简化）==========
class Fiber {
  constructor(type, props, stateNode = null) {
    this.type = type;          // 'button', 'div' 等
    this.props = props;        // { onClick: fn }
    this.stateNode = stateNode; // 对应的 DOM 元素
    this.return = null;        // 指向父 Fiber
  }
}

// ========== 2. 将 Fiber 挂到 DOM 上（React 内部做法）==========
const internalKey = '__reactFiber$xyz123';

function createDOMElement(fiber) {
  const dom = document.createElement(fiber.type);
  dom[internalKey] = fiber;   // 👈 关键：DOM ↔ Fiber 映射
  fiber.stateNode = dom;
  return dom;
}

// ========== 3. 从 DOM 找到 Fiber ==========
function getFiberFromDOM(dom) {
  let node = dom;
  while (node) {
    if (node[internalKey]) return node[internalKey];
    node = node.parentNode;
  }
  return null;
}

// ========== 4. 合成事件（简化）==========
class SyntheticEvent {
  constructor(nativeEvent, currentTarget) {
    this.nativeEvent = nativeEvent;
    this.target = nativeEvent.target;
    this.currentTarget = currentTarget;
    this.type = nativeEvent.type;
  }

  preventDefault() {
    this.nativeEvent.preventDefault();
  }

  stopPropagation() {
    // 注意：这里只影响 React 冒泡模拟，不影响原生！
    this._stopReactPropagation = true;
  }
}

// ========== 5. 核心：事件分发 ==========
function dispatchEvent(nativeEvent) {
  // Step 1: 找到目标 Fiber
  const targetFiber = getFiberFromDOM(nativeEvent.target);
  if (!targetFiber) return;

  // Step 2: 收集冒泡路径上的所有监听器
  const listeners = [];
  let current = targetFiber;
  while (current) {
    const handler = current.props?.['on' + capitalize(nativeEvent.type)];
    if (handler) {
      listeners.unshift({ handler, fiber: current }); // unshift 保证子→父顺序
    }
    current = current.return;
  }

  // Step 3: 依次执行
  for (const { handler, fiber } of listeners) {
    const syntheticEvent = new SyntheticEvent(
      nativeEvent,
      fiber.stateNode // currentTarget = 当前组件的 DOM
    );
    handler(syntheticEvent);

    if (syntheticEvent._stopReactPropagation) break;
  }
}

// 工具函数
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== 6. 模拟使用 ==========
// 构建 Fiber 树
const buttonFiber = new Fiber('button', { onClick: (e) => console.log('Button clicked', e.currentTarget) });
const divFiber = new Fiber('div', { onClick: (e) => console.log('Div clicked', e.currentTarget) });
buttonFiber.return = divFiber;

// 创建 DOM
const buttonDOM = createDOMElement(buttonFiber);
const divDOM = createDOMElement(divFiber);
divDOM.appendChild(buttonDOM);
document.body.appendChild(divDOM);

// 在 root 上监听（React 17+ 行为）
divDOM.addEventListener('click', dispatchEvent); // 注意：这里用 divDOM 模拟 root

// ✅ 现在点击 button，会依次打印：
// Button clicked <button>
// Div clicked <div>
```

# React17+事件系统的重大变更

事件监听器挂载点从document改为react应用的根节点上了，避免多个React应用共存导致的事件冲突。