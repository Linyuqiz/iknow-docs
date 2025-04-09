# Helm - Kubernetes 的包管理工具

Helm 是 Kubernetes 的包管理工具，它简化了 Kubernetes 应用的部署和管理过程。通过 Helm，您可以定义、安装和升级复杂的 Kubernetes 应用，就像使用 apt、yum 或 Homebrew 管理操作系统软件包一样简单。

## 什么是 Helm？

想象一下，如果您需要在 Kubernetes 上部署一个应用，您可能需要创建多个资源：Deployment、Service、ConfigMap、Secret 等。这些资源之间有依赖关系，而且在不同环境（开发、测试、生产）中可能需要不同的配置。

Helm 就像是一个"食谱"管理工具，它将这些 Kubernetes 资源打包成一个单一的单元，称为"Chart"。这样，您就可以一键安装、升级或卸载整个应用，而不必单独管理每个资源。

## 为什么使用 Helm？

- **简化复杂应用的部署**：一个命令安装整个应用栈
- **版本管理**：轻松升级和回滚应用
- **共享配置**：通过 Chart 仓库共享应用配置
- **模板化**：使用模板和值文件实现配置复用
- **依赖管理**：管理应用之间的依赖关系

## 内容导航

本节将详细介绍 Helm 的使用方法，分为以下几个部分：

1. [基本使用](./basic-usage.md) - 学习 Helm 的基础概念和常用命令
2. [进阶使用](./advanced-usage.md) - 深入了解 Helm 的高级功能和最佳实践
3. [进阶命令](./advanced-commands.md) - 掌握 Helm 的复杂命令和参数

无论您是 Kubernetes 新手还是有经验的用户，这些指南都将帮助您充分利用 Helm 来简化应用部署和管理流程。
