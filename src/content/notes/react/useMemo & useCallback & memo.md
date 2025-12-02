---
title: useMemo & useCallback & memo
notebook: react
date: 2025-03-28
tags: ['react', '基础', 'hooks']
excerpt: React常用的缓存技巧
order: 8
---
# 概念

**useMemo 缓存计算结果**

它用于缓存 复杂计算的值，通过依赖项数组的变化来决定是否需要 重新计算

**useCallback 缓存函数引用**

它用于缓存函数本身，依赖项变化的时候才重新创建函数，可以配合React.memo为子组件提供稳定的回掉函数

**React.memo  缓存组件渲染结果**

它用于缓存组件，当props未改变时跳过渲染

# 示例

- useCallback 解决的是 函数引用 的稳定性问题

- useMemo 解决的是 值计算 的性能问题

- React.memo 解决的是 组件渲染 的性能问题

``` javascript
// 典型的优化组合
const Parent = () => {
  const [data, setData] = useState([]);
  
  // 1. useMemo 缓存计算结果
  const processedData = useMemo(() => 
    processData(data), 
    [data]
  );
  
  // 2. useCallback 缓存函数
  const handleUpdate = useCallback((id) => {
    updateItem(id);
  }, []);
  
  // 3. React.memo 包装的组件
  return <Child data={processedData} onUpdate={handleUpdate} />;
};

const Child = React.memo(({ data, onUpdate }) => {
  // 只有当 data 或 onUpdate 引用改变时才重新渲染
});
```

# 使用时机

**应该使用 useMemo 的情况：**
- 计算成本高的值（比如排序、过滤、转换大数据集）

- 创建的对象/数组作为其他 Hook 的依赖项

**应该使用 useCallback 的情况：**
- 函数作为 props 传递给记忆化组件（React.memo）

- 函数作为其他 Hook 的依赖项

- 事件处理函数在效果依赖数组中

**应该使用 React.memo 的情况：**
- 纯函数组件，渲染成本较高

- 组件经常使用相同的 props 重新渲染

- 作为性能优化的一部分（配合 useCallback）

