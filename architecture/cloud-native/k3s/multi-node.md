# K3s 多节点安装指南

本指南将帮助你部署一个包含一个主节点（Server）和多个工作节点（Agent）的 K3s 集群。这种配置适合开发团队、测试环境或中小型生产环境。

## 环境要求

- 至少两台 Linux 服务器（一台 Server 节点，一台或多台 Agent 节点）
- 每台服务器至少 1GB 内存（推荐 2GB 以上）
- 每台服务器至少 1 个 CPU 核心（推荐 2 核以上）
- 每台服务器至少 4GB 磁盘空间
- 所有节点之间网络互通
- 所有节点具有 sudo 或 root 权限的用户账户
- 所有节点能够访问互联网（用于下载 K3s 二进制文件）

## 网络规划

在开始安装前，确保你的网络环境满足以下条件：

1. 所有节点之间可以相互通信
2. 所有节点的主机名可以解析（建议配置 /etc/hosts）
3. 以下端口在节点之间开放：
   - 6443/tcp：Kubernetes API 服务器（Server 节点）
   - 8472/udp：Flannel VXLAN（所有节点）
   - 10250/tcp：Kubelet（所有节点）
   - 2379/tcp, 2380/tcp：etcd（如果使用外部 etcd）

## 安装步骤

### 1. 准备所有节点

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

# 配置主机名（确保每个节点有唯一的主机名）
sudo hostnamectl set-hostname <节点名称>  # 例如 k3s-server 或 k3s-agent1

# 配置 /etc/hosts（在所有节点上添加集群中所有节点的 IP 和主机名映射）
sudo tee -a /etc/hosts > /dev/null << EOT
<Server-IP> k3s-server
<Agent1-IP> k3s-agent1
<Agent2-IP> k3s-agent2
# 添加更多节点...
EOT
```

### 2. 安装 Server 节点

在指定为 Server 的节点上执行以下命令：

```bash
# 使用默认配置安装 K3s Server
curl -sfL https://get.k3s.io | sh -

# 或者使用自定义选项安装
# curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik --node-name=k3s-server" sh -
```

### 3. 获取节点令牌

在 Server 节点上，获取用于 Agent 节点加入集群的令牌：

```bash
# 获取节点令牌
NODE_TOKEN=$(sudo cat /var/lib/rancher/k3s/server/node-token)
echo $NODE_TOKEN
# 请记下这个令牌，后续步骤需要使用
```

### 4. 安装 Agent 节点

在每个 Agent 节点上执行以下命令，将它们加入到集群中：

```bash
# 设置 Server 节点的 IP 地址
SERVER_IP=<Server-IP>  # 替换为你的 Server 节点 IP

# 设置从 Server 节点获取的令牌
NODE_TOKEN=<令牌值>  # 替换为上一步获取的令牌

# 安装 K3s Agent 并加入集群
curl -sfL https://get.k3s.io | K3S_URL=https://${SERVER_IP}:6443 K3S_TOKEN=${NODE_TOKEN} sh -

# 或者使用自定义选项安装
# curl -sfL https://get.k3s.io | K3S_URL=https://${SERVER_IP}:6443 K3S_TOKEN=${NODE_TOKEN} INSTALL_K3S_EXEC="--node-name=k3s-agent1" sh -
```

## 验证集群状态

### 1. 在 Server 节点上检查节点状态

```bash
# 使用 sudo
sudo kubectl get nodes

# 或者配置普通用户使用 kubectl
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
chmod 600 ~/.kube/config
kubectl get nodes
```

所有节点应该显示为 `Ready` 状态。

### 2. 检查系统组件状态

```bash
kubectl get pods -n kube-system
```

所有 Pod 应该处于 `Running` 状态。

## 部署测试应用

部署一个简单的应用来测试集群：

```bash
# 创建一个包含多个副本的 Nginx 部署
kubectl create deployment nginx --image=nginx --replicas=3
kubectl expose deployment nginx --port=80 --type=NodePort
```

查看部署状态：

```bash
kubectl get pods -o wide
```

这将显示 Pod 分布在不同的节点上。

查看服务访问信息：

```bash
kubectl get svc nginx
```

你可以通过 `http://<任意节点IP>:<NodePort>` 访问 Nginx 页面。

## 集群维护

### 添加新节点

要添加新的 Agent 节点，只需在新节点上重复 "安装 Agent 节点" 的步骤。

### 升级集群

在所有节点上执行以下命令（先升级 Server 节点，然后升级 Agent 节点）：

```bash
curl -sfL https://get.k3s.io | sh -
```

### 移除节点

1. 在 Server 节点上删除节点：

```bash
kubectl delete node <节点名称>
```

2. 在要移除的节点上执行卸载脚本：

```bash
# 对于 Agent 节点
/usr/local/bin/k3s-agent-uninstall.sh

# 对于 Server 节点
/usr/local/bin/k3s-uninstall.sh
```

## 常见问题排查

### 1. 节点无法加入集群

检查以下几点：
- 确认 NODE_TOKEN 是否正确
- 确认 SERVER_IP 是否正确且可访问
- 检查防火墙设置，确保必要的端口已开放
- 查看 Agent 节点上的日志：`sudo journalctl -u k3s-agent -f`

### 2. 节点状态为 NotReady

可能的原因：
- 网络问题：检查节点间网络连接
- 资源不足：检查节点的 CPU、内存和磁盘资源
- 容器运行时问题：检查 containerd 服务状态

### 3. Pod 无法调度

检查节点资源和污点：

```bash
kubectl describe node <节点名称>
```

## 下一步

- [高可用安装](./high-availability.md) - 配置高可用 K3s 集群
- [基本操作](./basic-operations.md) - 学习 K3s 的基本操作命令
