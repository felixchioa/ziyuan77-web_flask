// 初始化highlight.js
hljs.highlightAll();

// 获取DOM元素
const inputJs = document.getElementById('input-js');
const outputJs = document.getElementById('output-js');
const minifyBtn = document.getElementById('minify');
const errorMessage = document.getElementById('error-message');

// 事件监听
minifyBtn.addEventListener('click', processJS);
document.getElementById('clear-input').addEventListener('click', clearInput);
document.getElementById('paste-input').addEventListener('click', pasteInput);
document.getElementById('copy-output').addEventListener('click', copyOutput);
document.getElementById('download').addEventListener('click', downloadOutput);
document.getElementById('upload-file').addEventListener('click', () => {
    document.getElementById('file-input').click();
});
document.getElementById('file-input').addEventListener('change', handleFileUpload);
document.getElementById('output-type').addEventListener('change', updateOutput);

// 处理JavaScript
async function processJS() {
    try {
        const input = inputJs.value;
        if (!input) {
            showError('请输入JavaScript代码');
            return;
        }
        
        const options = {
            mangle: {
                toplevel: document.getElementById('mangle').checked,
                keep_fnames: document.getElementById('keep-fnames').checked,
                keep_classnames: document.getElementById('keep-classnames').checked
            },
            compress: document.getElementById('compress').checked && {
                passes: 2,
                unsafe: true,
                unsafe_arrows: true,
                unsafe_methods: true,
                unsafe_proto: true,
                unsafe_regexp: true,
                unsafe_undefined: true
            },
            format: {
                comments: !document.getElementById('comments').checked && 'some',
                beautify: document.getElementById('beautify').checked
            },
            sourceMap: document.getElementById('sourcemap').checked,
            ecma: document.getElementById('es6').checked ? 2015 : 5
        };

        const result = await Terser.minify(input, options);
        
        if (result.error) {
            throw result.error;
        }
        
        updateOutput(result);
        hideError();
    } catch (error) {
        showError(`处理失败: ${error.message}`);
    }
}

// 更新输出
function updateOutput(result) {
    const outputType = document.getElementById('output-type').value;
    let content = '';
    
    switch (outputType) {
        case 'minified':
            content = result.code;
            break;
        case 'beautified':
            content = js_beautify(result.code, {
                indent_size: 2,
                space_in_empty_paren: true
            });
            break;
        case 'sourcemap':
            if (!result.map) {
                showError('Source Map未生成');
                return;
            }
            content = result.map;
            break;
    }
    
    outputJs.textContent = content;
    hljs.highlightElement(outputJs);
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
        inputJs.value = text;
        processJS();
    } catch (error) {
        showError(`文件读取失败: ${error.message}`);
    }
}

// 复制和下载
function copyOutput() {
    if (!outputJs.textContent) {
        showError('没有可复制的内容');
        return;
    }
    
    navigator.clipboard.writeText(outputJs.textContent)
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
    if (!outputJs.textContent) {
        showError('没有可下载的内容');
        return;
    }
    
    const outputType = document.getElementById('output-type').value;
    const extension = outputType === 'sourcemap' ? '.map' : '.min.js';
    
    const blob = new Blob([outputJs.textContent], { 
        type: outputType === 'sourcemap' ? 'application/json' : 'text/javascript' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script${extension}`;
    a.click();
    URL.revokeObjectURL(url);
}

// 辅助函数
function clearInput() {
    inputJs.value = '';
    outputJs.textContent = '';
    updateStats();
}

async function pasteInput() {
    try {
        const text = await navigator.clipboard.readText();
        inputJs.value = text;
        processJS();
    } catch (error) {
        showError('粘贴失败: ' + error.message);
    }
}

function updateStats() {
    const originalSize = new Blob([inputJs.value]).size;
    const minifiedSize = new Blob([outputJs.textContent]).size;
    
    document.getElementById('original-size').textContent = formatSize(originalSize);
    document.getElementById('minified-size').textContent = formatSize(minifiedSize);
    
    const ratio = originalSize ? 
        ((minifiedSize / originalSize) * 100).toFixed(1) : 
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