import random
from collections import Counter
import tempfile
import os
from datetime import datetime
from bson import json_util
from bson.objectid import ObjectId
import requests
from flask import (
    request, jsonify, render_template, current_app, send_file,
    send_from_directory, session, redirect, url_for
)
from werkzeug.security import generate_password_hash, check_password_hash
from app.db_config import get_mongo_client
from app import socketio
from app.logger import Logger
from flask_socketio import emit, join_room, leave_room

logger = Logger('routes')

client = get_mongo_client()
chat_db = client['chat']
chat_collection = chat_db['messages']
users_collection = chat_db['users']

online_users = {}


@current_app.before_request
def before_request():
    logger.debug(f"Received request: {request.method} {request.path}")


@current_app.after_request
def after_request(response):
    logger.debug(f"Response status: {response.status}")
    return response


@current_app.errorhandler(404)
def page_not_found(e):
    logger.error(f"Page not found: {request.path}")
    return jsonify(error="Page not found"), 404


@current_app.errorhandler(500)
def internal_server_error(e):
    logger.error(f"Internal server error: {str(e)}")
    return jsonify(error="Internal server error"), 500


@current_app.route('/robots.txt')
def serve_robots():
    return send_from_directory('static', 'robots.txt')


@current_app.route('/')
def index():
    logger.debug("Rendering index.html")
    return render_template('index.html')


@current_app.route('/projects')
def projects():
    logger.debug("Rendering projects.html")
    return render_template('projects.html')


@current_app.route('/tools')
def tools():
    logger.debug("Rendering tools.html")
    return render_template('tools.html')


@current_app.route('/daily')
def daily():
    logger.debug("Rendering daily.html")
    return render_template('daily.html')


@current_app.route('/BingSiteAuth.xml')
def serve_bing_file():
    return send_from_directory('static', 'BingSiteAuth.xml')


@current_app.route('/sitemap_location.xml')
def serve_sitemap():
    return send_from_directory('static', 'sitemap_location.xml')


@current_app.route('/password', methods=['GET', 'POST'])
def generate_password():
    if request.method == 'POST':
        length = int(request.form.get('length', 16))
        num = request.form.get('num') == "true"
        letter = request.form.get('letter') == "true"
        symbol = request.form.get('symbol') == "true"
        required_chars = request.form.get('requiredChars', '')

        if len(required_chars) > length:
            return jsonify(error="必须包含的字符长度超过密码总长度"), 400

        num_list = '0123456789'
        letter_list = 'abcdefghijklmnopqrstuvwxyz'
        symbol_list = '!@#$%^&*()-_+=[]{}|;:,.<>?/~`'

        char_pool = ""
        if num:
            char_pool += num_list
        if letter:
            char_pool += letter_list
        if symbol:
            char_pool += symbol_list

        if not char_pool:
            return jsonify(error="请至少选择一个字符集（数字、字母或符号）"), 400

        password = ""
        if char_pool:
            while True:
                password = required_chars
                remaining_length = length - len(required_chars)
                password += ''.join(random.choice(char_pool) for _ in range(remaining_length))
                char_count = Counter(password[len(required_chars):])
                if all(count <= 2 for count in char_count.values()):
                    break

        return jsonify(password=password)
    else:
        return render_template('password.html')


@current_app.route('/worldtime')
def worldtime():
    logger.debug("Rendering worldtime.html")
    return render_template('worldtime.html')


@current_app.route('/excel')
def excel():
    logger.debug("Rendering excel_if.html")
    return render_template('excel_if.html')


@current_app.route('/calculator')
def calculator():
    logger.debug("Rendering calculator.html")
    return render_template('calculator.html')


@current_app.route('/math')
def math():
    logger.debug("Rendering math.html")
    return render_template('math.html')


@current_app.route('/download/index', methods=['GET', 'POST'])
def download_index():
    logger.debug("Rendering download.html")
    return render_template('download.html')


