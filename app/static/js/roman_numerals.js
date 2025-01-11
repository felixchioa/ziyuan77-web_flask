// 罗马数字映射表
const romanNumerals = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
};

// 获取DOM元素
const arabicInput = document.getElementById('arabic-input');
const romanInput = document.getElementById('roman-input');
const toRomanBtn = document.getElementById('to-roman');
const toArabicBtn = document.getElementById('to-arabic');
const result = document.getElementById('result');

// 阿拉伯数字转罗马数字
function toRoman() {
    let num = parseInt(arabicInput.value);
    
    // 验证输入
    if (isNaN(num) || num < 1 || num > 3999) {
        showError('请输入1-3999之间的数字');
        return;
    }
    
    let roman = '';
    
    for (let key in romanNumerals) {
        while (num >= romanNumerals[key]) {
            roman += key;
            num -= romanNumerals[key];
        }
    }
    
    showResult(roman);
}

// 罗马数字转阿拉伯数字
function toArabic() {
    const roman = romanInput.value.toUpperCase();
    
    // 验证输入
    if (!isValidRoman(roman)) {
        showError('请输入有效的罗马数字');
        return;
    }
    
    let num = 0;
    let prev = 0;
    
    for (let i = roman.length - 1; i >= 0; i--) {
        const current = romanNumerals[roman[i]];
        
        if (current >= prev) {
            num += current;
        } else {
            num -= current;
        }
        
        prev = current;
    }
    
    showResult(num);
}

// 验证罗马数字
function isValidRoman(str) {
    const pattern = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
    return pattern.test(str);
}

// 显示结果
function showResult(value) {
    result.textContent = value;
    result.style.color = '#28a745';
}

// 显示错误
function showError(message) {
    result.textContent = message;
    result.style.color = '#dc3545';
}

// 事件监听
toRomanBtn.addEventListener('click', toRoman);
toArabicBtn.addEventListener('click', toArabic);

// 输入验证
arabicInput.addEventListener('input', () => {
    const value = parseInt(arabicInput.value);
    if (value > 3999) {
        arabicInput.value = 3999;
    }
});

romanInput.addEventListener('input', () => {
    romanInput.value = romanInput.value.toUpperCase();
}); 