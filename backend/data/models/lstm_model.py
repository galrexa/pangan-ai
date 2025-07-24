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
        """Load existing trained model dan konfigurasi"""
        try:
            # Load main model
            if self.main_model_file.exists():
                self.main_model = load_model(str(self.main_model_file))
                logger.info("✅ Existing LSTM model loaded successfully")
            else:
                logger.warning("❌ Main model file not found")
                return False
            
            # Load scaler
            if self.main_scaler_file.exists():
                with open(self.main_scaler_file, 'rb') as f:
                    self.main_scaler = pickle.load(f)
                logger.info("✅ Existing scaler loaded successfully")
            else:
                logger.warning("❌ Scaler file not found")
                return False
            
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
        
        # Compile model
        model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        return model
    
    def load_model(self, commodity: str, region: str) -> bool:
        """Load trained model and scaler for specific commodity-region pair"""
        
        model_key = self._get_model_key(commodity, region)
        model_file = self.model_path / f"{model_key}_model.h5"
        scaler_file = self.scaler_path / f"{model_key}_scaler.pkl"
        
        try:
            if model_file.exists() and scaler_file.exists():
                # Load model
                self.models[model_key] = load_model(str(model_file))
                
                # Load scaler
                with open(scaler_file, 'rb') as f:
                    self.scalers[model_key] = pickle.load(f)
                
                logger.info(f"Model loaded successfully for {commodity} - {region}")
                return True
            else:
                logger.warning(f"Model files not found for {commodity} - {region}")
                return False
                
        except Exception as e:
            logger.error(f"Error loading model for {commodity} - {region}: {str(e)}")
            return False
    
    def save_model(self, commodity: str, region: str) -> bool:
        """Save trained model and scaler"""
        
        model_key = self._get_model_key(commodity, region)
        
        if model_key not in self.models:
            logger.error(f"No model found for {commodity} - {region}")
            return False
        
        try:
            model_file = self.model_path / f"{model_key}_model.h5"
            scaler_file = self.scaler_path / f"{model_key}_scaler.pkl"
            
            # Save model
            self.models[model_key].save(str(model_file))
            
            # Save scaler
            with open(scaler_file, 'wb') as f:
                pickle.dump(self.scalers[model_key], f)
            
            logger.info(f"Model saved successfully for {commodity} - {region}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving model for {commodity} - {region}: {str(e)}")
            return False
    
    def train_model(self, X_train: np.ndarray, y_train: np.ndarray, 
                   commodity: str, region: str, 
                   epochs: int = 50, batch_size: int = 32) -> Dict:
        """
        Train LSTM model untuk commodity dan region tertentu
        """
        
        model_key = self._get_model_key(commodity, region)
        
        try:
            # Create model
            input_shape = (X_train.shape[1], X_train.shape[2])
            model = self._create_lstm_model(input_shape)
            
            # Early stopping callback
            early_stopping = tf.keras.callbacks.EarlyStopping(
                monitor='loss', patience=10, restore_best_weights=True
            )
            
            # Train model
            logger.info(f"Training model for {commodity} - {region}")
            history = model.fit(
                X_train, y_train,
                epochs=epochs,
                batch_size=batch_size,
                validation_split=0.2,
                callbacks=[early_stopping],
                verbose=0
            )
            
            # Store model
            self.models[model_key] = model
            
            # Training results
            final_loss = history.history['loss'][-1]
            final_val_loss = history.history['val_loss'][-1]
            
            logger.info(f"Training completed - Loss: {final_loss:.4f}, Val Loss: {final_val_loss:.4f}")
            
            return {
                'success': True,
                'final_loss': final_loss,
                'final_val_loss': final_val_loss,
                'epochs_trained': len(history.history['loss'])
            }
            
        except Exception as e:
            logger.error(f"Error training model for {commodity} - {region}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def predict(self, X: np.ndarray, commodity: str, region: str, 
               days_ahead: int = 7) -> Dict:
        """
        Generate price predictions menggunakan existing trained model
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
                
                predictions.append(pred_price)
                
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
                predictions_actual = inverse_transformed[:, 0].tolist()
            else:
                predictions_actual = predictions
            
            # Calculate confidence metrics
            confidence = self._calculate_confidence(predictions_actual)
            
            # Calculate percentage changes
            current_price = predictions_actual[0]
            price_changes = [(pred - current_price) / current_price * 100 for pred in predictions_actual]
            
            return {
                'success': True,
                'predictions': predictions_actual,
                'price_changes_pct': price_changes,
                'days_ahead': days_ahead,
                'confidence': confidence,
                'model_used': 'pangan_ai_lstm_model',
                'current_price': current_price,
                'max_price': max(predictions_actual),
                'min_price': min(predictions_actual),
                'avg_price': sum(predictions_actual) / len(predictions_actual)
            }
            
        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            return self._mock_prediction(X, days_ahead)
    
    def _mock_prediction(self, X: np.ndarray, days_ahead: int = 7) -> Dict:
        """Generate mock predictions untuk development/testing"""
        
        # Extract current price dari input sequence
        current_price = X[0][-1][0] * 45000  # Approximate scale-back
        
        predictions = []
        for day in range(days_ahead):
            # Simple mock: slight random variation
            change_pct = np.random.normal(0, 0.02)  # 2% daily volatility
            next_price = current_price * (1 + change_pct)
            predictions.append(next_price)
            current_price = next_price
        
        return {
            'success': True,
            'predictions': predictions,
            'days_ahead': days_ahead,
            'confidence': 'medium',
            'model_used': 'mock_model',
            'note': 'Using mock predictions for development'
        }
    
    def _calculate_confidence(self, predictions: List[float]) -> str:
        """Calculate confidence level based on prediction stability"""
        
        if len(predictions) < 2:
            return 'low'
        
        # Calculate coefficient of variation
        mean_price = np.mean(predictions)
        std_price = np.std(predictions)
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
            return {'exists': False, 'message': 'Main model not loaded'}
        
        info = {
            'exists': True,
            'model_file': str(self.main_model_file),
            'input_shape': str(self.main_model.input_shape),
            'parameters': self.main_model.count_params(),
            'layers': len(self.main_model.layers)
        }
        
        if self.config:
            info.update({
                'n_features': self.config.get('n_features'),
                'sequence_length': self.config.get('sequence_length'),
                'target_commodity': self.config.get('target_commodity', 'unknown')
            })
        
        return info