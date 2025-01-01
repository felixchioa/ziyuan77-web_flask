import psutil
import platform
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# 添加调试信息
logger.debug("psutil imported successfully")

def get_system_info():
    return {
        'system': platform.system(),
        'release': platform.release(),
        'version': platform.version(),
        'machine': platform.machine(),
        'processor': platform.processor()
    }

def get_cpu_info():
    cpu_percent = psutil.cpu_percent(interval=1, percpu=True)
    cpu_freq = psutil.cpu_freq()
    return {
        'percent': cpu_percent,
        'count': psutil.cpu_count(),
        'freq_current': cpu_freq.current,
        'freq_min': cpu_freq.min,
        'freq_max': cpu_freq.max
    }

def get_memory_info():
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    return {
        'total': mem.total,
        'available': mem.available,
        'percent': mem.percent,
        'used': mem.used,
        'swap_total': swap.total,
        'swap_used': swap.used,
        'swap_percent': swap.percent
    }

def get_disk_info():
    partitions = []
    for partition in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            partitions.append({
                'device': partition.device,
                'mountpoint': partition.mountpoint,
                'fstype': partition.fstype,
                'total': usage.total,
                'used': usage.used,
                'free': usage.free,
                'percent': usage.percent
            })
        except:
            continue
    return partitions

def get_network_info():
    net_io = psutil.net_io_counters()
    return {
        'bytes_sent': net_io.bytes_sent,
        'bytes_recv': net_io.bytes_recv,
        'packets_sent': net_io.packets_sent,
        'packets_recv': net_io.packets_recv
    } 