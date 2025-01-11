const socket = io();
let currentPlayer = 'black';
let myPlayer = null;
let room = null;

// 初始化棋盘
const board = document.getElementById('board');
const letters = 'ABCDEFGHJKLMNOPQRST'; // 围棋坐标不使用 'I'

// 创建坐标标注
for (let i = 0; i < 19; i++) {
    // 添加横坐标
    const xCoord = document.createElement('div');
    xCoord.className = 'coordinate coordinate-x';
    xCoord.style.left = (i * 40) + 'px';
    xCoord.textContent = letters[i];
    board.appendChild(xCoord);

    // 添加纵坐标
    const yCoord = document.createElement('div');
    yCoord.className = 'coordinate coordinate-y';
    yCoord.style.top = (i * 40) + 'px';
    yCoord.textContent = 19 - i;
    board.appendChild(yCoord);
}

// 创建棋盘网格
for (let i = 0; i < 19; i++) {
    for (let j = 0; j < 19; j++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.left = (j * 40) + 'px';
        cell.style.top = (i * 40) + 'px';
        cell.dataset.x = i;
        cell.dataset.y = j;
        
        // 添加星位标记
        if ([3, 9, 15].includes(i) && [3, 9, 15].includes(j)) {
            cell.classList.add('star-point');
        }
        
        board.appendChild(cell);
    }
}

// 处理落子
board.addEventListener('click', async (e) => {
    if (currentPlayer !== myPlayer) {
        alert('不是你的回合');
        return;
    }

    const cell = e.target.closest('.cell');
    if (!cell) return;

    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    try {
        socket.emit('make_go_move', {
            room,
            x,
            y,
            color: myPlayer
        });
    } catch (error) {
        console.error('Error making move:', error);
        alert('落子失败，请重试');
    }
});

// 更新棋盘显示
function updateBoard(boardData, lastMove) {
    // 清除所有棋子
    document.querySelectorAll('.stone').forEach(el => el.remove());
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('last-move');
    });

    // 添加新棋子
    for (let i = 0; i < 19; i++) {
        for (let j = 0; j < 19; j++) {
            if (boardData[i][j] !== 0) {
                const cell = document.querySelector(`.cell[data-x="${i}"][data-y="${j}"]`);
                const stone = document.createElement('div');
                stone.className = `stone ${boardData[i][j] === 1 ? 'black' : 'white'}`;
                cell.appendChild(stone);
            }
        }
    }

    // 标记最后一手
    if (lastMove) {
        const lastCell = document.querySelector(
            `.cell[data-x="${lastMove.x}"][data-y="${lastMove.y}"]`
        );
        if (lastCell) {
            lastCell.classList.add('last-move');
        }
    }

    // 添加AI思考提示
    const turnDisplay = document.getElementById('current-turn');
    if (data.vs_ai && data.turn === data.ai_color) {
        turnDisplay.textContent = 'AI思考中...';
        turnDisplay.classList.add('ai-thinking');
    } else {
        turnDisplay.classList.remove('ai-thinking');
        turnDisplay.textContent = `当前回合: ${data.turn === 'black' ? '黑方' : '白方'}`;
    }
}

// 更新提子显示
function updateCaptures(captures) {
    document.getElementById('black-captures').textContent = captures.black;
    document.getElementById('white-captures').textContent = captures.white;
}

// Socket.io 事件处理
socket.on('update_go_board', (data) => {
    currentPlayer = data.turn;
    updateBoard(data.board, data.lastMove);
    updateCaptures(data.captures);
    document.getElementById('current-turn').textContent = 
        `当前回合: ${currentPlayer === 'black' ? '黑方' : '白方'}`;
});

// 处理虚手
document.getElementById('pass').addEventListener('click', () => {
    if (currentPlayer !== myPlayer) {
        alert('不是你的回合');
        return;
    }
    socket.emit('go_pass', { room });
});

// 处理认输
document.getElementById('resign').addEventListener('click', () => {
    if (confirm('确定要认输吗？')) {
        socket.emit('go_resign', { room });
    }
});

// 处理点目
document.getElementById('count').addEventListener('click', () => {
    socket.emit('go_count', { room });
});

// 初始化游戏
async function initGame() {
    // 创建房间对话框代码...
    // 与之前的游戏类似，但使用 /create_go_game 和 /join_go_game
}

// 启动游戏
initGame(); 

// 添加AI对战按钮处理
document.getElementById('vs-ai').addEventListener('click', async () => {
    if (room) {
        alert('游戏已经开始，无法切换对手');
        return;
    }
    
    try {
        const response = await fetch('/create_go_game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                room: 'ai_' + Math.random().toString(36).substr(2, 9),
                vs_ai: true
            }),
        });
        
        const data = await response.json();
        if (data.error) {
            alert(data.error);
            return;
        }
        
        myPlayer = data.player;
        room = data.room;
        alert(`你执${myPlayer === 'black' ? '黑棋' : '白棋'}，对手是AI`);
        
        socket.emit('join', { room });
    } catch (error) {
        console.error('Error:', error);
        alert('创建AI对战失败');
    }
}); 