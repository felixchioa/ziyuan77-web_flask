// 获取DOM元素
const celsius = document.getElementById('celsius');
const fahrenheit = document.getElementById('fahrenheit');
const kelvin = document.getElementById('kelvin');

// 转换函数
function celsiusToFahrenheit(c) {
    return (c * 9/5) + 32;
}

function celsiusToKelvin(c) {
    return c + 273.15;
}

function fahrenheitToCelsius(f) {
    return (f - 32) * 5/9;
}

function fahrenheitToKelvin(f) {
    return (f - 32) * 5/9 + 273.15;
}

function kelvinToCelsius(k) {
    return k - 273.15;
}

function kelvinToFahrenheit(k) {
    return (k - 273.15) * 9/5 + 32;
}

// 更新函数
function updateFromCelsius() {
    if (celsius.value === '') {
        fahrenheit.value = '';
        kelvin.value = '';
        return;
    }
    
    const c = parseFloat(celsius.value);
    fahrenheit.value = celsiusToFahrenheit(c).toFixed(2);
    kelvin.value = celsiusToKelvin(c).toFixed(2);
}

function updateFromFahrenheit() {
    if (fahrenheit.value === '') {
        celsius.value = '';
        kelvin.value = '';
        return;
    }
    
    const f = parseFloat(fahrenheit.value);
    celsius.value = fahrenheitToCelsius(f).toFixed(2);
    kelvin.value = fahrenheitToKelvin(f).toFixed(2);
}

function updateFromKelvin() {
    if (kelvin.value === '') {
        celsius.value = '';
        fahrenheit.value = '';
        return;
    }
    
    const k = parseFloat(kelvin.value);
    celsius.value = kelvinToCelsius(k).toFixed(2);
    fahrenheit.value = kelvinToFahrenheit(k).toFixed(2);
}

// 事件监听
celsius.addEventListener('input', updateFromCelsius);
fahrenheit.addEventListener('input', updateFromFahrenheit);
kelvin.addEventListener('input', updateFromKelvin);

// 输入验证
function validateInput(input) {
    const value = parseFloat(input.value);
    if (input === kelvin && value < 0) {
        input.value = 0;
        return;
    }
    if (input === celsius && value < -273.15) {
        input.value = -273.15;
        return;
    }
    if (input === fahrenheit && value < -459.67) {
        input.value = -459.67;
        return;
    }
}

celsius.addEventListener('change', () => validateInput(celsius));
fahrenheit.addEventListener('change', () => validateInput(fahrenheit));
kelvin.addEventListener('change', () => validateInput(kelvin)); 