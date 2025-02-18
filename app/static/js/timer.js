// 获取DOM元素
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const timeDisplay = document.getElementById('time-display');
const startStopButton = document.getElementById('start-stop');
const resetButton = document.getElementById('reset');
const soundNotification = document.getElementById('sound-notification');
const desktopNotification = document.getElementById('desktop-notification');
const statusMessage = document.getElementById('status-message');
const alarmSound = document.getElementById('alarm-sound');

let timeLeft = 0;
let timerInterval;
let isRunning = false;

// 初始化
function init() {
    // 检查桌面通知权限
    if (Notification.permission === 'default') {
        desktopNotification.addEventListener('change', requestNotificationPermission);
    }
    
    // 添加预设按钮事件
    document.querySelectorAll('.presets button').forEach(button => {
        button.addEventListener('click', () => {
            const seconds = parseInt(button.dataset.time);
            setTime(seconds);
        });
    });
    
    // 添加输入限制
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        input.addEventListener('input', () => {
            let value = parseInt(input.value) || 0;
            const max = parseInt(input.max);
            if (value > max) value = max;
            if (value < 0) value = 0;
            input.value = value;
            updateTimeLeft();
        });
    });
}

// 开始/停止按钮事件
startStopButton.addEventListener('click', () => {
    if (!isRunning) {
        if (timeLeft <= 0) {
            updateTimeLeft();
            if (timeLeft <= 0) {
                showStatus('请设置时间', true);
                return;
            }
        }
        startTimer();
    } else {
        stopTimer();
    }
});

// 重置按钮事件
resetButton.addEventListener('click', () => {
    stopTimer();
    resetTimer();
});

// 开始计时
function startTimer() {
    isRunning = true;
    startStopButton.textContent = '停止';
    startStopButton.classList.add('stop');
    disableInputs(true);
    hideStatus();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            timerComplete();
        }
    }, 1000);
}

// 停止计时
function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startStopButton.textContent = '开始';
    startStopButton.classList.remove('stop');
    disableInputs(false);
}

// 重置计时器
function resetTimer() {
    timeLeft = 0;
    updateDisplay();
    [hoursInput, minutesInput, secondsInput].forEach(input => input.value = 0);
}

// 计时完成
function timerComplete() {
    stopTimer();
    showStatus('时间到！', true);
    
    if (soundNotification.checked) {
        playAlarm();
    }
    
    if (desktopNotification.checked && Notification.permission === 'granted') {
        new Notification('计时器', {
            body: '设定的时间已到！',
            icon: '/static/images/timer-icon.png'
        });
    }
}

// 更新剩余时间
function updateTimeLeft() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    
    timeLeft = hours * 3600 + minutes * 60 + seconds;
    updateDisplay();
}

// 设置时间
function setTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    hoursInput.value = hours;
    minutesInput.value = minutes;
    secondsInput.value = remainingSeconds;
    
    updateTimeLeft();
}

// 更新显示
function updateDisplay() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 禁用/启用输入
function disableInputs(disabled) {
    [hoursInput, minutesInput, secondsInput].forEach(input => {
        input.disabled = disabled;
    });
    document.querySelectorAll('.presets button').forEach(button => {
        button.disabled = disabled;
    });
}

// 播放警报声
function playAlarm() {
    alarmSound.currentTime = 0;
    alarmSound.play();
}

// 请求通知权限
function requestNotificationPermission() {
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            desktopNotification.checked = false;
            showStatus('需要通知权限才能显示桌面通知', true);
        }
    });
}

// 显示状态消息
function showStatus(message, isWarning = false) {
    statusMessage.textContent = message;
    if (isWarning) {
        statusMessage.classList.add('warning', 'show');
    } else {
        statusMessage.classList.remove('warning', 'show');
    }
}

// 隐藏状态消息
function hideStatus() {
    statusMessage.classList.remove('warning', 'show');
}

// 初始化
init(); 