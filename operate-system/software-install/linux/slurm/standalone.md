# Slurm 单机版安装指南 (Rocky Linux 9)

本指南将帮助你在 Rocky Linux 9 上安装和配置 Slurm 的单机版本，适用于个人学习和小型测试环境。

## 环境准备

确保你的系统满足以下要求：
- Rocky Linux 9（最小安装）
- 具有 root 权限的用户账户（或 sudo 权限）
- 网络连接以下载必要的软件包
- 至少 2GB 内存和 20GB 磁盘空间

## 前置准备

### 配置系统软件源

首先，我们需要启用 Rocky Linux 的开发软件源，以获取所需的开发工具和库：

```bash
dnf install -y 'dnf-command(config-manager)'
dnf config-manager --set-enabled devel
dnf clean all && dnf makecache
```

## 安装步骤

### 1. 安装必要的依赖

首先，安装开发工具和所有必要的依赖包：

```bash
# 安装开发工具组
dnf group install -y "Development Tools"

# 安装所有必要的依赖
dnf install -y mariadb mariadb-server mariadb-devel \
               munge munge-libs munge-devel \
               hwloc-libs hwloc-devel \
               pam-devel perl-ExtUtils-MakeMaker readline-devel \
               kernel-headers dbus-devel rpm-build \
               python3-devel perl-Switch perl-devel perl-CPAN \
               vim wget bash-completion
```

### 2. 配置 MariaDB 数据库

Slurm 使用 MariaDB 存储作业记录和账户信息：

```bash
# 启动 MariaDB 服务
systemctl start mariadb --now

# 配置 MariaDB（以下命令会提示输入密码，默认无密码直接回车）
mysql -uroot -p <<EOF
create database slurm_acct_db;
use mysql;
alter user 'root'@'localhost' IDENTIFIED BY 'qwer1234';
grant all on *.* to 'root'@'%' identified by 'qwer1234';
create user 'slurm'@'localhost' identified by 'qwer1234';
grant all on slurm_acct_db.* TO 'slurm'@'localhost';
flush privileges;
exit
EOF
```

::: warning 注意
在生产环境中，请使用更强的密码替换 'qwer1234'，并限制数据库访问权限。
:::

### 3. 配置 MUNGE 认证服务

MUNGE 是 Slurm 用于节点间认证的服务：

```bash
# 创建 MUNGE 密钥
create-munge-key

# 设置正确的权限
chown munge:munge /etc/munge/munge.key
chmod 400 /etc/munge/munge.key

# 启动 MUNGE 服务
systemctl start munge --now
```

### 4. 安装 Slurm

下载并安装最新版本的 Slurm：

```bash
# 下载 Slurm 源码包（使用最新的 24.11.3 版本）
wget https://download.schedmd.com/slurm/slurm-24.11.3.tar.bz2

# 使用 rpmbuild 构建 RPM 包
rpmbuild -ta slurm-24.11.3.tar.bz2

# 安装所有生成的 RPM 包
dnf localinstall -y rpmbuild/RPMS/x86_64/*
```

::: tip 提示
使用 RPM 包安装比从源码编译安装更加简单可靠，便于后续的升级和维护。
:::

### 5. 配置 Slurm

#### 5.1 创建 Slurm 用户和目录

```bash
# 复制示例配置文件
cp /etc/slurm/slurm.conf.example /etc/slurm/slurm.conf
cp /etc/slurm/slurmdbd.conf.example /etc/slurm/slurmdbd.conf
cp /etc/slurm/cgroup.conf.example /etc/slurm/cgroup.conf

# 创建 Slurm 用户和组
groupadd -g 2000 slurm && useradd -u 2000 -g 2000 -s /sbin/nologin -M slurm

# 创建必要的目录
mkdir -p /etc/sysconfig/slurm \
        /var/spool/slurmd \
        /var/spool/slurmctld \
        /var/log/slurm \
        /var/run/slurm \
        /var/run/slurmdbd

# 设置正确的权限
chown -R slurm:slurm /var/spool/slurmd \
        /var/spool/slurmctld \
        /var/log/slurm \
        /var/run/slurm \
        /var/run/slurmdbd \
        /etc/slurm/slurmdbd.conf
```

#### 5.2 配置 slurm.conf

编辑 Slurm 主配置文件：

```bash
vim /etc/slurm/slurm.conf
```

替换为以下内容（根据你的主机名调整）：

```
SlurmctldHost=rocky  # 替换为你的主机名

AccountingStorageType=accounting_storage/slurmdbd
AccountingStorageUser=slurm
AccountingStoreFlags=slurm_acct_db

NodeName=rocky CPUs=4 State=UNKNOWN  # 替换为你的主机名和实际CPU数量
PartitionName=compute Nodes=rocky Default=YES MaxTime=INFINITE State=UP  # 替换为你的主机名
```

::: warning 重要提示
请将上述配置中的 `rocky` 替换为你的实际主机名，可以通过 `hostname` 命令查看。
:::

#### 5.3 配置 slurmdbd.conf

编辑 Slurm 数据库守护进程配置文件：

```bash
vim /etc/slurm/slurmdbd.conf
```

替换为以下内容：

```
StorageHost=localhost
StoragePort=3306
StoragePass=qwer1234  # 使用你在MariaDB设置的密码
StorageUser=slurm
StorageLoc=slurm_acct_db
```

### 6. 启动 Slurm 服务

Slurm RPM 包已经自动创建了所需的 systemd 服务文件，我们只需要按顺序启动这些服务：

```bash
# 启动 Slurm 节点守护进程
systemctl start slurmd --now

# 启动 Slurm 数据库守护进程
systemctl start slurmdbd --now

# 等待 slurmdbd 完全启动
sleep 3

# 启动 Slurm 控制守护进程
systemctl start slurmctld --now
```


### 7. 验证安装

检查 Slurm 服务状态：

```bash
systemctl status slurmctld slurmd slurmdbd
```

查看节点和分区状态：

```bash
sinfo
```

查看集群信息：

```bash
scontrol show config
```

提交测试作业：

```bash
srun -N1 hostname
```

查看作业队列：

```bash
squeue
```

## 参考资料

- [Slurm 官方文档](https://slurm.schedmd.com/documentation.html)
- [Slurm 配置示例](https://slurm.schedmd.com/configurator.html)
- [Slurm 故障排除指南](https://slurm.schedmd.com/troubleshoot.html)
