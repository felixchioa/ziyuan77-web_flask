// 获取DOM元素
const metersPerSecond = document.getElementById('meters-per-second');
const kilometersPerHour = document.getElementById('kilometers-per-hour');
const milesPerHour = document.getElementById('miles-per-hour');
const knots = document.getElementById('knots');
const mach = document.getElementById('mach');
const feetPerSecond = document.getElementById('feet-per-second');

// 转换系数(相对于米/秒)
const conversions = {
    'kilometers-per-hour': 3.6,
    'miles-per-hour': 2.23694,
    'knots': 1.94384,
    'mach': 0.00294,
    'feet-per-second': 3.28084
};

// 更新所有输入框
function updateAll(value, source) {
    if (value === '') {
        clearAll();
        return;
    }
    
    const mps = toMetersPerSecond(parseFloat(value), source);
    if (isNaN(mps)) return;
    
    // 更新所有输入框(除了源输入框)
    if (source !== 'meters-per-second') metersPerSecond.value = mps.toFixed(6);
    if (source !== 'kilometers-per-hour') kilometersPerHour.value = (mps * conversions['kilometers-per-hour']).toFixed(6);
    if (source !== 'miles-per-hour') milesPerHour.value = (mps * conversions['miles-per-hour']).toFixed(6);
    if (source !== 'knots') knots.value = (mps * conversions.knots).toFixed(6);
    if (source !== 'mach') mach.value = (mps * conversions.mach).toFixed(6);
    if (source !== 'feet-per-second') feetPerSecond.value = (mps * conversions['feet-per-second']).toFixed(6);
}

// 转换为米/秒
function toMetersPerSecond(value, unit) {
    switch(unit) {
        case 'meters-per-second': return value;
        case 'kilometers-per-hour': return value / 3.6;
        case 'miles-per-hour': return value / 2.23694;
        case 'knots': return value / 1.94384;
        case 'mach': return value * 340.3;
        case 'feet-per-second': return value / 3.28084;
        default: return NaN;
    }
}

// 清空所有输入框
function clearAll() {
    metersPerSecond.value = '';
    kilometersPerHour.value = '';
    milesPerHour.value = '';
    knots.value = '';
    mach.value = '';
    feetPerSecond.value = '';
}

// 添加事件监听
metersPerSecond.addEventListener('input', (e) => updateAll(e.target.value, 'meters-per-second'));
kilometersPerHour.addEventListener('input', (e) => updateAll(e.target.value, 'kilometers-per-hour'));
milesPerHour.addEventListener('input', (e) => updateAll(e.target.value, 'miles-per-hour'));
knots.addEventListener('input', (e) => updateAll(e.target.value, 'knots'));
mach.addEventListener('input', (e) => updateAll(e.target.value, 'mach'));
feetPerSecond.addEventListener('input', (e) => updateAll(e.target.value, 'feet-per-second'));

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
}

[metersPerSecond, kilometersPerHour, milesPerHour, knots, mach, feetPerSecond].forEach(input => {
    input.addEventListener('change', () => validateInput(input));
}); 