// 计算日期差异
function calculateDateDiff() {
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        document.getElementById('diff-result').textContent = '请选择有效日期';
        return;
    }
    
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    const diffYears = Math.floor(diffMonths / 12);
    
    document.getElementById('diff-result').innerHTML = 
        `相差：${diffDays}天<br>` +
        `约${diffWeeks}周<br>` +
        `约${diffMonths}个月<br>` +
        `约${diffYears}年`;
}

// 日期加减计算
function calculateDateAdd() {
    const baseDate = new Date(document.getElementById('base-date').value);
    const value = parseInt(document.getElementById('add-value').value);
    const unit = document.getElementById('add-unit').value;
    
    if (isNaN(baseDate.getTime()) || isNaN(value)) {
        document.getElementById('add-result').textContent = '请输入有效数据';
        return;
    }
    
    const resultDate = new Date(baseDate);
    switch (unit) {
        case 'days':
            resultDate.setDate(resultDate.getDate() + value);
            break;
        case 'weeks':
            resultDate.setDate(resultDate.getDate() + value * 7);
            break;
        case 'months':
            resultDate.setMonth(resultDate.getMonth() + value);
            break;
        case 'years':
            resultDate.setFullYear(resultDate.getFullYear() + value);
            break;
    }
    
    document.getElementById('add-result').textContent = 
        `计算结果：${resultDate.toLocaleDateString()}`;
}

// 快速日期设置
function setQuickDate(type) {
    const today = new Date();
    const baseDate = document.getElementById('base-date');
    
    switch (type) {
        case 'today':
            baseDate.valueAsDate = today;
            break;
        case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            baseDate.valueAsDate = tomorrow;
            break;
        case 'nextWeek':
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            baseDate.valueAsDate = nextWeek;
            break;
        case 'nextMonth':
            const nextMonth = new Date(today);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            baseDate.valueAsDate = nextMonth;
            break;
        case 'nextYear':
            const nextYear = new Date(today);
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            baseDate.valueAsDate = nextYear;
            break;
    }
    
    calculateDateAdd();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认日期
    const today = new Date();
    document.getElementById('start-date').valueAsDate = today;
    document.getElementById('end-date').valueAsDate = today;
    document.getElementById('base-date').valueAsDate = today;
}); 