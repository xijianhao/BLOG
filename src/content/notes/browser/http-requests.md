---
title: 浏览器网络请求方式详解
notebook: browser
date: 2024-12-20
tags: ['浏览器', '网络', 'HTTP', 'JavaScript']
excerpt: 深入解析XHR、Fetch等浏览器网络请求方式，对比分析各自特点、使用场景及面试考察要点
order: 4
---

# 请求方式概览

浏览器中常见的网络请求方式：

- **XMLHttpRequest (XHR)**：传统异步请求API
- **Fetch API**：现代Promise-based请求API
- **Axios**：基于Promise的HTTP客户端库
- **jQuery.ajax**：jQuery封装的请求方法
- **Beacon API**：用于发送分析数据的API
- **Server-Sent Events (SSE)**：服务器推送事件
- **WebSocket**：全双工通信协议

# XMLHttpRequest (XHR)

## 历史背景

XMLHttpRequest是**最早的浏览器异步请求API**，由Microsoft在IE5中引入，后被所有浏览器支持。虽然名字包含"XML"，但可以请求任何类型的数据。

## 核心API

### 基本使用

```javascript
// 1. 创建XHR对象
const xhr = new XMLHttpRequest();

// 2. 配置请求
xhr.open('GET', 'https://api.example.com/data', true); // 方法, URL, 是否异步

// 3. 设置请求头（可选）
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Authorization', 'Bearer token');

// 4. 监听事件
xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) { // 请求完成
    if (xhr.status === 200) {
      console.log(xhr.responseText);
    } else {
      console.error('Error:', xhr.status);
    }
  }
};

// 5. 发送请求
xhr.send(); // GET请求可以传null，POST请求传数据
```

### POST请求示例

```javascript
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://api.example.com/users', true);
xhr.setRequestHeader('Content-Type', 'application/json');

xhr.onreadystatechange = function() {
  if (xhr.readyState === 4 && xhr.status === 200) {
    const response = JSON.parse(xhr.responseText);
    console.log(response);
  }
};

xhr.send(JSON.stringify({ name: 'John', age: 30 }));
```

## 核心属性

### readyState（请求状态）

| 值 | 状态 | 说明 |
|----|------|------|
| 0 | UNSENT | 未初始化，未调用open() |
| 1 | OPENED | 已调用open()，未调用send() |
| 2 | HEADERS_RECEIVED | 已调用send()，已收到响应头 |
| 3 | LOADING | 正在接收响应体 |
| 4 | DONE | 请求完成 |

### status（HTTP状态码）

- **200-299**：成功
- **300-399**：重定向
- **400-499**：客户端错误
- **500-599**：服务器错误

### responseType（响应类型）

```javascript
xhr.responseType = 'json'; // 自动解析JSON
// 可选值：
// '' 或 'text'：文本（默认）
// 'json'：JSON对象
// 'blob'：Blob对象
// 'arraybuffer'：ArrayBuffer
// 'document'：XML文档
```

### 响应属性

- **responseText**：文本响应（responseType为text时）
- **response**：根据responseType返回对应类型
- **responseXML**：XML响应（已废弃）
- **status**：HTTP状态码
- **statusText**：状态文本（如"OK"）
- **getResponseHeader(name)**：获取响应头
- **getAllResponseHeaders()**：获取所有响应头

## 事件监听

### 传统方式

```javascript
xhr.onreadystatechange = function() {
  // 所有状态变化都会触发
};

xhr.onload = function() {
  // 请求成功完成（readyState === 4 && status === 200）
};

xhr.onerror = function() {
  // 网络错误
};

xhr.onprogress = function(event) {
  // 下载进度
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    console.log(percentComplete);
  }
};
```

### 现代方式（addEventListener）

```javascript
xhr.addEventListener('load', function() {
  console.log('请求完成');
});

xhr.addEventListener('error', function() {
  console.log('请求失败');
});

xhr.addEventListener('progress', function(event) {
  console.log('下载进度:', event.loaded / event.total);
});
```

