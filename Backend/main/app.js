import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import signUpRoute from "../routes/signup.js";
import signInRoute from "../routes/signin.js";
import completeProfileRoute from "../routes/complete-profile.js";

const port = 3000;

dotenv.config({
    path : "../../.env"
});


const app = express();

app.use(express.json());
app.use("/",signUpRoute);
app.use("/",signInRoute);
app.use("/",completeProfileRoute);

mongoose.connect(process.env.MONGODB_URL,{ dbName : "Chat-application" });

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});