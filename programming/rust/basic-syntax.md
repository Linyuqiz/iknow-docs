# Rust 基础语法

Rust 是一种系统级编程语言，专注于安全性、并发性和性能。本文将介绍 Rust 的基础语法，帮助您快速入门这门强大的语言。

## 安装 Rust

在开始之前，您需要安装 Rust 工具链。推荐使用官方的安装工具 `rustup`：

```bash
# Linux 或 macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# 从 https://rustup.rs 下载并运行安装程序
```

安装完成后，可以通过以下命令验证安装：

```bash
rustc --version
cargo --version
```

## 第一个 Rust 程序

创建一个简单的 "Hello, World!" 程序：

```rust
fn main() {
    println!("Hello, 世界!");
}
```

将代码保存为 `hello.rs`，然后编译并运行：

```bash
rustc hello.rs
./hello
```

## Cargo 基础

Cargo 是 Rust 的包管理器和构建系统。创建新项目：

```bash
cargo new hello_cargo
cd hello_cargo
```

构建和运行项目：

```bash
cargo build      # 构建项目
cargo run        # 构建并运行项目
cargo check      # 检查代码是否能编译，但不生成可执行文件
cargo build --release  # 生成优化的发布版本
```

## 变量和可变性

Rust 中的变量默认是不可变的：

```rust
let x = 5;  // 不可变变量
// x = 6;   // 错误：不能给不可变变量赋值

let mut y = 5;  // 可变变量
y = 6;          // 正确
```

### 常量

常量使用 `const` 关键字声明，必须指定类型：

```rust
const MAX_POINTS: u32 = 100_000;
```

### 隐藏（Shadowing）

可以使用相同名称声明新变量，这会隐藏之前的变量：

```rust
let x = 5;
let x = x + 1;  // 新的 x 是 6
let x = x * 2;  // 新的 x 是 12
```

## 数据类型

### 标量类型

Rust 有四种主要的标量类型：

#### 整数

| 长度    | 有符号  | 无符号  |
|--------|--------|--------|
| 8-bit   | i8     | u8     |
| 16-bit  | i16    | u16    |
| 32-bit  | i32    | u32    |
| 64-bit  | i64    | u64    |
| 128-bit | i128   | u128   |
| arch    | isize  | usize  |

```rust
let a: i32 = -42;
let b: u32 = 42;
let c = 0xff;  // 十六进制
let d = 0o77;  // 八进制
let e = 0b1111_0000;  // 二进制
```

#### 浮点数

```rust
let f = 2.0;      // f64（默认）
let g: f32 = 3.0; // f32
```

#### 布尔值

```rust
let t = true;
let f: bool = false;
```

#### 字符

Rust 的 `char` 类型是 Unicode 标量值，占用 4 字节：

```rust
let c = 'z';
let z = 'ℤ';
let heart_eyed_cat = '😻';
```

### 复合类型

#### 元组

元组是固定长度的不同类型值的集合：

```rust
let tup: (i32, f64, u8) = (500, 6.4, 1);

// 解构
let (x, y, z) = tup;
println!("y 的值是: {}", y);

// 使用索引访问
let five_hundred = tup.0;
let six_point_four = tup.1;
```

#### 数组

数组是固定长度的相同类型元素的集合：

```rust
let a = [1, 2, 3, 4, 5];
let b: [i32; 5] = [1, 2, 3, 4, 5];  // 显式指定类型和长度
let c = [3; 5];  // 等同于 [3, 3, 3, 3, 3]

// 访问数组元素
let first = a[0];
let second = a[1];
```

## 函数

Rust 中的函数使用 `fn` 关键字声明：

```rust
fn main() {
    println!("Hello, world!");
    another_function(5, 6);
}

fn another_function(x: i32, y: i32) {
    println!("x 的值是: {}", x);
    println!("y 的值是: {}", y);
}
```

### 返回值

函数可以返回值，返回类型在箭头 `->` 后指定：

```rust
fn five() -> i32 {
    5  // 注意没有分号，这是一个表达式，会被返回
}

fn main() {
    let x = five();
    println!("x 的值是: {}", x);
}
```

## 控制流

### if 表达式

```rust
let number = 6;

if number % 4 == 0 {
    println!("number 能被 4 整除");
} else if number % 3 == 0 {
    println!("number 能被 3 整除");
} else if number % 2 == 0 {
    println!("number 能被 2 整除");
} else {
    println!("number 不能被 4、3 或 2 整除");
}
```

