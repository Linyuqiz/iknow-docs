# K3s 高可用安装指南

本指南将帮助你部署一个高可用的 K3s 集群，适合生产环境使用。高可用配置可以确保在某个 Server 节点故障时，集群仍能继续正常运行。

## 高可用架构概述

K3s 支持两种高可用配置：

1. **嵌入式 etcd**（推荐）：K3s 内置的 etcd 数据存储，至少需要 3 个 Server 节点
2. **外部数据库**：使用外部数据库（如 MySQL、PostgreSQL）作为数据存储

本指南主要介绍使用嵌入式 etcd 的高可用配置，这是 K3s v1.19.1+ 推荐的方式。

## 环境要求

- 至少 3 台 Server 节点（奇数个，推荐 3、5 或 7 个）
- 1 个或多个 Agent 节点（可选）
- 每个 Server 节点至少 2GB 内存（推荐 4GB 以上）
- 每个 Server 节点至少 2 个 CPU 核心（推荐 4 核以上）
- 每个节点至少 20GB 磁盘空间
- 所有节点之间网络互通
- 负载均衡器（可选，用于访问 Kubernetes API）

## 网络规划

确保以下端口在所有节点之间开放：

| 协议 | 端口 | 描述 |
|------|------|------|
| TCP | 6443 | Kubernetes API 服务器 |
| TCP | 2379-2380 | etcd 客户端和对等通信 |
| UDP | 8472 | Flannel VXLAN |
| TCP | 10250 | Kubelet |
| TCP | 8443 | K3s 注册服务器（仅用于 Server 节点） |

## 准备工作

### 1. 配置所有节点

在所有节点上执行以下操作：

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y  # Debian/Ubuntu
# 或
sudo yum update -y  # RHEL/CentOS/Rocky

# 安装基本工具
sudo apt install -y curl wget  # Debian/Ubuntu
# 或
sudo yum install -y curl wget  # RHEL/CentOS/Rocky

# 禁用交换分区
sudo swapoff -a
sudo sed -i '/swap/s/^/#/' /etc/fstab

# 配置主机名
sudo hostnamectl set-hostname <节点名称>  # 例如 k3s-server1

# 配置 /etc/hosts
sudo tee -a /etc/hosts > /dev/null << EOT
<Server1-IP> k3s-server1
<Server2-IP> k3s-server2
<Server3-IP> k3s-server3
# 添加更多节点...
EOT
```

### 2. 配置负载均衡器（可选但推荐）

为 Kubernetes API（端口 6443）配置负载均衡器，指向所有 Server 节点。可以使用 HAProxy、Nginx 或云服务提供商的负载均衡服务。

示例 HAProxy 配置：

```
frontend k3s-api
    bind *:6443
    mode tcp
    option tcplog
    default_backend k3s-api-servers

backend k3s-api-servers
    mode tcp
    balance roundrobin
    option tcp-check
    server server1 <Server1-IP>:6443 check
    server server2 <Server2-IP>:6443 check
    server server3 <Server3-IP>:6443 check
```

## 部署高可用集群

### 1. 初始化第一个 Server 节点

在第一个 Server 节点上执行：

```bash
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --tls-san <负载均衡器IP或域名> \
  --node-name=$(hostname -f)
  # 可以添加更多自定义选项
```

参数说明：
- `--cluster-init`：初始化使用嵌入式 etcd 的新集群
- `--tls-san`：添加额外的主机名或 IP 作为 TLS 证书的备用名称

### 2. 获取集群令牌和 K3S_URL

在第一个 Server 节点上：

```bash
# 获取节点令牌
NODE_TOKEN=$(sudo cat /var/lib/rancher/k3s/server/node-token)
echo $NODE_TOKEN
```

### 3. 添加其他 Server 节点

在其余的 Server 节点上执行（每个节点都需要执行）：

```bash
# 设置第一个 Server 节点的 IP
FIRST_SERVER_IP=<Server1-IP>

# 设置从第一个节点获取的令牌
NODE_TOKEN=<令牌值>

# 加入集群作为 Server 节点
curl -sfL https://get.k3s.io | sh -s - server \
  --server https://${FIRST_SERVER_IP}:6443 \
  --token ${NODE_TOKEN} \
  --tls-san <负载均衡器IP或域名> \
  --node-name=$(hostname -f)
```

### 4. 添加 Agent 节点（可选）

在每个 Agent 节点上执行：

```bash
# 设置负载均衡器 IP 或第一个 Server 节点 IP
K3S_URL=<负载均衡器IP或Server1-IP>

# 设置节点令牌
NODE_TOKEN=<令牌值>

# 安装 K3s Agent
curl -sfL https://get.k3s.io | K3S_URL=https://${K3S_URL}:6443 K3S_TOKEN=${NODE_TOKEN} sh -
```

## 验证高可用集群

### 1. 检查集群节点状态

在任一 Server 节点上：

```bash
sudo kubectl get nodes
```

所有 Server 和 Agent 节点应该显示为 `Ready` 状态。

### 2. 检查 etcd 集群状态

```bash
sudo kubectl get pods -n kube-system -l component=etcd
```

应该看到与 Server 节点数量相同的 etcd Pod 正在运行。

### 3. 测试高可用性

可以通过关闭一个 Server 节点来测试高可用性：

```bash
# 在一个 Server 节点上
sudo systemctl stop k3s
```

然后检查集群状态：

```bash
# 在另一个 Server 节点上
sudo kubectl get nodes
```

集群应该仍然可以正常工作，关闭的节点会显示为 `NotReady` 状态。

## 集群维护

### 升级高可用集群

逐个升级每个节点，先升级 Server 节点，再升级 Agent 节点：

```bash
# 在每个节点上执行
curl -sfL https://get.k3s.io | sh -
```

### 备份 etcd 数据

定期备份 etcd 数据是保证集群安全的重要措施：

```bash
# 创建快照
sudo k3s etcd-snapshot save --name <快照名称>

# 查看快照列表
sudo k3s etcd-snapshot ls
```

默认情况下，快照保存在 `/var/lib/rancher/k3s/server/db/snapshots/` 目录。

### 从备份恢复

如果需要从备份恢复：

```bash
# 停止 K3s 服务
sudo systemctl stop k3s

# 从快照恢复
sudo k3s server \
  --cluster-reset \
  --cluster-reset-restore-path=<快照路径>

# 重启 K3s 服务
sudo systemctl start k3s
```

## 常见问题排查

### 1. etcd 集群不健康

检查 etcd 日志：

```bash
sudo journalctl -u k3s -f | grep etcd
```

可能的解决方案：
- 确保所有 Server 节点之间的网络连接良好
- 检查时间同步
- 如果 etcd 数据损坏，可能需要从快照恢复

### 2. 负载均衡器问题

检查负载均衡器配置和健康检查：
- 确保所有 Server 节点都在负载均衡器的后端池中
- 验证健康检查配置是否正确
- 检查防火墙规则

### 3. 节点无法加入集群

检查以下几点：
- 确认 NODE_TOKEN 是否正确
- 确认 K3S_URL 是否正确且可访问
- 检查防火墙设置，确保必要的端口已开放
- 查看节点上的日志：`sudo journalctl -u k3s -f`

## 下一步

- [基本操作](./basic-operations.md) - 学习 K3s 的基本操作命令