## 上传进度

```javascript
xhr.upload.onprogress = function(event) {
  if (event.lengthComputable) {
    const percentComplete = (event.loaded / event.total) * 100;
    console.log('上传进度:', percentComplete);
  }
};
```

## 超时设置

```javascript
xhr.timeout = 5000; // 5秒超时
xhr.ontimeout = function() {
  console.log('请求超时');
};
```

## 取消请求

```javascript
xhr.abort(); // 取消请求
```

## 面试要点

1. **回调地狱**：XHR使用回调，容易产生嵌套
2. **错误处理**：需要手动检查status判断成功/失败
3. **兼容性好**：所有浏览器都支持
4. **功能完整**：支持上传进度、超时、取消等
5. **事件驱动**：基于事件机制，不够现代化

# Fetch API

## 概述

Fetch API是**现代浏览器提供的Promise-based网络请求API**，设计更简洁，基于Promise，支持async/await。

## 核心API

### 基本使用

```javascript
// GET请求
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // 解析JSON
  })
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### async/await方式

```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### POST请求

```javascript
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify({
    name: 'John',
    age: 30
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## 配置选项

### 完整配置示例

```javascript
fetch(url, {
  // 请求方法
  method: 'POST', // GET, POST, PUT, DELETE, PATCH等
  
  // 请求头
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token',
    'Custom-Header': 'value'
  },
  
  // 请求体
  body: JSON.stringify(data), // 字符串、FormData、Blob等
  
  // 请求模式
  mode: 'cors', // same-origin, no-cors, cors
  
  // 凭证
  credentials: 'include', // omit, same-origin, include
  
  // 缓存策略
  cache: 'no-cache', // default, no-store, reload, no-cache, force-cache, only-if-cached
  
  // 重定向
  redirect: 'follow', // manual, follow, error
  
  // 引用策略
  referrerPolicy: 'no-referrer', // no-referrer, no-referrer-when-downgrade等
  
  // 完整性校验
  integrity: 'sha256-xxx', // 子资源完整性（SRI）
  
  // 优先级
  priority: 'high' // low, auto, high
});
```

## Response对象

### 属性

```javascript
const response = await fetch(url);

// 状态
response.status        // HTTP状态码（200, 404等）
response.statusText    // 状态文本（"OK", "Not Found"等）
response.ok           // 布尔值，status在200-299范围内为true

// 响应头
response.headers       // Headers对象
response.headers.get('Content-Type')

// 响应体方法（只能调用一次）
response.text()        // 返回文本
response.json()        // 返回JSON对象
response.blob()        // 返回Blob对象
response.arrayBuffer() // 返回ArrayBuffer
response.formData()    // 返回FormData对象
```

### 响应体读取

**重要**：响应体只能读取一次，读取后流就关闭了。

```javascript
// ❌ 错误：多次读取
const response = await fetch(url);
const text = await response.text();
const json = await response.json(); // 错误！流已关闭

// ✅ 正确：先克隆再读取
const response = await fetch(url);
const clone = response.clone();
const text = await response.text();
const json = await clone.json();
```

## 错误处理

### 关键点

**Fetch不会对HTTP错误状态（4xx、5xx）抛出异常**，只有网络错误才会reject。

```javascript
// ❌ 错误：4xx/5xx不会进入catch
fetch(url)
  .then(response => response.json())
  .catch(error => {
    // 这里捕获不到4xx/5xx错误
  });

// ✅ 正确：手动检查status
fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .catch(error => {
    // 可以捕获所有错误
  });
```

## 请求取消

### AbortController

```javascript
// 创建AbortController
const controller = new AbortController();
const signal = controller.signal;

// 发送请求
fetch(url, { signal })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('请求已取消');
    } else {
      console.error('Error:', error);
    }
  });

// 取消请求
controller.abort();
```

### 超时实现

```javascript
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => {
    clearTimeout(timer);
  });
}
```

## 上传进度

**Fetch API不支持上传进度**，这是它的一个限制。如果需要上传进度，需要使用XHR。

## 下载进度

```javascript
const response = await fetch(url);
const reader = response.body.getReader();
const contentLength = +response.headers.get('Content-Length');

