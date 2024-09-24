import fs from 'fs';
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

const getPrediction = asyncHandler(async (req, res) => {
    
    // Check if the file exists
    const imageFilePath = req.file?.path;
    if (!imageFilePath) {
        throw new ApiError(400, 'No image file provided');
    }

    // Read the image file from the file system
    const imageFile = fs.readFileSync(imageFilePath);

    // Create a FormData object and append the image file as a Blob
    const formData = new FormData();
    formData.append('file', new Blob([imageFile], { type: 'image/jpeg' }), 'image.jpg'); // Adjust the MIME type as necessary

    try {
        const response = await fetch('http://localhost:3000/', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new ApiError(response.status, 'Network response was not ok');
        }

        const data = await response.json(); // This will contain your JSON response
        fs.unlinkSync(imageFilePath);
        return res
        .status(200)
        .json(new ApiResponse(200, {data}, "Prediction done successfully"))
    } catch (error) {
        console.error('Error:', error);
        fs.unlinkSync(imageFilePath);
        return res.status(500).json(new ApiError(500, 'Error while predicting')); // Return error response
    }
});

export { getPrediction };