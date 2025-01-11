class PaintApp {
    constructor() {
        this.canvas = document.getElementById('paint-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'pencil';
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.primaryColor = '#000000';
        this.secondaryColor = '#FFFFFF';
        
        // 历史记录
        this.history = [];
        this.currentStep = -1;
        this.maxSteps = 50;
        
        this.initCanvas();
        this.initTools();
        this.initEvents();
        this.initDialogs();
        
        // 加载上次的草稿
        this.loadDraftFromCookie();
    }
    
    initCanvas(width = 800, height = 600) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, width, height);
        this.saveState();
    }
    
    initTools() {
        // 工具按钮事件
        document.querySelectorAll('.tool').forEach(tool => {
            tool.addEventListener('click', (e) => {
                document.querySelector('.tool.active')?.classList.remove('active');
                tool.classList.add('active');
                this.currentTool = tool.id;
            });
        });
        
        // 颜色选择器
        this.primaryColorPicker = document.getElementById('primary-color');
        this.secondaryColorPicker = document.getElementById('secondary-color');
        
        this.primaryColorPicker.addEventListener('change', (e) => {
            this.setPrimaryColor(e.target.value);
        });
        
        this.secondaryColorPicker.addEventListener('change', (e) => {
            this.setSecondaryColor(e.target.value);
        });
        
        // 交换颜色按钮
        document.getElementById('swap-colors').addEventListener('click', () => {
            const temp = this.primaryColor;
            this.setPrimaryColor(this.secondaryColor);
            this.setSecondaryColor(temp);
        });
        
        // 调色板
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                if (e.button === 0) { // 左键点击
                    this.setPrimaryColor(color);
                } else if (e.button === 2) { // 右键点击
                    e.preventDefault();
                    this.setSecondaryColor(color);
                }
                
                // 更新选中状态
                document.querySelector('.color-swatch.active')?.classList.remove('active');
                e.target.classList.add('active');
            });
            
            // 禁用右键菜单
            swatch.addEventListener('contextmenu', e => e.preventDefault());
        });
        
        // 设置默认选中的颜色
        document.querySelector('.color-swatch[data-color="#000000"]').classList.add('active');
        
        // 线条宽度
        this.lineWidth = document.getElementById('line-width');
        this.lineWidth.addEventListener('change', (e) => {
            this.ctx.lineWidth = e.target.value;
        });
        
        // 撤销/重做
        document.getElementById('undo').addEventListener('click', () => this.undo());
        document.getElementById('redo').addEventListener('click', () => this.redo());
        
        // 清空画布
        document.getElementById('clear').addEventListener('click', () => {
            if(confirm('确定要清空画布吗？')) {
                this.clearCanvas();
            }
        });
        
        // 草稿功能
        document.getElementById('save-draft').addEventListener('click', () => this.saveDraftToCookie());
        document.getElementById('load-draft').addEventListener('click', () => this.loadDraftFromCookie());
    }
    
    initEvents() {
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    }
    
    initDialogs() {
        // 新建画布对话框
        const newCanvasDialog = document.getElementById('new-canvas-dialog');
        document.getElementById('new-canvas').addEventListener('click', () => {
            newCanvasDialog.style.display = 'block';
        });
        
        document.getElementById('create-canvas').addEventListener('click', () => {
            const width = document.getElementById('canvas-width').value;
            const height = document.getElementById('canvas-height').value;
            this.initCanvas(width, height);
            newCanvasDialog.style.display = 'none';
        });
        
        document.getElementById('cancel-create').addEventListener('click', () => {
            newCanvasDialog.style.display = 'none';
        });
        
        // 导出对话框
        const exportDialog = document.getElementById('export-dialog');
        document.getElementById('export').addEventListener('click', () => {
            exportDialog.style.display = 'block';
        });
        
        document.getElementById('do-export').addEventListener('click', () => {
            const format = document.getElementById('export-format').value;
            const quality = parseFloat(document.getElementById('export-quality').value);
            this.exportImage(format, quality);
            exportDialog.style.display = 'none';
        });
        
        document.getElementById('cancel-export').addEventListener('click', () => {
            exportDialog.style.display = 'none';
        });
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = this.getMousePos(e);
        
        if(this.currentTool === 'fill') {
            this.floodFill(this.lastX, this.lastY);
            this.isDrawing = false;
            return;
        }
        
        if(this.currentTool === 'text') {
            const text = prompt('请输入文本:');
            if(text) {
                this.ctx.font = `${this.ctx.lineWidth * 5}px Arial`;
                this.ctx.fillText(text, this.lastX, this.lastY);
                this.saveState();
            }
            this.isDrawing = false;
        }
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const [x, y] = this.getMousePos(e);
        
        this.ctx.beginPath();
        
        switch(this.currentTool) {
            case 'pencil':
                this.ctx.moveTo(this.lastX, this.lastY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                break;
                
            case 'eraser':
                const size = this.ctx.lineWidth * 5;
                this.ctx.clearRect(x - size/2, y - size/2, size, size);
                break;
                
            case 'line':
                this.ctx.putImageData(this.history[this.currentStep], 0, 0);
                this.ctx.beginPath();
                this.ctx.moveTo(this.lastX, this.lastY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                break;
                
            case 'rectangle':
                this.ctx.putImageData(this.history[this.currentStep], 0, 0);
                this.ctx.strokeRect(
                    this.lastX,
                    this.lastY,
                    x - this.lastX,
                    y - this.lastY
                );
                break;
                
            case 'circle':
                this.ctx.putImageData(this.history[this.currentStep], 0, 0);
                const radius = Math.sqrt(
                    Math.pow(x - this.lastX, 2) + Math.pow(y - this.lastY, 2)
                );
                this.ctx.beginPath();
                this.ctx.arc(this.lastX, this.lastY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
        }
        
        if(this.currentTool === 'pencil' || this.currentTool === 'eraser') {
            [this.lastX, this.lastY] = [x, y];
        }
    }
    
    stopDrawing() {
        if(this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return [
            e.clientX - rect.left,
            e.clientY - rect.top
        ];
    }
    
    saveState() {
        this.currentStep++;
        if(this.currentStep < this.history.length) {
            this.history.length = this.currentStep;
        }
        this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
        
        if(this.history.length > this.maxSteps) {
            this.history.shift();
            this.currentStep--;
        }
    }
    
    undo() {
        if(this.currentStep > 0) {
            this.currentStep--;
            this.ctx.putImageData(this.history[this.currentStep], 0, 0);
        }
    }
    
    redo() {
        if(this.currentStep < this.history.length - 1) {
            this.currentStep++;
            this.ctx.putImageData(this.history[this.currentStep], 0, 0);
        }
    }
    
    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.colorPicker.value;
        this.saveState();
    }
    
    saveDraftToCookie() {
        const imageData = this.canvas.toDataURL();
        localStorage.setItem('paintDraft', imageData);
        alert('草稿已保存');
    }
    
    loadDraftFromCookie() {
        const imageData = localStorage.getItem('paintDraft');
        
        if(imageData) {
            const img = new Image();
            img.onload = () => {
                this.ctx.drawImage(img, 0, 0);
                this.saveState();
            };
            img.src = imageData;
        }
    }
    
    exportImage(format = 'png', quality = 0.8) {
        const dataUrl = this.canvas.toDataURL(`image/${format}`, quality);
        const link = document.createElement('a');
        link.download = `drawing.${format}`;
        link.href = dataUrl;
        link.click();
    }
    
    setPrimaryColor(color) {
        this.primaryColor = color;
        this.primaryColorPicker.value = color;
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
    }
    
    setSecondaryColor(color) {
        this.secondaryColor = color;
        this.secondaryColorPicker.value = color;
    }
    
    // 新增填充方法
    floodFill(startX, startY) {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        
        // 获取起始点颜色
        const startPos = (startY * this.canvas.width + startX) * 4;
        const startR = pixels[startPos];
        const startG = pixels[startPos + 1];
        const startB = pixels[startPos + 2];
        const startA = pixels[startPos + 3];
        
        // 获取目标颜色
        const fillColor = this.hexToRgb(this.primaryColor);
        
        // 如果起始点颜色与填充颜色相同，则不需要填充
        if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b) {
            return;
        }
        
        // 使用队列实现填充
        const pixelsToCheck = [[startX, startY]];
        while (pixelsToCheck.length > 0) {
            const [x, y] = pixelsToCheck.pop();
            const pos = (y * this.canvas.width + x) * 4;
            
            if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) continue;
            if (pixels[pos] !== startR || pixels[pos + 1] !== startG || 
                pixels[pos + 2] !== startB || pixels[pos + 3] !== startA) continue;
            
            // 填充当前像素
            pixels[pos] = fillColor.r;
            pixels[pos + 1] = fillColor.g;
            pixels[pos + 2] = fillColor.b;
            pixels[pos + 3] = 255;
            
            // 添加相邻像素到队列
            pixelsToCheck.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
    }
    
    // 辅助方法：将十六进制颜色转换为RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

// 初始化应用
window.addEventListener('load', () => {
    new PaintApp();
}); 