@current_app.route('/download', methods=['POST'])
def download():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        headers = {
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                '(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            )
        }
        response = requests.get(
            url, headers=headers, stream=True, timeout=10
        )
        if response.status_code == 200:
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                for chunk in response.iter_content(chunk_size=8192):
                    tmp_file.write(chunk)
                tmp_file_path = tmp_file.name

            return send_file(tmp_file_path, as_attachment=True, download_name='downloaded_file',
                             mimetype='application/octet-stream')
        else:
            return jsonify({'error': 'Failed to download directly'}), 400
    except Exception as e:
        logger.error(f"Download error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)


@current_app.route('/ssh_commands')
def ssh_commands():
    logger.debug("Rendering ssh_commands.html")
    return render_template('ssh_commands.html')


@current_app.route('/ground1')
def ground1():
    logger.debug("Rendering ground1.html")
    return render_template('ground1.html')


@current_app.route('/ground2')
def ground2():
    logger.debug("Rendering ground2.html")
    return render_template('ground2.html')


@current_app.route('/ground')
def ground():
    logger.debug("Rendering ground.html")
    return render_template('ground.html')


@current_app.route('/ground3')
def ground3():
    logger.debug("Rendering ground3.html")
    return render_template('ground3.html')


@current_app.route('/text')
def text():
    logger.debug("Rendering text.html")
    return render_template('text.html')


@current_app.route('/cmd_commands')
def cmd_commands():
    logger.debug("Rendering cmd_commands.html")
    return render_template('cmd_commands.html')


@current_app.route('/web')
def web():
    logger.debug("Rendering web.html")
    return render_template('web.html')


@current_app.route('/win11')
def win11():
    logger.debug("Rendering win11.html")
    return render_template('win11.html')

# 此至 422 行为聊天


@current_app.route('/crawl', methods=['POST'])
def crawl():
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    try:
        headers = {
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                '(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            )
        }
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            return jsonify({'content': response.text[:1000]})
        else:
            return jsonify({'error': 'Failed to crawl the URL'}), 400
    except Exception as e:
        logger.error(f"Crawl error: {e}")
        return jsonify({'error': str(e)}), 500


@current_app.route('/get_messages', methods=['GET'])
def get_messages():
    try:
        logger.debug("Fetching messages from MongoDB")
        messages = list(chat_collection.find({}, {'_id': 0}).sort('timestamp', -1))
        logger.debug(f"Fetched messages: {messages}")
        return jsonify({'messages': messages[::-1]})
    except Exception as e:
        logger.error(f"Error retrieving messages from MongoDB: {e}")
        return jsonify({'error': str(e)}), 500


@socketio.on('message')
def handle_message(data):
    try:
        logger.debug(f"Received message: {data}")
        data['timestamp'] = datetime.now()
        data['timestamp'] = json_util.dumps(data['timestamp'])
        data['_id'] = ObjectId()
        chat_collection.insert_one(data)
        logger.debug(f"Message saved: {data}")
        data['_id'] = str(data['_id'])
        socketio.emit('message', data, room='broadcast')
        return {'success': True}
    except Exception as e:
        logger.error(f"Error saving message to MongoDB: {e}")
        return {'success': False}


@socketio.on('connect')
def handle_connect():
    if 'username' in session:
        username = session['username']
        online_users[request.sid] = username
        socketio.emit('user_list', list(online_users.values()))

        # 检查未读消息
        unread_messages = chat_collection.find({'recipient': username, 'unread': True})
        for message in unread_messages:
            socketio.emit('private_message', message, room=request.sid)
            # 标记消息为已读
            chat_collection.update_one({'_id': message['_id']}, {'$set': {'unread': False}})


@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in online_users:
        del online_users[request.sid]
        socketio.emit('user_list', list(online_users.values()))


@current_app.route('/add_friend', methods=['POST'])
def add_friend():
    if 'username' not in session:
        return jsonify({'error': '用户未登录'}), 401

    data = request.json
    friend_username = data.get('friend_username')

    if not friend_username:
        return jsonify({'error': '好友用户名不能为空'}), 400

    if friend_username == session['username']:
        return jsonify({'error': '不能添加自己为好友'}), 400

    user = users_collection.find_one({'username': session['username']})
    friend = users_collection.find_one({'username': friend_username})

    if not friend:
        return jsonify({'error': '好友用户不存在'}), 404

    if friend_username in user.get('friends', []):
        return jsonify({'error': '该用户已经是您的好友'}), 400

    users_collection.update_one(
        {'username': session['username']},
        {'$push': {'friends': friend_username}}
    )

    users_collection.update_one(
        {'username': friend_username},
        {'$push': {'friends': session['username']}})
    return jsonify({'message': '好友添加成功'}), 200


@current_app.route('/get_friends', methods=['GET'])
def get_friends():
    if 'username' not in session:
        return jsonify({'error': '用户未登录'}), 401

    user = users_collection.find_one({'username': session['username']})
    if not user:
        return jsonify({'error': '用户不存在'}), 404

    friends = user.get('friends', [])
    return jsonify({'friends': friends}), 200


@current_app.route('/remove_friend', methods=['POST'])
def remove_friend():
    if 'username' not in session:
        return jsonify({'error': '用户未登录'}), 401

    data = request.json
    friend_username = data.get('friend_username')

    if not friend_username:
        return jsonify({'error': '好友用户名不能为空'}), 400

    users_collection.update_one(
        {'username': session['username']},
        {'$pull': {'friends': friend_username}}
    )

    return jsonify({'message': '好友已删除'}), 200


@socketio.on('private_message')
def handle_private_message(data):
    try:
        data['timestamp'] = datetime.now().isoformat()
        data['message_type'] = 'private'
        result = chat_collection.insert_one(data)  # 存储消息
        sender = data.get('sender')
        recipient = data.get('recipient')
        data['_id'] = str(result.inserted_id)
        sender_user = users_collection.find_one({'username': sender})
        if not sender_user:
            return {'success': False, 'error': '发送者不存在'}

        if recipient not in sender_user.get('friends', []):
            return {'success': False, 'error': '接收者不是您的好友'}

        recipient_sid = None
        for sid, username in online_users.items():
            if username == recipient:
                recipient_sid = sid
                break

        if recipient_sid:
            socketio.emit('private_message', data, room=recipient_sid)
            socketio.emit('private_message', data, room=request.sid)
            return {'success': True}
        else:
            # 如果接收方不在线，标记消息为未读
            chat_collection.update_one(
                {'_id': data['_id']},
                {'$set': {'unread': True}}
            )
            return {'success': True, 'message': '用户不在线，消息已存储'}
    except Exception as e:
        logger.error(f"Error handling private message: {e}")
        return {'success': False, 'error': str(e)}


@current_app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return jsonify({'error': '用户名和密码不能为空'}), 400

        if users_collection.find_one({'username': username}):
            return jsonify({'error': '用户名已存在'}), 400

        hashed_password = generate_password_hash(password)
        users_collection.insert_one({'username': username, 'password': hashed_password, 'friends': []})

        return jsonify({'message': '注册成功'}), 201
    return render_template('register.html')


@current_app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')

        user = users_collection.find_one({'username': username})
        if user and check_password_hash(user['password'], password):
            session['username'] = username
            return jsonify({'message': '登录成功'}), 200
        return jsonify({'error': '用户名或密码错误'}), 400
    return render_template('login.html')


@current_app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))


