const socket = io();
let charts = {
    cpu: null,
    memory: null,
    network: null
};

let updateInterval = 5000;

// 初始化图表
function initCharts() {
    // CPU 图表
    const cpuCtx = document.getElementById('cpu-chart').getContext('2d');
    charts.cpu = new Chart(cpuCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'CPU 使用率',
                data: [],
                borderColor: '#2196f3',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // 内存图表
    const memoryCtx = document.getElementById('memory-chart').getContext('2d');
    charts.memory = new Chart(memoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['已用', '可用'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#f44336', '#4caf50']
            }]
        }
    });

    // 网络图表
    const networkCtx = document.getElementById('network-chart').getContext('2d');
    charts.network = new Chart(networkCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '发送',
                data: [],
                borderColor: '#2196f3'
            }, {
                label: '接收',
                data: [],
                borderColor: '#4caf50'
            }]
        }
    });
}

// 更新系统信息
function updateSystemInfo(data) {
    const systemDetails = document.getElementById('system-details');
    systemDetails.innerHTML = `
        <p>操作系统: ${data.system.system} ${data.system.release}</p>
        <p>架构: ${data.system.machine}</p>
        <p>处理器: ${data.system.processor}</p>
    `;
}

// 更新 CPU 信息
function updateCpuInfo(data) {
    const cpuDetails = document.getElementById('cpu-details');
    cpuDetails.innerHTML = `
        <p>核心数: ${data.cpu.count}</p>
        <p>当前频率: ${Math.round(data.cpu.freq_current)} MHz</p>
    `;
    
    // 更新图表
    const timestamp = new Date().toLocaleTimeString();
    charts.cpu.data.labels.push(timestamp);
    charts.cpu.data.datasets[0].data.push(data.cpu.percent[0]);
    
    if (charts.cpu.data.labels.length > 10) {
        charts.cpu.data.labels.shift();
        charts.cpu.data.datasets[0].data.shift();
    }
    
    charts.cpu.update();
}

// 更新内存信息
function updateMemoryInfo(data) {
    const memoryDetails = document.getElementById('memory-details');
    const totalGB = (data.memory.total / (1024 * 1024 * 1024)).toFixed(2);
    const usedGB = ((data.memory.total - data.memory.available) / (1024 * 1024 * 1024)).toFixed(2);
    
    memoryDetails.innerHTML = `
        <p>总内存: ${totalGB} GB</p>
        <p>已用: ${usedGB} GB (${data.memory.percent}%)</p>
    `;
    
    charts.memory.data.datasets[0].data = [
        data.memory.used,
        data.memory.available
    ];
    charts.memory.update();
}

// 更新磁盘信息
function updateDiskInfo(data) {
    const container = document.getElementById('disk-chart-container');
    container.innerHTML = '';
    
    data.disk.forEach(partition => {
        const totalGB = (partition.total / (1024 * 1024 * 1024)).toFixed(2);
        const usedGB = (partition.used / (1024 * 1024 * 1024)).toFixed(2);
        
        const div = document.createElement('div');
        div.className = 'disk-item';
        div.innerHTML = `
            <h3>${partition.mountpoint}</h3>
            <div class="progress-bar">
                <div class="progress" style="width: ${partition.percent}%"></div>
            </div>
            <p>已用: ${usedGB}GB / ${totalGB}GB (${partition.percent}%)</p>
        `;
        container.appendChild(div);
    });
}

// 更新网络信息
function updateNetworkInfo(data) {
    const networkDetails = document.getElementById('network-details');
    const mbSent = (data.network.bytes_sent / (1024 * 1024)).toFixed(2);
    const mbRecv = (data.network.bytes_recv / (1024 * 1024)).toFixed(2);
    
    networkDetails.innerHTML = `
        <p>发送: ${mbSent} MB</p>
        <p>接收: ${mbRecv} MB</p>
    `;
}

// 获取系统状态
async function fetchSystemStats() {
    try {
        const response = await fetch('/api/admin/system/stats', {
            credentials: 'include'
        });
        const data = await response.json();
        
        updateSystemInfo(data);
        updateCpuInfo(data);
        updateMemoryInfo(data);
        updateDiskInfo(data);
        updateNetworkInfo(data);
    } catch (error) {
        console.error('获取系统状态失败:', error);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    fetchSystemStats();
    
    // 监听实时数据更新
    socket.on('system_stats_update', (data) => {
        console.log("Received system stats:", data);
        updateSystemInfo(data);
        updateCpuInfo(data);
        updateMemoryInfo(data);
        updateDiskInfo(data);
        updateNetworkInfo(data);
    });
    
    // 刷新按钮
    document.getElementById('refresh-btn').addEventListener('click', fetchSystemStats);
    
    // 更新间隔选择
    document.getElementById('update-interval').addEventListener('change', function(e) {
        socket.emit('update_interval', {
            interval: parseInt(e.target.value)
        });
    });
}); 