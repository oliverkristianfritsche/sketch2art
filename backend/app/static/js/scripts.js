const canvas = document.getElementById('drawingBoard');
const ctx = canvas.getContext('2d');
const brushSizeSlider = document.getElementById('brushSize');
const eraserBtn = document.getElementById('eraserBtn');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const uploadImage = document.getElementById('uploadImage');
const generateBtn = document.getElementById('generateBtn');
const inferenceStepsSlider = document.getElementById('inferenceSteps');
const guidanceScaleSlider = document.getElementById('guidanceScale');
const inferenceStepsValue = document.getElementById('inferenceStepsValue');
const guidanceScaleValue = document.getElementById('guidanceScaleValue');
const promptText = document.getElementById('promptText');
const generatedImage = document.getElementById('generatedImage');

let drawing = false;
let eraserMode = false;
let brushSize = 5;
let brushColor = '#000000';
let history = [];

// Initialize canvas background
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Save and restore state
function saveState() {
    history.push(canvas.toDataURL());
}

function restoreState() {
    if (history.length > 0) {
        const previousState = history.pop();
        const img = new Image();
        img.src = previousState;
        img.onload = () => ctx.drawImage(img, 0, 0);
    }
}

// Initialize iro.js color picker
const colorPicker = new iro.ColorPicker('#colorPickerContainer', { width: 200, color: brushColor });
colorPicker.on('color:change', (color) => { brushColor = color.hexString; });

// Brush size and events
brushSizeSlider.addEventListener('input', () => brushSize = brushSizeSlider.value);

canvas.addEventListener('mousedown', (e) => {
    saveState();
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener('mouseup', () => { drawing = false; ctx.closePath(); });
canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = eraserMode ? 'white' : brushColor;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

// Buttons and actions
eraserBtn.addEventListener('click', () => eraserMode = !eraserMode);
clearBtn.addEventListener('click', () => {
    saveState();
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});
undoBtn.addEventListener('click', restoreState);

uploadImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        saveState();
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});

// Slider updates

// Update slider values on input
inferenceStepsSlider.addEventListener('input', () => {
    inferenceStepsValue.textContent = inferenceStepsSlider.value;
});
guidanceScaleSlider.addEventListener('input', () => {
    guidanceScaleValue.textContent = guidanceScaleSlider.value;
});

// Update slider values on page load
window.addEventListener('load', () => {
    inferenceStepsValue.textContent = inferenceStepsSlider.value;
    guidanceScaleValue.textContent = guidanceScaleSlider.value;
});

// Generate art
generateBtn.addEventListener('click', async () => {
    const imageData = canvas.toDataURL('image/png');
    const inferenceSteps = inferenceStepsSlider.value;
    const guidanceScale = guidanceScaleSlider.value;
    const prompt = promptText.value;

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData, inference_steps: inferenceSteps, guidance_scale: guidanceScale, prompt }),
        });
        const data = await response.json();
        if (data.generated_image) {
            generatedImage.src = data.generated_image;
        }
    } catch (error) {
        console.error('Error generating image:', error);
    }
});
