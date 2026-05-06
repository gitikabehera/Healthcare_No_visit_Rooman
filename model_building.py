import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

def main():
    print("="*60)
    print("STARTING MODEL TRAINING & EVALUATION")
    print("="*60)

    # 1. Load Data
    try:
        X_train = pd.read_csv("X_train.csv")
        X_test  = pd.read_csv("X_test.csv")
        y_train = pd.read_csv("y_train.csv")['no_show']
        y_test  = pd.read_csv("y_test.csv")['no_show']
    except FileNotFoundError:
        print("Please ensure X_train.csv, X_test.csv, y_train.csv, and y_test.csv are in the directory.")
        return
    
    print("\n[1] Data Loaded successfully! Training sets contain ~88k records.")
    
    # ---------------------------------------------------------
    # STEP 1: LOGISTIC REGRESSION (BASELINE MODEL)
    # ---------------------------------------------------------
    print("\n[2] Training Logistic Regression (Baseline Model)...")
    # We use class_weight='balanced' because our dataset is imbalanced (80/20). 
    # This severely helps the model not just predict "Showed up" for everyone.
    log_reg = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    log_reg.fit(X_train, y_train)
    
    # Predict
    y_pred_lr = log_reg.predict(X_test)
    
    # Evaluate LR
    lr_acc = accuracy_score(y_test, y_pred_lr)
    lr_prec = precision_score(y_test, y_pred_lr)
    lr_rec = recall_score(y_test, y_pred_lr)
    lr_f1 = f1_score(y_test, y_pred_lr)
    lr_cm = confusion_matrix(y_test, y_pred_lr)
    
    # ---------------------------------------------------------
    # STEP 2: RANDOM FOREST (MAIN MODEL)
    # ---------------------------------------------------------
    print("[3] Training Random Forest (Main Model)...")
    # Again using class_weight='balanced_subsample' to fix the imbalance dynamically
    # n_estimators=100 is a solid baseline for number of trees.
    # n_jobs=-1 uses all CPU cores for significantly faster training.
    rf_model = RandomForestClassifier(n_estimators=100, class_weight='balanced_subsample', random_state=42, n_jobs=-1, max_depth=15)
    rf_model.fit(X_train, y_train)
    
    # Predict
    y_pred_rf = rf_model.predict(X_test)
    
    # Evaluate RF
    rf_acc = accuracy_score(y_test, y_pred_rf)
    rf_prec = precision_score(y_test, y_pred_rf)
    rf_rec = recall_score(y_test, y_pred_rf)
    rf_f1 = f1_score(y_test, y_pred_rf)
    rf_cm = confusion_matrix(y_test, y_pred_rf)
    
    # ---------------------------------------------------------
    # STEP 3 & 4: RESULTS COMPARISON
    # ---------------------------------------------------------
    print("\n" + "="*60)
    print("MODEL COMPARISON RESULTS")
    print("="*60)
    
    print(f"{'Metric':<15} | {'Logistic Regression':<20} | {'Random Forest':<20}")
    print("-" * 60)
    print(f"{'Accuracy':<15} | {lr_acc:.4f}               | {rf_acc:.4f}")
    print(f"{'Precision':<15} | {lr_prec:.4f}               | {rf_prec:.4f}")
    print(f"{'Recall':<15} | {lr_rec:.4f}               | {rf_rec:.4f}")
    print(f"{'F1 Score':<15} | {lr_f1:.4f}               | {rf_f1:.4f}")
    
    print("\n--- Confusion Matrix (Logistic Regression) ---")
    print(lr_cm)
    print("Format:")
    print("[[True Negative (Show)       False Positive (wrongly guessed no-show)]")
    print(" [False Negative (missed)    True Positive (correctly caught no-show)]]")
    
    print("\n--- Confusion Matrix (Random Forest) ---")
    print(rf_cm)
    
    # ---------------------------------------------------------
    # STEP 5: SAVE THE BETTER MODEL FOR DEPLOYMENT
    # ---------------------------------------------------------
    print("\n[4] Saving Deployment Assets...")
    joblib.dump(log_reg, "logistic_regression_model.pkl")
    joblib.dump(rf_model, "no_show_model.pkl")
    print("[+] Model saved successfully as 'no_show_model.pkl'")
    print("[+] Scaler and Features were saved previously as 'scaler.pkl' and 'feature_columns.json'")
    print("\nDeployment assets are fully ready!")

if __name__ == "__main__":
    main()
