import express from "express";
import jwt from "jsonwebtoken";

import User from "../database/user.js";
const router = express.Router();

router.post("/auth/signup", async(req, res) => {
    const { email, password } = req.body;
    const isUserAlready = await User.findOne({ email, password });
    if(isUserAlready) {
        return res.status(409).json({ message : "This user already exists" });
    }
    const checkUsername = await User.findOne({ email });
    if(checkUsername) {
        return res.status(409).json({ message : "This email taken" });
    }
    const newUser = new User({ email,password });
    await newUser.save();
    const token = jwt.sign({ userId : newUser._id },process.env.SECRET,{ expiresIn : '24h' });
    res.status(200).json({ message : "New user added",Token : token });
});

export default router;