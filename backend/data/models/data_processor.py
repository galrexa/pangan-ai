# backend/data/models/data_processor.py - FIXED TO MATCH 28 FEATURES
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.impute import SimpleImputer
from typing import Dict, List, Tuple, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class DataProcessor:
    """
    Handles data loading, preprocessing, and feature engineering for PANGAN-AI
    Updated to match 28-feature LSTM model
    """
    
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.data = None
        self.scalers = {}
        self.commodities = []
        self.regions = []
        
        # Feature columns sesuai model config (28 features total)
        self.price_columns = ['harga']
        self.weather_columns = ['tavg_final', 'rh_avg_final', 'ff_avg_final']
        self.seasonal_columns = ['dum_ramadan', 'dum_idulfitri', 'dum_natal_newyr']
        
        # Features yang akan dibuat untuk match model config
        self.model_feature_columns = [
            "harga",
            "tavg_final", "rh_avg_final", "ff_avg_final",
            "month_sin", "month_cos", "day_sin", "day_cos",
            "is_weekend",
            "dum_ramadan", "dum_idulfitri", "dum_natal_newyr",
            "tavg_flag", "rh_avg_flag", "ff_avg_flag", "imputasi_flag",
            "harga_lag_1", "harga_lag_3", "harga_lag_7", "harga_lag_14",
            "harga_rolling_mean_7", "harga_rolling_std_7",
            "harga_rolling_mean_14", "harga_rolling_std_14",
            "harga_rolling_mean_30", "harga_rolling_std_30",
            "harga_change_1d", "harga_change_7d"
        ]
        
    def load_data(self) -> pd.DataFrame:
        """Load dataset from CSV file"""
        try:
            logger.info(f"Loading dataset from {self.dataset_path}")
            
            if not self.dataset_path.exists():
                raise FileNotFoundError(f"Dataset not found at {self.dataset_path}")
            
            # Load dataset
            self.data = pd.read_csv(self.dataset_path)
            logger.info(f"Raw dataset loaded: {len(self.data)} rows, {len(self.data.columns)} columns")
            
            # Data preprocessing
            self.data = self._preprocess_data(self.data)
            
            # Extract unique commodities and regions
            self.commodities = sorted(self.data['komoditas'].unique().tolist())
            self.regions = sorted(self.data['wilayah'].unique().tolist())
            
            logger.info(f"Dataset processed successfully: {len(self.data)} rows")
            logger.info(f"Commodities: {self.commodities}")
            logger.info(f"Regions: {self.regions}")
            
            return self.data
            
        except Exception as e:
            logger.error(f"Error loading dataset: {str(e)}")
            raise
    
    def _preprocess_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Preprocess and create 28 features to match model"""
        
        # Convert date column
        data['tanggal'] = pd.to_datetime(data['tanggal'])
        data = data.sort_values(['komoditas', 'wilayah', 'tanggal'])
        
        # Filter data dengan harga yang valid
        data = data.dropna(subset=['harga'])
        data = data[data['harga'] > 0]
        
        # Handle missing weather values dan create flags
        weather_columns = ['tavg_final', 'rh_avg_final', 'ff_avg_final']
        for col in weather_columns:
            if col in data.columns:
                data[f'{col.replace("_final", "")}_flag'] = data[col].isna().astype(int)
                data[col] = data[col].fillna(data[col].mean())
            else:
                # Create dummy columns if not exist
                data[col] = 25.0  # Default temperature/humidity
                data[f'{col.replace("_final", "")}_flag'] = 0
        
        # General imputation flag
        data['imputasi_flag'] = 0
        
        # Ensure seasonal dummy variables exist
        seasonal_columns = ['dum_ramadan', 'dum_idulfitri', 'dum_natal_newyr']
        for col in seasonal_columns:
            if col not in data.columns:
                data[col] = 0
        
        # Add time-based features
        data['month'] = data['tanggal'].dt.month
        data['day_of_year'] = data['tanggal'].dt.dayofyear
        data['day_of_week'] = data['tanggal'].dt.dayofweek
        
        # Create cyclical features
        data['month_sin'] = np.sin(2 * np.pi * data['month'] / 12)
        data['month_cos'] = np.cos(2 * np.pi * data['month'] / 12)
        data['day_sin'] = np.sin(2 * np.pi * data['day_of_year'] / 365)
        data['day_cos'] = np.cos(2 * np.pi * data['day_of_year'] / 365)
        
        # Weekend indicator
        data['is_weekend'] = (data['day_of_week'] >= 5).astype(int)
        
        # Create lag features dan rolling features per commodity-region group
        processed_groups = []
        for (commodity, region), group in data.groupby(['komoditas', 'wilayah']):
            group = group.sort_values('tanggal').copy()
            
            # Lag features
            group['harga_lag_1'] = group['harga'].shift(1)
            group['harga_lag_3'] = group['harga'].shift(3)
            group['harga_lag_7'] = group['harga'].shift(7)
            group['harga_lag_14'] = group['harga'].shift(14)
            
            # Rolling features
            group['harga_rolling_mean_7'] = group['harga'].rolling(window=7, min_periods=1).mean()
            group['harga_rolling_std_7'] = group['harga'].rolling(window=7, min_periods=1).std().fillna(0)
            group['harga_rolling_mean_14'] = group['harga'].rolling(window=14, min_periods=1).mean()
            group['harga_rolling_std_14'] = group['harga'].rolling(window=14, min_periods=1).std().fillna(0)
            group['harga_rolling_mean_30'] = group['harga'].rolling(window=30, min_periods=1).mean()
            group['harga_rolling_std_30'] = group['harga'].rolling(window=30, min_periods=1).std().fillna(0)
            
            # Change features
            group['harga_change_1d'] = group['harga'].pct_change(1).fillna(0)
            group['harga_change_7d'] = group['harga'].pct_change(7).fillna(0)
            
            processed_groups.append(group)
        
        # Combine all groups
        data = pd.concat(processed_groups, ignore_index=True)
        
        # Fill NaN values in lag features dengan forward fill
        lag_columns = ['harga_lag_1', 'harga_lag_3', 'harga_lag_7', 'harga_lag_14']
        for col in lag_columns:
            data[col] = data[col].fillna(method='ffill').fillna(data['harga'])
        
        logger.info(f"Data preprocessing completed: {len(data)} valid records")
        logger.info(f"Features created: {len(self.model_feature_columns)} (target: 28)")
        return data
    
    def get_commodity_data(self, commodity: str, region: str = None) -> pd.DataFrame:
        """Get data for specific commodity and region"""
        if self.data is None:
            raise ValueError("Data not loaded. Call load_data() first.")
        
        filtered_data = self.data[self.data['komoditas'] == commodity].copy()
        
        if region and region != 'all':
            filtered_data = filtered_data[filtered_data['wilayah'] == region]
        
        return filtered_data.sort_values('tanggal')
    
    def get_latest_sequence(self, commodity: str, region: str, 
                           sequence_length: int = 30) -> Tuple[np.ndarray, MinMaxScaler]:
        """Get latest sequence for prediction with 28 features"""
        
        data = self.get_commodity_data(commodity, region)
        
        if len(data) < sequence_length:
            raise ValueError(f"Insufficient data for prediction: {len(data)} < {sequence_length}")
        
        # Get latest data
        latest_data = data.tail(sequence_length).copy()
        
        # Select 28 features sesuai model config
        feature_columns = self.model_feature_columns
        
        # Pastikan semua kolom ada
        missing_cols = [col for col in feature_columns if col not in latest_data.columns]
        if missing_cols:
            logger.warning(f"Missing columns: {missing_cols}")
            for col in missing_cols:
                latest_data[col] = 0
        
        # Get features dalam urutan yang benar
        features = latest_data[feature_columns].fillna(0).values
        
        # Scale features
        scaler_key = f"{commodity}_{region}"
        if scaler_key not in self.scalers:
            # Fit scaler menggunakan semua data historical
            self.scalers[scaler_key] = MinMaxScaler()
            all_data = self.get_commodity_data(commodity, region)
            all_features = all_data[feature_columns].fillna(0).values
            self.scalers[scaler_key].fit(all_features)
        
        scaled_features = self.scalers[scaler_key].transform(features)
        
        # Reshape for LSTM input (1, sequence_length, n_features)
        X = scaled_features.reshape(1, sequence_length, len(feature_columns))
        
        logger.info(f"Latest sequence shape: {X.shape} (should be (1, {sequence_length}, 28))")
        
        return X, self.scalers[scaler_key]
    
    def prepare_lstm_data(self, commodity: str, region: str, 
                         sequence_length: int = 30) -> Tuple[np.ndarray, np.ndarray, MinMaxScaler]:
        """
        Prepare data for LSTM model dengan 28 features
        Returns: (X, y, scaler)
        """
        
        # Get commodity data
        data = self.get_commodity_data(commodity, region)
        
        if len(data) < sequence_length + 1:
            raise ValueError(f"Insufficient data for {commodity} in {region}: {len(data)} < {sequence_length + 1}")
        
        # Select 28 features sesuai model config
        feature_columns = self.model_feature_columns
        
        # Pastikan semua kolom ada
        missing_cols = [col for col in feature_columns if col not in data.columns]
        if missing_cols:
            logger.warning(f"Missing columns: {missing_cols}")
            for col in missing_cols:
                data[col] = 0
        
        features = data[feature_columns].fillna(0).values
        
        # Scale features
        scaler_key = f"{commodity}_{region}"
        if scaler_key not in self.scalers:
            self.scalers[scaler_key] = MinMaxScaler()
            scaled_features = self.scalers[scaler_key].fit_transform(features)
        else:
            scaled_features = self.scalers[scaler_key].transform(features)
        
        # Create sequences
        X, y = [], []
        for i in range(sequence_length, len(scaled_features)):
            X.append(scaled_features[i-sequence_length:i])
            y.append(scaled_features[i, 0])  # Price is first column
        
        return np.array(X), np.array(y), self.scalers[scaler_key]
    
    def get_statistics(self, commodity: str, region: str = None) -> Dict:
        """Get statistical summary of commodity data"""
        
        data = self.get_commodity_data(commodity, region)
        
        if len(data) == 0:
            return {}
        
        stats = {
            'count': len(data),
            'current_price': float(data['harga'].iloc[-1]) if len(data) > 0 else 0,
            'avg_price': float(data['harga'].mean()),
            'min_price': float(data['harga'].min()),
            'max_price': float(data['harga'].max()),
            'volatility': float(data['harga'].std() / data['harga'].mean() * 100),
            'date_range': {
                'start': data['tanggal'].min().strftime('%Y-%m-%d'),
                'end': data['tanggal'].max().strftime('%Y-%m-%d')
            }
        }
        
        return stats