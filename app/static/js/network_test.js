let testInterval;
let testCount = 0;
let successCount = 0;
let latencyData = [];
let lossData = [];
let bandwidthData = [];
let charts = {};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 标签切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-data`).classList.add('active');
        });
    });

    // 初始化图表
    initCharts();
    
    // 加载历史记录
    loadHistory();
});

// 初始化图表
function initCharts() {
    const ctx1 = document.getElementById('latency-chart').getContext('2d');
    charts.latency = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '延迟 (ms)',
                data: [],
                borderColor: '#007bff',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const ctx2 = document.getElementById('packet-loss-chart').getContext('2d');
    charts.packetLoss = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '丢包率 (%)',
                data: [],
                backgroundColor: '#dc3545'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    const ctx3 = document.getElementById('bandwidth-chart').getContext('2d');
    charts.bandwidth = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '带宽 (Mbps)',
                data: [],
                borderColor: '#28a745',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Ping测试
async function startPing() {
    const target = document.getElementById('target-input').value.trim();
    if (!target) return;

    const continuous = document.getElementById('continuous-test').checked;
    const interval = document.getElementById('interval').value * 1000;

    if (testInterval) {
        clearInterval(testInterval);
        testInterval = null;
        document.getElementById('ping-btn').textContent = 'Ping测试';
        return;
    }

    document.getElementById('ping-btn').textContent = '停止测试';
    document.getElementById('connection-status').textContent = '测试中';

    const pingTest = async () => {
        try {
            const startTime = performance.now();
            const response = await fetch(`/api/ping?target=${target}`);
            const data = await response.json();
            const endTime = performance.now();
            const latency = data.latency;

            testCount++;
            if (data.success) {
                successCount++;
                logResult(`Ping ${target}: ${latency.toFixed(2)}ms`, 'success');
            } else {
                logResult(`Ping ${target}: 超时`, 'error');
            }

            latencyData.push(latency);
            updateStats();
            updateCharts();
        } catch (error) {
            logResult(`Ping失败: ${error.message}`, 'error');
        }
    };

    await pingTest();
    if (continuous) {
        testInterval = setInterval(pingTest, interval);
    }
}

// 模拟Ping
function mockPing(target) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) {
                resolve();
            } else {
                reject(new Error('超时'));
            }
        }, Math.random() * 100);
    });
}

// 路由追踪
async function startTraceroute() {
    const target = document.getElementById('target-input').value.trim();
    if (!target) return;

    logResult('开始路由追踪...', 'info');
    
    // 模拟路由追踪结果
    for (let i = 1; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const hop = {
            ttl: i,
            ip: `192.168.${i}.1`,
            latency: Math.round(Math.random() * 100),
            hostname: `router-${i}.example.com`
        };
        logResult(`${hop.ttl}  ${hop.ip} (${hop.hostname})  ${hop.latency}ms`, 'success');
    }
}

// DNS测试
async function testDNS() {
    const target = document.getElementById('target-input').value.trim();
    if (!target) return;

    logResult(`开始DNS解析 ${target}...`, 'info');

    try {
        const response = await fetch(`/api/dns?target=${target}`);
        const data = await response.json();

        if (data.success) {
            logResult(`DNS解析时间: ${data.resolveTime.toFixed(2)}ms`, 'info');
            data.records.forEach(record => {
                logResult(`${record.type} 记录: ${record.value}`, 'success');
            });
        } else {
            logResult(`DNS解析失败: ${data.error}`, 'error');
        }
    } catch (error) {
        logResult(`DNS解析失败: ${error.message}`, 'error');
    }
}

// MTU测试
async function testMTU() {
    const target = document.getElementById('target-input').value.trim();
    if (!target) return;

    logResult('开始MTU测试...', 'info');
    
    // 模拟MTU测试结果
    const sizes = [1500, 1492, 1472, 1452, 1400];
    for (const size of sizes) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const success = Math.random() > 0.3;
        logResult(`测试数据包大小 ${size} bytes: ${success ? '成功' : '失败'}`, 
            success ? 'success' : 'error');
    }

    logResult('建议MTU值: 1472 bytes', 'success');
}

// 端口测试
async function testPorts() {
    const target = document.getElementById('target-input').value.trim();
    const ports = document.getElementById('port-input').value.trim();
    if (!target || !ports) return;

    logResult(`开始端口扫描: ${target}`, 'info');
    
    try {
        const response = await fetch(`/api/ports?target=${target}&ports=${ports}`);
        const data = await response.json();
        
        if (data.success) {
            data.results.forEach(result => {
                const service = getServiceName(result.port);
                const status = result.status ? '开放' : '关闭';
                logResult(`端口 ${result.port} (${service}): ${status}`,
                    result.status ? 'success' : 'warning');
            });
        } else {
            logResult(`端口扫描失败: ${data.error}`, 'error');
        }
    } catch (error) {
        logResult(`端口扫描失败: ${error.message}`, 'error');
    }
}

// 获取常见端口服务名称
function getServiceName(port) {
    const services = {
        21: 'FTP',
        22: 'SSH',
        23: 'Telnet',
        25: 'SMTP',
        53: 'DNS',
        80: 'HTTP',
        110: 'POP3',
        143: 'IMAP',
        443: 'HTTPS',
        3306: 'MySQL',
        3389: 'RDP'
    };
    return services[port] || 'Unknown';
}

// 带宽测试
async function testBandwidth() {
    logResult('开始带宽测试...', 'info');
    
    // 模拟下载测试
    logResult('测试下载速度...', 'info');
    for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const speed = Math.random() * 100 + 50;
        logResult(`下载速度: ${speed.toFixed(2)} Mbps`, 'success');
        bandwidthData.push(speed);
    }

    // 模拟上传测试
    logResult('测试上传速度...', 'info');
    for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const speed = Math.random() * 50 + 20;
        logResult(`上传速度: ${speed.toFixed(2)} Mbps`, 'success');
    }

    updateCharts();
}

// 延迟测试
async function testLatency() {
    const target = document.getElementById('target-input').value.trim();
    if (!target) return;

    logResult('开始延迟测试...', 'info');
    
    for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const latency = Math.random() * 100 + 20;
        logResult(`延迟: ${latency.toFixed(2)}ms`, 'success');
        latencyData.push(latency);
    }

    updateStats();
    updateCharts();
}

// 丢包测试
async function testPacketLoss() {
    const target = document.getElementById('target-input').value.trim();
    if (!target) return;

    logResult('开始丢包测试...', 'info');
    
    let lost = 0;
    const total = 100;
    
    for (let i = 0; i < total; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        if (Math.random() > 0.9) {
            lost++;
            logResult(`数据包 ${i + 1}: 丢失`, 'error');
        }
    }

    const lossRate = (lost / total * 100).toFixed(2);
    lossData.push(Number(lossRate));
    logResult(`丢包率: ${lossRate}%`, lossRate > 5 ? 'error' : 'success');
    
    updateCharts();
}

// 抖动测试
async function testJitter() {
    const target = document.getElementById('target-input').value.trim();
    if (!target) return;

    logResult('开始抖动测试...', 'info');
    
    let prevLatency = null;
    let jitters = [];
    
    for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const latency = Math.random() * 100 + 20;
        
        if (prevLatency !== null) {
            const jitter = Math.abs(latency - prevLatency);
            jitters.push(jitter);
            logResult(`抖动: ${jitter.toFixed(2)}ms`, jitter > 30 ? 'warning' : 'success');
        }
        
        prevLatency = latency;
    }

    const avgJitter = jitters.reduce((a, b) => a + b, 0) / jitters.length;
    logResult(`平均抖动: ${avgJitter.toFixed(2)}ms`, avgJitter > 30 ? 'warning' : 'success');
}

// 更新统计信息
function updateStats() {
    document.getElementById('test-count').textContent = testCount;
    document.getElementById('success-rate').textContent = 
        `${((successCount / testCount) * 100).toFixed(2)}%`;
    
    if (latencyData.length > 0) {
        const avgLatency = latencyData.reduce((a, b) => a + b, 0) / latencyData.length;
        document.getElementById('avg-latency').textContent = `${avgLatency.toFixed(2)}ms`;
    }
}

// 更新图表
function updateCharts() {
    // 更新延迟图表
    if (latencyData.length > 0) {
        charts.latency.data.labels = Array.from({length: latencyData.length}, (_, i) => i + 1);
        charts.latency.data.datasets[0].data = latencyData;
        charts.latency.update();
    }

    // 更新丢包图表
    if (lossData.length > 0) {
        charts.packetLoss.data.labels = Array.from({length: lossData.length}, (_, i) => i + 1);
        charts.packetLoss.data.datasets[0].data = lossData;
        charts.packetLoss.update();
    }

    // 更新带宽图表
    if (bandwidthData.length > 0) {
        charts.bandwidth.data.labels = Array.from({length: bandwidthData.length}, (_, i) => i + 1);
        charts.bandwidth.data.datasets[0].data = bandwidthData;
        charts.bandwidth.update();
    }
}

// 记录结果
function logResult(message, type = 'info') {
    const log = document.getElementById('test-log');
    const entry = document.createElement('div');
    entry.className = type;
    
    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;
    
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// 清空结果
function clearResults() {
    document.getElementById('test-log').innerHTML = '';
    testCount = 0;
    successCount = 0;
    latencyData = [];
    lossData = [];
    bandwidthData = [];
    updateStats();
    updateCharts();
}

// 导出结果
function exportResults() {
    const log = document.getElementById('test-log').innerText;
    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network_test_${new Date().toISOString()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
}

// 历史记录
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('networkTestHistory') || '[]');
    const historyList = document.getElementById('test-history');
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div>${item.target}</div>
            <div>平均延迟: ${item.avgLatency}ms</div>
            <div>丢包率: ${item.lossRate}%</div>
            <small>${new Date(item.timestamp).toLocaleString()}</small>
        `;
        historyList.appendChild(historyItem);
    });
}

