# Go 并发编程

Go 语言以其强大的并发特性而闻名，通过 goroutine 和 channel 提供了简洁而高效的并发编程模型。本文将介绍 Go 并发编程的核心概念和实践。

## 什么是并发？

并发是指程序的不同部分可以独立执行，而不必按顺序完成。在 Go 中，并发是通过 goroutine 和 channel 来实现的，这种设计基于 CSP（Communicating Sequential Processes，通信顺序进程）模型。

## Goroutine

Goroutine 是 Go 语言中的轻量级线程，由 Go 运行时管理。与传统线程相比，goroutine 的创建和管理成本极低，一个程序可以轻松创建数千甚至数百万个 goroutine。

### 创建 Goroutine

创建 goroutine 非常简单，只需在函数调用前添加 `go` 关键字：

```go
package main

import (
    "fmt"
    "time"
)

func sayHello() {
    fmt.Println("Hello, world!")
}

func main() {
    // 创建一个 goroutine 执行 sayHello 函数
    go sayHello()
    
    // 主函数继续执行
    fmt.Println("Main function")
    
    // 等待一段时间，确保 goroutine 有机会执行
    time.Sleep(100 * time.Millisecond)
}
```

### 匿名函数 Goroutine

也可以使用匿名函数创建 goroutine：

```go
go func() {
    fmt.Println("在 goroutine 中执行匿名函数")
}()
```

## Channel（通道）

Channel 是 goroutine 之间的通信机制，允许一个 goroutine 向另一个 goroutine 发送值。Channel 是类型化的，确保只有特定类型的数据可以通过通道传输。

### 创建和使用 Channel

```go
package main

import "fmt"

func main() {
    // 创建一个整数类型的通道
    ch := make(chan int)
    
    // 启动 goroutine 发送数据
    go func() {
        ch <- 42 // 发送值到通道
    }()
    
    // 从通道接收值
    value := <-ch
    fmt.Println("接收到的值:", value)
}
```

### 带缓冲的 Channel

默认情况下，channel 是无缓冲的，这意味着发送操作会阻塞，直到有接收者准备好接收数据。带缓冲的 channel 允许在没有接收者的情况下，发送一定数量的值：

```go
// 创建一个缓冲大小为 3 的整数通道
ch := make(chan int, 3)

// 可以发送 3 个值而不阻塞
ch <- 1
ch <- 2
ch <- 3

// 第 4 个发送操作将阻塞，直到通道中的值被接收
// ch <- 4 // 这里会阻塞

// 接收值
fmt.Println(<-ch) // 输出: 1
fmt.Println(<-ch) // 输出: 2
fmt.Println(<-ch) // 输出: 3
```

### 关闭 Channel

发送者可以关闭通道，表示不再有值要发送：

```go
close(ch)
```

接收者可以检测通道是否已关闭：

```go
value, ok := <-ch
if !ok {
    fmt.Println("通道已关闭")
}
```

### 遍历 Channel

可以使用 `range` 循环遍历通道中的值，直到通道关闭：

```go
package main

import "fmt"

func main() {
    ch := make(chan int, 5)
    
    // 发送值到通道
    for i := 0; i < 5; i++ {
        ch <- i
    }
    
    // 关闭通道
    close(ch)
    
    // 使用 range 遍历通道中的值
    for value := range ch {
        fmt.Println(value)
    }
}
```

## Select 语句

