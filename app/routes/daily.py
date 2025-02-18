from datetime import datetime
from bson import json_util
from bson.objectid import ObjectId
from flask import jsonify
from app.db_config import get_mongo_client
from app.logger import Logger

logger = Logger('daily')

def get_daily_entries():
    """获取所有日常记录"""
    try:
        client = get_mongo_client()
        db = client['chat']
        entries = list(db.daily.find().sort('date', -1))
        return {
            'success': True,
            'entries': json_util.dumps(entries)
        }
    except Exception as e:
        logger.error(f"Error fetching entries: {str(e)}")
        return {
            'success': False,
            'error': f'获取数据失败: {str(e)}'
        }

def create_daily_entry(data):
    """创建新的日常记录"""
    try:
        if not data or 'date' not in data or 'content' not in data:
            return {
                'success': False,
                'error': '缺少必要的字段'
            }

        client = get_mongo_client()
        db = client['chat']
        entry = {
            'date': data['date'],
            'content': data['content'],
            'rawContent': data.get('rawContent', ''),
            'images': data.get('images', []),
            'created_at': datetime.now()
        }

        result = db.daily.insert_one(entry)
        return {
            'success': True,
            'id': str(result.inserted_id)
        }
    except Exception as e:
        logger.error(f"Error creating entry: {str(e)}")
        return {
            'success': False,
            'error': f'创建记录失败: {str(e)}'
        }

def update_daily_entry(data):
    """更新日常记录"""
    try:
        if not data or 'id' not in data:
            return {
                'success': False,
                'error': '缺少ID字段'
            }

        client = get_mongo_client()
        db = client['chat']
        entry_id = data.pop('id')
        update_data = {
            'date': data.get('date'),
            'content': data.get('content'),
            'rawContent': data.get('rawContent', ''),
            'images': data.get('images', []),
            'updated_at': datetime.now()
        }

        result = db.daily.update_one(
            {'_id': ObjectId(entry_id)},
            {'$set': update_data}
        )

        if result.modified_count > 0:
            return {'success': True}
        else:
            return {
                'success': False,
                'error': '记录未找到或未修改'
            }
    except Exception as e:
        logger.error(f"Error updating entry: {str(e)}")
        return {
            'success': False,
            'error': '更新记录失败'
        }

def delete_daily_entry(entry_id):
    """删除日常记录"""
    try:
        if not entry_id:
            return {
                'success': False,
                'error': '缺少ID参数'
            }

        client = get_mongo_client()
        db = client['chat']
        result = db.daily.delete_one({'_id': ObjectId(entry_id)})

        if result.deleted_count > 0:
            return {'success': True}
        else:
            return {
                'success': False,
                'error': '记录未找到'
            }
    except Exception as e:
        logger.error(f"Error deleting entry: {str(e)}")
        return {
            'success': False,
            'error': '删除记录失败'
        } 