import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "iknow",
  description: "知识库文档",
  lang: 'zh-CN',
  lastUpdated: true,
  // 添加 base 配置，对应 GitHub 仓库名称
  base: '/iknow-docs/',
  head: [
    ['link', { rel: 'icon', href: '/iknow-docs/logo.svg', type: 'image/svg+xml' }],
    // 添加 apple-touch-icon 以支持 iOS 设备
    ['link', { rel: 'apple-touch-icon', href: '/iknow-docs/logo.svg' }],
    // 添加 mask-icon 以支持 Safari 浏览器的 pinned tabs
    ['link', { rel: 'mask-icon', href: '/iknow-docs/logo.svg', color: '#3eaf7c' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: 'Go', link: '/go/' },
      { text: 'Rust', link: '/rust/' },
      { text: '中间件', link: '/middleware/' },
      { text: 'DevOps', link: '/devops/' },
      { text: '关于', link: '/about/' }
    ],

    sidebar: {
      '/go/': [
        {
          text: 'Go 编程',
          collapsed: false,
          items: [
            { text: '简介', link: '/go/' },
            { text: '基础语法', link: '/go/basic-syntax' },
            { text: '数据结构', link: '/go/data-structures' },
            { text: '并发编程', link: '/go/concurrency' }
          ]
        }
      ],
      '/rust/': [
        {
          text: 'Rust 编程',
          collapsed: false,
          items: [
            { text: '简介', link: '/rust/' },
            { text: '基础语法', link: '/rust/basic-syntax' },
            { text: '所有权与借用', link: '/rust/ownership' },
            { text: '并发编程', link: '/rust/concurrency' }
          ]
        }
      ],
      '/middleware/': [
        {
          text: '中间件',
          collapsed: false,
          items: [
            { text: '概述', link: '/middleware/' },
            { text: '数据库', link: '/middleware/databases' },
            { text: '消息队列', link: '/middleware/message-queues' },
            { text: '缓存', link: '/middleware/caching' }
          ]
        }
      ],
      '/devops/': [
        {
          text: 'DevOps',
          collapsed: false,
          items: [
            { text: '概述', link: '/devops/' },
            { text: 'Docker', link: '/devops/docker' },
            { text: 'Kubernetes', link: '/devops/kubernetes' }
          ]
        },
        {
          text: 'Linux 软件',
          collapsed: false,
          items: [
            { text: '概述', link: '/devops/linux/software/' },
            {
              text: 'Slurm',
              collapsed: false,
              items: [
                { text: '概述', link: '/devops/linux/software/slurm/' },
                { text: '单机版 (Rocky 9)', link: '/devops/linux/software/slurm/standalone' },
              ]
            }
          ]
        },
        {
          text: 'Mac 软件',
          collapsed: false,
          items: []
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/linyuqiz/iknow-docs' }
    ],

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: '版权所有 2025-至今'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: 'deep',
      label: '本页目录'
    }
  }
})
