import face_recognition
import os
import numpy as np

# This script converts images into face encodings that you can copy into your mock_data.py file.
def generate_encodings_from_folder(folder_path='temp_images'):
    print("# Copy the following dictionary entries into your KNOWN_FACES in mock_data.py\n")
    for filename in os.listdir(folder_path):
        if filename.lower().endswith((".jpg", ".jpeg", ".png")):
            image_path = os.path.join(folder_path, filename)
            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)

            if encodings:
                # Convert the encoding (a numpy array) to a list for easy copy-pasting
                encoding_list = encodings[0].tolist()
                person_name = os.path.splitext(filename)[0].replace("_", " ").title()
                
                print(f'    "{person_name}": {{')
                print(f'        "status": "Missing since 2024-10-01",')
                print(f'        "last_seen_location": "Central City Park",')
                print(f'        "encoding": {encoding_list}')
                print(f'    }},')
            else:
                print(f"# Could not find a face in {filename}")

if __name__ == "__main__":
    generate_encodings_from_folder()