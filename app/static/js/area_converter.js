// 获取DOM元素
const squareMeter = document.getElementById('square-meter');
const squareKilometer = document.getElementById('square-kilometer');
const squareCentimeter = document.getElementById('square-centimeter');
const squareMillimeter = document.getElementById('square-millimeter');
const hectare = document.getElementById('hectare');
const mu = document.getElementById('mu');
const squareMile = document.getElementById('square-mile');
const acre = document.getElementById('acre');

// 转换系数(相对于平方米)
const conversions = {
    'square-kilometer': 0.000001,
    'square-centimeter': 10000,
    'square-millimeter': 1000000,
    'hectare': 0.0001,
    'mu': 0.0015,
    'square-mile': 3.861e-7,
    'acre': 0.000247105
};

// 更新所有输入框
function updateAll(value, source) {
    if (value === '') {
        clearAll();
        return;
    }
    
    const squareMeters = toSquareMeters(parseFloat(value), source);
    if (isNaN(squareMeters)) return;
    
    // 更新所有输入框(除了源输入框)
    if (source !== 'square-meter') squareMeter.value = squareMeters.toFixed(6);
    if (source !== 'square-kilometer') squareKilometer.value = (squareMeters * conversions['square-kilometer']).toFixed(6);
    if (source !== 'square-centimeter') squareCentimeter.value = (squareMeters * conversions['square-centimeter']).toFixed(6);
    if (source !== 'square-millimeter') squareMillimeter.value = (squareMeters * conversions['square-millimeter']).toFixed(6);
    if (source !== 'hectare') hectare.value = (squareMeters * conversions.hectare).toFixed(6);
    if (source !== 'mu') mu.value = (squareMeters * conversions.mu).toFixed(6);
    if (source !== 'square-mile') squareMile.value = (squareMeters * conversions['square-mile']).toFixed(6);
    if (source !== 'acre') acre.value = (squareMeters * conversions.acre).toFixed(6);
}

// 转换为平方米
function toSquareMeters(value, unit) {
    switch(unit) {
        case 'square-meter': return value;
        case 'square-kilometer': return value * 1000000;
        case 'square-centimeter': return value / 10000;
        case 'square-millimeter': return value / 1000000;
        case 'hectare': return value * 10000;
        case 'mu': return value * 666.67;
        case 'square-mile': return value * 2589988.11;
        case 'acre': return value * 4046.86;
        default: return NaN;
    }
}

// 清空所有输入框
function clearAll() {
    squareMeter.value = '';
    squareKilometer.value = '';
    squareCentimeter.value = '';
    squareMillimeter.value = '';
    hectare.value = '';
    mu.value = '';
    squareMile.value = '';
    acre.value = '';
}

// 添加事件监听
squareMeter.addEventListener('input', (e) => updateAll(e.target.value, 'square-meter'));
squareKilometer.addEventListener('input', (e) => updateAll(e.target.value, 'square-kilometer'));
squareCentimeter.addEventListener('input', (e) => updateAll(e.target.value, 'square-centimeter'));
squareMillimeter.addEventListener('input', (e) => updateAll(e.target.value, 'square-millimeter'));
hectare.addEventListener('input', (e) => updateAll(e.target.value, 'hectare'));
mu.addEventListener('input', (e) => updateAll(e.target.value, 'mu'));
squareMile.addEventListener('input', (e) => updateAll(e.target.value, 'square-mile'));
acre.addEventListener('input', (e) => updateAll(e.target.value, 'acre'));

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
}

[squareMeter, squareKilometer, squareCentimeter, squareMillimeter, hectare, mu, squareMile, acre].forEach(input => {
    input.addEventListener('change', () => validateInput(input));
}); 