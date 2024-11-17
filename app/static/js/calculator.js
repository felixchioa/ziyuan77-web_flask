// 基础功能
function appendToDisplay(value) {
    document.getElementById('display').value += value;
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

function calculateResult() {
    try {
        const result = eval(document.getElementById('display').value);
        document.getElementById('display').value = result;
    } catch (error) {
        alert('无效的表达式');
    }
}

// 切换功能
function toggleVisibility(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = element.style.display === 'none' || element.style.display === '' ? 'block' : 'none';
    }
}

function toggleAdvanced() { toggleVisibility('.advanced'); }
function toggleArea() { toggleVisibility('.area'); }
function toggleVolume() { toggleVisibility('.volume'); }
function toggleTemperature() { toggleVisibility('.temperature'); }
function toggleSpeed() { toggleVisibility('.speed'); }
function toggleTime() { toggleVisibility('.time'); }
function toggleWeight() { toggleVisibility('.weight'); }
function toggleLength() { toggleVisibility('.length'); }
function togglePower() { toggleVisibility('.power'); }
function togglePressure() { toggleVisibility('.pressure'); }
function toggleEnergy() { toggleVisibility('.energy'); }
function toggleData() { toggleVisibility('.data'); }

// 计算功能
function calculateArea() {
    const length = parseFloat(prompt("输入长度:"));
    const width = parseFloat(prompt("输入宽度:"));
    const area = length * width;
    alert(`面积: ${area}`);
}

function calculateVolume() {
    const length = parseFloat(prompt("输入长度:"));
    const width = parseFloat(prompt("输入宽度:"));
    const height = parseFloat(prompt("输入高度:"));
    const volume = length * width * height;
    alert(`体积: ${volume}`);
}

function convertTemperature() {
    const celsius = parseFloat(prompt("输入摄氏温度:"));
    const fahrenheit = (celsius * 9/5) + 32;
    alert(`华氏温度: ${fahrenheit}`);
}

function convertSpeed() {
    const kmh = parseFloat(prompt("输入速度 (km/h):"));
    const mph = kmh * 0.621371;
    alert(`速度 (mph): ${mph}`);
}

function convertTime() {
    const hours = parseFloat(prompt("输入小时:"));
    const minutes = hours * 60;
    alert(`分钟: ${minutes}`);
}

function convertWeight() {
    const kg = parseFloat(prompt("输入重量 (kg):"));
    const pounds = kg * 2.20462;
    alert(`重量 (pounds): ${pounds}`);
}

function convertLength() {
    const meters = parseFloat(prompt("输入长度 (m):"));
    const feet = meters * 3.28084;
    alert(`长度 (feet): ${feet}`);
}

function calculatePower() {
    const voltage = parseFloat(prompt("输入电压 (V):"));
    const current = parseFloat(prompt("输入电流 (A):"));
    const power = voltage * current;
    alert(`功率 (W): ${power}`);
}

function calculatePressure() {
    const force = parseFloat(prompt("输入力 (N):"));
    const area = parseFloat(prompt("输入面积 (m²):"));
    const pressure = force / area;
    alert(`压力 (Pa): ${pressure}`);
}

function calculateEnergy() {
    const mass = parseFloat(prompt("输入质量 (kg):"));
    const velocity = parseFloat(prompt("输入速度 (m/s):"));
    const energy = 0.5 * mass * velocity ** 2;
    alert(`能量 (J): ${energy}`);
}

function convertData() {
    const bytes = parseFloat(prompt("输入数据大小 (bytes):"));
    const kilobytes = bytes / 1024;
    alert(`数据大小 (KB): ${kilobytes}`);
}