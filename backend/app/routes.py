import base64
import io
from flask import Flask, request, jsonify
from PIL import Image
from utils import process_image  # Your image processing logic
from flask import render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        image_data = data['image']
        inference_steps = int(data.get('inference_steps', 10))
        guidance_scale = float(data.get('guidance_scale', 1.7))
        prompt = data.get('prompt', "A beautiful landscape")

        image_data = image_data.split(",")[1]
        image = Image.open(io.BytesIO(base64.b64decode(image_data))).convert("RGB")

        # AI processing
        generated_image = process_image(image, prompt, inference_steps, guidance_scale)

        buffered = io.BytesIO()
        generated_image.save(buffered, format="PNG")
        encoded_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return jsonify({'generated_image': f"data:image/png;base64,{encoded_image}"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True)
