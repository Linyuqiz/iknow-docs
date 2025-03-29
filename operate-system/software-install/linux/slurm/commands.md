# Slurm 基本命令指南

本文档提供了 Slurm 工作负载管理器的常用命令和用法，帮助用户快速上手 Slurm 系统。

## 作业提交命令

### srun - 交互式运行作业

`srun` 命令用于提交交互式作业，作业会立即执行，并在终端显示输出。

基本用法：
```bash
srun [选项] <命令>
```

常用选项：
```bash
-N, --nodes=<数量>            # 指定节点数量
-n, --ntasks=<数量>           # 指定任务数量
-c, --cpus-per-task=<数量>    # 指定每个任务的 CPU 数量
--mem=<大小>                  # 指定内存大小（如：1G, 100M）
-p, --partition=<分区名>      # 指定要使用的分区
-t, --time=<时间>             # 指定最大运行时间（格式：分钟 或 天-小时:分钟:秒）
--gres=<资源>                 # 指定通用资源（如：gpu:1）
```

示例：
```bash
# 在一个节点上运行 hostname 命令
srun hostname

# 在 2 个节点上运行 hostname 命令
srun -N2 hostname

# 使用 4 个 CPU 核心运行程序
srun -c4 ./my_program

# 分配 2GB 内存运行程序
srun --mem=2G ./my_program

# 限制运行时间为 10 分钟
srun -t 10 ./my_program

# 在 GPU 分区使用 1 个 GPU 运行程序
srun -p gpu --gres=gpu:1 ./my_gpu_program
```

### sbatch - 批处理提交作业

`sbatch` 命令用于提交批处理作业脚本，作业会被放入队列中等待调度执行。

基本用法：
```bash
sbatch [选项] <脚本文件>
```

批处理脚本示例 (job.sh)：
```bash
#!/bin/bash
#SBATCH --job-name=test_job     # 作业名称
#SBATCH --nodes=1               # 节点数量
#SBATCH --ntasks=1              # 任务数量
#SBATCH --cpus-per-task=1       # 每个任务的 CPU 数量
#SBATCH --mem=1G                # 内存大小
#SBATCH --time=01:00:00         # 最大运行时间（1小时）
#SBATCH --output=%j.out         # 标准输出文件（%j 表示作业ID）
#SBATCH --error=%j.err          # 标准错误文件

# 作业命令
echo "Running job on $(hostname)"
sleep 60
echo "Job completed"
```

提交作业：
```bash
sbatch job.sh
```

### salloc - 分配资源

`salloc` 命令用于请求资源分配，通常用于交互式会话。

基本用法：
```bash
salloc [选项] [命令]
```

示例：
```bash
# 请求 2 个节点的资源，并启动交互式 shell
salloc -N2

# 请求 4 个 CPU 核心和 2GB 内存，并运行命令
salloc -c4 --mem=2G ./my_program
```

## 作业管理命令

### squeue - 查看作业队列

`squeue` 命令用于查看当前作业队列状态。

基本用法：
```bash
squeue [选项]
```

常用选项：
```bash
-u, --user=<用户名>           # 只显示指定用户的作业
-t, --states=<状态>           # 只显示指定状态的作业（如：RUNNING,PENDING）
-p, --partition=<分区名>      # 只显示指定分区的作业
--sort=<字段>                 # 按指定字段排序
-l, --long                    # 显示详细信息
```

示例：
```bash
# 查看所有作业
squeue

# 查看自己的作业
squeue -u $USER

# 查看正在运行的作业
squeue -t RUNNING

# 按优先级排序显示作业
squeue --sort=p,i
```

### scancel - 取消作业

`scancel` 命令用于取消已提交的作业。

基本用法：
```bash
scancel [选项] <作业ID>
```

常用选项：
```bash
-u, --user=<用户名>           # 取消指定用户的所有作业
-n, --name=<作业名>           # 取消指定名称的所有作业
-t, --state=<状态>            # 取消指定状态的所有作业
-p, --partition=<分区名>      # 取消指定分区的所有作业
```

示例：
```bash
# 取消作业 ID 为 12345 的作业
scancel 12345

# 取消自己的所有作业
scancel -u $USER

# 取消所有名为 "test_job" 的作业
scancel -n test_job

# 取消所有等待中的作业
scancel -t PENDING
```

### scontrol - 查看和修改作业

`scontrol` 命令是 Slurm 的管理工具，可以查看和修改作业信息。

基本用法：
```bash
scontrol [操作] [选项]
```

常用操作：
```bash
show job <作业ID>             # 显示作业详细信息
show node <节点名>            # 显示节点详细信息
show partition               # 显示分区信息
update job <作业ID> <参数>    # 更新作业参数
hold job <作业ID>             # 暂停作业
release job <作业ID>          # 释放暂停的作业
```

示例：
```bash
# 查看作业 ID 为 12345 的详细信息
scontrol show job 12345

# 查看节点 compute1 的详细信息
scontrol show node compute1

# 修改作业的时间限制
scontrol update job 12345 TimeLimit=2:00:00

# 暂停作业
scontrol hold job 12345

# 释放暂停的作业
scontrol release job 12345
```

## 集群状态命令

### sinfo - 查看集群状态

`sinfo` 命令用于查看集群和分区状态。

基本用法：
```bash
sinfo [选项]
```

常用选项：
```bash
-N, --Node                    # 按节点格式显示
-l, --long                    # 显示详细信息
-p, --partition=<分区名>      # 只显示指定分区
-t, --states=<状态>           # 只显示指定状态的节点
-o, --format=<格式>           # 自定义输出格式
```

