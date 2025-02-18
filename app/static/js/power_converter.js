// 获取DOM元素
const watt = document.getElementById('watt');
const kilowatt = document.getElementById('kilowatt');
const megawatt = document.getElementById('megawatt');
const horsepower = document.getElementById('horsepower');
const joulePerSecond = document.getElementById('joule-per-second');
const btuPerHour = document.getElementById('btu-per-hour');
const caloriePerSecond = document.getElementById('calorie-per-second');
const kilocaloriePerHour = document.getElementById('kilocalorie-per-hour');

// 转换系数(相对于瓦特)
const conversions = {
    'kilowatt': 0.001,
    'megawatt': 0.000001,
    'horsepower': 1/745.7,
    'joule-per-second': 1,
    'btu-per-hour': 3.412142,
    'calorie-per-second': 0.239,
    'kilocalorie-per-hour': 0.860421
};

// 更新所有输入框
function updateAll(value, source) {
    if (value === '') {
        clearAll();
        return;
    }
    
    const w = toWatt(parseFloat(value), source);
    if (isNaN(w)) return;
    
    // 更新所有输入框(除了源输入框)
    if (source !== 'watt') watt.value = w.toFixed(6);
    if (source !== 'kilowatt') kilowatt.value = (w * conversions.kilowatt).toFixed(6);
    if (source !== 'megawatt') megawatt.value = (w * conversions.megawatt).toFixed(6);
    if (source !== 'horsepower') horsepower.value = (w * conversions.horsepower).toFixed(6);
    if (source !== 'joule-per-second') joulePerSecond.value = w.toFixed(6);
    if (source !== 'btu-per-hour') btuPerHour.value = (w * conversions['btu-per-hour']).toFixed(6);
    if (source !== 'calorie-per-second') caloriePerSecond.value = (w * conversions['calorie-per-second']).toFixed(6);
    if (source !== 'kilocalorie-per-hour') kilocaloriePerHour.value = (w * conversions['kilocalorie-per-hour']).toFixed(6);
}

// 转换为瓦特
function toWatt(value, unit) {
    switch(unit) {
        case 'watt': return value;
        case 'kilowatt': return value * 1000;
        case 'megawatt': return value * 1000000;
        case 'horsepower': return value * 745.7;
        case 'joule-per-second': return value;
        case 'btu-per-hour': return value / 3.412142;
        case 'calorie-per-second': return value / 0.239;
        case 'kilocalorie-per-hour': return value / 0.860421;
        default: return NaN;
    }
}

// 清空所有输入框
function clearAll() {
    watt.value = '';
    kilowatt.value = '';
    megawatt.value = '';
    horsepower.value = '';
    joulePerSecond.value = '';
    btuPerHour.value = '';
    caloriePerSecond.value = '';
    kilocaloriePerHour.value = '';
}

// 添加事件监听
watt.addEventListener('input', (e) => updateAll(e.target.value, 'watt'));
kilowatt.addEventListener('input', (e) => updateAll(e.target.value, 'kilowatt'));
megawatt.addEventListener('input', (e) => updateAll(e.target.value, 'megawatt'));
horsepower.addEventListener('input', (e) => updateAll(e.target.value, 'horsepower'));
joulePerSecond.addEventListener('input', (e) => updateAll(e.target.value, 'joule-per-second'));
btuPerHour.addEventListener('input', (e) => updateAll(e.target.value, 'btu-per-hour'));
caloriePerSecond.addEventListener('input', (e) => updateAll(e.target.value, 'calorie-per-second'));
kilocaloriePerHour.addEventListener('input', (e) => updateAll(e.target.value, 'kilocalorie-per-hour'));

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
}

[watt, kilowatt, megawatt, horsepower, joulePerSecond, btuPerHour, caloriePerSecond, kilocaloriePerHour].forEach(input => {
    input.addEventListener('change', () => validateInput(input));
}); 