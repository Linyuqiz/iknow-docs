# Rust 并发编程

Rust 提供了强大而安全的并发编程模型，通过所有权系统和类型检查在编译时防止数据竞争和其他常见的并发问题。本文将介绍 Rust 中的并发编程概念和实践。

## 并发与并行

在深入了解 Rust 的并发特性之前，让我们先明确几个概念：

- **并发（Concurrency）**：程序的不同部分可以独立执行，不必按顺序完成。
- **并行（Parallelism）**：程序的不同部分同时执行（通常在多个 CPU 核心上）。

Rust 提供了多种并发编程工具，包括线程、消息传递、共享状态、同步原语和异步编程。

## 线程

Rust 标准库提供了创建线程的能力，使用 `std::thread` 模块：

```rust
use std::thread;
use std::time::Duration;

fn main() {
    // 创建一个新线程
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("在新线程中: {}", i);
            thread::sleep(Duration::from_millis(1));
        }
    });

    // 主线程继续执行
    for i in 1..5 {
        println!("在主线程中: {}", i);
        thread::sleep(Duration::from_millis(1));
    }

    // 等待新线程完成
    handle.join().unwrap();
}
```

### 线程与所有权

Rust 的所有权系统确保线程安全。当在线程间传递数据时，需要考虑所有权转移：

```rust
use std::thread;

fn main() {
    let v = vec![1, 2, 3];

    // 使用 move 关键字将所有权转移到新线程
    let handle = thread::spawn(move || {
        println!("在新线程中: {:?}", v);
    });

    // 不能再使用 v
    // println!("{:?}", v);  // 错误：v 的值已被移动

    handle.join().unwrap();
}
```

## 消息传递

Rust 的并发模型受到 CSP（Communicating Sequential Processes，通信顺序进程）的影响，强调"通过通信来共享内存，而不是通过共享内存来通信"。

### 通道（Channel）

Rust 提供了通道（channel）用于线程间通信，通过 `std::sync::mpsc` 模块实现（mpsc 表示多生产者，单消费者）：

```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    // 创建通道
    let (tx, rx) = mpsc::channel();

    // 创建新线程，发送消息
    thread::spawn(move || {
        let vals = vec![
            String::from("你好"),
            String::from("来自"),
            String::from("线程"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    // 在主线程中接收消息
    for received in rx {
        println!("收到: {}", received);
    }
}
```

### 多生产者

可以克隆发送端来创建多个生产者：

```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    // 克隆发送端
    let tx1 = tx.clone();

    // 第一个生产者线程
    thread::spawn(move || {
        let vals = vec![
            String::from("你好"),
            String::from("来自"),
            String::from("线程1"),
        ];

        for val in vals {
            tx1.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    // 第二个生产者线程
    thread::spawn(move || {
        let vals = vec![
            String::from("更多"),
            String::from("消息"),
            String::from("线程2"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });

    // 接收所有消息
    for received in rx {
        println!("收到: {}", received);
    }
}
```

## 共享状态并发

虽然消息传递是一种很好的并发方式，但有时共享状态更为适合。Rust 提供了安全共享状态的工具。

### 互斥锁（Mutex）

互斥锁（Mutex，mutual exclusion）确保在任何时刻只有一个线程可以访问某些数据：

```rust
use std::sync::Mutex;
use std::thread;

fn main() {
    // 创建互斥锁
    let counter = Mutex::new(0);
    let mut handles = vec![];

    for _ in 0..10 {
        // 克隆互斥锁（错误：Mutex 不能被克隆）
        // let counter_clone = counter.clone();
        
        // 这里需要使用 Arc，见下一节
    }

    // 等待所有线程完成
    for handle in handles {
        handle.join().unwrap();
    }

    println!("结果: {}", *counter.lock().unwrap());
}
```

### 原子引用计数（Arc）

`Arc<T>`（Atomic Reference Counting）允许在线程间安全地共享所有权：

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    // 创建可在线程间共享的互斥锁
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        // 克隆 Arc，增加引用计数
        let counter_clone = Arc::clone(&counter);
        
        // 创建新线程
        let handle = thread::spawn(move || {
            // 获取锁并修改值
            let mut num = counter_clone.lock().unwrap();
            *num += 1;
        });
        
        handles.push(handle);
    }

    // 等待所有线程完成
    for handle in handles {
        handle.join().unwrap();
    }

    println!("结果: {}", *counter.lock().unwrap());
}
```

### 读写锁（RwLock）

`RwLock<T>` 允许多个读取器或一个写入器：

```rust
use std::sync::{Arc, RwLock};
use std::thread;

