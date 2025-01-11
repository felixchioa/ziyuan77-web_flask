// 获取DOM元素
const billAmount = document.getElementById('bill-amount');
const customTip = document.getElementById('custom-tip');
const peopleCount = document.getElementById('people-count');
const tipButtons = document.querySelectorAll('.tip-buttons button');
const tipPerPerson = document.getElementById('tip-per-person');
const totalPerPerson = document.getElementById('total-per-person');
const totalTip = document.getElementById('total-tip');
const totalAmount = document.getElementById('total-amount');
const resetBtn = document.getElementById('reset-btn');

// 当前选中的小费比例
let currentTipPercentage = 15;

// 添加事件监听
billAmount.addEventListener('input', calculate);
customTip.addEventListener('input', handleCustomTip);
peopleCount.addEventListener('input', calculate);
resetBtn.addEventListener('click', reset);

// 为小费按钮添加事件监听
tipButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 更新按钮状态
        tipButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // 清除自定义输入
        customTip.value = '';
        
        // 更新小费比例并计算
        currentTipPercentage = parseFloat(button.dataset.tip);
        calculate();
    });
});

// 处理自定义小费输入
function handleCustomTip() {
    const value = parseFloat(customTip.value);
    if (!isNaN(value) && value >= 0) {
        // 移除其他按钮的激活状态
        tipButtons.forEach(btn => btn.classList.remove('active'));
        
        // 更新小费比例并计算
        currentTipPercentage = value;
        calculate();
    }
}

// 计算小费和总额
function calculate() {
    // 获取输入值
    const bill = parseFloat(billAmount.value) || 0;
    const people = parseInt(peopleCount.value) || 1;
    
    // 计算金额
    const tipAmount = bill * (currentTipPercentage / 100);
    const total = bill + tipAmount;
    const tipPerPersonAmount = tipAmount / people;
    const totalPerPersonAmount = total / people;
    
    // 更新显示
    tipPerPerson.textContent = `¥${tipPerPersonAmount.toFixed(2)}`;
    totalPerPerson.textContent = `¥${totalPerPersonAmount.toFixed(2)}`;
    totalTip.textContent = `¥${tipAmount.toFixed(2)}`;
    totalAmount.textContent = `¥${total.toFixed(2)}`;
}

// 重置所有输入和结果
function reset() {
    // 重置输入
    billAmount.value = '';
    customTip.value = '';
    peopleCount.value = '1';
    
    // 重置小费按钮
    tipButtons.forEach(btn => btn.classList.remove('active'));
    tipButtons[1].classList.add('active'); // 选中15%
    currentTipPercentage = 15;
    
    // 重置结果显示
    tipPerPerson.textContent = '¥0.00';
    totalPerPerson.textContent = '¥0.00';
    totalTip.textContent = '¥0.00';
    totalAmount.textContent = '¥0.00';
}

// 初始计算
calculate(); 