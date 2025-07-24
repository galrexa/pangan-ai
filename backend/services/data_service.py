import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime, date
import logging
import sys
from pathlib import Path

# Fix import path untuk DataProcessor
current_dir = Path(__file__).parent.parent  # backend directory
sys.path.insert(0, str(current_dir))

from data.models.data_processor import DataProcessor
from config.settings import settings

logger = logging.getLogger(__name__)

class DataService:
    """
    Service class untuk handling data operations dalam PANGAN-AI
    Provides business logic untuk historical data retrieval dan analysis
    """
    
    def __init__(self):
        self.data_processor = DataProcessor(settings.dataset_path)
        self.data_loaded = False
        self._initialize_data()
    
    def _initialize_data(self):
        """Initialize data processor dengan loading dataset"""
        try:
            self.data_processor.load_data()
            self.data_loaded = True
            logger.info("✅ DataService initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize DataService: {str(e)}")
            self.data_loaded = False
    
    def get_available_commodities(self) -> List[str]:
        """Get list of available commodities"""
        if not self.data_loaded:
            return []
        return self.data_processor.commodities
    
    def get_available_regions(self) -> List[str]:
        """Get list of available regions"""
        if not self.data_loaded:
            return []
        return self.data_processor.regions
    
    def get_historical_data(self, 
                           commodity: Optional[str] = None,
                           region: Optional[str] = None,
                           start_date: Optional[date] = None,
                           end_date: Optional[date] = None,
                           limit: int = 1000) -> Dict:
        """
        Get historical price data dengan filtering options
        
        Args:
            commodity: Commodity name atau None untuk semua
            region: Region name atau None untuk semua  
            start_date: Start date filter
            end_date: End date filter
            limit: Maximum number of records
            
        Returns:
            Dictionary dengan data dan metadata
        """
        
        if not self.data_loaded:
            return {
                'success': False,
                'error': 'Data not loaded',
                'data': [],
                'metadata': {}
            }
        
        try:
            # Start dengan semua data
            data = self.data_processor.data.copy()
            
            # Apply filters
            if commodity and commodity != 'all':
                data = data[data['komoditas'] == commodity]
            
            if region and region != 'all':
                data = data[data['wilayah'] == region]
            
            if start_date:
                data = data[data['tanggal'] >= pd.to_datetime(start_date)]
            
            if end_date:
                data = data[data['tanggal'] <= pd.to_datetime(end_date)]
            
            # Sort by date
            data = data.sort_values('tanggal')
            
            # Apply limit
            if len(data) > limit:
                data = data.tail(limit)
            
            # Prepare response data
            records = []
            for _, row in data.iterrows():
                records.append({
                    'tanggal': row['tanggal'].strftime('%Y-%m-%d'),
                    'komoditas': row['komoditas'],
                    'wilayah': row['wilayah'],
                    'harga': float(row['harga']),
                    'tavg': float(row.get('tavg_final', 0)),
                    'rh_avg': float(row.get('rh_avg_final', 0)),
                    'ff_avg': float(row.get('ff_avg_final', 0)),
                    'curah_hujan': float(row.get('rr', 0)),
                    'ramadan': bool(row.get('dum_ramadan', 0)),
                    'idul_fitri': bool(row.get('dum_idulfitri', 0)),
                    'natal_newyear': bool(row.get('dum_natal_newyr', 0))
                })
            
            # Calculate metadata
            metadata = {
                'total_records': len(records),
                'filtered_records': len(data),
                'date_range': {
                    'start': data['tanggal'].min().strftime('%Y-%m-%d') if len(data) > 0 else None,
                    'end': data['tanggal'].max().strftime('%Y-%m-%d') if len(data) > 0 else None
                },
                'commodities': data['komoditas'].unique().tolist() if len(data) > 0 else [],
                'regions': data['wilayah'].unique().tolist() if len(data) > 0 else [],
                'price_stats': {
                    'min': float(data['harga'].min()) if len(data) > 0 else 0,
                    'max': float(data['harga'].max()) if len(data) > 0 else 0,
                    'avg': float(data['harga'].mean()) if len(data) > 0 else 0,
                    'current': float(data['harga'].iloc[-1]) if len(data) > 0 else 0
                }
            }
            
            return {
                'success': True,
                'data': records,
                'metadata': metadata
            }
            
        except Exception as e:
            logger.error(f"Error getting historical data: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'data': [],
                'metadata': {}
            }
    
    def get_commodity_statistics(self, commodity: str, region: Optional[str] = None) -> Dict:
        """Get detailed statistics untuk specific commodity"""
        
        if not self.data_loaded:
            return {'success': False, 'error': 'Data not loaded'}
        
        try:
            stats = self.data_processor.get_statistics(commodity, region)
            
            # Enhanced statistics
            data = self.data_processor.get_commodity_data(commodity, region)
            
            if len(data) == 0:
                return {'success': False, 'error': 'No data found'}
            
            # Calculate additional metrics
            data_30d = data.tail(30)  # Last 30 days
            data_7d = data.tail(7)    # Last 7 days
            
            enhanced_stats = {
                'success': True,
                'basic_stats': stats,
                'trend_analysis': {
                    'last_7_days': {
                        'avg_price': float(data_7d['harga'].mean()) if len(data_7d) > 0 else 0,
                        'price_change': float(data_7d['harga'].iloc[-1] - data_7d['harga'].iloc[0]) if len(data_7d) > 1 else 0,
                        'volatility': float(data_7d['harga'].std()) if len(data_7d) > 1 else 0
                    },
                    'last_30_days': {
                        'avg_price': float(data_30d['harga'].mean()) if len(data_30d) > 0 else 0,
                        'price_change': float(data_30d['harga'].iloc[-1] - data_30d['harga'].iloc[0]) if len(data_30d) > 1 else 0,
                        'volatility': float(data_30d['harga'].std()) if len(data_30d) > 1 else 0
                    }
                },
                'seasonal_patterns': self._analyze_seasonal_patterns(data),
                'weather_correlation': self._analyze_weather_correlation(data)
            }
            
            return enhanced_stats
            
        except Exception as e:
            logger.error(f"Error getting commodity statistics: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _analyze_seasonal_patterns(self, data: pd.DataFrame) -> Dict:
        """Analyze seasonal patterns dalam price data"""
        
        try:
            seasonal_stats = {}
            
            # Monthly patterns
            monthly_avg = data.groupby('month')['harga'].mean()
            seasonal_stats['monthly_avg'] = {
                int(month): float(price) for month, price in monthly_avg.items()
            }
            
            # Ramadan effect
            ramadan_data = data[data.get('dum_ramadan', 0) == 1]
            normal_data = data[data.get('dum_ramadan', 0) == 0]
            
            if len(ramadan_data) > 0 and len(normal_data) > 0:
                seasonal_stats['ramadan_effect'] = {
                    'ramadan_avg': float(ramadan_data['harga'].mean()),
                    'normal_avg': float(normal_data['harga'].mean()),
                    'price_increase_pct': float((ramadan_data['harga'].mean() - normal_data['harga'].mean()) / normal_data['harga'].mean() * 100)
                }
            
            # Idul Fitri effect
            idul_fitri_data = data[data.get('dum_idulfitri', 0) == 1]
            if len(idul_fitri_data) > 0 and len(normal_data) > 0:
                seasonal_stats['idul_fitri_effect'] = {
                    'idul_fitri_avg': float(idul_fitri_data['harga'].mean()),
                    'normal_avg': float(normal_data['harga'].mean()),
                    'price_increase_pct': float((idul_fitri_data['harga'].mean() - normal_data['harga'].mean()) / normal_data['harga'].mean() * 100)
                }
            
            return seasonal_stats
            
        except Exception as e:
            logger.error(f"Error analyzing seasonal patterns: {str(e)}")
            return {}
    
    def _analyze_weather_correlation(self, data: pd.DataFrame) -> Dict:
        """Analyze correlation between weather dan price"""
        
        try:
            correlations = {}
            
            weather_columns = ['tavg_final', 'rh_avg_final', 'ff_avg_final', 'rr']
            
            for col in weather_columns:
                if col in data.columns:
                    correlation = data['harga'].corr(data[col])
                    if not pd.isna(correlation):
                        correlations[col] = float(correlation)
            
            return correlations
            
        except Exception as e:
            logger.error(f"Error analyzing weather correlation: {str(e)}")
            return {}
    
    def get_price_alerts(self, threshold_pct: float = 20.0) -> List[Dict]:
        """Get price alerts for significant price changes"""
        
        if not self.data_loaded:
            return []
        
        try:
            alerts = []
            
            for commodity in self.get_available_commodities():
                for region in self.get_available_regions():
                    data = self.data_processor.get_commodity_data(commodity, region)
                    
                    if len(data) < 7:
                        continue
                    
                    # Compare last 7 days average vs previous 7 days
                    recent_7d = data.tail(7)['harga'].mean()
                    previous_7d = data.tail(14).head(7)['harga'].mean()
                    
                    if previous_7d > 0:
                        change_pct = (recent_7d - previous_7d) / previous_7d * 100
                        
                        if abs(change_pct) >= threshold_pct:
                            alert_type = 'INCREASE' if change_pct > 0 else 'DECREASE'
                            severity = 'CRITICAL' if abs(change_pct) >= 30 else 'WARNING'
                            
                            alerts.append({
                                'commodity': commodity,
                                'region': region,
                                'alert_type': alert_type,
                                'severity': severity,
                                'change_pct': round(change_pct, 2),
                                'current_price': float(data['harga'].iloc[-1]),
                                'previous_avg': round(previous_7d, 0),
                                'recent_avg': round(recent_7d, 0),
                                'date': data['tanggal'].iloc[-1].strftime('%Y-%m-%d')
                            })
            
            # Sort by severity dan change magnitude
            alerts.sort(key=lambda x: (x['severity'] == 'CRITICAL', abs(x['change_pct'])), reverse=True)
            
            return alerts
            
        except Exception as e:
            logger.error(f"Error getting price alerts: {str(e)}")
            return []
    
    def get_data_quality_report(self) -> Dict:
        """Get data quality metrics untuk monitoring"""
        
        if not self.data_loaded:
            return {'success': False, 'error': 'Data not loaded'}
        
        try:
            data = self.data_processor.data
            
            quality_report = {
                'success': True,
                'total_records': len(data),
                'date_coverage': {
                    'start_date': data['tanggal'].min().strftime('%Y-%m-%d'),
                    'end_date': data['tanggal'].max().strftime('%Y-%m-%d'),
                    'total_days': (data['tanggal'].max() - data['tanggal'].min()).days
                },
                'data_completeness': {
                    'commodities': len(data['komoditas'].unique()),
                    'regions': len(data['wilayah'].unique()),
                    'missing_prices': int(data['harga'].isna().sum()),
                    'missing_weather': {
                        'temperature': int(data['tavg_final'].isna().sum()),
                        'humidity': int(data['rh_avg_final'].isna().sum()),
                        'wind': int(data['ff_avg_final'].isna().sum()),
                        'rainfall': int(data['rr'].isna().sum())
                    }
                },
                'data_gaps': self._identify_data_gaps(data)
            }
            
            return quality_report
            
        except Exception as e:
            logger.error(f"Error generating data quality report: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _identify_data_gaps(self, data: pd.DataFrame) -> List[Dict]:
        """Identify gaps dalam time series data"""
        
        gaps = []
        
        try:
            for commodity in data['komoditas'].unique():
                for region in data['wilayah'].unique():
                    subset = data[(data['komoditas'] == commodity) & (data['wilayah'] == region)]
                    subset = subset.sort_values('tanggal')
                    
                    if len(subset) < 2:
                        continue
                    
                    # Check for gaps > 7 days
                    for i in range(1, len(subset)):
                        gap_days = (subset.iloc[i]['tanggal'] - subset.iloc[i-1]['tanggal']).days
                        
                        if gap_days > 7:
                            gaps.append({
                                'commodity': commodity,
                                'region': region,
                                'gap_start': subset.iloc[i-1]['tanggal'].strftime('%Y-%m-%d'),
                                'gap_end': subset.iloc[i]['tanggal'].strftime('%Y-%m-%d'),
                                'gap_days': gap_days
                            })
            
            return gaps[:10]  # Return top 10 gaps
            
        except Exception as e:
            logger.error(f"Error identifying data gaps: {str(e)}")
            return []