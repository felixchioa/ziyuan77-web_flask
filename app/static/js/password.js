function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('currentTime').innerText = '当前时间: ' + timeString;
    drawClock(now);
}

function drawClock(now) {
    const canvas = document.getElementById('clockCanvas');
    const ctx = canvas.getContext('2d');
    const radius = canvas.height / 2;
    ctx.translate(radius, radius);
    const scale = radius * 0.9;
    ctx.clearRect(-radius, -radius, canvas.width, canvas.height);

    drawFace(ctx, scale);
    drawNumbers(ctx, scale);
    drawTime(ctx, now, scale);
    ctx.translate(-radius, -radius);
}

function drawFace(ctx, scale) {
    ctx.beginPath();
    ctx.arc(0, 0, scale, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = scale * 0.05;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, scale * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
}

function drawNumbers(ctx, scale) {
    ctx.font = `${scale * 0.15}px arial`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    for (let num = 1; num <= 12; num++) {
        const ang = num * Math.PI / 6;
        ctx.rotate(ang);
        ctx.translate(0, -scale * 0.85);
        ctx.rotate(-ang);
        ctx.fillText(num.toString(), 0, 0);
        ctx.rotate(ang);
        ctx.translate(0, scale * 0.85);
        ctx.rotate(-ang);
    }
}

function drawTime(ctx, now, scale) {
    const hour = now.getHours() % 12;
    const minute = now.getMinutes();
    const second = now.getSeconds();

    // Hour
    const hourPos = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60)) + (second * Math.PI / (360 * 60));
    drawHand(ctx, hourPos, scale * 0.5, scale * 0.07);

    // Minute
    const minutePos = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
    drawHand(ctx, minutePos, scale * 0.8, scale * 0.07);

    // Second
    const secondPos = second * Math.PI / 30;
    drawHand(ctx, secondPos, scale * 0.9, scale * 0.02, 'red');
}

function drawHand(ctx, pos, length, width, color = '#333') {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}

setInterval(updateTime, 1000); // 每秒更新一次时间
updateTime(); // 初始化调用

document.getElementById('passwordForm')?.addEventListener('submit', function(event) {
    event.preventDefault(); // 阻止表单的默认提交行为

    // 使用fetch API提交表单数据
    fetch('/password', {
        method: 'POST',
        body: new FormData(this)
    })
    .then(response => response.json())
    .then(data => {
        // 显示生成的密码
        const password = data.password;
        document.getElementById('passwordDisplay').innerText = '生成的密码: ' + password;

        // 复制密码到剪贴板
        navigator.clipboard.writeText(password).then(() => {
            alert('密码已复制到剪贴板!');
        }).catch(err => {
            console.error('无法复制密码: ', err);
        });
    })
    .catch(error => console.error('Error:', error));
});