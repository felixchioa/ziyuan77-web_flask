// 获取DOM元素
const degrees = document.getElementById('degrees');
const radians = document.getElementById('radians');
const gradians = document.getElementById('gradians');
const piRadians = document.getElementById('pi-radians');
const turns = document.getElementById('turns');
const minutes = document.getElementById('minutes');
const seconds = document.getElementById('seconds');

// 转换系数(相对于度)
const conversions = {
    'radians': Math.PI/180,
    'gradians': 10/9,
    'pi-radians': Math.PI/180,
    'turns': 1/360,
    'minutes': 60,
    'seconds': 3600
};

// 更新所有输入框
function updateAll(value, source) {
    if (value === '') {
        clearAll();
        return;
    }
    
    const deg = toDegrees(parseFloat(value), source);
    if (isNaN(deg)) return;
    
    // 更新所有输入框(除了源输入框)
    if (source !== 'degrees') degrees.value = deg.toFixed(6);
    if (source !== 'radians') radians.value = (deg * Math.PI / 180).toFixed(6);
    if (source !== 'gradians') gradians.value = (deg * 10 / 9).toFixed(6);
    if (source !== 'pi-radians') piRadians.value = (deg / 180).toFixed(6);
    if (source !== 'turns') turns.value = (deg / 360).toFixed(6);
    if (source !== 'minutes') minutes.value = (deg * 60).toFixed(6);
    if (source !== 'seconds') seconds.value = (deg * 3600).toFixed(6);
}

// 转换为度
function toDegrees(value, unit) {
    switch(unit) {
        case 'degrees': return value;
        case 'radians': return value * 180 / Math.PI;
        case 'gradians': return value * 0.9;
        case 'pi-radians': return value * 180;
        case 'turns': return value * 360;
        case 'minutes': return value / 60;
        case 'seconds': return value / 3600;
        default: return NaN;
    }
}

// 清空所有输入框
function clearAll() {
    degrees.value = '';
    radians.value = '';
    gradians.value = '';
    piRadians.value = '';
    turns.value = '';
    minutes.value = '';
    seconds.value = '';
}

// 添加事件监听
degrees.addEventListener('input', (e) => updateAll(e.target.value, 'degrees'));
radians.addEventListener('input', (e) => updateAll(e.target.value, 'radians'));
gradians.addEventListener('input', (e) => updateAll(e.target.value, 'gradians'));
piRadians.addEventListener('input', (e) => updateAll(e.target.value, 'pi-radians'));
turns.addEventListener('input', (e) => updateAll(e.target.value, 'turns'));
minutes.addEventListener('input', (e) => updateAll(e.target.value, 'minutes'));
seconds.addEventListener('input', (e) => updateAll(e.target.value, 'seconds'));

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
}

[degrees, radians, gradians, piRadians, turns, minutes, seconds].forEach(input => {
    input.addEventListener('change', () => validateInput(input));
}); 