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
    """
    
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.data = None
        self.scalers = {}
        self.commodities = []
        self.regions = []
        
        # Feature columns sesuai dataset existing
        self.price_columns = ['harga']
        self.weather_columns = ['tavg_final', 'rh_avg_final', 'ff_avg_final', 'rr']
        self.seasonal_columns = ['dum_ramadan', 'dum_idulfitri', 'dum_natal_newyr']
        self.all_feature_columns = self.price_columns + self.weather_columns + self.seasonal_columns + ['tahun']
        
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
    
    def _create_mock_dataset(self) -> pd.DataFrame:
        """Create mock dataset for development purposes"""
        
        # 3 komoditas prioritas sesuai proposal
        commodities = ['cabai merah keriting', 'cabai rawit merah', 'bawang merah']
        
        # 7 wilayah Jawa Barat sesuai proposal  
        regions = [
            'kota bandung', 'kota depok', 'kota bekasi', 
            'kabupaten garut', 'kabupaten bandung', 
            'kabupaten cianjur', 'kabupaten majalengka'
        ]
        
        # Generate date range 2022-2025
        date_range = pd.date_range(start='2022-01-01', end='2025-04-30', freq='D')
        
        data = []
        for commodity in commodities:
            for region in regions:
                for date in date_range:
                    # Base price dengan volatilitas sesuai penelitian
                    if 'cabai rawit' in commodity:
                        base_price = 45000
                        volatility = 0.4  # 40% volatilitas
                    elif 'cabai merah' in commodity:
                        base_price = 35000
                        volatility = 0.3  # 30% volatilitas
                    elif 'bawang merah' in commodity:
                        base_price = 25000
                        volatility = 0.16  # 16% volatilitas
                    
                    # Seasonal effects
                    month = date.month
                    seasonal_multiplier = 1.0
                    
                    # Ramadhan effect (bulan 3-4, 12-1)
                    is_ramadhan = month in [3, 4, 12, 1]
                    if is_ramadhan:
                        seasonal_multiplier *= 1.15
                    
                    # Idul Fitri effect
                    is_idul_fitri = month in [4, 5]
                    if is_idul_fitri:
                        seasonal_multiplier *= 1.2
                    
                    # Nataru effect
                    is_nataru = month in [12, 1]
                    if is_nataru:
                        seasonal_multiplier *= 1.1
                    
                    # Random price with trend
                    noise = np.random.normal(0, volatility * 0.1)
                    trend = np.sin(2 * np.pi * date.dayofyear / 365) * 0.1
                    
                    final_price = base_price * seasonal_multiplier * (1 + trend + noise)
                    final_price = max(final_price, base_price * 0.5)  # Floor price
                    
                    # Mock weather data
                    data.append({
                        'tanggal': date,
                        'komoditas': commodity,
                        'wilayah': region,
                        'harga': round(final_price, 0),
                        'suhu_rata_rata': np.random.normal(27, 3),
                        'kelembaban': np.random.normal(75, 10),
                        'curah_hujan': np.random.exponential(5),
                        'kecepatan_angin': np.random.normal(8, 2),
                        'is_ramadhan': is_ramadhan,
                        'is_idul_fitri': is_idul_fitri,
                        'is_nataru': is_nataru
                    })
        
        return pd.DataFrame(data)
    
    def _preprocess_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """Preprocess and clean the dataset sesuai format existing"""
        
        # Convert date column
        data['tanggal'] = pd.to_datetime(data['tanggal'])
        data = data.sort_values(['komoditas', 'wilayah', 'tanggal'])
        
        # Filter data dengan harga yang valid (bukan NaN dan > 0)
        data = data.dropna(subset=['harga'])
        data = data[data['harga'] > 0]
        
        # Handle missing values pada weather features
        weather_columns = ['tavg_final', 'rh_avg_final', 'ff_avg_final', 'rr']
        for col in weather_columns:
            if col in data.columns:
                data[col] = data[col].fillna(data[col].mean())
        
        # Ensure seasonal dummy variables exist
        seasonal_columns = ['dum_ramadan', 'dum_idulfitri', 'dum_natal_newyr']
        for col in seasonal_columns:
            if col not in data.columns:
                data[col] = 0
        
        # Add time-based features
        data['month'] = data['tanggal'].dt.month
        data['day_of_year'] = data['tanggal'].dt.dayofyear
        data['day_of_week'] = data['tanggal'].dt.dayofweek
        
        logger.info(f"Data preprocessing completed: {len(data)} valid records")
        return data
    
    def get_commodity_data(self, commodity: str, region: str = None) -> pd.DataFrame:
        """Get data for specific commodity and region"""
        if self.data is None:
            raise ValueError("Data not loaded. Call load_data() first.")
        
        filtered_data = self.data[self.data['komoditas'] == commodity].copy()
        
        if region and region != 'all':
            filtered_data = filtered_data[filtered_data['wilayah'] == region]
        
        return filtered_data.sort_values('tanggal')
    
    def prepare_lstm_data(self, commodity: str, region: str, 
                         sequence_length: int = 30) -> Tuple[np.ndarray, np.ndarray, MinMaxScaler]:
        """
        Prepare data for LSTM model sesuai dengan format existing model
        Returns: (X, y, scaler)
        """
        
        # Get commodity data
        data = self.get_commodity_data(commodity, region)
        
        if len(data) < sequence_length + 1:
            raise ValueError(f"Insufficient data for {commodity} in {region}: {len(data)} < {sequence_length + 1}")
        
        # Select features sesuai dengan model existing (28 features total)
        feature_columns = self.all_feature_columns + ['month', 'day_of_year', 'day_of_week']
        
        # Pastikan semua kolom ada
        missing_cols = [col for col in feature_columns if col not in data.columns]
        if missing_cols:
            logger.warning(f"Missing columns: {missing_cols}")
            # Add missing columns dengan default values
            for col in missing_cols:
                data[col] = 0
        
        features = data[feature_columns].values
        
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
    
    def get_latest_sequence(self, commodity: str, region: str, 
                           sequence_length: int = 30) -> Tuple[np.ndarray, MinMaxScaler]:
        """Get latest sequence for prediction sesuai format existing"""
        
        data = self.get_commodity_data(commodity, region)
        
        if len(data) < sequence_length:
            raise ValueError(f"Insufficient data for prediction: {len(data)} < {sequence_length}")
        
        # Get latest data
        latest_data = data.tail(sequence_length)
        
        # Select features (28 features total)
        feature_columns = self.all_feature_columns + ['month', 'day_of_year', 'day_of_week']
        
        # Pastikan semua kolom ada
        missing_cols = [col for col in feature_columns if col not in latest_data.columns]
        if missing_cols:
            for col in missing_cols:
                latest_data[col] = 0
        
        features = latest_data[feature_columns].values
        
        # Scale features
        scaler_key = f"{commodity}_{region}"
        if scaler_key not in self.scalers:
            # Fit scaler menggunakan semua data historical
            self.scalers[scaler_key] = MinMaxScaler()
            all_features = data[feature_columns].fillna(0).values
            self.scalers[scaler_key].fit(all_features)
        
        scaled_features = self.scalers[scaler_key].transform(features)
        
        # Reshape for LSTM input (1, sequence_length, n_features)
        X = scaled_features.reshape(1, sequence_length, len(feature_columns))
        
        return X, self.scalers[scaler_key]
    
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