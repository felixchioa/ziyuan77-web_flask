// 获取DOM元素
const textInput = document.getElementById('text-input');
const clearBtn = document.getElementById('clear-btn');

// 统计元素
const totalChars = document.getElementById('total-chars');
const charsNoSpaces = document.getElementById('chars-no-spaces');
const wordCount = document.getElementById('word-count');
const lineCount = document.getElementById('line-count');
const letterCount = document.getElementById('letter-count');
const numberCount = document.getElementById('number-count');
const spaceCount = document.getElementById('space-count');
const punctuationCount = document.getElementById('punctuation-count');
const chineseCount = document.getElementById('chinese-count');
const chinesePunctCount = document.getElementById('chinese-punct-count');

// 正则表达式
const chineseRegex = /[\u4e00-\u9fa5]/g;
const chinesePunctRegex = /[\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5]/g;
const letterRegex = /[a-zA-Z]/g;
const numberRegex = /[0-9]/g;
const spaceRegex = /\s/g;
const punctuationRegex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;

// 初始化
function init() {
    // 添加事件监听
    textInput.addEventListener('input', updateStats);
    clearBtn.addEventListener('click', clearText);
    
    // 加载上次的内容
    const savedContent = localStorage.getItem('character-counter-content');
    if (savedContent) {
        textInput.value = savedContent;
        updateStats();
    }
}

// 更新统计信息
function updateStats() {
    const text = textInput.value;
    
    // 保存内容
    localStorage.setItem('character-counter-content', text);
    
    // 更新基本统计
    totalChars.textContent = text.length;
    charsNoSpaces.textContent = text.replace(/\s/g, '').length;
    wordCount.textContent = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    lineCount.textContent = text === '' ? 0 : text.split('\n').length;
    
    // 更新字符分类统计
    letterCount.textContent = (text.match(letterRegex) || []).length;
    numberCount.textContent = (text.match(numberRegex) || []).length;
    spaceCount.textContent = (text.match(spaceRegex) || []).length;
    punctuationCount.textContent = (text.match(punctuationRegex) || []).length;
    
    // 更新中文统计
    chineseCount.textContent = (text.match(chineseRegex) || []).length;
    chinesePunctCount.textContent = (text.match(chinesePunctRegex) || []).length;
}

// 清空文本
function clearText() {
    if (!textInput.value || confirm('确定要清空文本吗？')) {
        textInput.value = '';
        localStorage.removeItem('character-counter-content');
        updateStats();
    }
}

// 初始化
init(); 