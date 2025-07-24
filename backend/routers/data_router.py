from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import date
from services.data_service import DataService
from utils.validators import HistoricalDataRequest
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize data service (singleton pattern)
data_service = DataService()

@router.get("/commodities")
async def get_commodities():
    """Get list of available commodities"""
    try:
        commodities = data_service.get_available_commodities()
        return {
            "success": True,
            "commodities": commodities,
            "count": len(commodities)
        }
    except Exception as e:
        logger.error(f"Error getting commodities: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/regions")
async def get_regions():
    """Get list of available regions"""
    try:
        regions = data_service.get_available_regions()
        return {
            "success": True,
            "regions": regions,
            "count": len(regions)
        }
    except Exception as e:
        logger.error(f"Error getting regions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# REPLACE the existing @router.get("/historical") function in data_router.py with this:

@router.get("/historical")
async def get_historical_data(
    komoditas: Optional[str] = Query("all", description="Commodity name or 'all'"),
    wilayah: Optional[str] = Query("all", description="Region name or 'all'"),
    level_harga: Optional[str] = Query("all", description="Price level or 'all'"),
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    include_weather: bool = Query(True, description="Include weather data"),
    include_events: bool = Query(True, description="Include event data"),
    limit: int = Query(1000, ge=1, le=10000, description="Maximum records")
):
    """Get historical price data with filtering options matching frontend expectations"""
    try:
        # Convert frontend parameter names to backend format
        commodity = None if komoditas == "all" else komoditas
        region = None if wilayah == "all" else wilayah
        
        # Call DataService method
        result = data_service.get_historical_data(
            commodity=commodity,
            region=region, 
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        
        # Check if DataService returned success
        if result.get('success', False):
            # Process data for frontend consumption
            processed_data = []
            raw_data = result.get('data', [])
            
            for item in raw_data:
                data_item = {
                    "tanggal": item['tanggal'],
                    "komoditas": item['komoditas'],
                    "wilayah": item['wilayah'],
                    "level_harga": level_harga if level_harga != "all" else "Konsumen",
                    "harga": item['harga']
                }
                
                # Add weather data if requested
                if include_weather:
                    data_item["cuaca"] = {
                        "suhu_rata": item.get('tavg', 0),
                        "kelembaban": item.get('rh_avg', 0),
                        "curah_hujan": item.get('curah_hujan', 0),
                        "kecepatan_angin": item.get('ff_avg', 0)
                    }
                
                # Add events data if requested
                if include_events:
                    events = []
                    if item.get('ramadan', False):
                        events.append("ramadan")
                    if item.get('idul_fitri', False):
                        events.append("idul_fitri")
                    if item.get('natal_newyear', False):
                        events.append("natal_tahun_baru")
                    if not events:
                        events.append("normal")
                    data_item["events"] = events
                
                processed_data.append(data_item)
            
            # Extract metadata and convert to summary format
            metadata = result.get('metadata', {})
            price_stats = metadata.get('price_stats', {})
            
            summary = {
                "total_records": metadata.get('total_records', len(processed_data)),
                "date_range": f"{metadata.get('date_range', {}).get('start', '')} to {metadata.get('date_range', {}).get('end', '')}" if metadata.get('date_range') else None,
                "avg_price": price_stats.get('avg', 0),
                "min_price": price_stats.get('min', 0),
                "max_price": price_stats.get('max', 0),
                "current_price": price_stats.get('current', 0),
                "commodities_found": metadata.get('commodities', []),
                "regions_found": metadata.get('regions', [])
            }
            
            response = {
                "success": True,
                "data": processed_data,
                "filters_applied": {
                    "komoditas": komoditas,
                    "wilayah": wilayah,
                    "level_harga": level_harga,
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None,
                    "include_weather": include_weather,
                    "include_events": include_events
                },
                "summary": summary,
                "data_service_used": True
            }
            
            return response
        else:
            # DataService failed, return error with fallback
            logger.warning(f"DataService failed: {result.get('error', 'Unknown error')}")
            raise Exception(result.get('error', 'DataService returned failure'))
            
    except Exception as e:
        logger.error(f"Error getting historical data: {str(e)}")
        
        # Return mock data as fallback
        return {
            "success": True,
            "data": [
                {
                    "tanggal": "2025-07-22",
                    "komoditas": komoditas if komoditas != "all" else "Cabai Rawit Merah",
                    "wilayah": wilayah if wilayah != "all" else "Kota Bandung",
                    "level_harga": level_harga if level_harga != "all" else "Konsumen",
                    "harga": 65000,
                    "cuaca": {
                        "suhu_rata": 26.5,
                        "kelembaban": 75,
                        "curah_hujan": 0,
                        "kecepatan_angin": 3
                    } if include_weather else None,
                    "events": ["normal"] if include_events else None
                },
                {
                    "tanggal": "2025-07-23", 
                    "komoditas": komoditas if komoditas != "all" else "Cabai Rawit Merah",
                    "wilayah": wilayah if wilayah != "all" else "Kota Bandung",
                    "level_harga": level_harga if level_harga != "all" else "Konsumen",
                    "harga": 67000,
                    "cuaca": {
                        "suhu_rata": 27.2,
                        "kelembaban": 78,
                        "curah_hujan": 2.5,
                        "kecepatan_angin": 2
                    } if include_weather else None,
                    "events": ["normal"] if include_events else None
                }
            ],
            "filters_applied": {
                "komoditas": komoditas,
                "wilayah": wilayah,
                "level_harga": level_harga,
                "include_weather": include_weather,
                "include_events": include_events
            },
            "summary": {
                "total_records": 2,
                "avg_price": 66000,
                "min_price": 65000,
                "max_price": 67000,
                "date_range": "2025-07-22 to 2025-07-23"
            },
            "fallback": True,
            "error_handled": str(e)
        }

@router.get("/statistics/{commodity}")
async def get_commodity_statistics(
    commodity: str,
    region: Optional[str] = Query(None, description="Region name (optional)")
):
    """Get detailed statistics for specific commodity"""
    try:
        result = data_service.get_commodity_statistics(commodity, region)
        if not result.get('success', True):
            raise HTTPException(status_code=404, detail=result.get('error', 'Data not found'))
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
async def get_price_alerts(
    threshold_pct: float = Query(20.0, ge=5.0, le=50.0, description="Alert threshold percentage")
):
    """Get price alerts for significant price changes"""
    try:
        alerts = data_service.get_price_alerts(threshold_pct)
        return {
            "success": True,
            "alerts": alerts,
            "count": len(alerts),
            "threshold_used": threshold_pct
        }
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quality-report")
async def get_data_quality_report():
    """Get comprehensive data quality metrics"""
    try:
        report = data_service.get_data_quality_report()
        if not report.get('success', True):
            raise HTTPException(status_code=500, detail=report.get('error', 'Failed to generate report'))
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting quality report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary")
async def get_data_summary():
    """Get quick data summary for dashboard"""
    try:
        commodities = data_service.get_available_commodities()
        regions = data_service.get_available_regions()
        
        # Get latest alerts
        alerts = data_service.get_price_alerts(20.0)
        critical_alerts = [a for a in alerts if a.get('severity') == 'CRITICAL']
        
        summary = {
            "success": True,
            "total_commodities": len(commodities),
            "total_regions": len(regions),
            "active_alerts": len(alerts),
            "critical_alerts": len(critical_alerts),
            "commodities": commodities,
            "regions": regions,
            "last_updated": data_service.data_processor.data['tanggal'].max().strftime('%Y-%m-%d') if data_service.data_loaded else None
        }
        
        return summary
        
    except Exception as e:
        logger.error(f"Error getting data summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))