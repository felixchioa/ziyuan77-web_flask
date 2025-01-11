// 初始化highlight.js
hljs.highlightAll();

// 获取DOM元素
const inputCss = document.getElementById('input-css');
const outputCss = document.getElementById('output-css');
const minifyBtn = document.getElementById('minify');
const beautifyBtn = document.getElementById('beautify');
const errorMessage = document.getElementById('error-message');

// 创建CleanCSS实例
const cleanCSS = new CleanCSS({
    format: 'beautify',
    level: {
        1: {
            all: true
        },
        2: {
            all: true
        }
    }
});

// 事件监听
minifyBtn.addEventListener('click', () => processCSS('minify'));
beautifyBtn.addEventListener('click', () => processCSS('beautify'));
document.getElementById('clear-input').addEventListener('click', clearInput);
document.getElementById('paste-input').addEventListener('click', pasteInput);
document.getElementById('copy-output').addEventListener('click', copyOutput);
document.getElementById('download').addEventListener('click', downloadOutput);
document.getElementById('upload-file').addEventListener('click', () => {
    document.getElementById('file-input').click();
});
document.getElementById('file-input').addEventListener('change', handleFileUpload);
document.getElementById('output-type').addEventListener('change', updateOutput);

// 处理CSS
function processCSS(action) {
    try {
        const input = inputCss.value;
        if (!input) {
            showError('请输入CSS代码');
            return;
        }
        
        const options = {
            format: action === 'beautify' ? 'beautify' : false,
            level: {
                1: {
                    removeComments: document.getElementById('remove-comments').checked,
                    removeWhitespace: document.getElementById('remove-whitespace').checked,
                    cleanupSelectors: document.getElementById('combine-selectors').checked
                },
                2: {
                    mergeMedia: true,
                    mergeSelectors: document.getElementById('combine-selectors').checked,
                    mergeSemantically: true,
                    removeEmpty: true,
                    reduceNonAdjacentRules: true,
                    removeDuplicateFontRules: true,
                    removeDuplicateMediaBlocks: true,
                    removeDuplicateRules: true,
                    removeUnusedAtRules: false
                }
            }
        };
        
        const result = new CleanCSS(options).minify(input);
        
        if (result.errors.length > 0) {
            throw new Error(result.errors.join('\n'));
        }
        
        let output = result.styles;
        
        if (document.getElementById('shorten-colors').checked) {
            output = shortenColors(output);
        }
        
        if (document.getElementById('shorten-zero').checked) {
            output = shortenZeroValues(output);
        }
        
        updateOutput(output);
        hideError();
    } catch (error) {
        showError(`处理失败: ${error.message}`);
    }
}

// 更新输出
function updateOutput(css) {
    outputCss.textContent = css;
    hljs.highlightElement(outputCss);
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
        inputCss.value = text;
        processCSS('minify');
    } catch (error) {
        showError(`文件读取失败: ${error.message}`);
    }
}

// 复制和下载
function copyOutput() {
    if (!outputCss.textContent) {
        showError('没有可复制的内容');
        return;
    }
    
    navigator.clipboard.writeText(outputCss.textContent)
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
    if (!outputCss.textContent) {
        showError('没有可下载的内容');
        return;
    }
    
    const blob = new Blob([outputCss.textContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'style.min.css';
    a.click();
    URL.revokeObjectURL(url);
}

// 辅助函数
function clearInput() {
    inputCss.value = '';
    outputCss.textContent = '';
    updateStats();
}

async function pasteInput() {
    try {
        const text = await navigator.clipboard.readText();
        inputCss.value = text;
        processCSS('minify');
    } catch (error) {
        showError('粘贴失败: ' + error.message);
    }
}

function updateStats() {
    const originalSize = new Blob([inputCss.value]).size;
    const minifiedSize = new Blob([outputCss.textContent]).size;
    
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

function shortenColors(css) {
    return css
        .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3')
        .replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/gi, (_, r, g, b) => {
            const hex = [r, g, b].map(x => {
                const h = parseInt(x).toString(16);
                return h.length === 1 ? '0' + h : h;
            }).join('');
            return `#${hex}`;
        });
}

function shortenZeroValues(css) {
    return css
        .replace(/(\s|:)0(?:px|em|rem|%|in|cm|mm|pc|pt|ex|vh|vw|vmin|vmax)/g, '$10')
        .replace(/(\s|:)0\.([0-9])+/g, '$1.$2');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
} 