from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS


socketio = SocketIO()


def create_app():
    app = Flask("app")

    # 为整个应用启用CORS
    CORS(app)

    with app.app_context():
        # 导入 routes.py 文件
        # pylint: disable=unused-import
        # pylint: disable=import-outside-toplevel
        from . import routes

    socketio.init_app(app)
    app.logger.debug("Routes have been registered")
    return app
