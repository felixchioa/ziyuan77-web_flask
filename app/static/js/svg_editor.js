let currentTool = 'select';
let isDrawing = false;
let currentElement = null;
let selectedElement = null;
let startX, startY;
let svgCanvas;
let zoom = 1;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    svgCanvas = document.getElementById('svg-canvas');
    
    // 工具选择
    document.querySelectorAll('.tool-group button[data-tool]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-group button[data-tool]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
            if (selectedElement) {
                deselectElement();
            }
        });
    });
    
    // SVG事件监听
    svgCanvas.addEventListener('mousedown', startDrawing);
    svgCanvas.addEventListener('mousemove', draw);
    svgCanvas.addEventListener('mouseup', stopDrawing);
    svgCanvas.addEventListener('mouseleave', stopDrawing);
    
    // 属性变化监听
    document.querySelectorAll('.property-group input').forEach(input => {
        input.addEventListener('change', updateElementProperties);
    });
    
    // 更新鼠标坐标
    svgCanvas.addEventListener('mousemove', updateMousePosition);
});

// 开始绘制
function startDrawing(e) {
    if (currentTool === 'select') {
        handleSelection(e);
        return;
    }
    
    isDrawing = true;
    const point = getMousePosition(e);
    startX = point.x;
    startY = point.y;
    
    switch (currentTool) {
        case 'rect':
            currentElement = createRect(startX, startY);
            break;
        case 'circle':
            currentElement = createCircle(startX, startY);
            break;
        case 'ellipse':
            currentElement = createEllipse(startX, startY);
            break;
        case 'line':
            currentElement = createLine(startX, startY);
            break;
        case 'path':
            currentElement = createPath(startX, startY);
            break;
        case 'text':
            currentElement = createText(startX, startY);
            break;
    }
    
    if (currentElement) {
        svgCanvas.appendChild(currentElement);
    }
}

// 绘制过程
function draw(e) {
    if (!isDrawing) return;
    
    const point = getMousePosition(e);
    const dx = point.x - startX;
    const dy = point.y - startY;
    
    switch (currentTool) {
        case 'rect':
            updateRect(currentElement, startX, startY, dx, dy);
            break;
        case 'circle':
            updateCircle(currentElement, startX, startY, point);
            break;
        case 'ellipse':
            updateEllipse(currentElement, startX, startY, dx, dy);
            break;
        case 'line':
            updateLine(currentElement, startX, startY, point.x, point.y);
            break;
        case 'path':
            updatePath(currentElement, point.x, point.y);
            break;
    }
}

// 停止绘制
function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    currentElement = null;
}

// 创建各种SVG元素
function createRect(x, y) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('fill', document.getElementById('fill-color').value);
    rect.setAttribute('stroke', document.getElementById('stroke-color').value);
    rect.setAttribute('stroke-width', document.getElementById('stroke-width').value);
    return rect;
}

function createCircle(x, y) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('fill', document.getElementById('fill-color').value);
    circle.setAttribute('stroke', document.getElementById('stroke-color').value);
    circle.setAttribute('stroke-width', document.getElementById('stroke-width').value);
    return circle;
}

// 更新元素属性
function updateElementProperties() {
    if (!selectedElement) return;
    
    const x = document.getElementById('pos-x').value;
    const y = document.getElementById('pos-y').value;
    const width = document.getElementById('size-width').value;
    const height = document.getElementById('size-height').value;
    const rotation = document.getElementById('rotation').value;
    
    selectedElement.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);
    
    switch (selectedElement.tagName.toLowerCase()) {
        case 'rect':
            selectedElement.setAttribute('x', x);
            selectedElement.setAttribute('y', y);
            selectedElement.setAttribute('width', width);
            selectedElement.setAttribute('height', height);
            break;
        case 'circle':
            selectedElement.setAttribute('cx', x);
            selectedElement.setAttribute('cy', y);
            selectedElement.setAttribute('r', width/2);
            break;
        case 'ellipse':
            selectedElement.setAttribute('cx', x);
            selectedElement.setAttribute('cy', y);
            selectedElement.setAttribute('rx', width/2);
            selectedElement.setAttribute('ry', height/2);
            break;
    }
}

// 工具函数
function getMousePosition(e) {
    const CTM = svgCanvas.getScreenCTM();
    return {
        x: (e.clientX - CTM.e) / CTM.a,
        y: (e.clientY - CTM.f) / CTM.d
    };
}

function updateMousePosition(e) {
    const point = getMousePosition(e);
    document.getElementById('mouse-pos').textContent = 
        `X: ${Math.round(point.x)} Y: ${Math.round(point.y)}`;
}

// 缩放控制
function zoomIn() {
    zoom = Math.min(zoom * 1.2, 5);
    updateZoom();
}

function zoomOut() {
    zoom = Math.max(zoom / 1.2, 0.1);
    updateZoom();
}

function updateZoom() {
    svgCanvas.style.transform = `scale(${zoom})`;
    document.getElementById('zoom-level').textContent = `${Math.round(zoom * 100)}%`;
}

// 文件操作
function saveSvg() {
    const svgData = new XMLSerializer().serializeToString(svgCanvas);
    const blob = new Blob([svgData], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'drawing.svg';
    link.click();
    URL.revokeObjectURL(url);
}

function exportPng() {
    const svgData = new XMLSerializer().serializeToString(svgCanvas);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'drawing.png';
        link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
} 