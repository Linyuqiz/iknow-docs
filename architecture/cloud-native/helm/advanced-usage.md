# 进阶使用

本文档介绍 Helm 的进阶使用方法，帮助您更深入地理解和使用 Kubernetes 的包管理工具。

## 创建和开发自定义 Chart

### Chart 目录结构详解

当您使用 `helm create` 命令创建一个新的 Chart 时，会生成以下目录结构：

```
mychart/
├── .helmignore        # 类似于 .gitignore，指定打包时要忽略的文件
├── Chart.yaml         # Chart 的元数据信息
├── values.yaml        # 默认的配置值
├── charts/            # 依赖的子 Chart
├── templates/         # 模板文件目录
│   ├── NOTES.txt      # 安装后显示的使用说明
│   ├── _helpers.tpl   # 模板辅助函数
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── ...
└── templates/tests/   # 测试模板目录
    └── test-*.yaml    # 测试资源定义
```

### Chart.yaml 详解

`Chart.yaml` 文件包含 Chart 的元数据信息，示例如下：

```yaml
apiVersion: v2                 # Chart API 版本，v2 对应 Helm 3
name: mychart                  # Chart 名称
version: 0.1.0                 # Chart 版本
kubeVersion: ">=1.16.0"        # 兼容的 Kubernetes 版本
description: A Helm chart for Kubernetes  # Chart 描述
type: application              # Chart 类型：application 或 library
appVersion: "1.0.0"            # 应用版本
dependencies:                  # 依赖的其他 Chart
  - name: mysql
    version: 8.8.26
    repository: https://charts.bitnami.com/bitnami
    condition: mysql.enabled
maintainers:                   # 维护者信息
  - name: Your Name
    email: your.email@example.com
icon: https://example.com/icon.png  # Chart 图标 URL
```

### 依赖管理

在 `Chart.yaml` 中定义依赖：

```yaml
dependencies:
  - name: mysql
    version: 8.8.26
    repository: https://charts.bitnami.com/bitnami
    condition: mysql.enabled
    tags:
      - database
  - name: redis
    version: 16.13.2
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
```

管理依赖的命令：

```bash
# 更新依赖（下载到 charts/ 目录）
helm dependency update mychart

# 构建依赖（仅生成依赖关系，不下载）
helm dependency build mychart

# 列出依赖
helm dependency list mychart
```

### 条件依赖和标签

您可以使用条件和标签来控制依赖的安装：

```yaml
# Chart.yaml
dependencies:
  - name: mysql
    condition: mysql.enabled
    tags:
      - database
  - name: redis
    condition: redis.enabled
    tags:
      - cache
```

```yaml
# values.yaml
mysql:
  enabled: true
redis:
  enabled: false
tags:
  database: true
  cache: false
```

使用标签启用或禁用依赖：

```bash
helm install mychart --set tags.database=true --set tags.cache=false
```

## 模板编写与高级功能

Helm 使用 Go 模板语言来生成 Kubernetes 资源清单。以下是一些高级模板技术：

### 内置对象

Helm 提供了多个内置对象，可以在模板中使用：

- `.Release`：包含 Release 信息（名称、命名空间等）
- `.Chart`：包含 `Chart.yaml` 文件内容
- `.Values`：包含 values.yaml 和用户提供的值
- `.Files`：访问 Chart 中的非模板文件
- `.Capabilities`：提供关于 Kubernetes 集群的信息
- `.Template`：包含当前正在执行的模板信息

示例：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-configmap
  namespace: {{ .Release.Namespace }}
data:
  appVersion: {{ .Chart.AppVersion }}
  kubeVersion: {{ .Capabilities.KubeVersion.Version }}
```

### 函数和管道

Helm 模板支持多种函数和管道操作：

```yaml
# 字符串操作
{{ .Values.name | upper | quote }}

# 默认值
{{ .Values.replicas | default 1 }}

# 条件判断
{{ if eq .Values.environment "production" }}
  # 生产环境配置
{{ else }}
  # 非生产环境配置
{{ end }}

