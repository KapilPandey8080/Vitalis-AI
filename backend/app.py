from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# flask --app app.py run --debug

# Breast cancer model and scaler
with open("./model/breast_cancer_model.pkl", "rb") as f:
    breast_cancer_model = pickle.load(f)
with open("./scaler/breast_cancer_model_scaler.pkl", "rb") as f:
    breast_cancer_scaler = pickle.load(f)

# Heart disease model and scaler
with open("./model/heart_disease_model.pkl", "rb") as f:
    heart_disease_model = pickle.load(f)
with open("./scaler/heart_disease_model_scaler.pkl", "rb") as f:
    heart_disease_scaler = pickle.load(f)

# Diabetes model and scaler
with open("./model/diabetes_model.pkl", "rb") as f:
    diabetes_model = pickle.load(f)

with open("./scaler/diabetes_model_scaler.pkl", "rb") as f:
    diabetes_model_scaler = pickle.load(f)



@app.route("/breast_cancer_predict", methods=['POST'])
def breast_cancer_predict():
    try:
        data = request.json['input_data']
        input_array = np.array(data).reshape(1, -1)
        input_scaled = breast_cancer_scaler.transform(input_array)

        probabilities = breast_cancer_model.predict_proba(input_scaled)

        # Get probability of class 1 (Malignant)
        prob_malignant = float(probabilities[0][1])  # class index 1

        prediction = breast_cancer_model.predict(input_scaled)
        result = "Malignant" if prediction[0] == 1 else "Benign"
        return jsonify({'prediction': int(prediction[0]), 'message': f"The Breast Cancer is {result}", 'probability_malignant': prob_malignant,
            'probability_benign': float(probabilities[0][0])})
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    

@app.route("/heart_disease_predict", methods=['POST'])
def heart_disease_predict():
    try:
        data = request.json['input_data']
        input_array = np.array(data).reshape(1, -1)
        input_scaled = heart_disease_scaler.transform(input_array)

        probabilities = heart_disease_model.predict_proba(input_scaled)
        prob_heart_disease = float(probabilities[0][0])  # class 0 = disease
        prob_healthy = float(probabilities[0][1])        # class 1 = healthy

        prediction = heart_disease_model.predict(input_scaled)
        result = "has Heart Disease" if prediction[0] == 0 else "does not have Heart Disease"

        return jsonify({
            'prediction': int(prediction[0]),
            'message': f"The person {result}",
            'probability_heart_disease': prob_heart_disease,
            'probability_healthy': prob_healthy
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400
    

@app.route("/diabetes_predict", methods=["POST"])
def diabetes_predict():
    try:
        data = request.json["input_data"]
        input_array = np.array(data).reshape(1, -1)
        input_scaled = diabetes_model_scaler.transform(input_array)

        # Get prediction and probability
        probabilities = diabetes_model.predict_proba(input_scaled)
        prob_diabetic = float(probabilities[0][1])  # class 1 = diabetic
        prob_non_diabetic = float(probabilities[0][0])  # class 0

        prediction = diabetes_model.predict(input_scaled)
        result = "Diabetic" if prediction[0] == 1 else "Non-Diabetic"

        return jsonify({
            "prediction": int(prediction[0]),
            "message": f"The person is {result}",
            "probability_diabetic": prob_diabetic,
            "probability_non_diabetic": prob_non_diabetic
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
