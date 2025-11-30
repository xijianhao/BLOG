---
title: 类型兼容性
notebook: ts
date: 2023-11-22
tags: ['类型系统', '兼容性']
excerpt: TypeScript 的结构化类型系统、类型兼容性规则和协变/逆变/双变的概念
order: 2
---

# 类型兼容性

TypeScript 使用结构化类型系统（Structural Type System），也称为"鸭子类型"（Duck Typing）。如果两个类型具有相同的结构，它们就是兼容的。

## 结构化类型系统

```typescript
// TypeScript 关注的是"形状"而不是"名称"
interface Point {
  x: number;
  y: number;
}

interface NamedPoint {
  x: number;
  y: number;
  name: string;
}

let point: Point = { x: 1, y: 2 };
let namedPoint: NamedPoint = { x: 1, y: 2, name: "origin" };

// Point 可以赋值给 NamedPoint（如果 NamedPoint 只要求 x 和 y）
// 但反过来不行，因为 NamedPoint 有额外的 name 属性
point = namedPoint; // 错误：缺少 name 属性
namedPoint = point; // 错误：缺少 name 属性

// 但如果 NamedPoint 的 name 是可选的，就可以赋值
interface OptionalNamedPoint {
  x: number;
  y: number;
  name?: string;
}

let optionalNamed: OptionalNamedPoint = point; // ✅ 可以，因为 name 是可选的
```

## 基本兼容性规则

### 对象类型兼容性

```typescript
// 目标类型必须包含源类型的所有必需属性
interface Source {
  x: number;
}

interface Target {
  x: number;
  y: number;
}

let source: Source = { x: 1 };
let target: Target = { x: 1, y: 2 };

// target = source; // 错误：缺少 y 属性
source = target; // ✅ 可以：target 有 source 需要的所有属性
```

### 函数类型兼容性

函数类型的兼容性基于参数和返回类型：

```typescript
// 参数兼容性：目标函数的参数类型必须是源函数参数类型的超类型
let x = (a: number) => 0;
let y = (b: number, s: string) => 0;

y = x; // ✅ 可以：y 可以接受更多参数
// x = y; // 错误：x 不能接受第二个参数

// 返回类型兼容性：目标函数的返回类型必须是源函数返回类型的子类型
let x2 = () => ({ name: "Alice" });
let y2 = () => ({ name: "Alice", location: "Seattle" });

x2 = y2; // ✅ 可以：x2 的返回类型是 y2 返回类型的超类型
// y2 = x2; // 错误：缺少 location 属性
```

### 可选参数和剩余参数

```typescript
// 可选参数和必需参数在兼容性上是可以互换的
function invokeLater(
  args: any[],
  callback: (...args: any[]) => any
) {
  callback(...args);
}

invokeLater([1, 2], (x, y) => console.log(x + y)); // ✅
invokeLater([1, 2], (x?, y?) => console.log(x + y)); // ✅
```

### 枚举兼容性

```typescript
enum Status {
  Ready,
  Waiting
}

enum Color {
  Red,
  Blue,
  Green
}

let status = Status.Ready;
// status = Color.Red; // 错误：枚举类型不兼容

// 数字枚举与数字兼容
let num: number = Status.Ready; // ✅
```

### 类兼容性

```typescript
class Animal {
  feet: number;
  constructor(name: string, numFeet: number) {
    this.feet = numFeet;
  }
}

class Size {
  feet: number;
  constructor(numFeet: number) {
    this.feet = numFeet;
  }
}

let a: Animal;
let s: Size;

a = s; // ✅ 可以：结构相同
s = a; // ✅ 可以：结构相同

// 但私有成员会影响兼容性
class Animal2 {
  private feet: number;
  constructor(name: string, numFeet: number) {
    this.feet = numFeet;
  }
}

class Size2 {
  private feet: number;
  constructor(numFeet: number) {
    this.feet = numFeet;
  }
}

let a2: Animal2;
let s2: Size2;

// a2 = s2; // 错误：私有成员来源不同，不兼容
// s2 = a2; // 错误：私有成员来源不同，不兼容
```

## 协变（Covariance）和逆变（Contravariance）

### 数组协变

```typescript
// 数组是协变的：如果 A 是 B 的子类型，则 A[] 是 B[] 的子类型
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

let animals: Animal[] = [];
let dogs: Dog[] = [];

animals = dogs; // ✅ 协变：Dog[] 可以赋值给 Animal[]
// dogs = animals; // 错误：Animal[] 不能赋值给 Dog[]

// 但这是不安全的！
animals.push({ name: "Cat" }); // 现在 animals 包含了一个不是 Dog 的对象
// 但 dogs 引用的是同一个数组，所以 dogs 现在包含了 Cat
```

### 函数参数逆变

