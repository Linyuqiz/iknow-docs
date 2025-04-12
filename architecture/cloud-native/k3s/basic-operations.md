# K3s 基本操作指南

本指南介绍 K3s 集群的基本操作和管理命令，帮助你有效地管理和维护你的 K3s 集群。

## kubectl 基本命令

K3s 安装后会自动配置 kubectl 命令行工具。以下是一些常用的 kubectl 命令：

### 集群信息

```bash
# 查看集群信息
kubectl cluster-info

# 查看 kubectl 配置
kubectl config view

# 查看 API 资源
kubectl api-resources
```

### 节点管理

```bash
# 查看所有节点
kubectl get nodes

# 查看节点详细信息
kubectl describe node <节点名称>

# 给节点添加标签
kubectl label node <节点名称> <标签键>=<标签值>

# 给节点添加污点
kubectl taint node <节点名称> <污点键>=<污点值>:NoSchedule
```

### 工作负载管理

```bash
# 查看所有命名空间的 Pod
kubectl get pods --all-namespaces

# 查看特定命名空间的 Pod
kubectl get pods -n <命名空间>

# 查看 Pod 详细信息
kubectl describe pod <Pod名称> -n <命名空间>

# 查看 Pod 日志
kubectl logs <Pod名称> -n <命名空间>

# 进入 Pod 内部
kubectl exec -it <Pod名称> -n <命名空间> -- /bin/sh
```

### 部署管理

```bash
# 创建部署
kubectl create deployment <部署名称> --image=<镜像名称>

# 查看部署
kubectl get deployments -n <命名空间>

# 扩展部署
kubectl scale deployment <部署名称> --replicas=<副本数> -n <命名空间>

# 更新部署镜像
kubectl set image deployment/<部署名称> <容器名>=<新镜像> -n <命名空间>

# 查看部署历史
kubectl rollout history deployment <部署名称> -n <命名空间>

# 回滚部署
kubectl rollout undo deployment <部署名称> -n <命名空间>
```

### 服务管理

```bash
# 创建服务
kubectl expose deployment <部署名称> --port=<端口> --type=<服务类型> -n <命名空间>

# 查看服务
kubectl get services -n <命名空间>

# 查看服务详细信息
kubectl describe service <服务名称> -n <命名空间>
```

### 配置和存储

```bash
# 创建 ConfigMap
kubectl create configmap <名称> --from-file=<文件路径> -n <命名空间>

# 创建 Secret
kubectl create secret generic <名称> --from-literal=<键>=<值> -n <命名空间>

# 查看 PersistentVolumeClaims
kubectl get pvc -n <命名空间>
```

## K3s 特有命令

### 服务管理

```bash
# 查看 K3s 服务状态
sudo systemctl status k3s

# 启动 K3s 服务
sudo systemctl start k3s

# 停止 K3s 服务
sudo systemctl stop k3s

# 重启 K3s 服务
sudo systemctl restart k3s

# 查看 K3s 日志
sudo journalctl -u k3s -f
```

### 集群管理

```bash
# 查看 K3s 版本
k3s --version

# 检查 K3s 服务器配置
sudo cat /etc/rancher/k3s/config.yaml

# 创建 etcd 快照（仅适用于嵌入式 etcd 高可用集群）
sudo k3s etcd-snapshot save

# 列出 etcd 快照
sudo k3s etcd-snapshot ls

# 从快照恢复（需要先停止 K3s 服务）
sudo k3s server --cluster-reset --cluster-reset-restore-path=<快照路径>
```

## 常用操作场景

### 1. 部署应用

以下是部署简单应用的示例：

```bash
# 创建命名空间
kubectl create namespace myapp

# 部署应用
kubectl create deployment nginx --image=nginx -n myapp

# 创建服务
kubectl expose deployment nginx --port=80 --type=NodePort -n myapp

# 查看服务
kubectl get svc -n myapp
```

### 2. 更新应用

```bash
# 更新镜像
kubectl set image deployment/nginx nginx=nginx:1.21 -n myapp

# 监控更新状态
kubectl rollout status deployment/nginx -n myapp
```

### 3. 扩缩容

```bash
# 扩展副本数
kubectl scale deployment nginx --replicas=3 -n myapp

# 自动扩缩容（需要安装 metrics-server）
kubectl autoscale deployment nginx --min=2 --max=5 --cpu-percent=80 -n myapp
```

### 4. 查看资源使用情况

如果已安装 metrics-server，可以查看资源使用情况：

```bash
# 查看节点资源使用情况
kubectl top nodes

# 查看 Pod 资源使用情况
kubectl top pods -n myapp
```

### 5. 配置持久存储

```bash
# 创建 PersistentVolumeClaim
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
  namespace: myapp
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
EOF

# 使用 PVC 部署应用
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-with-storage
  namespace: myapp
spec:
  selector:
    matchLabels:
      app: nginx-with-storage
  replicas: 1
  template:
    metadata:
      labels:
        app: nginx-with-storage
    spec:
      containers:
      - name: nginx
        image: nginx
        volumeMounts:
        - name: data
          mountPath: /usr/share/nginx/html
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: my-data
EOF
```

### 6. 配置 Ingress

如果启用了 Traefik Ingress 控制器（K3s 默认启用），可以配置 Ingress：

```bash
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
  namespace: myapp
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nginx
            port:
              number: 80
EOF
```

## 故障排查

### 1. 检查组件状态

```bash
# 检查系统组件状态
kubectl get pods -n kube-system

# 检查特定组件日志
kubectl logs -n kube-system <Pod名称>
```

### 2. 检查节点状态

```bash
# 详细查看节点状态
kubectl describe node <节点名称>
```

### 3. 检查 Pod 状态

```bash
# 检查 Pod 状态
kubectl describe pod <Pod名称> -n <命名空间>

# 检查 Pod 事件
kubectl get events -n <命名空间> --sort-by='.lastTimestamp'
```

### 4. 常见问题解决方法

- **Pod 一直处于 Pending 状态**：可能是资源不足或节点有污点
- **Pod 一直处于 ImagePullBackOff 状态**：检查镜像名称是否正确，或配置镜像仓库凭证
- **Pod 一直处于 CrashLoopBackOff 状态**：检查容器日志，可能是应用程序错误
- **服务无法访问**：检查服务、端点和网络策略配置

## 最佳实践

1. **定期备份**：定期创建 etcd 快照，特别是在重要更改前
2. **资源限制**：为所有工作负载设置资源请求和限制
3. **使用命名空间**：使用命名空间隔离不同的应用程序和环境
4. **监控集群**：配置监控和告警系统，如 Prometheus 和 Grafana
5. **保持更新**：定期更新 K3s 到最新版本，以获取安全补丁和新功能

## 进阶主题

- **Helm 包管理**：使用 Helm 简化应用部署
- **GitOps**：使用 Flux 或 ArgoCD 实现持续部署
- **服务网格**：集成 Linkerd 或 Istio 增强服务通信能力
- **证书管理**：配置 cert-manager 自动管理 TLS 证书
- **备份解决方案**：使用 Velero 备份整个集群
