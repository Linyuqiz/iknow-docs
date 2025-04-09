# 基本使用

本文档介绍 Helm 的基础概念和基本使用方法，帮助您快速入门 Kubernetes 的包管理工具。

## Helm 核心概念

在开始使用 Helm 之前，了解以下核心概念非常重要：

### Chart

Chart 是 Helm 的包，包含预配置的 Kubernetes 资源。可以把它想象成 Kubernetes 应用的"安装包"，类似于 Ubuntu 的 deb 包或 CentOS 的 rpm 包。

Chart 的目录结构通常如下：

```
mychart/
├── Chart.yaml          # 包含 Chart 信息的 YAML 文件
├── values.yaml         # 默认配置值
├── charts/             # 包含依赖的子 Chart
└── templates/          # 模板文件，会被渲染成 Kubernetes 资源
    ├── deployment.yaml
    ├── service.yaml
    └── ...
```

### Repository

Repository（仓库）是用来存储和共享 Chart 的地方。您可以将其理解为类似于 Docker Hub 的概念，但用于存储 Helm Chart。

### Release

Release 是 Chart 的运行实例。当您使用 Helm 安装 Chart 时，会创建一个新的 Release。每个 Release 都有自己的名称。

### Values

Values（值）用于自定义 Chart 的配置。您可以通过提供自己的 values.yaml 文件或使用 `--set` 参数来覆盖默认值。

## 安装 Helm

在不同的操作系统上安装 Helm：

### macOS

使用 Homebrew：

```bash
brew install helm
```

### Windows

使用 Chocolatey：

```bash
choco install kubernetes-helm
```

或使用 Scoop：

```bash
scoop install helm
```

### Linux

使用脚本安装：

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

或使用包管理器：

```bash
# Debian/Ubuntu
sudo apt-get update
sudo apt-get install helm

# Fedora
sudo dnf install helm

# Arch Linux
sudo pacman -S helm
```

## 基本命令

### 添加仓库

```bash
# 添加官方稳定版仓库
helm repo add stable https://charts.helm.sh/stable

# 添加 Bitnami 仓库（常用）
helm repo add bitnami https://charts.bitnami.com/bitnami

# 更新仓库信息
helm repo update
```

### 搜索 Chart

```bash
# 搜索所有可用的 Chart
helm search repo

# 搜索特定的 Chart
helm search repo nginx

# 搜索特定仓库中的 Chart
helm search repo bitnami/mysql
```

### 查看 Chart 信息

```bash
# 查看 Chart 的详细信息
helm show chart bitnami/mysql

# 查看 Chart 的所有信息（包括默认值和使用说明）
helm show all bitnami/mysql

# 查看 Chart 的默认值
helm show values bitnami/mysql
```

### 安装 Chart

```bash
# 安装 Chart 并自动生成 Release 名称
helm install bitnami/mysql --generate-name

# 安装 Chart 并指定 Release 名称
helm install my-mysql bitnami/mysql

# 安装 Chart 并自定义值
helm install my-mysql bitnami/mysql --set auth.rootPassword=password123

# 使用自定义的 values 文件安装
helm install my-mysql bitnami/mysql -f my-values.yaml

# 安装特定版本的 Chart
helm install my-mysql bitnami/mysql --version 8.8.26
```

### 查看已安装的 Release

```bash
# 列出所有 Release
helm list

# 列出所有命名空间的 Release
helm list --all-namespaces

# 列出特定命名空间的 Release
helm list -n my-namespace

# 列出包括已删除的 Release
helm list --all
```

### 查看 Release 状态

```bash
# 查看 Release 的状态
helm status my-mysql

# 查看 Release 的状态和历史
helm history my-mysql
```

### 升级 Release

```bash
# 升级 Release
helm upgrade my-mysql bitnami/mysql

# 升级并修改值
helm upgrade my-mysql bitnami/mysql --set auth.rootPassword=newpassword

# 如果 Release 不存在则安装
helm upgrade --install my-mysql bitnami/mysql
```

### 回滚 Release

```bash
# 查看 Release 的修订历史
helm history my-mysql

# 回滚到特定的修订版本
helm rollback my-mysql 1  # 回滚到修订版本 1
```

### 卸载 Release

```bash
# 卸载 Release
helm uninstall my-mysql

# 卸载 Release 但保留历史记录
helm uninstall my-mysql --keep-history
```

### 创建自己的 Chart

```bash
# 创建一个新的 Chart
helm create my-app

# 验证 Chart 格式是否正确
helm lint my-app

# 打包 Chart
helm package my-app

# 安装本地 Chart
helm install my-release ./my-app
```

## 实际案例：部署 WordPress

以下是一个使用 Helm 部署 WordPress 的实际案例：

```bash
# 添加 Bitnami 仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# 查看 WordPress Chart 的可配置值
helm show values bitnami/wordpress

# 创建自定义值文件 wordpress-values.yaml
cat > wordpress-values.yaml << EOF
wordpressUsername: admin
wordpressPassword: password123
mariadb:
  auth:
    rootPassword: rootpassword
    password: dbpassword
service:
  type: LoadBalancer
EOF

# 安装 WordPress
helm install my-wordpress bitnami/wordpress -f wordpress-values.yaml

# 查看部署状态
helm status my-wordpress

# 获取 WordPress 访问 URL
kubectl get svc my-wordpress
```

## 常见问题解决

### 1. Chart 安装失败

如果 Chart 安装失败，可以使用以下命令查看详细错误信息：

```bash
helm status my-release
```

### 2. 无法找到 Chart

确保您已添加相应的仓库并更新：

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

### 3. 版本冲突

如果出现版本冲突，可以尝试使用 `--force` 参数强制升级：

```bash
helm upgrade --force my-release bitnami/mysql
```

### 4. 清理失败的安装

如果安装失败且无法正常卸载，可以使用以下命令：

```bash
helm uninstall my-release --no-hooks
```

## 小结

通过本文，您已经了解了 Helm 的基本概念和常用命令。这些知识足以帮助您开始在 Kubernetes 集群中使用 Helm 部署应用。

在下一篇文档中，我们将深入探讨 Helm 的进阶使用方法，包括自定义 Chart、模板编写、依赖管理等高级主题。
