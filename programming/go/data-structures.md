# Go 数据结构

Go 语言提供了多种内置的数据结构，帮助开发者高效地组织和管理数据。本文将介绍 Go 中常用的数据结构及其使用方法。

## 数组（Array）

数组是固定长度的同类型元素序列。在 Go 中，数组的长度是类型的一部分，这意味着 `[5]int` 和 `[10]int` 是不同的类型。

```go
// 声明一个长度为 5 的整数数组
var a [5]int

// 初始化数组
b := [3]int{1, 2, 3}

// 使用 ... 让编译器计算长度
c := [...]int{1, 2, 3, 4, 5} // 长度为 5 的数组

// 访问数组元素
fmt.Println(b[0]) // 输出: 1

// 获取数组长度
fmt.Println(len(c)) // 输出: 5
```

### 多维数组

```go
// 声明一个 2x3 的二维数组
var matrix [2][3]int

// 初始化二维数组
matrix = [2][3]int{
    {1, 2, 3},
    {4, 5, 6},
}

// 访问二维数组元素
fmt.Println(matrix[1][2]) // 输出: 6
```

## 切片（Slice）

切片是对数组的一种轻量级的抽象，提供了更灵活的接口来处理序列数据。切片是引用类型，指向底层的数组。

```go
// 从数组创建切片
a := [5]int{1, 2, 3, 4, 5}
s := a[1:4] // s 包含 a[1], a[2], a[3]，即 [2, 3, 4]

// 直接创建切片
s1 := []int{1, 2, 3}

// 使用 make 创建切片
s2 := make([]int, 5)    // 长度为 5，容量为 5 的切片
s3 := make([]int, 0, 5) // 长度为 0，容量为 5 的切片

// 切片的长度和容量
fmt.Println(len(s2), cap(s2)) // 输出: 5 5
fmt.Println(len(s3), cap(s3)) // 输出: 0 5
```

### 切片操作

```go
// 追加元素
s := []int{1, 2, 3}
s = append(s, 4, 5)      // s 现在是 [1, 2, 3, 4, 5]
s = append(s, []int{6, 7, 8}...) // s 现在是 [1, 2, 3, 4, 5, 6, 7, 8]

// 复制切片
s1 := []int{1, 2, 3}
s2 := make([]int, len(s1))
copy(s2, s1) // s2 现在是 [1, 2, 3] 的副本

// 删除元素（通过重新切片）
s = []int{1, 2, 3, 4, 5}
// 删除索引为 2 的元素
s = append(s[:2], s[3:]...) // s 现在是 [1, 2, 4, 5]
```

## 映射（Map）

映射是一种无序的键值对集合，类似于其他语言中的字典或哈希表。

```go
// 声明映射
var m map[string]int

// 初始化映射
m = make(map[string]int)

// 添加键值对
m["apple"] = 1
m["banana"] = 2
m["orange"] = 3

// 简短声明并初始化
m1 := map[string]int{
    "apple":  1,
    "banana": 2,
    "orange": 3,
}

// 访问映射元素
fmt.Println(m["apple"]) // 输出: 1

// 检查键是否存在
value, exists := m["grape"]
if exists {
    fmt.Println("grape 的值是", value)
} else {
    fmt.Println("grape 不存在于映射中")
}

// 删除键值对
delete(m, "banana")

// 获取映射长度
fmt.Println(len(m)) // 输出映射中键值对的数量
```

## 结构体（Struct）

结构体是一种用户自定义的类型，可以包含多个不同类型的字段。

```go
// 定义结构体
type Person struct {
    Name    string
    Age     int
    Address string
}

// 创建结构体实例
p1 := Person{
    Name:    "张三",
    Age:     30,
    Address: "北京市",
}

// 简短初始化（按字段顺序）
p2 := Person{"李四", 25, "上海市"}

// 访问结构体字段
fmt.Println(p1.Name, p1.Age) // 输出: 张三 30

// 结构体指针
p := &Person{"王五", 35, "广州市"}
fmt.Println(p.Name) // 输出: 王五（Go 自动解引用）
```

### 嵌套结构体

