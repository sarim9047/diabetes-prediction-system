from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ModelPerformanceSummary(BaseModel):
    name: str
    description: str
    train_accuracy: float
    test_accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: List[List[int]]

class ModelInfoResponse(BaseModel):
    selected_model: str
    version: str
    dataset_info: Dict[str, Any]
    feature_importance: Dict[str, float]
    metrics_summary: Dict[str, ModelPerformanceSummary]
    original_baseline_svm: Dict[str, float]
    educational_guides: Dict[str, str]
