let translationHistory = [];
let currentRating = 0;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 文本输入监听
    document.getElementById('source-text').addEventListener('input', handleInput);
    
    // 语言选择监听
    document.getElementById('source-language').addEventListener('change', translate);
    document.getElementById('target-language').addEventListener('change', translate);
    
    // 评分系统
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', () => rateTranslation(star.dataset.rating));
        star.addEventListener('mouseover', () => highlightStars(star.dataset.rating));
        star.addEventListener('mouseout', () => highlightStars(currentRating));
    });
    
    // 加载历史记录
    loadHistory();
});

// 处理输入
function handleInput(e) {
    const text = e.target.value;
    const charCount = text.length;
    document.querySelector('.char-count').textContent = `${charCount}/5000`;
    
    if (charCount > 0) {
        translate();
    }
}

// 翻译功能
async function translate() {
    const sourceText = document.getElementById('source-text').value;
    if (!sourceText) return;
    
    const sourceLang = document.getElementById('source-language').value;
    const targetLang = document.getElementById('target-language').value;
    
    try {
        // 这里应该调用实际的翻译API
        const response = await mockTranslateAPI(sourceText, sourceLang, targetLang);
        
        document.getElementById('target-text').textContent = response.translatedText;
        
        // 添加到历史记录
        addToHistory({
            sourceText,
            translatedText: response.translatedText,
            sourceLang,
            targetLang,
            timestamp: new Date()
        });
        
    } catch (error) {
        console.error('翻译出错:', error);
        document.getElementById('target-text').textContent = '翻译出错，请稍后重试';
    }
}

// 模拟翻译API
function mockTranslateAPI(text, sourceLang, targetLang) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                translatedText: `[${sourceLang}->${targetLang}] ${text}`
            });
        }, 500);
    });
}

// 语言切换
function swapLanguages() {
    const sourceLang = document.getElementById('source-language');
    const targetLang = document.getElementById('target-language');
    const temp = sourceLang.value;
    
    sourceLang.value = targetLang.value;
    targetLang.value = temp;
    
    translate();
}

// 文本操作
function clearText(type) {
    if (type === 'source') {
        document.getElementById('source-text').value = '';
        document.querySelector('.char-count').textContent = '0/5000';
    } else {
        document.getElementById('target-text').textContent = '';
    }
}

function copyText(type) {
    const text = type === 'source' 
        ? document.getElementById('source-text').value 
        : document.getElementById('target-text').textContent;
        
    navigator.clipboard.writeText(text).then(() => {
        alert('文本已复制到剪贴板');
    });
}

async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('source-text').value = text;
        document.querySelector('.char-count').textContent = `${text.length}/5000`;
        translate();
    } catch (error) {
        console.error('粘贴失败:', error);
    }
}

// 历史记录
function addToHistory(entry) {
    translationHistory.unshift(entry);
    if (translationHistory.length > 50) {
        translationHistory.pop();
    }
    
    localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
    updateHistoryDisplay();
}

function loadHistory() {
    const saved = localStorage.getItem('translationHistory');
    if (saved) {
        translationHistory = JSON.parse(saved);
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('translation-history');
    historyList.innerHTML = '';
    
    translationHistory.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div>${entry.sourceText}</div>
            <div>${entry.translatedText}</div>
            <small>${new Date(entry.timestamp).toLocaleString()}</small>
        `;
        
        item.addEventListener('click', () => {
            document.getElementById('source-text').value = entry.sourceText;
            document.getElementById('target-text').textContent = entry.translatedText;
            document.getElementById('source-language').value = entry.sourceLang;
            document.getElementById('target-language').value = entry.targetLang;
        });
        
        historyList.appendChild(item);
    });
}

// 评分系统
function rateTranslation(rating) {
    currentRating = rating;
    highlightStars(rating);
}

function highlightStars(rating) {
    document.querySelectorAll('.star').forEach(star => {
        star.classList.toggle('active', star.dataset.rating <= rating);
    });
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
            document.querySelector('.char-count').textContent = 
                `${event.target.result.length}/5000`;
            translate();
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function downloadTranslation() {
    const text = document.getElementById('target-text').textContent;
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'translation.txt';
    link.click();
    URL.revokeObjectURL(url);
}

// 语音朗读
function pronounce(type) {
    const text = type === 'source' 
        ? document.getElementById('source-text').value 
        : document.getElementById('target-text').textContent;
        
    const lang = type === 'source'
        ? document.getElementById('source-language').value
        : document.getElementById('target-language').value;
        
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
} 