fn main() {
    let data = Arc::new(RwLock::new(vec![1, 2, 3]));
    let mut handles = vec![];

    // 创建读取线程
    for i in 0..3 {
        let data_clone = Arc::clone(&data);
        handles.push(thread::spawn(move || {
            // 获取读锁
            let data = data_clone.read().unwrap();
            println!("读取线程 {}: {:?}", i, *data);
        }));
    }

    // 创建写入线程
    let data_clone = Arc::clone(&data);
    handles.push(thread::spawn(move || {
        // 获取写锁
        let mut data = data_clone.write().unwrap();
        data.push(4);
        println!("写入后: {:?}", *data);
    }));

    // 等待所有线程完成
    for handle in handles {
        handle.join().unwrap();
    }
}
```

## 同步原语

Rust 标准库提供了多种同步原语：

### 原子类型

原子类型提供了不需要锁的原子操作：

```rust
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::thread;

fn main() {
    // 创建原子计数器
    let counter = Arc::new(AtomicUsize::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter_clone = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            // 原子地增加计数
            counter_clone.fetch_add(1, Ordering::SeqCst);
        });
        handles.push(handle);
    }

    // 等待所有线程完成
    for handle in handles {
        handle.join().unwrap();
    }

    println!("结果: {}", counter.load(Ordering::SeqCst));
}
```

### 屏障（Barrier）

屏障用于同步多个线程，确保它们在某一点同时继续执行：

```rust
use std::sync::{Arc, Barrier};
use std::thread;
use std::time::Duration;

fn main() {
    let mut handles = vec![];
    let barrier = Arc::new(Barrier::new(3));

    for i in 0..3 {
        let barrier_clone = Arc::clone(&barrier);
        handles.push(thread::spawn(move || {
            println!("线程 {} 开始工作", i);
            thread::sleep(Duration::from_secs(i));
            println!("线程 {} 到达屏障", i);
            
            // 等待所有线程到达屏障
            barrier_clone.wait();
            
            println!("线程 {} 继续执行", i);
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }
}
```

### 条件变量（Condvar）

条件变量允许线程等待某个条件变为真：

```rust
use std::sync::{Arc, Mutex, Condvar};
use std::thread;
use std::time::Duration;

fn main() {
    // 创建一对互斥锁和条件变量
    let pair = Arc::new((Mutex::new(false), Condvar::new()));
    let pair_clone = Arc::clone(&pair);

    // 创建等待线程
    let handle = thread::spawn(move || {
        let (lock, cvar) = &*pair_clone;
        let mut started = lock.lock().unwrap();
        
        // 等待条件变为真
        while !*started {
            println!("等待信号...");
            started = cvar.wait(started).unwrap();
        }
        
        println!("收到信号，继续执行!");
    });

    // 主线程休眠一段时间
    thread::sleep(Duration::from_secs(2));

    // 发送信号
    let (lock, cvar) = &*pair;
    let mut started = lock.lock().unwrap();
    *started = true;
    cvar.notify_one();
    println!("已发送信号");

    handle.join().unwrap();
}
```

## 无锁数据结构

Rust 生态系统提供了许多无锁数据结构，如 `crossbeam` 库中的无锁队列和栈：

```rust
use crossbeam_queue::ArrayQueue;
use std::sync::Arc;
use std::thread;

fn main() {
    // 创建容量为 100 的无锁队列
    let queue = Arc::new(ArrayQueue::new(100));
    let mut handles = vec![];

    // 生产者线程
    let queue_clone = Arc::clone(&queue);
    handles.push(thread::spawn(move || {
        for i in 0..10 {
            queue_clone.push(i).unwrap();
            println!("生产: {}", i);
        }
    }));

    // 消费者线程
    let queue_clone = Arc::clone(&queue);
    handles.push(thread::spawn(move || {
        for _ in 0..10 {
            while let Some(item) = queue_clone.pop() {
                println!("消费: {}", item);
            }
        }
    }));

    for handle in handles {
        handle.join().unwrap();
    }
}
```

## 线程池

线程池用于管理一组工作线程，避免频繁创建和销毁线程的开销：

```rust
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

// 简单的线程池实现
struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

impl ThreadPool {
    // 创建指定大小的线程池
    fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    // 执行任务
    fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);
        self.sender.send(job).unwrap();
    }
}

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            let job = receiver.lock().unwrap().recv().unwrap();
            println!("工作线程 {} 开始执行", id);
            job();
        });

        Worker { id, thread }
    }
}

