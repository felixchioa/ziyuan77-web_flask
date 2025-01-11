// 获取DOM元素
const height = document.getElementById('height');
const weight = document.getElementById('weight');
const calculateBtn = document.getElementById('calculate-btn');
const bmiNumber = document.getElementById('bmi-number');
const bmiCategory = document.getElementById('bmi-category');

// 添加事件监听
calculateBtn.addEventListener('click', calculateBMI);
height.addEventListener('input', validateInput);
weight.addEventListener('input', validateInput);

// 验证输入
function validateInput(e) {
    const value = parseFloat(e.target.value);
    if (value < 0) {
        e.target.value = 0;
    }
}

// 计算BMI
function calculateBMI() {
    // 获取输入值
    const heightValue = parseFloat(height.value);
    const weightValue = parseFloat(weight.value);
    
    // 验证输入
    if (!heightValue || !weightValue) {
        alert('请输入有效的身高和体重！');
        return;
    }
    
    // 计算BMI（身高需要转换为米）
    const heightInMeters = heightValue / 100;
    const bmi = weightValue / (heightInMeters * heightInMeters);
    
    // 更新显示
    bmiNumber.textContent = bmi.toFixed(1);
    
    // 确定BMI分类
    let category = '';
    let color = '';
    
    if (bmi < 18.5) {
        category = '体重过轻';
        color = '#ffc107';
    } else if (bmi < 25) {
        category = '体重正常';
        color = '#28a745';
    } else if (bmi < 30) {
        category = '体重过重';
        color = '#fd7e14';
    } else {
        category = '肥胖';
        color = '#dc3545';
    }
    
    bmiCategory.textContent = category;
    bmiCategory.style.color = color;
    bmiNumber.style.color = color;
}

// 初始化
function init() {
    // 如果有本地存储的值，则恢复
    const savedHeight = localStorage.getItem('bmi-height');
    const savedWeight = localStorage.getItem('bmi-weight');
    
    if (savedHeight) height.value = savedHeight;
    if (savedWeight) weight.value = savedWeight;
    
    if (savedHeight && savedWeight) {
        calculateBMI();
    }
}

// 保存输入值
function saveInput() {
    localStorage.setItem('bmi-height', height.value);
    localStorage.setItem('bmi-weight', weight.value);
}

// 添加保存功能
height.addEventListener('change', saveInput);
weight.addEventListener('change', saveInput);

// 初始化
init(); 