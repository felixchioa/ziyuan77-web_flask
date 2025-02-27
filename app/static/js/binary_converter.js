// 添加 CryptoJS 库
document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"><\/script>');
        
// 添加 JSEncrypt 库（用于RSA加密）
document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.2.1/jsencrypt.min.js"><\/script>');

// RSA密钥对
let publicKey, privateKey;

// 监听加密方式变化
document.getElementById('encryption').addEventListener('change', function(e) {
    const keyInput = document.getElementById('key-input');
    const keyDisplay = document.getElementById('key-display');
    const aesKeyDisplay = document.getElementById('aes-key-display');
    keyInput.style.display = ['aes', 'rsa', 'rsa4096'].includes(e.target.value) ? 'inline-block' : 'none';
    keyDisplay.style.display = ['rsa', 'rsa4096'].includes(e.target.value) ? 'block' : 'none';
    aesKeyDisplay.style.display = e.target.value === 'aes' ? 'block' : 'none';
    
    if (['rsa', 'rsa4096'].includes(e.target.value)) {
        generateRSAKeys(e.target.value === 'rsa4096' ? 4096 : 1024);
    }
});

// 生成RSA密钥对
function generateRSAKeys(keySize = 1024) {
    document.getElementById('processor-text').textContent = '生成密钥中...';
    document.getElementById('encryption-key').value = '正在生成密钥，请稍候...';
    
    // 使用setTimeout让UI有机会更新
    setTimeout(() => {
        const encrypt = new JSEncrypt({default_key_size: keySize});
        
        // 显示生成进度
        encrypt.getKey(function() {
            document.getElementById('processor-text').textContent = '处理中';
        });
        
        publicKey = encrypt.getPublicKey();
        privateKey = encrypt.getPrivateKey();
        
        // 显示密钥对
        document.getElementById('public-key').textContent = publicKey;
        document.getElementById('private-key').textContent = privateKey;
        document.getElementById('encryption-key').value = 
            `已生成RSA-${keySize}密钥对`;
    }, 100);
}

// 复制密钥对
function copyKeys() {
    const keyText = 
        '=== 公钥 ===\n' + publicKey + 
        '\n=== 私钥 ===\n' + privateKey;
    
    navigator.clipboard.writeText(keyText)
        .then(() => alert('密钥对已复制到剪贴板'))
        .catch(err => alert('复制失败：' + err));
}

