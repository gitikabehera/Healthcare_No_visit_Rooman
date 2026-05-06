import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

def main():
    print("Loading the Random Forest Model for interpretation...")
    # Load Model and Training Data
    rf_model = joblib.load("random_forest_model.pkl")
    X_train = pd.read_csv("X_train.csv")

    # ---------------------------------------------------------
    # 1. EXTRACT FEATURE IMPORTANCE
    # ---------------------------------------------------------
    # The Random Forest model automatically measures how much each feature contributed to predictions.
    importances = rf_model.feature_importances_
    
    # Map the importances to column names and sort them
    feature_importance_df = pd.DataFrame({
        'Feature': X_train.columns,
        'Importance (Percentage)': importances * 100
    }).sort_values(by='Importance (Percentage)', ascending=False)

    print("\n--- TOP 5 MOST IMPORTANT PREDICTORS ---")
    print(feature_importance_df.head(5))

    # ---------------------------------------------------------
    # 2. PLOT FEATURE IMPORTANCE
    # ---------------------------------------------------------
    plt.figure(figsize=(10, 6))
    sns.barplot(data=feature_importance_df.head(10), x='Importance (Percentage)', y='Feature', palette='viridis')
    plt.title('Top 10 Most Important Features for Predicting No-Shows')
    plt.xlabel('Importance (%)')
    plt.ylabel('Patient Attribute')
    plt.tight_layout()
    plt.savefig('eda_plots/7_feature_importance.png')
    plt.close()
    
    print("\nFeature Importance graph successfully saved accurately to 'eda_plots/7_feature_importance.png'!")

if __name__ == "__main__":
    main()
