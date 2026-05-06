import pandas as pd
from sqlalchemy import create_engine, text

def main():
    print("--- Starting Data Cleaning Process ---")
    
    # Aiven MySQL database connection details
    # Set these as environment variables — never hardcode credentials
    import os
    username   = os.environ.get("DB_USER", "avnadmin")
    password   = os.environ.get("DB_PASSWORD", "")
    host       = os.environ.get("DB_HOST", "mysql-29c3ab9d-gitika-9691.b.aivencloud.com")
    port       = os.environ.get("DB_PORT", "23306")
    database   = os.environ.get("DB_NAME", "defaultdb")
    table_name = "appointment_no_show"

    connection_string = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"
    engine = create_engine(connection_string, connect_args={'ssl': {}})

    # 1. Load data from MySQL
    print("\n1. Fetching data from the database...")
    query = f"SELECT * FROM {table_name}"
    df = pd.read_sql(query, engine)
    print(f"Original shape: {df.shape}")

    # 2. Check for missing values
    print("\n2. Checking for missing values...")
    missing_values = df.isnull().sum()
    print(missing_values[missing_values > 0])
    if missing_values.sum() == 0:
        print("No missing values found!")

    # 3. Fixing Date Formats
    print("\n3. Converting string dates to datetime objects...")
    # Dates generally look like "2016-04-29T18:38:08Z"
    df['scheduledday'] = pd.to_datetime(df['scheduledday'])
    df['appointmentday'] = pd.to_datetime(df['appointmentday'])
    print("Converted scheduledday and appointmentday to DateTime format.")

    # 4. Checking and removing invalid entries
    print("\n4. Checking for invalid numerical entries...")
    invalid_age = df[df['age'] < 0]
    print(f"Found {len(invalid_age)} rows with invalid Age (Age < 0).")
    
    if len(invalid_age) > 0:
        print("Removing invalid Age rows...")
        df = df[df['age'] >= 0]
    
    # Optional: Handcap has values > 1 in some rows (representing number of handicaps). 
    # We will leave it as is, or cap it if requested. 
    # Let's cap Handcap at 1 (just representing presence/absence True/False) as it's common practice for this dataset.
    print("Capping Handcap at 1 (treating it as boolean representation)...")
    df['handcap'] = df['handcap'].apply(lambda x: 1 if x > 0 else 0)

    print(f"\nFinal cleaned shape: {df.shape}")
    
    # 5. Save the cleaned data back to MySQL
    print("\n5. Updating the database with cleaned data...")
    # Create valid table with right schema
    with engine.begin() as conn:
        conn.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
        conn.execute(text(f"""
            CREATE TABLE {table_name} (
                appointmentid BIGINT PRIMARY KEY,
                patientid FLOAT, 
                gender VARCHAR(10), 
                scheduledday DATETIME, 
                appointmentday DATETIME, 
                age INT, 
                neighbourhood VARCHAR(255), 
                scholarship INT, 
                hipertension INT, 
                diabetes INT, 
                alcoholism INT, 
                handcap INT, 
                sms_received INT, 
                no_show VARCHAR(10)
            )
        """))
    
    df.to_sql(name=table_name, con=engine, if_exists='append', index=False, chunksize=10000)
    print("Database updated successfully with clean data!")

if __name__ == "__main__":
    main()
