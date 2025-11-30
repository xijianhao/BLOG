---
title: 类型推断与断言
notebook: ts
date: 2024-11-08
tags: ['类型系统', '推断']
excerpt: TypeScript 的类型推断机制和类型断言的使用场景与最佳实践
order: 1
---

# 类型推断与断言

TypeScript 的类型推断是它的核心能力之一，能够在大多数情况下自动推导出类型，减少冗余的类型注解。

## 类型推断（Type Inference）

### 基础推断

```typescript
// 变量推断
let x = 3;              // 推断为 number
let y = "hello";        // 推断为 string
let z = true;           // 推断为 boolean

// 数组推断
let arr = [1, 2, 3];    // 推断为 number[]
let mixed = [1, "a"];   // 推断为 (string | number)[]

// 对象推断
let obj = {
  name: "Alice",
  age: 30
}; // 推断为 { name: string; age: number }
```

### 函数返回类型推断

```typescript
// TypeScript 可以推断函数返回类型
function add(a: number, b: number) {
  return a + b; // 推断返回类型为 number
}

// 但显式声明返回类型是好的实践（特别是复杂函数）
function processData(input: string): string {
  // 显式返回类型有助于文档化和错误检查
  return input.toUpperCase();
}
```

### 上下文推断（Contextual Typing）

```typescript
// 根据上下文推断类型
window.onmousedown = function(mouseEvent) {
  // mouseEvent 被推断为 MouseEvent
  console.log(mouseEvent.button);
};

// 数组方法中的推断
[1, 2, 3].map(x => x * 2); // x 被推断为 number

// 回调函数参数推断
function handler(callback: (value: number) => void) {
  callback(42);
}

handler(value => {
  // value 被推断为 number
  console.log(value.toFixed(2));
});
```

### 最佳公共类型推断

```typescript
// TypeScript 会寻找所有类型的公共超类型
let arr = [0, 1, null]; // 推断为 (number | null)[]

// 如果找不到公共类型，推断为联合类型
let mixed = [0, "hello", true]; // 推断为 (number | string | boolean)[]
```

### 类型推断的局限性

```typescript
// 推断可能不够精确
const config = {
  api: "https://api.example.com",
  timeout: 5000
};
// config.timeout 是 number，但可能是 5000 更精确

// 使用 as const 进行常量断言
const config2 = {
  api: "https://api.example.com",
  timeout: 5000
} as const;
// config2.timeout 是字面量类型 5000
```

## 类型断言（Type Assertion）

类型断言告诉 TypeScript："我比你更了解这个值的类型"。

### as 语法

```typescript
// 基本用法
let someValue: unknown = "this is a string";
let strLength: number = (someValue as string).length;

// 断言为更具体的类型
interface ApiResponse {
  data: {
    users: Array<{ id: number; name: string }>;
  };
}

function handleResponse(response: unknown) {
  const apiResponse = response as ApiResponse;
  // 现在可以安全访问 apiResponse.data.users
  return apiResponse.data.users;
}
```

### 尖括号语法

```typescript
// 另一种语法（不能在 JSX 中使用）
let strLength = (<string>someValue).length;
```

### 双重断言

```typescript
// 当直接断言不兼容时，可以使用双重断言
let value: unknown = "hello";
let num: number = value as unknown as number;

// 但这是危险的，应该避免
// 更好的方式是先验证类型
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return parseFloat(value);
  throw new Error("Cannot convert to number");
}
```

### const 断言

```typescript
// const 断言创建字面量类型
let x = "hello" as const;        // 类型是 "hello" 而不是 string
let y = [1, 2, 3] as const;      // 类型是 readonly [1, 2, 3]

// 对象字面量的 const 断言
const config = {
  api: "https://api.example.com",
  timeout: 5000,
  retries: 3
} as const;
// 所有属性都是只读字面量类型

// 在函数中使用
function getConfig() {
  return {
    api: "https://api.example.com",
    timeout: 5000
  } as const;
}
```

### 非空断言操作符（!）

```typescript
// 告诉 TypeScript 值不是 null 或 undefined
function processElement(element: HTMLElement | null) {
  // 使用非空断言（确保 element 不为 null）
  element!.style.display = "none";
  
  // 更好的方式是使用类型守卫
  if (element) {
    element.style.display = "none";
  }
}

// 在可选链中使用
interface User {
  name: string;
  address?: {
    city: string;
  };
}

let user: User | undefined;
let city = user!.address!.city; // 非空断言链（危险）
```

## 类型守卫（Type Guards）

类型守卫是比类型断言更安全的类型收窄方式。

### typeof 守卫

```typescript
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  return padding + value;
}
```

### instanceof 守卫

```typescript
class Bird {
  fly() {
    console.log("flying");
  }
}

class Fish {
  swim() {
    console.log("swimming");
  }
}

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly();
  } else {
    animal.swim();
  }
}
```

### in 操作符守卫

```typescript
interface Dog {
  bark(): void;
}

interface Cat {
  meow(): void;
}

function makeSound(animal: Dog | Cat) {
  if ("bark" in animal) {
    animal.bark();
  } else {
    animal.meow();
  }
}
```

### 自定义类型守卫

```typescript
// 使用类型谓词（type predicate）
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // TypeScript 知道 value 是 string
    console.log(value.toUpperCase());
  }
}

// 更复杂的例子
interface ApiError {
  code: number;
  message: string;
}

interface NetworkError {
  status: number;
  reason: string;
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}
```

### 可辨识联合（Discriminated Unions）

```typescript
// 使用字面量类型作为"标签"来区分联合类型
type Success = {
  status: "success";
  data: string;
};

type Error = {
  status: "error";
  message: string;
};

type Result = Success | Error;

function handleResult(result: Result) {
  // TypeScript 可以根据 status 自动收窄类型
  if (result.status === "success") {
    console.log(result.data); // TypeScript 知道这是 Success
  } else {
    console.log(result.message); // TypeScript 知道这是 Error
  }
}
```

## 断言函数（Assertion Functions）

```typescript
// TypeScript 3.7+ 支持断言函数
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Not a string!");
  }
}

function process(input: unknown) {
  assertIsString(input);
  // 这里 TypeScript 知道 input 是 string
  console.log(input.toUpperCase());
}
```

## 最佳实践

1. **优先使用类型推断**：让 TypeScript 自动推断，减少冗余代码
2. **谨慎使用类型断言**：断言会绕过类型检查，可能导致运行时错误
3. **使用类型守卫替代断言**：类型守卫更安全，提供运行时检查
4. **利用 const 断言**：创建更精确的字面量类型
5. **使用可辨识联合**：让类型系统帮助你处理不同的情况
6. **显式声明复杂函数的返回类型**：提高代码可读性和可维护性

