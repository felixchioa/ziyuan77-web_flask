// 创建并设置 canvas
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 粒子系统参数
const particles = [];
const particleCount = 150;
const maxVelocity = 1;

// 粒子类
class Particle {
    constructor(x, y, vx, vy, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x > canvas.width || this.x < 0) this.vx *= -1;
        if (this.y > canvas.height || this.y < 0) this.vy *= -1;
    }

    draw() {
        ctx.fillStyle = 'rgba(0, 255, 204, 0.7)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 初始化粒子
function initParticles() {
    for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const vx = (Math.random() - 0.5) * maxVelocity;
        const vy = (Math.random() - 0.5) * maxVelocity;
        const size = Math.random() * 3 + 1;
        particles.push(new Particle(x, y, vx, vy, size));
    }
}

// 动画循环
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animate);
}

// 初始化并开始动画
initParticles();
animate();

// 处理窗口大小调整
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});