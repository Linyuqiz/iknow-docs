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
      { 
        text: '编程语言', 
        items: [
          { text: 'Go 编程', link: '/programming/go/' }
        ]
      },
      { 
        text: '中间件', 
        items: [
          { text: '数据库', link: '/middleware/databases/' },
          { text: '消息队列', link: '/middleware/message-queues/' },
          { text: '缓存系统', link: '/middleware/caching/' }
        ]
      },
      { 
        text: '系统架构', 
        items: [
          { text: '分布式系统', link: '/architecture/distributed-systems/' },
          { text: '微服务架构', link: '/architecture/microservices/' },
          { text: '云原生应用', link: '/architecture/cloud-native/' }
        ]
      },
      { 
        text: '操作系统', 
        items: [
          { text: '软件安装', link: '/operate-system/software-install/' },
          { text: '开发工具', link: '/operate-system/dev-tools/' }
        ]
      },
      { 
        text: '个人博客', 
        items: [
          { text: '技术随笔', link: '/personal-blog/tech-notes/' },
          { text: '学习心得', link: '/personal-blog/learning/' },
          { text: '项目分享', link: '/personal-blog/projects/' }
        ]
      }
    ],

    sidebar: {
      '/programming/go/': [
        {
          text: 'Go 编程',
          collapsed: false,
          items: [
            { text: '概述', link: '/programming/go/' },
            { text: '基础语法', link: '/programming/go/basic-syntax' },
            { text: '数据结构', link: '/programming/go/data-structures' },
            { text: '并发编程', link: '/programming/go/concurrency' }
          ]
        }
      ],
      '/middleware/databases/': [
        {
          text: '数据库',
          collapsed: false,
          items: [
            { text: '概述', link: '/middleware/databases/' },
          ]
        }
      ],
      '/middleware/message-queues/': [
        {
          text: '消息队列',
          collapsed: false,
          items: [
            { text: '概述', link: '/middleware/message-queues/' },
          ]
        }
      ],
      '/middleware/caching/': [
        {
          text: '缓存系统',
          collapsed: false,
          items: [
            { text: '概述', link: '/middleware/caching/' },
          ]
        }
      ],
      '/architecture/distributed-systems/': [
        {
          text: '分布式系统',
          collapsed: false,
          items: [
            { text: '概述', link: '/architecture/distributed-systems/' },
          ]
        }
      ],
      '/architecture/microservices/': [
        {
          text: '微服务架构',
          collapsed: false,
          items: [
            { text: '概述', link: '/architecture/microservices/' },
          ]
        }
      ],
      '/architecture/cloud-native/': [
        {
          text: '云原生应用',
          collapsed: false,
          items: [
            { text: '概述', link: '/architecture/cloud-native/' },
            {
              text: "Helm",
              collapsed: false,
              items: [
                { text: "概述", link: "/architecture/cloud-native/helm" },
                { text: "基本使用", link: "/architecture/cloud-native/helm/basic-usage" },
                { text: "进阶使用", link: "/architecture/cloud-native/helm/advanced-usage" },
                { text: "进阶命令", link: "/architecture/cloud-native/helm/advanced-commands" }
              ]
            }
          ]
        }
      ],
      '/operate-system/software-install/': [
        {
          text: '软件安装',
          collapsed: false,
          items: [
            { text: '概述', link: '/operate-system/software-install/' },
            { 
              text: 'Linux 软件', 
              collapsed: false,
              items: [
                { 
                  text: 'Slurm', 
                  collapsed: false,
                  items: [
                    { text: '概述', link: '/operate-system/software-install/linux/slurm/' },
                    { text: '单机版', link: '/operate-system/software-install/linux/slurm/standalone' },
                    { text: '基本命令', link: '/operate-system/software-install/linux/slurm/commands' },
                  ]
                }
              ]
            }
          ]
        }
      ],
      '/operate-system/dev-tools/': [
        {
          text: '开发工具',
          collapsed: false,
          items: [
            { text: '概述', link: '/operate-system/dev-tools/' },
            { text: 'curl', link: '/operate-system/dev-tools/curl' },
            { text: 'gRPCurl', link: '/operate-system/dev-tools/grpcurl' },
            { text: 'rsync', link: '/operate-system/dev-tools/rsync' }
          ]
        }
      ],
      '/personal-blog/tech-notes/': [
        {
          text: '技术随笔',
          collapsed: false,
          items: [
            { text: '概述', link: '/personal-blog/tech-notes/' },
          ]
        }
      ],
      '/personal-blog/learning/': [
        {
          text: '学习心得',
          collapsed: false,
          items: [
            { text: '概述', link: '/personal-blog/learning/' },
          ]
        }
      ],
      '/personal-blog/projects/': [
        {
          text: '项目分享',
          collapsed: false,
          items: [
            { text: '概述', link: '/personal-blog/projects/' },
          ]
        }
      ],
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