// 切换密钥显示/隐藏
function toggleKeyVisibility() {
    const input = document.getElementById('encryption-key');
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// 复制AES密钥
function copyAESKey() {
    const key = document.getElementById('encryption-key').value;
    if (key) {
        navigator.clipboard.writeText(key)
            .then(() => alert('AES密钥已复制到剪贴板'))
            .catch(err => alert('复制失败：' + err));
    }
}

// 生成AES密钥
function generateKey() {
    const key = CryptoJS.lib.WordArray.random(16).toString();
    document.getElementById('encryption-key').value = key;
    document.getElementById('aes-key').textContent = key;
}

// 创建 TextEncoder 和 TextDecoder 实例的缓存
const encoders = {};
const decoders = {};

function getEncoder(encoding) {
    if (!encoders[encoding]) {
        encoders[encoding] = new TextEncoder(encoding);
    }
    return encoders[encoding];
}

function getDecoder(encoding) {
    if (!decoders[encoding]) {
        decoders[encoding] = new TextDecoder(encoding);
    }
    return decoders[encoding];
}

function convertToBinary() {
    const input = document.getElementById('input-text').value;
    const encoding = document.getElementById('encoding').value;
    const noSpace = document.getElementById('no-space').checked;
    const encryption = document.getElementById('encryption').value;
    const error = document.getElementById('text-error');
    const result = document.getElementById('result');
    
    try {
        // 先加密
        const encryptedText = encrypt(input, encryption);
        document.getElementById('processor-text').textContent = '加密中';

        // 使用选定的编码格式将文本转换为 Uint8Array
        const encoder = new TextEncoder();
        const bytes = encoder.encode(encryptedText);
        
        // 延迟显示转换状态
        setTimeout(() => {
            document.getElementById('processor-text').textContent = '转换中';
        }, 500);
        
        // 将每个字节转换为8位二进制字符串
        const binary = Array.from(bytes)
            .map(byte => byte.toString(2).padStart(8, '0'))
            .join(noSpace ? '' : ' ');
        
        // 显示动画
        showAnimation(encryptedText.split(''), binary.match(/.{8}/g) || [], true);
        
        // 清空结果
        result.textContent = '';
        
        // 动态添加结果
        let resultText = '';
        let index = 0;
        
        function addNextChar() {
            if (index < bytes.length) {
                const byte = bytes[index];
                const binaryChar = byte.toString(2).padStart(8, '0');
                resultText += binaryChar + (noSpace ? '' : ' ');
                result.textContent = resultText.trim();
                index++;
                setTimeout(addNextChar, 200);
            }
        }
        
        // 延迟开始添加结果，等待动画开始
        setTimeout(addNextChar, 500);
        
        error.style.display = 'none';
    } catch (e) {
        error.textContent = '转换失败：' + e.message;
        error.style.display = 'block';
    }
}

function showAnimation(input, output, toBinary) {
    const container = document.getElementById('animation-container');
    const processor = container.querySelector('.processor');
    
    // 清除现有的动画元素
    Array.from(container.querySelectorAll('.data-bit')).forEach(el => el.remove());
    
    // 创建动画元素
    let delay = 0;
    input.forEach((char, index) => {
        const bit = document.createElement('div');
        bit.className = 'data-bit';
        bit.textContent = char;
        bit.style.animationDelay = `${delay}s`;
        
        // 随机垂直位置
        const randomY = Math.random() * 60 - 30;
        bit.style.top = `calc(50% + ${randomY}px)`;
        
        container.appendChild(bit);
        
        // 创建对应的输出元素
        setTimeout(() => {
            const outBit = document.createElement('div');
            outBit.className = 'data-bit';
            outBit.textContent = output[index] || '';
            outBit.style.animationDelay = '0s';
            outBit.style.left = '50%';
            outBit.style.top = `calc(50% + ${randomY}px)`;
            container.appendChild(outBit);
        }, (delay + 0.5) * 1000);
        
        delay += 0.2;
    });
    
    // 处理器动画效果
    processor.style.animation = 'none';
    processor.offsetHeight; // 触发重绘
    processor.style.animation = 'pulse 1s infinite';
}

function convertFromBinary() {
    const input = document.getElementById('input-text').value.trim();
    const encoding = document.getElementById('encoding').value;
    const encryption = document.getElementById('encryption').value;
    const error = document.getElementById('text-error');
    const result = document.getElementById('result');
    
    try {
        // 移除所有空格，然后每8位分割成一组
        const binaryGroups = input.replace(/\s/g, '').match(/.{1,8}/g);
        
        if (!binaryGroups || !binaryGroups.every(group => /^[01]{8}$/.test(group))) {
            throw new Error('请输入有效的8位二进制数（可用空格分隔）');
        }
        
        document.getElementById('processor-text').textContent = '转换中';

        // 将二进制转换为字节数组
        const bytes = new Uint8Array(
            binaryGroups.map(binary => parseInt(binary, 2))
        );
        
        // 使用选定的编码格式将字节数组转换为文本
        const decoder = new TextDecoder(encoding);
        const text = decoder.decode(bytes);
        
        // 延迟显示解密状态
        setTimeout(() => {
            document.getElementById('processor-text').textContent = '解密中';
        }, 500);

        // 解密
        const decryptedText = decrypt(text, encryption);

        // 显示动画
        showAnimation(binaryGroups, decryptedText.split(''), false);
        
        // 清空结果
        result.textContent = '';
        
        // 动态添加结果
        let index = 0;
        function addNextChar() {
            if (index < decryptedText.length) {
                result.textContent += decryptedText[index];
                index++;
                setTimeout(addNextChar, 200);
            }
        }
        
        // 延迟开始添加结果，等待动画开始
        setTimeout(addNextChar, 500);
        
        error.style.display = 'none';
    } catch (e) {
        error.textContent = '转换失败：' + e.message;
        error.style.display = 'block';
    }
}

function clearAll() {
    document.getElementById('input-text').value = '';
    document.getElementById('result').textContent = '';
    document.getElementById('text-error').style.display = 'none';
}

function copyResult() {
    const result = document.getElementById('result').textContent;
    if (result) {
        navigator.clipboard.writeText(result)
            .then(() => alert('已复制到剪贴板'))
            .catch(err => alert('复制失败：' + err));
    }
}

// 添加键盘快捷键
document.getElementById('input-text').addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') {
        convertToBinary();
    } else if (e.ctrlKey && e.altKey && e.key === 'Enter') {
        convertFromBinary();
    }
});

