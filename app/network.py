import socket
import dns.resolver
import requests
import ssl
from OpenSSL import crypto as OpenSSL_crypto
from urllib.parse import urlparse
import concurrent.futures
import subprocess
import platform
from datetime import datetime

# 常见浏览器UA列表
USER_AGENTS = [
    # Windows Chrome
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    # Windows Firefox
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    # Windows Edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    # Mac Chrome
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    # Mac Safari
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    # iOS Safari
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    # Android Chrome
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
]

# 添加新的常量
MAX_THREADS = 100  # 最大线程数
TIMEOUT = 1  # 端口连接超时时间(秒)
COMMON_PORTS = {  # 常见端口及其服务
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    445: 'SMB',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    6379: 'Redis',
    8080: 'HTTP Proxy'
}

def scan_port(host, port):
    """扫描单个端口"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(TIMEOUT)
        result = sock.connect_ex((host, port))
        sock.close()

        if result == 0:
            service = COMMON_PORTS.get(port, 'Unknown')
            return {
                'port': port,
                'state': 'open',
                'service': service
            }
        return None
    except:
        return None

def ping_host(target):
    """Ping测试"""
    try:
        # Windows系统
        if platform.system().lower() == 'windows':
            output = subprocess.check_output(['ping', '-n', '1', target],
                                          stderr=subprocess.STDOUT,
                                          universal_newlines=True)
        # Linux/Unix系统
        else:
            output = subprocess.check_output(['ping', '-c', '1', target],
                                          stderr=subprocess.STDOUT,
                                          universal_newlines=True)

        # 解析输出获取延迟时间
        if 'time=' in output.lower():
            latency = float(output.lower().split('time=')[1].split('ms')[0])
            return {'success': True, 'latency': latency}
        return {'success': False, 'error': '无法获取延迟时间'}
    except:
        return {'success': False, 'error': '目标不可达'}

def tcp_ping(target, port):
    """TCP端口连接测试"""
    try:
        start_time = datetime.now()
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((target, port))
        end_time = datetime.now()
        sock.close()

        latency = (end_time - start_time).total_seconds() * 1000
        return {
            'success': result == 0,
            'latency': latency if result == 0 else None
        }
    except:
        return {'success': False, 'error': '连接失败'}

def check_dns(target):
    """DNS解析测试"""
    try:
        records = []
        start_time = datetime.now()

        # 查询不同类型的DNS记录
        for record_type in ['A', 'AAAA', 'MX', 'NS', 'TXT']:
            try:
                answers = dns.resolver.resolve(target, record_type)
                for answer in answers:
                    records.append({
                        'type': record_type,
                        'value': str(answer)
                    })
            except:
                continue

        resolve_time = (datetime.now() - start_time).total_seconds() * 1000
        return {
            'success': True,
            'records': records,
            'resolveTime': resolve_time
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def check_website(target):
    """网站可用性测试"""
    if not target.startswith(('http://', 'https://')):
        target = 'https://' + target

    try:
        start_time = datetime.now()
        response = requests.get(target, allow_redirects=True)
        response_time = (datetime.now() - start_time).total_seconds() * 1000

        # 检查SSL证书
        parsed_url = urlparse(target)
        ssl_valid = False
        try:
            cert = ssl.get_server_certificate((parsed_url.netloc, 443))
            x509 = OpenSSL_crypto.load_certificate(OpenSSL_crypto.FILETYPE_PEM, cert)
            ssl_valid = datetime.now() < datetime.strptime(x509.get_notAfter().decode(), '%Y%m%d%H%M%SZ')
        except:
            pass

        return {
            'success': True,
            'status': response.status_code,
            'responseTime': response_time,
            'ssl': ssl_valid,
            'redirects': [str(r.url) for r in response.history]
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def scan_ports(target, ports):
    """端口扫描"""
    try:
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            port_list = []
            for p in ports.split(','):
                if '-' in p:
                    start, end = map(int, p.split('-'))
                    port_list.extend(range(start, end + 1))
                else:
                    port_list.append(int(p))

            futures = [executor.submit(scan_port, target, port) for port in port_list]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        return {'success': True, 'results': [r for r in results if r is not None]}
    except Exception as e:
        return {'success': False, 'error': str(e)} 