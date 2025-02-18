// Cron表达式描述映射
const cronDescriptions = {
    minute: {
        '*': '每分钟',
        '*/5': '每5分钟',
        '*/10': '每10分钟',
        '*/15': '每15分钟',
        '*/30': '每30分钟',
        '0': '每小时的第0分钟'
    },
    hour: {
        '*': '每小时',
        '*/2': '每2小时',
        '*/3': '每3小时',
        '*/4': '每4小时',
        '*/6': '每6小时',
        '*/12': '每12小时'
    },
    day: {
        '*': '每天',
        '*/2': '每2天',
        '*/7': '每7天',
        '1': '每月1号',
        '15': '每月15号',
        'L': '每月最后一天'
    },
    month: {
        '*': '每月',
        '*/3': '每3个月',
        '*/6': '每6个月',
        '1': '每年1月'
    },
    week: {
        '*': '每天',
        '1-5': '工作日',
        '6,0': '周末',
        '1': '周一'
    }
};

// 切换标签页
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${btn.dataset.tab}-tab`).style.display = 'block';
    });
});

// 处理自定义输入显示/隐藏
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', function() {
        const customInput = document.getElementById(`${this.id.split('-')[0]}-custom`);
        if (customInput) {
            customInput.style.display = this.value === 'custom' ? 'inline-block' : 'none';
        }
    });
});

// 生成Cron表达式
function generateCronExpression() {
    const parts = ['minute', 'hour', 'day', 'month', 'week'].map(part => {
        const select = document.getElementById(`${part}-select`);
        if (select.value === 'custom') {
            if (part === 'week') {
                const checked = Array.from(document.querySelectorAll('#week-custom input:checked'))
                    .map(input => input.value);
                return checked.length ? checked.join(',') : '*';
            } else {
                const customValue = document.getElementById(`${part}-custom`).value;
                return customValue || '*';
            }
        }
        return select.value;
    });

    return parts.join(' ');
}

// 更新表达式描述
function updateDescription(expression) {
    const parts = expression.split(' ');
    const fields = ['minute', 'hour', 'day', 'month', 'week'];
    let description = '';

    parts.forEach((part, index) => {
        const field = fields[index];
        const desc = cronDescriptions[field][part] || `${field}: ${part}`;
        description += `${desc}; `;
    });

    document.getElementById('cron-description').textContent = description;
}

// 计算下次执行时间
function calculateNextRuns(expression) {
    const list = document.getElementById('next-runs-list');
    list.innerHTML = '';

    let date = new Date();
    for (let i = 0; i < 5; i++) {
        date = getNextRunTime(expression, date);
        const li = document.createElement('li');
        li.textContent = date.toLocaleString();
        list.appendChild(li);
        date = new Date(date.getTime() + 60000); // 加一分钟
    }
}

// 获取下次执行时间（简化版）
function getNextRunTime(expression, fromDate) {
    const [minute, hour, day, month, week] = expression.split(' ');
    let date = new Date(fromDate);
    
    // 简单实现，仅供演示
    date.setSeconds(0);
    date.setMilliseconds(0);
    
    if (minute !== '*') {
        const nextMinute = parseInt(minute);
        if (date.getMinutes() >= nextMinute) {
            date.setHours(date.getHours() + 1);
        }
        date.setMinutes(nextMinute);
    }
    
    return date;
}

// 复制Cron表达式
function copyCron() {
    const expression = document.getElementById('cron-result').textContent;
    navigator.clipboard.writeText(expression)
        .then(() => alert('已复制到剪贴板'))
        .catch(err => alert('复制失败：' + err));
}

// 监听所有输入变化
function setupChangeListeners() {
    const inputs = [
        ...document.querySelectorAll('select'),
        ...document.querySelectorAll('input[type="number"]'),
        ...document.querySelectorAll('input[type="checkbox"]')
    ];

    inputs.forEach(input => {
        input.addEventListener('change', () => {
            const expression = generateCronExpression();
            document.getElementById('cron-result').textContent = expression;
            updateDescription(expression);
            calculateNextRuns(expression);
        });
    });

    // 监听高级模式输入
    document.getElementById('cron-input').addEventListener('input', function() {
        const expression = this.value || '* * * * *';
        document.getElementById('cron-result').textContent = expression;
        updateDescription(expression);
        calculateNextRuns(expression);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setupChangeListeners();
    const expression = generateCronExpression();
    document.getElementById('cron-result').textContent = expression;
    updateDescription(expression);
    calculateNextRuns(expression);
}); 