// 加密函数
function encrypt(text, method) {
    const key = document.getElementById('encryption-key').value;
    switch (method) {
        case 'aes':
            if (!key) throw new Error('请输入AES密钥');
            const textBase64 = btoa(unescape(encodeURIComponent(text)));
            return CryptoJS.AES.encrypt(textBase64, key).toString();
        case 'rsa':
        case 'rsa4096':
            if (!publicKey) throw new Error('请先生成RSA密钥对');
            const encrypt = new JSEncrypt();
            encrypt.setPublicKey(publicKey);
            // 对长文本进行分块加密
            const maxLength = method === 'rsa4096' ? 400 : 100;
            const encodedText = encodeURIComponent(text);
            if (encodedText.length > maxLength) {
                const blocks = [];
                for (let i = 0; i < encodedText.length; i += maxLength) {
                    const block = encodedText.slice(i, i + maxLength);
                    const encryptedBlock = encrypt.encrypt(block);
                    if (!encryptedBlock) throw new Error('RSA加密失败');
                    blocks.push(encryptedBlock);
                }
                return JSON.stringify(blocks);
            }
            return encrypt.encrypt(encodeURIComponent(text));
        case 'caesar':
            // 使用Unicode偏移来支持中文
            return text.split('').map(char => {
                const code = char.charCodeAt(0);
                return String.fromCharCode(code + 3);
            }).join('');
        case 'reverse':
            return text.split('').reverse().join('');
        case 'base64':
            // 使用encodeURIComponent处理中文
            return btoa(unescape(encodeURIComponent(text)));
        default:
            return text;
    }
}

// 解密函数
function decrypt(text, method) {
    const key = document.getElementById('encryption-key').value;
    switch (method) {
        case 'aes':
            if (!key) throw new Error('请输入AES密钥');
            const bytes = CryptoJS.AES.decrypt(text, key);
            const decryptedBase64 = bytes.toString(CryptoJS.enc.Utf8);
            return decodeURIComponent(escape(atob(decryptedBase64)));
        case 'rsa':
        case 'rsa4096':
            if (!privateKey) throw new Error('未找到RSA私钥');
            const decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);
            try {
                // 尝试解析为JSON（分块加密的情况）
                const blocks = JSON.parse(text);
                if (Array.isArray(blocks)) {
                    const decryptedBlocks = blocks.map(block => {
                        const decrypted = decrypt.decrypt(block);
                        if (!decrypted) throw new Error('RSA解密失败');
                        return decrypted;
                    });
                    return decodeURIComponent(decryptedBlocks.join(''));
                }
            } catch (e) {
                // 不是JSON，尝试直接解密
                const decrypted = decrypt.decrypt(text);
                if (!decrypted) throw new Error('RSA解密失败');
                return decodeURIComponent(decrypted);
            }
        case 'caesar':
            // 使用Unicode反向偏移
            return text.split('').map(char => {
                const code = char.charCodeAt(0);
                return String.fromCharCode(code - 3);
            }).join('');
        case 'reverse':
            return text.split('').reverse().join('');
        case 'base64':
            // 解码Base64并处理中文
            return decodeURIComponent(escape(atob(text)));
        default:
            return text;
    }
}

// 添加错误处理函数
function handleError(e) {
    const error = document.getElementById('text-error');
    error.textContent = '转换失败：' + (e.message || '未知错误');
    error.style.display = 'block';
    console.error(e);
}