import face_recognition
import logging
from mock_data import KNOWN_FACE_ENCODINGS, KNOWN_FACE_METADATA

logging.basicConfig(level=logging.INFO)

def find_match(unknown_image_path: str):
    """
    Finds a matching face by comparing against the pre-loaded mock dataset.
    Returns a dictionary with match details or a string if no match.
    """
    try:
        unknown_image = face_recognition.load_image_file(unknown_image_path)
        unknown_encodings = face_recognition.face_encodings(unknown_image)

        if not unknown_encodings:
            logging.info(f"No face found in image.")
            return {"message": "No face found in the provided image."}

        unknown_encoding = unknown_encodings[0]

        # Compare the unknown face with all known faces
        matches = face_recognition.compare_faces(KNOWN_FACE_ENCODINGS, unknown_encoding, tolerance=0.6)
        
        # Find the index of the first match
        if True in matches:
            first_match_index = matches.index(True)
            match_data = KNOWN_FACE_METADATA[first_match_index]
            logging.info(f"Match found: {match_data['name']}")
            return {"match": True, "data": match_data}
        
        logging.info("No match found in the database.")
        return {"match": False, "message": "No match found in our records."}

    except Exception as e:
        logging.error(f"An error occurred during face matching: {e}")
        return {"match": False, "message": "An error occurred during analysis."}