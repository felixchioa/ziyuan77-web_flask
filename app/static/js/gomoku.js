const socket = io();
        let currentPlayer = 1;
        let myPlayer = null;
        let room = null;
        let lastMove = null;
        
        // 添加计时器相关变量
        let gameStartTime = null;
        let blackTotalTime = 0;
        let whiteTotalTime = 0;
        let currentTurnStartTime = null;
        let timerInterval = null;
        let lastUpdateTime = null;
        let currentMoveStartTime = null;
        
        // 添加超时和倒计时相关变量
        let autoMoveTimeout = null;
        let countdownInterval = null;
        const TIMEOUT_DURATION = 30000; // 30秒
        const COUNTDOWN_START = 10; // 开始倒计时的秒数

        // 创建倒计时提示元素
        const countdownAlert = document.createElement('div');
        countdownAlert.id = 'countdown-alert';
        document.body.appendChild(countdownAlert);

        // 初始化棋盘
        const board = document.getElementById('board');
        
        // 添加坐标标注
        const letters = 'ABCDEFGHIJKLMNO';
        for (let i = 0; i < 15; i++) {
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
            yCoord.textContent = 15 - i;
            board.appendChild(yCoord);

            // 在创建坐标标注时设置 CSS 变量
            xCoord.style.setProperty('--x', i);
            yCoord.style.setProperty('--y', i);
        }

        // 创建棋盘网格
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.left = (j * 40) + 'px';
                cell.style.top = (i * 40) + 'px';
                cell.dataset.x = i;
                cell.dataset.y = j;
                board.appendChild(cell);

                // 在创建棋盘格子时设置 CSS 变量
                cell.style.setProperty('--x', j);
                cell.style.setProperty('--y', i);
            }
        }

        // 添加随机落子函数
        async function makeRandomMove() {
            if (currentPlayer !== myPlayer) return;
            
            // 获取所有空位置
            const emptyCells = [];
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                if (!cell.querySelector('.piece')) {
                    emptyCells.push({ x, y });
                }
            });

            // 如果还有空位置，随机选择一个
            if (emptyCells.length > 0) {
                const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                try {
                    const response = await fetch('/make_move', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            room,
                            x: randomCell.x,
                            y: randomCell.y,
                            player: myPlayer
                        }),
                    });
                    
                    const data = await response.json();
                    if (data.error) {
                        console.error('Random move error:', data.error);
                        return;
                    }
                    
                    lastMove = { x: randomCell.x, y: randomCell.y };
                    
                } catch (error) {
                    console.error('Error making random move:', error);
                }
            }
        }

        // 修改落子函数
        async function makeMove(x, y) {
            try {
                const response = await fetch('/make_move', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        room,
                        x,
                        y,
                        player: myPlayer
                    }),
                });
                
                const data = await response.json();
        if (data.error) {
                    console.error(data.error);
                    return false;
                }
                return true;
            } catch (error) {
                console.error('Error:', error);
                return false;
            }
        }

        // 修改点击事件处理
        board.addEventListener('click', async (e) => {
            console.log('Board clicked');  // 调试日志
            
            if (currentPlayer !== myPlayer) {
                alert('不是你的回合');
                return;
            }
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            // 检查是否已经有棋子
            if (cell.querySelector('.piece')) {
                console.log('Cell already has piece');  // 调试日志
                return;
            }
            
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            
            console.log('Attempting move at:', x, y);  // 调试日志
            
            // 清除当前的超时计时器和倒计时
            if (autoMoveTimeout) {
                clearTimeout(autoMoveTimeout);
            }
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownAlert.style.display = 'none';
            }
            
            try {
                const response = await fetch('/make_move', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        room,
                        x,
                        y,
                        player: myPlayer
                    }),
                });
                
                const data = await response.json();
            if (data.error) {
                alert(data.error);
                    return;
                }
                
                console.log('Move successful');  // 调试日志
                lastMove = { x, y };
                
            } catch (error) {
                console.error('Error making move:', error);
                alert('落子失败，请重试');
            }
        });

        // 修改 updateBoard 函数
        function updateBoard(boardData, lastMoveData) {
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                
                // 清除现有棋子和最后落子标记
                cell.innerHTML = '';
                cell.classList.remove('last-move');
                
                // 添加新棋子
                if (boardData[x][y] !== 0) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${boardData[x][y] === 1 ? 'black' : 'white'}`;
                    cell.appendChild(piece);
                    
                    // 如果是最后落子位置，添加标记
                    if (lastMove && x === lastMove.x && y === lastMove.y) {
                        cell.classList.add('last-move');
                    }
                }
            });
        }

        // 修改 initGame 函数
        async function initGame() {
            // 创建自定义的房间号输入对话框
            const dialogHtml = `
                <div id="room-dialog" style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    z-index: 1000;
                ">
                    <h3 style="margin-top: 0;">请输入房间号</h3>
                    <input type="text" id="room-input" style="
                        padding: 8px;
                        margin: 10px 0;
                        width: 200px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                    ">
                    <div style="text-align: right;">
                        <button id="cancel-btn" style="
                            padding: 8px 16px;
                            margin-right: 10px;
                            background: #ccc;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        ">取消</button>
                        <button id="confirm-btn" style="
                            padding: 8px 16px;
                            background: #007bff;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                        ">确定</button>
                    </div>
                </div>
                <div id="dialog-overlay" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 999;
                "></div>
            `;

            // 添加对话框到页面
            const dialogContainer = document.createElement('div');
            dialogContainer.innerHTML = dialogHtml;
            document.body.appendChild(dialogContainer);

            // 获取对话框元素
            const dialog = document.getElementById('room-dialog');
            const overlay = document.getElementById('dialog-overlay');
            const input = document.getElementById('room-input');
            const cancelBtn = document.getElementById('cancel-btn');
            const confirmBtn = document.getElementById('confirm-btn');

            // 返回一个 Promise，用于处理用户输入
            return new Promise((resolve) => {
                // 处理 ESC 键
                const handleEscape = (e) => {
                    if (e.key === 'Escape') {
                        cleanup();
                        resolve(null);
                    }
                };

                // 处理取消按钮
                const handleCancel = () => {
                    cleanup();
                    resolve(null);
                };

                // 处理确认按钮
                const handleConfirm = () => {
                    const value = input.value.trim();
                    if (value) {
                        cleanup();
                        resolve(value);
                    }
                };

                // 清理函数
                const cleanup = () => {
                    document.removeEventListener('keydown', handleEscape);
                    document.body.removeChild(dialogContainer);
                };

                // 添加事件监听器
                document.addEventListener('keydown', handleEscape);
                cancelBtn.addEventListener('click', handleCancel);
                confirmBtn.addEventListener('click', handleConfirm);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        handleConfirm();
                    }
                });

                // 自动聚焦输入框
                input.focus();
            }).then(async (roomId) => {
                if (!roomId) {
                    window.location.href = '/tools'; // 返回工具页面
        return;
    }

                room = roomId;
                try {
                    // 尝试创建新房间
                    let response = await fetch('/create_game', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ room }),
                    });
                    
                    // 如果房间已存在，加入房间
                    if (!response.ok) {
                        response = await fetch('/join_game', {
                            method: 'POST',
        headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ room }),
                        });
                    }
                    
                    const data = await response.json();
            if (data.error) {
                alert(data.error);
                        window.location.href = '/tools';
                        return;
                    }
                    
                    myPlayer = data.player;
                    alert(`你是${myPlayer === 1 ? '黑棋' : '白棋'}`);
                    
                    socket.emit('join', { room });
                } catch (error) {
                    console.error('Error:', error);
                    alert('连接失败，请重试');
                    window.location.href = '/tools';
            }
        });
}

        // 格式化时间函数
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        // 添加游戏开始时间变量
        let gameCreationTime = Date.now();

        // 修改更新计时器显示函数
        function updateTimerDisplay() {
            if (!gameStartTime) return;

            const currentTime = Date.now();
            
            requestAnimationFrame(() => {
                // 更新游戏总时长
                const gameDuration = Math.floor((currentTime - gameCreationTime) / 1000);
                document.getElementById('game-time').textContent = formatTime(gameDuration);

                // 更新总时间
                const totalGameTime = Math.floor((currentTime - gameStartTime) / 1000);
                document.getElementById('total-time').textContent = formatTime(totalGameTime);

                // 更新当前手时间
                if (currentMoveStartTime) {
                    const currentMoveTime = Math.floor((currentTime - currentMoveStartTime) / 1000);
                    document.getElementById('current-time').textContent = formatTime(currentMoveTime);
                }

                // 更新玩家总时间
                if (currentTurnStartTime && lastUpdateTime) {
                    const turnTime = Math.floor((currentTime - lastUpdateTime) / 1000);
                    
                    if (currentPlayer === 1) {
                        blackTotalTime += turnTime;
                        document.querySelector('.black-timer').classList.add('timer-active');
                        document.querySelector('.white-timer').classList.remove('timer-active');
                    } else {
                        whiteTotalTime += turnTime;
                        document.querySelector('.white-timer').classList.add('timer-active');
                        document.querySelector('.black-timer').classList.remove('timer-active');
                    }
                    
                    document.getElementById('black-time').textContent = formatTime(blackTotalTime);
                    document.getElementById('white-time').textContent = formatTime(whiteTotalTime);
                    
                    lastUpdateTime = currentTime;
                }
            });
        }

        // 修改计时器初始化
        function startTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            
            let lastFrameTime = performance.now();
            const targetFrameRate = 1000; // 每秒更新一次

            function timerLoop(currentTime) {
                if (!gameStartTime) return;

                const elapsed = currentTime - lastFrameTime;
                if (elapsed >= targetFrameRate) {
                    updateTimerDisplay();
                    lastFrameTime = currentTime;
                }

                timerAnimationFrame = requestAnimationFrame(timerLoop);
            }

            timerAnimationFrame = requestAnimationFrame(timerLoop);
        }

        // 添加计时器清理函数
        function stopTimer() {
            if (timerAnimationFrame) {
                cancelAnimationFrame(timerAnimationFrame);
                timerAnimationFrame = null;
            }
        }

        // 修改 socket.on('update_board') 处理
        socket.on('update_board', (data) => {
            console.log('Received update_board:', data);
            
            if (!gameStartTime) {
                gameStartTime = Date.now();
                currentTurnStartTime = Date.now();
                lastUpdateTime = Date.now();
                currentMoveStartTime = Date.now();
                startTimer();
            } else {
                currentTurnStartTime = Date.now();
                lastUpdateTime = Date.now();
                currentMoveStartTime = Date.now();
            }
            
            // 更新当前玩家和棋盘
            currentPlayer = data.turn;
            updateBoard(data.board, lastMove);
            
            // 更新落子记录
            if (data.last_move) {
                const { x, y, player } = data.last_move;
                addMoveToHistory(x, y, player);
                lastMove = { x, y };
            }
            
            document.getElementById('current-turn').textContent = 
                `当前回合: ${currentPlayer === 1 ? '黑棋' : '白棋'}`;
            
            // 清除之前的超时计时器和倒计时
            if (autoMoveTimeout) {
                clearTimeout(autoMoveTimeout);
            }
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownAlert.style.display = 'none';
            }
            
            // 如果是当前玩家的回合，设置新的超时计时器和倒计时
            if (currentPlayer === myPlayer) {
                autoMoveTimeout = setTimeout(() => {
                    makeRandomMove();
                }, TIMEOUT_DURATION);

                // 在自动落子前 10 秒开始倒计时
                setTimeout(() => {
                    startCountdown();
                }, TIMEOUT_DURATION - (COUNTDOWN_START * 1000));
            }
        });

        // 修改游戏结束处理
        socket.on('game_over', (data) => {
            // 停止计时器
            stopTimer();

            updateBoard(data.board);
            document.getElementById('scores').textContent = 
                `黑棋: ${data.scores[1]} 胜 | 白棋: ${data.scores[2]} 胜`;
            
            const message = data.surrender ? 
                `${data.winner === 1 ? '白棋' : '黑棋'}认输，${data.winner === 1 ? '黑棋' : '白棋'}获胜！` :
                `${data.winner === 1 ? '黑棋' : '白棋'}获胜！`;
            
            alert(message);

            // 重置所有计时器
            gameStartTime = null;
            blackTotalTime = 0;
            whiteTotalTime = 0;
            currentTurnStartTime = null;
            lastUpdateTime = null;
            currentMoveStartTime = null;
            gameCreationTime = Date.now();  // 重置游戏创建时间
            
            // 更新显示
            document.getElementById('total-time').textContent = '00:00';
            document.getElementById('black-time').textContent = '00:00';
            document.getElementById('white-time').textContent = '00:00';
            document.getElementById('current-time').textContent = '00:00';
            document.getElementById('game-time').textContent = '00:00';

            // 重置最后落子位置
            lastMove = null;
            updateBoard(data.board);

            // 清空落子记录
            document.getElementById('moves-list').innerHTML = '';

            // 清除超时计时器
            if (autoMoveTimeout) {
                clearTimeout(autoMoveTimeout);
                autoMoveTimeout = null;
            }

            // 清除倒计时
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownAlert.style.display = 'none';
            }
        });

        // 添加删除房间的处理函数
        document.getElementById('delete-room').addEventListener('click', async () => {
            if (!room) {
                alert('未加入任何房间');
                return;
            }

            if (!confirm('确定要删除房间吗？这将结束当前游戏。')) {
                return;
            }

            try {
                const response = await fetch('/delete_game', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ room }),
                });

                const data = await response.json();
                if (data.error) {
                    alert(data.error);
                    return;
                }

                alert('房间已删除');
                location.reload(); // 刷新页面
            } catch (error) {
                console.error('Error:', error);
                alert('删除房间失败');
            }
        });

        // 添加监听房间删除的事件
        socket.on('game_deleted', (data) => {
            alert(data.message);
            location.reload(); // 刷新页面
            document.getElementById('moves-list').innerHTML = '';

            // 清除超时计时器
            if (autoMoveTimeout) {
                clearTimeout(autoMoveTimeout);
                autoMoveTimeout = null;
            }

            // 清除倒计时
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownAlert.style.display = 'none';
            }
        });

        // 添加断开连接的处理
        socket.on('player_disconnected', (data) => {
            alert(data.message);
            location.reload(); // 刷新页面

            // 清除超时计时器
            if (autoMoveTimeout) {
                clearTimeout(autoMoveTimeout);
                autoMoveTimeout = null;
            }

            // 清除倒计时
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownAlert.style.display = 'none';
            }
        });

        // 添加页面关闭事件处理
        window.addEventListener('beforeunload', () => {
            if (room) {
                socket.emit('disconnect');
            }

            // 清除超时计时器
            if (autoMoveTimeout) {
                clearTimeout(autoMoveTimeout);
            }

            // 清除倒计时
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        });

        // 在页面卸载时清理计时器
        window.addEventListener('beforeunload', () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        });

        // 修改添加落子记录的函数
        function addMoveToHistory(x, y, player) {
            const movesList = document.getElementById('moves-list');
            const moveNumber = movesList.querySelectorAll('.move-item').length + 1;
            const letter = letters[y];
            const number = 15 - x;
            
            // 创建新的记录项
            const moveItem = document.createElement('li');
            moveItem.className = `move-item ${player === 1 ? 'black' : 'white'}`;
            moveItem.textContent = `${moveNumber}. ${player === 1 ? '黑' : '白'} ${letter}${number}`;
            
            // 检查是否需要创建新的块
            if (moveNumber % 20 === 1) { // 每20步创建一个新块
                const blockDiv = document.createElement('div');
                blockDiv.className = 'moves-block';
                
                const header = document.createElement('div');
                header.className = 'block-header';
                header.textContent = `第 ${Math.floor((moveNumber-1)/20) + 1} 块`;
                
                const moveList = document.createElement('ul');
                moveList.className = 'move-list';
                
                blockDiv.appendChild(header);
                blockDiv.appendChild(moveList);
                movesList.appendChild(blockDiv);
            }
            
            // 获取最后一个块的列表并添加记录
            const lastBlock = movesList.lastElementChild;
            const moveList = lastBlock.querySelector('.move-list');
            moveList.appendChild(moveItem);
            
            // 自动滚动到最新记录
            movesList.scrollTop = movesList.scrollHeight;
        }

        // 添加倒计时函数
        function startCountdown() {
            let timeLeft = COUNTDOWN_START;
            countdownAlert.style.display = 'block';
            countdownAlert.textContent = `将在 ${timeLeft} 秒后自动随机落子`;

            if (countdownInterval) {
                clearInterval(countdownInterval);
            }

            countdownInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    countdownAlert.textContent = `将在 ${timeLeft} 秒后自动随机落子`;
    } else {
                    clearInterval(countdownInterval);
                    countdownAlert.style.display = 'none';
                }
            }, 1000);
        }

        // 添加 UTC 时间更新函数
        function updateUTCTime() {
            const now = new Date();
            const hours = now.getUTCHours().toString().padStart(2, '0');
            const minutes = now.getUTCMinutes().toString().padStart(2, '0');
            const seconds = now.getUTCSeconds().toString().padStart(2, '0');
            const milliseconds = Math.floor(now.getUTCMilliseconds() / 10).toString().padStart(2, '0');
            
            document.getElementById('utc-display').textContent = 
                `${hours}:${minutes}:${seconds}.${milliseconds}`;
        }

        // 修改计时器初始化函数
        function startTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            
            let lastFrameTime = performance.now();
            const targetFrameRate = 1000; // 每秒更新一次游戏计时器
            
            function timerLoop(currentTime) {
                if (!gameStartTime) return;

                const elapsed = currentTime - lastFrameTime;
                if (elapsed >= targetFrameRate) {
                    updateTimerDisplay();
                    lastFrameTime = currentTime;
                }
                
                // 更新 UTC 时间（每 100ms 更新一次）
                updateUTCTime();
                
                timerAnimationFrame = requestAnimationFrame(timerLoop);
            }

            timerAnimationFrame = requestAnimationFrame(timerLoop);
        }

        // 在游戏结束时不需要停止 UTC 时间显示
        function stopTimer() {
            if (timerAnimationFrame) {
                cancelAnimationFrame(timerAnimationFrame);
                timerAnimationFrame = null;
            }
            // 继续更新 UTC 时间
            requestAnimationFrame(function updateUTC() {
                updateUTCTime();
                requestAnimationFrame(updateUTC);
            });
        }

        // 初始化时立即开始显示 UTC 时间
        requestAnimationFrame(function updateUTC() {
            updateUTCTime();
            requestAnimationFrame(updateUTC);
        });

        // 添加聊天相关代码
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');
        const chatMessages = document.getElementById('chat-messages');

        // 发送消息
        function sendMessage() {
            const message = chatInput.value.trim();
            if (!message) return;
            
            socket.emit('chat_message', {
                room,
                message,
                player: myPlayer
            });
            
            chatInput.value = '';
        }

        // 监听发送按钮点击
        sendButton.addEventListener('click', sendMessage);

        // 监听回车键
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // 接收消息
        socket.on('chat_message', (data) => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${data.player === myPlayer ? 'sent' : 'received'}`;
            messageDiv.textContent = `${data.player === 1 ? '黑方' : '白方'} ${data.timestamp}: ${data.message}`;
            
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });

        // 添加玩家加入通知处理
        socket.on('player_joined', (data) => {
            // 创建系统消息
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message system';
            messageDiv.textContent = `${data.timestamp} - ${data.message}`;
            
            // 添加到聊天区域
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 可选：添加音效提示
            const audio = new Audio('/static/audio/notification.mp3');
            audio.play().catch(e => console.log('播放提示音失败:', e));
        });

        // 启动游戏
        initGame();