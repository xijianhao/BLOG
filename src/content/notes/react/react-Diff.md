---
title: Diff算法
notebook: react
date: 2025-03-26
tags: ['react', '进阶', '概念']
excerpt: 解析React中的Diff算法核心概念
order: 5
---

# 核心思想

React中的Diff算法实现是：假设跨层级移动的操作很少，所以通过三个限制策略来实现O(n)复杂度的算法。

1. 只比较同级节点：如果是不同层级的节点直接销毁重建。
2. 不同类型的组件直接替换：如果元素类型变了，整个子树都重新创建。
3. 列表使用key表示：通过key来识别哪些元素可以复用。

# 对比流程

1. 比较根节点：首先比较根节点是否是同一类型，如果元素类型变了会直接销毁整颗树，创建新书
2. 递归比较自节点：React会比较每个节点的属性，如果属性的值发生变化，只更新值，而不是重新创建整个元素。
3. 列表比较：
  - 当比较两个子节点列表时，React会同时遍历两个列表，他们会先相同位置的节点，如果相同就服用，如果不同就结束这轮比较。
  - 然后React会拿出新列表的第一个节点，去旧列表中找有没有相同的key的节点，如果找到了就把这个旧节点移动到新列表的第一个位置，如果没找到就创新新的。
  - 这个过程会一直重复，直到处理完所有的心节点，最后把旧列表中剩下的节点都删除。


## 代码实现：
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

# React Fiber

React Fiber 没有改变 Diff 算法的核心比较逻辑，但彻底改变了算法的执行方式。

它把原来的同步递归遍历，改造成了基于`链表`、`可中断恢复`、`优先级驱动`的增量式比较。

这让 React 能够实现`时间切片`和`并发渲染`，从根本上改善了大型应用的响应性能。

## 核心改变
react15
``` javascript
// 同步递归，不可中断的Diff
function reconcileChildren(prevChildren, nextChildren) {
  // 🔴 关键：这是一个深度优先的递归调用栈
  function diffChild(prevChild, nextChild, index) {
    // 比较逻辑...
    if (hasChildren) {
      // 递归调用，一旦开始无法停止
      diffChild(prevChild.children, nextChild.children, 0);
    }
  }
  
  // 开始递归
  diffChild(prevChildren, nextChildren, 0);
  // 🚨 如果组件树很深，这里会长时间阻塞主线程
}
```

react16
``` javascript
// 基于链表的可中断遍历
function reconcileChildren(fiber, children) {
  // 🟢 关键：把树结构转成链表，支持增量处理
  let currentChild = fiber.alternate?.child;
  let newChild = children[0];
  let index = 0;
  
  // 不是递归，而是循环处理链表
  while (newChild !== undefined || currentChild !== null) {
    // 🔄 可以在这里暂停！
    if (shouldYield()) {
      // 保存当前进度，下次继续
      return { currentChild, newChild, index };
    }
    
    const newFiber = diffSingleElement(
      currentChild,
      newChild,
      lanes
    );
    
    // 处理下一个节点（链表遍历，不是递归）
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    
    prevSibling = newFiber;
    index++;
  }
}

```

待更新...