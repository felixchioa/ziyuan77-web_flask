// 获取DOM元素
const minValue = document.getElementById('min-value');
const maxValue = document.getElementById('max-value');
const count = document.getElementById('count');
const uniqueNumbers = document.getElementById('unique-numbers');
const sortNumbers = document.getElementById('sort-numbers');
const decimalPlaces = document.getElementById('decimal-places');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const clearBtn = document.getElementById('clear-btn');
const result = document.getElementById('result');
const formatOptions = document.getElementsByName('format');
const average = document.getElementById('average');
const min = document.getElementById('min');
const max = document.getElementById('max');
const sum = document.getElementById('sum');

// 添加事件监听
generateBtn.addEventListener('click', generateNumbers);
copyBtn.addEventListener('click', copyResult);
clearBtn.addEventListener('click', clearResult);
formatOptions.forEach(option => {
    option.addEventListener('change', formatResult);
});

// 生成随机数
function generateNumbers() {
    const min = parseFloat(minValue.value);
    const max = parseFloat(maxValue.value);
    const n = parseInt(count.value);
    const decimals = parseInt(decimalPlaces.value);
    
    // 验证输入
    if (isNaN(min) || isNaN(max) || isNaN(n) || min >= max || n < 1) {
        alert('请输入有效的数值范围和数量！');
        return;
    }
    
    // 检查是否可以生成足够的不重复数字
    if (uniqueNumbers.checked && n > (max - min + 1)) {
        alert('在指定范围内无法生成足够的不重复数字！');
        return;
    }
    
    // 生成随机数
    let numbers = [];
    if (uniqueNumbers.checked) {
        // 生成不重复的随机数
        const pool = new Set();
        while (pool.size < n) {
            const num = generateRandomNumber(min, max, decimals);
            pool.add(num);
        }
        numbers = Array.from(pool);
    } else {
        // 生成可重复的随机数
        for (let i = 0; i < n; i++) {
            numbers.push(generateRandomNumber(min, max, decimals));
        }
    }
    
    // 排序（如果需要）
    if (sortNumbers.checked) {
        numbers.sort((a, b) => a - b);
    }
    
    // 更新结果
    updateResult(numbers);
}

// 生成单个随机数
function generateRandomNumber(min, max, decimals) {
    const num = Math.random() * (max - min) + min;
    return Number(num.toFixed(decimals));
}

// 更新结果
function updateResult(numbers) {
    // 格式化并显示结果
    formatResult(numbers);
    
    // 更新统计信息
    if (numbers.length > 0) {
        const sumValue = numbers.reduce((a, b) => a + b, 0);
        const avgValue = sumValue / numbers.length;
        
        average.textContent = avgValue.toFixed(4);
        min.textContent = Math.min(...numbers);
        max.textContent = Math.max(...numbers);
        sum.textContent = sumValue.toFixed(4);
    } else {
        average.textContent = '-';
        min.textContent = '-';
        max.textContent = '-';
        sum.textContent = '-';
    }
}

// 格式化结果
function formatResult(numbers = null) {
    if (!numbers) {
        numbers = result.value.split(/[\n,\s]+/).filter(n => n.trim());
    }
    
    const format = Array.from(formatOptions).find(opt => opt.checked).value;
    switch (format) {
        case 'line':
            result.value = numbers.join('\n');
            break;
        case 'comma':
            result.value = numbers.join(', ');
            break;
        case 'space':
            result.value = numbers.join(' ');
            break;
    }
}

// 复制结果
function copyResult() {
    if (!result.value) return;
    
    result.select();
    document.execCommand('copy');
    
    // 显示复制成功提示
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '已复制！';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

// 清空结果
function clearResult() {
    result.value = '';
    average.textContent = '-';
    min.textContent = '-';
    max.textContent = '-';
    sum.textContent = '-';
} 