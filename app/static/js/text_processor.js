// 初始化
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('source-text').addEventListener('input', handleInput);
});

// 处理输入
function handleInput(e) {
    const text = e.target.value;
    updateCharCount(text);
    analyzeText(text);
}

// 更新字符计数
function updateCharCount(text) {
    document.querySelector('.char-count').textContent = `${text.length} 字符`;
}

// 文本处理函数
function processText(type) {
    const sourceText = document.getElementById('source-text').value;
    let result = '';

    switch (type) {
        case 'uppercase':
            result = sourceText.toUpperCase();
            break;
        case 'lowercase':
            result = sourceText.toLowerCase();
            break;
        case 'capitalize':
            result = sourceText.replace(/\b\w/g, c => c.toUpperCase());
            break;
        case 'reverse':
            result = sourceText.split('').reverse().join('');
            break;
        case 'trim':
            result = sourceText.replace(/\s+/g, ' ').trim();
            break;
        case 'camelCase':
            result = sourceText.toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
            break;
        case 'snakeCase':
            result = sourceText.toLowerCase()
                .replace(/[^a-zA-Z0-9]+/g, '_')
                .replace(/^_|_$/g, '');
            break;
        case 'kebabCase':
            result = sourceText.toLowerCase()
                .replace(/[^a-zA-Z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            break;
        case 'pascalCase':
            result = sourceText.toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
                .replace(/^[a-z]/, c => c.toUpperCase());
            break;
        case 'removeDuplicates':
            result = [...new Set(sourceText.split('\n'))].join('\n');
            break;
        case 'sortLines':
            result = sourceText.split('\n').sort().join('\n');
            break;
        case 'reverseLines':
            result = sourceText.split('\n').reverse().join('\n');
            break;
        case 'joinLines':
            result = sourceText.split('\n').join(' ');
            break;
        case 'splitLines':
            result = sourceText.split(' ').join('\n');
            break;
        case 'base64Encode':
            result = btoa(sourceText);
            break;
        case 'base64Decode':
            try {
                result = atob(sourceText);
            } catch (e) {
                result = '无效的Base64编码';
            }
            break;
        case 'urlEncode':
            result = encodeURIComponent(sourceText);
            break;
        case 'urlDecode':
            result = decodeURIComponent(sourceText);
            break;
        case 'htmlEncode':
            result = sourceText
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            break;
        case 'htmlDecode':
            result = sourceText
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'");
            break;
    }

    document.getElementById('output-text').textContent = result;
}

// 文本分析函数
function analyzeText(text) {
    // 基本统计
    const stats = {
        totalChars: text.length,
        totalWords: text.trim().split(/\s+/).length,
        totalLines: text.split('\n').length,
        chineseChars: (text.match(/[\u4e00-\u9fa5]/g) || []).length,
        englishChars: (text.match(/[a-zA-Z]/g) || []).length,
        numberChars: (text.match(/[0-9]/g) || []).length,
        spaceChars: (text.match(/\s/g) || []).length,
        punctuationChars: (text.match(/[.,!?;:'"()\[\]{}]/g) || []).length
    };

    // 更新统计显示
    Object.keys(stats).forEach(key => {
        const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
        if (element) {
            element.textContent = stats[key];
        }
    });

    // 词频统计
    if (text.trim()) {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        const sortedWords = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);

        const wordFrequencyDiv = document.getElementById('word-frequency');
        wordFrequencyDiv.innerHTML = '<h4>词频统计（前20个）</h4>' +
            sortedWords.map(([word, count]) => 
                `<div class="frequency-item">
                    <span class="word">${word}</span>
                    <span class="frequency">${count}</span>
                </div>`
            ).join('');
    }
}

// 文件操作
function uploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            document.getElementById('source-text').value = event.target.result;
            handleInput({ target: { value: event.target.result } });
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function downloadOutput() {
    const text = document.getElementById('output-text').textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'processed_text.txt';
    link.click();
    URL.revokeObjectURL(url);
}

// 剪贴板操作
function copyOutput() {
    const text = document.getElementById('output-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('文本已复制到剪贴板');
    });
}

async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('source-text').value = text;
        handleInput({ target: { value: text } });
    } catch (error) {
        console.error('粘贴失败:', error);
    }
}

function clearText() {
    document.getElementById('source-text').value = '';
    document.getElementById('output-text').textContent = '';
    handleInput({ target: { value: '' } });
} 