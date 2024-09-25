import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.refreshToken
        if(!token) {
            throw new ApiError(401, "Unauthorized Request")
        }
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user
        console.log(user.fullName);
        
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})