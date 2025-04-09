# 进阶命令

本文档详细介绍 Helm 的进阶命令和参数，帮助您更全面地掌握 Helm 的使用技巧。

## 命令行补全

Helm 提供了命令行补全功能，可以大大提高使用效率：

```bash
# Bash
source <(helm completion bash)

# 永久启用 Bash 补全
helm completion bash > /etc/bash_completion.d/helm

# Zsh
source <(helm completion zsh)

# 永久启用 Zsh 补全
helm completion zsh > "${fpath[1]}/_helm"

# Fish
helm completion fish > ~/.config/fish/completions/helm.fish
```

## 环境变量

Helm 支持多种环境变量来控制其行为：

- `HELM_CACHE_HOME`：设置 Helm 缓存位置
- `HELM_CONFIG_HOME`：设置 Helm 配置位置
- `HELM_DATA_HOME`：设置 Helm 数据位置
- `HELM_DEBUG`：启用详细输出
- `HELM_DRIVER`：设置后端存储驱动（默认为 secret）
- `HELM_KUBECONTEXT`：设置 kubeconfig 上下文
- `HELM_NAMESPACE`：设置默认命名空间
- `HELM_NO_PLUGINS`：禁用插件
- `HELM_PLUGINS`：设置插件目录路径
- `HELM_REGISTRY_CONFIG`：设置注册表配置路径
- `HELM_REPOSITORY_CACHE`：设置仓库缓存目录路径
- `HELM_REPOSITORY_CONFIG`：设置仓库配置路径
- `KUBECONFIG`：设置 kubeconfig 文件路径

示例：

```bash
export HELM_NAMESPACE=my-namespace
export HELM_DEBUG=true
helm install my-release bitnami/mysql
```

## 高级安装选项

### 等待资源就绪

```bash
# 安装并等待所有资源就绪
helm install my-release bitnami/mysql --wait

# 设置等待超时时间（默认为 5 分钟）
helm install my-release bitnami/mysql --wait --timeout 10m

# 等待特定条件
helm install my-release bitnami/mysql --wait --wait-for-jobs
```

### 原子安装

如果安装过程中出现任何错误，自动回滚：

```bash
helm install my-release bitnami/mysql --atomic
```

### 描述安装

模拟安装但不实际执行：

```bash
# 显示将要创建的资源
helm install my-release bitnami/mysql --dry-run

# 显示详细的调试信息
helm install my-release bitnami/mysql --dry-run --debug
```

### 设置发布状态

```bash
# 将发布标记为已部署
helm install my-release bitnami/mysql --set-string 'status=deployed'
```

### 跳过 CRD 安装

```bash
helm install my-release bitnami/mysql --skip-crds
```

## 高级升级选项

### 重置值

```bash
# 重置所有值为默认值
helm upgrade my-release bitnami/mysql --reset-values

# 只重置指定的值
helm upgrade my-release bitnami/mysql --reset-values --set service.type=ClusterIP
```

### 重用值

```bash
# 重用上一个发布的值
helm upgrade my-release bitnami/mysql --reuse-values

# 重用值并覆盖特定值
helm upgrade my-release bitnami/mysql --reuse-values --set auth.rootPassword=newpassword
```

### 历史修订限制

```bash
# 限制保留的历史修订数量
helm upgrade my-release bitnami/mysql --history-max 5
```

## 模板相关命令

### 渲染模板

```bash
# 渲染模板并显示输出
helm template my-release bitnami/mysql

# 使用自定义值渲染模板
helm template my-release bitnami/mysql -f values.yaml

# 渲染特定命名空间的模板
helm template my-release bitnami/mysql --namespace my-namespace

# 包含 CRD 在输出中
helm template my-release bitnami/mysql --include-crds
```

### 验证 Chart

```bash
# 验证 Chart 是否可以安装
helm lint mychart

# 使用自定义值验证
helm lint mychart -f values.yaml
```

### 显示 Chart 信息

```bash
# 显示 Chart 的基本信息
helm show chart bitnami/mysql

# 显示 Chart 的所有信息
helm show all bitnami/mysql

# 显示 Chart 的默认值
helm show values bitnami/mysql

# 显示 Chart 的 README
helm show readme bitnami/mysql
```

## 仓库管理进阶

### 添加带认证的仓库

```bash
# 使用用户名和密码
helm repo add my-repo https://charts.example.com --username user --password pass

# 使用 TLS 客户端证书
helm repo add my-repo https://charts.example.com --cert-file cert.pem --key-file key.pem

# 使用 CA 证书
helm repo add my-repo https://charts.example.com --ca-file ca.pem
```

### 管理仓库

```bash
# 列出所有仓库
helm repo list

# 更新特定仓库
helm repo update my-repo

# 移除仓库
helm repo remove my-repo
```

## Release 管理进阶

### 列出 Release

```bash
# 列出所有命名空间的 Release
helm list --all-namespaces

# 列出特定状态的 Release
helm list --deployed
helm list --failed
helm list --pending
helm list --uninstalled
helm list --superseded

# 按正则表达式过滤
helm list --filter '^my-'

# 按日期排序
helm list --date
helm list --reverse  # 反向排序
```

### 获取 Release 清单

```bash
# 获取已安装的 Release 的清单
helm get manifest my-release

# 获取特定修订版本的清单
helm get manifest my-release --revision 2
```

