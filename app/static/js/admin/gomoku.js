const socket = io();

// 页面加载时获取初始数据
document.addEventListener('DOMContentLoaded', function() {
    fetchStats();
    fetchRooms();
});

// 获取统计数据
async function fetchStats() {
    try {
        const response = await fetch('/api/admin/gomoku/stats', {
            credentials: 'include'
        });
        const data = await response.json();
        
        document.getElementById('active-rooms').textContent = data.activeRooms;
        document.getElementById('online-players').textContent = data.onlinePlayers;
        document.getElementById('spectators').textContent = data.spectators;
    } catch (error) {
        console.error('获取统计数据失败:', error);
    }
}

// 获取房间列表
async function fetchRooms() {
    try {
        const response = await fetch('/api/admin/gomoku/rooms', {
            credentials: 'include'
        });
        const rooms = await response.json();
        displayRooms(rooms);
    } catch (error) {
        console.error('获取房间列表失败:', error);
    }
}

// 显示房间列表
function displayRooms(rooms) {
    const roomsList = document.getElementById('rooms-list');
    roomsList.innerHTML = '';
    
    rooms.forEach(room => {
        const roomElement = document.createElement('div');
        roomElement.className = 'room-item';
        roomElement.innerHTML = `
            <div class="room-id">${room.id}</div>
            <div class="room-info">
                <div>黑方: ${room.player1 || '等待中'}</div>
                <div>白方: ${room.player2 || '等待中'}</div>
                <div>观战: ${room.spectators.length}</div>
            </div>
            <div class="room-status">${getStatusText(room.status)}</div>
            <div class="room-actions">
                <button onclick="spectateRoom('${room.id}')">观战</button>
                <button onclick="deleteRoom('${room.id}')" class="delete-btn">删除</button>
            </div>
        `;
        roomsList.appendChild(roomElement);
    });
}

// 获取房间状态文本
function getStatusText(status) {
    switch(status) {
        case 'waiting': return '等待中';
        case 'active': return '进行中';
        case 'finished': return '已结束';
        default: return '未知';
    }
}

// 观战房间
function spectateRoom(roomId) {
    window.open(`/gomoku?room=${roomId}&spectate=true`, '_blank');
}

// 删除房间
async function deleteRoom(roomId) {
    if (!confirm('确定要删除该房间吗？')) return;
    
    try {
        const response = await fetch(`/api/admin/gomoku/rooms/${roomId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            fetchRooms();
            fetchStats();
        } else {
            alert('删除房间失败');
        }
    } catch (error) {
        console.error('删除房间失败:', error);
    }
}

// 清理非活跃房间
document.getElementById('clear-inactive-btn').addEventListener('click', async () => {
    if (!confirm('确定要清理所有非活跃房间吗？')) return;
    
    try {
        const response = await fetch('/api/admin/gomoku/rooms/clear-inactive', {
            method: 'POST'
        });
        
        if (response.ok) {
            fetchRooms();
            fetchStats();
            alert('清理完成');
        } else {
            alert('清理失败');
        }
    } catch (error) {
        console.error('清理房间失败:', error);
    }
});

// 刷新按钮
document.getElementById('refresh-btn').addEventListener('click', () => {
    fetchStats();
    fetchRooms();
});

// 房间搜索
document.getElementById('room-search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rooms = document.querySelectorAll('.room-item');
    
    rooms.forEach(room => {
        const roomId = room.querySelector('.room-id').textContent.toLowerCase();
        room.style.display = roomId.includes(searchTerm) ? '' : 'none';
    });
});

// 房间状态筛选
document.getElementById('room-status').addEventListener('change', (e) => {
    const status = e.target.value;
    const rooms = document.querySelectorAll('.room-item');
    
    rooms.forEach(room => {
        const roomStatus = room.querySelector('.room-status').textContent;
        if (status === 'all' || roomStatus === getStatusText(status)) {
            room.style.display = '';
        } else {
            room.style.display = 'none';
        }
    });
});

// 实时更新
socket.on('admin_stats_update', (data) => {
    document.getElementById('active-rooms').textContent = data.activeRooms;
    document.getElementById('online-players').textContent = data.onlinePlayers;
    document.getElementById('spectators').textContent = data.spectators;
});

socket.on('admin_room_update', () => {
    fetchRooms();
}); 