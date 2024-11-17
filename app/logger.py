import logging
import os
from logging import INFO, DEBUG, Formatter, getLogger
from logging.handlers import RotatingFileHandler

LOG_FORMAT = '[%(asctime)s] [%(process)d] [%(name)s] [%(levelname)s] %(message)s'


class Logger():
    """
    Logger
    """
    __loggers = {}
    __name = ''

    def __init__(self, name=__name__):
        self.__name = name

        if self.__loggers.get(self.__name):
            self.__logger = self.__loggers.get(self.__name)
        else:
            # Logger Settings.
            self.__logger_setting()

    def __logger_setting(self):
        """
        Infomation Logger Settings
        """
        # if 'debug' is defined in the environment variable, it is set to debug mode.
        if 'DOCKER_CONTAINER' in os.environ:
            is_debug = os.environ.get('DEBUG')
        else:
            is_debug = 'true'

        if is_debug and is_debug.lower() == 'true':
            print('DEV MODE')
            level = DEBUG
            logging.basicConfig(level=logging.INFO)
        else:
            print('PROD MODE')
            level = INFO
            logging.basicConfig(level=logging.INFO)
        self.__logger = getLogger(self.__name)
        self.__logger.setLevel(level)

        formatter = Formatter(LOG_FORMAT)

        # stdout
        if 'DOCKER_CONTAINER' in os.environ:
            log_file_path = f'/usr/src/app/logs/{self.__name}.log'
        else:
            if os.path.exists('logs') and os.path.isdir('logs'):
                log_file_path = f'logs/{self.__name}.log'
            else:
                log_file_path = f'../logs/{self.__name}.log'
        handler = RotatingFileHandler(log_file_path, mode='a', maxBytes=5*1024*1024,
                                      backupCount=2, encoding=None, delay=0)
        handler.setLevel(level)
        handler.setFormatter(formatter)
        self.__logger.addHandler(handler)
        self.__loggers[self.__name] = self.__logger

    def debug(self, msg):
        """
        Debug log output
        """
        self.__logger.debug(msg)

    def info(self, msg):
        """
        Info log output
        """
        self.__logger.info(msg)

    def warn(self, msg):
        """
        Warn log output
        """
        self.__logger.warning(msg)

    def error(self, msg):
        """
        Error log output
        """
        self.__logger.error(msg)
