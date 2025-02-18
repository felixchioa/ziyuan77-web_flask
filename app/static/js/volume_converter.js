// 获取DOM元素
const cubicMeter = document.getElementById('cubic-meter');
const cubicCentimeter = document.getElementById('cubic-centimeter');
const cubicMillimeter = document.getElementById('cubic-millimeter');
const liter = document.getElementById('liter');
const milliliter = document.getElementById('milliliter');
const gallon = document.getElementById('gallon');
const quart = document.getElementById('quart');
const pint = document.getElementById('pint');

// 转换系数(相对于立方米)
const conversions = {
    'cubic-centimeter': 1000000,
    'cubic-millimeter': 1000000000,
    'liter': 1000,
    'milliliter': 1000000,
    'gallon': 264.172,
    'quart': 1056.69,
    'pint': 2113.38
};

// 更新所有输入框
function updateAll(value, source) {
    if (value === '') {
        clearAll();
        return;
    }
    
    const cubicMeters = toCubicMeters(parseFloat(value), source);
    if (isNaN(cubicMeters)) return;
    
    // 更新所有输入框(除了源输入框)
    if (source !== 'cubic-meter') cubicMeter.value = cubicMeters.toFixed(6);
    if (source !== 'cubic-centimeter') cubicCentimeter.value = (cubicMeters * conversions['cubic-centimeter']).toFixed(6);
    if (source !== 'cubic-millimeter') cubicMillimeter.value = (cubicMeters * conversions['cubic-millimeter']).toFixed(6);
    if (source !== 'liter') liter.value = (cubicMeters * conversions.liter).toFixed(6);
    if (source !== 'milliliter') milliliter.value = (cubicMeters * conversions.milliliter).toFixed(6);
    if (source !== 'gallon') gallon.value = (cubicMeters * conversions.gallon).toFixed(6);
    if (source !== 'quart') quart.value = (cubicMeters * conversions.quart).toFixed(6);
    if (source !== 'pint') pint.value = (cubicMeters * conversions.pint).toFixed(6);
}

// 转换为立方米
function toCubicMeters(value, unit) {
    switch(unit) {
        case 'cubic-meter': return value;
        case 'cubic-centimeter': return value / 1000000;
        case 'cubic-millimeter': return value / 1000000000;
        case 'liter': return value / 1000;
        case 'milliliter': return value / 1000000;
        case 'gallon': return value / 264.172;
        case 'quart': return value / 1056.69;
        case 'pint': return value / 2113.38;
        default: return NaN;
    }
}

// 清空所有输入框
function clearAll() {
    cubicMeter.value = '';
    cubicCentimeter.value = '';
    cubicMillimeter.value = '';
    liter.value = '';
    milliliter.value = '';
    gallon.value = '';
    quart.value = '';
    pint.value = '';
}

// 添加事件监听
cubicMeter.addEventListener('input', (e) => updateAll(e.target.value, 'cubic-meter'));
cubicCentimeter.addEventListener('input', (e) => updateAll(e.target.value, 'cubic-centimeter'));
cubicMillimeter.addEventListener('input', (e) => updateAll(e.target.value, 'cubic-millimeter'));
liter.addEventListener('input', (e) => updateAll(e.target.value, 'liter'));
milliliter.addEventListener('input', (e) => updateAll(e.target.value, 'milliliter'));
gallon.addEventListener('input', (e) => updateAll(e.target.value, 'gallon'));
quart.addEventListener('input', (e) => updateAll(e.target.value, 'quart'));
pint.addEventListener('input', (e) => updateAll(e.target.value, 'pint'));

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
}

[cubicMeter, cubicCentimeter, cubicMillimeter, liter, milliliter, gallon, quart, pint].forEach(input => {
    input.addEventListener('change', () => validateInput(input));
}); 