// TCPing测试
async function startTCPing() {
    const target = document.getElementById('target-input').value.trim();
    const port = document.getElementById('port-input').value.trim() || '80';
    if (!target) return;

    logResult(`开始TCPing测试 ${target}:${port}...`, 'info');

    try {
        const response = await fetch(`/api/tcping?target=${target}&port=${port}`);
        const data = await response.json();

        if (data.success) {
            logResult(`TCPing ${target}:${port}: ${data.latency}ms`, 'success');
        } else {
            logResult(`TCPing ${target}:${port}: 连接失败`, 'error');
        }
    } catch (error) {
        logResult(`TCPing失败: ${error.message}`, 'error');
    }
}

// 网站可用性测试
async function testWebsite() {
    const target = document.getElementById('target-input').value.trim();
    if (!target) return;

    logResult(`开始网站测试 ${target}...`, 'info');

    try {
        const response = await fetch(`/api/website?target=${target}`);
        const data = await response.json();

        if (data.success) {
            logResult(`网站状态: ${data.status}`, 'success');
            logResult(`响应时间: ${data.responseTime}ms`, 'info');
            logResult(`SSL证书: ${data.ssl ? '有效' : '无效或不存在'}`, data.ssl ? 'success' : 'warning');
            if (data.redirects && data.redirects.length > 0) {
                logResult('重定向链:', 'info');
                data.redirects.forEach(redirect => {
                    logResult(`→ ${redirect}`, 'info');
                });
            }
        } else {
            logResult(`网站测试失败: ${data.error}`, 'error');
        }
    } catch (error) {
        logResult(`网站测试失败: ${error.message}`, 'error');
    }
}

