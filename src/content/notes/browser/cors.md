---
title: CORS跨域
notebook: browser
date: 2024-12-20
tags: ['浏览器', '性能优化', 'HTTP']
excerpt: 深入解析CORS跨域机制，涵盖同源策略、简单请求、预检请求、OPTIONS请求等核心概念及面试考察要点
order: 3
---

# CORS跨域核心面试要点

## 1. 什么是跨域

**跨域（Cross-Origin Resource Sharing，CORS）** 是指浏览器允许一个域下的网页向另一个域下的服务器发起请求。

### 同源策略（Same-Origin Policy）

浏览器出于安全考虑，实施了**同源策略**，限制了不同源之间的资源访问。

**同源的定义**：协议（protocol）、域名（domain）、端口（port）三者完全相同。

```
https://www.example.com:443/page.html
  ↓      ↓              ↓
协议    域名           端口
```

**示例判断**：
- `https://www.example.com` → `https://www.example.com/api` ✅ 同源
- `http://www.example.com` → `https://www.example.com/api` ❌ 不同源（协议不同）
- `https://www.example.com` → `https://api.example.com` ❌ 不同源（域名不同）
- `https://www.example.com` → `https://www.example.com:8080` ❌ 不同源（端口不同）

## 2. 为什么需要跨域限制

### 安全原因

1. **防止CSRF攻击**：阻止恶意网站窃取用户信息
2. **防止XSS攻击**：限制恶意脚本访问其他域的资源
3. **保护用户隐私**：防止网站读取其他域的敏感数据

### 实际场景

- 用户登录了 `bank.com`，同时访问了恶意网站 `evil.com`
- 如果没有同源策略，`evil.com` 可以读取 `bank.com` 的 Cookie，进行非法操作

## 3. 跨域解决方案

### 3.1 JSONP（已过时，了解即可）

**原理**：利用 `<script>` 标签不受同源策略限制的特性

```javascript
// 客户端
function handleResponse(data) {
  console.log(data);
}

const script = document.createElement('script');
script.src = 'https://api.example.com/data?callback=handleResponse';
document.body.appendChild(script);

// 服务端返回
handleResponse({ "name": "value" });
```

**缺点**：
- 只支持 GET 请求
- 安全性差，容易受到 XSS 攻击
- 错误处理困难

### 3.2 CORS（推荐方案）

**CORS（Cross-Origin Resource Sharing）** 是 W3C 标准，是跨域资源共享的官方解决方案。

### 3.3 代理服务器

开发环境常用方案，通过代理服务器转发请求：

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
```

### 3.4 postMessage

用于 `iframe` 跨域通信：

```javascript
// 父页面
window.frames[0].postMessage('data', 'https://child.example.com');

// 子页面
window.addEventListener('message', (event) => {
  if (event.origin === 'https://parent.example.com') {
    console.log(event.data);
  }
});
```

### 3.5 document.domain

仅适用于主域相同、子域不同的情况：

```javascript
// www.example.com 和 api.example.com
document.domain = 'example.com';
```

## 4. CORS 机制详解

### 4.1 简单请求（Simple Request）

满足以下所有条件的请求为简单请求：

1. **请求方法**：GET、HEAD、POST 之一
2. **请求头**：只能包含以下字段：
   - `Accept`
   - `Accept-Language`
   - `Content-Language`
   - `Content-Type`（仅限：`text/plain`、`multipart/form-data`、`application/x-www-form-urlencoded`）
3. **没有自定义请求头**

**简单请求流程**：

```
客户端 → 直接发送请求 → 服务端
       ← 返回响应（带 CORS 头）←
```

**服务端响应头**：
```http
Access-Control-Allow-Origin: https://www.example.com
Access-Control-Allow-Credentials: true  // 允许携带 Cookie
```

### 4.2 预检请求（Preflight Request）

不满足简单请求条件的请求，浏览器会先发送 **OPTIONS 预检请求**。

**触发预检请求的情况**：

1. **请求方法**：PUT、DELETE、PATCH 等
2. **自定义请求头**：如 `Authorization`、`X-Custom-Header`
3. **Content-Type**：`application/json`、`application/xml` 等

**预检请求流程**：

```
客户端 → OPTIONS 预检请求 → 服务端
       ← 返回允许的 CORS 策略 ←
       
客户端 → 实际请求 → 服务端
       ← 返回数据 ←
```

## 5. OPTIONS 预检请求详解

### 5.1 OPTIONS 请求的作用

OPTIONS 请求是 HTTP 的**预检请求**，用于：
- 询问服务器是否允许跨域请求
- 获取服务器支持的请求方法和请求头
- 在实际请求之前进行安全检查

### 5.2 OPTIONS 请求示例

**客户端发送的 OPTIONS 请求**：

```http
OPTIONS /api/users HTTP/1.1
Host: api.example.com
Origin: https://www.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

**关键请求头**：
- `Origin`：请求来源
- `Access-Control-Request-Method`：实际请求的方法
- `Access-Control-Request-Headers`：实际请求的自定义头

