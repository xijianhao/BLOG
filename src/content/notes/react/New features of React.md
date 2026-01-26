---
title: React新特性
notebook: react
date: 2025-01-20
tags: ['react', '进阶', '新特性', 'react18', 'react19']
excerpt: 深入理解React 18和React 19的核心新特性，从原理层面剖析并发渲染、自动批处理、Suspense、Actions等机制
order: 10
---

# React 18 核心新特性

React 18 是 React 历史上最重要的更新之一，它引入了**并发渲染（Concurrent Rendering）**作为核心能力，彻底改变了 React 的渲染机制。

## 一、并发渲染（Concurrent Rendering）

### 1.1 核心概念

并发渲染是 React 18 的基石，它允许 React 在渲染过程中**中断、暂停和恢复工作**，从而让高优先级的更新能够打断低优先级的更新。

**关键转变**：
- **React 17 及之前**：同步渲染，一旦开始更新就必须完成整个树
- **React 18**：并发渲染，可以中断渲染，让浏览器处理用户交互

### 1.2 工作原理

并发渲染基于 Fiber 架构和 Scheduler 调度器实现：

```typescript
// React 18 的并发渲染流程
function performConcurrentWorkOnRoot(root: FiberRoot) {
  // 1. 检查是否有更高优先级的更新
  if (shouldYield()) {
    // 让出主线程，让浏览器处理用户交互
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  
  // 2. 执行工作单元
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
  
  // 3. 如果还有工作，继续调度
  if (workInProgress !== null) {
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  
  // 4. 完成渲染，提交到 DOM
  commitRoot(root);
}
```

**时间切片（Time Slicing）**：
- React 将渲染工作拆分成小的单元
- 每个单元执行后检查是否还有时间（通过 `shouldYield()`）
- 如果没有时间，让出主线程，等待下次调度

### 1.3 优先级机制（Lane 模型）

React 18 使用 **Lane 模型**（车道模型）来管理优先级，替代了 React 17 的 expirationTime：

```typescript
// Lane 优先级定义（31位二进制）
const SyncLane = 0b0000000000000000000000000000001;        // 同步，最高优先级
const InputContinuousLane = 0b0000000000000000000000000000100; // 连续输入（滚动、拖拽）
const DefaultLane = 0b0000000000000000000000000010000;     // 默认优先级
const TransitionLane = 0b0000000000000000000000100000000; // 过渡更新
const IdleLane = 0b0100000000000000000000000000000;        // 空闲优先级

// 优先级调度
function scheduleUpdate(fiber: Fiber, lane: Lane) {
  // 标记更新到 fiber
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  
  // 根据优先级决定同步还是并发执行
  if (lane === SyncLane) {
    performSyncWorkOnRoot(root); // 同步执行
  } else {
    ensureRootIsScheduled(root); // 并发执行，可中断
  }
}
```

**优先级规则**：
- **用户交互**（点击、输入）：最高优先级，立即响应
- **数据更新**：默认优先级，可中断
- **过渡更新**（Transition）：低优先级，可被打断
- **后台任务**：空闲优先级，最后执行

### 1.4 并发特性的优势

1. **保持 UI 响应性**：高优先级更新可以打断低优先级渲染
2. **更好的用户体验**：用户交互不会被长时间渲染阻塞
3. **渐进式渲染**：可以逐步显示内容，而不是等待全部完成

## 二、自动批处理（Automatic Batching）

### 2.1 什么是批处理

批处理是指 React 将多个状态更新合并成一次重新渲染，减少不必要的渲染次数。

### 2.2 React 17 vs React 18

**React 17**：只在事件处理器中批处理

```javascript
// React 17：会触发 2 次渲染
function handleClick() {
  setCount(c => c + 1);  // 渲染 1
  setFlag(f => !f);      // 渲染 2
}

// React 17：不会批处理（Promise、setTimeout 等）
fetch('/api').then(() => {
  setCount(c => c + 1);  // 渲染 1
  setFlag(f => !f);      // 渲染 2
});
```

**React 18**：自动批处理所有更新

```javascript
// React 18：所有场景都批处理，只触发 1 次渲染
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只渲染一次
}

fetch('/api').then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只渲染一次（React 18 新特性）
});

setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只渲染一次（React 18 新特性）
}, 1000);
```

### 2.3 实现原理

React 18 通过**更新队列（Update Queue）**和**批处理标记**实现：