```typescript
// 函数参数是逆变的：如果 A 是 B 的子类型，则 (x: B) => void 是 (x: A) => void 的子类型
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let animalHandler: AnimalHandler = (animal: Animal) => {
  console.log(animal.name);
};

let dogHandler: DogHandler = (dog: Dog) => {
  console.log(dog.name);
  console.log(dog.breed);
};

// dogHandler = animalHandler; // ✅ 逆变：可以接受更通用的处理函数
// animalHandler = dogHandler; // 错误：不能接受更具体的处理函数

// 为什么？因为如果 animalHandler = dogHandler，然后调用：
// animalHandler({ name: "Cat" }); // dogHandler 期望 Dog，但收到了 Animal
```

### 函数返回类型协变

```typescript
// 函数返回类型是协变的：如果 A 是 B 的子类型，则 () => A 是 () => B 的子类型
type AnimalFactory = () => Animal;
type DogFactory = () => Dog;

let animalFactory: AnimalFactory = () => ({ name: "Animal" });
let dogFactory: DogFactory = () => ({ name: "Dog", breed: "Labrador" });

animalFactory = dogFactory; // ✅ 协变：返回 Dog 的函数可以赋值给返回 Animal 的函数
// dogFactory = animalFactory; // 错误：返回 Animal 的函数不能赋值给返回 Dog 的函数
```

### 双变（Bivariance）

```typescript
// 在 TypeScript 中，方法参数默认是双变的（为了兼容性）
interface Comparer<T> {
  compare(a: T, b: T): number;
}

let animalComparer: Comparer<Animal> = {
  compare(a: Animal, b: Animal) {
    return a.name.localeCompare(b.name);
  }
};

let dogComparer: Comparer<Dog> = {
  compare(a: Dog, b: Dog) {
    return a.breed.localeCompare(b.breed);
  }
};

// 在 strictFunctionTypes 关闭时（默认），这是允许的
animalComparer = dogComparer; // 可能允许
dogComparer = animalComparer; // 可能允许

// 开启 strictFunctionTypes 后，方法参数变为逆变
```

## 类型兼容性检查

### 赋值兼容性

```typescript
// TypeScript 检查赋值时的兼容性
let source: { x: number; y: number };
let target: { x: number };

target = source; // ✅ 可以：target 需要的属性 source 都有
// source = target; // 错误：source 需要 y，但 target 没有
```

### 函数调用兼容性

```typescript
function processPoint(point: { x: number; y: number }) {
  console.log(point.x, point.y);
}

let point = { x: 1, y: 2, z: 3 };
processPoint(point); // ✅ 可以：多余的属性 z 被忽略

// 但字面量对象会进行额外检查
processPoint({ x: 1, y: 2, z: 3 }); // 错误：多余的属性 z
```

### 泛型兼容性

```typescript
// 泛型类型在没有指定类型参数时，兼容性检查会使用 any
interface Empty<T> {}
let x: Empty<number>;
let y: Empty<string>;

x = y; // ✅ 可以：Empty 没有使用 T

// 但如果使用了类型参数，就不兼容了
interface NotEmpty<T> {
  data: T;
}
let x2: NotEmpty<number>;
let y2: NotEmpty<string>;

// x2 = y2; // 错误：类型参数不同，不兼容
```

## 类型兼容性的实际应用

### 接口扩展

```typescript
// 接口扩展体现了类型兼容性
interface Base {
  id: number;
}

interface Derived extends Base {
  name: string;
}

// Derived 兼容 Base
let base: Base = { id: 1 };
let derived: Derived = { id: 1, name: "test" };

base = derived; // ✅ 可以
```

### 类型收窄

```typescript
// 类型兼容性使得类型收窄成为可能
function process(value: string | number) {
  if (typeof value === "string") {
    // TypeScript 知道这里 value 是 string
    value.toUpperCase();
  } else {
    // TypeScript 知道这里 value 是 number
    value.toFixed(2);
  }
}
```

### 多态性

```typescript
// 利用类型兼容性实现多态
class Animal {
  makeSound() {
    console.log("Some sound");
  }
}

class Dog extends Animal {
  makeSound() {
    console.log("Woof!");
  }
}

class Cat extends Animal {
  makeSound() {
    console.log("Meow!");
  }
}

function makeAnimalsSound(animals: Animal[]) {
  animals.forEach(animal => animal.makeSound());
}

makeAnimalsSound([new Dog(), new Cat()]); // ✅ 多态调用
```

## 最佳实践

1. **理解结构化类型**：TypeScript 关注结构而非名称
2. **注意协变的不安全性**：数组协变可能导致类型错误
3. **使用 strictFunctionTypes**：让函数参数类型检查更严格
4. **理解逆变的意义**：函数参数逆变是类型安全的保证
5. **利用类型兼容性**：编写更灵活的代码，同时保持类型安全