```go
type Address struct {
    City    string
    Street  string
    ZipCode string
}

type Employee struct {
    Name    string
    Age     int
    Address Address // 嵌套结构体
}

// 创建嵌套结构体
e := Employee{
    Name: "赵六",
    Age:  40,
    Address: Address{
        City:    "深圳市",
        Street:  "科技路",
        ZipCode: "518000",
    },
}

// 访问嵌套字段
fmt.Println(e.Address.City) // 输出: 深圳市
```

### 匿名字段（嵌入）

```go
type Person struct {
    Name string
    Age  int
}

type Employee struct {
    Person  // 匿名嵌入 Person
    Company string
    Salary  float64
}

// 创建带有匿名字段的结构体
e := Employee{
    Person: Person{
        Name: "张三",
        Age:  30,
    },
    Company: "ABC科技",
    Salary:  10000,
}

// 直接访问嵌入字段的属性
fmt.Println(e.Name, e.Age) // 输出: 张三 30
```

## 链表

Go 标准库中没有内置的链表类型，但可以使用 `container/list` 包：

```go
import (
    "container/list"
    "fmt"
)

func main() {
    // 创建新链表
    l := list.New()

    // 在链表尾部添加元素
    l.PushBack("第一个")
    l.PushBack("第二个")
    l.PushBack("第三个")

    // 在链表头部添加元素
    l.PushFront("第零个")

    // 遍历链表
    for e := l.Front(); e != nil; e = e.Next() {
        fmt.Println(e.Value)
    }

    // 获取链表长度
    fmt.Println("链表长度:", l.Len())
}
```

## 堆（Heap）

Go 提供了 `container/heap` 包来实现堆数据结构：

```go
import (
    "container/heap"
    "fmt"
)

// 定义一个整数切片类型
type IntHeap []int

// 实现 heap.Interface 所需的方法
func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] } // 小顶堆
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *IntHeap) Push(x interface{}) {
    *h = append(*h, x.(int))
}

func (h *IntHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

func main() {
    h := &IntHeap{2, 1, 5}
    heap.Init(h)
    heap.Push(h, 3)
    fmt.Printf("最小值: %d\n", (*h)[0])
    for h.Len() > 0 {
        fmt.Printf("%d ", heap.Pop(h))
    }
}
```

## 集合（Set）

Go 没有内置的集合类型，但可以使用 map 来模拟集合：

```go
// 使用 map[Type]bool 实现集合
set := make(map[string]bool)

// 添加元素
set["apple"] = true
set["banana"] = true
set["orange"] = true

// 检查元素是否存在
if set["apple"] {
    fmt.Println("apple 在集合中")
}

// 删除元素
delete(set, "banana")

// 获取集合大小
fmt.Println("集合大小:", len(set))

// 遍历集合
for item := range set {
    fmt.Println(item)
}
```

## 队列和栈

Go 没有内置的队列和栈，但可以使用切片来实现：

### 栈（使用切片）

```go
// 创建栈
stack := []string{}

// 入栈
stack = append(stack, "第一个")
stack = append(stack, "第二个")
stack = append(stack, "第三个")

// 出栈
if len(stack) > 0 {
    n := len(stack) - 1
    item := stack[n]
    stack = stack[:n]
    fmt.Println("出栈元素:", item)
}

// 查看栈顶元素
if len(stack) > 0 {
    fmt.Println("栈顶元素:", stack[len(stack)-1])
}
```

### 队列（使用切片）

```go
// 创建队列
queue := []string{}

// 入队
queue = append(queue, "第一个")
queue = append(queue, "第二个")
queue = append(queue, "第三个")

// 出队
if len(queue) > 0 {
    item := queue[0]
    queue = queue[1:]
    fmt.Println("出队元素:", item)
}

// 查看队首元素
if len(queue) > 0 {
    fmt.Println("队首元素:", queue[0])
}
```

## 总结

Go 语言提供了丰富的数据结构，包括内置的数组、切片、映射和结构体，以及标准库中的链表和堆。这些数据结构为不同的应用场景提供了灵活的解决方案。选择合适的数据结构对于编写高效的 Go 程序至关重要。

在实际开发中，应根据具体需求选择合适的数据结构，考虑因素包括：数据访问模式、内存使用、性能要求等。
