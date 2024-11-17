from flask import Flask


def create_app():
    app = Flask("app")

    with app.app_context():
        # 导入 routes.py 文件
        # pylint: disable=unused-import
        # pylint: disable=import-outside-toplevel
        from . import routes

    app.logger.debug("Routes have been registered")
    return app
