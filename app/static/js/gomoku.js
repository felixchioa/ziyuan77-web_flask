const socket = io();
const room = prompt("请输入房间号:");
let player;

socket.on("connect", () => {
    console.log("Connected to server");
    socket.emit("join", { room: room, username: "Player" + player });
});

socket.on("update_board", (data) => {
    updateBoard(data.board);
    document.getElementById("current-turn").textContent = `当前回合: 玩家${data.turn}`;
});

socket.on("game_over", (data) => {
    updateBoard(data.board);
    document.getElementById("current-turn").textContent = `玩家${data.winner}获胜!`;
    document.getElementById("scores").textContent = `玩家1: ${data.scores[1]}, 玩家2: ${data.scores[2]}`;
    alert(`玩家${data.winner}获胜!`);
});

socket.on("reset_board", () => {
    initBoard();
    document.getElementById("current-turn").textContent = "当前回合: 玩家1";
});

socket.on("close_room", () => {
    alert("房间已关闭");
    window.location.reload();
});

fetch("/create_game", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ room: room }),
})
    .then((response) => response.json())
    .then((data) => {
        if (data.error) {
            alert(data.error);
            joinGame(room);
        } else {
            alert(data.message);
            player = 1; // 创建者自动成为玩家1
            initBoard();
        }
    });

function joinGame(room) {
    fetch("/join_game", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ room: room }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.message);
                player = 2; // 获取分配的玩家编号
                initBoard();
            }
        });
}

function initBoard() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.addEventListener("click", makeMove);
            boardElement.appendChild(cell);
        }
    }
}

function makeMove(event) {
    if (player === null) {
        alert("您是观战者，不能下棋。");
        return;
    }
    const x = event.target.dataset.x;
    const y = event.target.dataset.y;
    fetch("/make_move", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ room: room, x: x, y: y, player: player }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                updateBoard(data.board);
            }
        });
}

function updateBoard(board) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
        const x = cell.dataset.x;
        const y = cell.dataset.y;
        cell.textContent = board[x][y] === 0 ? "" : board[x][y] === 1 ? "X" : "O";
    });
}

function computerMove() {
    // 简单的选择最优点逻辑
    const board = getBoardState();
    const bestMove = findBestMove(board);
    if (bestMove) {
        const cell = document.querySelector(`.cell[data-x='${bestMove.x}'][data-y='${bestMove.y}']`);
        cell.click();
    }
}

function findBestMove(board) {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (board[i][j] === 0) {
                board[i][j] = 2; // 假设电脑是玩家2
                let score = minimax(board, 0, false);
                board[i][j] = 0;
                if (score > bestScore) {
                    bestScore = score;
                    move = { x: i, y: j };
                }
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    let winner = checkWinner(board);
    if (winner !== null) {
        return winner === 2 ? 10 : -10;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (board[i][j] === 0) {
                    board[i][j] = 2;
                    let score = minimax(board, depth + 1, false);
                    board[i][j] = 0;
                    bestScore = Math.max(score, bestScore);
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (board[i][j] === 0) {
                    board[i][j] = 1;
                    let score = minimax(board, depth + 1, true);
                    board[i][j] = 0;
                    bestScore = Math.min(score, bestScore);
                }
            }
        }
        return bestScore;
    }
}

function checkWinner(board) {
    // 检查是否有玩家获胜，返回获胜玩家的编号或 null
    // 这里可以复用服务器端的胜负判断逻辑
    return null;
}
