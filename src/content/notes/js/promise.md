---
title: Promise
notebook: js
date: 2025-05-11
tags: ['基础']
excerpt: 深入理解Promise
order: 3
---

# 概念

Promise是JS中用于处理异步操作的对象，它有三个状态、等待（pendieng）、成功（fulfilled）或失败(rejected)。
一旦状态确定，就不能在改变，并且可以通过.then获取成功结构，通过.catch捕获失败原因。

Promise就是为了以更线性、可组合、可预测的方式处理异步。


# 静态方法

### Promise.resolve(value)
- 将值转为resolved的Promise
- 如果value本身是Promise，则原样返回

### Promise.reject(reason)
- 返回一个rejected的PRomise

### Promise.all
- 并行执行多个Promise
- 全部成功 -> 返回结果数组；任一失败 ->  立即reject

### Promise.race
- 返回第一个完成 无论成功/失败的Promise结果

### Promise.allSettled
- 等待所有Promise完成（无论成功/失败）
- 返回每个Promise的状态和值

# 代码实现
``` javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = value => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = reason => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err; };

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === 'fulfilled') {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.state === 'rejected') {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }

      if (this.state === 'pending') {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });

    return promise2;
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (x === promise2) {
    return reject(new TypeError('Chaining cycle detected'));
  }

  let called = false;
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true;
          resolvePromise(promise2, y, resolve, reject);
        }, r => {
          if (called) return;
          called = true;
          reject(r);
        });
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

// 测试
new MyPromise((resolve) => {
  setTimeout(() => resolve(1), 100);
})
.then(v => v + 1)
.then(v => console.log(v)); // 2

```



