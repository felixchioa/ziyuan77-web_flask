// 获取DOM元素
const hoursDisplay = document.getElementById('hours');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');
const startStopButton = document.getElementById('start-stop');
const lapButton = document.getElementById('lap');
const resetButton = document.getElementById('reset');
const lapsList = document.getElementById('laps-list');

let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let isRunning = false;
let lapTimes = [];
let lastLapTime = 0;

// 开始/停止按钮事件
startStopButton.addEventListener('click', () => {
    if (!isRunning) {
        // 开始计时
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTime, 10);
        startStopButton.textContent = '停止';
        startStopButton.classList.add('stop');
        isRunning = true;
    } else {
        // 停止计时
        clearInterval(timerInterval);
        startStopButton.textContent = '开始';
        startStopButton.classList.remove('stop');
        isRunning = false;
    }
});

// 计次按钮事件
lapButton.addEventListener('click', () => {
    if (isRunning) {
        const currentTime = Date.now() - startTime;
        const lapTime = currentTime - lastLapTime;
        lastLapTime = currentTime;
        
        lapTimes.push(lapTime);
        updateLapsList();
        updateStats();
    }
});

// 重置按钮事件
resetButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    startStopButton.textContent = '开始';
    startStopButton.classList.remove('stop');
    isRunning = false;
    elapsedTime = 0;
    lastLapTime = 0;
    lapTimes = [];
    updateDisplay(0);
    updateLapsList();
    updateStats();
});

// 更新时间显示
function updateTime() {
    const currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    updateDisplay(elapsedTime);
}

// 更新显示器
function updateDisplay(time) {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    const milliseconds = time % 1000;
    
    hoursDisplay.textContent = hours.toString().padStart(2, '0');
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    millisecondsDisplay.textContent = milliseconds.toString().padStart(3, '0');
}

// 更新计次列表
function updateLapsList() {
    lapsList.innerHTML = '';
    lapTimes.forEach((time, index) => {
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        
        const lapNumber = document.createElement('span');
        lapNumber.className = 'lap-number';
        lapNumber.textContent = `计次 ${lapTimes.length - index}`;
        
        const lapTime = document.createElement('span');
        lapTime.className = 'lap-time';
        lapTime.textContent = formatTime(time);
        
        lapItem.appendChild(lapNumber);
        lapItem.appendChild(lapTime);
        lapsList.insertBefore(lapItem, lapsList.firstChild);
    });
}

// 更新统计信息
function updateStats() {
    if (lapTimes.length > 0) {
        const fastest = Math.min(...lapTimes);
        const slowest = Math.max(...lapTimes);
        const average = lapTimes.reduce((a, b) => a + b) / lapTimes.length;
        
        document.getElementById('fastest-lap').textContent = formatTime(fastest);
        document.getElementById('slowest-lap').textContent = formatTime(slowest);
        document.getElementById('average-lap').textContent = formatTime(average);
    } else {
        document.getElementById('fastest-lap').textContent = '-';
        document.getElementById('slowest-lap').textContent = '-';
        document.getElementById('average-lap').textContent = '-';
    }
}

// 格式化时间
function formatTime(time) {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    const milliseconds = time % 1000;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
} 