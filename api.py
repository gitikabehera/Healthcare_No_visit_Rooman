from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import json
import os

app = FastAPI(title="Healthcare Appointment No-Show API")

# -------------------------------
# CORS (allow frontend)
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# SAFE MODEL LOADING
# -------------------------------
model = None
scaler = None
feature_cols = []

try:
    model = joblib.load("no_show_model.pkl")
    scaler = joblib.load("scaler.pkl")
    with open("feature_columns.json", "r") as f:
        feature_cols = json.load(f)
    print("✅ Model loaded successfully")
except Exception as e:
    print("⚠️ Model not found, running without ML model:", e)

# -------------------------------
# REQUEST MODELS
# -------------------------------
class PatientData(BaseModel):
    age: int
    gender: str
    waiting_days: int
    sms_received: str

class ChatRequest(BaseModel):
    question: str

# -------------------------------
# ROUTES
# -------------------------------
@app.get("/")
def home():
    return {"status": "API is active and running"}

# -------------------------------
# PREDICT API
# -------------------------------
@app.post("/predict")
def predict(data: PatientData):
    if model is None or scaler is None:
        return {"message": "Prediction model not available in deployed version"}

    try:
        input_dict = {col: 0 for col in feature_cols}

        input_dict['age'] = data.age
        input_dict['waiting_days'] = data.waiting_days
        input_dict['gender'] = 1 if data.gender.lower() == "female" else 0
        input_dict['sms_received'] = 1 if data.sms_received.lower() == "yes" else 0

        if data.age >= 65:
            input_dict['age_group_Senior'] = 1
        elif data.age >= 18:
            input_dict['age_group_Adult'] = 1

        input_df = pd.DataFrame([input_dict], columns=feature_cols)

        num_cols = [
            'age', 'waiting_days', 'scholarship', 'hipertension',
            'diabetes', 'alcoholism', 'handcap', 'sms_received', 'neighbourhood'
        ]

        input_df[num_cols] = scaler.transform(input_df[num_cols])

        prediction = model.predict(input_df)[0]
        prob = model.predict_proba(input_df)[0][1] * 100

        return {
            "prediction": int(prediction),
            "no_show_probability": float(prob)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------
# AI CHAT (FINAL WORKING VERSION)
# -------------------------------
@app.post("/ask_ai")
def ask_ai(data: ChatRequest):
    try:
        from huggingface_hub import InferenceClient

        hf_token = os.environ.get("HF_TOKEN")

        if not hf_token:
            return {"reply": "HF token not configured"}

        client = InferenceClient(token=hf_token)

        # ✅ Stable free model
        response = client.text_generation(
            model="bigscience/bloom-560m",
            prompt=f"Answer as a healthcare data expert: {data.question}",
            max_new_tokens=150,
        )

        return {"reply": response}

    except Exception as e:
        return {"reply": f"AI Error: {str(e)}"}

# -------------------------------
# RUN SERVER
# -------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
