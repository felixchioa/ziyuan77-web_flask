import random
from collections import Counter
import tempfile
import os
from datetime import datetime, timedelta
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
from app.decorators import admin_required
import glob

logger = Logger('routes')

# 存储游戏数据
games = {}
xiangqi_games = {}  # 存储象棋游戏数据

client = get_mongo_client()
chat_db = client['chat']
chat_collection = chat_db['messages']
users_collection = chat_db['users']

online_users = {}
user_rooms = {}  # 用于跟踪用户与房间的关系

# 添加象棋初始棋盘配置
initialBoard = {
    'red_ju1': {'x': 0, 'y': 0}, 'red_ma1': {'x': 0, 'y': 1}, 'red_xiang1': {'x': 0, 'y': 2},
    'red_shi1': {'x': 0, 'y': 3}, 'red_shuai': {'x': 0, 'y': 4}, 'red_shi2': {'x': 0, 'y': 5},
    'red_xiang2': {'x': 0, 'y': 6}, 'red_ma2': {'x': 0, 'y': 7}, 'red_ju2': {'x': 0, 'y': 8},
    'red_pao1': {'x': 2, 'y': 1}, 'red_pao2': {'x': 2, 'y': 7},
    'red_bing1': {'x': 3, 'y': 0}, 'red_bing2': {'x': 3, 'y': 2}, 'red_bing3': {'x': 3, 'y': 4},
    'red_bing4': {'x': 3, 'y': 6}, 'red_bing5': {'x': 3, 'y': 8},

    'black_ju1': {'x': 9, 'y': 0}, 'black_ma1': {'x': 9, 'y': 1}, 'black_xiang1': {'x': 9, 'y': 2},
    'black_shi1': {'x': 9, 'y': 3}, 'black_jiang': {'x': 9, 'y': 4}, 'black_shi2': {'x': 9, 'y': 5},
    'black_xiang2': {'x': 9, 'y': 6}, 'black_ma2': {'x': 9, 'y': 7}, 'black_ju2': {'x': 9, 'y': 8},
    'black_pao1': {'x': 7, 'y': 1}, 'black_pao2': {'x': 7, 'y': 7},
    'black_zu1': {'x': 6, 'y': 0}, 'black_zu2': {'x': 6, 'y': 2}, 'black_zu3': {'x': 6, 'y': 4},
    'black_zu4': {'x': 6, 'y': 6}, 'black_zu5': {'x': 6, 'y': 8}
}


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
    # 生成会话ID
    if 'user_id' not in session:
        session['user_id'] = str(ObjectId())

    # 更新用户最后在线时间
    online_users[session['user_id']] = datetime.now()

    # 清理过期用户
    cleanup_online_users()

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
    """处理用户连接"""
    if 'user_id' in session:
        online_users[session['user_id']] = datetime.now()
        emit('update_online_count', {'count': len(online_users)}, broadcast=True)

    if session.get('is_admin'):
        print("Admin connected, starting background task")
        socketio.start_background_task(background_task)


@socketio.on('disconnect')
def handle_disconnect():
    """处理用户断开连接"""
    if 'user_id' in session:
        online_users.pop(session['user_id'], None)
        emit('update_online_count', {'count': len(online_users)}, broadcast=True)


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


@current_app.route('/gomoku')
def gomoku():
    return render_template('gomoku.html')


@current_app.route('/join_game', methods=['POST'])
def join_game():
    room = request.json.get('room')
    if not room:
        return jsonify({'error': '房间号不能为空'}), 400
        
    if room not in games:
        return jsonify({'error': '房间不存在'}), 404

    game = games[room]
    if len(game['players']) >= 2:
        return jsonify({'error': '房间已满'}), 400

    # 第二个玩家是白棋
    game['players'].append(2)
    
    return jsonify({
        'message': '加入游戏成功',
        'player': 2,
        'room': room
    }), 200


