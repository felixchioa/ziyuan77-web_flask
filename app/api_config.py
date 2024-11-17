import os
from dotenv import load_dotenv
from app.logger import Logger

logger = Logger('config')

TIMEOUT = 5

load_dotenv()

if 'DOCKER_CONTAINER' in os.environ:
    API_URL = 'http://api:8080/xxxx'
    logger.info(f"Using API URL: {API_URL}")
else:
    api_host = os.getenv('API_HOST', 'localhost')
    api_port = os.getenv('API_PORT', '8080')

    API_URL = f'http://{api_host}:{api_port}/xxxx'
    logger.info(f"Using API URL: {API_URL}")
