---
title: 虚拟DOM
notebook: react
date: 2025-03-26
tags: ['react', '进阶', '概念']
excerpt:  深度解析虚拟DOM核心以及在React和Vue中的区。
order: 4
---

# 为什么需要虚拟DOM？

因为直接操作真实DOM 每次操作都会触发重排重绘，状态又分散在各个DOM节点上难以维护测试。假设大量的更新循环起来还会阻塞主线程。

# 什么是虚拟DOM

虚拟DOM就是一个用来描述真实DOM结构的JS对象，它包含真实DOM的type、props和children

``` javascript
// 真实DOM节点
<div id="app" class="container">
  <h1>标题</h1>
  <ul>
    <li>项目1</li>
  </ul>
</div>
// 对应的虚拟DOM对象
const vnode = {
  type: 'div',
  props: {
    id: 'app',
    className: 'container'
  },
  children: [
    {
      type: 'h1',
      props: {},
      children: '标题'
    },
    {
      type: 'ul',
      props: {},
      children: [
        {
          type: 'li',
          props: {},
          children: '项目1'
        }
      ]
    }
  ]
};
```

# 虚拟DOM的完整工作流程

## 整体架构
它有三大核心：
- 渲染器将vnode转换为真实DOM
- diff算法找出最小变更 
- patch批量更新DOM

``` javascript
class VDOMSystem {
  renderer(vnode, container) { } // 1. 渲染器 将vnode转换为真实DOM 
  diff(oldVNode, newVNode) { } // 2. 对比算法 找出最小变更
  patch(updates) { } //  3. 补丁更新 批量更新DOM
}
```
## 详细实现 简化版

``` javascript
// 虚拟DOM节点类
class VNode {
  constructor(tag, props, children) {
    this.tag = tag;
    this.props = props || {};
    this.children = children || [];
    this.key = props?.key; // 用于diff优化
    this.el = null; // 对应的真实DOM
  }
}

// 创建虚拟DOM的工厂函数
function h(tag, props, children) {
  // 处理children
  if (Array.isArray(children)) {
    children = children.map(child => {
      if (typeof child === 'string' || typeof child === 'number') {
        return h(null, null, String(child)); // 文本节点
      }
      return child;
    });
  }
  
  return new VNode(tag, props, children);
}

// 示例：创建虚拟DOM树
const vnode = h('div', { id: 'app' }, [
  h('h1', { class: 'title' }, 'Hello Virtual DOM'),
  h('ul', null, [
    h('li', { key: 1 }, 'Item 1'),
    h('li', { key: 2 }, 'Item 2'),
    h('li', { key: 3 }, 'Item 3')
  ])
]);
```


# Diff算法：虚拟DOM的灵魂

## React的Diff算法实现：

核心设计思想： React假设跨层级移动的操作很少，所以通过三个限制策略来实现O(n)复杂度的算法

1. 只比较同级节点：如果是不同层级的节点直接销毁重建。
2. 不同类型的组件直接替换：如果元素类型变了，整个子树都重新创建。
3. 列表使用key表示：通过key来识别哪些元素可以复用。




### 代码实现：
``` javascript
class ReactDiff {
  /**
   * 同级节点比较（O(n)复杂度）
   */
  diffChildren(oldChildren, newChildren, parentEl) {
    const oldMap = this.createKeyMap(oldChildren);
    const newMap = this.createKeyMap(newChildren);
    
    // 第一阶段：处理已存在的节点
    for (let i = 0; i < newChildren.length; i++) {
      const newChild = newChildren[i];
      const oldChild = oldMap.get(newChild.key);
      
      if (oldChild) {
        // 节点复用
        this.updateNode(oldChild, newChild);
        // 移动到正确位置
        if (oldChild.el !== parentEl.children[i]) {
          parentEl.insertBefore(oldChild.el, parentEl.children[i]);
        }
        oldMap.delete(newChild.key);
      } else {
        // 创建新节点
        this.createNode(newChild, parentEl, i);
      }
    }
    
    // 第二阶段：删除旧节点
    oldMap.forEach(oldChild => {
      parentEl.removeChild(oldChild.el);
    });
  }
  
  createKeyMap(children) {
    const map = new Map();
    children.forEach(child => {
      if (child.key) {
        map.set(child.key, child);
      }
    });
    return map;
  }
}
```

## Vue3的优化Diff
``` javascript
class VueDiff {
  /**
   * 双端比较算法
   * 从两端向中间比较，减少移动次数
   */
  patchKeyedChildren(oldChildren, newChildren, parentEl) {
    let oldStartIdx = 0;
    let oldEndIdx = oldChildren.length - 1;
    let newStartIdx = 0;
    let newEndIdx = newChildren.length - 1;
    
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 1. 头头比较
      if (this.sameVNode(oldChildren[oldStartIdx], newChildren[newStartIdx])) {
        this.patchVNode(oldChildren[oldStartIdx], newChildren[newStartIdx]);
        oldStartIdx++;
        newStartIdx++;
      }
      // 2. 尾尾比较
      else if (this.sameVNode(oldChildren[oldEndIdx], newChildren[newEndIdx])) {
        this.patchVNode(oldChildren[oldEndIdx], newChildren[newEndIdx]);
        oldEndIdx--;
        newEndIdx--;
      }
      // 3. 头尾比较
      else if (this.sameVNode(oldChildren[oldStartIdx], newChildren[newEndIdx])) {
        this.patchVNode(oldChildren[oldStartIdx], newChildren[newEndIdx]);
        // 移动节点到尾部
        parentEl.insertBefore(
          oldChildren[oldStartIdx].el,
          oldChildren[oldEndIdx].el.nextSibling
        );
        oldStartIdx++;
        newEndIdx--;
      }
      // 4. 尾头比较
      else if (this.sameVNode(oldChildren[oldEndIdx], newChildren[newStartIdx])) {
        this.patchVNode(oldChildren[oldEndIdx], newChildren[newStartIdx]);
        // 移动节点到头部
        parentEl.insertBefore(
          oldChildren[oldEndIdx].el,
          oldChildren[oldStartIdx].el
        );
        oldEndIdx--;
        newStartIdx++;
      }
      // 5. 基于key的查找
      else {
        const oldKeyMap = new Map();
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
          oldKeyMap.set(oldChildren[i].key, i);
        }
        
        const idxInOld = oldKeyMap.get(newChildren[newStartIdx].key);
        if (idxInOld) {
          // 移动已有节点
          this.patchVNode(oldChildren[idxInOld], newChildren[newStartIdx]);
          parentEl.insertBefore(
            oldChildren[idxInOld].el,
            oldChildren[oldStartIdx].el
          );
          oldChildren[idxInOld] = undefined; // 标记为已处理
        } else {
          // 创建新节点
          this.createEl(newChildren[newStartIdx], parentEl, oldChildren[oldStartIdx].el);
        }
        newStartIdx++;
      }
    }
    
    // 处理新增或删除
    if (newStartIdx <= newEndIdx) {
      // 添加新节点
      this.addVNodes(newChildren, newStartIdx, newEndIdx, parentEl);
    }
    if (oldStartIdx <= oldEndIdx) {
      // 删除旧节点
      this.removeVNodes(oldChildren, oldStartIdx, oldEndIdx);
    }
  }
}
```