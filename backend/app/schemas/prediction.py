from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

class PredictionInput(BaseModel):
    pregnancies: int = Field(
        ..., ge=0, le=20,
        description="Number of times pregnant (0 for males or females with no prior pregnancies)",
        example=2
    )
    glucose: float = Field(
        ..., ge=30.0, le=400.0,
        description="Plasma glucose concentration after a 2-hour oral glucose tolerance test (mg/dL)",
        example=120.0
    )
    blood_pressure: float = Field(
        ..., ge=30.0, le=250.0,
        description="Diastolic blood pressure (mmHg)",
        example=72.0
    )
    skin_thickness: float = Field(
        ..., ge=0.0, le=100.0,
        description="Triceps skinfold thickness (mm). 0 indicates unmeasured/unknown",
        example=25.0
    )
    insulin: float = Field(
        ..., ge=0.0, le=900.0,
        description="Two-hour serum insulin level (μU/mL). 0 indicates unmeasured/unknown",
        example=110.0
    )
    bmi: float = Field(
        ..., ge=10.0, le=80.0,
        description="Body Mass Index (weight in kg / (height in m)^2)",
        example=28.5
    )
    diabetes_pedigree_function: float = Field(
        ..., ge=0.01, le=3.0,
        description="Diabetes pedigree function scoring genetic diabetes influence based on family history",
        example=0.45
    )
    age: int = Field(
        ..., ge=1, le=120,
        description="Age of the patient in years",
        example=35
    )
    notes: Optional[str] = Field(None, max_length=500, description="Optional clinical notes or context")

    @field_validator("glucose")
    def validate_glucose(cls, v):
        if v <= 0:
            raise ValueError("Glucose cannot be zero or negative. A value between 30 and 400 mg/dL is required.")
        return v

    @field_validator("blood_pressure")
    def validate_bp(cls, v):
        if v <= 0:
            raise ValueError("Diastolic blood pressure cannot be zero. A value between 30 and 250 mmHg is required.")
        return v

    @field_validator("bmi")
    def validate_bmi(cls, v):
        if v <= 0:
            raise ValueError("BMI cannot be zero. A value between 10.0 and 80.0 kg/m² is required.")
        return v

class PredictionResponse(BaseModel):
    id: int
    user_id: int
    pregnancies: int
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree_function: float
    age: int
    prediction_result: int
    classification_label: str
    risk_level: str
    risk_score: Optional[float]
    model_name: str
    model_version: str
    notes: Optional[str]
    created_at: datetime
    medical_disclaimer: str

    class Config:
        from_attributes = True

class PredictionListResponse(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: List[PredictionResponse]
