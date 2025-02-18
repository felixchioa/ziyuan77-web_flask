// 正则表达式解释器
const regexExplanations = {
    '^': '匹配字符串开始位置',
    '$': '匹配字符串结束位置',
    '\\d': '匹配任意数字',
    '\\D': '匹配任意非数字',
    '\\w': '匹配字母、数字、下划线',
    '\\W': '匹配非字母、数字、下划线',
    '\\s': '匹配任意空白字符',
    '\\S': '匹配任意非空白字符',
    '.': '匹配除换行符外的任意字符',
    '*': '匹配前面的表达式0次或多次',
    '+': '匹配前面的表达式1次或多次',
    '?': '匹配前面的表达式0次或1次',
    '{n}': '匹配前面的表达式恰好n次',
    '{n,}': '匹配前面的表达式至少n次',
    '{n,m}': '匹配前面的表达式n到m次',
    '[]': '匹配方括号内的任意字符',
    '[^]': '匹配除方括号内的任意字符',
    '|': '匹配|前或后的表达式',
    '()': '捕获组',
    '(?:)': '非捕获组'
};

// 更新正则表达式解释
function updateExplanation(regex) {
    const explanation = document.getElementById('regex-explanation');
    let html = '<ul>';
    
    for (const [pattern, desc] of Object.entries(regexExplanations)) {
        if (regex.includes(pattern)) {
            html += `<li><code>${pattern}</code>: ${desc}</li>`;
        }
    }
    
    html += '</ul>';
    explanation.innerHTML = html;
}

// 执行正则表达式匹配
function executeRegex() {
    const regexInput = document.getElementById('regex-input').value;
    const testInput = document.getElementById('test-input').value;
    const resultDisplay = document.getElementById('result-display');
    const matchCount = document.getElementById('match-count');
    const execTime = document.getElementById('exec-time');
    
    if (!regexInput || !testInput) {
        resultDisplay.innerHTML = '';
        matchCount.textContent = '0';
        execTime.textContent = '0';
        return;
    }

    try {
        // 获取标志位
        const flags = ['g', 'i', 'm', 's', 'u', 'y']
            .filter(flag => document.getElementById(`flag-${flag}`).checked)
            .join('');

        // 创建正则表达式对象
        const regex = new RegExp(regexInput, flags);
        
        // 更新解释
        updateExplanation(regexInput);

        // 执行匹配
        const startTime = performance.now();
        let matches = [];
        let match;
        let count = 0;
        
        if (flags.includes('g')) {
            while ((match = regex.exec(testInput)) !== null) {
                matches.push({
                    index: match.index,
                    text: match[0],
                    groups: match.slice(1)
                });
                count++;
            }
        } else {
            match = regex.exec(testInput);
            if (match) {
                matches.push({
                    index: match.index,
                    text: match[0],
                    groups: match.slice(1)
                });
                count = 1;
            }
        }
        
        const endTime = performance.now();

        // 更新统计信息
        matchCount.textContent = count;
        execTime.textContent = (endTime - startTime).toFixed(2);

        // 显示结果
        let html = '';
        let lastIndex = 0;

        matches.forEach(match => {
            // 添加未匹配的文本
            html += testInput.slice(lastIndex, match.index);
            
            // 添加匹配的文本
            html += `<span class="match">${match.text}`;
            
            // 添加捕获组
            if (match.groups.length > 0) {
                html += ' (组: ';
                match.groups.forEach((group, index) => {
                    html += `<span class="group">${index + 1}: ${group}</span>`;
                });
                html += ')';
            }
            
            html += '</span>';
            
            lastIndex = match.index + match.text.length;
        });

        // 添加剩余的文本
        html += testInput.slice(lastIndex);
        
        resultDisplay.innerHTML = html;

    } catch (e) {
        resultDisplay.innerHTML = `<span class="error">错误: ${e.message}</span>`;
        matchCount.textContent = '0';
        execTime.textContent = '0';
    }
}

// 添加事件监听器
document.getElementById('regex-input').addEventListener('input', executeRegex);
document.getElementById('test-input').addEventListener('input', executeRegex);
document.querySelectorAll('.flags input').forEach(input => {
    input.addEventListener('change', executeRegex);
});

// 处理常用模式按钮点击
document.querySelectorAll('.pattern-buttons button').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('regex-input').value = button.dataset.pattern;
        executeRegex();
    });
});

// 处理文件导入
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('test-input').value = e.target.result;
            executeRegex();
        };
        reader.readAsText(file);
    }
}); 