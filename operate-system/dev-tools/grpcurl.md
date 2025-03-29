# gRPCurl 工具使用指南

gRPCurl 是一个命令行工具，类似于 curl，但专为 gRPC 设计。它允许开发者与 gRPC 服务进行交互，查看服务定义、调用方法并获取响应。

## 什么是 gRPC

gRPC 是一个高性能、开源的远程过程调用 (RPC) 框架，可以在任何环境中运行。它使客户端和服务器应用程序能够透明地通信，并使构建连接系统变得更加简单。

主要特点：
- 使用 Protocol Buffers 作为接口定义语言
- 支持多种编程语言（Go, Java, Python 等）
- 支持双向流式传输
- 内置身份验证、负载均衡和健康检查

## 工具安装

在 macOS 上，可以使用 Homebrew 安装 gRPCurl：

```bash
brew install grpcurl
```

对于其他操作系统，可以从 [GitHub 仓库](https://github.com/fullstorydev/grpcurl) 下载预编译的二进制文件。

## 基本使用

### 查看服务

列出服务器上所有可用的 gRPC 服务：

```bash
grpcurl -plaintext 10.0.7.146:1114 list
```

返回结果示例：
```
service_monitor.ServiceMonitorManagement
grpc.reflection.v1alpha.ServerReflection
```

::: tip 提示
`-plaintext` 参数表示使用非加密连接。在生产环境中，应该使用 TLS 加密连接。
:::

### 查看接口

列出特定服务的所有方法：

```bash
grpcurl -plaintext 10.0.7.146:1114 list service_monitor.ServiceMonitorManagement
```

返回结果示例：
```
service_monitor.ServiceMonitorManagement.GetServiceLogLineChartData
service_monitor.ServiceMonitorManagement.ListService
service_monitor.ServiceMonitorManagement.ListServiceLog
```

### 查看接口定义

查看特定服务的详细定义：

```bash
grpcurl -plaintext 10.0.7.146:1114 describe service_monitor.ServiceMonitorManagement
```

返回结果示例：
```
service_monitor.ServiceMonitorManagement is a service:
service ServiceMonitorManagement {
  rpc GetServiceLogLineChartData ( .service_monitor.GetServiceLogLineChartDataRequest ) returns ( .service_monitor.GetServiceLogLineChartDataResponse );
  rpc ListService ( .service_monitor.ListServiceRequest ) returns ( .service_monitor.ListServiceResponse );
  rpc ListServiceLog ( .service_monitor.ListServiceLogRequest ) returns ( .service_monitor.ListServiceLogResponse );
}
```

### 查看接口参数定义

查看特定请求或响应类型的定义：

```bash
grpcurl -plaintext 10.0.7.146:1114 describe .service_monitor.ListServiceLogRequest
```

返回结果示例：
```
service_monitor.ListServiceLogRequest is a message:
message ListServiceLogRequest {
  repeated string services = 1;
  int64 start_time = 2;
  int64 end_time = 3;
  .service_monitor.Page page = 4;
}
```

## 调用方法

### 直接调用

#### 空参接口

调用不需要参数的方法：

```bash
grpcurl -plaintext -d '' 10.0.7.146:1114 service_monitor.ServiceMonitorManagement.ListService
```

返回结果示例：
```json
{
  "services": [
    {
      "name": "api",
      "status": "running"
    },
    {
      "name": "psp",
      "status": "running"
    }
  ]
}
```

::: warning 注意
`-d` 参数用于指定请求数据。即使是空参数的方法，也需要使用 `-d ''` 来指定空的请求体。
:::

#### 单对象接口

调用需要简单参数的方法：

```bash
grpcurl -plaintext -d '{
    "services": ["api","psp"],
    "date_type": "1",
    "start_time": 1681920000,
    "end_time": 1682784000
}' 10.0.7.146:1114 service_monitor.ServiceMonitorManagement.GetServiceLogLineChartData
```

返回结果示例：
```json
{
  "data": [
    {
      "service": "api",
      "logs": [
        {
          "time": "2023-04-19",
          "count": 1542
        },
        {
          "time": "2023-04-20",
          "count": 1823
        }
      ]
    }
  ]
}
```

#### 复杂对象接口

调用需要嵌套对象参数的方法：

```bash
grpcurl -plaintext -d '{
    "services": ["api","psp"],
    "start_time": 1681920000,
    "end_time": 1682784000,
    "page": {
        "index": 0,
        "size": 10
    }
}' 10.0.7.146:1114 service_monitor.ServiceMonitorManagement.ListServiceLog
```

::: tip 小技巧
当参数复杂时，可以将 JSON 保存到文件中，然后使用 `grpcurl -plaintext -d @file.json` 的方式调用。
:::

### 从标准输入读取参数

对于复杂的请求，可以从标准输入读取参数：

```bash
grpcurl -plaintext -d @ 10.0.7.146:1114 service_monitor.ServiceMonitorManagement.GetServiceLogLineChartData
```

然后在命令行中输入 JSON 格式的参数，输入完成后按 Ctrl+D 结束输入。

这种方式在需要动态构造请求参数时非常有用，例如在脚本中生成参数并管道传递给 grpcurl：

```bash
echo '{"services":["api"],"start_time":1681920000,"end_time":1682784000}' | grpcurl -plaintext -d @ 10.0.7.146:1114 service_monitor.ServiceMonitorManagement.GetServiceLogLineChartData
```

## 高级用法

### 使用 TLS 连接

在生产环境中，大多数 gRPC 服务都使用 TLS 加密。要连接到这些服务，可以省略 `-plaintext` 参数并提供证书：

```bash
grpcurl -cert /path/to/client.crt -key /path/to/client.key -cacert /path/to/ca.crt server.example.com:443 list
```

如果使用的是自签名证书，可以使用 `-insecure` 参数跳过证书验证（仅在测试环境中使用）：

```bash
grpcurl -insecure server.example.com:443 list
```

### 设置请求头

添加元数据（类似于 HTTP 头）：

```bash
grpcurl -H 'Authorization: Bearer my-token' -plaintext localhost:8080 my.service/MyMethod
```

可以添加多个请求头：

```bash
grpcurl -H 'Authorization: Bearer my-token' -H 'x-custom-header: value' -plaintext localhost:8080 my.service/MyMethod
```

### 使用 proto 文件

如果服务器没有开启反射 API，可以通过指定 .proto 文件来调用服务：

```bash
grpcurl -proto service.proto -plaintext localhost:8080 my.service/MyMethod
```

如果有多个 .proto 文件，可以多次使用 `-proto` 参数：

```bash
grpcurl -proto service.proto -proto common.proto -plaintext localhost:8080 my.service/MyMethod
```

### 格式化输出

默认情况下，grpcurl 会输出格式化的 JSON。可以使用 `-format` 参数指定输出格式：

```bash
# 使用紧凑的 JSON 格式
grpcurl -format json -plaintext localhost:8080 my.service/MyMethod

# 使用文本格式
grpcurl -format text -plaintext localhost:8080 my.service/MyMethod
```

## 常见问题排查

- 如果遇到 `Failed to dial target host` 错误，检查服务器地址和端口是否正确
- 如果遇到 `server does not support the reflection API` 错误，服务器可能没有启用 gRPC 反射服务
- 对于无法通过反射发现的服务，可以使用 `-proto` 参数指定 .proto 文件

## 参考资料

- [gRPCurl GitHub 仓库](https://github.com/fullstorydev/grpcurl)
- [gRPC 官方文档](https://grpc.io/docs/)