if 可以在 let 语句中使用：

```rust
let condition = true;
let number = if condition { 5 } else { 6 };
```

### 循环

Rust 提供三种循环：`loop`、`while` 和 `for`。

#### loop

```rust
let mut counter = 0;

let result = loop {
    counter += 1;

    if counter == 10 {
        break counter * 2;  // 从循环返回值
    }
};

println!("结果是: {}", result);  // 输出 20
```

#### while

```rust
let mut number = 3;

while number != 0 {
    println!("{}!", number);
    number -= 1;
}

println!("发射!");
```

#### for

```rust
let a = [10, 20, 30, 40, 50];

for element in a.iter() {
    println!("值是: {}", element);
}

// 使用范围
for number in 1..4 {  // 不包含上限
    println!("{}!", number);
}
// 输出: 1! 2! 3!

// 使用反向范围
for number in (1..4).rev() {
    println!("{}!", number);
}
// 输出: 3! 2! 1!
```

## 所有权系统

所有权是 Rust 最独特的特性，它使 Rust 能够在不需要垃圾收集器的情况下保证内存安全。

### 所有权规则

1. Rust 中的每个值都有一个被称为其所有者的变量。
2. 值在任一时刻有且只有一个所有者。
3. 当所有者（变量）离开作用域，这个值将被丢弃。

```rust
{                      // s 在这里无效，它尚未声明
    let s = "hello";   // 从此处起，s 是有效的
    // 使用 s
}                      // 此作用域已结束，s 不再有效
```

### 移动（Move）

当将一个变量赋值给另一个变量时，数据会被移动：

```rust
let s1 = String::from("hello");
let s2 = s1;  // s1 被移动到 s2，s1 不再有效

// println!("{}", s1);  // 错误：s1 的值已被移动
```

### 克隆（Clone）

如果需要深度复制数据，可以使用 `clone` 方法：

```rust
let s1 = String::from("hello");
let s2 = s1.clone();  // 深度复制数据

println!("s1 = {}, s2 = {}", s1, s2);  // 两者都有效
```

### 函数和所有权

将值传递给函数会移动或复制，就像赋值一样：

```rust
fn main() {
    let s = String::from("hello");  // s 进入作用域
    
    takes_ownership(s);             // s 的值移动到函数里
    // println!("{}", s);           // 错误：s 已失效
    
    let x = 5;                      // x 进入作用域
    
    makes_copy(x);                  // x 应该移动，但 i32 是 Copy 的，所以仍可使用 x
    println!("{}", x);              // 正确
}

fn takes_ownership(some_string: String) {
    println!("{}", some_string);
}  // some_string 离开作用域并调用 `drop` 方法

fn makes_copy(some_integer: i32) {
    println!("{}", some_integer);
}  // some_integer 离开作用域，不会有特殊操作
```

## 引用和借用

引用允许您引用某个值而不获取其所有权：

```rust
fn main() {
    let s1 = String::from("hello");
    
    let len = calculate_length(&s1);  // 传递引用
    
    println!("'{}' 的长度是 {}。", s1, len);  // s1 仍然有效
}

fn calculate_length(s: &String) -> usize {  // 接收引用
    s.len()
}  // s 离开作用域，但不影响 s1，因为它没有所有权
```

### 可变引用

```rust
fn main() {
    let mut s = String::from("hello");
    
    change(&mut s);  // 传递可变引用
    
    println!("{}", s);  // 输出 "hello, world"
}

fn change(s: &mut String) {  // 接收可变引用
    s.push_str(", world");
}
```

可变引用有一个重要限制：在特定作用域中，对于特定数据，只能有一个可变引用：

```rust
let mut s = String::from("hello");

let r1 = &mut s;
// let r2 = &mut s;  // 错误：不能同时有两个可变引用

println!("{}", r1);
```

此外，不能同时拥有可变引用和不可变引用：

```rust
let mut s = String::from("hello");

let r1 = &s;     // 不可变引用
let r2 = &s;     // 不可变引用
// let r3 = &mut s;  // 错误：已经有不可变引用，不能再有可变引用

println!("{} and {}", r1, r2);
```

## 切片

切片是对集合中部分连续序列的引用：

```rust
let s = String::from("hello world");

let hello = &s[0..5];  // 或 &s[..5]
let world = &s[6..11]; // 或 &s[6..]
let whole = &s[..];    // 整个字符串的切片
```

字符串字面值是切片：

```rust
let s = "Hello, world!";  // s 的类型是 &str
```

