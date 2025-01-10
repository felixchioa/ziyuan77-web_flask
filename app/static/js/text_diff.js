let currentView = 'side';

// 切换视图模式
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view;
        compareDiff();
    });
});

// 处理文件导入
function handleFileInput(fileInput, textareaId) {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(textareaId).value = e.target.result;
        };
        reader.readAsText(file);
    }
}

document.getElementById('original-file').addEventListener('change', function() {
    handleFileInput(this, 'original-text');
});

document.getElementById('modified-file').addEventListener('change', function() {
    handleFileInput(this, 'modified-text');
});

// 比较差异
function compareDiff() {
    const original = document.getElementById('original-text').value;
    const modified = document.getElementById('modified-text').value;
    
    // 获取选项
    const ignoreCase = document.getElementById('ignore-case').checked;
    const ignoreWhitespace = document.getElementById('ignore-whitespace').checked;
    const ignoreLinebreaks = document.getElementById('ignore-linebreaks').checked;
    
    // 预处理文本
    let text1 = preprocessText(original, ignoreCase, ignoreWhitespace, ignoreLinebreaks);
    let text2 = preprocessText(modified, ignoreCase, ignoreWhitespace, ignoreLinebreaks);
    
    // 计算差异
    const diff = Diff.diffLines(text1, text2);
    
    // 更新统计信息
    updateStats(diff);
    
    // 根据当前视图模式显示差异
    switch (currentView) {
        case 'side':
            showSideBySideView(diff);
            break;
        case 'unified':
            showUnifiedView(diff);
            break;
        case 'char':
            showCharacterView(diff);
            break;
    }
}

// 预处理文本
function preprocessText(text, ignoreCase, ignoreWhitespace, ignoreLinebreaks) {
    let result = text;
    
    if (ignoreCase) {
        result = result.toLowerCase();
    }
    
    if (ignoreWhitespace) {
        result = result.replace(/\s+/g, ' ').trim();
    }
    
    if (ignoreLinebreaks) {
        result = result.replace(/\n/g, ' ');
    }
    
    return result;
}

// 更新统计信息
function updateStats(diff) {
    let additions = 0;
    let deletions = 0;
    let modifications = 0;
    
    diff.forEach(part => {
        if (part.added) additions += part.count;
        else if (part.removed) deletions += part.count;
        else if (part.modified) modifications += part.count;
    });
    
    document.getElementById('additions-count').textContent = additions;
    document.getElementById('deletions-count').textContent = deletions;
    document.getElementById('modifications-count').textContent = modifications;
}

// 显示并排视图
function showSideBySideView(diff) {
    const result = document.getElementById('diff-result');
    result.innerHTML = '';
    result.className = 'side-by-side';
    
    const leftSide = document.createElement('div');
    const rightSide = document.createElement('div');
    
    diff.forEach(part => {
        if (part.removed) {
            leftSide.innerHTML += `<div class="line deletion">${part.value}</div>`;
        } else if (part.added) {
            rightSide.innerHTML += `<div class="line addition">${part.value}</div>`;
        } else {
            leftSide.innerHTML += `<div class="line">${part.value}</div>`;
            rightSide.innerHTML += `<div class="line">${part.value}</div>`;
        }
    });
    
    result.appendChild(leftSide);
    result.appendChild(rightSide);
}

// 显示统一视图
function showUnifiedView(diff) {
    const result = document.getElementById('diff-result');
    result.innerHTML = '';
    result.className = 'unified-view';
    
    let lineNumber = 1;
    
    diff.forEach(part => {
        const lines = part.value.split('\n');
        lines.forEach(line => {
            if (line) {
                let className = '';
                let prefix = '';
                
                if (part.added) {
                    className = 'addition';
                    prefix = '+';
                } else if (part.removed) {
                    className = 'deletion';
                    prefix = '-';
                } else {
                    prefix = ' ';
                }
                
                result.innerHTML += `
                    <div class="line ${className}">
                        <span class="line-number">${lineNumber++}</span>
                        ${prefix} ${line}
                    </div>`;
            }
        });
    });
}

// 显示字符视图
function showCharacterView(diff) {
    const result = document.getElementById('diff-result');
    result.innerHTML = '';
    result.className = 'character-view';
    
    diff.forEach(part => {
        if (part.added) {
            result.innerHTML += `<span class="char-diff char-addition">${part.value}</span>`;
        } else if (part.removed) {
            result.innerHTML += `<span class="char-diff char-deletion">${part.value}</span>`;
        } else {
            result.innerHTML += part.value;
        }
    });
} 