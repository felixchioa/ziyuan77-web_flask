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

    // 检查测试限制
    checkTestLimit();

    // 检查登录状态
    checkLoginStatus();
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
    if (!target || !ports) {
        addLog('错误', '请输入目标地址和端口');
        return;
    }

    // 计算将要测试的端口数量
    let portCount = 0;
    ports.split(',').forEach(p => {
        if (p.includes('-')) {
            const [start, end] = p.split('-').map(Number);
            portCount += end - start + 1;
        } else {
            portCount += 1;
        }
    });

    // 计算需要的测试次数
    const requiredTests = Math.ceil(portCount / 10);
    
    // 显示确认对话框
    if (!confirm(`将测试 ${portCount} 个端口，需要消耗 ${requiredTests} 次测试机会，是否继续？`)) {
        return;
    }

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
            
            // 直接使用返回的限制信息更新UI
            if (data.limit_info) {
                document.getElementById('remaining-tests').textContent = data.limit_info.remaining;
                document.getElementById('reset-time').textContent = 
                    new Date(data.limit_info.reset_time).toLocaleTimeString();
                
                // 如果剩余次数为0，禁用测试按钮
                if (data.limit_info.remaining <= 0) {
                    disableTestButtons();
                }
            }
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
    const target = document.getElementById('target-input').value.trim();
    if (!target) {
        addLog('错误', '请输入目标地址');
        return;
    }

    // 显示消耗提示
    if (!confirm('带宽测试将消耗5次测试机会，是否继续？')) {
        return;
    }

    logResult('开始带宽测试...', 'info');
    
    try {
        const response = await fetch(`/api/bandwidth?target=${target}`);
        const data = await response.json();
        
        if (data.success) {
            // 处理测试结果
            data.data.forEach(result => {
                logResult(`带宽: ${result.speed.toFixed(2)} Mbps`, 'success');
            });
            
            // 更新限制信息
            updateLimitInfo(data.limit_info);
        } else {
            logResult(`带宽测试失败: ${data.error}`, 'error');
        }
    } catch (error) {
        logResult(`带宽测试失败: ${error.message}`, 'error');
    }
}

// 添加更新限制信息的通用函数
function updateLimitInfo(limitInfo) {
    const remainingElement = document.getElementById('remaining-tests');
    const resetTimeElement = document.getElementById('reset-time');
    
    if (limitInfo.is_admin) {
        remainingElement.innerHTML = '∞';
        remainingElement.classList.add('infinite');
        resetTimeElement.parentElement.style.display = 'none';
    } else {
        remainingElement.textContent = limitInfo.remaining;
        remainingElement.classList.remove('infinite');
        resetTimeElement.textContent = new Date(limitInfo.reset_time).toLocaleTimeString();
        resetTimeElement.parentElement.style.display = 'block';
    }
    
    // 根据剩余次数启用/禁用按钮
    if (limitInfo.remaining <= 0 && !limitInfo.is_admin) {
        disableTestButtons();
    }
}

// 在每个测试函数开始时添加成本提示
function getFeatureCost(feature) {
    const costs = {
        'ping': 1,
        'tcping': 1,
        'dns': 1,
        'reverse_dns': 1,
        'website': 2,
        'bandwidth': 5,
        'latency': 3,
        'packet_loss': 3,
        'jitter': 3
    };
    return costs[feature] || 1;
}