@current_app.route('/create_game', methods=['POST'])
def create_game():
    data = request.json
    room = data.get('room')
    allow_undo = data.get('allow_undo', False)  # 是否允许悔棋
    allow_surrender = data.get('allow_surrender', True)  # 是否允许认输
    
    if not room:
        return jsonify({'error': '房间号不能为空'}), 400
    if room in games:
        return jsonify({'error': '房间已存在'}), 400
    
    games[room] = {
        'board': [[0]*15 for _ in range(15)],
        'turn': 1,
        'players': [],
        'scores': {1: 0, 2: 0},
        'history': [],  # 记录每步棋的历史
        'allow_undo': allow_undo,
        'allow_surrender': allow_surrender
    }
    
    games[room]['players'].append(1)
    
    return jsonify({
        'message': '游戏创建成功',
        'player': 1,
        'room': room,
        'settings': {
            'allow_undo': allow_undo,
            'allow_surrender': allow_surrender
        }
    }), 200


@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
    # 记录用户与房间的关系
    user_rooms[request.sid] = room
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
    data = request.json
    room = data.get('room')
    x = int(data.get('x'))
    y = int(data.get('y'))
    player = int(data.get('player'))

    if not room or x is None or y is None or player is None:
        return jsonify({'error': '请求数据不完整'}), 400

    if room not in games:
        return jsonify({'error': '房间不存在'}), 404

    game = games[room]

    # 检查是否是该玩家的回合
    if game['turn'] != player:
        return jsonify({'error': '不是你的回合'}), 400

    if not (0 <= x < 15 and 0 <= y < 15):
        return jsonify({'error': '无效的坐标'}), 400

    if game['board'][x][y] != 0:
        return jsonify({'error': '该位置已有棋子'}), 400

    # 在落子前保存当前状态
    game['history'].append({
        'board': [row[:] for row in game['board']],
        'turn': game['turn']
    })

    # 落子
    game['board'][x][y] = player
    game['last_move'] = {'x': x, 'y': y, 'player': player}

    # 检查胜负
    if check_winner(game['board'], player):
        game['scores'][player] += 1
        # 先重置回合为黑方
        game['turn'] = 1
        
        # 重置游戏前先广播最后一步
        socketio.emit('update_board', {
            'board': game['board'],
            'turn': 1,  # 确保显示为黑方回合
            'last_move': game['last_move']
        }, room=room)
        
        # 延迟一小段时间后再发送游戏结束消息
        socketio.sleep(0.5)
        socketio.emit('game_over', {
            'winner': player,
            'board': game['board'],
            'scores': game['scores'],
            'turn': 1,  # 确保显示为黑方回合
            'last_move': game['last_move']
        }, room=room)
        
        reset_game(room)
        return jsonify({
            'message': f'玩家{player}获胜!',
            'board': game['board'],
            'turn': 1,
            'last_move': game['last_move']
        }), 200

    # 如果没有胜负，才切换回合
    game['turn'] = 3 - player

    # 广播更新
    socketio.emit('update_board', {
        'board': game['board'],
        'turn': game['turn'],
        'last_move': game['last_move']
    }, room=room)

    return jsonify({
        'message': '移动成功',
        'board': game['board'],
        'turn': game['turn'],
        'last_move': game['last_move']
    }), 200


def reset_game(room):
    games[room]['board'] = [[0]*15 for _ in range(15)]
    games[room]['turn'] = 1
    games[room]['last_move'] = None


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


@current_app.route('/delete_game', methods=['POST'])
def delete_game():
    room = request.json.get('room')
    if not room:
        return jsonify({'error': '房间号不能为空'}), 400
        
    if room not in games:
        return jsonify({'error': '房间不存在'}), 404
        
    # 通知房间内的所有玩家游戏已被删除
    socketio.emit('game_deleted', {'message': '房间已被删除'}, room=room)
    
    # 删除房间
    del games[room]
    
    return jsonify({'message': '房间删除成功'}), 200


@current_app.route('/undo_move', methods=['POST'])
def undo_move():
    data = request.json
    room = data.get('room')
    player = data.get('player')

    if not room or room not in games:
        return jsonify({'error': '房间不存在'}), 404

    game = games[room]
    
    if not game['allow_undo']:
        return jsonify({'error': '该房间不允许悔棋'}), 400
        
    if not game['history']:
        return jsonify({'error': '没有可以悔棋的步骤'}), 400

    # 恢复到上一步
    last_move = game['history'].pop()
    game['board'] = last_move['board']
    game['turn'] = last_move['turn']

    # 广播更新
    socketio.emit('update_board', {
        'board': game['board'],
        'turn': game['turn']
    }, room=room)

    return jsonify({'message': '悔棋成功'}), 200


