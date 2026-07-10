import express from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import signUpRoute from "../routes/signup.js";
import signInRoute from "../routes/signin.js";
import completeProfileRoute from "../routes/complete-profile.js";
import { setupWebSocketServer } from "../routes/wsServer.js";

const port = 3000;

dotenv.config({
    path : "../../.env"
});


const app = express();
const server = new http.createServer(app);

app.use(express.json());
app.use("/",signUpRoute);
app.use("/",signInRoute);
app.use("/",completeProfileRoute);

setupWebSocketServer(server);

mongoose.connect(process.env.MONGODB_URL,{ dbName : "Chat-application" });

server.listen(port, () => {
    console.log(`server is running on port ${port}`);
});