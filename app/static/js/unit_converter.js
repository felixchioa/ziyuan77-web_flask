// 单位定义
const units = {
    length: {
        m: { name: '米', base: 1 },
        km: { name: '千米', base: 1000 },
        cm: { name: '厘米', base: 0.01 },
        mm: { name: '毫米', base: 0.001 },
        in: { name: '英寸', base: 0.0254 },
        ft: { name: '英尺', base: 0.3048 },
        yd: { name: '码', base: 0.9144 },
        mi: { name: '英里', base: 1609.344 }
    },
    area: {
        m2: { name: '平方米', base: 1 },
        km2: { name: '平方千米', base: 1000000 },
        cm2: { name: '平方厘米', base: 0.0001 },
        ha: { name: '公顷', base: 10000 },
        acre: { name: '英亩', base: 4046.856 }
    },
    // ... 其他单位类别定义
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 类别切换事件
    document.getElementById('category').addEventListener('change', updateUnits);
    
    // 输入值变化事件
    document.getElementById('from-value').addEventListener('input', convert);
    document.getElementById('from-unit').addEventListener('change', convert);
    document.getElementById('to-unit').addEventListener('change', convert);
    
    // 初始化单位选择器
    updateUnits();
});

// 更新单位选择器
function updateUnits() {
    const category = document.getElementById('category').value;
    const fromSelect = document.getElementById('from-unit');
    const toSelect = document.getElementById('to-unit');
    
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    
    for (const [code, unit] of Object.entries(units[category])) {
        fromSelect.add(new Option(unit.name, code));
        toSelect.add(new Option(unit.name, code));
    }
    
    updateQuickConversions();
    convert();
}

// 转换计算
function convert() {
    const category = document.getElementById('category').value;
    const fromValue = parseFloat(document.getElementById('from-value').value) || 0;
    const fromUnit = document.getElementById('from-unit').value;
    const toUnit = document.getElementById('to-unit').value;
    
    const fromBase = units[category][fromUnit].base;
    const toBase = units[category][toUnit].base;
    
    const result = fromValue * fromBase / toBase;
    document.getElementById('to-value').value = result.toFixed(6);
}

// 交换单位
function swapUnits() {
    const fromUnit = document.getElementById('from-unit');
    const toUnit = document.getElementById('to-unit');
    const fromValue = document.getElementById('from-value');
    const toValue = document.getElementById('to-value');
    
    [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
    [fromValue.value, toValue.value] = [toValue.value, fromValue.value];
    
    convert();
}

// 更新常用换算
function updateQuickConversions() {
    const category = document.getElementById('category').value;
    const container = document.getElementById('quick-conversions');
    container.innerHTML = '';
    
    // 添加常用换算示例
    const examples = getCommonExamples(category);
    examples.forEach(example => {
        const div = document.createElement('div');
        div.className = 'quick-conversion';
        div.textContent = example;
        container.appendChild(div);
    });
}

// 获取常用换算示例
function getCommonExamples(category) {
    const examples = {
        length: [
            '1米 = 100厘米',
            '1千米 = 1000米',
            '1英里 ≈ 1.609千米',
            '1英尺 = 12英寸'
        ],
        area: [
            '1平方米 = 10000平方厘米',
            '1公顷 = 10000平方米',
            '1平方千米 = 100公顷'
        ]
        // ... 其他类别的示例
    };
    
    return examples[category] || [];
} 