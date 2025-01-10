// 语法高亮函数
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// 格式化JSON
function formatJSON() {
    const input = document.getElementById('input-json').value;
    const indentSize = parseInt(document.getElementById('indent-size').value);
    const output = document.getElementById('output-json');
    const errorMessage = document.getElementById('error-message');

    try {
        // 解析并格式化JSON
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, ' '.repeat(indentSize));
        
        // 添加语法高亮
        output.innerHTML = syntaxHighlight(formatted);
        errorMessage.style.display = 'none';
    } catch (e) {
        errorMessage.textContent = '无效的JSON格式: ' + e.message;
        errorMessage.style.display = 'block';
    }
}

// 压缩JSON
function minifyJSON() {
    const input = document.getElementById('input-json').value;
    const output = document.getElementById('output-json');
    const errorMessage = document.getElementById('error-message');

    try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        output.innerHTML = syntaxHighlight(minified);
        errorMessage.style.display = 'none';
    } catch (e) {
        errorMessage.textContent = '无效的JSON格式: ' + e.message;
        errorMessage.style.display = 'block';
    }
}

// 复制JSON
function copyJSON() {
    const output = document.getElementById('output-json');
    const text = output.textContent;
    
    navigator.clipboard.writeText(text)
        .then(() => alert('已复制到剪贴板'))
        .catch(err => alert('复制失败：' + err));
}

// 清空输入
function clearJSON() {
    document.getElementById('input-json').value = '';
    document.getElementById('output-json').innerHTML = '';
    document.getElementById('error-message').style.display = 'none';
}

// 下载JSON
function downloadJSON() {
    const output = document.getElementById('output-json').textContent;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    link.click();
    URL.revokeObjectURL(url);
}

// 文件导入处理
document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('input-json').value = e.target.result;
            if (document.getElementById('auto-format').checked) {
                formatJSON();
            }
        };
        reader.readAsText(file);
    }
});

// 自动格式化
document.getElementById('input-json').addEventListener('input', function() {
    if (document.getElementById('auto-format').checked) {
        formatJSON();
    }
});

// 缩进大小变化时重新格式化
document.getElementById('indent-size').addEventListener('change', function() {
    if (document.getElementById('output-json').innerHTML) {
        formatJSON();
    }
}); 