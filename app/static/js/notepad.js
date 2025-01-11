// 获取DOM元素
const editor = document.getElementById('editor');
const fileInput = document.getElementById('file-input');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const lineCount = document.getElementById('line-count');
const statusMessage = document.getElementById('status-message');

// 撤销/重做历史
let undoStack = [];
let redoStack = [];
let lastContent = '';

// 初始化
function init() {
    // 加载上次编辑的内容
    const savedContent = localStorage.getItem('notepad-content');
    if (savedContent) {
        editor.value = savedContent;
        updateStats();
    }
    
    // 自动保存
    setInterval(autoSave, 30000);
    
    // 添加事件监听
    editor.addEventListener('input', handleInput);
    document.getElementById('new-file').addEventListener('click', newFile);
    document.getElementById('open-file').addEventListener('click', () => fileInput.click());
    document.getElementById('save-file').addEventListener('click', saveFile);
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    document.getElementById('clear').addEventListener('click', clearEditor);
    document.getElementById('font-family').addEventListener('change', changeFontFamily);
    document.getElementById('font-size').addEventListener('change', changeFontSize);
    document.getElementById('word-wrap').addEventListener('change', toggleWordWrap);
    fileInput.addEventListener('change', openFile);
}

// 处理输入
function handleInput() {
    updateStats();
    
    // 添加到撤销栈
    if (editor.value !== lastContent) {
        undoStack.push(lastContent);
        redoStack = [];
        lastContent = editor.value;
    }
}

// 更新统计信息
function updateStats() {
    const text = editor.value;
    charCount.textContent = text.length;
    wordCount.textContent = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    lineCount.textContent = text === '' ? 0 : text.split('\n').length;
}

// 新建文件
function newFile() {
    if (editor.value && !confirm('确定要新建文件吗？当前内容将会丢失。')) {
        return;
    }
    editor.value = '';
    updateStats();
    showStatus('已新建文件');
}

// 打开文件
function openFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        editor.value = e.target.result;
        updateStats();
        showStatus(`已打开文件：${file.name}`);
    };
    reader.onerror = () => showStatus('打开文件失败', true);
    reader.readAsText(file);
    
    // 重置文件输入框
    event.target.value = '';
}

// 保存文件
function saveFile() {
    const text = editor.value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notepad.txt';
    a.click();
    URL.revokeObjectURL(url);
    showStatus('文件已保存');
}

// 自动保存
function autoSave() {
    if (editor.value) {
        localStorage.setItem('notepad-content', editor.value);
        showStatus('已自动保存');
    }
}

// 撤销
function undo() {
    if (undoStack.length === 0) return;
    
    redoStack.push(editor.value);
    editor.value = undoStack.pop();
    lastContent = editor.value;
    updateStats();
}

// 重做
function redo() {
    if (redoStack.length === 0) return;
    
    undoStack.push(editor.value);
    editor.value = redoStack.pop();
    lastContent = editor.value;
    updateStats();
}

// 清空编辑器
function clearEditor() {
    if (!editor.value || confirm('确定要清空内容吗？')) {
        undoStack.push(editor.value);
        editor.value = '';
        lastContent = '';
        updateStats();
        showStatus('内容已清空');
    }
}

// 更改字体
function changeFontFamily(event) {
    editor.style.fontFamily = event.target.value;
}

// 更改字号
function changeFontSize(event) {
    editor.style.fontSize = `${event.target.value}px`;
}

// 切换自动换行
function toggleWordWrap(event) {
    editor.style.whiteSpace = event.target.checked ? 'pre-wrap' : 'pre';
}

// 显示状态消息
function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message' + (isError ? ' error' : ' success');
    setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
    }, 3000);
}

// 初始化
init(); 