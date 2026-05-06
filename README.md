# NovaHealth - Healthcare Appointment No-Show Predictor

An end-to-end AI/ML web application that predicts whether a patient will miss their scheduled hospital appointment. Built as part of an AI/Data Analytics Internship Project.

## Live Demo

- Frontend: Deployed on Vercel
- Backend API: Deployed on Render

---

## Project Overview

Hospital appointment no-shows cost clinics significant revenue and deny timely care to other patients. This project uses a Random Forest classifier trained on 110,000+ real patient records to predict no-show probability before the appointment date, enabling proactive intervention like targeted SMS reminders and smart overbooking.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Data Processing | Python, Pandas, NumPy |
| Machine Learning | Scikit-learn (Random Forest) |
| Model Persistence | Joblib (.pkl files) |
| EDA Visualisation | Matplotlib, Seaborn |
| Backend API | FastAPI, Uvicorn, Pydantic |
| AI Integration | Hugging Face Hub, Meta Llama-3.1-8B |
| Frontend Framework | React 19 |
| Build Tool | Vite 8 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Pure CSS with custom properties |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Project Structure

```
Healthcare_Rooman/
|
|-- api.py                        # FastAPI backend (predict + AI endpoints)
|-- app.py                        # Streamlit version of the app
|-- model_building.py             # ML model training script
|-- feature_engineering.py        # Feature creation and encoding
|-- data_cleaning.py              # Raw data cleaning pipeline
|-- csv_data_cleaning.py          # CSV-specific cleaning
|-- eda.py                        # Exploratory data analysis + plots
|-- model_interpretation.py       # Feature importance analysis
|-- db_ingestion.py               # Database ingestion script
|
|-- no_show_model.pkl             # Trained Random Forest model
|-- scaler.pkl                    # StandardScaler for numeric features
|-- feature_columns.json          # Exact feature list (17 features)
|-- logistic_regression_model.pkl # Logistic Regression (comparison)
|-- random_forest_model.pkl       # Random Forest (saved separately)
|
|-- cleaned_appointment_data.csv  # Cleaned dataset
|-- X_train.csv / X_test.csv      # Train/test feature splits
|-- y_train.csv / y_test.csv      # Train/test label splits
|
|-- requirements.txt              # Python dependencies
|-- render.yaml                   # Render deployment config
|
|-- eda_plots/                    # Generated EDA visualisations
|   |-- 1_noshow_distribution.png
|   |-- 2_age_vs_noshow.png
|   |-- 3_gender_vs_noshow.png
|   |-- 4_sms_vs_noshow.png
|   |-- 5_waitingdays_vs_noshow.png
|   |-- 6_dayofweek_vs_noshow.png
|   |-- 7_feature_importance.png
|
|-- frontend/                     # React web application
    |-- index.html                # Entry point + all CSS
    |-- vite.config.js
    |-- package.json
    |-- .env.development          # Local API URL
    |-- .env.production           # Production API URL
    |-- src/
        |-- main.jsx              # React entry point
        |-- App.jsx               # Full application (all pages)
```

---

## Machine Learning Pipeline

### Dataset
- Source: Kaggle - Medical Appointment No Shows (Brazil, 2016)
- Records: 110,527 appointments
- Features: 14 original + engineered features
- Target: no_show (binary classification)
- Class split: 79.8% Show / 20.2% No-Show

### Steps
1. Data Cleaning - removed negative ages/waiting days, standardized columns, parsed dates
2. Feature Engineering - one-hot encoded weekday, age group buckets (Child/Adult/Senior), label encoded gender
3. EDA - analysed distributions, correlations, feature importance
4. Model Training - compared Logistic Regression vs Random Forest
5. Model Selection - Random Forest selected (~85% accuracy)
6. Serialization - saved model, scaler, and feature columns with Joblib

### Model Performance
| Metric | Score |
|---|---|
| Accuracy | ~85% |
| Precision | ~78% |
| Recall | ~72% |
| F1 Score | ~75% |

### Key Features (by importance)
1. Waiting days (strongest predictor)
2. Age
3. SMS received
4. Scholarship status
5. Day of week
6. Hypertension / Diabetes

---

## Backend API

