let memory = 0;
let currentMode = 'standard';
let currentBase = 10;
let lastOperation = '';
let lastNumber = '';
let newNumber = true;

// 模式切换
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        switchMode(mode);
    });
});

function switchMode(mode) {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    document.querySelectorAll('.keypad').forEach(keypad => {
        keypad.classList.add('hidden');
    });
    document.querySelector(`.${mode}-keypad`).classList.remove('hidden');
    
    currentMode = mode;
    clearAll();

    // 如果是转换器模式，初始化对应的转换器
    if (converterData[mode]) {
        initConverter(mode);
    }
}

// 基本计算器功能
function appendToDisplay(value) {
    const display = document.getElementById('display');
    if (newNumber) {
        display.value = value;
        newNumber = false;
    } else {
        display.value += value;
    }
}

function clearEntry() {
    document.getElementById('display').value = '0';
    newNumber = true;
}

function clearAll() {
    document.getElementById('display').value = '0';
    document.getElementById('history').textContent = '';
    lastOperation = '';
    lastNumber = '';
    newNumber = true;
}

function backspace() {
    const display = document.getElementById('display');
    display.value = display.value.slice(0, -1);
    if (display.value === '') {
        display.value = '0';
        newNumber = true;
    }
}

function calculateResult() {
    try {
        const display = document.getElementById('display');
        const history = document.getElementById('history');
        const expression = display.value;
        
        // 保存计算历史
        history.textContent = expression + ' =';
        
        // 执行计算
        let result;
        if (currentMode === 'programmer') {
            result = evaluateProgrammerExpression(expression);
        } else {
            result = eval(expression);
        }
        
        display.value = formatResult(result);
        newNumber = true;
        
    } catch (error) {
        alert('计算错误');
        clearAll();
    }
}

// 内存功能
function memoryStore() {
    memory = parseFloat(document.getElementById('display').value);
    updateMemoryButtons();
}

function memoryRecall() {
    document.getElementById('display').value = memory;
    newNumber = true;
}

function memoryClear() {
    memory = 0;
    updateMemoryButtons();
}

function memoryAdd() {
    memory += parseFloat(document.getElementById('display').value);
    updateMemoryButtons();
}

function memorySubtract() {
    memory -= parseFloat(document.getElementById('display').value);
    updateMemoryButtons();
}

function updateMemoryButtons() {
    document.getElementById('mc').disabled = memory === 0;
    document.getElementById('mr').disabled = memory === 0;
    document.getElementById('memory-value').textContent = memory !== 0 ? 'M' : '';
}

// 科学计算器功能
function sin() {
    const value = parseFloat(document.getElementById('display').value);
    document.getElementById('display').value = Math.sin(value * Math.PI / 180);
    newNumber = true;
}

function cos() {
    const value = parseFloat(document.getElementById('display').value);
    document.getElementById('display').value = Math.cos(value * Math.PI / 180);
    newNumber = true;
}

function tan() {
    const value = parseFloat(document.getElementById('display').value);
    document.getElementById('display').value = Math.tan(value * Math.PI / 180);
    newNumber = true;
}

function factorial() {
    const n = parseInt(document.getElementById('display').value);
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    document.getElementById('display').value = result;
    newNumber = true;
}

function ln() {
    const value = parseFloat(document.getElementById('display').value);
    document.getElementById('display').value = Math.log(value);
    newNumber = true;
}

function log() {
    const value = parseFloat(document.getElementById('display').value);
    document.getElementById('display').value = Math.log10(value);
    newNumber = true;
}

// 程序员计算器功能
document.querySelectorAll('input[name="numSystem"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentBase = parseInt(e.target.value);
        updateDisplay();
    });
});

function updateDisplay() {
    const display = document.getElementById('display');
    const value = parseInt(display.value, currentBase);
    display.value = value.toString(currentBase).toUpperCase();
}

function and() {
    const value = parseInt(document.getElementById('display').value, currentBase);
    lastNumber = value;
    lastOperation = '&';
    newNumber = true;
}

function or() {
    const value = parseInt(document.getElementById('display').value, currentBase);
    lastNumber = value;
    lastOperation = '|';
    newNumber = true;
}

function xor() {
    const value = parseInt(document.getElementById('display').value, currentBase);
    lastNumber = value;
    lastOperation = '^';
    newNumber = true;
}

