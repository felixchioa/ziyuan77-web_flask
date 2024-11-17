from app import create_app
from app.logger import Logger


if __name__ == '__main__':
    app = create_app()
    logger = Logger('run')
    logger.info("Starting app")
    app.run(host='0.0.0.0', port=5000)
