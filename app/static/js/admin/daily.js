// 获取日志列表
async function fetchEntries() {
    try {
        const response = await fetch('/api/admin/daily/entries');
        const entries = await response.json();
        displayEntries(entries);
    } catch (error) {
        console.error('获取日志失败:', error);
    }
}

// 显示日志列表
function displayEntries(entries) {
    const container = document.getElementById('entries');
    container.innerHTML = '';
    
    entries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'entry-item';
        div.innerHTML = `
            <div class="entry-content">
                <div class="entry-date">${entry.date}</div>
                <div>${entry.content}</div>
            </div>
            <div class="entry-actions">
                <button class="edit-btn" onclick="editEntry('${entry._id}')">编辑</button>
                <button class="delete-btn" onclick="deleteEntry('${entry._id}')">删除</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// 添加新日志
async function addEntry() {
    const date = document.getElementById('entry-date').value;
    const content = document.getElementById('entry-content').value;
    
    if (!date || !content) {
        alert('请填写日期和内容');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/daily/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, content })
        });
        
        if (response.ok) {
            document.getElementById('entry-date').value = '';
            document.getElementById('entry-content').value = '';
            fetchEntries();
        }
    } catch (error) {
        console.error('添加日志失败:', error);
    }
}

// 编辑日志
async function editEntry(id) {
    const newContent = prompt('请输入新的内容:');
    if (!newContent) return;
    
    try {
        const response = await fetch(`/api/admin/daily/entries/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: newContent })
        });
        
        if (response.ok) {
            fetchEntries();
        }
    } catch (error) {
        console.error('编辑日志失败:', error);
    }
}

// 删除日志
async function deleteEntry(id) {
    if (!confirm('确定要删除这条日志吗?')) return;
    
    try {
        const response = await fetch(`/api/admin/daily/entries/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            fetchEntries();
        }
    } catch (error) {
        console.error('删除日志失败:', error);
    }
}

// 搜索过滤
function filterEntries() {
    const search = document.getElementById('search').value.toLowerCase();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    document.querySelectorAll('.entry-item').forEach(item => {
        const content = item.querySelector('.entry-content').textContent.toLowerCase();
        const date = item.querySelector('.entry-date').textContent;
        
        const matchesSearch = !search || content.includes(search);
        const matchesDate = (!startDate || date >= startDate) && (!endDate || date <= endDate);
        
        item.style.display = matchesSearch && matchesDate ? '' : 'none';
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    fetchEntries();
    
    // 添加搜索和日期过滤事件监听
    document.getElementById('search').addEventListener('input', filterEntries);
    document.getElementById('start-date').addEventListener('change', filterEntries);
    document.getElementById('end-date').addEventListener('change', filterEntries);
}); 