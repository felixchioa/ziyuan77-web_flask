import pytz
from datetime import datetime

def get_current_time():
    """获取当前北京时间"""
    tz = pytz.timezone('Asia/Shanghai')
    return datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S') 