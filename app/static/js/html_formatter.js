// 初始化highlight.js
hljs.highlightAll();

// 获取DOM元素
const inputHtml = document.getElementById('input-html');
const outputHtml = document.getElementById('output-html');
const formatBtn = document.getElementById('format');
const errorMessage = document.getElementById('error-message');

// 事件监听
formatBtn.addEventListener('click', formatHtml);
document.getElementById('clear-input').addEventListener('click', clearInput);
document.getElementById('paste-input').addEventListener('click', pasteInput);
document.getElementById('copy-output').addEventListener('click', copyOutput);
document.getElementById('download').addEventListener('click', downloadOutput);
document.getElementById('upload-file').addEventListener('click', () => {
    document.getElementById('file-input').click();
});
document.getElementById('file-input').addEventListener('change', handleFileUpload);
document.getElementById('output-type').addEventListener('change', updateOutput);

// 格式化HTML
function formatHtml() {
    try {
        const input = inputHtml.value;
        if (!input) {
            showError('请输入HTML代码');
            return;
        }
        
        const options = {
            indent_size: parseInt(document.getElementById('indent-size').value),
            indent_char: document.getElementById('indent-type').value === 'spaces' ? ' ' : '\t',
            max_preserve_newlines: document.getElementById('remove-empty-lines').checked ? 0 : 999,
            preserve_newlines: true,
            keep_array_indentation: true,
            break_chained_methods: false,
            indent_scripts: document.getElementById('format-js').checked ? 'normal' : 'keep',
            brace_style: 'collapse',
            space_before_conditional: true,
            unescape_strings: false,
            jslint_happy: false,
            end_with_newline: false,
            wrap_line_length: 0,
            indent_inner_html: true,
            comma_first: false,
            e4x: false,
            indent_empty_lines: false
        };

        let result = html_beautify(input, options);
        
        if (document.getElementById('remove-comments').checked) {
            result = result.replace(/<!--[\s\S]*?-->/g, '');
        }
        
        updateOutput(result);
        hideError();
    } catch (error) {
        showError(`格式化失败: ${error.message}`);
    }
}

// 更新输出
function updateOutput(html) {
    const outputType = document.getElementById('output-type').value;
    let result = html || outputHtml.textContent;
    
    switch (outputType) {
        case 'minified':
            result = result
                .replace(/\s+/g, ' ')
                .replace(/>\s+</g, '><')
                .trim();
            break;
        case 'escaped':
            result = result
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            break;
    }
    
    outputHtml.textContent = result;
    hljs.highlightElement(outputHtml);
    updateStats();
}

// 文件处理
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('文件大小不能超过5MB');
        }
        
        const text = await file.text();
        inputHtml.value = text;
        formatHtml();
    } catch (error) {
        showError(`文件读取失败: ${error.message}`);
    }
}

// 复制和下载
function copyOutput() {
    if (!outputHtml.textContent) {
        showError('没有可复制的内容');
        return;
    }
    
    navigator.clipboard.writeText(outputHtml.textContent)
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
    if (!outputHtml.textContent) {
        showError('没有可下载的内容');
        return;
    }
    
    const blob = new Blob([outputHtml.textContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.html';
    a.click();
    URL.revokeObjectURL(url);
}

// 辅助函数
function clearInput() {
    inputHtml.value = '';
    outputHtml.textContent = '';
    updateStats();
}

async function pasteInput() {
    try {
        const text = await navigator.clipboard.readText();
        inputHtml.value = text;
        formatHtml();
    } catch (error) {
        showError('粘贴失败: ' + error.message);
    }
}

function updateStats() {
    const originalSize = new Blob([inputHtml.value]).size;
    const processedSize = new Blob([outputHtml.textContent]).size;
    
    document.getElementById('original-size').textContent = formatSize(originalSize);
    document.getElementById('processed-size').textContent = formatSize(processedSize);
    
    const ratio = originalSize ? 
        ((processedSize / originalSize) * 100).toFixed(1) : 
        '0.0';
    document.getElementById('compression-ratio').textContent = ratio + '%';
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
} 