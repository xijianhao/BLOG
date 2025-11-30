---
title: 高级类型操作
notebook: ts
date: 2025-11-03
tags: ['类型系统', '高级特性']
excerpt: TypeScript 的高级类型操作，包括映射类型、条件类型、模板字面量类型、实用工具类型等
order: 3
---

# 高级类型操作

TypeScript 提供了强大的类型操作能力，可以在类型层面进行编程，创建灵活且类型安全的代码。

## 映射类型（Mapped Types）

映射类型允许基于旧类型创建新类型。

### 基础映射类型

```typescript
// 将所有属性变为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 将所有属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 实际使用
interface User {
  id: number;
  name: string;
  email: string;
}

type PartialUser = Partial<User>;
// 等同于 { id?: number; name?: string; email?: string; }

type ReadonlyUser = Readonly<User>;
// 等同于 { readonly id: number; readonly name: string; readonly email: string; }
```

### 自定义映射类型

```typescript
// 将所有属性变为必需且非空
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// 移除 readonly 修饰符
type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};

// 选择特定属性
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 排除特定属性
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 使用示例
interface Todo {
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
}

type TodoPreview = Pick<Todo, "title" | "completed">;
// { title: string; completed: boolean; }

type TodoInfo = Omit<Todo, "completed" | "createdAt">;
// { title: string; description: string; }
```

### 键重映射（Key Remapping）

```typescript
// TypeScript 4.1+ 支持键重映射
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }

// 过滤特定键
type RemoveKindField<T> = {
  [K in keyof T as Exclude<K, "kind">]: T[K];
};

interface Circle {
  kind: "circle";
  radius: number;
}

type KindlessCircle = RemoveKindField<Circle>;
// { radius: number; }
```

## 条件类型（Conditional Types）

条件类型允许根据条件选择类型。

### 基础条件类型

```typescript
// 语法：T extends U ? X : Y
type IsArray<T> = T extends any[] ? true : false;

type A = IsArray<number[]>;    // true
type B = IsArray<string>;      // false

// 提取数组元素类型
type ArrayElementType<T> = T extends (infer U)[] ? U : never;

type E1 = ArrayElementType<string[]>;  // string
type E2 = ArrayElementType<number[]>;  // number
```

### infer 关键字

```typescript
// infer 用于在条件类型中推断类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

type Func = () => string;
type R = ReturnType<Func>; // string

// 提取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type Func2 = (a: number, b: string) => void;
type Params = Parameters<Func2>; // [number, string]

// 提取第一个参数类型
type FirstParameter<T> = T extends (first: infer F, ...args: any[]) => any 
  ? F 
  : never;
```

### 分布式条件类型

```typescript
// 当条件类型作用于联合类型时，会分布式应用
type ToArray<T> = T extends any ? T[] : never;

type StrArrOrNumArr = ToArray<string | number>;
// string[] | number[]（不是 (string | number)[]）

// 阻止分布式行为
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type StrArrOrNumArr2 = ToArrayNonDist<string | number>;
// (string | number)[]
```

### 实用条件类型示例

```typescript
// 检查是否为 never 类型
type IsNever<T> = [T] extends [never] ? true : false;

// 检查两个类型是否完全相同
type Equals<X, Y> = 
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

// 提取 Promise 的返回类型
type Awaited<T> = T extends Promise<infer U> ? U : T;

type P = Promise<string>;
type Result = Awaited<P>; // string
```

## 模板字面量类型（Template Literal Types）

TypeScript 4.1+ 引入了模板字面量类型，可以在类型层面操作字符串。

### 基础用法

```typescript
type World = "world";
type Greeting = `hello ${World}`; // "hello world"

type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
// "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"
```

### 实用工具类型

```typescript
// 首字母大写
type Capitalize<S extends string> = intrinsic;

// 首字母小写
type Uncapitalize<S extends string> = intrinsic;

// 全部大写
type Uppercase<S extends string> = intrinsic;

// 全部小写
type Lowercase<S extends string> = intrinsic;

type T1 = Capitalize<"hello">;      // "Hello"
type T2 = Uppercase<"hello">;       // "HELLO"
type T3 = Lowercase<"HELLO">;       // "hello"
```

### 实际应用

