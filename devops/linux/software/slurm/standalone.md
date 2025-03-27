---
title: Slurm 单机版安装指南 (Rocky Linux 9)
description: 在 Rocky Linux 9 上安装配置 Slurm 单机版的详细教程
---

# Slurm 单机版安装指南 (Rocky Linux 9)

本文将详细介绍如何在 Rocky Linux 9 系统上安装和配置 Slurm 单机版。单机版适用于个人工作站或测试环境，所有 Slurm 组件都运行在同一台服务器上。

## 环境准备

本教程基于以下环境：

- 操作系统：Rocky Linux 9
- Slurm 版本：22.05.x
- 配置：单节点（控制节点和计算节点为同一台服务器）

## 前置条件

1. 更新系统并安装必要的工具

```bash
# 更新系统
sudo dnf update -y

# 安装必要的工具
sudo dnf install -y epel-release
sudo dnf install -y gcc gcc-c++ make cmake munge munge-devel munge-libs \
    python3 python3-devel python3-pip openssl openssl-devel pam-devel \
    numactl numactl-devel hwloc hwloc-devel lua lua-devel readline-devel \
    rrdtool-devel ncurses-devel man2html libibmad libibumad perl-ExtUtils-MakeMaker
```

## 安装 MUNGE 认证服务

MUNGE 是 Slurm 用于节点间认证的工具，即使在单机环境中也需要配置。

```bash
# 创建 MUNGE 密钥
sudo /usr/sbin/create-munge-key -r

# 设置适当的权限
sudo chown munge:munge /etc/munge/munge.key
sudo chmod 400 /etc/munge/munge.key

# 启动 MUNGE 服务
sudo systemctl enable munge
sudo systemctl start munge

# 测试 MUNGE 是否正常工作
munge -n | unmunge
```

如果 MUNGE 工作正常，上述命令应该显示成功的解码信息。

## 安装 Slurm

1. 下载并编译 Slurm：

```bash
# 创建临时目录
mkdir -p ~/slurm_build
cd ~/slurm_build

# 下载 Slurm 源码
wget https://download.schedmd.com/slurm/slurm-22.05.8.tar.bz2
tar xf slurm-22.05.8.tar.bz2
cd slurm-22.05.8

# 配置并编译 Slurm
./configure --prefix=/usr --sysconfdir=/etc/slurm
make -j $(nproc)
sudo make install
```

2. 创建必要的目录和用户：

```bash
# 创建 slurm 用户和组
sudo groupadd -g 950 slurm
sudo useradd -m -d /var/lib/slurm -u 950 -g slurm -s /bin/bash slurm

# 创建必要的目录
sudo mkdir -p /var/spool/slurm
sudo mkdir -p /var/log/slurm
sudo chown -R slurm:slurm /var/spool/slurm /var/log/slurm
```

## 配置 Slurm

1. 创建 Slurm 配置文件：

```bash
# 创建配置目录
sudo mkdir -p /etc/slurm

# 生成示例配置文件
sudo cp ~/slurm_build/slurm-22.05.8/etc/slurm.conf.example /etc/slurm/slurm.conf
```

2. 编辑 Slurm 配置文件：

```bash
sudo vi /etc/slurm/slurm.conf
```

以下是一个单机版的基本配置示例：

```
# slurm.conf
ClusterName=localhost
ControlMachine=localhost

# 认证配置
AuthType=auth/munge
CryptoType=crypto/munge

# Slurm 用户
SlurmUser=slurm

# 状态保存位置
StateSaveLocation=/var/spool/slurm
SlurmdSpoolDir=/var/spool/slurm

# 日志配置
SlurmctldLogFile=/var/log/slurm/slurmctld.log
SlurmdLogFile=/var/log/slurm/slurmd.log

# 进程 ID 文件位置
SlurmctldPidFile=/var/run/slurmctld.pid
SlurmdPidFile=/var/run/slurmd.pid

# 插件配置
ProctrackType=proctrack/cgroup
TaskPlugin=task/cgroup

# 作业完成信息
JobCompType=jobcomp/none

# 调度配置
SchedulerType=sched/backfill
SelectType=select/cons_tres
SelectTypeParameters=CR_Core

# 节点配置 - 根据您的实际硬件调整 CPUs 和 RealMemory
NodeName=localhost CPUs=4 RealMemory=4000 State=UNKNOWN

# 分区配置
PartitionName=debug Nodes=localhost Default=YES MaxTime=INFINITE State=UP
```

