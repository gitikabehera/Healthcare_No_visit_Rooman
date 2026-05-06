import pandas as pd
from sqlalchemy import create_engine
import time

def main():
    # ---------------------------------------------------------
    # 1. Configuration: File Path & Database Credentials
    # ---------------------------------------------------------
    # Please ensure your downloaded CSV file matches this name and is in the same folder, 
    # or update the path below accordingly.
    csv_file_path = "KaggleV2-May-2016.csv"
    
    # Aiven MySQL database connection details
    # Set these as environment variables — never hardcode credentials
    import os
    username = os.environ.get("DB_USER", "avnadmin")
    password = os.environ.get("DB_PASSWORD", "")
    host     = os.environ.get("DB_HOST", "mysql-29c3ab9d-gitika-9691.b.aivencloud.com")
    port     = os.environ.get("DB_PORT", "23306")
    database = os.environ.get("DB_NAME", "defaultdb")

    # ---------------------------------------------------------
    # 2. Load dataset using pandas & perform basic inspection
    # ---------------------------------------------------------
    print(f"Loading dataset from: {csv_file_path}...")
    try:
        df = pd.read_csv(csv_file_path)
    except FileNotFoundError:
        print(f"Error: The file '{csv_file_path}' was not found.")
        print("Please place the downloaded dataset in the same directory or update the file path in this script.")
        return

    print("\n--- Basic Inspection ---")
    print(f"Shape of the dataset (Rows, Columns): {df.shape}")
    print(f"\nColumns in the dataset:\n{list(df.columns)}")
    
    print("\nDataset Info:")
    df.info()

    print("\nSample Rows (First 5):")
    print(df.head())
    
    # Optional data cleaning before sending to DB: 
    # Converting column names to lowercase and replacing spaces with underscores 
    # makes working with SQL easier.
    df.columns = [c.lower().replace(' ', '_').replace('-', '_') for c in df.columns]

    # ---------------------------------------------------------
    # 3. Connect to MySQL database (Aiven Cloud)
    # ---------------------------------------------------------
    print("\nConnecting to Aiven MySQL database...")
    # We use SQLAlchemy with PyMySQL
    # Passing an empty ssl dictionary enforces SSL with default CA certificates
    connection_string = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"
    
    engine = create_engine(
        connection_string,
        connect_args={'ssl': {}}
    )

    # ---------------------------------------------------------
    # 4 & 5. Create table automatically and insert dataset
    # ---------------------------------------------------------
    table_name = "appointment_no_show"
    
    print(f"\nInserting data into the '{table_name}' table...")
    print("Please wait, this might take a minute or two for ~100k records...")
    
    start_time = time.time()
    
    try:
        from sqlalchemy import text
        # Aiven requires a primary key, so we create the table manually first
        with engine.begin() as conn:
            conn.execute(text(f"DROP TABLE IF EXISTS {table_name}"))
            conn.execute(text(f"""
                CREATE TABLE {table_name} (
                    appointmentid BIGINT PRIMARY KEY,
                    patientid FLOAT, 
                    gender VARCHAR(10), 
                    scheduledday VARCHAR(255), 
                    appointmentday VARCHAR(255), 
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
        
        # Now we append the data
        df.to_sql(name=table_name, con=engine, if_exists='append', index=False, chunksize=10000)
        
        end_time = time.time()
        
        # ---------------------------------------------------------
        # 6. Show summary
        # ---------------------------------------------------------
        print("\n" + "="*50)
        print("SUCCESS!")
        print(f"Total number of records inserted: {len(df)}")
        print(f"Time taken for insertion: {round(end_time - start_time, 2)} seconds.")
        print("="*50)

    except Exception as e:
        print(f"\nAn error occurred during DB insertion:\n{e}")

if __name__ == "__main__":
    main()
