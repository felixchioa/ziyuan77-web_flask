import os
from pymongo import MongoClient
from dotenv import load_dotenv
from app.logger import Logger

logger = Logger('config')

load_dotenv()


def get_mongo_client():
    if 'DOCKER_CONTAINER' in os.environ:
        client = MongoClient('mongodb://root:password@mongo:27017/')
        logger.info("Running inside Docker container, using Docker MongoDB settings.")
    else:
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '27017')
        db_user = os.getenv('DB_USER', 'root')
        db_password = os.getenv('DB_PASSWORD', 'password')

        client = MongoClient(f'mongodb://{db_user}:{db_password}@{db_host}:{db_port}/')
        logger.info("Running outside Docker container, using .env MongoDB settings.")

    return client
