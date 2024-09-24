import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    likedPhoto: {
        type: Schema.Types.ObjectId,
        ref: "Photo"
    }
}, {timestamps: true})

export const Like = mongoose.model("Like", likeSchema)