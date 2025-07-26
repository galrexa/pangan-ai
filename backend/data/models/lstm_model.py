# backend/data/models/lstm_model.py - FIXED VERSION
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
from typing import Dict, List, Tuple, Optional
import logging
import pickle
from pathlib import Path
import joblib
import json

logger = logging.getLogger(__name__)

class LSTMPredictor:
    """
    LSTM-based price prediction model for PANGAN-AI
    Handles model loading, training, and prediction
    """
    
    def __init__(self, model_path: str = "./data/models/", scaler_path: str = "./data/scalers/"):
        self.model_path = Path(model_path)
        self.scaler_path = Path(scaler_path)
        self.main_model = None  # Pre-trained model
        self.main_scaler = None  # Pre-trained scaler
        self.config = None      # Model configuration
        self.sequence_length = 30  # Sesuai dengan existing model
        
        # File paths untuk existing model
        self.main_model_file = self.model_path / "pangan_ai_lstm_model.h5"
        self.main_scaler_file = self.model_path / "pangan_ai_lstm_model_scalers.pkl"
        self.config_file = self.model_path / "pangan_ai_lstm_model_config.json"
        self.report_file = self.model_path / "pangan_ai_model_report.json"
        
        # Ensure directories exist
        self.model_path.mkdir(parents=True, exist_ok=True)
        self.scaler_path.mkdir(parents=True, exist_ok=True)
        
        # Load existing model saat initialization
        self.load_existing_model()
    
    def load_existing_model(self) -> bool:
        """Load existing trained model dan konfigurasi - FIXED VERSION"""
        try:
            # Load main model with custom objects handling
            if self.main_model_file.exists():
                # Define custom objects untuk backward compatibility
                custom_objects = {
                    'mse': tf.keras.losses.MeanSquaredError(),
                    'mae': tf.keras.losses.MeanAbsoluteError(),
                    'mean_squared_error': tf.keras.losses.MeanSquaredError(),
                    'mean_absolute_error': tf.keras.losses.MeanAbsoluteError()
                }
                
                try:
                    self.main_model = load_model(
                        str(self.main_model_file), 
                        custom_objects=custom_objects,
                        compile=False  # Skip compilation to avoid metric issues
                    )
                    
                    # Recompile dengan current Keras version
                    self.main_model.compile(
                        optimizer='adam',
                        loss='mse',
                        metrics=['mae']
                    )
                    
                    logger.info("✅ Existing LSTM model loaded successfully")
                except Exception as model_error:
                    logger.error(f"Error loading model with custom objects: {str(model_error)}")
                    # Try loading without custom objects
                    try:
                        self.main_model = load_model(str(self.main_model_file), compile=False)
                        self.main_model.compile(optimizer='adam', loss='mse', metrics=['mae'])
                        logger.info("✅ Model loaded without custom objects")
                    except Exception as fallback_error:
                        logger.error(f"Fallback model loading failed: {str(fallback_error)}")
                        return False
            else:
                logger.warning("❌ Main model file not found")
                return False
            
            # Load scaler with fallback
            if self.main_scaler_file.exists():
                try:
                    with open(self.main_scaler_file, 'rb') as f:
                        self.main_scaler = pickle.load(f)
                    logger.info("✅ Existing scaler loaded successfully")
                except Exception as scaler_error:
                    logger.error(f"Error loading scaler: {str(scaler_error)}")
                    self._create_fallback_scaler()
            else:
                logger.warning("❌ Scaler file not found, creating fallback scaler")
                self._create_fallback_scaler()
            
            # Load configuration
            if self.config_file.exists():
                with open(self.config_file, 'r') as f:
                    self.config = json.load(f)
                logger.info("✅ Model configuration loaded successfully")
                logger.info(f"Model features: {self.config.get('n_features', 'unknown')}")
                logger.info(f"Sequence length: {self.config.get('sequence_length', 'unknown')}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error loading existing model: {str(e)}")
            return False
    
    def _create_fallback_scaler(self):
        """Create fallback scaler when original is not available"""
        try:
            # Create MinMaxScaler with typical price ranges for cabai rawit
            self.main_scaler = MinMaxScaler()
            
            # Fit dengan typical price range untuk cabai rawit (28 features)
            # Feature 0 = price, features 1-27 = other features
            dummy_data = np.array([
                [20000, 25, 80, 5, 10, 2023, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 1, 150],  # Low values
                [80000, 35, 95, 15, 50, 2025, 1, 1, 1, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 12, 365]   # High values
            ])
            
            self.main_scaler.fit(dummy_data)
            logger.info("✅ Fallback scaler created successfully")
            
            # Optionally save the fallback scaler
            try:
                with open(self.main_scaler_file, 'wb') as f:
                    pickle.dump(self.main_scaler, f)
                logger.info(f"✅ Fallback scaler saved to {self.main_scaler_file}")
            except Exception as save_error:
                logger.warning(f"Could not save fallback scaler: {str(save_error)}")
                
        except Exception as e:
            logger.error(f"Error creating fallback scaler: {str(e)}")
            self.main_scaler = None
    
    def _create_lstm_model(self, input_shape: Tuple[int, int]) -> Sequential:
        """
        Create LSTM model architecture sesuai dengan diagram di proposal
        Input: (sequence_length, n_features)
        """
        
        model = Sequential([
            # LSTM Layer 1 - 64 units dengan return sequences
            LSTM(64, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            
            # LSTM Layer 2 - 32 units tanpa return sequences
            LSTM(32, return_sequences=False),
            Dropout(0.2),
            
            # Dense output layer untuk harga
            Dense(1, activation='linear')
        ])
        
        # Compile model with explicit functions
        model.compile(
            optimizer='adam',
            loss=tf.keras.losses.MeanSquaredError(),
            metrics=[tf.keras.metrics.MeanAbsoluteError()]
        )
        
        return model
    
    def predict(self, X: np.ndarray, commodity: str, region: str, 
               days_ahead: int = 7) -> Dict:
        """
        Generate price predictions menggunakan existing trained model - ENHANCED VERSION
        """
        
        if self.main_model is None or self.main_scaler is None:
            logger.warning("Main model or scaler not loaded, using mock prediction")
            return self._mock_prediction(X, days_ahead)
        
        try:
            predictions = []
            current_sequence = X.copy()
            
            # Generate predictions untuk days_ahead
            for day in range(days_ahead):
                # Predict next price
                pred_scaled = self.main_model.predict(current_sequence, verbose=0)
                pred_price = pred_scaled[0][0]
                
                predictions.append(float(pred_price))  # Explicit float conversion
                
                # Update sequence untuk next prediction
                # Shift sequence dan add prediction
                new_sequence = current_sequence[0][1:].copy()
                
                # Create new row dengan predicted price
                new_row = current_sequence[0][-1].copy()
                new_row[0] = pred_price  # Update price (kolom pertama)
                
                # Append new row
                new_sequence = np.vstack([new_sequence, new_row])
                current_sequence = new_sequence.reshape(1, new_sequence.shape[0], new_sequence.shape[1])
            
            # Inverse transform predictions
            if self.main_scaler:
                # Create dummy array untuk inverse transform (28 features)
                n_features = self.main_scaler.n_features_in_
                dummy_features = np.zeros((len(predictions), n_features))
                dummy_features[:, 0] = predictions  # Price di kolom pertama
                
                # Inverse transform
                inverse_transformed = self.main_scaler.inverse_transform(dummy_features)
                predictions_actual = [float(x) for x in inverse_transformed[:, 0]]
            else:
                predictions_actual = predictions
            
            # Calculate confidence metrics
            confidence = self._calculate_confidence(predictions_actual)
            
            # Calculate percentage changes
            current_price = float(predictions_actual[0])
            price_changes = [float((pred - current_price) / current_price * 100) for pred in predictions_actual]
            
            return {
                'success': True,
                'predictions': predictions_actual,
                'price_changes_pct': price_changes,
                'days_ahead': int(days_ahead),
                'confidence': confidence,
                'model_used': 'pangan_ai_lstm_model',
                'current_price': current_price,
                'max_price': float(max(predictions_actual)),
                'min_price': float(min(predictions_actual)),
                'avg_price': float(sum(predictions_actual) / len(predictions_actual))
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            return self._mock_prediction(X, days_ahead)
    
    def _mock_prediction(self, X: np.ndarray, days_ahead: int = 7) -> Dict:
        """Generate mock predictions untuk development/testing - ENHANCED VERSION"""
        
        # Extract current price dari input sequence (with better scaling)
        if X is not None and X.size > 0:
            # Estimate current price from sequence (assuming normalized)
            current_price = float(np.random.uniform(40000, 60000))  # Realistic cabai rawit price range
        else:
            current_price = 45000.0  # Default price
        
        predictions = []
        temp_price = current_price
        
        for day in range(days_ahead):
            # More realistic mock: small daily variations with trend
            change_pct = float(np.random.normal(0, 0.03))  # 3% daily volatility
            temp_price = temp_price * (1 + change_pct)
            predictions.append(float(temp_price))
        
        # Calculate price changes
        price_changes = [float((pred - current_price) / current_price * 100) for pred in predictions]
        
        return {
            'success': True,
            'predictions': predictions,
            'price_changes_pct': price_changes,
            'days_ahead': int(days_ahead),
            'confidence': 'medium',
            'model_used': 'mock_model',
            'current_price': current_price,
            'max_price': float(max(predictions)),
            'min_price': float(min(predictions)),
            'avg_price': float(sum(predictions) / len(predictions)),
            'note': 'Using mock predictions for development'
        }
    
    def _calculate_confidence(self, predictions: List[float]) -> str:
        """Calculate confidence level based on prediction stability"""
        
        if len(predictions) < 2:
            return 'low'
        
        # Calculate coefficient of variation
        mean_price = float(np.mean(predictions))
        std_price = float(np.std(predictions))
        cv = std_price / mean_price if mean_price > 0 else 1
        
        if cv < 0.05:  # < 5% variation
            return 'high'
        elif cv < 0.15:  # < 15% variation
            return 'medium'
        else:
            return 'low'
    
    def get_model_info(self) -> Dict:
        """Get information about loaded existing model"""
        
        if self.main_model is None:
            return {
                'exists': False, 
                'message': 'Main model not loaded',
                'mock_mode': True,
                'fallback_available': True
            }
        
        info = {
            'exists': True,
            'model_file': str(self.main_model_file),
            'input_shape': str(self.main_model.input_shape),
            'parameters': int(self.main_model.count_params()),
            'layers': int(len(self.main_model.layers)),
            'mock_mode': False
        }
        
        if self.config:
            info.update({
                'n_features': self.config.get('n_features'),
                'sequence_length': self.config.get('sequence_length'),
                'target_commodity': self.config.get('target_commodity', 'unknown')
            })
        
        return info
    
    def load_model(self, commodity: str, region: str) -> bool:
        """Load trained model and scaler for specific commodity-region pair"""
        
        model_key = self._get_model_key(commodity, region)
        model_file = self.model_path / f"{model_key}_model.h5"
        scaler_file = self.scaler_path / f"{model_key}_scaler.pkl"
        
        try:
            if model_file.exists() and scaler_file.exists():
                # Load model with error handling
                custom_objects = {
                    'mse': tf.keras.losses.MeanSquaredError(),
                    'mae': tf.keras.losses.MeanAbsoluteError()
                }
                
                model = load_model(str(model_file), custom_objects=custom_objects, compile=False)
                model.compile(optimizer='adam', loss='mse', metrics=['mae'])
                
                # Load scaler
                with open(scaler_file, 'rb') as f:
                    scaler = pickle.load(f)
                
                # Store in instance variables (assuming these exist)
                if not hasattr(self, 'models'):
                    self.models = {}
                if not hasattr(self, 'scalers'):
                    self.scalers = {}
                
                self.models[model_key] = model
                self.scalers[model_key] = scaler
                
                logger.info(f"Model loaded successfully for {commodity} - {region}")
                return True
            else:
                logger.warning(f"Model files not found for {commodity} - {region}")
                return False
                
        except Exception as e:
            logger.error(f"Error loading model for {commodity} - {region}: {str(e)}")
            return False
    
    def _get_model_key(self, commodity: str, region: str) -> str:
        """Generate model key for commodity-region pair"""
        return f"{commodity.lower().replace(' ', '_')}_{region.lower().replace(' ', '_')}"