// 初始化变量
let wordFrequencyData = [];
let sentimentChart = null;

// 事件监听器
document.getElementById('analyze-btn').addEventListener('click', analyzeText);
document.getElementById('clear-btn').addEventListener('click', clearText);
document.getElementById('copy-btn').addEventListener('click', copyResults);
document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('file-input').click();
});
document.getElementById('file-input').addEventListener('change', handleFileUpload);

// 标签页切换
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabId = e.target.dataset.tab;
        switchTab(tabId);
    });
});

// 分析文本
async function analyzeText() {
    const text = document.getElementById('input-text').value;
    if (!text.trim()) {
        alert('请输入文本');
        return;
    }
    
    try {
        // 基本统计
        updateBasicStats(text);
        
        // 词频分析
        analyzeWordFrequency(text);
        
        // 可读性分析
        analyzeReadability(text);
        
        // 情感分析
        await analyzeSentiment(text);
        
        // 语法分析
        await analyzeSyntax(text);
        
    } catch (error) {
        console.error('Analysis error:', error);
        alert('分析过程中出现错误');
    }
}

// 更新基本统计
function updateBasicStats(text) {
    const stats = {
        charCount: text.length,
        wordCount: text.trim().split(/\s+/).length,
        lineCount: text.split('\n').length,
        paragraphCount: text.split('\n\n').length,
        sentenceCount: text.split(/[.!?]+/).length - 1,
        avgWordLength: calculateAvgWordLength(text)
    };
    
    Object.entries(stats).forEach(([key, value]) => {
        document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase())
            .textContent = value.toFixed(2);
    });
}

// 词频分析
function analyzeWordFrequency(text) {
    // 分词并统计频率
    const words = text.toLowerCase()
        .match(/\b\w+\b/g)
        .reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});
    
    // 转换为数组并排序
    wordFrequencyData = Object.entries(words)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value);
    
    // 生成词云
    generateWordCloud();
    
    // 更新频率列表
    updateFrequencyList();
}

// 生成词云
function generateWordCloud() {
    const width = document.getElementById('word-cloud').offsetWidth;
    const height = 300;
    
    // 清除现有词云
    d3.select('#word-cloud').html('');
    
    // 创建词云布局
    const layout = d3.layout.cloud()
        .size([width, height])
        .words(wordFrequencyData.slice(0, 50))
        .padding(5)
        .rotate(() => 0)
        .fontSize(d => Math.sqrt(d.value) * 10)
        .on('end', draw);
    
    layout.start();
    
    function draw(words) {
        d3.select('#word-cloud')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width/2},${height/2})`)
            .selectAll('text')
            .data(words)
            .enter()
            .append('text')
            .style('font-size', d => `${d.size}px`)
            .style('fill', () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
            .attr('text-anchor', 'middle')
            .attr('transform', d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
            .text(d => d.text);
    }
}

// 更新频率列表
function updateFrequencyList() {
    const list = document.getElementById('frequency-list');
    list.innerHTML = wordFrequencyData
        .slice(0, 20)
        .map(({ text, value }) => `
            <div class="frequency-item">
                <span class="word">${text}</span>
                <span class="count">${value}</span>
            </div>
        `)
        .join('');
}

// 可读性分析
function analyzeReadability(text) {
    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!?]+/);
    const syllables = countSyllables(text);
    
    // Flesch Reading Ease Score
    const fleschScore = 206.835 - 1.015 * (words.length / sentences.length) 
        - 84.6 * (syllables / words.length);
    
    document.getElementById('flesch-score').textContent = 
        Math.max(0, Math.min(100, fleschScore)).toFixed(2);
    
    document.getElementById('avg-sentence-length').textContent = 
        (words.length / sentences.length).toFixed(2);
    
    document.getElementById('complex-word-ratio').textContent = 
        (countComplexWords(words) / words.length * 100).toFixed(2) + '%';
}

// 情感分析
async function analyzeSentiment(text) {
    try {
        const response = await fetch('/text_analyzer/sentiment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        updateSentimentChart(data);
        updateSentimentSummary(data);
        
    } catch (error) {
        console.error('Sentiment analysis error:', error);
    }
}

// 更新情感分析图表
function updateSentimentChart(data) {
    const ctx = document.getElementById('sentiment-chart').getContext('2d');
    
    if (sentimentChart) {
        sentimentChart.destroy();
    }
    
    sentimentChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['积极', '消极', '中性', '强度'],
            datasets: [{
                label: '情感分析',
                data: [
                    data.positive,
                    data.negative,
                    data.neutral,
                    data.intensity
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });
}

// 辅助函数
function calculateAvgWordLength(text) {
    const words = text.trim().split(/\s+/);
    return words.reduce((sum, word) => sum + word.length, 0) / words.length;
}

function countSyllables(text) {
    return text.toLowerCase()
        .replace(/[^a-z]/g, '')
        .replace(/[^aeiou]+/g, ' ')
        .trim()
        .length;
}

function countComplexWords(words) {
    return words.filter(word => countSyllables(word) > 2).length;
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === tabId);
    });
}

function clearText() {
    document.getElementById('input-text').value = '';
    updateBasicStats('');
}

function copyResults() {
    const results = document.querySelector('.results-section').textContent;
    navigator.clipboard.writeText(results)
        .then(() => alert('结果已复制到剪贴板'))
        .catch(err => console.error('Copy failed:', err));
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        document.getElementById('input-text').value = text;
        analyzeText();
    } catch (error) {
        console.error('File reading error:', error);
        alert('文件读取失败');
    }
} 