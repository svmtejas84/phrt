from flask import Flask, request, jsonify
from modelUtils import predict as model_predict

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict_disease_route():
    data = request.json.get('data')
    prediction = model_predict(data)
    try:
        out = prediction.tolist()
    except Exception:
        out = prediction
    return jsonify({'prediction': out})

if __name__ == '__main__':
    app.run(debug=True)