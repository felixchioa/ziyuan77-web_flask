// 获取DOM元素
const seconds = document.getElementById('seconds');
const minutes = document.getElementById('minutes');
const hours = document.getElementById('hours');
const days = document.getElementById('days');
const weeks = document.getElementById('weeks');
const months = document.getElementById('months');
const years = document.getElementById('years');
const milliseconds = document.getElementById('milliseconds');

// 转换系数(相对于秒)
const conversions = {
    'milliseconds': 1000,
    'minutes': 1/60,
    'hours': 1/3600,
    'days': 1/86400,
    'weeks': 1/604800,
    'months': 1/2629800,  // 按平均每月30.44天计算
    'years': 1/31557600   // 按平均每年365.25天计算
};

// 更新所有输入框
function updateAll(value, source) {
    if (value === '') {
        clearAll();
        return;
    }
    
    const secs = toSeconds(parseFloat(value), source);
    if (isNaN(secs)) return;
    
    // 更新所有输入框(除了源输入框)
    if (source !== 'seconds') seconds.value = secs.toFixed(6);
    if (source !== 'milliseconds') milliseconds.value = (secs * 1000).toFixed(6);
    if (source !== 'minutes') minutes.value = (secs / 60).toFixed(6);
    if (source !== 'hours') hours.value = (secs / 3600).toFixed(6);
    if (source !== 'days') days.value = (secs / 86400).toFixed(6);
    if (source !== 'weeks') weeks.value = (secs / 604800).toFixed(6);
    if (source !== 'months') months.value = (secs / 2629800).toFixed(6);
    if (source !== 'years') years.value = (secs / 31557600).toFixed(6);
}

// 转换为秒
function toSeconds(value, unit) {
    switch(unit) {
        case 'seconds': return value;
        case 'milliseconds': return value / 1000;
        case 'minutes': return value * 60;
        case 'hours': return value * 3600;
        case 'days': return value * 86400;
        case 'weeks': return value * 604800;
        case 'months': return value * 2629800;
        case 'years': return value * 31557600;
        default: return NaN;
    }
}

// 清空所有输入框
function clearAll() {
    seconds.value = '';
    milliseconds.value = '';
    minutes.value = '';
    hours.value = '';
    days.value = '';
    weeks.value = '';
    months.value = '';
    years.value = '';
}

// 添加事件监听
seconds.addEventListener('input', (e) => updateAll(e.target.value, 'seconds'));
milliseconds.addEventListener('input', (e) => updateAll(e.target.value, 'milliseconds'));
minutes.addEventListener('input', (e) => updateAll(e.target.value, 'minutes'));
hours.addEventListener('input', (e) => updateAll(e.target.value, 'hours'));
days.addEventListener('input', (e) => updateAll(e.target.value, 'days'));
weeks.addEventListener('input', (e) => updateAll(e.target.value, 'weeks'));
months.addEventListener('input', (e) => updateAll(e.target.value, 'months'));
years.addEventListener('input', (e) => updateAll(e.target.value, 'years'));

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) input.value = 0;
}

[seconds, milliseconds, minutes, hours, days, weeks, months, years].forEach(input => {
    input.addEventListener('change', () => validateInput(input));
}); 