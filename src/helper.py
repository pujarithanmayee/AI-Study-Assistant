import os
import fitz  # PyMuPDF

def extract_images_from_pdf(file_path, output_folder):
    doc = fitz.open(file_path)
    image_paths = []
    for page_number in range(len(doc)):
        images = doc[page_number].get_images(full=True)
        for img_index, img in enumerate(images):
            base_image = doc.extract_image(img[0])
            image_bytes = base_image["image"]
            ext = base_image["ext"]
            width, height = base_image["width"], base_image["height"]
            if width < 100 or height < 100:
                continue
            filename = f"page_{page_number}_{img_index}.{ext}"
            filepath = os.path.join(output_folder, filename)
            with open(filepath, "wb") as f:
                f.write(image_bytes)
            image_paths.append(filepath)
    return image_paths
