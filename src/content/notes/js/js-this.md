
---
title: this指向
notebook: js
date: 2020-08-03
tags: ['基础']
excerpt: 理解JS中的this指向
order: 0
---


# 概念

this是在运行时进行绑定的，而不是在编写时绑定，它的上下文取决于函数调用时的各种条件，this的绑定和函数声明的位置没关系，而是取决于函数的调用方式。

当然不包括箭头函数，因为箭头函数的this指向是继承上层函数的。

普通函数看调用，谁调用就指向谁；

箭头函数看定义，继承外层 this；

bind/call/apply 能强行改，new 调用最优先。
