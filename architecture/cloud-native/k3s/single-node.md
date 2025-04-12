# K3s 单节点安装指南

本指南将帮助你在单个节点上快速部署 K3s，适合开发环境、测试环境或小型生产环境使用。

## 环境要求

- Linux 系统（推荐 Ubuntu 20.04+、CentOS 7+、Rocky Linux 8+ 或其他现代 Linux 发行版）
- 至少 1GB 内存（推荐 2GB 以上）
- 至少 1 个 CPU 核心（推荐 2 核以上）
- 至少 4GB 磁盘空间
- 具有 sudo 或 root 权限的用户账户
- 网络连接（用于下载 K3s 二进制文件）

## 前置准备

### 1. 更新系统

```bash
# 对于基于 Debian/Ubuntu 的系统
sudo apt update && sudo apt upgrade -y

# 对于基于 RHEL/CentOS/Rocky 的系统
sudo yum update -y
```

### 2. 安装基本工具

```bash
# 对于基于 Debian/Ubuntu 的系统
sudo apt install -y curl wget

# 对于基于 RHEL/CentOS/Rocky 的系统
sudo yum install -y curl wget
```

### 3. 禁用交换分区（推荐）

```bash
# 临时禁用
sudo swapoff -a

# 永久禁用（编辑 /etc/fstab 文件，注释掉 swap 行）
sudo sed -i '/swap/s/^/#/' /etc/fstab
```

### 4. 配置防火墙（如果启用）

```bash
# 对于 firewalld
sudo firewall-cmd --permanent --add-port=6443/tcp  # Kubernetes API
sudo firewall-cmd --permanent --add-port=8472/udp  # Flannel VXLAN
sudo firewall-cmd --permanent --add-port=10250/tcp # Kubelet
sudo firewall-cmd --reload

# 对于 ufw
sudo ufw allow 6443/tcp
sudo ufw allow 8472/udp
sudo ufw allow 10250/tcp
sudo ufw reload
```

## 安装 K3s 服务器

### 使用默认设置安装

最简单的方法是使用官方提供的安装脚本：

```bash
curl -sfL https://get.k3s.io | sh -
```

这个命令会：
1. 下载 K3s 二进制文件
2. 设置 K3s 作为系统服务
3. 启动 K3s 服务器
4. 配置 kubectl 以连接到 K3s

### 使用自定义选项安装

如果你需要自定义安装，可以使用环境变量：

```bash
# 不安装 Traefik Ingress 控制器
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable=traefik" sh -

# 指定节点名称
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--node-name=my-k3s-server" sh -

# 使用特定版本
curl -sfL https://get.k3s.io | INSTALL_K3S_VERSION="v1.25.6+k3s1" sh -
```

## 验证安装

### 1. 检查 K3s 服务状态

```bash
sudo systemctl status k3s
```

### 2. 使用 kubectl 检查节点状态

K3s 安装会自动配置 kubectl，但你需要使用 sudo 或将配置文件复制到你的用户目录：

```bash
# 使用 sudo
sudo kubectl get nodes

# 或者复制配置文件到用户目录
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $(id -u):$(id -g) ~/.kube/config
chmod 600 ~/.kube/config
# 然后可以直接使用 kubectl
kubectl get nodes
```

### 3. 检查系统组件状态

```bash
kubectl get pods -n kube-system
```

## 部署示例应用

部署一个简单的 Nginx 应用来测试集群：

```bash
kubectl create deployment nginx --image=nginx
kubectl expose deployment nginx --port=80 --type=NodePort
```

查看服务和访问信息：

```bash
kubectl get svc nginx
```

你可以通过 `http://<服务器IP>:<NodePort>` 访问 Nginx 页面。

## 卸载 K3s

如果需要卸载 K3s，可以使用以下命令：

```bash
# 对于服务器节点
/usr/local/bin/k3s-uninstall.sh
```

## 常见问题排查

### 1. 服务无法启动

检查日志：

```bash
sudo journalctl -u k3s -f
```

### 2. 网络问题

确保防火墙配置正确，或临时禁用防火墙进行测试：

```bash
# 对于 firewalld
sudo systemctl stop firewalld

# 对于 ufw
sudo ufw disable
```

### 3. 资源不足

检查系统资源使用情况：

```bash
free -m  # 内存
df -h    # 磁盘
top      # CPU 和整体资源
```

## 下一步

- [多节点安装](./multi-node.md) - 扩展你的 K3s 集群
- [高可用安装](./high-availability.md) - 配置高可用 K3s 集群
- [基本操作](./basic-operations.md) - 学习 K3s 的基本操作命令