```typescript
// 更新队列结构
interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null;  // 待处理的更新链表
  };
}

// 批处理逻辑
function scheduleUpdate(fiber: Fiber, update: Update) {
  // 1. 将更新加入队列
  enqueueUpdate(fiber, update);
  
  // 2. 检查是否在批处理中
  if (isBatchingUpdates) {
    // 在批处理中，只标记，不立即调度
    return;
  }
  
  // 3. 不在批处理中，立即调度
  ensureRootIsScheduled(root);
}

// React 18 的批处理范围更广
function flushSync(fn) {
  // 退出批处理模式
  const previousIsBatchingUpdates = isBatchingUpdates;
  isBatchingUpdates = false;
  
  try {
    fn(); // 执行函数，可能触发多个更新
  } finally {
    isBatchingUpdates = previousIsBatchingUpdates;
    // 统一调度一次渲染
    ensureRootIsScheduled(root);
  }
}
```

### 2.4 如何退出批处理

如果需要立即更新，可以使用 `flushSync`：

```javascript
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1);  // 立即渲染
  });
  setFlag(f => !f);        // 立即渲染（不在批处理中）
}
```

## 三、Suspense 改进

### 3.1 Suspense 的作用

Suspense 允许组件在等待某些条件（如数据加载）时"暂停"渲染，显示 fallback UI。

### 3.2 React 18 的改进

**React 17**：Suspense 只支持 `React.lazy` 代码分割

**React 18**：Suspense 支持**任意异步操作**（数据获取、资源加载等）

```javascript
// React 18：支持数据获取的 Suspense
function UserProfile({ userId }) {
  // 使用支持 Suspense 的数据获取库（如 Relay、SWR）
  const user = useSuspenseQuery(userQuery, { userId });
  
  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userId={1} />
    </Suspense>
  );
}
```

### 3.3 并发 Suspense 的工作原理

```typescript
// Suspense 的实现原理
function beginWork(current: Fiber | null, workInProgress: Fiber) {
  if (workInProgress.tag === SuspenseComponent) {
    const nextChildren = workInProgress.pendingProps.children;
    
    // 检查是否有待处理的 Promise
    const suspenseState = workInProgress.memoizedState;
    if (suspenseState !== null) {
      // 有 Promise 未完成，显示 fallback
      return mountSuspenseFallbackChildren(workInProgress);
    }
    
    // Promise 已完成，渲染实际内容
    return mountSuspensePrimaryChildren(workInProgress, nextChildren);
  }
}

// 当 Promise resolve 时，重新调度渲染
function resolveSuspensePromise(promise: Promise<any>) {
  // 标记 Suspense 边界需要更新
  const suspenseBoundary = findSuspenseBoundary(promise);
  scheduleUpdateOnFiber(suspenseBoundary, DefaultLane);
}
```

### 3.4 嵌套 Suspense 边界

React 18 支持嵌套的 Suspense 边界，每个边界独立处理：

```javascript
function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Header />
      <Suspense fallback={<ArticleSkeleton />}>
        <Article />
      </Suspense>
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments />
      </Suspense>
    </Suspense>
  );
}
```

## 四、useTransition 和 useDeferredValue

### 4.1 useTransition

`useTransition` 用于标记**非紧急更新**，让 React 知道这些更新可以被打断。

```javascript
function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);
  
  function handleSearch(newQuery) {
    // 紧急更新：立即更新输入框
    setQuery(newQuery);
    
    // 非紧急更新：标记为过渡更新
    startTransition(() => {
      setResults(expensiveSearch(newQuery));
    });
  }
  
  return (
    <>
      {isPending && <Spinner />}
      <ResultsList results={results} />
    </>
  );
}
```

**工作原理**：

```typescript
function useTransition(): [boolean, (fn: () => void) => void] {
  const [isPending, setIsPending] = useState(false);
  
  const startTransition = useCallback((callback: () => void) => {
    setIsPending(true);
    
    // 使用低优先级调度
    scheduleCallback(
      NormalPriority,
      () => {
        callback(); // 执行更新
        setIsPending(false);
      }
    );
  }, []);
  
  return [isPending, startTransition];
}
```

**关键点**：
- 过渡更新使用**低优先级**（TransitionLane）
- 可以被高优先级更新（如用户输入）打断
- `isPending` 表示过渡更新是否在进行中

### 4.2 useDeferredValue

`useDeferredValue` 用于**延迟更新值**，保持旧值显示直到新值准备好。

```javascript
function ProductList({ searchTerm }) {
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  // 使用延迟的值进行搜索
  const results = useMemo(
    () => expensiveSearch(deferredSearchTerm),
    [deferredSearchTerm]
  );
  
  return (
    <>
      <SearchInput value={searchTerm} /> {/* 立即更新 */}
      <ResultsList results={results} /> {/* 延迟更新 */}
    </>
  );
}
```

**工作原理**：

```typescript
function useDeferredValue<T>(value: T): T {
  const [deferredValue, setDeferredValue] = useState(value);
  
  useEffect(() => {
    // 使用低优先级更新
    startTransition(() => {
      setDeferredValue(value);
    });
  }, [value]);
  
  return deferredValue;
}
```

