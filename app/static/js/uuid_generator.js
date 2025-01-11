// UUID生成函数
function generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateUUIDv1() {
    const now = new Date();
    const timestamp = now.getTime();
    const clockSeq = Math.random() * 0x3fff | 0;
    const node = Array.from({length: 6}, () => Math.random() * 0xff | 0);
    
    const timeHex = timestamp.toString(16).padStart(16, '0');
    const clockSeqHex = clockSeq.toString(16).padStart(4, '0');
    const nodeHex = node.map(x => x.toString(16).padStart(2, '0')).join('');
    
    return `${timeHex.slice(0,8)}-${timeHex.slice(8,12)}-1${timeHex.slice(13,16)}-${clockSeqHex}-${nodeHex}`;
}

// 获取DOM元素
const generateBtn = document.getElementById('generate');
const uuidList = document.getElementById('uuid-list');
const errorMessage = document.getElementById('error-message');

// 事件监听
generateBtn.addEventListener('click', generateUUIDs);
document.getElementById('copy-all').addEventListener('click', copyAll);
document.getElementById('download').addEventListener('click', downloadUUIDs);

// 生成UUID
function generateUUIDs() {
    try {
        const version = document.getElementById('uuid-version').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const uppercase = document.getElementById('uppercase').checked;
        const noHyphens = document.getElementById('no-hyphens').checked;
        const braces = document.getElementById('braces').checked;
        
        if (quantity < 1 || quantity > 100) {
            throw new Error('生成数量必须在1-100之间');
        }
        
        uuidList.innerHTML = '';
        
        for (let i = 0; i < quantity; i++) {
            let uuid = version === '4' ? generateUUIDv4() : generateUUIDv1();
            
            if (uppercase) {
                uuid = uuid.toUpperCase();
            }
            if (noHyphens) {
                uuid = uuid.replace(/-/g, '');
            }
            if (braces) {
                uuid = `{${uuid}}`;
            }
            
            const uuidItem = document.createElement('div');
            uuidItem.className = 'uuid-item';
            uuidItem.innerHTML = `
                <span class="uuid-text">${uuid}</span>
                <button class="copy-button" onclick="copyUUID(this)">复制</button>
            `;
            
            uuidList.appendChild(uuidItem);
        }
        
        hideError();
    } catch (error) {
        showError(error.message);
    }
}

// 复制功能
function copyUUID(button) {
    const uuid = button.previousElementSibling.textContent;
    
    navigator.clipboard.writeText(uuid)
        .then(() => {
            const originalText = button.textContent;
            button.textContent = '已复制！';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        })
        .catch(error => showError('复制失败: ' + error.message));
}

function copyAll() {
    const uuids = Array.from(document.querySelectorAll('.uuid-text'))
        .map(span => span.textContent)
        .join('\n');
    
    if (!uuids) {
        showError('没有可复制的UUID');
        return;
    }
    
    navigator.clipboard.writeText(uuids)
        .then(() => {
            const button = document.getElementById('copy-all');
            const originalText = button.textContent;
            button.textContent = '已复制！';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        })
        .catch(error => showError('复制失败: ' + error.message));
}

// 下载功能
function downloadUUIDs() {
    const uuids = Array.from(document.querySelectorAll('.uuid-text'))
        .map(span => span.textContent);
    
    if (uuids.length === 0) {
        showError('没有可下载的UUID');
        return;
    }
    
    const format = document.getElementById('output-format').value;
    let content = '';
    let type = '';
    let extension = '';
    
    switch (format) {
        case 'text':
            content = uuids.join('\n');
            type = 'text/plain';
            extension = 'txt';
            break;
        case 'json':
            content = JSON.stringify(uuids, null, 2);
            type = 'application/json';
            extension = 'json';
            break;
        case 'csv':
            content = 'UUID\n' + uuids.join('\n');
            type = 'text/csv';
            extension = 'csv';
            break;
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
}

// 错误处理
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
} 