// 获取DOM元素
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const encodeBtn = document.getElementById('encode');
const decodeBtn = document.getElementById('decode');
const urlSafe = document.getElementById('url-safe');
const autoDetect = document.getElementById('auto-detect');
const errorMessage = document.getElementById('error-message');

// 事件监听
encodeBtn.addEventListener('click', () => processText('encode'));
decodeBtn.addEventListener('click', () => processText('decode'));
inputText.addEventListener('input', updateStats);
document.getElementById('clear-input').addEventListener('click', clearInput);
document.getElementById('paste-input').addEventListener('click', pasteInput);
document.getElementById('copy-output').addEventListener('click', copyOutput);
document.getElementById('download').addEventListener('click', downloadOutput);
document.getElementById('upload-file').addEventListener('click', () => {
    document.getElementById('file-input').click();
});
document.getElementById('file-input').addEventListener('change', handleFileUpload);

// 处理文本
function processText(action) {
    try {
        const input = inputText.value;
        if (!input) {
            showError('请输入要处理的文本');
            return;
        }
        
        let result;
        if (action === 'encode') {
            result = urlSafe.checked ? 
                btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') :
                btoa(input);
        } else {
            let processedInput = input;
            if (urlSafe.checked) {
                processedInput = input.replace(/-/g, '+').replace(/_/g, '/');
                while (processedInput.length % 4) {
                    processedInput += '=';
                }
            }
            result = atob(processedInput);
        }
        
        outputText.value = result;
        updateStats();
        hideError();
    } catch (error) {
        showError(`处理失败: ${error.message}`);
    }
}

// 文件处理
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('文件大小不能超过5MB');
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            inputText.value = e.target.result;
            updateStats();
        };
        
        if (autoDetect.checked) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    } catch (error) {
        showError(`文件读取失败: ${error.message}`);
    }
}

// 复制和下载
function copyOutput() {
    if (!outputText.value) {
        showError('没有可复制的内容');
        return;
    }
    
    navigator.clipboard.writeText(outputText.value)
        .then(() => {
            const originalText = document.getElementById('copy-output').textContent;
            document.getElementById('copy-output').textContent = '已复制！';
            setTimeout(() => {
                document.getElementById('copy-output').textContent = originalText;
            }, 2000);
        })
        .catch(error => showError('复制失败: ' + error.message));
}

function downloadOutput() {
    if (!outputText.value) {
        showError('没有可下载的内容');
        return;
    }
    
    const format = document.getElementById('download-format').value;
    let content = outputText.value;
    let type = 'text/plain';
    let filename = 'output.txt';
    
    if (format === 'json') {
        content = JSON.stringify({ data: content });
        type = 'application/json';
        filename = 'output.json';
    } else if (format === 'xml') {
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<root>${content}</root>`;
        type = 'application/xml';
        filename = 'output.xml';
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// 辅助函数
function clearInput() {
    inputText.value = '';
    outputText.value = '';
    updateStats();
}

async function pasteInput() {
    try {
        const text = await navigator.clipboard.readText();
        inputText.value = text;
        updateStats();
    } catch (error) {
        showError('粘贴失败: ' + error.message);
    }
}

function updateStats() {
    document.getElementById('input-length').textContent = inputText.value.length;
    document.getElementById('output-length').textContent = outputText.value.length;
    
    const ratio = inputText.value.length ? 
        ((outputText.value.length / inputText.value.length) * 100).toFixed(1) : 
        '0.0';
    document.getElementById('compression-ratio').textContent = ratio + '%';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
} 