**使用场景**：
- 搜索输入：输入框立即更新，结果列表延迟更新
- 图表渲染：简单数据立即显示，复杂计算延迟
- 列表过滤：过滤条件立即更新，列表延迟更新

## 五、新的 Root API

### 5.1 createRoot vs render

**React 17**：
```javascript
import { render } from 'react-dom';

const container = document.getElementById('root');
render(<App />, container);
```

**React 18**：
```javascript
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
```

### 5.2 为什么需要新的 API

1. **启用并发特性**：只有使用 `createRoot` 才能使用并发渲染
2. **更清晰的 API**：Root 对象封装了渲染逻辑
3. **更好的类型支持**：TypeScript 类型更准确

### 5.3 实现差异

```typescript
// React 17：同步渲染
function render(element: ReactElement, container: Container) {
  const root = getRoot(container);
  updateContainer(element, root, null, null); // 同步执行
}

// React 18：支持并发渲染
function createRoot(container: Container): Root {
  const root = createFiberRoot(container, true); // 启用并发模式
  return {
    render(children: ReactNode) {
      updateContainer(children, root, null, null); // 可能并发执行
    },
    unmount() {
      // 卸载逻辑
    }
  };
}
```

## 六、其他重要 Hook

### 6.1 useId

`useId` 用于生成**唯一的 ID**，主要用于服务端渲染（SSR）场景。

```javascript
function Checkbox() {
  const id = useId(); // 生成唯一 ID
  
  return (
    <>
      <input id={id} type="checkbox" />
      <label htmlFor={id}>Check me</label>
    </>
  );
}
```

**为什么需要 useId**：
- SSR 时，服务端和客户端需要生成相同的 ID
- 避免多个组件实例产生冲突
- 不依赖全局计数器，支持并发渲染

### 6.2 useSyncExternalStore

`useSyncExternalStore` 用于订阅外部数据源（如 Redux、Zustand），确保在并发渲染时数据一致性。

```javascript
function useStore(selector) {
  return useSyncExternalStore(
    store.subscribe,        // 订阅函数
    () => selector(store.getState()), // 获取快照
    () => selector(store.getState())  // SSR 时的快照
  );
}
```

**解决的问题**：
- **撕裂（Tearing）**：并发渲染时，不同组件可能看到不同的状态
- **一致性保证**：确保同一渲染周期内，所有组件看到相同的状态

### 6.3 useInsertionEffect

`useInsertionEffect` 用于**动态插入样式**，在 DOM 更新前执行。

```javascript
function useCSS(rule) {
  useInsertionEffect(() => {
    const style = document.createElement('style');
    style.textContent = rule;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  });
}
```

**执行时机**：
- 在 DOM 变更**之前**执行（比 `useLayoutEffect` 更早）
- 确保样式在 DOM 更新前就准备好
- 主要用于 CSS-in-JS 库（如 styled-components）

---

# React 19 核心新特性

React 19 进一步优化了开发体验和性能，引入了 Actions、改进的 Suspense、资源加载优化等特性。

## 一、Actions（服务器和客户端）

### 1.1 什么是 Actions

Actions 是 React 19 引入的新概念，用于处理**异步操作**（如表单提交、数据变更），统一了客户端和服务端的异步处理方式。

### 1.2 客户端 Actions

```javascript
'use client';

function UpdateName({ name, onUpdate }) {
  const [isPending, startTransition] = useTransition();
  
  async function updateName(formData) {
    const newName = formData.get('name');
    await fetch('/api/name', {
      method: 'POST',
      body: JSON.stringify({ name: newName })
    });
    onUpdate(newName);
  }
  
  return (
    <form action={updateName}>
      <input name="name" defaultValue={name} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </button>
    </form>
  );
}
```

### 1.3 服务端 Actions

```javascript
// app/actions.js
'use server';

export async function updateName(formData) {
  const name = formData.get('name');
  // 服务端验证和处理
  await db.user.update({ name });
  revalidatePath('/profile');
}
```

```javascript
// app/profile.js
import { updateName } from './actions';

export default function Profile() {
  return (
    <form action={updateName}>
      <input name="name" />
      <button type="submit">Update</button>
    </form>
  );
}
```

### 1.4 Actions 的优势

1. **类型安全**：TypeScript 支持良好
2. **自动处理状态**：`useFormStatus` 自动提供 pending 状态
3. **错误处理**：统一的错误处理机制
4. **渐进增强**：即使 JavaScript 未加载，表单也能工作

## 二、useFormStatus 和 useFormState

### 2.1 useFormStatus

`useFormStatus` 用于获取**当前表单的提交状态**，必须在 `<form>` 的子组件中使用。

