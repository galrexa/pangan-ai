# File: backend/routers/enhanced_data_router.py
# Enhanced API router yang terintegrasi dengan existing backend structure

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional, List
from datetime import datetime, timedelta, date
import logging

# Import existing services (menggunakan singleton pattern yang sama)
from services.data_service import DataService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize enhanced service (akan menggunakan existing DataService di dalamnya)
enhanced_service = DataService()

@router.get("/enhanced-statistics/{commodity}")
async def get_enhanced_statistics(
    commodity: str,
    region: str = Query("all", description="Region filter"),
    include_seasonal: bool = Query(True, description="Include seasonal analysis"),
    period_days: int = Query(365, description="Analysis period in days")
):
    """
    Get enhanced commodity statistics dengan volatility dan seasonal analysis
    Compatible dengan existing data structure
    """
    try:
        logger.info(f"Getting enhanced statistics for {commodity} in {region}")
        
        # Validate commodity exists
        available_commodities = enhanced_service.get_available_commodities()
        if commodity not in available_commodities and commodity != "all":
            # Try case-insensitive match
            commodity_matches = [c for c in available_commodities if c.lower() == commodity.lower()]
            if commodity_matches:
                commodity = commodity_matches[0]
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"Commodity '{commodity}' not found. Available: {available_commodities}"
                )
        
        # Get enhanced statistics
        result = enhanced_service.get_enhanced_commodity_statistics(
            commodity=commodity,
            region=region
        )
        
        if not result.get('success', False):
            raise HTTPException(
                status_code=404,
                detail=f"Data not found: {result.get('error', 'Unknown error')}"
            )
        
        # Filter seasonal analysis if not requested
        if not include_seasonal:
            result.pop('seasonal_analysis', None)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": result,
                "metadata": {
                    "commodity": commodity,
                    "region": region,
                    "analysis_period_days": period_days,
                    "includes_seasonal": include_seasonal,
                    "data_source": "DataService",
                    "generated_at": enhanced_service._get_current_timestamp()
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting enhanced statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/seasonal-volatility/{commodity}")
async def get_seasonal_volatility(
    commodity: str,
    region: str = Query("all", description="Region filter"),
    analysis_type: str = Query("comprehensive", description="Type of analysis")
):
    """
    Get detailed seasonal volatility analysis
    """
    try:
        logger.info(f"Getting seasonal volatility for {commodity} - type: {analysis_type}")
        
        # Validate inputs
        available_commodities = enhanced_service.get_available_commodities()
        if commodity not in available_commodities:
            commodity_matches = [c for c in available_commodities if c.lower() == commodity.lower()]
            if commodity_matches:
                commodity = commodity_matches[0]
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"Commodity '{commodity}' not found"
                )
        
        # Get commodity data menggunakan existing data processor
        data = enhanced_service.data_processor.get_commodity_data(commodity, region)
        
        if data.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No data found for commodity: {commodity} in region: {region}"
            )
        
        # Perform seasonal analysis
        seasonal_result = enhanced_service.analyze_seasonal_volatility(data)
        
        if not seasonal_result.get('available', False):
            raise HTTPException(
                status_code=422,
                detail=f"Insufficient data for seasonal analysis: {seasonal_result.get('reason', 'unknown')}"
            )
        
        # Filter based on analysis type
        if analysis_type == "basic":
            filtered_result = {
                'available': seasonal_result['available'],
                'monthly_volatility': seasonal_result.get('monthly_volatility', {}),
                'quarterly_volatility': seasonal_result.get('quarterly_volatility', {})
            }
        elif analysis_type == "events_only":
            filtered_result = {
                'available': seasonal_result['available'],
                'event_volatility': seasonal_result.get('event_volatility', {}),
                'seasonal_patterns': seasonal_result.get('seasonal_patterns', {})
            }
        else:  # comprehensive
            filtered_result = seasonal_result
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": filtered_result,
                "metadata": {
                    "commodity": commodity,
                    "region": region,
                    "analysis_type": analysis_type,
                    "data_points": len(data),
                    "date_range": {
                        "start": data['tanggal'].min().isoformat() if 'tanggal' in data.columns else None,
                        "end": data['tanggal'].max().isoformat() if 'tanggal' in data.columns else None
                    },
                    "data_source": "DataService"
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in seasonal volatility analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/volatility-comparison")
async def compare_volatility(
    commodities: List[str] = Query(..., description="List of commodities to compare"),
    region: str = Query("all", description="Region filter"),
    metric: str = Query("final_volatility", description="Volatility metric to compare")
):
    """
    Compare volatility across multiple commodities
    """
    try:
        logger.info(f"Comparing volatility for commodities: {commodities}")
        
        available_commodities = enhanced_service.get_available_commodities()
        
        comparison_result = {
            "comparison_data": {},
            "ranking": [],
            "summary": {}
        }
        
        volatility_values = {}
        
        for commodity in commodities:
            try:
                # Case-insensitive commodity matching
                matched_commodity = commodity
                if commodity not in available_commodities:
                    matches = [c for c in available_commodities if c.lower() == commodity.lower()]
                    if matches:
                        matched_commodity = matches[0]
                    else:
                        comparison_result["comparison_data"][commodity] = {
                            "error": f"Commodity not found: {commodity}"
                        }
                        continue
                
                # Get enhanced statistics
                stats = enhanced_service.get_enhanced_commodity_statistics(matched_commodity, region)
                
                if stats.get('success', False):
                    vol_analysis = stats.get('volatility_analysis', {}).get('all_period', {})
                    volatility_value = vol_analysis.get(metric, 0)
                    
                    volatility_values[matched_commodity] = volatility_value
                    
                    comparison_result["comparison_data"][matched_commodity] = {
                        "volatility": volatility_value,
                        "category": vol_analysis.get('volatility_category', 'unknown'),
                        "current_price": stats.get('basic_stats', {}).get('current_price', 0),
                        "avg_price": stats.get('basic_stats', {}).get('avg_price_all', 0),
                        "data_points": vol_analysis.get('data_points', 0),
                        "coefficient_of_variation": vol_analysis.get('coefficient_of_variation', 0),
                        "daily_returns_volatility": vol_analysis.get('daily_returns_volatility', 0),
                        "range_volatility": vol_analysis.get('range_volatility', 0)
                    }
                else:
                    comparison_result["comparison_data"][matched_commodity] = {
                        "error": f"Data not available: {stats.get('error', 'Unknown error')}"
                    }
                    
            except Exception as e:
                logger.warning(f"Error processing commodity {commodity}: {str(e)}")
                comparison_result["comparison_data"][commodity] = {
                    "error": str(e)
                }
        
        # Create ranking
        valid_commodities = {k: v for k, v in volatility_values.items() if v > 0}
        ranking = sorted(valid_commodities.items(), key=lambda x: x[1], reverse=True)
        
        comparison_result["ranking"] = [
            {
                "rank": i + 1,
                "commodity": commodity,
                "volatility": round(volatility, 2),
                "risk_level": "Very High" if volatility > 30 else "High" if volatility > 20 else "Medium" if volatility > 10 else "Low"
            }
            for i, (commodity, volatility) in enumerate(ranking)
        ]
        
        # Summary statistics
        if valid_commodities:
            volatilities = list(valid_commodities.values())
            comparison_result["summary"] = {
                "total_commodities": len(commodities),
                "analyzed_commodities": len(valid_commodities),
                "highest_volatility": round(max(volatilities), 2),
                "lowest_volatility": round(min(volatilities), 2),
                "average_volatility": round(sum(volatilities) / len(volatilities), 2),
                "very_high_risk_count": len([v for v in volatilities if v > 30]),
                "high_risk_count": len([v for v in volatilities if 20 < v <= 30]),
                "medium_risk_count": len([v for v in volatilities if 10 < v <= 20]),
                "low_risk_count": len([v for v in volatilities if v <= 10])
            }
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": comparison_result,
                "metadata": {
                    "commodities": commodities,
                    "region": region,
                    "metric_used": metric,
                    "comparison_timestamp": enhanced_service._get_current_timestamp(),
                    "available_commodities": available_commodities
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error in volatility comparison: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/volatility-alerts")
async def get_volatility_alerts(
    threshold: float = Query(20.0, description="Volatility threshold for alerts"),
    region: str = Query("all", description="Region filter"),
    alert_type: str = Query("all", description="Alert type: high_volatility, price_spike, seasonal_risk")
):
    """
    Get volatility alerts and warnings
    """
    try:
        logger.info(f"Getting volatility alerts with threshold: {threshold}%")
        
        alerts = {
            "high_volatility_alerts": [],
            "seasonal_risk_alerts": [],
            "price_spike_alerts": [],
            "summary": {
                "total_alerts": 0,
                "critical_alerts": 0,
                "warning_alerts": 0
            }
        }
        
        # Get all available commodities
        commodities = enhanced_service.get_available_commodities()
        
        for commodity in commodities:
            try:
                stats = enhanced_service.get_enhanced_commodity_statistics(commodity, region)
                
                if not stats.get('success', False):
                    continue
                
                vol_analysis = stats.get('volatility_analysis', {}).get('all_period', {})
                current_volatility = vol_analysis.get('final_volatility', 0)
                
                # High volatility alerts
                if current_volatility > threshold and alert_type in ['all', 'high_volatility']:
                    severity = "critical" if current_volatility > threshold * 1.5 else "warning"
                    
                    alerts["high_volatility_alerts"].append({
                        "commodity": commodity,
                        "current_volatility": round(current_volatility, 2),
                        "threshold": threshold,
                        "severity": severity,
                        "category": vol_analysis.get('volatility_category', 'unknown'),
                        "current_price": stats.get('basic_stats', {}).get('current_price', 0),
                        "recommendation": f"Monitor {commodity} closely - volatility {current_volatility:.1f}% exceeds threshold {threshold}%"
                    })
                    
                    if severity == "critical":
                        alerts["summary"]["critical_alerts"] += 1
                    else:
                        alerts["summary"]["warning_alerts"] += 1
                
                # Seasonal risk alerts
                seasonal_data = stats.get('seasonal_analysis', {})
                if seasonal_data.get('available', False) and alert_type in ['all', 'seasonal_risk']:
                    patterns = seasonal_data.get('seasonal_patterns', {})
                    high_vol_months = patterns.get('highest_volatility_months', [])
                    
                    # Check current month for seasonal risk
                    current_month = datetime.now().month
                    month_names = {
                        1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
                        5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
                        9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember'
                    }
                    current_month_name = month_names[current_month]
                    
                    for month_data in high_vol_months:
                        if month_data['month'] == current_month_name and month_data.get('volatility', 0) > threshold:
                            alerts["seasonal_risk_alerts"].append({
                                "commodity": commodity,
                                "risk_month": month_data['month'],
                                "expected_volatility": month_data['volatility'],
                                "category": month_data['category'],
                                "is_current_month": True,
                                "recommendation": f"High seasonal volatility expected for {commodity} in {month_data['month']}"
                            })
                
                # Price spike alerts (based on recent trend)
                trend_analysis = stats.get('trend_analysis', {})
                if trend_analysis.get('available', False) and alert_type in ['all', 'price_spike']:
                    short_term = trend_analysis.get('short_term', {})
                    change_pct = abs(short_term.get('change_percent', 0))
                    
                    if change_pct > 15:  # Significant price movement
                        alerts["price_spike_alerts"].append({
                            "commodity": commodity,
                            "price_change_percent": short_term.get('change_percent', 0),
                            "direction": short_term.get('direction', 'unknown'),
                            "strength": short_term.get('strength', 'unknown'),
                            "current_price": stats.get('basic_stats', {}).get('current_price', 0),
                            "recommendation": f"Price spike detected: {change_pct:.1f}% change in {commodity} over last 7 days"
                        })
                
            except Exception as e:
                logger.warning(f"Error processing alerts for {commodity}: {str(e)}")
                continue
        
        # Calculate summary
        alerts["summary"]["total_alerts"] = (
            len(alerts["high_volatility_alerts"]) +
            len(alerts["seasonal_risk_alerts"]) + 
            len(alerts["price_spike_alerts"])
        )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": alerts,
                "metadata": {
                    "threshold_used": threshold,
                    "region": region,
                    "alert_type": alert_type,
                    "commodities_analyzed": len(commodities),
                    "generated_at": enhanced_service._get_current_timestamp()
                }
            }
        )
        
    except Exception as e:
        logger.error(f"Error generating volatility alerts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/volatility-forecast")
