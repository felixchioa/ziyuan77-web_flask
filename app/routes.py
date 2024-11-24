import random
from collections import Counter
import tempfile
import os
from datetime import datetime
from bson import json_util
from bson.objectid import ObjectId
import requests
from flask import request, jsonify, render_template, current_app, send_file, send_from_directory, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from app.db_config import get_mongo_client
from app import socketio
from app.logger import Logger


logger = Logger('routes')

client = get_mongo_client()
chat_db = client['chat']
chat_collection = chat_db['messages']
users_collection = chat_db['users']


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

@current_app.route('/BingSiteAuth.xml')
def serve_bing_file():
    return send_from_directory('static', 'BingSiteAuth.xml')


@current_app.route('/password', methods=['GET', 'POST'])
def generate_password():

    if request.method == 'POST':
        length = int(request.form.get('length', 16))  # 默认长度为16
        num = request.form.get('num') == "true"
        letter = request.form.get('letter') == "true"
        symbol = request.form.get('symbol') == "true"
        required_chars = request.form.get('requiredChars', '')

        # 检查必须包含的字符是否超过长度限制
        if len(required_chars) > length:
            return jsonify(error="必须包含的字符长度超过密码总长度"), 400

        # 定义字符集
        num_list = '0123456789'
        letter_list = 'abcdefghijklmnopqrstuvwxyz'
        symbol_list = '!@#$%^&*()-_+=[]{}|;:,.<>?/~`'

        # 根据用户选择生成密码
        char_pool = ""
        if num:
            char_pool += num_list
        if letter:
            char_pool += letter_list
        if symbol:
            char_pool += symbol_list

        # 检查字符池是否为空
        if not char_pool:
            return jsonify(error="请至少选择一个字符集（数字、字母或符号）"), 400

        # 生成密码并检查条件
        password = ""
        if char_pool:
            while True:
                # 先添加必须包含的字符
                password = required_chars
                # 生成剩余的随机字符
                remaining_length = length - len(required_chars)
                password += ''.join(random.choice(char_pool) for _ in range(remaining_length))
                # 检查每个字符是否最多出现两次（不包括required_chars）
                char_count = Counter(password[len(required_chars):])
                if all(count <= 2 for count in char_count.values()):
                    break

        # 返回生成的密码
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


@current_app.route('/crawl', methods=['POST'])
def crawl():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
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
        # 获取当前日期
        # 从 MongoDB 中获取当天的消息
        logger.debug("Fetching messages from MongoDB")
        messages = list(chat_collection.find({}, {'_id': 0}).sort('timestamp', -1))
        logger.debug(f"Fetched messages: {messages}")
        return jsonify({'messages': messages})
    except Exception as e:
        logger.error(f"Error retrieving messages from MongoDB: {e}")
        return jsonify({'error': str(e)}), 500


@socketio.on('message')
def handle_message(data):
    try:
        logger.debug(f"Received message: {data}")
        # 添加时间戳
        data['timestamp'] = datetime.now()

        # 将 datetime 对象转换为可序列化的格式
        data['timestamp'] = json_util.dumps(data['timestamp'])

        # 假设您在某处生成了 ObjectId
        data['_id'] = ObjectId()

        # 保存消息到 MongoDB
        chat_collection.insert_one(data)
        logger.debug(f"Message saved: {data}")

        # 将 ObjectId 转换为字符串
        data['_id'] = str(data['_id'])

        # 向所有客户端广播消息
        socketio.emit('message', data, room='broadcast')

        # 返回成功确认
        return {'success': True}
    except Exception as e:
        logger.error(f"Error saving message to MongoDB: {e}")
        # 返回失败确认
        return {'success': False}


@current_app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(current_app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')


@current_app.route('/socket.io')
def socketio_route():
    return "This is an example response"

@current_app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        print(username, password)
        if not username or not password:
            return jsonify({'error': '用户名和密码不能为空'}), 400

        if users_collection.find_one({'username': username}):
            return jsonify({'error': '用户名已存在'}), 400

        hashed_password = generate_password_hash(password)
        users_collection.insert_one({'username': username, 'password': hashed_password})

        return jsonify({'message': '注册成功'}), 201
    return render_template('register.html')

@current_app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

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
