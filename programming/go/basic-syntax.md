# Go 基础语法

Go 语言（也称为 Golang）是一种简洁、高效的编程语言，由 Google 开发。本文将介绍 Go 语言的基础语法，帮助您快速入门。

## 程序结构

Go 程序由包（package）组成，包是 Go 代码的组织单位。每个 Go 程序都必须有一个 `main` 包和 `main` 函数作为程序的入口点。

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, 世界!")
}
```

## 变量声明

Go 支持多种变量声明方式：

### 标准声明

```go
var name string = "张三"
var age int = 25
var isActive bool = true
```

### 类型推断

```go
var name = "张三"    // 自动推断为 string 类型
var age = 25       // 自动推断为 int 类型
var isActive = true // 自动推断为 bool 类型
```

### 简短声明（仅在函数内部使用）

```go
name := "张三"
age := 25
isActive := true
```

## 基本数据类型

Go 语言提供了多种基本数据类型：

### 数值类型

- 整数：`int`, `int8`, `int16`, `int32`, `int64`, `uint`, `uint8`, `uint16`, `uint32`, `uint64`
- 浮点数：`float32`, `float64`
- 复数：`complex64`, `complex128`

```go
var i int = 42
var f float64 = 3.14
var c complex128 = 1 + 2i
```

### 字符串

```go
var s string = "Hello, 世界"
```

### 布尔值

```go
var b bool = true
```

## 控制结构

### 条件语句

```go
if x > 0 {
    fmt.Println("x 是正数")
} else if x < 0 {
    fmt.Println("x 是负数")
} else {
    fmt.Println("x 是零")
}
```

### 循环语句

Go 只有一种循环结构：`for` 循环。

```go
// 标准 for 循环
for i := 0; i < 5; i++ {
    fmt.Println(i)
}

// 类似 while 循环
i := 0
for i < 5 {
    fmt.Println(i)
    i++
}

// 无限循环
for {
    fmt.Println("无限循环")
    break // 使用 break 跳出循环
}
```

### switch 语句

```go
switch day {
case "星期一":
    fmt.Println("周一")
case "星期二":
    fmt.Println("周二")
default:
    fmt.Println("其他日子")
}
```

## 函数

Go 函数的基本语法如下：

```go
func functionName(param1 type1, param2 type2) returnType {
    // 函数体
    return value
}
```

示例：

```go
func add(x int, y int) int {
    return x + y
}

// 多返回值
func swap(x, y string) (string, string) {
    return y, x
}
```

## 数组和切片

### 数组

```go
var a [5]int // 声明一个长度为 5 的整数数组
a[0] = 1     // 设置元素

// 初始化数组
b := [3]int{1, 2, 3}
```

### 切片

```go
// 声明切片
var s []int

// 从数组创建切片
a := [5]int{1, 2, 3, 4, 5}
s = a[1:4] // s 现在包含 [2, 3, 4]

// 直接创建切片
s := []int{1, 2, 3}

// 使用 make 创建切片
s := make([]int, 5)    // 长度为 5 的切片
s := make([]int, 0, 5) // 长度为 0，容量为 5 的切片
```

## 映射（Map）

```go
// 声明映射
var m map[string]int

// 初始化映射
m = make(map[string]int)
m["小明"] = 90
m["小红"] = 85

// 简短声明
m := map[string]int{
    "小明": 90,
    "小红": 85,
}

// 访问映射
score := m["小明"]

// 检查键是否存在
score, exists := m["小刚"]
if exists {
    fmt.Println("小刚的分数是", score)
} else {
    fmt.Println("找不到小刚的分数")
}
```

## 结构体

```go
// 定义结构体
type Person struct {
    Name string
    Age  int
}

// 创建结构体实例
p := Person{Name: "张三", Age: 25}

// 访问结构体字段
fmt.Println(p.Name, p.Age)
```

## 接口

```go
// 定义接口
type Greeter interface {
    Greet() string
}

// 实现接口
type Chinese struct{}

func (c Chinese) Greet() string {
    return "你好!"
}

type American struct{}

func (a American) Greet() string {
    return "Hello!"
}

// 使用接口
func sayHello(g Greeter) {
    fmt.Println(g.Greet())
}

func main() {
    c := Chinese{}
    a := American{}
    
    sayHello(c) // 输出: 你好!
    sayHello(a) // 输出: Hello!
}
```

## 错误处理

Go 使用返回值而不是异常来处理错误：

```go
f, err := os.Open("filename.txt")
if err != nil {
    fmt.Println("打开文件时出错:", err)
    return
}
// 使用文件 f
```

## 总结

这篇文章介绍了 Go 语言的基础语法，包括变量声明、数据类型、控制结构、函数、数组、切片、映射、结构体、接口和错误处理等内容。掌握这些基础知识后，您就可以开始编写简单的 Go 程序了。

要深入学习 Go 语言，建议查阅 [Go 官方文档](https://golang.org/doc/) 和 [Go by Example](https://gobyexample.com/)。
