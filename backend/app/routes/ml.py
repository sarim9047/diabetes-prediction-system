import os
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from app.core.config import settings
from app.services.ml_service import ml_service

router = APIRouter(prefix="/model", tags=["Machine Learning"])

# Educational notes for viva presentation
VIVA_EDUCATIONAL_GUIDES = {
    "SVM": (
        "Support Vector Machines (SVM) find the optimal separating hyperplane that maximizes the geometric margin "
        "between two classes in high-dimensional feature space. In our baseline implementation, a linear kernel is utilized: "
        "w^T x + b = 0, where w represents the normal vector to the hyperplane and b is the intercept."
    ),
    "StandardScaler": (
        "StandardScaler transforms features to zero mean (μ = 0) and unit variance (σ = 1): z = (x - μ) / σ. "
        "This is essential for distance-based models (SVM and Logistic Regression) because features measured on larger scales "
        "(such as Insulin up to 846 μU/mL) would otherwise dominate features with small numerical ranges (such as Diabetes Pedigree Function ~0.5)."
    ),
    "TrainTestSplit": (
        "Train-Test Split partitions the original dataset into disjoint subsets (80% training, 20% testing) using stratified sampling. "
        "Stratification preserves identical class distribution ratios (34.9% positive, 65.1% negative) across both sets, preventing sample representation bias."
    ),
    "ConfusionMatrix": (
        "A confusion matrix summarizes classification decisions against ground truth: True Positives (TP), False Positives (FP), "
        "True Negatives (TN), and False Negatives (FN). In medical screening, minimizing False Negatives (high Recall) is prioritized to prevent missed conditions."
    ),
    "PrecisionAndRecall": (
        "Precision = TP / (TP + FP) measures the fraction of predicted positive cases that are truly diabetic. "
        "Recall (Sensitivity) = TP / (TP + FN) measures the proportion of actual diabetic cases correctly detected by the model."
    ),
    "Overfitting": (
        "Overfitting occurs when a model memorizes idiosyncrasies and noise in training data instead of generalizable patterns, "
        "yielding high training accuracy but poor testing performance. We mitigate overfitting through 5-fold cross-validation, "
        "hyperparameter constraints (e.g. max_depth), and median imputation."
    )
}

@router.get("/info")
def get_model_information():
    meta = ml_service.get_metadata()
    return {
        "selected_model": meta.get("selected_model", "Decision Tree"),
        "version": meta.get("version", "1.0.0"),
        "dataset_info": meta.get("dataset", {}),
        "feature_importance": meta.get("feature_importance", {}),
        "original_baseline_svm": meta.get("original_unimputed_svm_baseline", {}),
        "models_evaluated": meta.get("models_evaluated", []),
        "educational_guides": VIVA_EDUCATIONAL_GUIDES
    }

@router.get("/metrics")
def get_model_evaluation_metrics():
    meta = ml_service.get_metadata()
    return {
        "selected_model": meta.get("selected_model"),
        "metrics_summary": meta.get("metrics_summary", {}),
        "original_baseline_svm": meta.get("original_unimputed_svm_baseline", {})
    }

@router.get("/visualizations/{chart_name}")
def get_evaluation_chart(chart_name: str):
    # Normalize chart name
    if not chart_name.endswith(".png"):
        chart_name = f"{chart_name}.png"

    allowed_charts = [
        "model_comparison.png",
        "confusion_matrix.png",
        "roc_curves.png",
        "feature_importance.png"
    ]
    if chart_name not in allowed_charts:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chart '{chart_name}' not recognized. Allowed: {allowed_charts}"
        )

    # Search in multiple potential locations for flexibility on Render vs Local
    candidate_paths = [
        os.path.join(settings.EVAL_RESULTS_DIR, chart_name),
        os.path.join(settings.BASE_DIR, "models", chart_name),
        os.path.join(settings.BASE_DIR, "backend", "ml", "evaluation_results", chart_name),
        os.path.join(os.getcwd(), "models", chart_name),
        os.path.join(os.getcwd(), "backend", "ml", "evaluation_results", chart_name),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "evaluation_results", chart_name)),
    ]

    for file_path in candidate_paths:
        if os.path.exists(file_path):
            return FileResponse(file_path, media_type="image/png")

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Visualization image '{chart_name}' not found on server."
    )
