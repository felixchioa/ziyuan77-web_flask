from app import create_app
from app.logger import Logger

logger = Logger('routes')

if __name__ == '__main__':
    logger.info("Starting app")
    app = create_app()
    app.run(host='0.0.0.0', port=8080)
