---
title: 浏览器缓存机制
notebook: browser
date: 2024-12-20
tags: ['浏览器', '性能优化', 'HTTP']
excerpt: 深入解析浏览器缓存机制，涵盖强缓存、协商缓存、Cache-Control、ETag等核心概念及面试考察要点
order: 2
---

# 缓存概述

浏览器缓存是**提升性能、减少网络请求、降低服务器压力**的关键机制。通过将资源存储在本地，避免重复请求，显著提升用户体验。

## 缓存分类

- **强缓存**：不向服务器发送请求，直接使用本地缓存
- **协商缓存**：向服务器验证缓存是否有效，有效则使用缓存，无效则重新获取

# 强缓存（Strong Cache）

## 核心机制

强缓存阶段，浏览器**不会向服务器发送请求**，直接从本地缓存读取资源。

## 实现方式

### 1. Expires（HTTP/1.0）

**语法**：
```
Expires: Wed, 21 Oct 2025 07:28:00 GMT
```

**原理**：
- 指定资源的**绝对过期时间**
- 浏览器将当前时间与Expires比较，未过期则使用缓存

**问题**：
- **依赖客户端时间**：如果客户端时间不准确，缓存失效
- **HTTP/1.0标准**：已被Cache-Control替代

**面试要点**：
- 绝对时间，受客户端时钟影响
- 优先级低于Cache-Control

### 2. Cache-Control（HTTP/1.1，推荐）

**语法**：
```
Cache-Control: max-age=3600, public, must-revalidate
```

**常用指令**：

#### 可缓存性指令

- **public**：响应可被任何缓存区缓存（浏览器、CDN、代理服务器）
- **private**：响应只能被私有缓存缓存（浏览器），不允许CDN等中间缓存
- **no-cache**：**必须向服务器验证**缓存是否有效，不能直接使用
- **no-store**：**禁止缓存**，每次请求都从服务器获取
- **only-if-cached**：只使用缓存，如果缓存不存在返回504

#### 过期时间指令

- **max-age=seconds**：**相对时间**，资源在指定秒数后过期
  - 例如：`max-age=3600` 表示1小时后过期
- **s-maxage=seconds**：仅用于共享缓存（CDN），优先级高于max-age
- **max-stale=seconds**：客户端可以接受过期的资源，但过期时间不超过指定秒数
- **min-fresh=seconds**：资源必须至少在指定秒数内保持新鲜

#### 重新验证指令

- **must-revalidate**：缓存过期后，**必须向服务器验证**，不能使用过期缓存
- **proxy-revalidate**：仅用于共享缓存，必须重新验证

#### 其他指令

- **immutable**：资源永不变更，浏览器可以永久缓存
- **stale-while-revalidate**：允许使用过期缓存，同时在后台重新验证
- **stale-if-error**：如果重新验证失败，允许使用过期缓存

### Cache-Control组合示例

```http
# 长期缓存静态资源
Cache-Control: public, max-age=31536000, immutable

# 需要验证的缓存
Cache-Control: public, max-age=3600, must-revalidate

# 禁止缓存
Cache-Control: no-store, no-cache, must-revalidate

# 私有缓存，短期有效
Cache-Control: private, max-age=600
```

### 面试要点

- **max-age是相对时间**，不受客户端时钟影响，优于Expires
- **no-cache不是不缓存**，而是必须验证
- **no-store才是真正不缓存**
- **public vs private**：public允许CDN缓存，private只允许浏览器缓存

## 强缓存流程

```
浏览器请求资源
    ↓
检查本地缓存
    ↓
有缓存？
    ├─ 是 → 检查是否过期（Expires/Cache-Control）
    │       ├─ 未过期 → 直接使用缓存（200 from cache）
    │       └─ 已过期 → 进入协商缓存流程
    └─ 否 → 向服务器请求
```

## 浏览器表现

- **Chrome DevTools**：`200 (from disk cache)` 或 `200 (from memory cache)`
- **Network面板**：Size列显示 `(disk cache)` 或 `(memory cache)`
- **请求头**：不会发送请求到服务器



# 协商缓存（Conditional Cache）

## 核心机制

协商缓存阶段，浏览器**会向服务器发送请求**，但请求头包含缓存验证信息。服务器根据验证信息判断缓存是否有效。

## 实现方式

### 1. Last-Modified / If-Modified-Since

**原理**：
- 服务器响应头：`Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT`
- 客户端请求头：`If-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT`
- 服务器比较时间，未修改返回304，修改返回200和新资源

**流程**：
```
首次请求：
  服务器 → Last-Modified: date1
  浏览器 → 缓存资源 + Last-Modified

再次请求：
  浏览器 → If-Modified-Since: date1
  服务器 → 比较 date1 和资源修改时间
    ├─ 未修改 → 304 Not Modified（无响应体）
    └─ 已修改 → 200 OK（新资源）
```

**问题**：
- **精度问题**：只能精确到秒，1秒内多次修改无法检测
- **文件内容未变但时间变了**：touch文件会改变修改时间
- **分布式服务器时间不一致**：可能导致缓存失效

