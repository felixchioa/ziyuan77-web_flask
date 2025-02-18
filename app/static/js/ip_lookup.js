// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 获取当前IP
    getCurrentIP();
    
    // 标签切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-info`).classList.add('active');
        });
    });
    
    // 加载历史记录
    loadHistory();
});

// 获取当前IP
async function getCurrentIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        document.getElementById('current-ip').textContent = data.ip;
        lookupIP(data.ip);
    } catch (error) {
        console.error('获取IP失败:', error);
    }
}

// IP查询
async function lookupIP(ip = null) {
    const ipAddress = ip || document.getElementById('ip-input').value.trim();
    if (!ipAddress) return;
    
    try {
        // 这里应该调用实际的IP查询API
        const data = await mockIPLookup(ipAddress);
        updateResults(data);
        addToHistory(ipAddress, data);
    } catch (error) {
        console.error('查询失败:', error);
    }
}

// 模拟IP查询API
function mockIPLookup(ip) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                ip: ip,
                version: 'IPv4',
                hostname: `host-${ip.replace(/\./g, '-')}.example.com`,
                type: '动态IP',
                location: {
                    country: '中国',
                    region: '广东省',
                    city: '深圳市',
                    coordinates: {
                        latitude: 22.5431,
                        longitude: 114.0579
                    },
                    timezone: 'Asia/Shanghai'
                },
                network: {
                    isp: '中国电信',
                    organization: 'China Telecom',
                    asn: 'AS4134',
                    network: '1.1.1.0/24'
                },
                security: {
                    proxy: false,
                    vpn: false,
                    tor: false,
                    threatLevel: 'low',
                    report: '未发现安全威胁'
                }
            });
        }, 500);
    });
}

// 更新结果显示
function updateResults(data) {
    // 基本信息
    document.getElementById('ip-address').textContent = data.ip;
    document.getElementById('ip-version').textContent = data.version;
    document.getElementById('hostname').textContent = data.hostname;
    document.getElementById('ip-type').textContent = data.type;
    
    // 地理位置
    document.getElementById('country').textContent = data.location.country;
    document.getElementById('region').textContent = data.location.region;
    document.getElementById('city').textContent = data.location.city;
    document.getElementById('coordinates').textContent = 
        `${data.location.coordinates.latitude}, ${data.location.coordinates.longitude}`;
    document.getElementById('timezone').textContent = data.location.timezone;
    
    // 更新地图
    updateMap(data.location.coordinates);
    
    // 网络信息
    document.getElementById('isp').textContent = data.network.isp;
    document.getElementById('organization').textContent = data.network.organization;
    document.getElementById('asn').textContent = data.network.asn;
    document.getElementById('network').textContent = data.network.network;
    
    // 安全信息
    document.getElementById('proxy').textContent = data.security.proxy ? '是' : '否';
    document.getElementById('vpn').textContent = data.security.vpn ? '是' : '否';
    document.getElementById('tor').textContent = data.security.tor ? '是' : '否';
    document.getElementById('threat-level').textContent = data.security.threatLevel;
    document.getElementById('security-report').textContent = data.security.report;
}

// 更新地图
function updateMap(coordinates) {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: coordinates,
        zoom: 10
    });
    
    new google.maps.Marker({
        position: coordinates,
        map: map
    });
}

// 历史记录
function addToHistory(ip, data) {
    const history = JSON.parse(localStorage.getItem('ipLookupHistory') || '[]');
    history.unshift({
        ip,
        data,
        timestamp: new Date().toISOString()
    });
    
    if (history.length > 50) history.pop();
    localStorage.setItem('ipLookupHistory', JSON.stringify(history));
    updateHistoryDisplay();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('ipLookupHistory') || '[]');
    updateHistoryDisplay(history);
}

function updateHistoryDisplay() {
    const history = JSON.parse(localStorage.getItem('ipLookupHistory') || '[]');
    const historyList = document.getElementById('lookup-history');
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div>${item.ip}</div>
            <div>${item.data.location.country} - ${item.data.location.city}</div>
            <small>${new Date(item.timestamp).toLocaleString()}</small>
        `;
        
        historyItem.addEventListener('click', () => {
            document.getElementById('ip-input').value = item.ip;
            lookupIP(item.ip);
        });
        
        historyList.appendChild(historyItem);
    });
}

// 工具函数
async function pingIP() {
    const ip = document.getElementById('ip-input').value.trim();
    if (!ip) return;
    
    // 这里应该调用实际的Ping API
    alert(`正在对 ${ip} 进行Ping测试...`);
}

async function tracerouteIP() {
    const ip = document.getElementById('ip-input').value.trim();
    if (!ip) return;
    
    // 这里应该调用实际的Traceroute API
    alert(`正在对 ${ip} 进行路由追踪...`);
}

async function whoisLookup() {
    const ip = document.getElementById('ip-input').value.trim();
    if (!ip) return;
    
    // 这里应该调用实际的Whois API
    alert(`正在查询 ${ip} 的Whois信息...`);
}

async function reverseDNS() {
    const ip = document.getElementById('ip-input').value.trim();
    if (!ip) return;
    
    // 这里应该调用实际的反向DNS API
    alert(`正在查询 ${ip} 的反向DNS记录...`);
}

async function scanPorts() {
    const ip = document.getElementById('ip-input').value.trim();
    const portRange = document.getElementById('port-range').value.trim();
    if (!ip || !portRange) return;
    
    // 这里应该调用实际的端口扫描API
    alert(`正在扫描 ${ip} 的端口 ${portRange}...`);
} 