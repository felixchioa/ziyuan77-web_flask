import random
from collections import Counter
from flask import request, jsonify, render_template, current_app
from app.logger import Logger


logger = Logger('routes')


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


@current_app.route('/')
def index():
    logger.debug("Rendering index.html")
    return render_template('index.html')


@current_app.route('/password', methods=['GET', 'POST'])
def generate_password():
    logger.debug("Generating password")
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
