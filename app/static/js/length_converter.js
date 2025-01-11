// 获取DOM元素
const meter = document.getElementById('meter');
const kilometer = document.getElementById('kilometer');
const centimeter = document.getElementById('centimeter');
const millimeter = document.getElementById('millimeter');
const mile = document.getElementById('mile');
const yard = document.getElementById('yard');
const foot = document.getElementById('foot');
const inch = document.getElementById('inch');

// 转换系数(相对于米)
const conversions = {
    kilometer: 0.001,
    centimeter: 100,
    millimeter: 1000,
    mile: 0.000621371,
    yard: 1.09361,
    foot: 3.28084,
    inch: 39.3701
};

// 更新所有输入框
function updateAll(value, source) {
    if (value === '') {
        clearAll();
        return;
    }
    
    const meters = toMeters(parseFloat(value), source);
    if (isNaN(meters)) return;
    
    // 更新所有输入框(除了源输入框)
    if (source !== 'meter') meter.value = meters.toFixed(6);
    if (source !== 'kilometer') kilometer.value = (meters * conversions.kilometer).toFixed(6);
    if (source !== 'centimeter') centimeter.value = (meters * conversions.centimeter).toFixed(6);
    if (source !== 'millimeter') millimeter.value = (meters * conversions.millimeter).toFixed(6);
    if (source !== 'mile') mile.value = (meters * conversions.mile).toFixed(6);
    if (source !== 'yard') yard.value = (meters * conversions.yard).toFixed(6);
    if (source !== 'foot') foot.value = (meters * conversions.foot).toFixed(6);
    if (source !== 'inch') inch.value = (meters * conversions.inch).toFixed(6);
}

// 转换为米
function toMeters(value, unit) {
    switch(unit) {
        case 'meter': return value;
        case 'kilometer': return value * 1000;
        case 'centimeter': return value / 100;
        case 'millimeter': return value / 1000;
        case 'mile': return value * 1609.344;
        case 'yard': return value * 0.9144;
        case 'foot': return value * 0.3048;
        case 'inch': return value * 0.0254;
        default: return NaN;
    }
}

// 清空所有输入框
function clearAll() {
    meter.value = '';
    kilometer.value = '';
    centimeter.value = '';
    millimeter.value = '';
    mile.value = '';
    yard.value = '';
    foot.value = '';
    inch.value = '';
}

// 添加事件监听
meter.addEventListener('input', (e) => updateAll(e.target.value, 'meter'));
kilometer.addEventListener('input', (e) => updateAll(e.target.value, 'kilometer'));
centimeter.addEventListener('input', (e) => updateAll(e.target.value, 'centimeter'));
millimeter.addEventListener('input', (e) => updateAll(e.target.value, 'millimeter'));
mile.addEventListener('input', (e) => updateAll(e.target.value, 'mile'));
yard.addEventListener('input', (e) => updateAll(e.target.value, 'yard'));
foot.addEventListener('input', (e) => updateAll(e.target.value, 'foot'));
inch.addEventListener('input', (e) => updateAll(e.target.value, 'inch'));

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
}

[meter, kilometer, centimeter, millimeter, mile, yard, foot, inch].forEach(input => {
    input.addEventListener('change', () => validateInput(input));
}); 