from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
from app.logger import Logger

logger = Logger('routes')

app = Flask("app")
socketio = SocketIO(app, cors_allowed_origins="*")  # 允许跨域

# 为整个应用启用CORS
CORS(app)

with app.app_context():
    # 导入 routes.py 文件
    # pylint: disable=unused-import
    # pylint: disable=import-outside-toplevel
    from app import routes

socketio.init_app(app)


if __name__ == '__main__':
    logger.info("Starting app")
    socketio.run(app, host='0.0.0.0', port=8080)