```javascript
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

function Form() {
  return (
    <form action={submitAction}>
      <input name="name" />
      <SubmitButton />
    </form>
  );
}
```

**工作原理**：

```typescript
function useFormStatus() {
  const formContext = useContext(FormStatusContext);
  if (!formContext) {
    throw new Error('useFormStatus must be used within a form');
  }
  return formContext; // { pending, data, method, action }
}
```

### 2.2 useFormState

`useFormState` 用于管理**表单状态**，结合 Actions 使用。

```javascript
async function increment(prevState, formData) {
  return prevState + 1;
}

function Counter() {
  const [state, formAction, isPending] = useFormState(increment, 0);
  
  return (
    <form>
      <span>Count: {state}</span>
      <button formAction={formAction} disabled={isPending}>
        Increment
      </button>
    </form>
  );
}
```

## 三、useOptimistic

`useOptimistic` 用于实现**乐观更新**，在操作完成前就更新 UI，提升用户体验。

```javascript
function MessageList({ messages }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { ...newMessage, sending: true }]
  );
  
  async function sendMessage(formData) {
    const message = { text: formData.get('text') };
    
    // 乐观更新：立即显示消息
    addOptimisticMessage(message);
    
    // 实际发送
    await sendMessageToServer(message);
  }
  
  return (
    <>
      {optimisticMessages.map(msg => (
        <div key={msg.id}>
          {msg.text}
          {msg.sending && <span>Sending...</span>}
        </div>
      ))}
      <form action={sendMessage}>
        <input name="text" />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
```

**工作原理**：

```typescript
function useOptimistic<T>(
  state: T,
  updateFn: (currentState: T, optimisticValue: any) => T
): [T, (optimisticValue: any) => void] {
  const [optimisticState, setOptimisticState] = useState(state);
  
  const addOptimistic = useCallback((value: any) => {
    setOptimisticState(current => updateFn(current, value));
  }, [updateFn]);
  
  // 当实际状态更新时，同步乐观状态
  useEffect(() => {
    setOptimisticState(state);
  }, [state]);
  
  return [optimisticState, addOptimistic];
}
```

## 四、改进的 Suspense

### 4.1 支持异步组件

React 19 允许组件本身就是异步的：

```javascript
// 异步组件
async function UserProfile({ userId }) {
  const user = await fetchUser(userId);
  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile userId={1} />
    </Suspense>
  );
}
```

### 4.2 更好的错误处理

```javascript
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Suspense fallback={<Loading />}>
        <UserProfile userId={1} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## 五、资源加载优化

### 5.1 文档元数据支持

React 19 允许在组件中直接设置文档元数据：

```javascript
function BlogPost({ post }) {
  return (
    <>
      <title>{post.title}</title>
      <meta name="description" content={post.excerpt} />
      <article>{post.content}</article>
    </>
  );
}
```

### 5.2 资源预加载

React 19 自动处理资源预加载，优化性能：

```javascript
function Image({ src, alt }) {
  return <img src={src} alt={alt} />;
  // React 19 会自动预加载图片
}
```

## 六、编译器优化

React 19 引入了**React Compiler**（可选），自动优化组件：

1. **自动 memo**：自动添加 `React.memo`、`useMemo`、`useCallback`
2. **减少重新渲染**：编译器分析依赖，只更新必要的组件
3. **简化代码**：开发者不需要手动优化

```javascript
// 开发者编写的代码
function Component({ a, b }) {
  const c = a + b;
  return <div>{c}</div>;
}

// React Compiler 自动优化为
function Component({ a, b }) {
  const c = useMemo(() => a + b, [a, b]);
  return <div>{c}</div>;
}
```

---

# 总结

## React 18 的核心价值

1. **并发渲染**：让 React 能够中断渲染，保持 UI 响应性
2. **自动批处理**：减少不必要的渲染，提升性能
3. **Suspense 增强**：支持数据获取，更好的加载体验
4. **新的 Hooks**：`useTransition`、`useDeferredValue` 等，更好的并发控制

## React 19 的核心价值

1. **Actions**：统一客户端和服务端的异步处理
2. **表单增强**：`useFormStatus`、`useFormState` 简化表单处理
3. **乐观更新**：`useOptimistic` 提升用户体验
4. **编译器优化**：自动优化，减少手动优化工作

## 从原理角度理解

这些新特性的核心思想是：

1. **可中断性**：通过 Fiber 架构和 Scheduler，实现可中断的渲染
2. **优先级调度**：通过 Lane 模型，根据更新来源分配优先级
3. **渐进式渲染**：逐步显示内容，而不是等待全部完成
4. **用户体验优先**：高优先级更新（用户交互）总是优先处理

这些改进让 React 能够更好地处理复杂应用，保持 UI 流畅，提升用户体验。