function not() {
    const value = parseInt(document.getElementById('display').value, currentBase);
    document.getElementById('display').value = (~value).toString(currentBase).toUpperCase();
    newNumber = true;
}

function leftShift() {
    const value = parseInt(document.getElementById('display').value, currentBase);
    document.getElementById('display').value = (value << 1).toString(currentBase).toUpperCase();
    newNumber = true;
}

function rightShift() {
    const value = parseInt(document.getElementById('display').value, currentBase);
    document.getElementById('display').value = (value >> 1).toString(currentBase).toUpperCase();
    newNumber = true;
}

// 日期计算功能
function calculateDateDiff() {
    const date1 = new Date(document.getElementById('date1').value);
    const date2 = new Date(document.getElementById('date2').value);
    
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    document.getElementById('dateResult').textContent = 
        `相差 ${diffDays} 天`;
}

// 辅助函数
function formatResult(value) {
    if (Math.abs(value) < 0.000001 || Math.abs(value) > 999999999) {
        return value.toExponential(6);
    }
    return value.toFixed(6).replace(/\.?0+$/, '');
}

// 键盘支持
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if ((key >= '0' && key <= '9') || key === '.' || 
        key === '+' || key === '-' || key === '*' || key === '/' || 
        key === '(' || key === ')') {
        appendToDisplay(key);
    } else if (key === 'Enter' || key === '=') {
        calculateResult();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape') {
        clearAll();
    } else if (key === 'Delete') {
        clearEntry();
    }
});

// 转换器数据
const converterData = {
    currency: {
        units: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'HKD'],
        rates: {
            USD: 1,
            EUR: 0.85,
            GBP: 0.73,
            JPY: 110.0,
            CNY: 6.45,
            KRW: 1150,
            HKD: 7.78
        }
    },
    volume: {
        units: ['立方米', '立方厘米', '升', '毫升', '加仑', '夸脱', '品脱'],
        rates: {
            '立方米': 1,
            '立方厘米': 1000000,
            '升': 1000,
            '毫升': 1000000,
            '加仑': 264.172,
            '夸脱': 1056.69,
            '品脱': 2113.38
        }
    },
    // ... 其他转换器数据 ...
};

// 初始化转换器
function initConverter(type) {
    const container = document.querySelector(`.${type}-keypad .converter-container`);
    const template = document.querySelector('.converter-template').cloneNode(true);
    template.classList.remove('hidden');
    container.innerHTML = '';
    container.appendChild(template);

    const unitFrom = container.querySelector('.unit-from');
    const unitTo = container.querySelector('.unit-to');
    const valueFrom = container.querySelector('.value-from');
    const valueTo = container.querySelector('.value-to');
    const formula = container.querySelector('.conversion-formula');

    // 填充单位选择器
    converterData[type].units.forEach(unit => {
        unitFrom.add(new Option(unit, unit));
        unitTo.add(new Option(unit, unit));
    });

    // 设置默认值
    unitTo.selectedIndex = 1;

    // 添加事件监听器
    valueFrom.addEventListener('input', () => updateConversion(type));
    unitFrom.addEventListener('change', () => updateConversion(type));
    unitTo.addEventListener('change', () => updateConversion(type));

    // 初始转换
    updateConversion(type);
}

// 更新转换结果
function updateConversion(type) {
    const container = document.querySelector(`.${type}-keypad .converter-container`);
    const unitFrom = container.querySelector('.unit-from').value;
    const unitTo = container.querySelector('.unit-to').value;
    const valueFrom = parseFloat(container.querySelector('.value-from').value);
    const valueTo = container.querySelector('.value-to');
    const formula = container.querySelector('.conversion-formula');

    if (isNaN(valueFrom)) {
        valueTo.value = '';
        formula.textContent = '';
        return;
    }

    const rates = converterData[type].rates;
    const result = valueFrom * (rates[unitTo] / rates[unitFrom]);
    valueTo.value = formatResult(result);

    // 显示转换公式
    formula.textContent = `1 ${unitFrom} = ${formatResult(rates[unitTo] / rates[unitFrom])} ${unitTo}`;
}

// 获取实时汇率
async function updateExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        converterData.currency.rates = data.rates;
        
        // 如果当前是货币转换器，更新显示
        if (currentMode === 'currency') {
            updateConversion('currency');
        }
    } catch (error) {
        console.error('Failed to update exchange rates:', error);
    }
}

// 每小时更新一次汇率
setInterval(updateExchangeRates, 3600000);