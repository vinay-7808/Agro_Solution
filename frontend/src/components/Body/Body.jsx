import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Body = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // State to store image preview URL
    const [predictionResult, setPredictionResult] = useState(null); // State to store prediction result
    const [isLoading, setIsLoading] = useState(false); // Loading state for better UX
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file)); // Create and store image preview URL
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!imageFile) {
            alert('Please select an image file.');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', imageFile);  // Match this with your backend's expected key ('file' in this case)
        setIsLoading(true);  // Start loading when the request is made
    
        try {
            const response = await fetch('https://algo-solution.onrender.com/api/v1/predict', {
                method: 'POST',
                body: formData,
                credentials: 'include',  // Include cookies for authentication
                // No need to set 'Content-Type' here, FormData will handle it
            });
    
            setIsLoading(false);  // Stop loading after the response
    
            const text = await response.text();  // Log the raw response text
    
            if (!response.ok) {
                // Redirect to login page if unauthorized
                navigate('/login');
                return;
            }
    
            const data = JSON.parse(text);  // Parse response as JSON
    
            const { disease, confidence } = data;  // Assuming the response contains { disease, confidence }
    
            setPredictionResult({ disease, confidence });  // Store class and confidence
        } catch (error) {
            setIsLoading(false);  // Stop loading if there's an error
            console.error('Error uploading file:', error);
            alert('Error uploading file: ' + error.message);
        }
    };

    // Function to reset the prediction and allow for a new image upload
    const handleNewPrediction = () => {
        setPredictionResult(null); // Clear the prediction result
        setImageFile(null); // Reset the image file
        setImagePreview(null); // Clear the image preview
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 flex flex-col items-center justify-center p-4">
            {!predictionResult ? (
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
                    <h2 className="text-3xl font-bold mb-6 text-center text-purple-700">Upload Image for Prediction</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2 font-semibold">Choose an Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        
                        {/* Show image preview when image is selected */}
                        {imagePreview && (
                            <div className="mb-6">
                                <img
                                    src={imagePreview}
                                    alt="Selected file"
                                    className="w-full h-auto rounded-lg shadow-md"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold"
                        >
                            {isLoading ? 'Predicting...' : 'Predict'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="mt-6 bg-white p-8 rounded-lg shadow-lg w-full max-w-lg text-center">
                    {/* Show the uploaded image above the prediction result */}
                    {imagePreview && (
                        <div className="mb-6">
                            <img
                                src={imagePreview}
                                alt="Uploaded file"
                                className="w-full h-auto rounded-lg shadow-md"
                            />
                        </div>
                    )}

                    <h3 className="text-2xl font-bold text-purple-700 mb-4">Prediction Result</h3>
                    <div className="text-left">
                        <p className="text-gray-700 mb-2"><span className="font-semibold">Disease:</span> {predictionResult.disease}</p>
                        <p className="text-gray-700 mb-4"><span className="font-semibold">Confidence:</span> {(predictionResult.confidence * 100).toFixed(2)}%</p>
                    </div>

                    <button
                        onClick={handleNewPrediction}
                        className="mt-4 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
                    >
                        Predict New Image
                    </button>
                </div>
            )}
        </div>
    );
};

export default Body;