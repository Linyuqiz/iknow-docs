# rsync 工具使用指南

rsync（remote synchronization）是一个快速、多功能的文件复制和同步工具，广泛用于备份和镜像数据。它的增量传输算法只传输文件的变化部分，大大提高了文件同步的效率。

## 工具安装

在大多数 Linux 系统中，rsync 已经预装。如果需要安装：

```bash
# macOS (使用 Homebrew)
brew install rsync

# Debian/Ubuntu
sudo apt install rsync

# CentOS/RHEL
sudo yum install rsync
```

## 基本语法

rsync 的基本语法如下：

```bash
rsync [选项] 源路径 目标路径
```

## 基本使用

### 本地文件复制

复制单个文件：

```bash
rsync file.txt /backup/
```

复制目录（不包含子目录）：

```bash
rsync dir1/ dir2/
```

::: warning 注意
`dir1/` 末尾的斜杠表示复制目录中的内容，而不是目录本身。如果省略斜杠 `rsync dir1 dir2/`，则会在 dir2 中创建 dir1 子目录。
:::

### 递归复制

使用 `-r` 或 `--recursive` 参数递归复制目录及其内容：

```bash
rsync -r dir1/ dir2/
```

### 保留文件属性

使用 `-a` 或 `--archive` 参数保留几乎所有文件属性（相当于 `-rlptgoD`）：

```bash
rsync -a dir1/ dir2/
```

`-a` 包含以下选项：
- `-r`：递归复制
- `-l`：复制符号链接
- `-p`：保留权限
- `-t`：保留修改时间
- `-g`：保留组
- `-o`：保留所有者
- `-D`：保留设备文件和特殊文件

### 显示详细信息

使用 `-v` 或 `--verbose` 参数显示详细信息：

```bash
rsync -av dir1/ dir2/
```

### 显示传输进度

使用 `--progress` 参数显示传输进度：

```bash
rsync -av --progress dir1/ dir2/
```

## 远程同步

### 从本地复制到远程

```bash
rsync -av /local/dir/ user@remote_host:/remote/dir/
```

### 从远程复制到本地

```bash
rsync -av user@remote_host:/remote/dir/ /local/dir/
```

### 使用 SSH 密钥

默认情况下，rsync 使用 SSH 进行远程传输。可以指定 SSH 密钥：

```bash
rsync -av -e "ssh -i /path/to/private_key" /local/dir/ user@remote_host:/remote/dir/
```

### 使用不同的端口

如果 SSH 服务运行在非标准端口：

```bash
rsync -av -e "ssh -p 2222" /local/dir/ user@remote_host:/remote/dir/
```

## 高级选项

### 只同步新文件或修改过的文件

使用 `-u` 或 `--update` 参数跳过目标位置中较新的文件：

```bash
rsync -avu dir1/ dir2/
```

### 删除目标中多余的文件

使用 `--delete` 参数删除目标位置中源位置没有的文件：

```bash
rsync -av --delete dir1/ dir2/
```

::: warning 注意
使用 `--delete` 参数时要小心，它会删除目标位置中源位置没有的文件。建议先使用 `--dry-run` 参数测试。
:::

### 排除文件

使用 `--exclude` 参数排除特定文件或目录：

```bash
rsync -av --exclude='*.log' dir1/ dir2/
```

排除多个文件或目录：

```bash
rsync -av --exclude='*.log' --exclude='cache/' dir1/ dir2/
```

使用模式文件排除多个文件：

```bash
rsync -av --exclude-from='exclude.txt' dir1/ dir2/
```

`exclude.txt` 文件内容示例：
```
*.log
cache/
temp/
```

### 只包含特定文件

使用 `--include` 和 `--exclude` 参数组合：

```bash
rsync -av --include='*.txt' --exclude='*' dir1/ dir2/
```

这将只复制 `.txt` 文件，排除所有其他文件。

### 限制带宽

使用 `--bwlimit` 参数限制带宽（单位：KB/s）：

```bash
rsync -av --bwlimit=1000 dir1/ dir2/
```

### 模拟运行

使用 `--dry-run` 或 `-n` 参数模拟运行，不实际复制文件：

```bash
rsync -av --dry-run dir1/ dir2/
```

这对于测试复杂的 rsync 命令非常有用，可以看到哪些文件会被传输，但不会实际执行传输。

## 实用示例

### 创建备份

创建带时间戳的备份：

```bash
rsync -av --link-dest=/backup/latest /source/ /backup/$(date +%Y-%m-%d)/
ln -sf /backup/$(date +%Y-%m-%d) /backup/latest
```

这会创建一个增量备份，只存储变化的文件，节省空间。

### 镜像网站

```bash
rsync -av --delete --compress --exclude="*.tmp" /local/website/ user@remote:/var/www/html/
```

### 定期同步（使用 cron）

在 crontab 中添加：

```
0 2 * * * rsync -av --delete /source/ /backup/ >> /var/log/backup.log 2>&1
```

这会在每天凌晨 2 点执行同步。

### 使用检查点重启

对于大文件传输，可以使用 `--checksum` 和 `--partial` 参数：

```bash
rsync -av --partial --checksum large_file.iso user@remote:/backup/
```

`--partial` 参数允许恢复中断的传输，而 `--checksum` 参数使用校验和而不是文件大小和修改时间来确定文件是否已更改。

## 常见问题排查

- 如果遇到权限问题，确保有足够的权限读取源文件和写入目标位置
- 如果需要保留特殊权限，使用 `--super` 参数（需要目标系统上的 root 权限）
- 如果遇到网络问题，可以使用 `--timeout=SECONDS` 参数设置超时时间

## 参考资料

- [rsync 官方文档](https://rsync.samba.org/documentation.html)
- [rsync 命令手册](https://linux.die.net/man/1/rsync)
