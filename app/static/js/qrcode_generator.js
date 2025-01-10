// 预设模板
const templates = {
    url: {
        placeholder: '请输入网址 (例如: https://example.com)',
        format: text => text
    },
    text: {
        placeholder: '请输入文本内容',
        format: text => text
    },
    wifi: {
        placeholder: '请输入WiFi信息 (SSID和密码)',
        format: text => {
            const [ssid, password] = text.split('\n');
            return `WIFI:T:WPA;S:${ssid};P:${password};;`;
        }
    },
    contact: {
        placeholder: '请输入联系人信息 (姓名、电话、邮箱，每行一个)',
        format: text => {
            const [name, phone, email] = text.split('\n');
            return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
        }
    },
    email: {
        placeholder: '请输入邮件信息 (收件人、主题、内容，每行一个)',
        format: text => {
            const [to, subject, body] = text.split('\n');
            return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    },
    sms: {
        placeholder: '请输入短信信息 (号码和内容，每行一个)',
        format: text => {
            const [number, message] = text.split('\n');
            return `sms:${number}:${message}`;
        }
    }
};

let currentQR = null;

// 处理预设按钮点击
document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const template = templates[type];
        document.getElementById('qr-text').placeholder = template.placeholder;
    });
});

// 处理Logo预览
document.getElementById('qr-logo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('logo-preview');
            preview.src = e.target.result;
            preview.style.display = 'inline-block';
            generateQR(); // 重新生成带Logo的二维码
        };
        reader.readAsDataURL(file);
    }
});

function generateQR() {
    const text = document.getElementById('qr-text').value;
    const size = parseInt(document.getElementById('qr-size').value);
    const correction = document.getElementById('qr-correction').value;
    const color = document.getElementById('qr-color').value;
    const background = document.getElementById('qr-background').value;
    const preview = document.getElementById('qr-preview');
    
    // 清空预览区域
    preview.innerHTML = '';

    // 生成二维码
    QRCode.toCanvas(preview, text, {
        width: size,
        height: size,
        color: {
            dark: color,
            light: background
        },
        errorCorrectionLevel: correction
    }, function(error) {
        if (error) {
            console.error(error);
            return;
        }

        const canvas = preview.querySelector('canvas');
        currentQR = canvas;

        // 添加Logo
        const logo = document.getElementById('logo-preview');
        if (logo.src && logo.style.display !== 'none') {
            const ctx = canvas.getContext('2d');
            const logoSize = size * 0.2; // Logo大小为二维码的20%
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
        }
    });
}

function downloadQR() {
    if (!currentQR) {
        alert('请先生成二维码');
        return;
    }

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = currentQR.toDataURL();
    link.click();
}

// 自动生成第一个二维码
document.addEventListener('DOMContentLoaded', generateQR); 