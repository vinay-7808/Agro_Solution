import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: 'https://algo-solution-frontend.onrender.com', // Frontend URL
    credentials: true,  // Allow cookies and other credentials to be sent
    methods: ['*'],  // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
}));

app.use(express.json({limit: "16kb"})); // middleware for accepting json of 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"})) // middleware for parsing the url
app.use(express.static("public")) //middleware for keeping files in public folder
app.use(cookieParser()) // middleware to perform crud operation on cookie of browser

//Routes import
import userRouter from './routes/user.route.js'

//routes declaration
app.use("/api/v1/users", userRouter)


import predictionRoute from './routes/prediction.route.js'

app.use('/api/v1/predict', predictionRoute)

export { app }