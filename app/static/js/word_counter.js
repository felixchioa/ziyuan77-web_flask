// 获取DOM元素
const textInput = document.getElementById('text-input');
const clearBtn = document.getElementById('clear-btn');
const totalWords = document.getElementById('total-words');
const uniqueWords = document.getElementById('unique-words');
const paragraphCount = document.getElementById('paragraph-count');
const sentenceCount = document.getElementById('sentence-count');
const lengthDistribution = document.getElementById('length-distribution');
const commonWords = document.getElementById('common-words');

// 选项元素
const ignoreCase = document.getElementById('ignore-case');
const ignoreNumbers = document.getElementById('ignore-numbers');
const excludeCommon = document.getElementById('exclude-common');

// 常用词列表
const commonWordsList = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what'
]);

// 初始化
function init() {
    // 添加事件监听
    textInput.addEventListener('input', updateStats);
    clearBtn.addEventListener('click', clearText);
    ignoreCase.addEventListener('change', updateStats);
    ignoreNumbers.addEventListener('change', updateStats);
    excludeCommon.addEventListener('change', updateStats);
    
    // 加载上次的内容
    const savedContent = localStorage.getItem('word-counter-content');
    if (savedContent) {
        textInput.value = savedContent;
        updateStats();
    }
}

// 更新统计信息
function updateStats() {
    const text = textInput.value;
    localStorage.setItem('word-counter-content', text);
    
    // 获取单词列表
    const words = getWords(text);
    const wordFrequency = getWordFrequency(words);
    
    // 更新基本统计
    totalWords.textContent = words.length;
    uniqueWords.textContent = Object.keys(wordFrequency).length;
    paragraphCount.textContent = getParagraphCount(text);
    sentenceCount.textContent = getSentenceCount(text);
    
    // 更新单词长度分布
    updateLengthDistribution(words);
    
    // 更新常用单词列表
    updateCommonWordsList(wordFrequency);
}

// 获取单词列表
function getWords(text) {
    let words = text.trim().split(/\s+/);
    
    if (ignoreCase.checked) {
        words = words.map(word => word.toLowerCase());
    }
    
    if (ignoreNumbers.checked) {
        words = words.filter(word => !/^\d+$/.test(word));
    }
    
    if (excludeCommon.checked) {
        words = words.filter(word => !commonWordsList.has(word.toLowerCase()));
    }
    
    return words.filter(word => word.length > 0);
}

// 获取单词频率
function getWordFrequency(words) {
    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    return frequency;
}

// 获取段落数
function getParagraphCount(text) {
    return text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length || 0;
}

// 获取句子数
function getSentenceCount(text) {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length || 0;
}

// 更新单词长度分布
function updateLengthDistribution(words) {
    const distribution = {};
    words.forEach(word => {
        const length = word.length;
        distribution[length] = (distribution[length] || 0) + 1;
    });
    
    // 清空现有内容
    lengthDistribution.innerHTML = '';
    
    // 获取最大频率用于计算比例
    const maxCount = Math.max(...Object.values(distribution));
    
    // 创建柱状图
    Object.entries(distribution)
        .sort(([a], [b]) => Number(a) - Number(b))
        .forEach(([length, count]) => {
            const percentage = (count / maxCount) * 100;
            
            const lengthBar = document.createElement('div');
            lengthBar.className = 'length-bar';
            lengthBar.innerHTML = `
                <div class="length-label">${length}字符</div>
                <div class="bar" style="width: ${percentage}%"></div>
                <div class="bar-count">${count}</div>
            `;
            
            lengthDistribution.appendChild(lengthBar);
        });
}

// 更新常用单词列表
function updateCommonWordsList(frequency) {
    // 获取前20个最常用的单词
    const sortedWords = Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20);
    
    // 清空现有内容
    commonWords.innerHTML = '';
    
    // 创建单词列表
    sortedWords.forEach(([word, count]) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <span class="word">${word}</span>
            <span class="count">${count}</span>
        `;
        
        commonWords.appendChild(wordItem);
    });
}

// 清空文本
function clearText() {
    if (!textInput.value || confirm('确定要清空文本吗？')) {
        textInput.value = '';
        localStorage.removeItem('word-counter-content');
        updateStats();
    }
}

// 初始化
init(); 