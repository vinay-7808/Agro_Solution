import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/users.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        // console.log(accessToken, refreshToken);
        

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    /*
    get user details from frontend
    validation - not empty
    check if user already exist: username, email
    check for images
    check for avatar
    upload them to cloudinary, avatar
    create user object - create entry in db
    remove password and refresh token field from response
    check for user creation 
    return res
    */


    const { fullName, email, userName, password } = req.body

    /*
    if(fullName === "") throw new ApiError(400, "Fullname is required")
    if(email === "") throw new ApiError(400, "Email is required")
    if(userName === "") throw new ApiError(400, "UserName is required")
    if(password === "") throw new ApiError(400, "Password is required")
                    OR
    */
    if([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if(existedUser) {
        throw new ApiError(409, "User with email or username already exist")
    }

    let profilePhotoLocalPath;

    if(req.files && Array.isArray(req.files.profilePhoto) && req.files.profilePhoto.length > 0) {
        profilePhotoLocalPath = req.files.profilePhoto[0].path;
    }
    
    if(!profilePhotoLocalPath) throw new ApiError(400, "profile photo is required")

    const profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath)

    if(!profilePhoto) throw new ApiError(400, "profile photo is required (Cloudinary)")

    const user = await User.create({
        fullName,
        profilePhoto: profilePhoto.url,
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    
})

const loginUser = asyncHandler( async (req, res) => {

    const { email, password } = req.body
    console.log(req.body);
    
    if(!email) 
        throw new ApiError(400, "Username or email is required")
    
    const user = await User.findOne({
        email
    })

    if(!user) {
        throw new ApiError(404, "User doesn't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,   // Ensure the cookie is inaccessible to JavaScript
        secure: true,     // Only send cookies over HTTPS
        sameSite: 'None', // Required for cross-origin cookie transmission
        maxAge: 24 * 60 * 60 * 1000  // Cookie expiration time
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {user: loggedInUser, accessToken, refreshToken}, "User logged in successfully"))
})

const logoutUser = asyncHandler( async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // This removes the field from the document
            }
        },
        {
            new: true
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)  // Clear the accessToken cookie
        .clearCookie("refreshToken", options) // Clear the refreshToken cookie
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure: true
        }
        const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken", newAccessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new ApiResponse(
                200, 
                {newAccessToken, newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const { oldPassword, newPassword } = req.body
    console.log(oldPassword);
    
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully"))
})

const getCurrentUser = asyncHandler( async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched sucessfully"))
})

const updateAccountDetails = asyncHandler( async (req, res) => {
    const { fullName, email } = req.body
    if(!fullName && !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfuly"))
})

const updateProfilePhoto = asyncHandler( async (req, res) => {
    const profilePhotoLocalPath = req.file?.path
    if(!profilePhotoLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath)

    if(!profilePhoto) {
        throw new ApiError(400, "Error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profilePhoto: profilePhoto.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, {user}, "Profile Photo updated successfully"))
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser ,
    updateAccountDetails,
    updateProfilePhoto
};