// 添加成本确认函数
function confirmCost(feature, cost) {
    return confirm(`${feature}测试将消耗${cost}次测试机会，是否继续？`);
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

// 添加网络测试数据分析函数
function analyzeNetworkData() {
    const analysisResults = document.getElementById('analysis-results');
    
    // 延迟分析
    const latencyAnalysis = analyzeLatency(latencyData);
    
    // 丢包分析
    const lossAnalysis = analyzePacketLoss(lossData);
    
    // 带宽分析
    const bandwidthAnalysis = analyzeBandwidth(bandwidthData);
    
    // 显示分析结果
    analysisResults.innerHTML = `
        <div class="analysis-section">
            <h4>延迟分析</h4>
            <div class="analysis-grid">
                <div class="analysis-item">
                    <span class="label">最小延迟:</span>
                    <span class="value ${getLatencyClass(latencyAnalysis.min)}">${latencyAnalysis.min.toFixed(2)} ms</span>
                </div>
                <div class="analysis-item">
                    <span class="label">最大延迟:</span>
                    <span class="value ${getLatencyClass(latencyAnalysis.max)}">${latencyAnalysis.max.toFixed(2)} ms</span>
                </div>
                <div class="analysis-item">
                    <span class="label">平均延迟:</span>
                    <span class="value ${getLatencyClass(latencyAnalysis.avg)}">${latencyAnalysis.avg.toFixed(2)} ms</span>
                </div>
                <div class="analysis-item">
                    <span class="label">延迟抖动:</span>
                    <span class="value ${getJitterClass(latencyAnalysis.jitter)}">${latencyAnalysis.jitter.toFixed(2)} ms</span>
                </div>
                <div class="analysis-item">
                    <span class="label">标准差:</span>
                    <span class="value">${latencyAnalysis.stdDev.toFixed(2)} ms</span>
                </div>
                <div class="analysis-item">
                    <span class="label">稳定性评级:</span>
                    <span class="value ${getStabilityClass(latencyAnalysis.stability)}">${latencyAnalysis.stability}</span>
                </div>
            </div>
            <div class="analysis-distribution">
                <h5>延迟分布</h5>
                <div class="distribution-bars">
                    ${generateDistributionBars(latencyAnalysis.distribution)}
                </div>
            </div>
        </div>

        <div class="analysis-section">
            <h4>丢包分析</h4>
            <div class="analysis-grid">
                <div class="analysis-item">
                    <span class="label">平均丢包率:</span>
                    <span class="value ${getLossClass(lossAnalysis.avgLoss)}">${lossAnalysis.avgLoss.toFixed(2)}%</span>
                </div>
                <div class="analysis-item">
                    <span class="label">最大丢包率:</span>
                    <span class="value ${getLossClass(lossAnalysis.maxLoss)}">${lossAnalysis.maxLoss.toFixed(2)}%</span>
                </div>
                <div class="analysis-item">
                    <span class="label">连续丢包:</span>
                    <span class="value ${getConsecutiveLossClass(lossAnalysis.maxConsecutive)}">${lossAnalysis.maxConsecutive}</span>
                </div>
                <div class="analysis-item">
                    <span class="label">网络质量:</span>
                    <span class="value ${getQualityClass(lossAnalysis.quality)}">${lossAnalysis.quality}</span>
                </div>
            </div>
        </div>

        <div class="analysis-section">
            <h4>带宽分析</h4>
            <div class="analysis-grid">
                <div class="analysis-item">
                    <span class="label">平均下载速度:</span>
                    <span class="value">${bandwidthAnalysis.avgDownload.toFixed(2)} Mbps</span>
                </div>
                <div class="analysis-item">
                    <span class="label">峰值下载速度:</span>
                    <span class="value">${bandwidthAnalysis.maxDownload.toFixed(2)} Mbps</span>
                </div>
                <div class="analysis-item">
                    <span class="label">带宽稳定性:</span>
                    <span class="value ${getStabilityClass(bandwidthAnalysis.stability)}">${bandwidthAnalysis.stability}</span>
                </div>
                <div class="analysis-item">
                    <span class="label">带宽利用率:</span>
                    <span class="value">${bandwidthAnalysis.utilization.toFixed(2)}%</span>
                </div>
            </div>
        </div>

        <div class="analysis-section">
            <h4>综合评估</h4>
            <div class="overall-analysis">
                <div class="score-card ${getOverallClass(latencyAnalysis.score)}">
                    <div class="score-label">延迟评分</div>
                    <div class="score-value">${latencyAnalysis.score}/100</div>
                </div>
                <div class="score-card ${getOverallClass(lossAnalysis.score)}">
                    <div class="score-label">丢包评分</div>
                    <div class="score-value">${lossAnalysis.score}/100</div>
                </div>
                <div class="score-card ${getOverallClass(bandwidthAnalysis.score)}">
                    <div class="score-label">带宽评分</div>
                    <div class="score-value">${bandwidthAnalysis.score}/100</div>
                </div>
            </div>
            <div class="recommendations">
                <h5>优化建议</h5>
                <ul>
                    ${generateRecommendations(latencyAnalysis, lossAnalysis, bandwidthAnalysis)}
                </ul>
            </div>
        </div>
    `;
}

// 延迟数据分析
function analyzeLatency(data) {
    if (!data.length) return null;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const avg = data.reduce((a, b) => a + b) / data.length;
    const jitter = calculateJitter(data);
    const stdDev = calculateStandardDeviation(data);
    const stability = getLatencyStability(stdDev, avg);
    const distribution = calculateDistribution(data);
    const score = calculateLatencyScore(avg, jitter, stdDev);
    
    return {
        min,
        max,
        avg,
        jitter,
        stdDev,
        stability,
        distribution,
        score
    };
}

// 丢包数据分析
function analyzePacketLoss(data) {
    if (!data.length) return null;
    
    const avgLoss = data.reduce((a, b) => a + b) / data.length;
    const maxLoss = Math.max(...data);
    const maxConsecutive = calculateMaxConsecutiveLoss(data);
    const quality = getNetworkQuality(avgLoss, maxConsecutive);
    const score = calculateLossScore(avgLoss, maxConsecutive);
    
    return {
        avgLoss,
        maxLoss,
        maxConsecutive,
        quality,
        score
    };
}

// 带宽数据分析
function analyzeBandwidth(data) {
    if (!data.length) return null;
    
    const avgDownload = data.reduce((a, b) => a + b) / data.length;
    const maxDownload = Math.max(...data);
    const stability = getBandwidthStability(data);
    const utilization = calculateBandwidthUtilization(avgDownload, maxDownload);
    const score = calculateBandwidthScore(avgDownload, stability, utilization);
    
    return {
        avgDownload,
        maxDownload,
        stability,
        utilization,
        score
    };
}

// 辅助函数
function calculateJitter(data) {
    let jitterSum = 0;
    for (let i = 1; i < data.length; i++) {
        jitterSum += Math.abs(data[i] - data[i-1]);
    }
    return jitterSum / (data.length - 1);
}

function calculateStandardDeviation(data) {
    const avg = data.reduce((a, b) => a + b) / data.length;
    const squareDiffs = data.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b) / data.length);
}