示例：
```bash
# 查看集群状态
sinfo

# 显示详细的节点信息
sinfo -N -l

# 只显示空闲节点
sinfo -t idle

# 自定义输出格式
sinfo -o "%P %N %C %m"  # 显示分区、节点、CPU 和内存信息
```

### sacct - 查看作业历史

`sacct` 命令用于查看已完成作业的历史记录和统计信息。

基本用法：
```bash
sacct [选项]
```

常用选项：
```bash
-j, --jobs=<作业ID>           # 只显示指定作业
-u, --user=<用户名>           # 只显示指定用户的作业
-S, --starttime=<时间>        # 指定开始时间
-E, --endtime=<时间>          # 指定结束时间
-o, --format=<格式>           # 自定义输出格式
```

示例：
```bash
# 查看今天的作业历史
sacct -S today

# 查看过去一周的作业历史
sacct -S $(date -d "1 week ago" +%Y-%m-%d)

# 查看指定作业的详细信息
sacct -j 12345 --format=JobID,JobName,MaxRSS,Elapsed

# 查看自己的作业历史
sacct -u $USER
```

## 资源管理命令

### sshare - 查看公平共享信息

`sshare` 命令用于查看公平共享调度信息，包括用户和账户的资源使用情况。

基本用法：
```bash
sshare [选项]
```

示例：
```bash
# 查看所有用户的共享信息
sshare

# 查看自己的共享信息
sshare -u $USER
```

### sprio - 查看作业优先级

`sprio` 命令用于查看作业的优先级信息。

基本用法：
```bash
sprio [选项]
```

示例：
```bash
# 查看所有作业的优先级
sprio

# 查看自己作业的优先级
sprio -u $USER
```

## 高级用法

### 作业数组

作业数组允许用户提交多个相似的作业，每个作业处理不同的数据。

批处理脚本示例 (array_job.sh)：
```bash
#!/bin/bash
#SBATCH --job-name=array_job
#SBATCH --array=1-10          # 创建 10 个作业，索引从 1 到 10
#SBATCH --output=array_%A_%a.out  # %A 是作业 ID，%a 是数组索引

echo "Running task $SLURM_ARRAY_TASK_ID"
# 使用数组索引处理不同的输入文件
./my_program input_$SLURM_ARRAY_TASK_ID.dat
```

提交作业数组：
```bash
sbatch array_job.sh
```

### 作业依赖

作业依赖允许用户指定作业之间的依赖关系，例如一个作业必须在另一个作业完成后才能开始。

示例：
```bash
# 提交第一个作业
job1=$(sbatch --parsable job1.sh)

# 提交依赖于第一个作业的第二个作业
sbatch --dependency=afterok:$job1 job2.sh
```

依赖类型：
- `after`: 在指定作业开始后开始
- `afterany`: 在指定作业结束后开始（无论成功与否）
- `afterok`: 在指定作业成功完成后开始
- `afternotok`: 在指定作业失败后开始

### 资源预留

管理员可以使用 `scontrol` 命令创建资源预留，为特定用户或组保留资源。

示例：
```bash
# 创建资源预留
scontrol create reservation starttime=now duration=120 user=username nodes=compute[1-2] flags=maint,ignore_jobs

# 使用预留资源提交作业
sbatch --reservation=<预留名> job.sh
```

## 环境变量

Slurm 会在作业运行时设置多个环境变量，可以在脚本中使用：

```bash
SLURM_JOB_ID               # 作业 ID
SLURM_JOB_NAME             # 作业名称
SLURM_SUBMIT_DIR           # 作业提交目录
SLURM_JOB_NODELIST         # 分配的节点列表
SLURM_NTASKS               # 任务总数
SLURM_CPUS_PER_TASK        # 每个任务的 CPU 数量
SLURM_ARRAY_TASK_ID        # 作业数组索引
```

示例脚本：
```bash
#!/bin/bash
#SBATCH --job-name=env_test
#SBATCH --nodes=2
#SBATCH --ntasks=4

echo "Job ID: $SLURM_JOB_ID"
echo "Job Name: $SLURM_JOB_NAME"
echo "Submit Directory: $SLURM_SUBMIT_DIR"
echo "Node List: $SLURM_JOB_NODELIST"
echo "Number of Tasks: $SLURM_NTASKS"
```

## 常见问题解决

### 作业一直处于 PENDING 状态

可能的原因：
1. 资源不足（节点、CPU、内存等）
2. 达到用户或队列限制
3. 节点处于维护状态
4. 作业依赖未满足

解决方法：
```bash
# 查看作业详细信息，包括等待原因
scontrol show job <作业ID>

# 修改作业资源需求
scontrol update job <作业ID> NumNodes=1 NumCPUs=1
```

### 作业被取消或失败

可能的原因：
1. 超出时间限制
2. 超出内存限制
3. 程序错误

解决方法：
```bash
# 查看作业详细信息
sacct -j <作业ID> --format=JobID,JobName,State,ExitCode,Comment

# 检查作业输出和错误文件
cat slurm-<作业ID>.out
cat slurm-<作业ID>.err
```

## 参考资料

- [Slurm 官方文档](https://slurm.schedmd.com/documentation.html)
- [Slurm 命令手册](https://slurm.schedmd.com/man_index.html)
- [Slurm 快速入门指南](https://slurm.schedmd.com/quickstart.html)