Built with FastAPI. Two main endpoints:

### POST /predict
Accepts patient details and returns prediction.

Request body:
```json
{
  "age": 35,
  "gender": "Female",
  "waiting_days": 14,
  "sms_received": "No"
}
```

Response:
```json
{
  "prediction": 1,
  "no_show_probability": 67.3
}
```

### POST /ask_ai
Accepts a question and returns an AI-generated response from Meta Llama-3.1-8B.

Request body:
```json
{
  "question": "How can we reduce no-shows for patients waiting 15+ days?"
}
```

Response:
```json
{
  "reply": "..."
}
```

### GET /
Health check - returns API status.

---

## Frontend Web App

Built with React 19 + Vite. Five pages:

### Home
- Hero banner with project stats
- Feature cards explaining system capabilities
- CTA buttons to Prediction and Dashboard

### Dashboard (Dynamic/Interactive)
- 5 filter groups: Gender, SMS, Scholarship, Age Group, Wait Time
- All filters combine with AND logic
- 4 KPI cards update live on filter change
- 6 interactive charts all respond to filters:
  - Pie chart - appointment outcome split
  - Bar chart - waiting time vs no-show risk
  - Stacked bar - SMS reminder impact
  - Bar chart - no-show by gender
  - Bar chart - no-show by age group
  - Line chart - no-show by day of week

### Prediction
- 3-section form (Patient Details / Medical Conditions / Appointment Details)
- 9 input fields
- Animated confidence progress bar
- Color-coded result (red = high risk, green = low risk)
- Dynamic explanation bullets based on input values
- Download Report button (generates .txt file)
- Prediction History (last 5 stored in localStorage)

### AI Assistant
- Powered by Meta Llama-3.1-8B via Hugging Face Inference API
- 3 suggestion chips for quick questions
- Free-text question input

### About
- Model performance metrics
- Full tech stack breakdown
- Dataset information

### UI Features
- Dark/light theme toggle (persists in localStorage)
- Mobile responsive (bottom nav bar under 768px)
- Toast notifications on prediction complete
- Smooth page transitions (Framer Motion)
- Animated confidence bar

---

## Running Locally

### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn api:app --reload --port 8000
```

API will be available at http://localhost:8000

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

App will be available at http://localhost:5173

### Run ML Pipeline (optional, models already saved)

```bash
python data_cleaning.py
python feature_engineering.py
python model_building.py
python eda.py
```

---

## Deployment

### Backend - Render

1. Push repo to GitHub
2. Go to render.com - New Web Service
3. Connect your GitHub repo
4. Settings:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn api:app --host 0.0.0.0 --port $PORT`
5. Deploy and copy the URL

### Frontend - Vercel

1. Go to vercel.com - New Project
2. Import your GitHub repo
3. Set Root Directory to `frontend`
4. Add environment variable: `VITE_API_URL` = your Render URL
5. Deploy

Note: Render free tier spins down after 15 minutes of inactivity. First request after idle takes ~30 seconds to wake up.

---

## Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://your-app-name.onrender.com
```

### Frontend (.env.development)
```
VITE_API_URL=http://localhost:8000
```

---

## Dataset

- Name: Medical Appointment No Shows
- Source: Kaggle (https://www.kaggle.com/datasets/joniarroba/noshowappointments)
- Original file: KaggleV2-May-2016.csv
- Records: 110,527
- Location: Brazil, 2016

---

## Key Insights from EDA

- Patients with waiting days > 15 have 3x higher no-show rate than same-day appointments
- SMS reminders paradoxically show higher no-show rates (sent to already high-risk patients)
- Senior patients (65+) are most consistent with appointments
- Friday has the highest no-show rate across all days
- Scholarship holders show slightly higher no-show tendency
- Gender has minimal impact on no-show rates

---

## Project Stats

- 110,527 patient records trained on
- 17 features used by the model
- ~85% model accuracy
- 75 pre-computed data segments for dynamic dashboard
- 5 pages in the web app
- 9 form inputs on prediction page
- 6 interactive charts on dashboard
- 5 filter dimensions on dashboard

---

## Author

Developed as part of AI/Data Analytics Internship Project

---

## License

This project is for educational and portfolio purposes.