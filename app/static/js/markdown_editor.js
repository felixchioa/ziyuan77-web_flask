// 初始化编辑器
let editor = document.getElementById('editor');
let preview = document.getElementById('preview');
let autoSave = document.getElementById('auto-save');
let saveStatus = document.getElementById('save-status');
let lastSavedContent = '';

// 配置marked
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return code;
    },
    pedantic: false,
    gfm: true,
    breaks: true,
    sanitize: false,
    smartypants: false,
    xhtml: false
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadSavedContent();
    updatePreview();
    updateWordCount();
    
    // 自动保存
    setInterval(() => {
        if (autoSave.checked && editor.value !== lastSavedContent) {
            saveContent();
        }
    }, 30000);
});

// 编辑器事件
editor.addEventListener('input', () => {
    updatePreview();
    updateWordCount();
    updateSaveStatus('未保存');
});

editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        insertText('    ');
    }
});

// Markdown工具函数
function insertMarkdown(type) {
    const selections = {
        bold: ['**', '**'],
        italic: ['*', '*'],
        strikethrough: ['~~', '~~'],
        heading: ['### ', ''],
        link: ['[', '](url)'],
        image: ['![alt text](', ')'],
        code: ['```\n', '\n```'],
        quote: ['> ', ''],
        ul: ['- ', ''],
        ol: ['1. ', ''],
        task: ['- [ ] ', ''],
        table: ['| Header | Header |\n| --- | --- |\n| Cell | Cell |', '']
    };
    
    const [prefix, suffix] = selections[type];
    insertText(prefix, suffix);
}

function insertText(prefix, suffix = '') {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end);
    const before = editor.value.substring(0, start);
    const after = editor.value.substring(end);
    
    editor.value = before + prefix + selected + suffix + after;
    editor.focus();
    
    if (selected) {
        editor.setSelectionRange(start + prefix.length, end + prefix.length);
    } else {
        editor.setSelectionRange(start + prefix.length, start + prefix.length);
    }
    
    updatePreview();
    updateWordCount();
}

// 更新预览
function updatePreview() {
    const content = editor.value;
    const html = marked(content);
    preview.innerHTML = `<div class="markdown-body">${html}</div>`;
}

// 更新字数统计
function updateWordCount() {
    const text = editor.value;
    document.getElementById('word-count').textContent = text.length;
    document.getElementById('line-count').textContent = text.split('\n').length;
}

// 保存和加载
function saveContent() {
    localStorage.setItem('markdown-content', editor.value);
    lastSavedContent = editor.value;
    updateSaveStatus('已保存');
}

function loadSavedContent() {
    const saved = localStorage.getItem('markdown-content');
    if (saved) {
        editor.value = saved;
        lastSavedContent = saved;
        updateSaveStatus('已加载');
    }
}

function updateSaveStatus(status) {
    saveStatus.textContent = status;
    setTimeout(() => {
        if (status === '已保存') {
            saveStatus.textContent = '';
        }
    }, 2000);
}

// 导入导出
function exportMarkdown() {
    const content = editor.value;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
}

function exportHtml() {
    const content = preview.innerHTML;
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${document.querySelector('link[href*="github"]').outerHTML}
        .markdown-body {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
}

// 文件导入
document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        editor.value = e.target.result;
        updatePreview();
        updateWordCount();
    };
    reader.readAsText(file);
});

// 主题切换
function changeTheme() {
    const theme = document.getElementById('theme-selector').value;
    document.body.className = theme === 'dark' ? 'theme-dark' : '';
}

// 全屏切换
function toggleFullscreen(type) {
    const element = document.querySelector(`.${type}-section`);
    element.classList.toggle('fullscreen');
} 