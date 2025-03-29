# Slurm 单机版安装指南 (Rocky Linux 9)

本指南将帮助你在 Rocky Linux 9 上安装和配置 Slurm 的单机版本，适用于个人学习和小型测试环境。

## 环境准备

确保你的系统满足以下要求：
- Rocky Linux 9（最小安装）
- 具有 sudo 权限的用户账户
- 网络连接以下载必要的软件包

## 安装步骤

### 1. 安装必要的依赖

首先，更新系统并安装必要的依赖：

```bash
sudo dnf update -y
sudo dnf install -y epel-release
sudo dnf install -y munge munge-libs munge-devel
sudo dnf install -y mariadb mariadb-server mariadb-devel
sudo dnf install -y gcc make readline-devel perl-ExtUtils-MakeMaker pam-devel rpm-build
sudo dnf install -y openssl openssl-devel python3
```

### 2. 配置 MUNGE 认证服务

MUNGE 是 Slurm 用于节点间认证的服务：

```bash
# 创建 MUNGE 密钥
sudo /usr/sbin/create-munge-key -r

# 设置正确的权限
sudo chown munge:munge /etc/munge/munge.key
sudo chmod 400 /etc/munge/munge.key

# 启动 MUNGE 服务
sudo systemctl enable munge
sudo systemctl start munge

# 测试 MUNGE 是否正常工作
munge -n | unmunge
```

### 3. 安装 Slurm

下载并安装 Slurm：

```bash
# 下载 Slurm 源码
cd /tmp
wget https://download.schedmd.com/slurm/slurm-23.02.3.tar.bz2
tar xvf slurm-23.02.3.tar.bz2
cd slurm-23.02.3

# 配置并编译 Slurm
./configure --prefix=/usr --sysconfdir=/etc/slurm
make
sudo make install
```

### 4. 配置 Slurm

创建必要的目录和用户：

```bash
# 创建 Slurm 用户和组
sudo groupadd -g 992 slurm
sudo useradd -m -c "Slurm workload manager" -d /var/lib/slurm -u 992 -g slurm -s /bin/bash slurm

# 创建必要的目录
sudo mkdir -p /etc/slurm /var/spool/slurmd /var/spool/slurmctld /var/log/slurm
sudo chown slurm:slurm /var/spool/slurmd /var/spool/slurmctld /var/log/slurm
```

创建 Slurm 配置文件：

```bash
sudo nano /etc/slurm/slurm.conf
```

添加以下基本配置（根据你的系统调整）：

```
# slurm.conf
ClusterName=localhost
SlurmctldHost=localhost
MpiDefault=none
ProctrackType=proctrack/pgid
ReturnToService=1
SlurmctldPidFile=/var/run/slurmctld.pid
SlurmctldPort=6817
SlurmdPidFile=/var/run/slurmd.pid
SlurmdPort=6818
SlurmdSpoolDir=/var/spool/slurmd
SlurmUser=slurm
StateSaveLocation=/var/spool/slurmctld
SwitchType=switch/none
TaskPlugin=task/none
FastSchedule=1
SchedulerType=sched/backfill
SelectType=select/cons_res
SelectTypeParameters=CR_CPU

# 节点定义
NodeName=localhost CPUs=1 State=UNKNOWN
PartitionName=debug Nodes=localhost Default=YES MaxTime=INFINITE State=UP
```

### 5. 创建 systemd 服务文件

为 Slurm 控制守护进程创建服务文件：

```bash
sudo nano /etc/systemd/system/slurmctld.service
```

添加以下内容：

```
[Unit]
Description=Slurm controller daemon
After=network.target munge.service
ConditionPathExists=/etc/slurm/slurm.conf

[Service]
Type=forking
EnvironmentFile=-/etc/sysconfig/slurmctld
ExecStart=/usr/sbin/slurmctld $SLURMCTLD_OPTIONS
ExecReload=/bin/kill -HUP $MAINPID
PIDFile=/var/run/slurmctld.pid
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

为 Slurm 节点守护进程创建服务文件：

```bash
sudo nano /etc/systemd/system/slurmd.service
```

添加以下内容：

```
[Unit]
Description=Slurm node daemon
After=network.target munge.service
ConditionPathExists=/etc/slurm/slurm.conf

[Service]
Type=forking
EnvironmentFile=-/etc/sysconfig/slurmd
ExecStart=/usr/sbin/slurmd $SLURMD_OPTIONS
ExecReload=/bin/kill -HUP $MAINPID
PIDFile=/var/run/slurmd.pid
LimitNOFILE=131072
LimitMEMLOCK=infinity
LimitSTACK=infinity

[Install]
WantedBy=multi-user.target
```

### 6. 启动 Slurm 服务

重新加载 systemd 配置并启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable slurmctld slurmd
sudo systemctl start slurmctld slurmd
```

### 7. 验证安装

检查 Slurm 服务状态：

```bash
sudo systemctl status slurmctld slurmd
```

查看节点状态：

```bash
sinfo
```

提交测试作业：

```bash
srun -N1 hostname
```

## 故障排除

如果遇到问题，请检查日志文件：

```bash
sudo tail -f /var/log/slurm/slurmctld.log
sudo tail -f /var/log/slurm/slurmd.log
```

常见问题：

1. **MUNGE 认证失败**：确保 MUNGE 密钥权限正确，并且 MUNGE 服务正在运行。
2. **节点状态为 DOWN**：检查 slurmd 日志，可能是配置问题或资源不匹配。
3. **无法启动服务**：确保所有必要的目录都已创建，并且具有正确的权限。

## 参考资源

- [Slurm 官方文档](https://slurm.schedmd.com/documentation.html)
- [Slurm 配置示例](https://slurm.schedmd.com/configurator.html)
