// 初始化变量
let currentColor = {
    h: 0,
    s: 100,
    l: 50,
    a: 100
};

let customPalette = [];

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    initializeControls();
    updateColor();
    loadCustomPalette();
});

// 初始化控件
function initializeControls() {
    // HSL 滑块
    ['hue', 'saturation', 'lightness', 'alpha'].forEach(control => {
        const slider = document.getElementById(`${control}-slider`);
        const input = document.getElementById(`${control}-input`);
        
        slider.addEventListener('input', (e) => {
            input.value = e.target.value;
            currentColor[control[0]] = parseFloat(e.target.value);
            updateColor();
        });
        
        input.addEventListener('input', (e) => {
            slider.value = e.target.value;
            currentColor[control[0]] = parseFloat(e.target.value);
            updateColor();
        });
    });
    
    // 颜色值输入框
    document.getElementById('hex-value').addEventListener('input', handleHexInput);
    document.getElementById('rgb-value').addEventListener('input', handleRGBInput);
    document.getElementById('hsl-value').addEventListener('input', handleHSLInput);
    
    // 工具按钮
    document.getElementById('copy-color').addEventListener('click', copyCurrentColor);
    document.getElementById('random-color').addEventListener('click', generateRandomColor);
    document.getElementById('invert-color').addEventListener('click', invertColor);
    document.getElementById('add-to-palette').addEventListener('click', addToPalette);
    
    // 和谐色按钮
    document.querySelectorAll('.harmony-options button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.harmony-options .active').classList.remove('active');
            e.target.classList.add('active');
            updateHarmonyColors(e.target.dataset.harmony);
        });
    });
    
    // 渐变生成器
    document.getElementById('gradient-generator').addEventListener('click', toggleGradientSection);
    document.getElementById('gradient-type').addEventListener('change', updateGradient);
    document.getElementById('gradient-angle').addEventListener('input', updateGradient);
    document.getElementById('add-gradient-color').addEventListener('click', addGradientColor);
}

// 更新颜色显示
function updateColor() {
    const preview = document.getElementById('color-preview');
    const color = `hsla(${currentColor.h}, ${currentColor.s}%, ${currentColor.l}%, ${currentColor.a / 100})`;
    preview.style.backgroundColor = color;
    
    updateColorValues();
    updateHarmonyColors(document.querySelector('.harmony-options .active').dataset.harmony);
}

// 更新颜色值显示
function updateColorValues() {
    const rgb = hslToRgb(currentColor.h, currentColor.s, currentColor.l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    
    document.getElementById('hex-value').value = hex;
    document.getElementById('rgb-value').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById('hsl-value').value = 
        `hsl(${currentColor.h}, ${currentColor.s}%, ${currentColor.l}%)`;
    document.getElementById('cmyk-value').value = 
        `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
}

// 颜色转换函数
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
        r: Math.round(255 * f(0)),
        g: Math.round(255 * f(8)),
        b: Math.round(255 * f(4))
    };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    
    c = ((c - k) / (1 - k)) * 100;
    m = ((m - k) / (1 - k)) * 100;
    y = ((y - k) / (1 - k)) * 100;
    k = k * 100;
    
    return {
        c: Math.round(c),
        m: Math.round(m),
        y: Math.round(y),
        k: Math.round(k)
    };
}

// 颜色和谐函数
function updateHarmonyColors(type) {
    const colors = [];
    const h = currentColor.h;
    
    switch (type) {
        case 'complementary':
            colors.push(h, (h + 180) % 360);
            break;
        case 'analogous':
            colors.push((h - 30 + 360) % 360, h, (h + 30) % 360);
            break;
        case 'triadic':
            colors.push(h, (h + 120) % 360, (h + 240) % 360);
            break;
        case 'split-complementary':
            colors.push(h, (h + 150) % 360, (h + 210) % 360);
            break;
        case 'tetradic':
            colors.push(h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360);
            break;
    }
    
    const container = document.getElementById('harmony-colors');
    container.innerHTML = colors.map(h => `
        <div class="harmony-color" style="background-color: hsl(${h}, ${currentColor.s}%, ${currentColor.l}%)"></div>
    `).join('');
}

// 工具函数
function copyCurrentColor() {
    const hex = document.getElementById('hex-value').value;
    navigator.clipboard.writeText(hex)
        .then(() => alert('颜色代码已复制到剪贴板'))
        .catch(err => console.error('复制失败:', err));
}

function generateRandomColor() {
    currentColor.h = Math.floor(Math.random() * 360);
    currentColor.s = Math.floor(Math.random() * 100);
    currentColor.l = Math.floor(Math.random() * 100);
    
    updateSliders();
    updateColor();
}

function invertColor() {
    currentColor.h = (currentColor.h + 180) % 360;
    currentColor.s = 100 - currentColor.s;
    currentColor.l = 100 - currentColor.l;
    
    updateSliders();
    updateColor();
}

function updateSliders() {
    document.getElementById('hue-slider').value = currentColor.h;
    document.getElementById('hue-input').value = currentColor.h;
    document.getElementById('saturation-slider').value = currentColor.s;
    document.getElementById('saturation-input').value = currentColor.s;
    document.getElementById('lightness-slider').value = currentColor.l;
    document.getElementById('lightness-input').value = currentColor.l;
}

// 调色板功能
function addToPalette() {
    const color = document.getElementById('hex-value').value;
    if (!customPalette.includes(color)) {
        customPalette.push(color);
        if (customPalette.length > 32) {
            customPalette.shift();
        }
        saveCustomPalette();
        updatePaletteDisplay();
    }
}

function loadCustomPalette() {
    const saved = localStorage.getItem('customPalette');
    if (saved) {
        customPalette = JSON.parse(saved);
        updatePaletteDisplay();
    }
}

function saveCustomPalette() {
    localStorage.setItem('customPalette', JSON.stringify(customPalette));
}

function updatePaletteDisplay() {
    const container = document.getElementById('custom-palette');
    container.innerHTML = customPalette.map(color => `
        <div class="palette-color" 
             style="background-color: ${color}"
             onclick="loadPaletteColor('${color}')">
        </div>
    `).join('');
}

function loadPaletteColor(color) {
    // 将十六进制颜色转换为 HSL
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    currentColor.h = hsl.h;
    currentColor.s = hsl.s;
    currentColor.l = hsl.l;
    
    updateSliders();
    updateColor();
} 