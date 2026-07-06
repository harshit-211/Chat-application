import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import User from "../database/index.js";
const router = express.Router();

router.post("/api/auth/signup", async(req, res) => {
    const { email,password } = req.body;
    const checkEmail = await User.findOne({ email });
    if(checkEmail) {
        return res.status(409).json({ message : "This email is not available" });
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = new User({ email,password : hashedPassword });
    await newUser.save();
    const token = jwt.sign({ userId : newUser._id },process.env.SECRET,{ expiresIn : "24h" });
    res.status(200).json({ Token : token,isProfileComplete : newUser.isProfileComplete });
});

export default router;