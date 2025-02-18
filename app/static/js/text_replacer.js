// 获取DOM元素
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const rulesList = document.getElementById('rules-list');
const errorMessage = document.getElementById('error-message');

// 事件监听
document.getElementById('add-rule').addEventListener('click', addRule);
document.getElementById('clear-rules').addEventListener('click', clearRules);
document.getElementById('replace-all').addEventListener('click', replaceAll);
document.getElementById('clear-input').addEventListener('click', clearInput);
document.getElementById('paste-input').addEventListener('click', pasteInput);
document.getElementById('copy-output').addEventListener('click', copyOutput);
document.getElementById('download').addEventListener('click', downloadOutput);
document.getElementById('import-rules').addEventListener('click', importRules);
document.getElementById('export-rules').addEventListener('click', exportRules);
document.getElementById('upload-file').addEventListener('click', () => {
    document.getElementById('file-input').click();
});
document.getElementById('file-input').addEventListener('change', handleFileUpload);
document.getElementById('preview-mode').addEventListener('change', previewChanges);

// 添加规则
function addRule() {
    const template = document.getElementById('rule-template');
    const ruleItem = template.content.cloneNode(true);
    
    ruleItem.querySelector('.test-rule').addEventListener('click', testRule);
    ruleItem.querySelector('.remove-rule').addEventListener('click', removeRule);
    ruleItem.querySelector('.find-text').addEventListener('input', previewChanges);
    ruleItem.querySelector('.replace-text').addEventListener('input', previewChanges);
    
    rulesList.appendChild(ruleItem);
}

// 清空规则
function clearRules() {
    rulesList.innerHTML = '';
    previewChanges();
}

// 删除规则
function removeRule(event) {
    event.target.closest('.rule-item').remove();
    previewChanges();
}

// 测试规则
function testRule(event) {
    const ruleItem = event.target.closest('.rule-item');
    const findText = ruleItem.querySelector('.find-text').value;
    const replaceText = ruleItem.querySelector('.replace-text').value;
    
    if (!findText) {
        showError('请输入要查找的内容');
        return;
    }
    
    try {
        const result = replaceText(inputText.value, findText, replaceText);
        outputText.innerHTML = highlightChanges(result, findText);
        updateStats(1);
    } catch (error) {
        showError(error.message);
    }
}

// 替换全部
function replaceAll() {
    const rules = getRules();
    if (rules.length === 0) {
        showError('请添加替换规则');
        return;
    }
    
    const startTime = performance.now();
    let text = inputText.value;
    let totalReplacements = 0;
    
    try {
        rules.forEach(rule => {
            const { findText, replaceText } = rule;
            if (findText) {
                const result = replaceText(text, findText, replaceText);
                text = result.text;
                totalReplacements += result.count;
            }
        });
        
        outputText.textContent = text;
        const endTime = performance.now();
        updateStats(totalReplacements, endTime - startTime);
        hideError();
    } catch (error) {
        showError(error.message);
    }
}

// 预览更改
function previewChanges() {
    if (!document.getElementById('preview-mode').checked) {
        return;
    }
    
    const rules = getRules();
    let text = inputText.value;
    
    try {
        rules.forEach(rule => {
            const { findText, replaceText } = rule;
            if (findText) {
                text = replaceText(text, findText, replaceText).text;
            }
        });
        
        outputText.textContent = text;
        hideError();
    } catch (error) {
        showError(error.message);
    }
}

// 替换文本
function replaceText(text, find, replace) {
    const caseSensitive = document.getElementById('case-sensitive').checked;
    const useRegex = document.getElementById('use-regex').checked;
    const wholeWord = document.getElementById('whole-word').checked;
    
    let regex;
    try {
        if (useRegex) {
            regex = new RegExp(find, caseSensitive ? 'g' : 'gi');
        } else {
            let pattern = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (wholeWord) {
                pattern = `\\b${pattern}\\b`;
            }
            regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
        }
    } catch (error) {
        throw new Error('无效的正则表达式');
    }
    
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    return {
        text: text.replace(regex, replace),
        count
    };
}

// 获取规则
function getRules() {
    return Array.from(rulesList.children).map(item => ({
        findText: item.querySelector('.find-text').value,
        replaceText: item.querySelector('.replace-text').value
    }));
}

// 导入导出规则
function importRules() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        try {
            const file = e.target.files[0];
            const text = await file.text();
            const rules = JSON.parse(text);
            
            clearRules();
            rules.forEach(rule => {
                addRule();
                const lastRule = rulesList.lastElementChild;
                lastRule.querySelector('.find-text').value = rule.findText;
                lastRule.querySelector('.replace-text').value = rule.replaceText;
            });
            
            hideError();
        } catch (error) {
            showError('导入规则失败: ' + error.message);
        }
    };
    input.click();
}

function exportRules() {
    const rules = getRules();
    if (rules.length === 0) {
        showError('没有可导出的规则');
        return;
    }
    
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'replace_rules.json';
    a.click();
    URL.revokeObjectURL(url);
}

// 文件操作
async function handleFileUpload(event) {
    try {
        const file = event.target.files[0];
        const text = await file.text();
        inputText.value = text;
        previewChanges();
    } catch (error) {
        showError('文件读取失败: ' + error.message);
    }
}

function copyOutput() {
    if (!outputText.textContent) {
        showError('没有可复制的内容');
        return;
    }
    
    navigator.clipboard.writeText(outputText.textContent)
        .then(() => {
            const button = document.getElementById('copy-output');
            const originalText = button.textContent;
            button.textContent = '已复制！';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        })
        .catch(error => showError('复制失败: ' + error.message));
}

function downloadOutput() {
    if (!outputText.textContent) {
        showError('没有可下载的内容');
        return;
    }
    
    const format = document.getElementById('output-format').value;
    let content = outputText.textContent;
    let type = 'text/plain';
    let extension = 'txt';
    
    switch (format) {
        case 'html':
            content = `<!DOCTYPE html><html><body><pre>${content}</pre></body></html>`;
            type = 'text/html';
            extension = 'html';
            break;
        case 'markdown':
            content = '```\n' + content + '\n```';
            type = 'text/markdown';
            extension = 'md';
            break;
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `replaced_text.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
}

// 辅助函数
function clearInput() {
    inputText.value = '';
    outputText.textContent = '';
    updateStats(0);
}

async function pasteInput() {
    try {
        const text = await navigator.clipboard.readText();
        inputText.value = text;
        previewChanges();
    } catch (error) {
        showError('粘贴失败: ' + error.message);
    }
}

function updateStats(replacements, time = 0) {
    document.getElementById('replace-count').textContent = replacements;
    document.getElementById('word-count').textContent = outputText.textContent.length;
    document.getElementById('process-time').textContent = `${Math.round(time)}ms`;
}

function highlightChanges(text, find) {
    const caseSensitive = document.getElementById('case-sensitive').checked;
    const useRegex = document.getElementById('use-regex').checked;
    const wholeWord = document.getElementById('whole-word').checked;
    
    let regex;
    try {
        if (useRegex) {
            regex = new RegExp(find, caseSensitive ? 'g' : 'gi');
        } else {
            let pattern = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (wholeWord) {
                pattern = `\\b${pattern}\\b`;
            }
            regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
        }
    } catch (error) {
        throw new Error('无效的正则表达式');
    }
    
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
}

// 初始化
addRule(); 