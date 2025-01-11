// 获取DOM元素
const joule = document.getElementById('joule');
const kilojoule = document.getElementById('kilojoule');
const calorie = document.getElementById('calorie');
const kilocalorie = document.getElementById('kilocalorie');
const wattHour = document.getElementById('watt-hour');
const kilowattHour = document.getElementById('kilowatt-hour');
const electronVolt = document.getElementById('electron-volt');
const btu = document.getElementById('btu');

// 转换系数(相对于焦耳)
const conversions = {
    'kilojoule': 0.001,
    'calorie': 1/4.184,
    'kilocalorie': 1/4184,
    'watt-hour': 1/3600,
    'kilowatt-hour': 1/3600000,
    'electron-volt': 6.242e18,
    'btu': 1/1055.06
};

// 更新所有输入框
function updateAll(value, source) {
    if (value === '') {
        clearAll();
        return;
    }
    
    const j = toJoule(parseFloat(value), source);
    if (isNaN(j)) return;
    
    // 更新所有输入框(除了源输入框)
    if (source !== 'joule') joule.value = j.toFixed(6);
    if (source !== 'kilojoule') kilojoule.value = (j * conversions.kilojoule).toFixed(6);
    if (source !== 'calorie') calorie.value = (j * conversions.calorie).toFixed(6);
    if (source !== 'kilocalorie') kilocalorie.value = (j * conversions.kilocalorie).toFixed(6);
    if (source !== 'watt-hour') wattHour.value = (j * conversions['watt-hour']).toFixed(6);
    if (source !== 'kilowatt-hour') kilowattHour.value = (j * conversions['kilowatt-hour']).toFixed(6);
    if (source !== 'electron-volt') electronVolt.value = (j * conversions['electron-volt']).toFixed(0);
    if (source !== 'btu') btu.value = (j * conversions.btu).toFixed(6);
}

// 转换为焦耳
function toJoule(value, unit) {
    switch(unit) {
        case 'joule': return value;
        case 'kilojoule': return value * 1000;
        case 'calorie': return value * 4.184;
        case 'kilocalorie': return value * 4184;
        case 'watt-hour': return value * 3600;
        case 'kilowatt-hour': return value * 3600000;
        case 'electron-volt': return value * 1.602176634e-19;
        case 'btu': return value * 1055.06;
        default: return NaN;
    }
}

// 清空所有输入框
function clearAll() {
    joule.value = '';
    kilojoule.value = '';
    calorie.value = '';
    kilocalorie.value = '';
    wattHour.value = '';
    kilowattHour.value = '';
    electronVolt.value = '';
    btu.value = '';
}

// 添加事件监听
joule.addEventListener('input', (e) => updateAll(e.target.value, 'joule'));
kilojoule.addEventListener('input', (e) => updateAll(e.target.value, 'kilojoule'));
calorie.addEventListener('input', (e) => updateAll(e.target.value, 'calorie'));
kilocalorie.addEventListener('input', (e) => updateAll(e.target.value, 'kilocalorie'));
wattHour.addEventListener('input', (e) => updateAll(e.target.value, 'watt-hour'));
kilowattHour.addEventListener('input', (e) => updateAll(e.target.value, 'kilowatt-hour'));
electronVolt.addEventListener('input', (e) => updateAll(e.target.value, 'electron-volt'));
btu.addEventListener('input', (e) => updateAll(e.target.value, 'btu'));

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
}

[joule, kilojoule, calorie, kilocalorie, wattHour, kilowattHour, electronVolt, btu].forEach(input => {
    input.addEventListener('change', () => validateInput(input));
}); 