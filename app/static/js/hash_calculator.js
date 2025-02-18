// 哈希函数映射
const hashFunctions = {
    md5: text => CryptoJS.MD5(text).toString(),
    sha1: text => CryptoJS.SHA1(text).toString(),
    sha256: text => CryptoJS.SHA256(text).toString(),
    sha512: text => CryptoJS.SHA512(text).toString(),
    sha3: text => CryptoJS.SHA3(text).toString(),
    ripemd160: text => CryptoJS.RIPEMD160(text).toString()
};

// 处理哈希选项点击
document.querySelectorAll('.hash-option').forEach(option => {
    option.addEventListener('click', () => {
        option.classList.toggle('active');
        calculateHash();
    });
});

// 处理输入变化
document.getElementById('input-text').addEventListener('input', calculateHash);

// 文件拖放处理
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const progressBar = document.querySelector('.progress-bar');
const progressBarInner = document.querySelector('.progress-bar-inner');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    
    progressBar.style.display = 'block';
    progressBarInner.style.width = '0%';

    const reader = new FileReader();
    reader.onprogress = (e) => {
        if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            progressBarInner.style.width = progress + '%';
        }
    };

    reader.onload = (e) => {
        const content = e.target.result;
        document.getElementById('input-text').value = content;
        calculateHash();
        setTimeout(() => {
            progressBar.style.display = 'none';
        }, 500);
    };

    reader.onerror = () => {
        const error = document.getElementById('text-error');
        error.textContent = '文件读取失败';
        error.style.display = 'block';
        progressBar.style.display = 'none';
    };

    reader.readAsText(file);
}

function calculateHash() {
    const input = document.getElementById('input-text').value;
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    document.querySelectorAll('.hash-option.active').forEach(option => {
        const hashType = option.dataset.hash;
        try {
            const hash = hashFunctions[hashType](input);

            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <button class="copy-btn" onclick="copyText('${hashType}')">复制</button>
                <div class="result-label">${option.textContent}</div>
                <div class="result-value" id="${hashType}-result">${hash}</div>
            `;
            resultContainer.appendChild(resultItem);
        } catch (e) {
            console.error(`${hashType} 计算失败:`, e);
        }
    });
}

function copyText(hashType) {
    const text = document.getElementById(`${hashType}-result`).textContent;
    navigator.clipboard.writeText(text)
        .then(() => alert('已复制到剪贴板'))
        .catch(err => alert('复制失败：' + err));
}