`select` 语句允许一个 goroutine 等待多个通信操作。它类似于 `switch` 语句，但每个 case 都是一个通信操作（发送或接收）。

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)
    
    // 启动两个 goroutine 发送数据
    go func() {
        time.Sleep(1 * time.Second)
        ch1 <- "来自通道 1 的消息"
    }()
    
    go func() {
        time.Sleep(2 * time.Second)
        ch2 <- "来自通道 2 的消息"
    }()
    
    // 使用 select 等待两个通道
    for i := 0; i < 2; i++ {
        select {
        case msg1 := <-ch1:
            fmt.Println(msg1)
        case msg2 := <-ch2:
            fmt.Println(msg2)
        }
    }
}
```

### 超时处理

`select` 可以与 `time.After` 结合使用，实现超时处理：

```go
select {
case res := <-ch:
    fmt.Println("接收到结果:", res)
case <-time.After(1 * time.Second):
    fmt.Println("操作超时")
}
```

### 非阻塞通道操作

`select` 语句可以包含一个 `default` 分支，当没有其他 case 准备好时执行，这使得通道操作变成非阻塞的：

```go
select {
case v := <-ch:
    fmt.Println("接收到值:", v)
default:
    fmt.Println("没有值可接收")
}
```

## 同步原语

除了通道，Go 还提供了传统的同步原语，如互斥锁和等待组。

### 互斥锁（Mutex）

互斥锁用于保护共享资源，确保同一时间只有一个 goroutine 可以访问它：

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

func main() {
    var mutex sync.Mutex
    counter := 0
    
    // 启动 100 个 goroutine
    for i := 0; i < 100; i++ {
        go func() {
            mutex.Lock()   // 获取锁
            counter++      // 更新共享变量
            mutex.Unlock() // 释放锁
        }()
    }
    
    // 等待所有 goroutine 完成
    time.Sleep(1 * time.Second)
    fmt.Println("计数器:", counter)
}
```

### 读写互斥锁（RWMutex）

读写互斥锁允许多个读操作同时进行，但写操作是互斥的：

```go
var rwMutex sync.RWMutex
var data map[string]string = make(map[string]string)

// 写操作
func write(key, value string) {
    rwMutex.Lock()         // 获取写锁
    defer rwMutex.Unlock() // 函数返回时释放锁
    
    data[key] = value
}

// 读操作
func read(key string) string {
    rwMutex.RLock()         // 获取读锁
    defer rwMutex.RUnlock() // 函数返回时释放锁
    
    return data[key]
}
```

### 等待组（WaitGroup）

等待组用于等待一组 goroutine 完成：

```go
package main

import (
    "fmt"
    "sync"
    "time"
)

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done() // 通知等待组该 goroutine 已完成
    
    fmt.Printf("工作者 %d 开始工作\n", id)
    time.Sleep(time.Second) // 模拟工作
    fmt.Printf("工作者 %d 完成工作\n", id)
}

func main() {
    var wg sync.WaitGroup
    
    // 启动 5 个工作者
    for i := 1; i <= 5; i++ {
        wg.Add(1) // 增加等待计数
        go worker(i, &wg)
    }
    
    // 等待所有工作者完成
    wg.Wait()
    fmt.Println("所有工作者已完成")
}
```

## 并发模式

Go 的并发特性支持多种并发模式，以下是一些常见的模式：

### 生产者-消费者模式

```go
package main

import (
    "fmt"
    "time"
)

func producer(ch chan<- int) {
    for i := 0; i < 5; i++ {
        ch <- i // 发送数据
        fmt.Printf("生产者发送: %d\n", i)
        time.Sleep(100 * time.Millisecond)
    }
    close(ch) // 关闭通道
}

func consumer(ch <-chan int) {
    for value := range ch {
        fmt.Printf("消费者接收: %d\n", value)
        time.Sleep(200 * time.Millisecond)
    }
}

func main() {
    ch := make(chan int, 2) // 带缓冲的通道
    
    go producer(ch)
    consumer(ch)
    
    fmt.Println("程序结束")
}
```

### 扇出-扇入模式

扇出是指启动多个 goroutine 处理输入，扇入是指将多个结果合并到一个通道：