// 端口扫描功能
document.getElementById('scan-btn').addEventListener('click', async () => {
    const target = document.getElementById('target-input').value.trim();
    if (!target) {
        alert('请输入目标主机');
        return;
    }

    const scanSection = document.getElementById('port-scan-section');
    const scanStatus = document.getElementById('scan-status');
    const progressBar = document.getElementById('progress-inner');
    const portResults = document.getElementById('port-results');

    scanSection.style.display = 'block';
    scanStatus.textContent = '正在扫描端口...';
    progressBar.style.width = '0%';
    portResults.innerHTML = '';

    // 监听扫描进度
    socket.on('scan_progress', (data) => {
        progressBar.style.width = `${data.percentage}%`;
        scanStatus.textContent = `正在扫描端口 ${data.current_port}... ${data.current}/${data.total} (${data.percentage}%)`;
        
        // 如果发现开放端口，立即添加到结果表格
        if (data.open_port) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.open_port.port}</td>
                <td>${data.open_port.state}</td>
                <td>${data.open_port.service}</td>
            `;
            portResults.appendChild(row);
        }
    });

    try {
        const response = await fetch('/scan_ports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ host: target })
        });

        const data = await response.json();
        
        if (data.success) {
            scanStatus.textContent = `扫描完成，发现 ${data.total_open} 个开放端口`;
            progressBar.style.width = '100%';

            // 显示最终结果
            portResults.innerHTML = ''; // 清空之前的实时结果
            data.open_ports.forEach(port => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${port.port}</td>
                    <td>${port.state}</td>
                    <td>${port.service}</td>
                `;
                portResults.appendChild(row);
            });
        } else {
            scanStatus.textContent = `扫描失败: ${data.error}`;
        }
    } catch (error) {
        scanStatus.textContent = `扫描出错: ${error.message}`;
    } finally {
        // 移除进度监听器
        socket.off('scan_progress');
    }
});

function updatePortScanResults(data) {
    const portResults = document.getElementById('port-results');
    const openPortsList = document.getElementById('open-ports-list');
    
    // 清空现有结果
    portResults.innerHTML = '';
    openPortsList.innerHTML = '';
    
    // 更新开放端口摘要
    data.open_ports.forEach(port => {
        const portBadge = document.createElement('div');
        portBadge.className = 'port-badge';
        portBadge.innerHTML = `
            <span class="port-number">${port.port}</span>
            <span class="port-service">${port.service}</span>
        `;
        openPortsList.appendChild(portBadge);
    });
    
    // 更新详细端口表格
    data.open_ports.forEach(port => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${port.port}</td>
            <td>${port.state}</td>
            <td>${port.service}</td>
        `;
        portResults.appendChild(row);
    });
} 