function calculateDistribution(data) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const buckets = 10;
    const bucketSize = range / buckets;
    
    const distribution = new Array(buckets).fill(0);
    data.forEach(value => {
        const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), buckets - 1);
        distribution[bucketIndex]++;
    });
    
    return distribution.map(count => count / data.length * 100);
}

function generateDistributionBars(distribution) {
    return distribution.map((value, index) => `
        <div class="distribution-bar" style="height: ${value}%;" title="${value.toFixed(1)}%"></div>
    `).join('');
}

function generateRecommendations(latencyAnalysis, lossAnalysis, bandwidthAnalysis) {
    const recommendations = [];
    
    if (latencyAnalysis.avg > 100) {
        recommendations.push('考虑使用更近的服务器或CDN来减少网络延迟');
    }
    if (latencyAnalysis.jitter > 50) {
        recommendations.push('网络抖动较大，建议检查网络设备和线路质量');
    }
    if (lossAnalysis.avgLoss > 1) {
        recommendations.push('丢包率较高，建议排查网络拥塞或硬件问题');
    }
    if (bandwidthAnalysis.utilization < 50) {
        recommendations.push('带宽利用率较低，可能存在网络配置优化空间');
    }
    
    return recommendations.map(rec => `<li>${rec}</li>`).join('');
}

// 添加反向DNS测试函数
async function testReverseDNS() {
    const target = document.getElementById('target-input').value.trim();
    if (!target) {
        addLog('错误', '请输入目标IP地址');
        return;
    }

    // 验证输入是否为有效的IP地址
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(target)) {
        addLog('错误', '请输入有效的IP地址');
        return;
    }

    try {
        addLog('信息', `正在对 ${target} 进行反向DNS查询...`);
        
        const response = await fetch(`/api/reverse_dns?target=${target}`);
        const data = await response.json();
        
        if (data.success) {
            addLog('成功', `IP: ${data.ip} -> 主机名: ${data.hostname}`);
            updateStatusPanel({
                status: '成功',
                type: 'reverse_dns',
                result: data
            });
        } else {
            addLog('错误', data.error);
            updateStatusPanel({
                status: '失败',
                type: 'reverse_dns',
                error: data.error
            });
        }
    } catch (error) {
        addLog('错误', `反向DNS查询失败: ${error.message}`);
        updateStatusPanel({
            status: '失败',
            type: 'reverse_dns',
            error: error.message
        });
    }
}

