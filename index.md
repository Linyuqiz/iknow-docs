---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "iKnow Docs"
  text: "个人知识库"
  tagline: 技术文档和学习笔记
  image:
    src: /logo.svg
    alt: iKnow Docs
  actions:
    - theme: brand
      text: Go 编程
      link: /go/
    - theme: sponsor
      text: Rust 编程
      link: /rust/

features:
  - icon: 📖
    title: Go 编程文档
    details: 系统性学习笔记，包含语言基础、并发编程、微服务开发和性能优化
    link: /go/
  - icon: 📚
    title: Rust 技术指南
    details: 深入探讨所有权系统、内存安全、高性能编程和实战案例
    link: /rust/
  - icon: 📋
    title: 中间件知识库
    details: 数据库、消息队列、缓存等分布式系统核心组件的实践经验总结
    link: /middleware/
  - icon: 📓
    title: DevOps 实践手册
    details: 容器化、编排、自动化部署和云原生架构的最佳实践指南
    link: /devops/
---
