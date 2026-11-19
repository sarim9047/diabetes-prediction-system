from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class PredictionSummary(BaseModel):
    id: int
    created_at: datetime
    prediction_result: int
    classification_label: str
    risk_level: str
    glucose: float
    bmi: float
    age: int

class TrendPoint(BaseModel):
    date: str
    total: int
    positive: int
    negative: int

class OutcomeDistribution(BaseModel):
    positive: int
    negative: int
    positive_percentage: float
    negative_percentage: float

class DashboardStats(BaseModel):
    total_predictions: int
    high_risk_count: int
    low_risk_count: int
    latest_prediction: Optional[PredictionSummary]
    outcome_distribution: OutcomeDistribution
    monthly_trends: List[TrendPoint]
    recent_predictions: List[PredictionSummary]
    active_model_name: str
    active_model_accuracy: float