fn main() {
    let pool = ThreadPool::new(4);

    for i in 0..8 {
        pool.execute(move || {
            println!("执行任务 {}", i);
            thread::sleep(std::time::Duration::from_secs(1));
        });
    }

    // 等待一段时间，让任务完成
    thread::sleep(std::time::Duration::from_secs(5));
}
```

## 异步编程

Rust 的异步编程模型基于 `Future` trait，通常与 `async`/`await` 语法一起使用：

```rust
use futures::executor::block_on;
use std::time::Duration;
use async_std::task;

// 异步函数
async fn do_something() {
    println!("开始执行异步任务");
    task::sleep(Duration::from_secs(2)).await;
    println!("异步任务完成");
}

// 组合多个异步任务
async fn do_two_things() {
    // 并发执行两个异步任务
    let future1 = do_something();
    let future2 = do_something();

    // 同时等待两个任务完成
    futures::join!(future1, future2);
}

fn main() {
    // 执行异步任务
    block_on(do_two_things());
}
```

### Tokio 运行时

Tokio 是 Rust 最流行的异步运行时之一：

```rust
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    // 创建两个任务
    let task1 = tokio::spawn(async {
        println!("任务 1 开始");
        sleep(Duration::from_secs(2)).await;
        println!("任务 1 完成");
        "任务 1 的结果"
    });

    let task2 = tokio::spawn(async {
        println!("任务 2 开始");
        sleep(Duration::from_secs(1)).await;
        println!("任务 2 完成");
        "任务 2 的结果"
    });

    // 等待两个任务完成
    let result1 = task1.await.unwrap();
    let result2 = task2.await.unwrap();

    println!("结果: {} 和 {}", result1, result2);
}
```

### 异步 I/O

异步编程特别适合 I/O 密集型任务：

```rust
use tokio::fs::File;
use tokio::io::{self, AsyncReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() -> io::Result<()> {
    // 异步打开文件
    let mut file = File::open("hello.txt").await?;

    // 异步读取内容
    let mut contents = vec![];
    file.read_to_end(&mut contents).await?;
    println!("文件内容: {:?}", contents);

    // 异步写入文件
    let mut file = File::create("output.txt").await?;
    file.write_all(b"Hello, async world!").await?;

    Ok(())
}
```

## 并发模式

### 生产者-消费者模式

```rust
use std::sync::{Arc, Mutex};
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    // 创建通道
    let (tx, rx) = mpsc::channel();
    let rx = Arc::new(Mutex::new(rx));

    // 创建多个消费者
    let mut handles = vec![];
    for i in 0..3 {
        let rx_clone = Arc::clone(&rx);
        handles.push(thread::spawn(move || {
            loop {
                let received = {
                    let rx_guard = rx_clone.lock().unwrap();
                    match rx_guard.try_recv() {
                        Ok(val) => Some(val),
                        Err(_) => None,
                    }
                };

                if let Some(val) = received {
                    println!("消费者 {} 接收到: {}", i, val);
                } else {
                    thread::sleep(Duration::from_millis(100));
                }
            }
        }));
    }

    // 生产者
    for i in 0..10 {
        tx.send(i).unwrap();
        println!("生产: {}", i);
        thread::sleep(Duration::from_millis(200));
    }

    // 等待一段时间
    thread::sleep(Duration::from_secs(3));
}
```

### 工作窃取模式

工作窃取是一种任务调度算法，允许空闲线程从其他线程的队列中"窃取"任务：

```rust
use crossbeam::deque::{Injector, Steal, Worker};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