let receivedLength = 0;
const chunks = [];

while(true) {
  const {done, value} = await reader.read();
  
  if (done) break;
  
  chunks.push(value);
  receivedLength += value.length;
  
  console.log(`下载进度: ${(receivedLength / contentLength * 100).toFixed(2)}%`);
}

// 合并chunks
const allChunks = new Uint8Array(receivedLength);
let position = 0;
for(const chunk of chunks) {
  allChunks.set(chunk, position);
  position += chunk.length;
}
```

## 面试要点

1. **Promise-based**：基于Promise，支持async/await
2. **简洁API**：比XHR更简洁易用
3. **默认不携带Cookie**：需要设置`credentials: 'include'`
4. **错误处理**：HTTP错误不会自动reject，需要手动检查
5. **不支持上传进度**：这是Fetch的局限性
6. **流式处理**：支持流式读取响应体
7. **现代标准**：符合Web标准，未来趋势

# XHR vs Fetch 对比

## 功能对比表

| 特性 | XHR | Fetch |
|------|-----|-------|
| **API风格** | 回调/事件 | Promise |
| **async/await** | 需要封装 | 原生支持 |
| **错误处理** | 手动检查status | 需要手动检查response.ok |
| **请求取消** | `xhr.abort()` | `AbortController` |
| **超时** | `xhr.timeout` | 需要手动实现 |
| **上传进度** | ✅ 支持 | ❌ 不支持 |
| **下载进度** | ✅ 支持 | ⚠️ 需要手动实现 |
| **Cookie** | 默认携带 | 默认不携带 |
| **CORS** | 支持 | 支持 |
| **请求/响应拦截** | 需要手动实现 | 需要手动实现 |
| **浏览器支持** | 所有浏览器 | 现代浏览器（IE不支持） |
| **流式处理** | 有限支持 | ✅ 完整支持 |

## 代码对比

### 相同功能的不同实现

```javascript
// ========== GET请求 ==========

// XHR
const xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.onload = function() {
  if (xhr.status === 200) {
    console.log(JSON.parse(xhr.responseText));
  }
};
xhr.send();

// Fetch
fetch(url)
  .then(response => response.json())
  .then(data => console.log(data));

// ========== POST请求 ==========

// XHR
const xhr = new XMLHttpRequest();
xhr.open('POST', url);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.onload = function() {
  console.log(JSON.parse(xhr.responseText));
};
xhr.send(JSON.stringify(data));

// Fetch
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
  .then(response => response.json())
  .then(data => console.log(data));

// ========== 错误处理 ==========

// XHR
xhr.onerror = function() {
  console.error('网络错误');
};
xhr.onload = function() {
  if (xhr.status >= 200 && xhr.status < 300) {
    console.log('成功');
  } else {
    console.error('HTTP错误:', xhr.status);
  }
};

// Fetch
fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .catch(error => {
    console.error('错误:', error);
  });
