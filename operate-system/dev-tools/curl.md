# curl 工具使用指南

curl 是一个用于传输数据的命令行工具，支持多种协议，包括 HTTP、HTTPS、FTP、FTPS、SCP、SFTP、TFTP、DICT、TELNET、LDAP 等。它是网络开发和调试中最常用的工具之一。

## 工具安装

在大多数 Linux 和 macOS 系统中，curl 已经预装。如果需要安装：

```bash
# macOS (使用 Homebrew)
brew install curl

# Debian/Ubuntu
sudo apt install curl

# CentOS/RHEL
sudo yum install curl
```

## 基本使用

### 发送 GET 请求

最简单的 curl 命令是直接请求一个 URL：

```bash
curl https://example.com
```

默认情况下，curl 会将响应内容输出到终端。

### 保存响应到文件

使用 `-o` 或 `--output` 参数将响应保存到文件：

```bash
curl -o example.html https://example.com
```

使用 `-O` 参数可以使用服务器上的文件名：

```bash
curl -O https://example.com/file.zip
```

### 显示响应头信息

使用 `-i` 或 `--include` 参数显示响应头：

```bash
curl -i https://example.com
```

只显示响应头（不显示响应体）：

```bash
curl -I https://example.com
```

### 跟随重定向

使用 `-L` 或 `--location` 参数自动跟随重定向：

```bash
curl -L https://example.com
```

## 发送不同类型的请求

### POST 请求

发送 POST 请求：

```bash
curl -X POST https://example.com/api
```

### 发送表单数据

使用 `-d` 或 `--data` 参数发送表单数据：

```bash
curl -X POST -d "name=John&age=30" https://example.com/api
```

### 发送 JSON 数据

```bash
curl -X POST -H "Content-Type: application/json" -d '{"name":"John","age":30}' https://example.com/api
```

### 发送文件内容

```bash
curl -X POST -d @data.json https://example.com/api
```

## 设置请求头

使用 `-H` 或 `--header` 参数设置请求头：

```bash
curl -H "Authorization: Bearer token123" https://example.com/api
```

设置多个请求头：

```bash
curl -H "Content-Type: application/json" -H "Authorization: Bearer token123" https://example.com/api
```

## 身份验证

### 基本认证

```bash
curl -u username:password https://example.com/api
```

### 使用 Cookie

发送 Cookie：

```bash
curl -b "name=value" https://example.com
```

保存服务器返回的 Cookie：

```bash
curl -c cookies.txt https://example.com
```

同时使用和保存 Cookie：

```bash
curl -b cookies.txt -c cookies.txt https://example.com
```

## 上传文件

### 使用 POST 上传文件

```bash
curl -F "file=@photo.jpg" https://example.com/upload
```

### 使用 PUT 上传文件

```bash
curl -X PUT -T file.txt https://example.com/upload
```

## 调试选项

### 显示详细信息

使用 `-v` 或 `--verbose` 参数显示详细的连接信息：

```bash
curl -v https://example.com
```

### 显示更详细的信息

使用 `--trace` 参数：

```bash
curl --trace debug.txt https://example.com
```

### 只显示错误信息

```bash
curl -s -S https://example.com
```

## 限制选项

### 限制传输速率

```bash
curl --limit-rate 100K https://example.com/large-file.zip
```

### 设置超时时间

```bash
curl --connect-timeout 10 --max-time 30 https://example.com
```

## 实用示例

### 检查网站响应时间

```bash
curl -s -o /dev/null -w "Connect: %{time_connect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" https://example.com
```

### 测试 REST API

```bash
# GET 请求
curl -X GET https://api.example.com/users

# POST 请求创建资源
curl -X POST -H "Content-Type: application/json" -d '{"name":"John","email":"john@example.com"}' https://api.example.com/users

# PUT 请求更新资源
curl -X PUT -H "Content-Type: application/json" -d '{"name":"John Updated"}' https://api.example.com/users/123

# DELETE 请求删除资源
curl -X DELETE https://api.example.com/users/123
```

### 下载文件并显示进度条

```bash
curl -# -O https://example.com/large-file.zip
```

### 测试 WebSocket

```bash
curl --include \
     --no-buffer \
     --header "Connection: Upgrade" \
     --header "Upgrade: websocket" \
     --header "Host: example.com" \
     --header "Origin: http://example.com" \
     --header "Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==" \
     --header "Sec-WebSocket-Version: 13" \
     http://example.com/
```

## 常见问题排查

- 如果遇到 SSL 证书问题，可以使用 `-k` 或 `--insecure` 参数跳过证书验证（仅用于测试）
- 如果需要使用代理，可以使用 `-x` 或 `--proxy` 参数
- 如果需要发送大量数据，考虑使用 `--data-binary` 而不是 `-d`

## 参考资料

- [curl 官方文档](https://curl.se/docs/)
- [curl 命令手册](https://curl.se/docs/manpage.html)
