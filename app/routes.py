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