```

## 使用场景建议

### 使用XHR的场景

- 需要**上传进度**功能
- 需要支持**IE浏览器**
- 需要**精确的下载进度**控制
- 需要**简单的超时控制**

### 使用Fetch的场景

- **现代浏览器**环境
- 需要**Promise/async-await**风格
- 需要**流式处理**响应
- 需要**更简洁的API**
- 需要**Service Worker**中使用（Fetch是标准）

## 面试要点

1. **为什么Fetch不自动处理HTTP错误？**
   - 设计哲学：网络错误和HTTP错误是不同的概念
   - 网络错误（断网、DNS失败）应该reject
   - HTTP错误（404、500）是有效的响应，应该由开发者决定如何处理

2. **如何选择XHR和Fetch？**
   - 现代项目优先使用Fetch
   - 需要上传进度或支持IE时使用XHR
   - 可以结合使用，各取所长

# Axios

## 概述

Axios是一个**基于Promise的HTTP客户端库**，可以在浏览器和Node.js中使用。它封装了XHR，提供了更友好的API。

## 核心特性

### 1. 简洁的API

```javascript
// GET请求
axios.get('/user?ID=12345')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// POST请求
axios.post('/user', {
  firstName: 'Fred',
  lastName: 'Flintstone'
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

### 2. 请求/响应拦截器

```javascript
// 请求拦截器
axios.interceptors.request.use(
  config => {
    // 添加token
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // 跳转登录
    }
    return Promise.reject(error);
  }
);
```

### 3. 自动JSON转换

```javascript
// 自动将JavaScript对象转换为JSON
axios.post('/user', { name: 'John' });

// 自动解析响应JSON
const response = await axios.get('/user');
console.log(response.data); // 已经是对象，不需要JSON.parse
```

### 4. 错误处理

```javascript
axios.get('/user')
  .catch(error => {
    if (error.response) {
      // 服务器返回了错误状态码
      console.log(error.response.status);
      console.log(error.response.data);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.log(error.request);
    } else {
      // 设置请求时出错
      console.log('Error', error.message);
    }
  });
```

### 5. 取消请求

```javascript
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios.get('/user', {
  cancelToken: source.token
}).catch(error => {
  if (axios.isCancel(error)) {
    console.log('请求已取消');
  }
});

// 取消请求
source.cancel('操作被用户取消');
```

### 6. 并发请求

```javascript
// 使用axios.all
axios.all([
  axios.get('/user/12345'),
  axios.get('/user/12345/permissions')
]).then(axios.spread((user, permissions) => {
  // 两个请求都完成
}));

// 使用Promise.all（推荐）
Promise.all([
  axios.get('/user/12345'),
  axios.get('/user/12345/permissions')
]).then(([user, permissions]) => {
  // 两个请求都完成
});
```

### 7. 默认配置

```javascript
// 设置默认配置
axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.timeout = 5000;
axios.defaults.headers.common['Authorization'] = 'Bearer token';

// 创建实例
const instance = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000
});
```

## Axios vs Fetch

| 特性 | Axios | Fetch |
|------|-------|-------|
| **JSON转换** | 自动 | 手动（response.json()） |
| **请求/响应拦截** | ✅ 内置 | ❌ 需要手动实现 |
| **取消请求** | ✅ CancelToken | ⚠️ AbortController |
| **错误处理** | ✅ 自动区分网络/HTTP错误 | ⚠️ 需要手动处理 |
| **超时** | ✅ 内置 | ❌ 需要手动实现 |
| **上传进度** | ✅ 支持 | ❌ 不支持 |
| **下载进度** | ✅ 支持 | ⚠️ 需要手动实现 |
| **浏览器支持** | 所有（基于XHR） | 现代浏览器 |
| **包大小** | 较大（~13KB） | 原生API，无额外大小 |
| **TypeScript** | ✅ 内置类型定义 | ⚠️ 需要手动定义 |

## 面试要点

1. **Axios的优势**：功能完整、API友好、错误处理完善
2. **Axios的实现**：基于XHR封装，提供Promise接口
3. **使用场景**：需要完整HTTP客户端功能时使用Axios，简单场景用Fetch

# 其他请求方式

## jQuery.ajax

### 概述

jQuery提供的AJAX方法，在jQuery时代广泛使用，现在已逐渐被Fetch和Axios替代。

### 基本使用

```javascript
$.ajax({
  url: '/api/user',
  method: 'GET',
  dataType: 'json',
  success: function(data) {
    console.log(data);
  },
  error: function(xhr, status, error) {
    console.error(error);
  }
});

// 简写方法
$.get('/api/user', function(data) {
  console.log(data);
});

$.post('/api/user', { name: 'John' }, function(data) {
  console.log(data);
});
```

### 特点

- **回调风格**：基于回调，不是Promise
- **jQuery依赖**：需要引入jQuery库
- **功能完整**：支持各种配置和事件
- **逐渐淘汰**：现代项目很少使用

## Beacon API

### 概述

Beacon API用于**发送分析数据**，即使页面卸载也能保证数据发送成功。

### 使用场景

- 页面分析数据
- 错误日志上报
- 用户行为追踪

### 基本使用

```javascript
// 发送数据
navigator.sendBeacon('/analytics', JSON.stringify({
  event: 'pageview',
  timestamp: Date.now()
}));

// 返回true表示已加入队列，false表示失败
const success = navigator.sendBeacon(url, data);
```

### 特点

- **可靠性**：即使页面关闭也能发送
- **异步非阻塞**：不阻塞页面卸载
- **自动重试**：浏览器自动处理重试
- **限制**：只能发送POST请求，不能读取响应

## Server-Sent Events (SSE)

### 概述

SSE允许服务器**主动向客户端推送数据**，是单向通信（服务器→客户端）。

### 基本使用

```javascript
// 创建EventSource
const eventSource = new EventSource('/events');

// 监听消息
eventSource.onmessage = function(event) {
  console.log('收到消息:', event.data);
};

// 监听自定义事件
eventSource.addEventListener('custom-event', function(event) {
  console.log('自定义事件:', event.data);
});

// 监听错误
eventSource.onerror = function(error) {
  console.error('SSE错误:', error);
};

// 关闭连接
eventSource.close();
```

### 服务器端（Node.js示例）

```javascript
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: new Date() })}\n\n`);
  }, 1000);
});
```

### 特点

- **单向通信**：只能服务器→客户端
- **自动重连**：连接断开自动重连
- **文本协议**：基于HTTP，只能发送文本
- **使用场景**：实时通知、日志推送、股票价格等

## WebSocket

### 概述

WebSocket提供**全双工通信**，允许服务器和客户端双向实时通信。

### 基本使用

```javascript
// 创建WebSocket连接
const ws = new WebSocket('wss://example.com/socket');

