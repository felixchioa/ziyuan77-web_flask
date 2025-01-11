const socket = io();
let currentPlayer = 'red';
let myPlayer = null;
let room = null;
let selectedPiece = null;
let validMoves = [];
let kings = new Set();

// 初始化棋盘
const board = document.getElementById('board');

// 创建棋盘格子
for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        const cell = document.createElement('div');
        cell.className = `cell ${(i + j) % 2 === 0 ? 'light' : 'dark'}`;
        cell.style.left = (j * 80) + 'px';
        cell.style.top = (i * 80) + 'px';
        cell.dataset.x = i;
        cell.dataset.y = j;
        board.appendChild(cell);
    }
}

// 处理棋子选择
board.addEventListener('click', (e) => {
    if (currentPlayer !== myPlayer) {
        alert('不是你的回合');
        return;
    }

    const cell = e.target.closest('.cell');
    if (!cell) return;

    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    // 如果已选中棋子，尝试移动
    if (selectedPiece) {
        const validMove = validMoves.find(move => move.x === x && move.y === y);
        if (validMove) {
            makeMove(selectedPiece, x, y, validMove.captured);
        }
        clearSelection();
    } else {
        // 选择新棋子
        const piece = cell.querySelector('.piece');
        if (piece && piece.classList.contains(myPlayer)) {
            selectedPiece = {
                id: piece.dataset.id,
                x: parseInt(cell.dataset.x),
                y: parseInt(cell.dataset.y)
            };
            piece.classList.add('selected');
            showValidMoves(selectedPiece);
        }
    }
});

// 显示有效移动位置
function showValidMoves(piece) {
    clearValidMoves();
    validMoves = getValidMoves(piece);
    validMoves.forEach(move => {
        const cell = document.querySelector(`.cell[data-x="${move.x}"][data-y="${move.y}"]`);
        const indicator = document.createElement('div');
        indicator.className = 'valid-move';
        cell.appendChild(indicator);
    });
}

// 清除选择状态
function clearSelection() {
    if (selectedPiece) {
        const piece = document.querySelector(`.piece[data-id="${selectedPiece.id}"]`);
        if (piece) piece.classList.remove('selected');
        selectedPiece = null;
        clearValidMoves();
    }
}

// 清除有效移动提示
function clearValidMoves() {
    document.querySelectorAll('.valid-move').forEach(el => el.remove());
    validMoves = [];
}

// 获取有效移动位置
function getValidMoves(piece) {
    const moves = [];
    const isKing = kings.has(piece.id);
    const directions = isKing ? 
        [{x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: -1, y: -1}] :
        piece.id.startsWith('red_') ?
            [{x: 1, y: 1}, {x: 1, y: -1}] :
            [{x: -1, y: 1}, {x: -1, y: -1}];

    // 检查普通移动
    directions.forEach(dir => {
        const newX = piece.x + dir.x;
        const newY = piece.y + dir.y;
        if (isValidPosition(newX, newY) && !getPieceAt(newX, newY)) {
            moves.push({x: newX, y: newY});
        }
    });

    // 检查跳吃
    const jumpMoves = getJumpMoves(piece);
    moves.push(...jumpMoves);

    return moves;
}

// 获取跳吃移动
function getJumpMoves(piece, visited = new Set()) {
    const moves = [];
    const isKing = kings.has(piece.id);
    const directions = isKing ? 
        [{x: 2, y: 2}, {x: 2, y: -2}, {x: -2, y: 2}, {x: -2, y: -2}] :
        piece.id.startsWith('red_') ?
            [{x: 2, y: 2}, {x: 2, y: -2}] :
            [{x: -2, y: 2}, {x: -2, y: -2}];

    directions.forEach(dir => {
        const newX = piece.x + dir.x;
        const newY = piece.y + dir.y;
        const midX = piece.x + dir.x/2;
        const midY = piece.y + dir.y/2;

        if (isValidPosition(newX, newY)) {
            const midPiece = getPieceAt(midX, midY);
            if (midPiece && 
                !getPieceAt(newX, newY) && 
                isOpponentPiece(midPiece, piece.id) &&
                !visited.has(`${newX},${newY}`)) {
                moves.push({
                    x: newX,
                    y: newY,
                    captured: [midPiece]
                });

                // 递归检查连续跳吃
                visited.add(`${newX},${newY}`);
                const nextJumps = getJumpMoves({...piece, x: newX, y: newY}, visited);
                nextJumps.forEach(jump => {
                    moves.push({
                        ...jump,
                        captured: [...jump.captured, midPiece]
                    });
                });
            }
        }
    });

    return moves;
}

// 其他辅助函数...
function isValidPosition(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

function getPieceAt(x, y) {
    const piece = document.querySelector(`.piece[style*="left: ${y * 80}px"][style*="top: ${x * 80}px"]`);
    return piece ? piece.dataset.id : null;
}

function isOpponentPiece(pieceId1, pieceId2) {
    return pieceId1.startsWith('red_') !== pieceId2.startsWith('red_');
}

// 发送移动请求
async function makeMove(piece, toX, toY, captured = []) {
    try {
        socket.emit('make_checkers_move', {
            room,
            piece: piece.id,
            fromX: piece.x,
            fromY: piece.y,
            toX,
            toY,
            capturedPieces: captured
        });
    } catch (error) {
        console.error('Error making move:', error);
        alert('移动失败，请重试');
    }
}

// 更新棋盘显示
function updateBoard(boardData, kingsData) {
    // 清除所有棋子
    document.querySelectorAll('.piece').forEach(el => el.remove());

    // 更新王棋集合
    kings = new Set(kingsData);

    // 添加新棋子
    Object.entries(boardData).forEach(([pieceId, pos]) => {
        const cell = document.querySelector(`.cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
        if (cell) {
            const piece = document.createElement('div');
            piece.className = `piece ${pieceId.startsWith('red_') ? 'red' : 'black'}`;
            piece.dataset.id = pieceId;
            if (kings.has(pieceId)) {
                piece.classList.add('king');
            }
            cell.appendChild(piece);
        }
    });
}

// Socket.io 事件处理...
socket.on('update_checkers_board', (data) => {
    currentPlayer = data.turn;
    updateBoard(data.board, data.kings);
    document.getElementById('current-turn').textContent = 
        `当前回合: ${currentPlayer === 'red' ? '红方' : '黑方'}`;
});

// 初始化游戏
async function initGame() {
    // 创建房间对话框代码...
    // 与五子棋类似，但使用 /create_checkers_game 和 /join_checkers_game
}

// 启动游戏
initGame(); 