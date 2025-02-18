// 获取DOM元素
const kilogram = document.getElementById('kilogram');
const gram = document.getElementById('gram');
const milligram = document.getElementById('milligram');
const pound = document.getElementById('pound');
const ounce = document.getElementById('ounce');
const ton = document.getElementById('ton');

// 转换系数(相对于千克)
const conversions = {
    gram: 1000,
    milligram: 1000000,
    pound: 2.20462,
    ounce: 35.274,
    ton: 0.001
};

// 更新所有输入框
function updateAll(value, source) {
    if (value === '') {
        clearAll();
        return;
    }
    
    const kilograms = toKilograms(parseFloat(value), source);
    if (isNaN(kilograms)) return;
    
    // 更新所有输入框(除了源输入框)
    if (source !== 'kilogram') kilogram.value = kilograms.toFixed(6);
    if (source !== 'gram') gram.value = (kilograms * conversions.gram).toFixed(6);
    if (source !== 'milligram') milligram.value = (kilograms * conversions.milligram).toFixed(6);
    if (source !== 'pound') pound.value = (kilograms * conversions.pound).toFixed(6);
    if (source !== 'ounce') ounce.value = (kilograms * conversions.ounce).toFixed(6);
    if (source !== 'ton') ton.value = (kilograms * conversions.ton).toFixed(6);
}

// 转换为千克
function toKilograms(value, unit) {
    switch(unit) {
        case 'kilogram': return value;
        case 'gram': return value / 1000;
        case 'milligram': return value / 1000000;
        case 'pound': return value / 2.20462;
        case 'ounce': return value / 35.274;
        case 'ton': return value * 1000;
        default: return NaN;
    }
}

// 清空所有输入框
function clearAll() {
    kilogram.value = '';
    gram.value = '';
    milligram.value = '';
    pound.value = '';
    ounce.value = '';
    ton.value = '';
}

// 添加事件监听
kilogram.addEventListener('input', (e) => updateAll(e.target.value, 'kilogram'));
gram.addEventListener('input', (e) => updateAll(e.target.value, 'gram'));
milligram.addEventListener('input', (e) => updateAll(e.target.value, 'milligram'));
pound.addEventListener('input', (e) => updateAll(e.target.value, 'pound'));
ounce.addEventListener('input', (e) => updateAll(e.target.value, 'ounce'));
ton.addEventListener('input', (e) => updateAll(e.target.value, 'ton'));

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
}

[kilogram, gram, milligram, pound, ounce, ton].forEach(input => {
    input.addEventListener('change', () => validateInput(input));
}); 