### 2. ETag / If-None-Match（推荐）

**原理**：
- 服务器响应头：`ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"`
- 客户端请求头：`If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"`
- 服务器比较ETag，匹配返回304，不匹配返回200和新资源

**ETag生成方式**：
- **强ETag**：资源内容完全相同时ETag相同（推荐）
- **弱ETag**：`W/"33a64df5"`，允许语义相同但字节不同

**流程**：
```
首次请求：
  服务器 → ETag: "hash1"
  浏览器 → 缓存资源 + ETag

再次请求：
  浏览器 → If-None-Match: "hash1"
  服务器 → 计算资源ETag并比较
    ├─ 匹配 → 304 Not Modified（无响应体）
    └─ 不匹配 → 200 OK（新资源）
```

**优势**：
- **精确**：基于内容哈希，内容不变ETag不变
- **不受时间影响**：不依赖文件修改时间
- **分布式友好**：只要内容相同，ETag就相同

### 面试要点

- **ETag优先级高于Last-Modified**：两者同时存在时，ETag优先
- **ETag计算有性能开销**：大文件需要计算哈希
- **Last-Modified精度问题**：只能精确到秒
- **304响应体为空**：节省带宽

## 协商缓存流程

```
强缓存已过期
    ↓
浏览器发送请求
    ↓
请求头包含验证信息
  - If-Modified-Since: date
  - If-None-Match: "etag"
    ↓
服务器验证
    ↓
缓存有效？
    ├─ 是 → 304 Not Modified（无响应体）
    └─ 否 → 200 OK（新资源 + 新的Last-Modified/ETag）
```

## 浏览器表现

- **Chrome DevTools**：`304 Not Modified`
- **Network面板**：Size列显示很小（只有响应头）
- **请求头**：包含 `If-Modified-Since` 或 `If-None-Match`
- **响应头**：`304 Not Modified`，无响应体

# 完整缓存流程

```
浏览器请求资源
    ↓
检查本地缓存
    ↓
有缓存？
    ├─ 否 → 向服务器请求 → 200 OK → 缓存资源
    └─ 是 → 检查强缓存（Expires/Cache-Control）
            ├─ 未过期 → 200 (from cache) ✅
            └─ 已过期 → 发送请求（带If-Modified-Since/If-None-Match）
                        ├─ 304 Not Modified → 使用缓存 ✅
                        └─ 200 OK → 更新缓存 ✅
```

# 缓存位置（Cache Storage）

## 1. Service Worker Cache

- **优先级最高**：Service Worker拦截请求
- **可控性强**：完全由代码控制
- **持久化**：即使关闭浏览器也保留

## 2. Memory Cache（内存缓存）

- **速度快**：内存读取
- **生命周期短**：关闭标签页即清除
- **容量小**：受内存限制
- **常见资源**：当前页面引用的CSS、JS、图片

## 3. Disk Cache（磁盘缓存）

- **容量大**：受磁盘空间限制
- **持久化**：关闭浏览器也保留
- **速度较慢**：磁盘I/O
- **常见资源**：大文件、跨页面资源

## 4. Push Cache（HTTP/2 Server Push）

- **HTTP/2特性**：服务器主动推送
- **生命周期短**：HTTP/2连接关闭即清除
- **优先级最低**：其他缓存都没有时才使用

### 缓存优先级

```
Service Worker Cache > Memory Cache > Disk Cache > Push Cache
```

### 面试要点

- **Memory Cache vs Disk Cache**：内存快但易失，磁盘慢但持久
- **Service Worker**：可以完全控制缓存策略
- **HTTP/2 Server Push**：服务器主动推送资源到缓存

# Cache-Control 详细解析

## 请求头 Cache-Control

客户端可以在请求头中发送Cache-Control指令，影响服务器响应：

- **max-age=0**：强制重新验证
- **max-stale**：允许使用过期缓存
- **min-fresh**：要求资源保持新鲜
- **no-cache**：强制重新验证
- **no-store**：禁止缓存响应
- **only-if-cached**：只使用缓存

## 响应头 Cache-Control

服务器在响应头中设置Cache-Control，控制缓存行为。

## 常见配置策略

### 1. 静态资源（长期缓存）

```http
Cache-Control: public, max-age=31536000, immutable
```

- **public**：允许CDN缓存
- **max-age=31536000**：1年（31536000秒）
- **immutable**：资源永不变更
- **文件名带hash**：`app.abc123.js`，内容变更文件名也变

### 2. HTML文件（不缓存或短期缓存）

```http
Cache-Control: no-cache, must-revalidate
# 或
Cache-Control: public, max-age=0, must-revalidate
```

- HTML是入口文件，需要及时更新
- 使用协商缓存确保获取最新版本

### 3. API响应（根据业务需求）

```http
# 需要实时数据
Cache-Control: no-store

# 可以缓存但需要验证
Cache-Control: private, max-age=60, must-revalidate

# 可以缓存
Cache-Control: private, max-age=300
```

### 4. 用户私有数据

