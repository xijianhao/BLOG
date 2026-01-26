---
title: OPTIONS 预检请求
notebook: browser
date: 2019-03-24
tags: ['网络']
excerpt: 主要用于获取目标资源所支持的通信选项。
order: 3
---

# 概念

OPTIONS 请求是 HTTP/1.1 协议中定义的一种请求方法，主要用于获取目标资源所支持的通信选项。在实际开发中最常见的场景是 CORS（跨域资源共享）预检请求（Preflight Request）。同源请求永远不会触发 OPTIONS 预检。

### 简单请求（不预检）

- 请求方法为：**GET**、**POST** 或 **HEAD**
- 请求头只包含以下安全字段（或其组合）：
    1. Accept
    2. Accept-Language
    3. Content-Language
    4. Content-Type（但仅限于以下三种值）：
        - application/x-www-form-urlencoded
        - multipart/form-data
        - text/plain
- 没有使用自定义请求头（如 Authorization、X-Requested-With 等）
- 没有读取除上述以外的响应头

如果不满足以上任意一条，就是**非简单请求** 会触发OPTIONS预检

### 非简单请求（要预检）

- 使用了自定义请求头
- Content-Type为application/json 或其他非简单类型；
- 使用PUT、DELETE、PATCH等非简单方法
- 带有credentials的跨域请求
- 手动发送OPTIONS请求

# 缓存机制
不是每次请求都会发送OPTIONS请求，浏览器会进行缓存，当一个非简单请求首次发出时，浏览器会先发送一个OPTIONS预检请求。

如果服务器在 OPTIONS 响应中设置了 Access-Control-Max-Age 头，浏览器就会将这次预检结果缓存一段时间，在这期间相同的请求就不再发送 OPTIONS。

根据Access-Control-Max-Age的时间，接下来只要满足以下情况，则不会发送OPTIONS：
- 请求的 URL 相同
- 方法相同（如都是 POST）
- 请求头集合相同（包括自定义头和 Content-Type）
- Origin 相同

**⚠️ 注意事项**

不同浏览器有不同的限制

- Chrome / Edge：最大 600 秒（10 分钟）（从 Chrome 76 开始）
- Firefox：默认最大 24 小时，但可配置
- Safari：通常支持较长时间
