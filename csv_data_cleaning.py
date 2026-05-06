import pandas as pd

def main():
    # Load the dataset
    file_path = "KaggleV2-May-2016.csv"
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"Error: Could not find {file_path}. Please make sure it is in the same folder.")
        return

    print("="*60)
    print("BEFORE CLEANING SUMMARY")
    print("="*60)
    
    # ---------------------------------------------------------
    # 1. Display dataset info (data types, null values)
    # ---------------------------------------------------------
    print("\n[Step 1] Dataset Info:")
    df.info()

    # ---------------------------------------------------------
    # 2. Check for missing values
    # ---------------------------------------------------------
    print("\n[Step 2] Missing Values Summary:")
    missing_values = df.isnull().sum()
    print(missing_values[missing_values > 0] if missing_values.sum() > 0 else "No missing values found.")

    # ---------------------------------------------------------
    # 3. Check for duplicate records
    # ---------------------------------------------------------
    initial_shape = df.shape
    duplicates = df.duplicated().sum()
    print(f"\n[Step 3] Duplicates Found: {duplicates}")
    if duplicates > 0:
        df = df.drop_duplicates()
        print("Duplicates have been successfully removed.")

    # ---------------------------------------------------------
    # 4. Fix incorrect or unrealistic values (like negative age)
    # ---------------------------------------------------------
    print("\n[Step 4] Checking for unrealistic 'Age' values...")
    negative_age_count = len(df[df['Age'] < 0])
    if negative_age_count > 0:
        print(f"Found {negative_age_count} record(s) with Age < 0. Removing them...")
        df = df[df['Age'] >= 0]
    else:
        print("No negative Age values found.")

    # ---------------------------------------------------------
    # 5. Convert date columns to proper datetime format
    # ---------------------------------------------------------
    print("\n[Step 5] Converting Date columns to Datetime format...")
    # 'ScheduledDay' and 'AppointmentDay' format: "2016-04-29T18:38:08Z" 
    df['ScheduledDay'] = pd.to_datetime(df['ScheduledDay'])
    df['AppointmentDay'] = pd.to_datetime(df['AppointmentDay'])
    print("Conversion complete.")

    # ---------------------------------------------------------
    # 6. Standardize column names (lowercase, removing spaces/hyphens)
    # 8. Rename the target column "No-show" to a cleaner name "no_show"
    # ---------------------------------------------------------
    print("\n[Step 6 & 8] Standardizing column names...")
    # This automatically converts "No-show" to "no_show" as well!
    df.columns = [col.strip().lower().replace('-', '_').replace(' ', '_') for col in df.columns]
    print(f"Current columns: {list(df.columns)}")

    # ---------------------------------------------------------
    # 7. Check unique values in important columns
    # ---------------------------------------------------------
    print("\n[Step 7] Checking unique values for categorical features...")
    print(f"Gender unique values: {df['gender'].unique()}")
    print(f"No_show unique values: {df['no_show'].unique()}")
    print(f"SMS_received unique values: {df['sms_received'].unique()}")

    # ---------------------------------------------------------
    # Output the AFTER CLEANING SUMMARY
    # ---------------------------------------------------------
    print("\n" + "="*60)
    print("AFTER CLEANING SUMMARY")
    print("="*60)
    print(f"Original Records: {initial_shape[0]}")
    print(f"Final Cleaned Records: {df.shape[0]}")
    print(f"Records Removed: {initial_shape[0] - df.shape[0]}")
    print("\nFinal Dataset Info:")
    df.info()

    # Save the cleaned dataset to a new CSV file
    clean_file_path = "cleaned_appointment_data.csv"
    df.to_csv(clean_file_path, index=False)
    print(f"\nCleaned dataset saved as: {clean_file_path}")

if __name__ == "__main__":
    main()
