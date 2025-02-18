let currentPage = 1;
const pageSize = 50;

async function fetchLogs() {
    const level = document.getElementById('log-level').value;
    const search = document.getElementById('search').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    try {
        const response = await fetch('/api/admin/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                level,
                search,
                startDate,
                endDate,
                page: currentPage,
                pageSize
            })
        });
        
        const data = await response.json();
        displayLogs(data.logs);
        updatePagination(data.total);
    } catch (error) {
        console.error('获取日志失败:', error);
    }
}

function displayLogs(logs) {
    const tbody = document.getElementById('log-content');
    tbody.innerHTML = '';
    
    logs.forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(log.timestamp).toLocaleString()}</td>
            <td class="log-level-${log.level.toLowerCase()}">${log.level}</td>
            <td>${log.module}</td>
            <td>${log.message}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updatePagination(total) {
    const totalPages = Math.ceil(total / pageSize);
    document.getElementById('page-info').textContent = `第 ${currentPage} / ${totalPages} 页`;
    
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
}

// 事件监听
document.getElementById('refresh').addEventListener('click', fetchLogs);

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchLogs();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    currentPage++;
    fetchLogs();
});

['log-level', 'start-date', 'end-date'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
        currentPage = 1;
        fetchLogs();
    });
});

document.getElementById('search').addEventListener('input', debounce(() => {
    currentPage = 1;
    fetchLogs();
}, 300));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 初始加载
fetchLogs(); 