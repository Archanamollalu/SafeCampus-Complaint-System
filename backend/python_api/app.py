from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import os

app = Flask(__name__)

# Model directory
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")

# Load tokenizer + model
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)

severity_map = {
    0: "low",
    1: "medium",
    2: "high"
}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    probs = torch.softmax(outputs.logits, dim=1)
    pred_class = torch.argmax(probs, dim=1).item()

    print("LOGITS:", outputs.logits)
    print("PROBS:", probs)
    print("PRED:", pred_class)

    return jsonify({"severity": severity_map[pred_class]})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)