# 循环
{{ range .Values.configFiles }}
  {{ .name }}: {{ .content }}
{{ end }}
```

### 命名模板（部分模板）

命名模板允许您定义可重用的模板片段：

```yaml
# 在 _helpers.tpl 中定义
{{- define "mychart.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
{{- end -}}

# 在其他模板中使用
metadata:
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
```

### 使用 include 和 nindent

`include` 函数比 `template` 函数更灵活，因为它可以与其他函数组合使用：

```yaml
# 不推荐
metadata:
  labels:
    {{ template "mychart.labels" . }}

# 推荐
metadata:
  labels:
    {{- include "mychart.labels" . | nindent 4 }}
```

### 使用 with 改变作用域

`with` 语句可以临时改变作用域：

```yaml
# 不使用 with
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    metadata:
      labels:
        app: {{ .Values.name }}

# 使用 with
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    metadata:
      labels:
        {{- with .Values }}
        app: {{ .name }}
        environment: {{ .environment }}
        {{- end }}
```

### 访问文件内容

使用 `.Files` 对象访问 Chart 中的文件：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Release.Name }}-config
data:
  {{- (.Files.Glob "config/*").AsConfig | nindent 2 }}
```

## 钩子和生命周期

Helm 钩子允许您在 Release 生命周期的特定点执行操作。

### 可用的钩子类型

- `pre-install`：在模板渲染后、资源创建前执行
- `post-install`：在所有资源安装后执行
- `pre-delete`：在删除操作开始前执行
- `post-delete`：在所有资源删除后执行
- `pre-upgrade`：在升级操作开始前执行
- `post-upgrade`：在所有资源升级后执行
- `pre-rollback`：在回滚操作开始前执行
- `post-rollback`：在所有资源回滚后执行
- `test`：当运行 `helm test` 命令时执行

### 定义钩子

通过添加注解来定义钩子：

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ .Release.Name }}-db-init
  annotations:
    "helm.sh/hook": post-install
    "helm.sh/hook-weight": "5"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    # 任务定义
```

### 钩子权重和删除策略

- `helm.sh/hook-weight`：定义钩子的执行顺序（数字越小越先执行）
- `helm.sh/hook-delete-policy`：定义何时删除钩子资源
  - `hook-succeeded`：钩子成功后删除
  - `hook-failed`：钩子失败后删除
  - `before-hook-creation`：在新钩子创建前删除

## 测试 Chart

### 编写测试

在 `templates/tests/` 目录中创建测试资源，并添加 `helm.sh/hook: test` 注解：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: {{ .Release.Name }}-test
  annotations:
    "helm.sh/hook": test
spec:
  containers:
    - name: test
      image: busybox
      command: ["wget", "{{ .Release.Name }}-service:80"]
  restartPolicy: Never
```

### 运行测试

```bash
helm test my-release
```

## Chart 仓库管理

### 创建自己的 Chart 仓库

1. 打包 Chart：

```bash
helm package mychart
```

2. 创建索引文件：

```bash
helm repo index --url https://example.com/charts .
```

3. 将 Chart 包和索引文件上传到 Web 服务器或对象存储。

### 使用 Chart Museum

[Chart Museum](https://github.com/helm/chartmuseum) 是一个开源的 Helm Chart 仓库服务器：

```bash
# 安装 Chart Museum
helm repo add chartmuseum https://chartmuseum.github.io/charts
helm install my-chartmuseum chartmuseum/chartmuseum

# 推送 Chart 到 Chart Museum
helm plugin install https://github.com/chartmuseum/helm-push
helm cm-push mychart/ my-repo
```

## 安全最佳实践

### 使用 Helm Secrets 管理敏感信息

[Helm Secrets](https://github.com/jkroepke/helm-secrets) 是一个用于加密和管理敏感信息的插件：

```bash
# 安装 helm-secrets 插件
helm plugin install https://github.com/jkroepke/helm-secrets

# 加密 values 文件
helm secrets enc secrets.yaml

# 使用加密的 values 文件
helm secrets install my-release mychart -f secrets.yaml
```

### 验证 Chart 完整性

使用 Helm 的签名和验证功能：

```bash
# 签名 Chart
helm package --sign --key 'name@example.com' mychart

# 验证 Chart
helm verify mychart-0.1.0.tgz
```

### 限制 RBAC 权限

确保 Helm 和 Tiller（Helm 2）只有必要的权限：

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: tiller-role
rules:
  - apiGroups: ["", "extensions", "apps"]
    resources: ["*"]
    verbs: ["*"]
```

## 与 CI/CD 集成

### GitLab CI 示例

```yaml
deploy:
  stage: deploy
  script:
    - helm upgrade --install my-app ./my-app 
      --set image.tag=${CI_COMMIT_SHA} 
      --namespace ${NAMESPACE}
```

### GitHub Actions 示例

```yaml
name: Deploy with Helm

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
    
      - name: Install Helm
        uses: azure/setup-helm@v1
      
      - name: Deploy
        run: |
          helm upgrade --install my-app ./my-app \
            --set image.tag=${GITHUB_SHA} \
            --namespace default
```

### Jenkins Pipeline 示例

```groovy
pipeline {
    agent any
    stages {
        stage('Deploy') {
            steps {
                sh '''
                helm upgrade --install my-app ./my-app \
                  --set image.tag=${GIT_COMMIT} \
                  --namespace default
                '''
            }
        }
    }
}
```

## 小结

通过本文，您已经了解了 Helm 的进阶使用方法，包括自定义 Chart 开发、模板编写、钩子使用、测试、仓库管理、安全实践和 CI/CD 集成。这些知识将帮助您更有效地使用 Helm 管理 Kubernetes 应用。

在下一篇文档中，我们将详细介绍 Helm 的进阶命令，帮助您掌握更多高级操作和技巧。
