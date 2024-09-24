import { Router } from "express";
import { getPrediction } from "../controllers/prediction.controller.js";
import { verifyJWT } from "../middlewares/Auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/').post(verifyJWT, upload.single('image'), getPrediction)

export default router;