@current_app.route('/surrender', methods=['POST'])
def surrender():
    data = request.json
    room = data.get('room')
    player = data.get('player')

    if not room or room not in games:
        return jsonify({'error': '房间不存在'}), 404

    game = games[room]
    
    if not game['allow_surrender']:
        return jsonify({'error': '该房间不允许认输'}), 400

    # 对手获胜
    winner = 3 - player
    game['scores'][winner] += 1

    socketio.emit('game_over', {
        'winner': winner,
        'board': game['board'],
        'scores': game['scores'],
        'surrender': True
    }, room=room)

    reset_game(room)
    return jsonify({'message': '认输成功'}), 200


def cleanup_online_users():
    """清理超时的用户"""
    current_time = datetime.now()
    timeout = timedelta(minutes=5)  # 5分钟超时
    expired = [sid for sid, last_seen in online_users.items() 
              if current_time - last_seen > timeout]
    for sid in expired:
        online_users.pop(sid, None)


@socketio.on('chat_message')
def handle_chat_message(data):
    """处理聊天消息"""
    room = data.get('room')
    message = data.get('message')
    player = data.get('player')
    
    if not room or not message or player not in [1, 2]:
        return
    
    # 广播消息到房间
    emit('chat_message', {
        'message': message,
        'player': player,
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }, room=room)


@current_app.route('/join_gomoku_game', methods=['POST'])
def join_gomoku_game():
    room = request.json.get('room')
    if not room:
        return jsonify({'error': '房间号不能为空'}), 400
        
    if room not in games:
        return jsonify({'error': '房间不存在'}), 404
        
    if games[room]['player2']:
        return jsonify({'error': '房间已满'}), 400
        
    games[room]['player2'] = True
    # 通知房间内的玩家有新玩家加入
    socketio.emit('player_joined', {
        'message': '对手已加入游戏',
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }, room=room)
    
    return jsonify({
        'message': '加入成功',
        'player': 2
    }), 200


@current_app.route('/admin/gomoku')
@admin_required  # 需要添加管理员验证装饰器
def admin_gomoku():
    return render_template('admin/gomoku.html')


@current_app.route('/api/admin/gomoku/stats')
@admin_required
def get_gomoku_stats():
    try:
        active_rooms = len([room for room in games.values() if room['player1'] and room['player2']])
        online_players = len(set(player for room in games.values() 
                               for player in [room['player1'], room['player2']] if player))
        spectators = sum(len(room.get('spectators', [])) for room in games.values())
        
        stats = {
            'activeRooms': active_rooms,
            'onlinePlayers': online_players,
            'spectators': spectators
        }
        print("Fetched stats:", stats)  # 添加调试输出
        return jsonify(stats)
    except Exception as e:
        print(f"Error getting stats: {str(e)}")
        return jsonify({
            'activeRooms': 0,
            'onlinePlayers': 0,
            'spectators': 0
        })


@current_app.route('/api/admin/gomoku/rooms')
@admin_required
def get_gomoku_rooms():
    rooms = []
    for room_id, room in games.items():
        try:
            room_data = {
                'id': room_id,
                'player1': '黑方' if room.get('player1') else '等待中',
                'player2': '白方' if room.get('player2') else '等待中',
                'spectators': room.get('spectators', []),
                'status': '进行中' if room.get('player1') and room.get('player2') else '等待中',
                'board': room.get('board', []),
                'turn': room.get('turn', 1),
                'scores': room.get('scores', {1: 0, 2: 0})
            }
            rooms.append(room_data)
        except Exception as e:
            print(f"Error processing room {room_id}: {str(e)}")
            continue
    
    print("Fetched rooms:", rooms)  # 添加调试输出
    return jsonify(rooms)


@current_app.route('/api/admin/gomoku/rooms/<room_id>', methods=['DELETE'])
@admin_required
def delete_gomoku_room(room_id):
    if room_id in games:
        del games[room_id]
        socketio.emit('game_deleted', {'message': '房间已被管理员删除'}, room=room_id)
        return jsonify({'message': '删除成功'})
    return jsonify({'error': '房间不存在'}), 404


