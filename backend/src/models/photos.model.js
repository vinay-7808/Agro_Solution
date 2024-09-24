import mongoose, { Schema } from "mongoose";

const photoSchema = new Schema({
    photo: {
        type: String
    }
}, {timestamps: true})

export const Photo = mongoose.model("Photo", photoSchema)