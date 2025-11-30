---
title: type 与 interface
notebook: ts
date: 2024-11-18
tags: ['类型系统', '最佳实践']
excerpt: type 和 interface 的区别、使用场景和最佳实践
order: 4
---

# type 与 interface

`type` 和 `interface` 都可以用来定义类型，但它们有不同的特性和使用场景。

## 基本语法

### interface

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// 扩展
interface Admin extends User {
  permissions: string[];
}

// 声明合并（Declaration Merging）
interface User {
  age?: number; // 会与上面的 User 合并
}
```

### type

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

// 扩展（使用交叉类型）
type Admin = User & {
  permissions: string[];
};

// type 不支持声明合并
// type User = { age?: number }; // 错误：重复标识符
```

## 主要区别

### 1. 声明合并

```typescript
// interface 支持声明合并
interface Window {
  title: string;
}

interface Window {
  ts: TypeScriptAPI;
}

// 最终 Window 包含 title 和 ts

// type 不支持声明合并
type Window = {
  title: string;
};

// type Window = { ts: TypeScriptAPI }; // 错误：重复标识符
```

### 2. 扩展方式

```typescript
// interface 使用 extends
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// type 使用交叉类型
type Animal = {
  name: string;
};

type Dog = Animal & {
  breed: string;
};

// interface 可以扩展 type
type Animal = {
  name: string;
};

interface Dog extends Animal {
  breed: string;
}

// type 可以扩展 interface
interface Animal {
  name: string;
}

type Dog = Animal & {
  breed: string;
};
```

### 3. 联合类型和交叉类型

```typescript
// type 可以定义联合类型
type Status = "pending" | "active" | "inactive";

// interface 不能直接定义联合类型
// interface Status = "pending" | "active"; // 错误

// type 可以定义交叉类型
type A = { a: number };
type B = { b: string };
type C = A & B; // { a: number; b: string }

// interface 使用 extends 实现类似效果
interface A {
  a: number;
}
interface B {
  b: string;
}
interface C extends A, B {} // { a: number; b: string }
```

### 4. 计算属性名

```typescript
// type 支持计算属性名
type Keys = "name" | "age";
type User = {
  [K in Keys]: string;
};

// interface 不支持映射类型语法
// interface User {
//   [K in Keys]: string; // 错误
// }
```

### 5. 元组类型

```typescript
// type 可以定义元组
type Point = [number, number];

// interface 也可以，但语法不同
interface Point2 extends Array<number> {
  0: number;
  1: number;
  length: 2;
}
```

### 6. 函数类型

```typescript
// type 定义函数类型更灵活
type Add = (a: number, b: number) => number;

// interface 也可以
interface Add {
  (a: number, b: number): number;
}

// type 支持函数重载
type Handler = {
  (value: string): void;
  (value: number): void;
};

// interface 也支持
interface Handler {
  (value: string): void;
  (value: number): void;
}
```

## 性能差异

```typescript
// interface 在错误信息中显示更友好
interface User {
  name: string;
}

let user: User = {
  name: "Alice",
  age: 30 // 错误：'age' 不在类型 'User' 中
};

// type 的错误信息可能更复杂（特别是联合类型）
type User = {
  name: string;
};

let user: User = {
  name: "Alice",
  age: 30 // 类似的错误信息
};
```

## 使用场景建议

### 使用 interface 的场景

1. **定义对象形状**（特别是公共 API）
```typescript
// 库的公共 API
export interface Config {
  apiUrl: string;
  timeout: number;
}
```

2. **需要声明合并**
```typescript
// 扩展第三方库的类型
interface Window {
  myCustomProperty: string;
}
```

3. **面向对象编程**
```typescript
// 类实现接口
interface Flyable {
  fly(): void;
}

class Bird implements Flyable {
  fly() {
    console.log("Flying");
  }
}
```

### 使用 type 的场景

1. **联合类型和交叉类型**
```typescript
type Status = "pending" | "active" | "inactive";
type ID = string | number;
```

2. **类型别名和工具类型**
```typescript
type User = {
  id: number;
  name: string;
};

type PartialUser = Partial<User>;
type UserKeys = keyof User;
```

3. **映射类型和条件类型**
```typescript
type Optional<T> = {
  [K in keyof T]?: T[K];
};

type NonNullable<T> = T extends null | undefined ? never : T;
```

4. **元组类型**
```typescript
type Point = [number, number];
type Entry = [string, number];
```

5. **函数类型**
```typescript
type EventHandler = (event: Event) => void;
type AsyncFunction<T> = () => Promise<T>;
```

## 实际项目中的选择

### React 组件 Props

```typescript
// 推荐使用 interface（更符合 React 社区习惯）
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => {
  // ...
};
```

### API 响应类型

```typescript
// 使用 type 定义复杂类型
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
  timestamp: number;
};

type UserResponse = ApiResponse<{
  id: number;
  name: string;
  email: string;
}>;
```

### 工具类型

```typescript
// 使用 type 创建工具类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
```

### 状态管理

```typescript
// 使用 type 定义状态类型
type AppState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type AppAction =
  | { type: "SET_USER"; payload: User }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };
```

## 混合使用

在实际项目中，可以混合使用 `type` 和 `interface`：

```typescript
// 基础类型用 interface
interface User {
  id: number;
  name: string;
}

// 扩展和组合用 type
type Admin = User & {
  permissions: string[];
};

type UserStatus = "active" | "inactive" | "pending";

// 工具类型用 type
type PartialUser = Partial<User>;
type UserKeys = keyof User;
```

## 最佳实践

1. **一致性**：在项目中选择一种风格并保持一致
2. **公共 API 用 interface**：更友好的错误信息和声明合并
3. **复杂类型用 type**：联合类型、映射类型、条件类型等
4. **团队约定**：遵循团队的编码规范
5. **可读性优先**：选择让代码更易读的方式

## 总结

- **interface**：适合定义对象的形状，支持声明合并，错误信息更友好
- **type**：更灵活，支持联合类型、映射类型、条件类型等高级特性

两者可以互相扩展，在实际项目中可以根据具体场景选择使用，或者混合使用以发挥各自的优势。