### 获取 Release 值

```bash
# 获取已安装的 Release 的值
helm get values my-release

# 获取所有值（包括默认值）
helm get values my-release --all

# 获取特定修订版本的值
helm get values my-release --revision 2
```

### 获取 Release 钩子

```bash
# 获取 Release 的钩子
helm get hooks my-release

# 获取特定修订版本的钩子
helm get hooks my-release --revision 2
```

### 获取 Release 备注

```bash
# 获取 Release 的备注
helm get notes my-release
```

## 插件管理

### 安装插件

```bash
# 从 URL 安装插件
helm plugin install https://github.com/databus23/helm-diff

# 从本地目录安装插件
helm plugin install ./helm-plugin
```

### 管理插件

```bash
# 列出已安装的插件
helm plugin list

# 更新插件
helm plugin update diff

# 卸载插件
helm plugin uninstall diff
```

## 常用插件命令

### Helm Diff

```bash
# 安装 helm-diff 插件
helm plugin install https://github.com/databus23/helm-diff

# 比较升级前后的差异
helm diff upgrade my-release bitnami/mysql -f values.yaml

# 比较回滚前后的差异
helm diff rollback my-release 1

# 比较 Release 的不同修订版本
helm diff revision my-release 2 3
```

### Helm Secrets

```bash
# 安装 helm-secrets 插件
helm plugin install https://github.com/jkroepke/helm-secrets

# 加密 values 文件
helm secrets enc secrets.yaml

# 解密 values 文件
helm secrets dec secrets.yaml

# 使用加密的 values 文件安装
helm secrets install my-release mychart -f secrets.yaml
```

### Helm S3

```bash
# 安装 helm-s3 插件
helm plugin install https://github.com/hypnoglow/helm-s3.git

# 初始化 S3 仓库
helm s3 init s3://my-bucket/charts

# 推送 Chart 到 S3
helm s3 push ./mychart-0.1.0.tgz my-repo
```

## OCI 注册表支持

Helm 3 支持将 Chart 存储在 OCI（Open Container Initiative）兼容的注册表中：

```bash
# 登录到 OCI 注册表
helm registry login -u myuser registry.example.com

# 将 Chart 推送到 OCI 注册表
helm push mychart-0.1.0.tgz oci://registry.example.com/charts

# 从 OCI 注册表安装 Chart
helm install my-release oci://registry.example.com/charts/mychart --version 0.1.0

# 从 OCI 注册表拉取 Chart
helm pull oci://registry.example.com/charts/mychart --version 0.1.0

# 登出 OCI 注册表
helm registry logout registry.example.com
```

## 高级调试技巧

### 调试安装

```bash
# 启用详细输出
helm install my-release bitnami/mysql --debug

# 模拟安装并查看生成的资源
helm install my-release bitnami/mysql --dry-run --debug
```

### 获取特定资源的状态

```bash
# 获取 Release 中的所有资源
kubectl get all -l release=my-release

# 查看特定资源的详细信息
kubectl describe deployment my-release-mysql
```

### 检查 Helm 客户端和服务器版本

```bash
helm version
```

### 验证 Helm 配置

```bash
# 查看 Helm 环境信息
helm env
```

## 高级备份和恢复

### 备份 Release

```bash
# 获取 Release 的所有信息并保存
helm get all my-release > my-release-backup.yaml
```

### 恢复 Release

```bash
# 卸载现有 Release
helm uninstall my-release

# 使用备份的值重新安装
helm install my-release bitnami/mysql -f values-backup.yaml
```

## 多集群管理

### 使用不同的 kubeconfig

```bash
# 使用特定的 kubeconfig 文件
helm list --kubeconfig=/path/to/kubeconfig

# 使用特定的上下文
helm list --kube-context=my-context
```

### 使用不同的命名空间

```bash
# 在特定命名空间中安装
helm install my-release bitnami/mysql --namespace my-namespace

# 创建命名空间（如果不存在）
helm install my-release bitnami/mysql --namespace my-namespace --create-namespace
```

## 性能优化

### 并行安装

```bash
# 设置最大并行操作数
helm install my-release bitnami/mysql --max-concurrent 10
```

### 禁用钩子

```bash
# 安装时禁用钩子
helm install my-release bitnami/mysql --no-hooks

# 升级时禁用钩子
helm upgrade my-release bitnami/mysql --no-hooks

# 卸载时禁用钩子
helm uninstall my-release --no-hooks
```

## 常见问题解决命令

### 强制卸载

当正常卸载失败时：

```bash
# 强制卸载，即使有错误
helm uninstall my-release --force
```

### 清理孤立资源

```bash
# 查找孤立的 Helm 资源
kubectl get all -A -l app.kubernetes.io/managed-by=Helm

# 删除特定的孤立资源
kubectl delete deployment orphaned-deployment
```

### 修复损坏的 Release

```bash
# 查看 Release 历史
helm history my-release

# 回滚到最后一个已知的良好状态
helm rollback my-release 2
```

## 小结

通过本文，您已经了解了 Helm 的进阶命令和参数，这些知识将帮助您更高效地使用 Helm 管理 Kubernetes 应用。结合基本使用和进阶使用文档，您现在应该能够熟练地使用 Helm 进行各种复杂操作。

希望这些内容对您有所帮助，祝您在 Kubernetes 和 Helm 的旅程中一切顺利！