@current_app.route('/api/admin/gomoku/rooms/clear-inactive', methods=['POST'])
@admin_required
def clear_inactive_gomoku_rooms():
    inactive_rooms = [room_id for room_id, room in games.items()
                     if not room['player1'] or not room['player2']]
    for room_id in inactive_rooms:
        del games[room_id]
        socketio.emit('game_deleted', {'message': '非活跃房间已被清理'}, room=room_id)
    
    return jsonify({'message': f'已清理 {len(inactive_rooms)} 个非活跃房间'})


@current_app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        password = request.form.get('password')
        if password == os.getenv('ADMIN_PASSWORD', 'admin123'):  # 从环境变量获取密码
            session['is_admin'] = True
            return redirect(url_for('admin_gomoku'))
        return jsonify({'error': '密码错误'}), 401
    return render_template('admin/login.html')


@current_app.route('/create_gomoku_game', methods=['POST'])
def create_gomoku_game():
    room = request.json.get('room')
    if not room:
        return jsonify({'error': '房间号不能为空'}), 400
        
    if room in games:
        return jsonify({'error': '房间已存在'}), 400
        
    games[room] = {
        'board': [[0]*15 for _ in range(15)],
        'turn': 1,
        'player1': True,  # 黑方
        'player2': False,  # 白方
        'spectators': [],  # 观战者列表
        'scores': {1: 0, 2: 0},
        'history': [],
        'last_move': None,
        'allow_undo': True,
        'allow_surrender': True
    }
    
    return jsonify({
        'message': '创建成功',
        'player': 1
    }), 200


@current_app.route('/admin/system')
@admin_required
def admin_system():
    return render_template('admin/system.html')


