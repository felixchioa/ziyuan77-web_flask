let savedWorks = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 图片上传处理
    document.getElementById('image-input').addEventListener('change', handleImageUpload);
    
    // 文本输入处理
    document.getElementById('text-input').addEventListener('input', handleTextInput);
    
    // 字符集选择处理
    document.getElementById('charset').addEventListener('change', handleCharsetChange);
    
    // 加载保存的作品
    loadSavedWorks();
    
    // 控件事件监听
    document.querySelectorAll('.control-item input, .control-item select').forEach(control => {
        control.addEventListener('change', updateOutput);
        if (control.type === 'range') {
            control.addEventListener('input', updateOutput);
        }
    });
});

// 图片处理
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = event => {
        const img = document.getElementById('preview-image');
        img.src = event.target.result;
        img.style.display = 'block';
        img.onload = () => convertImageToAscii(img);
    };
    reader.readAsDataURL(file);
}

// 图片转ASCII
function convertImageToAscii(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const width = parseInt(document.getElementById('width').value);
    const height = Math.floor(width * (img.height / img.width));
    
    canvas.width = width;
    canvas.height = height;
    
    // 应用对比度和亮度
    const contrast = document.getElementById('contrast').value / 100;
    const brightness = document.getElementById('brightness').value / 100;
    
    ctx.filter = `contrast(${contrast}) brightness(${brightness})`;
    ctx.drawImage(img, 0, 0, width, height);
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    // 获取字符集
    const charset = getCharset();
    const invert = document.getElementById('invert').checked;
    
    let ascii = '';
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
            const charIndex = Math.floor((invert ? 255 - brightness : brightness) * (charset.length - 1) / 255);
            ascii += charset[charIndex];
        }
        ascii += '\n';
    }
    
    document.getElementById('ascii-output').textContent = ascii;
    updateOutputStyle();
}

// 文本转ASCII艺术
function handleTextInput() {
    const text = document.getElementById('text-input').value;
    const font = document.getElementById('ascii-font').value;
    
    // 这里应该调用实际的ASCII艺术字体转换函数
    // 这里使用简单的示例
    let result = text;
    switch (font) {
        case 'block':
            result = convertToBlockLetters(text);
            break;
        case '3d':
            result = convertTo3DLetters(text);
            break;
        case 'shadow':
            result = convertToShadowLetters(text);
            break;
    }
    
    document.getElementById('ascii-output').textContent = result;
    updateOutputStyle();
}

// 获取字符集
function getCharset() {
    const type = document.getElementById('charset').value;
    switch (type) {
        case 'standard':
            return '@#$%&*+=-:. ';
        case 'simple':
            return '#. ';
        case 'complex':
            return '█▓▒░ ';
        case 'custom':
            return document.getElementById('custom-chars').value || '@#$%&*+=-:. ';
    }
}

// 更新输出样式
function updateOutputStyle() {
    const output = document.getElementById('ascii-output');
    const fontSize = document.getElementById('font-size').value;
    const lineHeight = document.getElementById('line-height').value;
    const textColor = document.getElementById('text-color').value;
    const bgColor = document.getElementById('bg-color').value;
    
    output.style.fontSize = `${fontSize}px`;
    output.style.lineHeight = lineHeight;
    output.style.color = textColor;
    output.style.backgroundColor = bgColor;
}

// 保存作品
function saveWork() {
    const ascii = document.getElementById('ascii-output').textContent;
    if (!ascii.trim()) return;
    
    const work = {
        ascii,
        timestamp: new Date().toISOString(),
        style: {
            fontSize: document.getElementById('font-size').value,
            lineHeight: document.getElementById('line-height').value,
            textColor: document.getElementById('text-color').value,
            bgColor: document.getElementById('bg-color').value
        }
    };
    
    savedWorks.unshift(work);
    if (savedWorks.length > 20) savedWorks.pop();
    
    localStorage.setItem('asciiWorks', JSON.stringify(savedWorks));
    updateGallery();
}

// 加载保存的作品
function loadSavedWorks() {
    const saved = localStorage.getItem('asciiWorks');
    if (saved) {
        savedWorks = JSON.parse(saved);
        updateGallery();
    }
}

// 更新画廊显示
function updateGallery() {
    const gallery = document.getElementById('saved-works');
    gallery.innerHTML = '';
    
    savedWorks.forEach((work, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <pre style="font-size:${work.style.fontSize}px;
                        line-height:${work.style.lineHeight};
                        color:${work.style.textColor};
                        background-color:${work.style.bgColor}">${work.ascii}</pre>
            <div class="item-footer">
                <span>${new Date(work.timestamp).toLocaleString()}</span>
                <button onclick="deleteWork(${index})">删除</button>
            </div>
        `;
        gallery.appendChild(item);
    });
}

// 删除作品
function deleteWork(index) {
    savedWorks.splice(index, 1);
    localStorage.setItem('asciiWorks', JSON.stringify(savedWorks));
    updateGallery();
}

// 复制ASCII艺术
function copyAscii() {
    const ascii = document.getElementById('ascii-output').textContent;
    navigator.clipboard.writeText(ascii).then(() => {
        alert('ASCII艺术已复制到剪贴板');
    });
}

// 下载ASCII艺术
function downloadAscii() {
    const ascii = document.getElementById('ascii-output').textContent;
    const blob = new Blob([ascii], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ascii_art.txt';
    link.click();
    URL.revokeObjectURL(url);
}

// 分享ASCII艺术
function shareAscii() {
    const ascii = document.getElementById('ascii-output').textContent;
    if (navigator.share) {
        navigator.share({
            title: 'ASCII艺术',
            text: ascii
        }).catch(console.error);
    } else {
        alert('您的浏览器不支持分享功能');
    }
} 