async def forecast_seasonal_volatility(
    commodity: str,
    region: str = "all",
    forecast_months: int = 6,
    include_events: bool = True
):
    """
    Forecast seasonal volatility for upcoming months
    """
    try:
        logger.info(f"Forecasting seasonal volatility for {commodity} - {forecast_months} months")
        
        # Validate commodity
        available_commodities = enhanced_service.get_available_commodities()
        if commodity not in available_commodities:
            matches = [c for c in available_commodities if c.lower() == commodity.lower()]
            if matches:
                commodity = matches[0]
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"Commodity '{commodity}' not found"
                )
        
        # Get historical data
        data = enhanced_service.data_processor.get_commodity_data(commodity, region)
        
        if data.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No data found for commodity: {commodity} in region: {region}"
            )
        
        # Get seasonal analysis
        seasonal_analysis = enhanced_service.analyze_seasonal_volatility(data)
        
        if not seasonal_analysis.get('available', False):
            raise HTTPException(
                status_code=422,
                detail="Insufficient data for seasonal forecasting"
            )
        
        # Generate forecast
        forecast_result = _generate_volatility_forecast(
            seasonal_analysis,
            forecast_months,
            include_events
        )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": forecast_result,
                "metadata": {
                    "commodity": commodity,
                    "region": region,
                    "forecast_months": forecast_months,
                    "includes_events": include_events,
                    "base_analysis_period": f"{data['tanggal'].min()} to {data['tanggal'].max()}" if 'tanggal' in data.columns else "unknown",
                    "data_source": "DataService"
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in volatility forecasting: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

def _generate_volatility_forecast(seasonal_analysis, forecast_months, include_events):
    """Generate volatility forecast based on seasonal patterns"""
    
    from dateutil.relativedelta import relativedelta
    
    current_date = datetime.now()
    monthly_volatility = seasonal_analysis.get('monthly_volatility', {})
    event_volatility = seasonal_analysis.get('event_volatility', {})
    
    forecast = {
        "monthly_forecast": [],
        "risk_periods": [],
        "recommendations": []
    }
    
    month_names = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    
    for i in range(forecast_months):
        forecast_date = current_date + relativedelta(months=i+1)
        month_name = month_names[forecast_date.month - 1]
        
        # Base volatility from historical pattern
        base_volatility = monthly_volatility.get(month_name, {}).get('volatility', 12.0)
        
        # Event adjustments
        event_adjustment = 1.0
        active_events = []
        
        if include_events:
            # Ramadan adjustment (varies by year, approximate months)
            if forecast_date.month in [3, 4, 5]:
                ramadan_data = event_volatility.get('ramadan', {})
                if ramadan_data and 'volatility_ratio' in ramadan_data:
                    event_adjustment *= ramadan_data.get('volatility_ratio', 1.2)
                    active_events.append('Ramadan')
            
            # Idul Fitri adjustment
            if forecast_date.month in [4, 5]:
                idul_fitri_data = event_volatility.get('idul_fitri', {})
                if idul_fitri_data and 'volatility_ratio' in idul_fitri_data:
                    event_adjustment *= idul_fitri_data.get('volatility_ratio', 1.3)
                    active_events.append('Idul Fitri')
            
            # Christmas/New Year adjustment
            if forecast_date.month in [12, 1]:
                nataru_data = event_volatility.get('natal_tahun_baru', {})
                if nataru_data and 'volatility_ratio' in nataru_data:
                    event_adjustment *= nataru_data.get('volatility_ratio', 1.1)
                    active_events.append('Natal & Tahun Baru')
        
        adjusted_volatility = base_volatility * event_adjustment
        
        # Categorize risk level berdasarkan threshold penelitian
        if adjusted_volatility > 30:
            risk_level = "Very High"
            risk_color = "critical"
        elif adjusted_volatility > 20:
            risk_level = "High"
            risk_color = "error"
        elif adjusted_volatility > 10:
            risk_level = "Medium"
            risk_color = "warning"
        else:
            risk_level = "Low"
            risk_color = "success"
        
        month_forecast = {
            "month": month_name,
            "year": forecast_date.year,
            "date": forecast_date.strftime("%Y-%m"),
            "base_volatility": round(base_volatility, 2),
            "adjusted_volatility": round(adjusted_volatility, 2),
            "event_adjustment_factor": round(event_adjustment, 2),
            "active_events": active_events,
            "risk_level": risk_level,
            "risk_color": risk_color,
            "confidence": "High" if month_name in monthly_volatility else "Medium"
        }
        
        forecast["monthly_forecast"].append(month_forecast)
        
        # Add to risk periods if high volatility
        if adjusted_volatility > 20:  # High risk threshold
            forecast["risk_periods"].append({
                "period": f"{month_name} {forecast_date.year}",
                "volatility": round(adjusted_volatility, 2),
                "primary_drivers": active_events if active_events else ["Seasonal Pattern"],
                "recommended_actions": _get_risk_recommendations(risk_level, active_events)
            })
    
    # Generate general recommendations
    forecast["recommendations"] = _generate_forecast_recommendations(
        forecast["monthly_forecast"], 
        forecast["risk_periods"]
    )
    
    return forecast

def _get_risk_recommendations(risk_level, active_events):
    """Get specific recommendations based on risk level and events"""
    
    recommendations = []
    
    if risk_level == "Very High":
        recommendations.extend([
            "Siapkan buffer stock tambahan",
            "Monitor pasar harian",
            "Koordinasi dengan supplier utama",
            "Aktifkan sistem early warning"
        ])
    elif risk_level == "High":
        recommendations.extend([
            "Tingkatkan monitoring mingguan",
            "Siapkan rencana intervensi",
            "Review kontrak supplier",
            "Evaluasi strategi distribusi"
        ])
    elif risk_level == "Medium":
        recommendations.extend([
            "Monitor perkembangan reguler",
            "Evaluasi trend pasar",
            "Siapkan contingency plan"
        ])
    
    # Event-specific recommendations
    if "Ramadan" in active_events:
        recommendations.append("Antisipasi peningkatan demand selama Ramadan")
    if "Idul Fitri" in active_events:
        recommendations.append("Siapkan strategi distribusi untuk Idul Fitri")
    if "Natal & Tahun Baru" in active_events:
        recommendations.append("Monitor supply chain selama periode libur")
    
    return recommendations

def _generate_forecast_recommendations(monthly_forecast, risk_periods):
    """Generate overall forecast recommendations"""
    
    recommendations = []
    
    # Count high-risk months
    high_risk_months = len([m for m in monthly_forecast if m['risk_level'] in ['High', 'Very High']])
    
    if high_risk_months >= 3:
        recommendations.append("Periode volatilitas tinggi berkelanjutan - perlu strategi komprehensif")
    elif high_risk_months >= 1:
        recommendations.append("Beberapa periode berisiko tinggi - fokus pada bulan-bulan kritis")
    else:
        recommendations.append("Periode relatif stabil - monitoring rutin cukup")
    
    # Event-based recommendations
    event_months = [m for m in monthly_forecast if m['active_events']]
    if event_months:
        unique_events = set()
        for m in event_months:
            unique_events.update(m['active_events'])
        recommendations.append(f"Siapkan strategi khusus untuk: {', '.join(unique_events)}")
    
    # Seasonal pattern recommendations
    if monthly_forecast:
        highest_vol_month = max(monthly_forecast, key=lambda x: x['adjusted_volatility'])
        recommendations.append(
            f"Fokus utama pada {highest_vol_month['month']} dengan volatilitas tertinggi "
            f"({highest_vol_month['adjusted_volatility']:.1f}%)"
        )
    
    return recommendations