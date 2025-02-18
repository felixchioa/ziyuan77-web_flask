const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
    '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.', ' ': '/'
};

// 编码函数
const encoders = {
    base64: text => btoa(unescape(encodeURIComponent(text))),
    url: text => encodeURIComponent(text),
    unicode: text => Array.from(text).map(char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`).join(''),
    html: text => text.replace(/[<>&"']/g, char => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;'
    }[char])),
    hex: text => Array.from(text).map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' '),
    binary: text => Array.from(text).map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' '),
    morse: text => text.toUpperCase().split('').map(char => morseCode[char] || char).join(' '),
    ascii: text => Array.from(text).map(char => char.charCodeAt(0)).join(' ')
};

// 解码函数
const decoders = {
    base64: text => decodeURIComponent(escape(atob(text))),
    url: text => decodeURIComponent(text),
    unicode: text => text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))),
    html: text => text.replace(/&[^;]+;/g, entity => ({
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': "'"
    }[entity] || entity)),
    hex: text => text.split(' ').map(hex => String.fromCharCode(parseInt(hex, 16))).join(''),
    binary: text => text.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join(''),
    morse: text => text.split(' ').map(code => Object.entries(morseCode).find(([_, v]) => v === code)?.[0] || code).join(''),
    ascii: text => text.split(' ').map(code => String.fromCharCode(parseInt(code))).join('')
};

// 处理编码选项点击
document.querySelectorAll('.encoding-option').forEach(option => {
    option.addEventListener('click', () => {
        option.classList.toggle('active');
        convertText();
    });
});

// 处理输入变化
document.getElementById('input-text').addEventListener('input', convertText);

function convertText() {
    const input = document.getElementById('input-text').value;
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    document.querySelectorAll('.encoding-option.active').forEach(option => {
        const encoding = option.dataset.encoding;
        try {
            const encoded = encoders[encoding](input);
            const decoded = decoders[encoding](encoded);

            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <button class="copy-btn" onclick="copyText('${encoding}')">复制</button>
                <div class="result-label">${option.textContent}</div>
                <div class="result-value" id="${encoding}-result">${encoded}</div>
            `;
            resultContainer.appendChild(resultItem);
        } catch (e) {
            console.error(`${encoding} 转换失败:`, e);
        }
    });
}

function copyText(encoding) {
    const text = document.getElementById(`${encoding}-result`).textContent;
    navigator.clipboard.writeText(text)
        .then(() => alert('已复制到剪贴板'))
        .catch(err => alert('复制失败：' + err));
}