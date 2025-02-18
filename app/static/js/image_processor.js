let originalImage = null;
let currentRotation = 0;
let currentFlipX = 1;
let currentFlipY = 1;

// 初始化拖放区域
const dragArea = document.getElementById('drag-area');
const previewImage = document.getElementById('preview-image');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dragArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dragArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dragArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dragArea.classList.add('active');
}

function unhighlight() {
    dragArea.classList.remove('active');
}

dragArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// 处理文件输入
document.getElementById('image-input').addEventListener('change', function(e) {
    handleFiles(this.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                loadImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }
}

function loadImage(src) {
    const img = new Image();
    img.onload = function() {
        originalImage = img;
        previewImage.src = src;
        previewImage.style.display = 'block';
        document.querySelector('.drag-text').style.display = 'none';
        document.getElementById('download-btn').disabled = false;
        
        // 更新尺寸输入框
        document.getElementById('width').value = img.width;
        document.getElementById('height').value = img.height;
        
        // 重置所有调整
        resetAdjustments();
        applyAdjustments();
    };
    img.src = src;
}

// 处理滑块控制
document.querySelectorAll('.slider-control input[type="range"]').forEach(slider => {
    slider.addEventListener('input', function() {
        this.nextElementSibling.textContent = this.value + (this.id === 'hue-rotate' ? '°' : '%');
        applyAdjustments();
    });
});

// 处理滤镜按钮
document.querySelectorAll('.filter-buttons button').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-buttons button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        applyAdjustments();
    });
});

// 处理尺寸调整
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const maintainRatio = document.getElementById('maintain-ratio');
let aspectRatio = 1;

widthInput.addEventListener('input', function() {
    if (maintainRatio.checked) {
        heightInput.value = Math.round(this.value / aspectRatio);
    }
    applyAdjustments();
});

heightInput.addEventListener('input', function() {
    if (maintainRatio.checked) {
        widthInput.value = Math.round(this.value * aspectRatio);
    }
    applyAdjustments();
});

// 应用所有调整
function applyAdjustments() {
    if (!originalImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置画布尺寸
    canvas.width = parseInt(widthInput.value);
    canvas.height = parseInt(heightInput.value);

    // 应用变换
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(currentRotation * Math.PI / 180);
    ctx.scale(currentFlipX, currentFlipY);
    ctx.translate(-canvas.width/2, -canvas.height/2);

    // 绘制图像
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // 应用滤镜
    const brightness = document.getElementById('brightness').value;
    const contrast = document.getElementById('contrast').value;
    const saturation = document.getElementById('saturation').value;
    const hueRotate = document.getElementById('hue-rotate').value;
    const activeFilter = document.querySelector('.filter-buttons button.active').dataset.filter;

    let filters = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        hue-rotate(${hueRotate}deg)
    `;

    if (activeFilter !== 'none') {
        switch (activeFilter) {
            case 'grayscale':
                filters += ' grayscale(100%)';
                break;
            case 'sepia':
                filters += ' sepia(100%)';
                break;
            case 'invert':
                filters += ' invert(100%)';
                break;
            case 'blur':
                filters += ' blur(5px)';
                break;
            case 'vintage':
                filters += ' sepia(50%) contrast(85%) brightness(110%) grayscale(20%)';
                break;
            case 'dramatic':
                filters += ' contrast(120%) saturate(110%) brightness(110%)';
                break;
            case 'cold':
                filters += ' saturate(80%) hue-rotate(180deg) brightness(105%)';
                break;
            case 'warm':
                filters += ' saturate(120%) hue-rotate(-30deg) brightness(105%)';
                break;
        }
    }

    previewImage.style.filter = filters;

    // 应用高级效果
    const sharpen = document.getElementById('sharpen').value;
    const noise = document.getElementById('noise').value;
    const vignette = document.getElementById('vignette').value;

    if (sharpen > 0) {
        ctx.filter = `contrast(${100 + sharpen}%) brightness(${100 + sharpen/2}%)`;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
    }

    if (noise > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const random = (Math.random() - 0.5) * noise;
            data[i] += random;     // R
            data[i+1] += random;   // G
            data[i+2] += random;   // B
        }
        ctx.putImageData(imageData, 0, 0);
    }

    if (vignette > 0) {
        const gradient = ctx.createRadialGradient(
            canvas.width/2, canvas.height/2, 0,
            canvas.width/2, canvas.height/2, canvas.width/2
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${vignette/100})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 添加水印
    const watermarkText = document.getElementById('watermark-text').value;
    if (watermarkText) {
        const watermarkColor = document.getElementById('watermark-color').value;
        const watermarkPosition = document.getElementById('watermark-position').value;
        const watermarkOpacity = document.getElementById('watermark-opacity').value / 100;

        ctx.save();
        ctx.globalAlpha = watermarkOpacity;
        ctx.fillStyle = watermarkColor;
        ctx.font = '20px Arial';

        const metrics = ctx.measureText(watermarkText);
        const textWidth = metrics.width;
        const textHeight = 20;
        let x, y;

        switch (watermarkPosition) {
            case 'top-left':
                x = 10;
                y = textHeight + 10;
                break;
            case 'top-right':
                x = canvas.width - textWidth - 10;
                y = textHeight + 10;
                break;
            case 'bottom-left':
                x = 10;
                y = canvas.height - 10;
                break;
            case 'bottom-right':
                x = canvas.width - textWidth - 10;
                y = canvas.height - 10;
                break;
            case 'center':
                x = (canvas.width - textWidth) / 2;
                y = canvas.height / 2;
                break;
        }

        ctx.fillText(watermarkText, x, y);
        ctx.restore();
    }
}

// 旋转图片
function rotateImage(degrees) {
    currentRotation = (currentRotation + degrees) % 360;
    applyAdjustments();
}

// 翻转图片
function flipImage(direction) {
    if (direction === 'horizontal') {
        currentFlipX *= -1;
    } else {
        currentFlipY *= -1;
    }
    applyAdjustments();
}

// 重置所有调整
function resetAdjustments() {
    document.querySelectorAll('.slider-control input[type="range"]').forEach(slider => {
        slider.value = slider.id === 'hue-rotate' ? 0 : 100;
        slider.nextElementSibling.textContent = slider.value + (slider.id === 'hue-rotate' ? '°' : '%');
    });

    document.querySelector('.filter-buttons button[data-filter="none"]').click();
    
    currentRotation = 0;
    currentFlipX = 1;
    currentFlipY = 1;
    
    if (originalImage) {
        aspectRatio = originalImage.width / originalImage.height;
        widthInput.value = originalImage.width;
        heightInput.value = originalImage.height;
    }
}

// 下载图片
function downloadImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = parseInt(widthInput.value);
    canvas.height = parseInt(heightInput.value);
    
    // 应用变换
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(currentRotation * Math.PI / 180);
    ctx.scale(currentFlipX, currentFlipY);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    
    // 绘制图像
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    // 应用滤镜效果
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // 这里可以添加滤镜处理逻辑
    ctx.putImageData(imageData, 0, 0);
    
    // 创建下载链接
    const format = document.getElementById('format-select').value;
    const quality = document.getElementById('quality').value / 100;
    const link = document.createElement('a');
    link.download = `processed_image.${format}`;
    link.href = canvas.toDataURL(`image/${format}`, quality);
    link.click();
} 