import torch
from diffusers import StableDiffusionInstructPix2PixPipeline, EulerAncestralDiscreteScheduler
from PIL import Image, ImageOps


model_id = "timbrooks/instruct-pix2pix"
pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(model_id, torch_dtype=torch.float16, safety_checker=None)
pipe.to("cuda" if torch.cuda.is_available() else "cpu")
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)

def process_image(input_image, prompt, num_inference_steps=10, image_guidance_scale=1.7):
    

    # Ensure the image is in RGB format
    if input_image.mode != "RGB":
        input_image = input_image.convert("RGB")

    # Resize the input image to the model's expected input size
    input_image = input_image.resize((512, 512))

    # Generate the image
    result = pipe(prompt, image=input_image, num_inference_steps=num_inference_steps, image_guidance_scale=image_guidance_scale)

    # Check if result contains images
    if not result or not result.images:
        raise ValueError("No images returned.")

    return result.images[0]

if __name__ == '__main__':
    input_image = Image.open("input.jpg")
    prompt = "Beautiful nature scene realistic"
    process_image(input_image, prompt)