@current_app.route('/chat')
def chat():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('chat.html')


@current_app.route('/clean', methods=['GET', 'POST'])
def clean():
    data = request.json
    password = data.get('password')
    predefined_password = "Passw0rdQq20120301xhdndmm"

    if password != predefined_password:
        return jsonify({'error': '密码错误'}), 403

    try:
        chat_collection.delete_many({})
        logger.info("All messages have been deleted.")
        return jsonify({'message': '所有消息已被清空'}), 200
    except Exception as e:
        logger.error(f"Error cleaning messages: {e}")
        return jsonify({'error': str(e)}), 500


@current_app.route('/favicon.ico')
def favicon():
    return send_from_directory(current_app.static_folder, 'favicon.ico', mimetype='image/vnd.microsoft.icon')


games = {}


@current_app.route('/gomoku')
def gomoku():
    return render_template('gomoku.html')


@current_app.route('/join_game', methods=['POST'])
def join_game():
    room = request.json.get('room')
    if room not in games:
        return jsonify({'error': '房间不存在'}), 404

    game = games[room]
    player_number = None
    if len(game['players']) < 2:
        player_number = len(game['players']) + 1
        game['players'].append(player_number)
    return jsonify({'message': '加入游戏成功', 'room': room, 'player': player_number}), 200