@current_app.route('/api/admin/system/stats')
@admin_required
def get_system_stats():
    from app.utils.system_monitor import (
        get_system_info, get_cpu_info, 
        get_memory_info, get_disk_info,
        get_network_info
    )
    
    try:
        data = {
            'system': get_system_info(),
            'cpu': get_cpu_info(),
            'memory': get_memory_info(),
            'disk': get_disk_info(),
            'network': get_network_info(),
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        print("System stats:", data)  # 添加调试输出
        return jsonify(data)
    except Exception as e:
        print(f"Error getting system stats: {str(e)}")  # 添加错误输出
        return jsonify({
            'error': str(e),
            'system': {},
            'cpu': {'percent': [0], 'count': 0},
            'memory': {'total': 0, 'available': 0},
            'disk': [],
            'network': {'bytes_sent': 0, 'bytes_recv': 0}
        })


@current_app.route('/admin')
@admin_required
def admin_index():
    return render_template('admin/index.html')


@current_app.route('/admin/logout')
def admin_logout():
    session.pop('is_admin', None)
    return redirect(url_for('admin_login'))


def background_task():
    while True:
        try:
            from app.utils.system_monitor import (
                get_system_info, get_cpu_info, 
                get_memory_info, get_disk_info,
                get_network_info
            )
            
            data = {
                'system': get_system_info(),
                'cpu': get_cpu_info(),
                'memory': get_memory_info(),
                'disk': get_disk_info(),
                'network': get_network_info(),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            socketio.emit('system_stats_update', data)
            print("Broadcasting system stats:", data)
        except Exception as e:
            print(f"Error broadcasting stats: {str(e)}")
        socketio.sleep(5)


@socketio.on('update_interval')
def handle_interval_update(data):
    if session.get('is_admin'):
        global update_interval
        update_interval = data['interval']


@current_app.route('/admin/logs')
@admin_required
def admin_logs():
    return render_template('admin/logs.html')


@current_app.route('/api/admin/logs', methods=['POST'])
@admin_required
def get_logs():
    data = request.json
    level = data.get('level', 'all')
    search = data.get('search', '')
    start_date = data.get('startDate')
    end_date = data.get('endDate')
    page = data.get('page', 1)
    page_size = data.get('pageSize', 50)
    
    # 读取日志文件
    log_dir = 'logs'  # 日志目录
    log_files = glob.glob(os.path.join(log_dir, '*.log'))
    logs = []
    
    for log_file in log_files:
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                for line in f:
                    try:
                        # 解析日志行
                        parts = line.strip().split(' | ')
                        if len(parts) >= 4:
                            timestamp = datetime.strptime(parts[0], '%Y-%m-%d %H:%M:%S')
                            log_level = parts[1]
                            module = parts[2]
                            message = ' | '.join(parts[3:])
                            
                            # 应用过滤条件
                            if level != 'all' and log_level.lower() != level.lower():
                                continue
                                
                            if search and search.lower() not in message.lower():
                                continue
                                
                            if start_date and timestamp < datetime.strptime(start_date, '%Y-%m-%d'):
                                continue
                                
                            if end_date and timestamp > datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1):
                                continue
                                
                            logs.append({
                                'timestamp': timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                                'level': log_level,
                                'module': module,
                                'message': message
                            })
                    except Exception as e:
                        print(f"Error parsing log line: {e}")
                        continue
        except Exception as e:
            print(f"Error reading log file {log_file}: {e}")
            continue
    
    # 排序和分页
    logs.sort(key=lambda x: x['timestamp'], reverse=True)
    total = len(logs)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    page_logs = logs[start_idx:end_idx]
    
    return jsonify({
        'logs': page_logs,
        'total': total
    })


@current_app.route('/xiangqi')
def xiangqi():
    return render_template('xiangqi.html')


@current_app.route('/create_xiangqi_game', methods=['POST'])
def create_xiangqi_game():
    room = request.json.get('room')
    if not room:
        return jsonify({'error': '房间号不能为空'}), 400
        
    if room in games:
        return jsonify({'error': '房间已存在'}), 400
        
    games[room] = {
        'board': initialBoard.copy(),
        'turn': 'red',
        'player_red': True,  # 红方
        'player_black': False,  # 黑方
        'spectators': [],
        'history': [],
        'last_move': None
    }
    
    return jsonify({
        'message': '创建成功',
        'player': 'red'
    }), 200


@current_app.route('/join_xiangqi_game', methods=['POST'])
def join_xiangqi_game():
    room = request.json.get('room')
    if not room:
        return jsonify({'error': '房间号不能为空'}), 400
        
    if room not in games:
        return jsonify({'error': '房间不存在'}), 404
        
    if games[room]['player_black']:
        return jsonify({'error': '房间已满'}), 400
        
    games[room]['player_black'] = True
    socketio.emit('player_joined', {
        'message': '对手已加入游戏',
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }, room=room)
    
    return jsonify({
        'message': '加入成功',
        'player': 'black'
    }), 200


@socketio.on('make_move')
def handle_move(data):
    room = data.get('room')
    if not room or room not in games:
        return
    
    game = games[room]
    piece_id = data.get('piece')
    from_x = data.get('fromX')
    from_y = data.get('fromY')
    to_x = data.get('toX')
    to_y = data.get('toY')
    captured_piece = data.get('capturedPiece')
    
    # 更新棋盘状态
    game['board'][piece_id] = {'x': to_x, 'y': to_y}
    
    # 如果有吃子，从棋盘上移除被吃的棋子
    if captured_piece:
        if captured_piece in game['board']:
            del game['board'][captured_piece]
    
    # 切换回合
    game['turn'] = 'black' if game['turn'] == 'red' else 'red'
    game['last_move'] = {
        'piece': piece_id,
        'from': (from_x, from_y),
        'to': (to_x, to_y)
    }
    
    # 广播更新
    socketio.emit('update_board', {
        'piece': piece_id,
        'fromX': from_x,
        'fromY': from_y,
        'toX': to_x,
        'toY': to_y,
        'turn': game['turn'],
        'capturedPiece': captured_piece
    }, room=room)


@current_app.route('/close_xiangqi_game', methods=['POST'])
def close_xiangqi_game():
    data = request.get_json()
    room = data.get('room')
    if room:
        # 从游戏字典中删除房间
        if room in games:
            del games[room]
    return jsonify({'status': 'success'})


@socketio.on('player_left')
def handle_player_left(data):
    room = data.get('room')
    if room:
        # 通知对手
        emit('opponent_left', room=room, skip_sid=request.sid)
        # 清理房间资源
        if room in games:
            del games[room]
        # 让玩家离开房间
        leave_room(room)