```http
Cache-Control: private, max-age=3600
```

- **private**：不允许CDN等中间缓存
- 只允许浏览器缓存

# 缓存最佳实践

## 1. 资源分类策略

| 资源类型 | Cache-Control | 文件名策略 | 说明 |
|---------|--------------|-----------|------|
| HTML | `no-cache` | 不带hash | 需要及时更新 |
| CSS/JS | `max-age=31536000, immutable` | 带hash | 长期缓存 |
| 图片 | `max-age=2592000` | 带hash或版本号 | 中期缓存 |
| 字体 | `max-age=31536000, immutable` | 带hash | 长期缓存 |
| API | `private, max-age=60` | - | 根据业务需求 |

## 2. 文件名Hash策略

```javascript
// webpack配置示例
output: {
  filename: '[name].[contenthash:8].js',
  chunkFilename: '[name].[contenthash:8].chunk.js'
}
```

- **contenthash**：基于文件内容，内容不变hash不变
- **长期缓存**：文件名带hash，内容变更文件名也变，可以设置长期缓存

## 3. 版本号策略

```html
<link rel="stylesheet" href="app.css?v=1.2.3">
<script src="app.js?v=1.2.3"></script>
```

- 更新版本号强制刷新缓存
- 不如hash策略精确

## 4. 缓存更新策略

### 方案一：Hash文件名（推荐）

```
app.abc123.js → 更新 → app.def456.js
```

- 内容变更，文件名变更，自动更新
- 可以设置长期缓存

### 方案二：版本号

```
app.js?v=1.0.0 → 更新 → app.js?v=1.0.1
```

- 需要手动更新版本号
- 不如hash精确

### 方案三：Cache-Control控制

```
Cache-Control: max-age=3600, must-revalidate
```

- 1小时后过期，必须重新验证
- 适合需要定期更新的资源

## 5. 避免缓存问题

### 问题：更新后用户仍看到旧版本

**原因**：
- 强缓存未过期
- 文件名未变更
- CDN缓存未更新

**解决方案**：
1. **文件名带hash**：内容变更文件名也变
2. **CDN缓存刷新**：更新后刷新CDN缓存
3. **版本号更新**：手动更新版本号
4. **Cache-Control调整**：缩短缓存时间或使用must-revalidate

### 问题：频繁请求，缓存未生效

**原因**：
- Cache-Control设置不当
- 请求头包含no-cache
- 资源被标记为no-store

**解决方案**：
1. **检查Cache-Control**：确保设置了合适的缓存策略
2. **检查请求头**：避免不必要的no-cache
3. **使用长期缓存**：静态资源设置长期缓存

# Service Worker缓存

## 概述

Service Worker可以**完全控制**网络请求和缓存策略，实现更灵活的缓存方案。

## 缓存策略

### 1. Cache First（缓存优先）

```javascript
// 优先使用缓存，缓存不存在再请求网络
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

**适用场景**：静态资源

### 2. Network First（网络优先）

```javascript
// 优先请求网络，失败再使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
```

**适用场景**：需要实时数据的API

### 3. Stale-While-Revalidate（后台更新）

```javascript
// 使用缓存，同时在后台更新
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open('cache-v1').then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});
```

**适用场景**：平衡速度和 freshness

### 4. Network Only（仅网络）

```javascript
// 只使用网络，不使用缓存
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
```

### 5. Cache Only（仅缓存）

```javascript
// 只使用缓存，不请求网络
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request));
});
```

## 面试要点

- **完全控制**：Service Worker可以拦截所有请求
- **离线支持**：可以实现离线访问
- **灵活策略**：可以根据资源类型选择不同策略
- **更新机制**：需要处理Service Worker更新和缓存版本管理

# 缓存相关HTTP头总结

## 响应头（服务器 → 客户端）

| 响应头 | 说明 | 优先级 |
|--------|------|--------|
| Cache-Control | HTTP/1.1，推荐使用 | 高 |
| Expires | HTTP/1.0，绝对时间 | 低（被Cache-Control覆盖） |
| ETag | 内容哈希，用于协商缓存 | 高（优于Last-Modified） |
| Last-Modified | 修改时间，用于协商缓存 | 低 |

## 请求头（客户端 → 服务器）

| 请求头 | 说明 | 使用场景 |
|--------|------|----------|
| If-None-Match | ETag值 | 协商缓存验证 |
| If-Modified-Since | Last-Modified值 | 协商缓存验证 |
| Cache-Control | 客户端缓存指令 | 控制缓存行为 |

# 面试高频问题

1. **强缓存和协商缓存的区别？**
2. **Cache-Control的各个指令含义？**
3. **ETag和Last-Modified的区别？优先级？**
4. **如何实现长期缓存？文件名hash的作用？**
5. **304状态码的流程？如何触发？**
6. **no-cache和no-store的区别？**
7. **public和private的区别？**
8. **如何解决更新后用户仍看到旧版本的问题？**
9. **Service Worker的缓存策略有哪些？**
10. **Memory Cache和Disk Cache的区别？**

