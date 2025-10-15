import joblib
import numpy as np

# Load the trained model
model = joblib.load('backend/model/disease_predictor_model.joblib')

def predict(input_data):
    # Preprocess input_data if necessary
    # Convert input_data to the format expected by the model
    # Example: input_data = np.array(input_data).reshape(1, -1)
    prediction = model.predict(input_data)
    return prediction
