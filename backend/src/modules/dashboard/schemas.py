from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime

class DashboardStatsResponse(BaseModel):
    cases: Dict[str, Any]
    clients: Dict[str, Any]
    financial: Dict[str, Any]
    tasks: Dict[str, Any]
    upcoming_hearings: int
    pending_tasks: int
    weekly_revenue: float
    case_success_rate: float
    productivity: Dict[str, Any]

class ActivityTimelineItem(BaseModel):
    type: str
    title: str
    timestamp: datetime
    entity_id: int

class ActivityTimelineResponse(BaseModel):
    activities: List[ActivityTimelineItem]
    total_count: int