```go
package main

import (
    "fmt"
    "sync"
)

// 扇出：多个 goroutine 从同一个通道读取数据
func fanOut(in <-chan int, numWorkers int) []<-chan int {
    workers := make([]<-chan int, numWorkers)
    for i := 0; i < numWorkers; i++ {
        workers[i] = worker(in, i)
    }
    return workers
}

func worker(in <-chan int, id int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            // 模拟处理
            result := n * n
            fmt.Printf("工作者 %d 处理 %d -> %d\n", id, n, result)
            out <- result
        }
    }()
    return out
}

// 扇入：将多个通道合并为一个通道
func fanIn(channels []<-chan int) <-chan int {
    var wg sync.WaitGroup
    out := make(chan int)
    
    // 为每个输入通道启动一个 goroutine
    wg.Add(len(channels))
    for _, ch := range channels {
        go func(c <-chan int) {
            defer wg.Done()
            for n := range c {
                out <- n
            }
        }(ch)
    }
    
    // 启动一个 goroutine 在所有输入关闭后关闭输出通道
    go func() {
        wg.Wait()
        close(out)
    }()
    
    return out
}

func main() {
    // 创建输入通道
    in := make(chan int, 10)
    
    // 发送数据
    go func() {
        for i := 1; i <= 10; i++ {
            in <- i
        }
        close(in)
    }()
    
    // 扇出到 3 个工作者
    workers := fanOut(in, 3)
    
    // 扇入结果
    results := fanIn(workers)
    
    // 收集结果
    var sum int
    for result := range results {
        sum += result
    }
    
    fmt.Printf("结果总和: %d\n", sum)
}
```

### 超时和取消

使用 `context` 包可以实现超时控制和取消操作：

```go
package main

import (
    "context"
    "fmt"
    "time"
)

func doWork(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            fmt.Println("工作被取消")
            return
        default:
            fmt.Println("工作进行中...")
            time.Sleep(500 * time.Millisecond)
        }
    }
}

func main() {
    // 创建一个可取消的 context
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel() // 确保所有路径都调用 cancel
    
    go doWork(ctx)
    
    // 等待工作完成或被取消
    time.Sleep(3 * time.Second)
    fmt.Println("主函数退出")
}
```

## 并发陷阱和最佳实践

### 竞态条件

竞态条件是并发程序中常见的问题，发生在多个 goroutine 同时访问共享数据时：

```go
// 错误示例：竞态条件
var counter int

func increment() {
    counter++ // 非原子操作
}

// 正确示例：使用互斥锁
var (
    counter int
    mutex   sync.Mutex
)

func safeIncrement() {
    mutex.Lock()
    counter++
    mutex.Unlock()
}
```

### 死锁

死锁发生在两个或多个 goroutine 相互等待对方释放资源：

```go
// 死锁示例
func main() {
    ch := make(chan int)
    ch <- 1 // 向无缓冲通道发送数据，但没有接收者，导致死锁
    <-ch
}
```

### 内存泄漏

goroutine 如果不正确终止，可能导致内存泄漏：

```go
// 可能导致内存泄漏的代码
for {
    go func() {
        // 这个 goroutine 永远不会结束
        for {
            // 无限循环
        }
    }()
}
```

### 最佳实践

1. **使用缓冲通道**：在适当的情况下使用缓冲通道可以减少阻塞。

2. **正确关闭通道**：只有发送者应该关闭通道，接收者不应该关闭通道。

3. **使用 select 处理多个通道**：使用 select 可以同时等待多个通道操作。

4. **使用 context 进行取消和超时控制**：context 包提供了一种优雅的方式来处理取消和超时。

5. **避免在 goroutine 中使用共享内存**：尽量通过通道通信而不是共享内存。

6. **使用 -race 标志检测竞态条件**：
   ```
   go run -race myprogram.go
   ```

7. **限制 goroutine 的数量**：创建过多的 goroutine 可能导致资源耗尽。

## 总结

Go 的并发模型基于 CSP 理念，通过 goroutine 和 channel 提供了简洁而强大的并发编程能力。掌握这些并发特性，可以帮助开发者编写高效、可靠的并发程序。

记住 Go 的并发哲学：
> "不要通过共享内存来通信，而是通过通信来共享内存。"

这种方法可以减少锁和同步的复杂性，使并发程序更容易理解和维护。
