import fs from 'fs';
import FormData from 'form-data'; // Ensure this is imported
import fetch from 'node-fetch';  // Ensure you're using node-fetch for fetch in Node.js
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from "../utils/asyncHandler.js";

const getPrediction = asyncHandler(async (req, res) => {
    
    // Check if the file exists
    const imageFilePath = req.file?.path;
    if (!imageFilePath) {
        throw new ApiError(400, 'No image file provided');
    }

    try {
        // Read the image file as a stream and append it to FormData
        const formData = new FormData();
        formData.append('file', fs.createReadStream(imageFilePath), {
            filename: 'image.jpg',  // Adjust the filename if needed
            contentType: 'image/jpeg'  // Ensure this is the correct MIME type
        });

        // Send the request to the prediction model
        const response = await fetch(process.env.MODEL_LINK, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders() // This is important for FormData in Node.js
        });

        if (!response.ok) {
            throw new ApiError(response.status, 'Network response was not ok');
        }

        const data = await response.json(); // Parse the prediction response
        fs.unlinkSync(imageFilePath);  // Delete the file after use

        return res
            .status(200)
            .json(new ApiResponse(200, { data }, "Prediction done successfully"));

    } catch (error) {
        console.error('Error:', error);
        
        // Delete the file if an error occurs
        if (fs.existsSync(imageFilePath)) {
            fs.unlinkSync(imageFilePath);
        }
        
        return res.status(500).json(new ApiError(500, 'Error while predicting'));  // Return error response
    }
});

export { getPrediction };