// 连接打开
ws.onopen = function() {
  console.log('连接已建立');
  ws.send('Hello Server');
};

// 接收消息
ws.onmessage = function(event) {
  console.log('收到消息:', event.data);
};

// 错误处理
ws.onerror = function(error) {
  console.error('WebSocket错误:', error);
};

// 连接关闭
ws.onclose = function() {
  console.log('连接已关闭');
};

// 发送消息
ws.send(JSON.stringify({ type: 'message', data: 'Hello' }));

// 关闭连接
ws.close();
```

### 特点

- **全双工**：双向实时通信
- **低延迟**：比HTTP请求更快
- **持久连接**：建立后保持连接
- **使用场景**：聊天、实时游戏、协作编辑等

### WebSocket vs SSE

| 特性 | WebSocket | SSE |
|------|-----------|-----|
| **通信方向** | 全双工 | 单向（服务器→客户端） |
| **协议** | 独立协议（ws://） | 基于HTTP |
| **数据格式** | 二进制/文本 | 仅文本 |
| **复杂度** | 较高 | 较低 |
| **浏览器支持** | 所有现代浏览器 | 所有现代浏览器 |
| **使用场景** | 需要双向通信 | 只需服务器推送 |

## 请求方式对比总结

| 方式 | 类型 | 特点 | 使用场景 |
|------|------|------|----------|
| **XHR** | 原生API | 回调风格，功能完整 | 需要上传进度、支持IE |
| **Fetch** | 原生API | Promise风格，简洁 | 现代浏览器，简单请求 |
| **Axios** | 第三方库 | 功能完整，API友好 | 需要完整HTTP客户端功能 |
| **jQuery.ajax** | 第三方库 | 回调风格，jQuery依赖 | 遗留项目 |
| **Beacon** | 原生API | 可靠发送，不阻塞 | 分析数据上报 |
| **SSE** | 原生API | 服务器推送，单向 | 实时通知、日志推送 |
| **WebSocket** | 原生API | 全双工，实时通信 | 聊天、实时游戏 |

