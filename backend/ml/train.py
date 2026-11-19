"""
Diabetes Prediction ML Training Pipeline
Author: Senior ML Engineer & Research Team
Project: Diabetes Prediction and Health Risk Assessment System (7th Sem Major Project)

Features:
- Rigorous exploratory data analysis (EDA)
- Physiological zero detection & imputation without data leakage
- Baseline replication: Linear SVM (random_state=2, stratify=Y, test_size=0.2)
- Multi-model comparison: Linear SVM, Logistic Regression, Random Forest, Decision Tree
- Comprehensive evaluation: Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix
- Production Pipeline serialization with joblib
- Export of publication-quality evaluation charts and metrics JSON
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report, roc_curve
)

def run_training_pipeline(
    data_path="dataset/diabetes.csv",
    output_dir="models",
    eval_dir="backend/ml/evaluation_results"
):
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(eval_dir, exist_ok=True)

    print("=" * 60)
    print("STAGE 1: INSPECTION AND EXPLORATORY DATA ANALYSIS")
    print("=" * 60)

    df = pd.read_csv(data_path)
    print(f"Dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print("Columns:", list(df.columns))
    
    # Check duplicates and nulls
    num_duplicates = int(df.duplicated().sum())
    explicit_nulls = df.isnull().sum().to_dict()
    print(f"Duplicate records: {num_duplicates}")
    print("Explicit NaN count per column:", explicit_nulls)
    
    # Class distribution
    outcome_counts = df['Outcome'].value_counts().to_dict()
    outcome_pct = (df['Outcome'].value_counts(normalize=True) * 100).to_dict()
    print(f"Class distribution: 0 (Negative): {outcome_counts.get(0, 0)} ({outcome_pct.get(0, 0):.2f}%), "
          f"1 (Positive): {outcome_counts.get(1, 0)} ({outcome_pct.get(1, 0):.2f}%)")

    # Physiological zero analysis
    zero_sensitive_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    zero_counts = {col: int((df[col] == 0).sum()) for col in zero_sensitive_cols}
    zero_pcts = {col: float(((df[col] == 0).sum() / len(df)) * 100) for col in zero_sensitive_cols}
    print("Biologically implausible zero counts in dataset:")
    for col, count in zero_counts.items():
        print(f"  - {col}: {count} ({zero_pcts[col]:.1f}%)")
    print(f"Pregnancies zero count (Valid biological state): {(df['Pregnancies'] == 0).sum()}")

    # Descriptive statistics
    desc_stats = df.describe().to_dict()

    print("\n" + "=" * 60)
    print("STAGE 2: DATA PREPROCESSING & LEAKAGE PREVENTION")
    print("=" * 60)

    # Separate features and target
    X = df.drop(columns=['Outcome'])
    y = df['Outcome']
    feature_names = list(X.columns)

    # Train / Test split (Exact match with user's baseline script: test_size=0.2, stratify=y, random_state=2)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=2
    )
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Testing set:  {X_test.shape[0]} samples")

    # Replace 0 with NaN in zero-sensitive columns for imputer to handle
    X_train_clean = X_train.copy()
    X_test_clean = X_test.copy()
    for col in zero_sensitive_cols:
        X_train_clean[col] = X_train_clean[col].replace(0, np.nan)
        X_test_clean[col] = X_test_clean[col].replace(0, np.nan)

    print("\n" + "=" * 60)
    print("STAGE 3: MODEL TRAINING AND EVALUATION")
    print("=" * 60)

    # Models to train and compare
    models_config = {
        "Linear SVM (Baseline)": {
            "clf": SVC(kernel='linear', probability=True, random_state=2),
            "description": "Original baseline Support Vector Classifier with linear decision boundary"
        },
        "Logistic Regression": {
            "clf": LogisticRegression(max_iter=1000, random_state=2),
            "description": "Standard linear probabilistic classification model with L2 regularization"
        },
        "Random Forest": {
            "clf": RandomForestClassifier(n_estimators=100, max_depth=6, random_state=2),
            "description": "Ensemble of decorrelated decision trees with bootstrap aggregation"
        },
        "Decision Tree": {
            "clf": DecisionTreeClassifier(max_depth=5, min_samples_split=4, random_state=2),
            "description": "Single tree partitioning feature space with Gini impurity"
        }
    }

    # Evaluate original raw baseline (Linear SVM with standard scaler, zeros unhandled, exact match to original file)
    raw_scaler = StandardScaler()
    X_train_raw_std = raw_scaler.fit_transform(X_train)
    X_test_raw_std = raw_scaler.transform(X_test)
    raw_svm = SVC(kernel='linear', random_state=2)
    raw_svm.fit(X_train_raw_std, y_train)
    raw_train_acc = accuracy_score(y_train, raw_svm.predict(X_train_raw_std))
    raw_test_acc = accuracy_score(y_test, raw_svm.predict(X_test_raw_std))
    print(f"Original Raw SVM Baseline (zeros as numbers): Train Acc: {raw_train_acc:.4f}, Test Acc: {raw_test_acc:.4f}")

    results = {}
    fitted_pipelines = {}

    for name, config in models_config.items():
        # Pipeline: Impute zeros with median -> Scale features -> Classifier
        pipeline = Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler()),
            ('classifier', config['clf'])
        ])

        # Fit strictly on X_train_clean
        pipeline.fit(X_train_clean, y_train)
        fitted_pipelines[name] = pipeline

        # Predictions
        y_train_pred = pipeline.predict(X_train_clean)
        y_test_pred = pipeline.predict(X_test_clean)
        
        # Probabilities for ROC
        if hasattr(pipeline.named_steps['classifier'], "predict_proba"):
            y_test_proba = pipeline.predict_proba(X_test_clean)[:, 1]
        else:
            y_test_proba = pipeline.decision_function(X_test_clean)

        # Compute metrics
        train_acc = float(accuracy_score(y_train, y_train_pred))
        test_acc = float(accuracy_score(y_test, y_test_pred))
        precision = float(precision_score(y_test, y_test_pred, zero_division=0))
        recall = float(recall_score(y_test, y_test_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_test_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_test_proba))
        cm = confusion_matrix(y_test, y_test_pred).tolist()
        report = classification_report(y_test, y_test_pred, output_dict=True)

        # Cross-validation on training set (5-fold stratified)
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=2)
        cv_scores = cross_validate(
            pipeline, X_train_clean, y_train, cv=cv,
            scoring=['accuracy', 'recall', 'f1', 'roc_auc']
        )
        cv_metrics = {
            "mean_cv_accuracy": float(np.mean(cv_scores['test_accuracy'])),
            "std_cv_accuracy": float(np.std(cv_scores['test_accuracy'])),
            "mean_cv_recall": float(np.mean(cv_scores['test_recall'])),
            "mean_cv_f1": float(np.mean(cv_scores['test_f1'])),
            "mean_cv_roc_auc": float(np.mean(cv_scores['test_roc_auc']))
        }

        results[name] = {
            "name": name,
            "description": config['description'],
            "train_accuracy": train_acc,
            "test_accuracy": test_acc,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "roc_auc": roc_auc,
            "confusion_matrix": cm,
            "classification_report": report,
            "cv_metrics": cv_metrics
        }

        print(f"\n--- {name} ---")
        print(f"  Test Accuracy: {test_acc:.4f} (Train: {train_acc:.4f})")
        print(f"  Precision:     {precision:.4f}")
        print(f"  Recall:        {recall:.4f} (Clinical Screening Priority)")
        print(f"  F1 Score:      {f1:.4f}")
        print(f"  ROC-AUC:       {roc_auc:.4f}")
        print(f"  5-Fold CV Acc: {cv_metrics['mean_cv_accuracy']:.4f} (+/- {cv_metrics['std_cv_accuracy']:.4f})")
        print(f"  Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")

    print("\n" + "=" * 60)
    print("STAGE 4: MODEL SELECTION")
    print("=" * 60)

    # Selection criteria: Harmonic balance of Test Accuracy, Recall, and ROC-AUC
    # We choose Random Forest or Logistic Regression or Linear SVM based on objective F1/Recall/AUC
    # Let's compute a balanced ranking score: 0.35 * Recall + 0.35 * F1 + 0.30 * ROC_AUC
    best_model_name = None
    best_score = -1.0
    for name, m in results.items():
        score = 0.35 * m['recall'] + 0.35 * m['f1_score'] + 0.30 * m['roc_auc']
        if score > best_score:
            best_score = score
            best_model_name = name

    print(f"Selected Optimal Model: {best_model_name} (Composite Screening Score: {best_score:.4f})")
    chosen_pipeline = fitted_pipelines[best_model_name]

    # Save final chosen model and baseline model
    joblib.dump(chosen_pipeline, os.path.join(output_dir, "diabetes_best_model.joblib"))
    joblib.dump(fitted_pipelines["Linear SVM (Baseline)"], os.path.join(output_dir, "diabetes_svm_baseline.joblib"))

    # Extract feature importance / coefficients for explainability
    feature_importance = {}
    clf_step = chosen_pipeline.named_steps['classifier']
    if hasattr(clf_step, 'feature_importances_'):
        importances = clf_step.feature_importances_
        feature_importance = {feat: float(imp) for feat, imp in zip(feature_names, importances)}
    elif hasattr(clf_step, 'coef_'):
        coefs = np.abs(clf_step.coef_[0])
        feature_importance = {feat: float(c) for feat, c in zip(feature_names, coefs)}

    # Save comprehensive metadata and metrics
    metadata = {
        "project": "Diabetes Prediction and Health Risk Assessment System",
        "version": "1.0.0",
        "dataset": {
            "filename": "diabetes.csv",
            "total_samples": int(len(df)),
            "features": feature_names,
            "target": "Outcome",
            "classes": {"0": "Negative (Non-Diabetic)", "1": "Positive (Diabetic)"},
            "class_distribution": outcome_counts,
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
            "duplicates": num_duplicates,
            "zero_counts_imputed": zero_counts
        },
        "selected_model": best_model_name,
        "models_evaluated": list(models_config.keys()),
        "metrics_summary": results,
        "feature_importance": feature_importance,
        "original_unimputed_svm_baseline": {
            "train_accuracy": float(raw_train_acc),
            "test_accuracy": float(raw_test_acc)
        }
    }

    metadata_path = os.path.join(output_dir, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    eval_json_path = os.path.join(eval_dir, "metrics.json")
    with open(eval_json_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print("\n" + "=" * 60)
    print("STAGE 5: GENERATING EVALUATION VISUALIZATIONS")
    print("=" * 60)

    # Plot 1: Model Comparison Bar Chart
    plt.figure(figsize=(10, 6))
    metrics_to_plot = ['test_accuracy', 'precision', 'recall', 'f1_score', 'roc_auc']
    df_plot = pd.DataFrame([
        {
            'Model': m['name'],
            'Accuracy': m['test_accuracy'],
            'Precision': m['precision'],
            'Recall': m['recall'],
            'F1-Score': m['f1_score'],
            'ROC-AUC': m['roc_auc']
        }
        for m in results.values()
    ])
    df_melted = pd.melt(df_plot, id_vars=['Model'], var_name='Metric', value_name='Score')
    palette = sns.color_palette("mako", 5)
    ax = sns.barplot(x='Model', y='Score', hue='Metric', data=df_melted, palette=palette)
    plt.title('Algorithm Performance Comparison on Testing Set (N=154)', fontsize=14, pad=15, fontweight='bold')
    plt.ylabel('Score (0.0 to 1.0)', fontsize=11)
    plt.xlabel('Machine Learning Model', fontsize=11)
    plt.ylim(0, 1.05)
    plt.legend(bbox_to_anchor=(1.02, 1), loc='upper left')
    plt.tight_layout()
    chart1_path = os.path.join(eval_dir, "model_comparison.png")
    plt.savefig(chart1_path, dpi=300)
    plt.close()
    print(f"Saved: {chart1_path}")

    # Plot 2: Confusion Matrix of Selected Model
    plt.figure(figsize=(7, 5.5))
    cm = results[best_model_name]['confusion_matrix']
    cm_labels = ['Negative (0)', 'Positive (1)']
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues',
        xticklabels=cm_labels, yticklabels=cm_labels,
        cbar=True, annot_kws={'size': 14, 'weight': 'bold'}
    )
    plt.title(f'Confusion Matrix: {best_model_name}\n(Test Set N=154)', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Predicted Class', fontsize=11, labelpad=10)
    plt.ylabel('Actual True Class', fontsize=11, labelpad=10)
    plt.tight_layout()
    chart2_path = os.path.join(eval_dir, "confusion_matrix.png")
    plt.savefig(chart2_path, dpi=300)
    plt.close()
    print(f"Saved: {chart2_path}")

    # Plot 3: Combined ROC Curves
    plt.figure(figsize=(8, 6.5))
    colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']
    for idx, (name, pipeline) in enumerate(fitted_pipelines.items()):
        if hasattr(pipeline.named_steps['classifier'], "predict_proba"):
            y_prob = pipeline.predict_proba(X_test_clean)[:, 1]
        else:
            y_prob = pipeline.decision_function(X_test_clean)
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        auc_val = results[name]['roc_auc']
        plt.plot(fpr, tpr, color=colors[idx], lw=2.2, label=f"{name} (AUC = {auc_val:.3f})")

    plt.plot([0, 1], [0, 1], color='navy', lw=1.5, linestyle='--', label='Random Chance (AUC = 0.500)')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=11)
    plt.ylabel('True Positive Rate (Sensitivity / Recall)', fontsize=11)
    plt.title('Receiver Operating Characteristic (ROC) Curves', fontsize=13, fontweight='bold', pad=12)
    plt.legend(loc="lower right", frameon=True)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    chart3_path = os.path.join(eval_dir, "roc_curves.png")
    plt.savefig(chart3_path, dpi=300)
    plt.close()
    print(f"Saved: {chart3_path}")

    # Plot 4: Feature Importance
    if feature_importance:
        plt.figure(figsize=(9, 5.5))
        feat_df = pd.DataFrame(list(feature_importance.items()), columns=['Feature', 'Importance'])
        feat_df = feat_df.sort_values(by='Importance', ascending=True)
        plt.barh(feat_df['Feature'], feat_df['Importance'], color='#0ea5e9')
        plt.title(f'Feature Importance / Relative Weight ({best_model_name})', fontsize=13, fontweight='bold', pad=12)
        plt.xlabel('Importance Score', fontsize=11)
        plt.tight_layout()
        chart4_path = os.path.join(eval_dir, "feature_importance.png")
        plt.savefig(chart4_path, dpi=300)
        plt.close()
        print(f"Saved: {chart4_path}")

    # Also copy the images to models/ for direct access
    for img_name in ["model_comparison.png", "confusion_matrix.png", "roc_curves.png"]:
        src = os.path.join(eval_dir, img_name)
        dst = os.path.join(output_dir, img_name)
        if os.path.exists(src):
            with open(src, "rb") as fsrc, open(dst, "wb") as fdst:
                fdst.write(fsrc.read())

    print("\n" + "=" * 60)
    print("SUCCESS: TRAINING & EVALUATION COMPLETED REPRODUCIBLY")
    print("=" * 60)
    return metadata

if __name__ == "__main__":
    run_training_pipeline()
