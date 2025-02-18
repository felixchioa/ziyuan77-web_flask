// 摩尔斯电码映射表
const morseCode = {
    'A': '.-',    'B': '-...',  'C': '-.-.', 'D': '-..',   'E': '.',
    'F': '..-.',  'G': '--.',   'H': '....', 'I': '..',    'J': '.---',
    'K': '-.-',   'L': '.-..',  'M': '--',   'N': '-.',    'O': '---',
    'P': '.--.',  'Q': '--.-',  'R': '.-.',  'S': '...',   'T': '-',
    'U': '..-',   'V': '...-',  'W': '.--',  'X': '-..-',  'Y': '-.--',
    'Z': '--..',  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', 
    '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
    ' ': ' '
};

// 反向映射表
const reverseMorseCode = Object.fromEntries(
    Object.entries(morseCode).map(([key, value]) => [value, key])
);

// 获取DOM元素
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const textToMorseBtn = document.getElementById('text-to-morse');
const morseToTextBtn = document.getElementById('morse-to-text');
const clearBtn = document.getElementById('clear');
const copyBtn = document.getElementById('copy');
const playBtn = document.getElementById('play');
const tableContent = document.querySelector('.table-content');

// 文本转摩尔斯电码
function textToMorse() {
    const text = inputText.value.toUpperCase();
    const morse = text.split('').map(char => {
        return morseCode[char] || char;
    }).join(' ');
    outputText.value = morse;
}

// 摩尔斯电码转文本
function morseToText() {
    const morse = inputText.value.trim();
    const text = morse.split('  ').map(word => {
        return word.split(' ').map(code => {
            return reverseMorseCode[code] || code;
        }).join('');
    }).join(' ');
    outputText.value = text;
}

// 播放摩尔斯电码
function playMorse() {
    const morse = outputText.value;
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const dot = 60; // 点的持续时间(ms)
    
    let time = context.currentTime;
    
    morse.split('').forEach(char => {
        if (char === '.') {
            playBeep(context, time, dot);
            time += dot * 2;
        } else if (char === '-') {
            playBeep(context, time, dot * 3);
            time += dot * 4;
        } else if (char === ' ') {
            time += dot * 3;
        }
    });
}

function playBeep(context, time, duration) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    
    oscillator.connect(gain);
    gain.connect(context.destination);
    
    oscillator.frequency.value = 600;
    gain.gain.setValueAtTime(0.5, time);
    
    oscillator.start(time);
    oscillator.stop(time + duration / 1000);
}

// 生成对照表
function generateTable() {
    Object.entries(morseCode).forEach(([char, code]) => {
        if (char === ' ') return;
        
        const item = document.createElement('div');
        item.className = 'morse-item';
        item.innerHTML = `<span>${char}</span><span>${code}</span>`;
        tableContent.appendChild(item);
    });
}

// 事件监听
textToMorseBtn.addEventListener('click', textToMorse);
morseToTextBtn.addEventListener('click', morseToText);
clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
});
copyBtn.addEventListener('click', () => {
    outputText.select();
    document.execCommand('copy');
});
playBtn.addEventListener('click', playMorse);

// 初始化
generateTable(); 