## 结构体

结构体是自定义数据类型，可以命名多个相关的值：

```rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}

fn main() {
    let mut user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };
    
    user1.email = String::from("anotheremail@example.com");
    
    // 使用结构体更新语法
    let user2 = User {
        email: String::from("another@example.com"),
        ..user1  // 其余字段与 user1 相同
    };
}
```

### 元组结构体

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

let black = Color(0, 0, 0);
let origin = Point(0, 0, 0);
```

### 方法

方法是定义在结构体（或枚举、trait 对象）上下文中的函数：

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
    
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
    
    // 关联函数（不接收 self）
    fn square(size: u32) -> Rectangle {
        Rectangle { width: size, height: size }
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    
    println!("矩形面积是 {} 平方像素。", rect1.area());
    
    let sq = Rectangle::square(20);  // 调用关联函数
}
```

## 枚举

枚举允许您定义一个类型，该类型的值只能是几个变体之一：

```rust
enum IpAddrKind {
    V4,
    V6,
}

let four = IpAddrKind::V4;
let six = IpAddrKind::V6;
```

枚举变体可以包含数据：

```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

let home = IpAddr::V4(127, 0, 0, 1);
let loopback = IpAddr::V6(String::from("::1"));
```

### Option 枚举

Rust 没有空值（null），但有一个表示值存在或不存在的枚举 `Option<T>`：

```rust
enum Option<T> {
    Some(T),
    None,
}

let some_number = Some(5);
let some_string = Some("a string");
let absent_number: Option<i32> = None;
```

## 模式匹配

### match 表达式

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

匹配 `Option<T>`：

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```

### if let

`if let` 是 `match` 的简化版本，当只关心一种模式时很有用：

```rust
let some_u8_value = Some(0u8);

// 使用 match
match some_u8_value {
    Some(3) => println!("三"),
    _ => (),
}

// 使用 if let
if let Some(3) = some_u8_value {
    println!("三");
}
```

## 模块系统

### 包和 Crate

- **包（Package）**：一个或多个 crate 的集合，包含 Cargo.toml 文件。
- **Crate**：一个模块的树形结构，产生一个库或可执行文件。

### 模块

模块用于组织代码和控制项（函数、结构体等）的私有性：

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
        fn seat_at_table() {}
    }
    
    mod serving {
        fn take_order() {}
        fn serve_order() {}
        fn take_payment() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();
    
    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```

### use 关键字

`use` 关键字将名称引入作用域：

```rust
use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

## 错误处理

Rust 将错误分为两类：可恢复错误和不可恢复错误。

### 不可恢复错误

使用 `panic!` 宏处理不可恢复错误：

```rust
fn main() {
    panic!("crash and burn");
}
```

### 可恢复错误

使用 `Result<T, E>` 枚举处理可恢复错误：

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}

use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let f = File::open("hello.txt");
    
    let f = match f {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => match File::create("hello.txt") {
                Ok(fc) => fc,
                Err(e) => panic!("创建文件时出现问题: {:?}", e),
            },
            other_error => panic!("打开文件时出现问题: {:?}", other_error),
        },
    };
}
```

使用 `?` 运算符简化错误处理：

```rust
use std::fs::File;
use std::io;
use std::io::Read;

fn read_username_from_file() -> Result<String, io::Error> {
    let mut f = File::open("hello.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}
```

## 泛型

泛型允许您编写适用于多种类型的代码：

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    
    for item in list.iter() {
        if item > largest {
            largest = item;
        }
    }
    
    largest
}

struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}
```

## Trait

Trait 定义共享行为：

```rust
pub trait Summary {
    fn summarize(&self) -> String;
    
    fn default_impl(&self) -> String {
        String::from("(阅读更多...)")
    }
}

pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}
```

Trait 作为参数：

```rust
pub fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}

// 等价于
pub fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}
```

## 生命周期

生命周期确保引用在使用时有效：

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

结构体中的生命周期：

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.')
        .next()
        .expect("Could not find a '.'");
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```

## 总结

本文介绍了 Rust 的基础语法和核心概念，包括变量、数据类型、函数、控制流、所有权系统、结构体、枚举、模块系统、错误处理、泛型、trait 和生命周期。掌握这些基础知识后，您就可以开始编写 Rust 程序了。

要深入学习 Rust，建议阅读 [Rust 官方文档](https://www.rust-lang.org/learn) 和 [Rust 程序设计语言](https://doc.rust-lang.org/book/) 书籍。