fn main() {
    // 全局任务队列
    let injector = Arc::new(Injector::new());
    
    // 向全局队列添加任务
    for i in 0..100 {
        injector.push(i);
    }

    // 创建工作线程
    let mut handles = vec![];
    let workers_count = 4;
    let workers: Vec<_> = (0..workers_count).map(|_| Worker::new_fifo()).collect();
    let stealer_refs: Vec<_> = workers.iter().map(|w| w.stealer()).collect();
    let stealers = Arc::new(stealer_refs);

    for (i, worker) in workers.into_iter().enumerate() {
        let injector_clone = Arc::clone(&injector);
        let stealers_clone = Arc::clone(&stealers);
        
        handles.push(thread::spawn(move || {
            let mut processed = 0;
            
            loop {
                // 尝试从自己的队列中获取任务
                if let Some(task) = worker.pop() {
                    println!("工作线程 {} 处理任务 {}", i, task);
                    processed += 1;
                    thread::sleep(Duration::from_millis(10));
                    continue;
                }
                
                // 尝试从全局队列中获取任务
                match injector_clone.steal_batch_and_pop(&worker) {
                    Steal::Success(task) => {
                        println!("工作线程 {} 从全局队列获取任务 {}", i, task);
                        processed += 1;
                        thread::sleep(Duration::from_millis(10));
                        continue;
                    }
                    Steal::Empty => {}
                    Steal::Retry => continue,
                }
                
                // 尝试从其他工作线程窃取任务
                let mut found = false;
                for (j, stealer) in stealers_clone.iter().enumerate() {
                    if i == j {
                        continue; // 不从自己的队列窃取
                    }
                    
                    match stealer.steal_batch_and_pop(&worker) {
                        Steal::Success(task) => {
                            println!("工作线程 {} 从工作线程 {} 窃取任务 {}", i, j, task);
                            processed += 1;
                            found = true;
                            thread::sleep(Duration::from_millis(10));
                            break;
                        }
                        Steal::Empty => {}
                        Steal::Retry => continue,
                    }
                }
                
                if found {
                    continue;
                }
                
                // 如果没有任务可做，休眠一段时间
                thread::sleep(Duration::from_millis(10));
                
                // 如果处理了足够多的任务，退出循环
                if processed >= 25 {
                    println!("工作线程 {} 完成，处理了 {} 个任务", i, processed);
                    break;
                }
            }
        }));
    }

    for handle in handles {
        handle.join().unwrap();
    }
}
```

## 并发陷阱和最佳实践

### 死锁

死锁发生在两个或多个线程相互等待对方释放资源：

```rust
use std::sync::{Mutex, MutexGuard};
use std::thread;
use std::time::Duration;

fn main() {
    let mutex_a = Mutex::new(0);
    let mutex_b = Mutex::new(0);

    // 这可能导致死锁
    let handle_a = thread::spawn(move || {
        // 获取锁 A
        let mut a = mutex_a.lock().unwrap();
        println!("线程 A 获取了锁 A");
        
        // 休眠一段时间，增加死锁可能性
        thread::sleep(Duration::from_millis(100));
        
        // 尝试获取锁 B
        println!("线程 A 尝试获取锁 B");
        let mut b = mutex_b.lock().unwrap();
        
        // 修改数据
        *a += 1;
        *b += 1;
    });

    let handle_b = thread::spawn(move || {
        // 获取锁 B
        let mut b = mutex_b.lock().unwrap();
        println!("线程 B 获取了锁 B");
        
        // 休眠一段时间，增加死锁可能性
        thread::sleep(Duration::from_millis(100));
        
        // 尝试获取锁 A
        println!("线程 B 尝试获取锁 A");
        let mut a = mutex_a.lock().unwrap();
        
        // 修改数据
        *b += 1;
        *a += 1;
    });

    handle_a.join().unwrap();
    handle_b.join().unwrap();
}
```

避免死锁的方法：
1. 始终以相同的顺序获取锁
2. 使用超时锁
3. 使用死锁检测工具

### 竞态条件

竞态条件发生在程序的行为依赖于线程执行的相对时序：

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let counter_clone = Arc::clone(&counter);

    // 创建新线程
    let handle = thread::spawn(move || {
        let mut num = counter_clone.lock().unwrap();
        
        // 在持有锁的情况下休眠，阻塞其他线程
        thread::sleep(std::time::Duration::from_secs(1));
        
        *num += 1;
    });

    // 主线程也尝试修改计数器
    {
        let mut num = counter.lock().unwrap();
        *num += 1;
    }

    handle.join().unwrap();
    println!("结果: {}", *counter.lock().unwrap());
}
```

避免竞态条件：
1. 使用适当的同步原语
2. 减少锁的持有时间
3. 使用无锁数据结构

### 最佳实践

1. **优先使用消息传递**：当可能时，优先使用通道而不是共享状态。

2. **避免过度同步**：只在必要时使用同步原语，避免不必要的锁。

3. **考虑使用 `parking_lot` 库**：它提供了比标准库更高效的互斥锁和读写锁。

4. **使用线程局部存储**：对于线程私有数据，使用线程局部存储避免同步开销。

5. **使用 `rayon` 进行并行计算**：对于数据并行任务，考虑使用 `rayon` 库。

6. **使用 `crossbeam` 进行复杂并发**：对于高级并发场景，考虑使用 `crossbeam` 库。

7. **使用 `tokio` 或 `async-std` 进行异步 I/O**：对于 I/O 密集型应用，使用异步运行时。

8. **限制线程数量**：避免创建过多线程，通常线程数应该与 CPU 核心数相当。

## 总结

Rust 提供了丰富的并发编程工具，从低级的线程和同步原语到高级的异步编程模型。Rust 的所有权系统和类型系统在编译时防止了许多常见的并发错误，如数据竞争，使并发编程更加安全和可靠。

通过选择合适的并发模型和工具，遵循最佳实践，您可以编写高效、安全的并发 Rust 程序。