// 更新状态面板函数（如果还没有的话）
function updateStatusPanel(result) {
    const statusElement = document.getElementById('connection-status');
    statusElement.textContent = result.status;
    statusElement.className = `value ${result.status === '成功' ? 'success' : 'error'}`;
    
    // 更新其他统计信息...
}

// 添加日志函数（如果还没有的话）
function addLog(type, message) {
    const logPanel = document.getElementById('test-log');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type.toLowerCase()}`;
    logEntry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="type">[${type}]</span>
        <span class="message">${message}</span>
    `;
    logPanel.insertBefore(logEntry, logPanel.firstChild);
}

// 检查测试限制
async function checkTestLimit() {
    try {
        const response = await fetch('/api/test_limit');
        const data = await response.json();
        
        // 更新剩余次数显示
        const remainingElement = document.getElementById('remaining-tests');
        if (data.is_admin) {
            remainingElement.innerHTML = '∞'; // 显示无限符号
            remainingElement.classList.add('infinite');
            enableTestButtons();
        } else {
            remainingElement.textContent = data.remaining;
            remainingElement.classList.remove('infinite');
            if (data.remaining <= 0) {
                disableTestButtons();
            } else {
                enableTestButtons();
            }
        }
        
        // 更新重置时间显示
        const resetTimeElement = document.getElementById('reset-time');
        if (data.reset_time) {
            resetTimeElement.textContent = new Date(data.reset_time).toLocaleTimeString();
            resetTimeElement.parentElement.style.display = 'block';
        } else {
            resetTimeElement.parentElement.style.display = 'none';
        }
        
        return data.remaining;
    } catch (error) {
        console.error('Error checking test limit:', error);
        return 0;
    }
}

// 禁用测试按钮
function disableTestButtons() {
    document.querySelectorAll('.tool-group button').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

// 启用测试按钮
function enableTestButtons() {
    document.querySelectorAll('.tool-group button').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
    });
}

// 显示管理员对话框
function showAdminDialog() {
    document.getElementById('admin-dialog').style.display = 'block';
}

// 隐藏管理员对话框
function hideAdminDialog() {
    document.getElementById('admin-dialog').style.display = 'none';
    document.getElementById('admin-password').value = '';
}

// 验证管理员密码
async function verifyAdmin() {
    const password = document.getElementById('admin-password').value;
    
    try {
        const response = await fetch('/api/admin_override', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            enableTestButtons();
            hideAdminDialog();
            addLog('成功', '管理员权限已启用');
            // 更新登录状态
            checkLoginStatus();
        } else {
            addLog('错误', '管理员密码错误');
        }
    } catch (error) {
        addLog('错误', '验证失败: ' + error.message);
    }
}

// 定期检查测试限制
setInterval(checkTestLimit, 30000); // 每30秒检查一次
document.addEventListener('DOMContentLoaded', checkTestLimit);

// 添加检查登录状态的函数
async function checkLoginStatus() {
    try {
        const response = await fetch('/api/test_limit');
        const data = await response.json();
        
        // 更新IP显示
        const userIp = data.ip || '-';
        let ipDisplay = userIp;
        
        // 如果是代理用户，显示特殊标记
        if (data.proxy) {
            ipDisplay = userIp === 'proxy-user' ? '代理用户' : `${userIp} (代理)`;
        } else if (userIp === 'unknown') {
            ipDisplay = '未知';
        }
        
        document.getElementById('user-ip').textContent = ipDisplay;
        
        // 如果是管理员，显示退出按钮
        if (data.is_admin) {
            document.getElementById('logout-btn').style.display = 'inline-block';
            document.getElementById('admin-override-btn').style.display = 'none';
        } else {
            document.getElementById('logout-btn').style.display = 'none';
            document.getElementById('admin-override-btn').style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        document.getElementById('user-ip').textContent = '获取失败';
    }
}

// 添加登出函数
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        if (data.success) {
            // 重置界面状态
            document.getElementById('logout-btn').style.display = 'none';
            document.getElementById('admin-override-btn').style.display = 'inline-block';
            document.getElementById('remaining-tests').textContent = '100';
            document.getElementById('reset-time').parentElement.style.display = 'block';
            
            // 移除无限符号样式
            document.getElementById('remaining-tests').classList.remove('infinite');
            
            // 刷新测试限制
            checkTestLimit();
            
            addLog('成功', '已退出登录');
        }
    } catch (error) {
        addLog('错误', '退出失败: ' + error.message);
    }
} 