from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the TensorFlow SavedModel as an inference-only layer
inference_layer = tf.keras.layers.TFSMLayer("../saved-models/1", call_endpoint="serving_default")

# Create a Keras model with the inference-only layer
inputs = tf.keras.Input(shape=(256, 256, 3))
outputs = inference_layer(inputs)
model = tf.keras.Model(inputs, outputs)

# Compile the model (necessary even for inference)
model.compile()

CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

def read_file_as_image(data) -> np.ndarray:
    image = Image.open(BytesIO(data)).convert('RGB').resize((256, 256))
    image = np.array(image)
    print(f"Image shape: {image.shape}")  # Debugging shape
    return image

@app.post("/")
async def predict(file: UploadFile = File(...)):
    print("Received file:", file)
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)

    # Debugging batch shape
    print(f"Batch shape: {img_batch.shape}")

    # Make sure to normalize the input image data if needed
    img_batch = img_batch / 255.0  # Normalize pixel values

    try:
        predictions = model.predict(img_batch)
        print(f"Predictions: {predictions}")  # Debugging output
    except Exception as e:
        print(f"Prediction error: {e}")
        return {"error": "Prediction error occurred"}

    # Access the predictions based on your output structure
    predicted_class_index = np.argmax(predictions['dense_1'][0])  # Adjust based on your output key
    predicted_class = CLASS_NAMES[predicted_class_index]
    confidence = np.max(predictions['dense_1'][0])  # Adjust based on your output key

    return {
        'disease': predicted_class,
        'confidence': float(confidence)
    }

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=3000)