@current_app.route('/create_game', methods=['POST'])
def create_game():
    room = request.json.get('room')
    if not room:
        return jsonify({'error': '房间号不能为空'}), 400
    if room in games:
        return jsonify({'error': '房间已存在'}), 400
    games[room] = {'board': [[0]*15 for _ in range(15)], 'turn': 1, 'players': []}
    return jsonify({'message': '游戏创建成功', 'room': room}), 200


@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
    emit('message', {'msg': 'A player has entered the room.'}, room=room)


def check_winner(board, player):
    # 检查所有可能的胜利方向
    directions = [(1, 0), (0, 1), (1, 1), (1, -1)]
    for x in range(15):
        for y in range(15):
            if board[x][y] == player:
                for dx, dy in directions:
                    count = 0
                    for step in range(5):
                        nx, ny = x + step * dx, y + step * dy
                        if 0 <= nx < 15 and 0 <= ny < 15 and board[nx][ny] == player:
                            count += 1
                        else:
                            break
                    if count == 5:
                        return True
    return False


@current_app.route('/make_move', methods=['POST'])
def make_move():
    room = request.json.get('room')
    x = int(request.json.get('x'))
    y = int(request.json.get('y'))
    player = int(request.json.get('player'))

    if not room or x is None or y is None or player is None:
        return jsonify({'error': '请求数据不完整'}), 400

    if room not in games:
        return jsonify({'error': '房间不存在'}), 404

    game = games[room]

    if player not in [1, 2]:
        return jsonify({'error': '无效的玩家'}), 400

    if game['turn'] != player:
        return jsonify({'error': '不是你的回合'}), 400

    if not (0 <= x < 15 and 0 <= y < 15):
        return jsonify({'error': '无效的坐标'}), 400

    if game['board'][x][y] != 0:
        return jsonify({'error': '无效的移动'}), 400

    game['board'][x][y] = player

    # 检查胜负
    if check_winner(game['board'], player):
        if 'scores' not in game:
            game['scores'] = {1: 0, 2: 0}
        game['scores'][player] += 1

        socketio.emit('game_over', {'winner': player, 'board': game['board'], 'scores': game['scores']}, room=room)
        reset_game(room)
        return jsonify({'message': f'玩家{player}获胜!', 'board': game['board']}), 200

    game['turn'] = 3 - player  # 切换玩家

    # 使用 WebSocket 上下文中的房间标识符
    socketio.emit('update_board', {'board': game['board'], 'turn': game['turn']}, room=room)

    return jsonify({'message': '移动成功', 'board': game['board'], 'player': 3 - player}), 200


def reset_game(room):
    games[room]['board'] = [[0]*15 for _ in range(15)]
    games[room]['turn'] = 1


@current_app.route('/reset_game', methods=['POST'])
def reset_game_route():
    room = request.json.get('room')
    if room in games:
        reset_game(room)
        socketio.emit('reset_board', room=room)
        return jsonify({'message': '游戏已重置'}), 200
    return jsonify({'error': '房间不存在'}), 404


@current_app.route('/close_room', methods=['POST'])
def close_room():
    room = request.json.get('room')
    if room in games:
        del games[room]
        socketio.emit('close_room', room=room)
        return jsonify({'message': '房间已关闭'}), 200
    return jsonify({'error': '房间不存在'}), 404


