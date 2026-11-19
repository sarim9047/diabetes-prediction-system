import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from app.core.config import settings

class MLService:
    _instance = None
    _model = None
    _baseline_model = None
    _metadata = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._load_resources()
        return cls._instance

    def _load_resources(self):
        # 1. Load model metadata
        if os.path.exists(settings.METADATA_PATH):
            with open(settings.METADATA_PATH, "r") as f:
                self._metadata = json.load(f)
        else:
            self._metadata = {
                "selected_model": "Decision Tree",
                "version": "1.0.0",
                "dataset": {"total_samples": 768, "train_samples": 614, "test_samples": 154},
                "metrics_summary": {}
            }

        # 2. Load trained pipeline
        if os.path.exists(settings.MODEL_PATH):
            print(f"Loading trained model pipeline from {settings.MODEL_PATH}")
            self._model = joblib.load(settings.MODEL_PATH)
        else:
            print(f"Warning: Model file not found at {settings.MODEL_PATH}")
            self._model = None

        # 3. Load baseline SVM
        if os.path.exists(settings.BASELINE_MODEL_PATH):
            self._baseline_model = joblib.load(settings.BASELINE_MODEL_PATH)

    def predict(self, input_data: Dict[str, Any]) -> Tuple[int, str, str, float]:
        """
        Executes prediction using the pre-fitted Scikit-Learn Pipeline.
        Pipeline internally handles median imputation of physiological zeros + standard scaling.
        Never retrains on prediction requests.
        """
        if self._model is None:
            self._load_resources()
            if self._model is None:
                raise RuntimeError("ML Model artifact could not be loaded from disk.")

        # Construct dataframe matching exact training columns
        features = [
            'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
            'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
        ]
        
        # Prepare input dict matching training casing
        val_dict = {
            'Pregnancies': input_data.get('pregnancies', 0),
            'Glucose': input_data.get('glucose'),
            'BloodPressure': input_data.get('blood_pressure'),
            'SkinThickness': input_data.get('skin_thickness', 0.0),
            'Insulin': input_data.get('insulin', 0.0),
            'BMI': input_data.get('bmi'),
            'DiabetesPedigreeFunction': input_data.get('diabetes_pedigree_function'),
            'Age': input_data.get('age')
        }

        # Replace biologically implausible zeros in zero-sensitive columns with NaN
        # so that the pipeline's SimpleImputer accurately replaces them with median values
        zero_sensitive = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
        for col in zero_sensitive:
            if val_dict[col] == 0:
                val_dict[col] = np.nan

        df_input = pd.DataFrame([val_dict])[features]

        # Predict using pipeline
        pred = int(self._model.predict(df_input)[0])
        
        # Compute decision score or probability
        risk_score = 0.5
        if hasattr(self._model, "predict_proba"):
            probs = self._model.predict_proba(df_input)[0]
            risk_score = float(probs[1])
        elif hasattr(self._model, "decision_function"):
            decision = float(self._model.decision_function(df_input)[0])
            risk_score = float(1 / (1 + np.exp(-decision)))

        if pred == 1:
            classification_label = "Positive Classification"
            risk_level = "Elevated Screening Risk"
        else:
            classification_label = "Negative Classification"
            risk_level = "Normal Screening Profile"

        return pred, classification_label, risk_level, round(risk_score, 4)

    def get_metadata(self) -> Dict[str, Any]:
        if self._metadata is None:
            self._load_resources()
        return self._metadata or {}

    def get_model_name(self) -> str:
        meta = self.get_metadata()
        return meta.get("selected_model", "Decision Tree")

    def get_model_version(self) -> str:
        meta = self.get_metadata()
        return meta.get("version", "1.0.0")

ml_service = MLService()