```typescript
// 创建事件处理器类型
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<"click">;    // "onClick"
type FocusEvent = EventName<"focus">;    // "onFocus"

// 创建属性访问器
type Getter<T extends string> = `get${Capitalize<T>}`;
type Setter<T extends string> = `set${Capitalize<T>}`;

type NameGetter = Getter<"name">;        // "getName"
type NameSetter = Setter<"name">;        // "setName"

// 路径字符串类型
type Path = `/${string}`;
type ApiPath = `/api/${string}`;

const path1: Path = "/users";           // ✅
const path2: ApiPath = "/api/users";    // ✅
```

## 实用工具类型（Utility Types）

TypeScript 内置了许多实用工具类型。

### Partial 和 Required

```typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; }

type RequiredUser = Required<User>;
// { id: number; name: string; email: string; }
```

### Readonly 和 Writable

```typescript
interface Config {
  apiUrl: string;
  timeout: number;
}

type ReadonlyConfig = Readonly<Config>;
// { readonly apiUrl: string; readonly timeout: number; }
```

### Pick 和 Omit

```typescript
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;
// { title: string; completed: boolean; }

type TodoInfo = Omit<Todo, "completed">;
// { title: string; description: string; }
```

### Record

```typescript
// 创建具有特定键类型的对象类型
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type PageInfo = {
  title: string;
};

type Page = "home" | "about" | "contact";

const x: Record<Page, PageInfo> = {
  home: { title: "Home" },
  about: { title: "About" },
  contact: { title: "Contact" }
};
```

### Exclude 和 Extract

```typescript
// 从联合类型中排除某些类型
type T0 = Exclude<"a" | "b" | "c", "a">;        // "b" | "c"
type T1 = Exclude<string | number | (() => void), Function>; // string | number

// 从联合类型中提取某些类型
type T2 = Extract<"a" | "b" | "c", "a" | "f">; // "a"
type T3 = Extract<string | number | (() => void), Function>; // () => void
```

### NonNullable

```typescript
// 排除 null 和 undefined
type T0 = NonNullable<string | number | undefined>; // string | number
type T1 = NonNullable<string[] | null | undefined>; // string[]
```

### Parameters 和 ReturnType

```typescript
declare function f1(arg: { a: number; b: string }): void;

type T0 = Parameters<typeof f1>;
// [{ a: number; b: string }]

type T1 = ReturnType<typeof f1>;
// void
```

### ConstructorParameters 和 InstanceType

```typescript
class C {
  constructor(x: number, y: string) {}
}

type T0 = ConstructorParameters<typeof C>;
// [x: number, y: string]

type T1 = InstanceType<typeof C>;
// C
```

### Awaited（TypeScript 4.5+）

```typescript
// 提取 Promise 的返回类型
type A = Awaited<Promise<string>>;        // string
type B = Awaited<Promise<Promise<number>>>; // number
type C = Awaited<boolean | Promise<number>>; // boolean | number
```

## 类型操作组合

```typescript
// 创建深度只读类型
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 创建深度可选类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 创建深度必需类型
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// 提取函数类型的最后一个参数
type LastParameter<T> = T extends (...args: infer P) => any
  ? P extends [...any, infer L]
    ? L
    : never
  : never;
```

## 实际应用场景

### API 响应类型转换

```typescript
// 将 API 响应转换为前端需要的格式
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

type UserResponse = ApiResponse<{
  id: number;
  name: string;
  email: string;
}>;

// 提取数据部分
type UserData = UserResponse["data"];
```

### 表单字段类型

```typescript
// 创建表单字段类型
type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
};

type FormFields<T> = {
  [K in keyof T]: FormField<T[K]>;
};

interface LoginForm {
  email: string;
  password: string;
}

type LoginFormFields = FormFields<LoginForm>;
// {
//   email: FormField<string>;
//   password: FormField<string>;
// }
```

## 最佳实践

1. **理解映射类型**：用于批量转换类型属性
2. **掌握条件类型**：实现复杂的类型逻辑
3. **利用 infer**：从复杂类型中提取信息
4. **使用模板字面量类型**：创建类型安全的字符串操作
5. **组合使用工具类型**：构建复杂的类型系统
6. **避免过度复杂**：保持类型可读性和可维护性

