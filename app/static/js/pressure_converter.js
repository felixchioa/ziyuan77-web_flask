// 获取DOM元素
const pascal = document.getElementById('pascal');
const kilopascal = document.getElementById('kilopascal');
const megapascal = document.getElementById('megapascal');
const atmosphere = document.getElementById('atmosphere');
const bar = document.getElementById('bar');
const millibar = document.getElementById('millibar');
const psi = document.getElementById('psi');
const mmhg = document.getElementById('mmhg');

// 转换系数(相对于帕斯卡)
const conversions = {
    'kilopascal': 0.001,
    'megapascal': 0.000001,
    'atmosphere': 1/101325,
    'bar': 0.00001,
    'millibar': 0.01,
    'psi': 1/6894.76,
    'mmhg': 1/133.322
};

// 更新所有输入框
function updateAll(value, source) {
    if (value === '') {
        clearAll();
        return;
    }
    
    const pa = toPascal(parseFloat(value), source);
    if (isNaN(pa)) return;
    
    // 更新所有输入框(除了源输入框)
    if (source !== 'pascal') pascal.value = pa.toFixed(6);
    if (source !== 'kilopascal') kilopascal.value = (pa * conversions.kilopascal).toFixed(6);
    if (source !== 'megapascal') megapascal.value = (pa * conversions.megapascal).toFixed(6);
    if (source !== 'atmosphere') atmosphere.value = (pa * conversions.atmosphere).toFixed(6);
    if (source !== 'bar') bar.value = (pa * conversions.bar).toFixed(6);
    if (source !== 'millibar') millibar.value = (pa * conversions.millibar).toFixed(6);
    if (source !== 'psi') psi.value = (pa * conversions.psi).toFixed(6);
    if (source !== 'mmhg') mmhg.value = (pa * conversions.mmhg).toFixed(6);
}

// 转换为帕斯卡
function toPascal(value, unit) {
    switch(unit) {
        case 'pascal': return value;
        case 'kilopascal': return value * 1000;
        case 'megapascal': return value * 1000000;
        case 'atmosphere': return value * 101325;
        case 'bar': return value * 100000;
        case 'millibar': return value * 100;
        case 'psi': return value * 6894.76;
        case 'mmhg': return value * 133.322;
        default: return NaN;
    }
}

// 清空所有输入框
function clearAll() {
    pascal.value = '';
    kilopascal.value = '';
    megapascal.value = '';
    atmosphere.value = '';
    bar.value = '';
    millibar.value = '';
    psi.value = '';
    mmhg.value = '';
}

// 添加事件监听
pascal.addEventListener('input', (e) => updateAll(e.target.value, 'pascal'));
kilopascal.addEventListener('input', (e) => updateAll(e.target.value, 'kilopascal'));
megapascal.addEventListener('input', (e) => updateAll(e.target.value, 'megapascal'));
atmosphere.addEventListener('input', (e) => updateAll(e.target.value, 'atmosphere'));
bar.addEventListener('input', (e) => updateAll(e.target.value, 'bar'));
millibar.addEventListener('input', (e) => updateAll(e.target.value, 'millibar'));
psi.addEventListener('input', (e) => updateAll(e.target.value, 'psi'));
mmhg.addEventListener('input', (e) => updateAll(e.target.value, 'mmhg'));

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
}

[pascal, kilopascal, megapascal, atmosphere, bar, millibar, psi, mmhg].forEach(input => {
    input.addEventListener('change', () => validateInput(input));
}); 