请根据您的实际硬件配置调整 `CPUs` 和 `RealMemory` 参数。您可以使用以下命令查看系统信息：

```bash
# 查看 CPU 核心数
nproc

# 查看内存大小（KB）
grep MemTotal /proc/meminfo
```

## 创建 systemd 服务文件

1. 为 Slurm 控制守护进程创建服务文件：

```bash
sudo tee /etc/systemd/system/slurmctld.service << 'EOF'
[Unit]
Description=Slurm controller daemon
After=network.target munge.service
ConditionPathExists=/etc/slurm/slurm.conf

[Service]
Type=forking
User=slurm
Group=slurm
ExecStart=/usr/sbin/slurmctld
ExecReload=/bin/kill -HUP $MAINPID
PIDFile=/var/run/slurmctld.pid
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
```

2. 为 Slurm 节点守护进程创建服务文件：

```bash
sudo tee /etc/systemd/system/slurmd.service << 'EOF'
[Unit]
Description=Slurm node daemon
After=network.target munge.service
ConditionPathExists=/etc/slurm/slurm.conf

[Service]
Type=forking
User=root
Group=root
ExecStart=/usr/sbin/slurmd
ExecReload=/bin/kill -HUP $MAINPID
PIDFile=/var/run/slurmd.pid
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
```

## 启动 Slurm 服务

1. 重新加载 systemd 配置：

```bash
sudo systemctl daemon-reload
```

2. 启动 Slurm 控制守护进程和节点守护进程：

```bash
sudo systemctl enable slurmctld
sudo systemctl start slurmctld

sudo systemctl enable slurmd
sudo systemctl start slurmd
```

3. 检查服务状态：

```bash
sudo systemctl status slurmctld
sudo systemctl status slurmd
```

## 验证 Slurm 安装

1. 检查节点状态：

```bash
sinfo
```

您应该看到类似以下的输出：

```
PARTITION AVAIL  TIMELIMIT  NODES  STATE NODELIST
debug*       up   infinite      1   idle localhost
```

2. 提交测试作业：

```bash
# 创建测试脚本
cat > test_job.sh << 'EOF'
#!/bin/bash
#SBATCH --job-name=test
#SBATCH --output=test_%j.out
#SBATCH --error=test_%j.err
#SBATCH --ntasks=1
#SBATCH --time=1:00

hostname
sleep 10
echo "Hello from Slurm"
EOF

# 提交作业
sbatch test_job.sh

# 查看作业状态
squeue
```

3. 检查作业输出：

```bash
cat test_*.out
```

## 故障排除

如果遇到问题，可以检查以下日志文件：

- 控制节点：`/var/log/slurm/slurmctld.log`
- 计算节点：`/var/log/slurm/slurmd.log`

常见问题及解决方法：

1. MUNGE 认证失败：
   - 检查 MUNGE 服务是否正在运行：`systemctl status munge`
   - 确保 MUNGE 密钥权限正确：`ls -l /etc/munge/munge.key`

2. 节点状态显示为 DOWN：
   - 检查 slurmd 日志
   - 确保节点配置正确（CPU、内存等）

3. 作业排队但不运行：
   - 检查分区配置
   - 检查资源限制
   - 查看 slurmctld 日志

## 结论

通过本教程，您已经在 Rocky Linux 9 上成功安装和配置了 Slurm 单机版。这为您提供了一个功能齐全的作业调度系统，可以用于测试和开发目的。

如果您需要在生产环境中使用 Slurm，建议配置集群版，以获得更好的性能和可靠性。

## 参考资料

- [Slurm 官方文档](https://slurm.schedmd.com/documentation.html)
- [Slurm Quick Start Guide](https://slurm.schedmd.com/quickstart.html)
- [MUNGE 官方文档](https://dun.github.io/munge/)
