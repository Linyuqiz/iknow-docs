工具安装
brew install grpcurl
基本使用
查看服务
grpcurl -plaintext 10.0.7.146:1114 list
查看接口
grpcurl -plaintext 10.0.7.146:1114 list service_monitor.ServiceMonitorManagement
查看接口定义
grpcurl -plaintext 10.0.7.146:1114 describe service_monitor.ServiceMonitorManagement
查看接口参数定义
grpcurl -plaintext 10.0.7.146:1114 describe .service_monitor.ListServiceLogRequest
调用方法
直接调用
空参接口
grpcurl -plaintext -d '' 10.0.7.146:1114 service_monitor.ServiceMonitorManagement.ListService
单对象接口
grpcurl -plaintext -d '{
    "services": ["api","psp"],
    "date_type": "1",
    "start_time": 1681920000,
    "end_time": 1682784000
}' 10.0.7.146:1114 service_monitor.ServiceMonitorManagement.GetServiceLogLineChartData
复杂对象接口
grpcurl -plaintext -d '{
    "services": ["api","psp"],
    "start_time": 1681920000,
    "end_time": 1682784000,
    "page": {
        "index": 0,
        "size": 10
    }
}' 10.0.7.146:1114 service_monitor.ServiceMonitorManagement.ListServiceLog
变参数调用
grpcurl -plaintext -d @ 10.0.7.146:1114 service_monitor.ServiceMonitorManagement.GetServiceLogLineChartData