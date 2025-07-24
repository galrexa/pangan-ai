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

@router.get("/historical")
async def get_historical_data(
    commodity: Optional[str] = Query(None, description="Commodity name"),
    region: Optional[str] = Query(None, description="Region name"),
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(1000, ge=1, le=10000, description="Maximum records")
):
    """Get historical price data with filtering options"""
    try:
        result = data_service.get_historical_data(
            commodity=commodity,
            region=region, 
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        return result
    except Exception as e:
        logger.error(f"Error getting historical data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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