**服务端响应**：

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://www.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true
```

**关键响应头**：
- `Access-Control-Allow-Origin`：允许的源（`*` 表示所有源，但不能与 `Credentials` 同时使用）
- `Access-Control-Allow-Methods`：允许的请求方法
- `Access-Control-Allow-Headers`：允许的请求头
- `Access-Control-Max-Age`：预检请求缓存时间（秒）
- `Access-Control-Allow-Credentials`：是否允许携带凭证（Cookie、Authorization 等）

### 5.3 预检请求缓存

`Access-Control-Max-Age` 指定预检请求的缓存时间：

```http
Access-Control-Max-Age: 86400  // 24小时内不再发送预检请求
```

在缓存有效期内，浏览器会直接发送实际请求，跳过 OPTIONS 请求。

### 5.4 服务端处理 OPTIONS 请求

**Node.js/Express 示例**：

```javascript
app.use((req, res, next) => {
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'https://www.example.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Max-Age', '86400');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  
  // 处理实际请求
  res.header('Access-Control-Allow-Origin', 'https://www.example.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
```

**使用中间件（推荐）**：

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://www.example.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));
```

## 6. CORS 响应头详解

### 6.1 Access-Control-Allow-Origin

指定允许访问资源的源：

```http
Access-Control-Allow-Origin: https://www.example.com  // 单个源
Access-Control-Allow-Origin: *                        // 所有源（不能与 credentials 同时使用）
```

### 6.2 Access-Control-Allow-Credentials

是否允许携带凭证（Cookie、Authorization 等）：

```http
Access-Control-Allow-Credentials: true
```

**注意**：
- 设置为 `true` 时，`Access-Control-Allow-Origin` 不能为 `*`
- 客户端需要设置 `withCredentials: true`

```javascript
fetch('https://api.example.com/data', {
  credentials: 'include'  // 或 'same-origin'
});
```

### 6.3 Access-Control-Expose-Headers

允许客户端访问的响应头（默认只能访问简单响应头）：

```http
Access-Control-Expose-Headers: X-Custom-Header, X-Total-Count
```

### 6.4 Access-Control-Allow-Methods

允许的 HTTP 方法：

```http
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
```

### 6.5 Access-Control-Allow-Headers

允许的请求头：

```http
Access-Control-Allow-Headers: Content-Type, Authorization, X-Custom-Header
```

## 7. 常见面试题

### Q1: 什么是跨域？为什么会有跨域限制？

**答案**：
- 跨域是指浏览器允许一个域下的网页向另一个域下的服务器发起请求
- 同源策略限制了不同源之间的资源访问，防止 CSRF、XSS 等攻击，保护用户隐私

### Q2: 简单请求和预检请求的区别？

**答案**：
- **简单请求**：满足特定条件的请求（GET/HEAD/POST，特定请求头），直接发送，无需预检
- **预检请求**：不满足简单请求条件时，浏览器先发送 OPTIONS 请求询问服务器，获得允许后再发送实际请求

### Q3: OPTIONS 请求是什么？什么时候会发送？

**答案**：
- OPTIONS 是 HTTP 预检请求，用于询问服务器是否允许跨域
- 触发条件：非简单请求方法（PUT/DELETE 等）、自定义请求头、特殊 Content-Type（如 application/json）

### Q4: 如何解决跨域问题？

**答案**：
1. **CORS**：服务端设置响应头（推荐）
2. **代理服务器**：开发环境常用
3. **JSONP**：仅支持 GET（已过时）
4. **postMessage**：iframe 通信
5. **document.domain**：主域相同的情况

### Q5: Access-Control-Allow-Origin 设置为 * 会有什么问题？

**答案**：
- 允许所有源访问，安全性低
- **不能与 `Access-Control-Allow-Credentials: true` 同时使用**
- 生产环境应指定具体域名

### Q6: 如何携带 Cookie 进行跨域请求？

**答案**：
1. 服务端设置：`Access-Control-Allow-Credentials: true`
2. 服务端设置：`Access-Control-Allow-Origin` 为具体域名（不能是 `*`）
3. 客户端设置：`credentials: 'include'`（fetch）或 `withCredentials: true`（XMLHttpRequest）

### Q7: 预检请求可以缓存吗？

**答案**：
- 可以，通过 `Access-Control-Max-Age` 设置缓存时间
- 在缓存有效期内，浏览器会跳过 OPTIONS 请求，直接发送实际请求

### Q8: 跨域请求会携带 Cookie 吗？

**答案**：
- 默认不会
- 需要同时满足：
  1. 服务端设置 `Access-Control-Allow-Credentials: true`
  2. 服务端设置 `Access-Control-Allow-Origin` 为具体域名
  3. 客户端设置 `credentials: 'include'` 或 `withCredentials: true`

## 8. 实际开发中的最佳实践

### 8.1 开发环境

使用代理服务器避免跨域问题：

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}
```

### 8.2 生产环境

服务端正确配置 CORS：

```javascript
// 允许的源列表
const allowedOrigins = [
  'https://www.example.com',
  'https://admin.example.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));
```

### 8.3 错误处理

```javascript
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  credentials: 'include',
  body: JSON.stringify({ data: 'value' })
})
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.catch(error => {
  console.error('CORS error:', error);
});
```

## 9. 总结

### 核心要点

1. **同源策略**：协议、域名、端口完全相同
2. **简单请求**：直接发送，无需预检
3. **预检请求**：先发送 OPTIONS，获得允许后再发送实际请求
4. **OPTIONS 请求**：询问服务器是否允许跨域，可缓存
5. **CORS 响应头**：控制跨域访问权限
6. **凭证携带**：需要服务端和客户端同时配置
