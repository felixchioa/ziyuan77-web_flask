const socket = io();

// 更新在线人数显示
socket.on('update_online_count', (data) => {
    document.getElementById('online-count').textContent = data.count;
});

function updateLocalClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = Math.floor(now.getMilliseconds() / 10).toString().padStart(2, '0');
    
    document.getElementById('local-clock').textContent = 
        `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function updateTime() {
    updateLocalClock();
    requestAnimationFrame(updateTime);
}

requestAnimationFrame(updateTime);