---
title: 基础类型系统
notebook: ts
date: 2023-11-15
tags: ['基础', '类型系统']
excerpt: TypeScript 的基础类型系统，包括原始类型、对象类型、数组类型、函数类型等核心概念
order: 0
---

# 基础类型系统

TypeScript 的类型系统是它的核心特性，为 JavaScript 添加了静态类型检查能力。

## 原始类型

TypeScript 支持 JavaScript 的所有原始类型，并提供了额外的类型注解能力：

```typescript
// 基本类型
let name: string = "TypeScript";
let age: number = 10;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// 特殊类型
let bigNumber: bigint = 100n;
let symbol: symbol = Symbol("id");
```

## 对象类型

### 对象字面量类型

```typescript
// 对象类型注解
let user: { name: string; age: number } = {
  name: "Alice",
  age: 30
};

// 可选属性
let config: { 
  apiUrl: string; 
  timeout?: number;  // 可选
} = {
  apiUrl: "https://api.example.com"
};

// 只读属性
let point: { 
  readonly x: number; 
  readonly y: number 
} = { x: 0, y: 0 };
```

### 索引签名

```typescript
// 允许任意字符串键
let dictionary: { [key: string]: number } = {
  "one": 1,
  "two": 2
};

// 混合类型
let mixed: {
  name: string;
  [key: string]: string | number;
} = {
  name: "test",
  age: 20,
  city: "Beijing"
};
```

## 数组类型

```typescript
// 两种数组类型声明方式
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// 只读数组
let readonlyArray: ReadonlyArray<number> = [1, 2, 3];
// 或使用简写
let readonlyArray2: readonly number[] = [1, 2, 3];

// 元组（Tuple）- 固定长度和类型的数组
let tuple: [string, number] = ["hello", 42];
let tupleWithOptional: [string, number?] = ["hello"];

// 命名元组（TypeScript 4.0+）
let namedTuple: [name: string, age: number] = ["Alice", 30];
```

## 函数类型

```typescript
// 函数类型注解
function add(x: number, y: number): number {
  return x + y;
}

// 函数表达式
const multiply: (x: number, y: number) => number = (x, y) => x * y;

// 可选参数和默认参数
function greet(name: string, title?: string, greeting: string = "Hello"): string {
  return `${greeting}, ${title ? title + " " : ""}${name}`;
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

// 函数重载
function format(value: string): string;
function format(value: number): string;
function format(value: string | number): string {
  return String(value);
}
```

## 联合类型和交叉类型

```typescript
// 联合类型（Union Types）- 表示"或"的关系
let id: string | number = "123";
id = 456; // 也可以

// 类型守卫
function processId(id: string | number) {
  if (typeof id === "string") {
    // 这里 TypeScript 知道 id 是 string
    console.log(id.toUpperCase());
  } else {
    // 这里 TypeScript 知道 id 是 number
    console.log(id.toFixed(2));
  }
}

// 交叉类型（Intersection Types）- 表示"且"的关系
type Person = { name: string };
type Employee = { id: number; salary: number };
type Staff = Person & Employee; // 必须同时满足两个类型

const staff: Staff = {
  name: "Bob",
  id: 1,
  salary: 5000
};
```

## 字面量类型

```typescript
// 字符串字面量类型
type Direction = "up" | "down" | "left" | "right";
let move: Direction = "up";

// 数字字面量类型
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 3;

// 布尔字面量类型
type TrueOnly = true;
let isTrue: TrueOnly = true; // 只能是 true
```

## 枚举类型

```typescript
// 数字枚举
enum Status {
  Pending,    // 0
  Active,     // 1
  Inactive    // 2
}

// 字符串枚举
enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue"
}

// 常量枚举（编译时内联，不生成 JavaScript 代码）
const enum Size {
  Small = "S",
  Medium = "M",
  Large = "L"
}
```

## any、unknown 和 never

```typescript
// any - 关闭类型检查（不推荐使用）
let anything: any = "hello";
anything = 42;
anything.foo.bar; // 不会报错，但运行时可能出错

// unknown - 类型安全的 any
let userInput: unknown = getUserInput();
// userInput.toUpperCase(); // 错误：需要先类型检查
if (typeof userInput === "string") {
  userInput.toUpperCase(); // 正确
}

// never - 表示永远不会发生的值
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

// never 在联合类型中会被移除
type T = string | number | never; // 等同于 string | number
```

## void 类型

```typescript
// void 表示没有返回值
function log(message: string): void {
  console.log(message);
  // 没有 return 语句
}

// 注意：void 和 undefined 的区别
let voidValue: void = undefined; // 只能赋值 undefined
// let voidValue: void = null; // 错误（strictNullChecks 开启时）
```

## 类型别名

```typescript
// 使用 type 创建类型别名
type ID = string | number;
type User = {
  id: ID;
  name: string;
  email: string;
};

// 类型别名可以引用自身（递归类型）
type TreeNode = {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
};
```

## 类型断言

```typescript
// 类型断言 - 告诉 TypeScript 你比它更了解类型
let someValue: unknown = "this is a string";
let strLength: number = (someValue as string).length;

// 另一种语法（JSX 中不能使用）
let strLength2: number = (<string>someValue).length;

// 双重断言（不推荐，但有时需要）
let value: unknown = "hello";
let num: number = value as unknown as number;
```

## 最佳实践

1. **避免使用 any**：优先使用 `unknown`，然后进行类型守卫
2. **充分利用类型推断**：让 TypeScript 自动推断类型，只在必要时显式注解
3. **使用 const 断言**：创建更精确的字面量类型
   ```typescript
   const config = {
     api: "https://api.example.com",
     timeout: 5000
   } as const; // 所有属性都是只读字面量类型
   ```
4. **利用类型收窄**：使用类型守卫来缩小类型范围
5. **优先使用 type 而非 interface**：对于类型别名，`type` 更灵活

