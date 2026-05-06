import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.exceptions import DataConversionWarning
import warnings
warnings.filterwarnings("ignore", category=DataConversionWarning)

def main():
    print("="*60)
    print("STARTING FEATURE ENGINEERING & PREPROCESSING")
    print("="*60)

    # 1. Load Data
    try:
        df = pd.read_csv("cleaned_appointment_data.csv")
    except FileNotFoundError:
        print("Please ensure 'cleaned_appointment_data.csv' is in the directory.")
        return
    
    initial_shape = df.shape

    # Re-cast to datetime (read_csv treats them as strings)
    df['scheduledday'] = pd.to_datetime(df['scheduledday']).dt.tz_localize(None)
    df['appointmentday'] = pd.to_datetime(df['appointmentday']).dt.tz_localize(None)

    # ---------------------------------------------------------
    # STEP 1: CREATE NEW FEATURES
    # ---------------------------------------------------------
    print("\n[1] Creating new features: waiting_days, appointment_weekday, age_group...")
    
    # A) waiting_days: Subtract scheduled date from appointment date (ignoring time)
    df['waiting_days'] = (df['appointmentday'].dt.normalize() - df['scheduledday'].dt.normalize()).dt.days

    # B) appointment_weekday: Day of the week (Monday=0, Sunday=6)
    df['appointment_weekday'] = df['appointmentday'].dt.day_name()

    # C) age_group: Bin ages into semantic categories
    # Child: 0-17, Adult: 18-64, Senior: 65+
    bins = [-1, 17, 64, 150]
    labels = ['Child', 'Adult', 'Senior']
    df['age_group'] = pd.cut(df['age'], bins=bins, labels=labels)

    # ---------------------------------------------------------
    # STEP 2 & 5: HANDLE OUTLIERS & INVALID DATA
    # ---------------------------------------------------------
    print("[2 & 5] Handling Outliers...")
    # Remove negative waiting days (data entry errors where appt is before scheduling)
    df = df[df['waiting_days'] >= 0]

    # Cap waiting days to a reasonable limit (e.g. 180 days/6 months) to avoid extreme outliers skewing scale
    df.loc[df['waiting_days'] > 180, 'waiting_days'] = 180

    # Cap age to 100 just to deal with extreme outliers (though tree models resist outliers, it helps scaling)
    df.loc[df['age'] > 100, 'age'] = 100

    # ---------------------------------------------------------
    # STEP 3: DROP UNNECESSARY COLUMNS
    # ---------------------------------------------------------
    print("[3] Dropping unneeded columns (PatientId, AppointmentID, original Dates)...")
    # PatientId and AppointmentID have no predictive value.
    # The Date strings are no longer needed because we extracted 'waiting_days' and 'weekday'
    drop_cols = ['patientid', 'appointmentid', 'scheduledday', 'appointmentday']
    df.drop(columns=drop_cols, inplace=True)

    # ---------------------------------------------------------
    # STEP 4: ENCODE CATEGORICAL COLUMNS AND THE TARGET VARIABLE
    # ---------------------------------------------------------
    print("[4] Encoding Variables (Categorical & Target)...")
    
    # Target Variable: Convert "Yes" (did not show) to 1, "No" (showed up) to 0. 
    # Positive class (1) = No-show.
    df['no_show'] = df['no_show'].map({'Yes': 1, 'No': 0})
    
    # Binary Categoricals (Label Encoding explicitly)
    df['gender'] = df['gender'].map({'F': 1, 'M': 0}) # 1: Female, 0: Male 
    
    # High Cardinality Categorical: 'Neighbourhood'
    # We will Label Encode it because Tree Based models (Random Forest) handle Label Encoded high-cardinality better than One-Hot-Encoding (which creates excessive sparsity)
    le = LabelEncoder()
    df['neighbourhood'] = le.fit_transform(df['neighbourhood'])
    
    # Nominal Categoricals: We will One-Hot Encode 'appointment_weekday' and 'age_group'
    # Use drop_first=True to avoid the dummy variable trap
    df = pd.get_dummies(df, columns=['appointment_weekday', 'age_group'], drop_first=True)

    # Ensure all data in the dataframe is numeric (float/int)
    for col in df.columns:
        if df[col].dtype == 'bool':
            df[col] = df[col].astype(int)

    # ---------------------------------------------------------
    # STEP 6: SPLIT THE DATASET
    # ---------------------------------------------------------
    print("\n[6] Splitting the dataset (80% Train, 20% Test)...")
    X = df.drop(columns=['no_show'])
    y = df['no_show']
    
    # Stratify split ensures target class proportions are fully maintained
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # ---------------------------------------------------------
    # STEP 7: SCALE FEATURES
    # ---------------------------------------------------------
    print("[7] Scaling numerical features (age, waiting_days)...")
    # Tree models technically don't require scaling, but Logistic Regression (our baseline model mentioned in the blueprint) DOES.
    # We use StandardScaler to center the mean at 0 and variance at 1.
    scaler = StandardScaler()
    num_cols = ['age', 'waiting_days', 'scholarship', 'hipertension', 'diabetes', 'alcoholism', 'handcap', 'sms_received', 'neighbourhood']
    
    # Fit scaler on training data, then transform both train and test to prevent data leakage!
    X_train[num_cols] = scaler.fit_transform(X_train[num_cols])
    X_test[num_cols] = scaler.transform(X_test[num_cols])
    
    import joblib
    import json
    
    print("[8] Saving Deployment Assets (Scaler & Feature Names)...")
    joblib.dump(scaler, "scaler.pkl")
    with open("feature_columns.json", "w") as f:
        json.dump(list(X.columns), f)

    
    # ---------------------------------------------------------
    # SAVE PIPELINE RESULTS
    # ---------------------------------------------------------
    X_train.to_csv("X_train.csv", index=False)
    X_test.to_csv("X_test.csv", index=False)
    y_train.to_csv("y_train.csv", index=False)
    y_test.to_csv("y_test.csv", index=False)
    
    print("\n" + "="*60)
    print("PREPROCESSING COMPLETED")
    print("="*60)
    print(f"Original Shape: {initial_shape}")
    print(f"Final Preprocessed Shape (Total): {df.shape}")
    print(f"\nTraining set size: X_train = {X_train.shape}, y_train = {y_train.shape}")
    print(f"Testing set size:  X_test  = {X_test.shape}, y_test  = {y_test.shape}")
    print(f"Final Features: {list(X.columns)}")
    print("Data saved as 'X_train.csv', 'X_test.csv', 'y_train.csv', 'y_test.csv'. Ready for model training!")

if __name__ == "__main__":
    main()
