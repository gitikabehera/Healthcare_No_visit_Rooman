from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import json

app = FastAPI(title="Healthcare Appointment No-Show API")

# Allow React app to securely communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load global ML assets
try:
    model = joblib.load("no_show_model.pkl")
    scaler = joblib.load("scaler.pkl")
    with open("feature_columns.json", "r") as f:
        feature_cols = json.load(f)
except Exception as e:
    print(f"Error loading assets: {e}")

class PatientData(BaseModel):
    age: int
    gender: str
    waiting_days: int
    sms_received: str

@app.get("/")
def home():
    return {"status": "API is purely active and connected"}

@app.post("/predict")
def predict(data: PatientData):
    try:
        # Preprocess input exactly as training
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
        
        num_cols = ['age', 'waiting_days', 'scholarship', 'hipertension', 'diabetes', 'alcoholism', 'handcap', 'sms_received', 'neighbourhood']
        input_df[num_cols] = scaler.transform(input_df[num_cols])
        
        prediction = model.predict(input_df)[0]
        prob = model.predict_proba(input_df)[0][1] * 100
        
        return {
            "prediction": int(prediction),
            "no_show_probability": float(prob)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    question: str

@app.post("/ask_ai")
def ask_ai(data: ChatRequest):
    try:
        from huggingface_hub import InferenceClient
        import os
        hf_token = os.environ.get("HF_TOKEN", "")
        client = InferenceClient(api_key=hf_token)
        
        system_prompt = """
        You are an expert AI Healthcare Data Analyst. 
        This project focuses on predicting patient NO-SHOWS at hospitals using Machine Learning.
        Our findings show: longer waiting times heavily cause no-shows, SMS reminders are usually triggered for high-risk patients, and gender does not affect no-show rates.
        Answer the user's question clearly, professionally, and provide actionable recommendations for hospital management. Keep it concise.
        """
        
        response = client.chat_completion(
            model="meta-llama/Llama-3.1-8B-Instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": data.question}
            ],
            max_tokens=500,
            temperature=0.7,
        )
        
        return {"reply": response.choices[0].message.content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