@socketio.on('leave')
def on_leave(data):
    room = data['room']
    leave_room(room)
    emit('message', {'msg': f'{data["username"]} has left the room.'}, room=room)

"""
围棋代码,未修复bug,暂时注释
@current_app.route('/go')
def go():
    return render_template('go.html')

# 创建一个新的游戏字典来存储围棋游戏
go_games = {}

@current_app.route('/create_go_game', methods=['POST'])
def create_go_game():
    room = request.json.get('room')
    if not room:
        return jsonify({'error': '房间号不能为空'}), 400
    if room in go_games:
        return jsonify({'error': '房间已存在'}), 400
    
    go_games[room] = {
        'board': [[0]*19 for _ in range(19)],
        'turn': 1,  # 1代表黑棋，2代表白棋
        'players': [],
        'last_board': None,  # 用于检查劫争
        'captured': {1: 0, 2: 0},  # 记录双方提子数
        'pass_count': 0  # 记录连续PASS的次数
    }
    return jsonify({'message': '游戏创建成功', 'room': room}), 200

@current_app.route('/join_go_game', methods=['POST'])
def join_go_game():
    room = request.json.get('room')
    if room not in go_games:
        return jsonify({'error': '房间不存在'}), 404

    game = go_games[room]
    player_number = None
    if len(game['players']) < 2:
        player_number = len(game['players']) + 1
        game['players'].append(player_number)
    return jsonify({
        'message': '加入游戏成功', 
        'room': room, 
        'player': player_number
    }), 200

def count_liberties(board, x, y, checked=None):
    计算一个棋子或棋组的气
    if checked is None:
        checked = set()
    
    if not (0 <= x < 19 and 0 <= y < 19):
        return 0
    
    position = (x, y)
    if position in checked:
        return 0
        
    checked.add(position)
    color = board[x][y]
    if color == 0:
        return 1
    
    liberties = 0
    for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
        next_x, next_y = x + dx, y + dy
        if 0 <= next_x < 19 and 0 <= next_y < 19:
            if board[next_x][next_y] == 0:
                liberties += 1
            elif board[next_x][next_y] == color:
                liberties += count_liberties(board, next_x, next_y, checked)
    return liberties

def is_valid_move(game, x, y, player):
    检查是否是有效的落子
    board = game['board']
    if board[x][y] != 0:
        return False
        
    # 临时落子以检查是否自杀或劫争
    board[x][y] = player
    
    # 检查是否有气
    has_liberties = count_liberties(board, x, y) > 0
    
    
    # 如果没气，检查是否能提对方的子
    if not has_liberties:
        can_capture = False
        for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
            next_x, next_y = x + dx, y + dy
            if 0 <= next_x < 19 and 0 <= next_y < 19:
                if board[next_x][next_y] == 3 - player:
                    if count_liberties(board, next_x, next_y) == 0:
                        can_capture = True
                        break
        if not can_capture:
            board[x][y] = 0  # 恢复棋盘
            return False
            
    # 检查劫争
    if game['last_board']:
        # 比较当前局面与上一局面
        if all(board[i][j] == game['last_board'][i][j] 
               for i in range(19) for j in range(19)):
            board[x][y] = 0
            return False
            
    board[x][y] = 0  # 恢复棋盘
    return True

@current_app.route('/make_go_move', methods=['POST'])
def make_go_move():
    data = request.json
    room = data.get('room')
    player = int(data.get('player'))
    is_pass = data.get('pass', False)
    
    if room not in go_games:
        return jsonify({'error': '房间不存在'}), 404
        
    game = go_games[room]
    
    # 检查是否是该玩家的回合
    if game['turn'] != player:
        return jsonify({'error': '不是你的回合'}), 400
    
    if is_pass:
        game['pass_count'] += 1
        if game['pass_count'] >= 2:
            # 游戏结束，计算胜负
            result = calculate_score(game)
            socketio.emit('go_game_over', result, room=room)
            return jsonify(result), 200
        game['turn'] = 3 - player
        socketio.emit('update_go_board', {
            'board': game['board'],
            'turn': game['turn'],
            'captured': game['captured']
        }, room=room)
        return jsonify({'message': '玩家选择PASS'}), 200
    
    # 非 pass 的情况
    x = int(data.get('x'))
    y = int(data.get('y'))
    
    game['pass_count'] = 0  # 重置连续PASS计数
    
    if not is_valid_move(game, x, y, player):
        return jsonify({'error': '无效的移动'}), 400
        
    # 保存当前局面用于劫争检查
    game['last_board'] = [row[:] for row in game['board']]
    
    # 落子
    game['board'][x][y] = player
    
    # 检查并提取死子
    captured = check_and_remove_dead_stones(game, x, y, player)
    game['captured'][player] += captured
    
    game['turn'] = 3 - player
    
    socketio.emit('update_go_board', {
        'board': game['board'],
        'turn': game['turn'],
        'captured': game['captured']
    }, room=room)
    
    return jsonify({
        'message': '移动成功',
        'board': game['board'],
        'captured': game['captured']
    }), 200

def check_and_remove_dead_stones(game, x, y, player):
    检查并提取死子，返回提子数量
    captured = 0
    board = game['board']
    for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
        next_x, next_y = x + dx, y + dy
        if 0 <= next_x < 19 and 0 <= next_y < 19:
            if board[next_x][next_y] == 3 - player:
                if count_liberties(board, next_x, next_y) == 0:
                    captured += remove_group(game, next_x, next_y)
    return captured

def remove_group(game, x, y):
    移除一个死棋组，返回提子数量
    count = 0
    color = game['board'][x][y]
    stack = [(x, y)]
    removed = set()
    
    while stack:
        curr_x, curr_y = stack.pop()
        if (curr_x, curr_y) in removed:
            continue
            
        if game['board'][curr_x][curr_y] == color:
            game['board'][curr_x][curr_y] = 0
            removed.add((curr_x, curr_y))
            count += 1
            
            for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
                next_x, next_y = curr_x + dx, curr_y + dy
                if 0 <= next_x < 19 and 0 <= next_y < 19:
                    if game['board'][next_x][next_y] == color:
                        stack.append((next_x, next_y))
    
    return count

def calculate_score(game):
    计算游戏最终得分
    board = game['board']
    territory = [[0]*19 for _ in range(19)]
    black_territory = 0
    white_territory = 0
    
    # 计算领地
    for i in range(19):
        for j in range(19):
            if board[i][j] == 0:
                # 使用flood fill算法确定空点属于谁的领地
                territory_color = determine_territory(board, i, j)
                if territory_color == 1:
                    black_territory += 1
                elif territory_color == 2:
                    white_territory += 1
    
    # 最终得分 = 领地 + 提子数
    black_score = black_territory + game['captured'][1]
    white_score = white_territory + game['captured'][2] + 6.5  # 贴目
    
    return {
        'black_score': black_score,
        'white_score': white_score,
        'winner': 1 if black_score > white_score else 2,
        'territory': territory
    }

def determine_territory(board, x, y):
    确定一片空地属于谁的领地
    checked = set()
    stack = [(x, y)]
    empty_points = set()
    borders = set()
    
    while stack:
        curr_x, curr_y = stack.pop()
        if (curr_x, curr_y) in checked:
            continue
            
        checked.add((curr_x, curr_y))
        if board[curr_x][curr_y] == 0:
            empty_points.add((curr_x, curr_y))
            for dx, dy in [(1,0), (-1,0), (0,1), (0,-1)]:
                next_x, next_y = curr_x + dx, curr_y + dy
                if 0 <= next_x < 19 and 0 <= next_y < 19:
                    if board[next_x][next_y] == 0:
                        stack.append((next_x, next_y))
                    else:
                        borders.add((next_x, next_y))
    
    # 判断边界都是同色则属于该颜色的领地
    border_colors = {board[x][y] for x, y in borders}
    if len(border_colors) == 1:
        return border_colors.pop()
    return 0  # 中立点
"""