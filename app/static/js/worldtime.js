function updateTime() {
    const timeZones = [
        { name: 'UTCMinus12', offset: -12 },
        { name: 'UTCMinus11', offset: -11 },
        { name: 'UTCMinus10', offset: -10 },
        { name: 'UTCMinus9', offset: -9 },
        { name: 'UTCMinus8', offset: -8 },
        { name: 'UTCMinus7', offset: -7 },
        { name: 'UTCMinus6', offset: -6 },
        { name: 'UTCMinus5', offset: -5 },
        { name: 'UTCMinus4', offset: -4 },
        { name: 'UTCMinus3', offset: -3 },
        { name: 'UTCMinus2', offset: -2 },
        { name: 'UTCMinus1', offset: -1 },
        { name: 'UTC', offset: 0 },
        { name: 'UTCPlus1', offset: 1 },
        { name: 'UTCPlus2', offset: 2 },
        { name: 'UTCPlus3', offset: 3 },
        { name: 'UTCPlus4', offset: 4 },
        { name: 'UTCPlus5', offset: 5 },
        { name: 'UTCPlus6', offset: 6 },
        { name: 'UTCPlus7', offset: 7 },
        { name: 'UTCPlus8', offset: 8 },
        { name: 'UTCPlus9', offset: 9 },
        { name: 'UTCPlus10', offset: 10 },
        { name: 'UTCPlus11', offset: 11 },
        { name: 'UTCPlus12', offset: 12 }
    ];

    timeZones.forEach(zone => {
        updateClock(zone.name, zone.offset);
    });
}

function updateClock(zone, offset) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (3600000 * offset));
    const timeString = localTime.toLocaleTimeString();
    document.getElementById(`currentTime${zone}`).innerText = `当前时间: ${timeString}`;
    drawClock(localTime, `clockCanvas${zone}`);
}

function drawClock(now, canvasId) {
    const canvas = document.getElementById(canvasId);
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