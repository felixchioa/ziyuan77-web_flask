// 颜色转换工具
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

// 生成调色板
function generatePalette() {
    const mainColor = document.getElementById('main-color').value;
    const harmony = document.querySelector('.harmony-buttons button.active').dataset.harmony;
    const shadesCount = parseInt(document.getElementById('shades-count').value);
    const lightnessRange = parseInt(document.getElementById('lightness-range').value);
    const saturationRange = parseInt(document.getElementById('saturation-range').value);

    const rgb = hexToRgb(mainColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let colors = [];

    switch (harmony) {
        case 'monochromatic':
            colors = generateMonochromatic(hsl, shadesCount, lightnessRange);
            break;
        case 'analogous':
            colors = generateAnalogous(hsl, shadesCount, saturationRange);
            break;
        case 'complementary':
            colors = generateComplementary(hsl, shadesCount);
            break;
        case 'triadic':
            colors = generateTriadic(hsl, shadesCount);
            break;
        case 'split-complementary':
            colors = generateSplitComplementary(hsl, shadesCount);
            break;
        case 'tetradic':
            colors = generateTetradic(hsl, shadesCount);
            break;
    }

    displayPalette(colors);
}

// 生成不同的色彩方案
function generateMonochromatic(hsl, count, range) {
    const colors = [];
    const step = range / (count - 1);
    
    for (let i = 0; i < count; i++) {
        colors.push({
            h: hsl.h,
            s: hsl.s,
            l: Math.min(100, Math.max(0, 50 - (range/2) + (step * i)))
        });
    }
    
    return colors;
}

function generateAnalogous(hsl, count, range) {
    const colors = [];
    const step = range / (count - 1);
    
    for (let i = 0; i < count; i++) {
        colors.push({
            h: (hsl.h + (step * i)) % 360,
            s: hsl.s,
            l: hsl.l
        });
    }
    
    return colors;
}

function generateComplementary(hsl, count) {
    const colors = [];
    const complementary = (hsl.h + 180) % 360;
    
    for (let i = 0; i < count; i++) {
        const ratio = i / (count - 1);
        colors.push({
            h: hsl.h + (ratio * (complementary - hsl.h)),
            s: hsl.s,
            l: hsl.l
        });
    }
    
    return colors;
}

// 显示调色板
function displayPalette(colors) {
    const palette = document.getElementById('generated-palette');
    palette.innerHTML = '';

    colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        const hslColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
        swatch.style.backgroundColor = hslColor;
        
        const code = document.createElement('div');
        code.className = 'color-code';
        code.textContent = hslColor;
        swatch.appendChild(code);
        
        swatch.addEventListener('click', () => {
            navigator.clipboard.writeText(hslColor);
            alert('颜色代码已复制到剪贴板');
        });
        
        palette.appendChild(swatch);
    });
}

// 保存调色板
function savePalette() {
    const palette = document.getElementById('generated-palette');
    const colors = Array.from(palette.children).map(swatch => swatch.style.backgroundColor);
    
    const savedPalette = document.createElement('div');
    savedPalette.className = 'saved-palette';
    
    const colorsDiv = document.createElement('div');
    colorsDiv.className = 'colors';
    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color';
        colorDiv.style.backgroundColor = color;
        colorsDiv.appendChild(colorDiv);
    });
    
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.innerHTML = `
        <button onclick="loadPalette(this.parentElement.parentElement)">加载</button>
        <button onclick="deletePalette(this.parentElement.parentElement)">删除</button>
    `;
    
    savedPalette.appendChild(colorsDiv);
    savedPalette.appendChild(actions);
    
    document.getElementById('saved-palettes-grid').appendChild(savedPalette);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认色彩方案
    document.querySelector('.harmony-buttons button[data-harmony="monochromatic"]').classList.add('active');
    
    // 添加色彩方案按钮事件
    document.querySelectorAll('.harmony-buttons button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.harmony-buttons button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            generatePalette();
        });
    });
    
    // 添加控件事件监听
    ['main-color', 'shades-count', 'lightness-range', 'saturation-range'].forEach(id => {
        document.getElementById(id).addEventListener('input', generatePalette);
    });
    
    // 初始生成调色板
    generatePalette();
    
    // 设置颜色混合器事件
    ['color1', 'color2', 'mix-ratio'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateMixedColor);
    });
    
    // 设置图片颜色提取器事件
    document.getElementById('image-input').addEventListener('change', extractColors);
}); 