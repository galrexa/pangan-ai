import os
import json
import pickle
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class FileHandler:
    """Utility class untuk file operations dalam PANGAN-AI"""
    
    @staticmethod
    def ensure_directory(path: str) -> bool:
        """Ensure directory exists, create if not"""
        try:
            Path(path).mkdir(parents=True, exist_ok=True)
            return True
        except Exception as e:
            logger.error(f"Error creating directory {path}: {str(e)}")
            return False
    
    @staticmethod
    def save_json(data: Dict[str, Any], filepath: str) -> bool:
        """Save dictionary to JSON file"""
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)
            logger.info(f"JSON saved to {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error saving JSON to {filepath}: {str(e)}")
            return False
    
    @staticmethod
    def load_json(filepath: str) -> Optional[Dict[str, Any]]:
        """Load JSON file to dictionary"""
        try:
            if not os.path.exists(filepath):
                logger.warning(f"JSON file not found: {filepath}")
                return None
            
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info(f"JSON loaded from {filepath}")
            return data
        except Exception as e:
            logger.error(f"Error loading JSON from {filepath}: {str(e)}")
            return None
    
    @staticmethod
    def save_pickle(obj: Any, filepath: str) -> bool:
        """Save object to pickle file"""
        try:
            with open(filepath, 'wb') as f:
                pickle.dump(obj, f)
            logger.info(f"Pickle saved to {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error saving pickle to {filepath}: {str(e)}")
            return False
    
    @staticmethod
    def load_pickle(filepath: str) -> Optional[Any]:
        """Load object from pickle file"""
        try:
            if not os.path.exists(filepath):
                logger.warning(f"Pickle file not found: {filepath}")
                return None
            
            with open(filepath, 'rb') as f:
                obj = pickle.load(f)
            logger.info(f"Pickle loaded from {filepath}")
            return obj
        except Exception as e:
            logger.error(f"Error loading pickle from {filepath}: {str(e)}")
            return None
    
    @staticmethod
    def save_csv(data: pd.DataFrame, filepath: str, index: bool = False) -> bool:
        """Save DataFrame to CSV file"""
        try:
            data.to_csv(filepath, index=index, encoding='utf-8')
            logger.info(f"CSV saved to {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error saving CSV to {filepath}: {str(e)}")
            return False
    
    @staticmethod
    def load_csv(filepath: str) -> Optional[pd.DataFrame]:
        """Load CSV file to DataFrame"""
        try:
            if not os.path.exists(filepath):
                logger.warning(f"CSV file not found: {filepath}")
                return None
            
            data = pd.read_csv(filepath, encoding='utf-8')
            logger.info(f"CSV loaded from {filepath}")
            return data
        except Exception as e:
            logger.error(f"Error loading CSV from {filepath}: {str(e)}")
            return None
    
    @staticmethod
    def get_file_size(filepath: str) -> Optional[int]:
        """Get file size in bytes"""
        try:
            if os.path.exists(filepath):
                return os.path.getsize(filepath)
            return None
        except Exception as e:
            logger.error(f"Error getting file size for {filepath}: {str(e)}")
            return None
    
    @staticmethod
    def list_files(directory: str, extension: str = None) -> List[str]:
        """List files in directory with optional extension filter"""
        try:
            path = Path(directory)
            if not path.exists():
                return []
            
            if extension:
                pattern = f"*.{extension.lstrip('.')}"
                files = list(path.glob(pattern))
            else:
                files = [f for f in path.iterdir() if f.is_file()]
            
            return [str(f) for f in files]
        except Exception as e:
            logger.error(f"Error listing files in {directory}: {str(e)}")
            return []
    
    @staticmethod
    def delete_file(filepath: str) -> bool:
        """Delete file safely"""
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info(f"File deleted: {filepath}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting file {filepath}: {str(e)}")
            return False
    
    @staticmethod
    def copy_file(source: str, destination: str) -> bool:
        """Copy file from source to destination"""
        try:
            import shutil
            shutil.copy2(source, destination)
            logger.info(f"File copied from {source} to {destination}")
            return True
        except Exception as e:
            logger.error(f"Error copying file from {source} to {destination}: {str(e)}")
            return False
    
    @staticmethod
    def backup_file(filepath: str, backup_dir: str = None) -> Optional[str]:
        """Create backup of file with timestamp"""
        try:
            from datetime import datetime
            
            if not os.path.exists(filepath):
                return None
            
            # Default backup directory
            if backup_dir is None:
                backup_dir = os.path.dirname(filepath)
            
            # Ensure backup directory exists
            FileHandler.ensure_directory(backup_dir)
            
            # Generate backup filename
            filename = os.path.basename(filepath)
            name, ext = os.path.splitext(filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"{name}_backup_{timestamp}{ext}"
            backup_path = os.path.join(backup_dir, backup_filename)
            
            # Copy file
            if FileHandler.copy_file(filepath, backup_path):
                return backup_path
            return None
            
        except Exception as e:
            logger.error(f"Error creating backup for {filepath}: {str(e)}")
            return None