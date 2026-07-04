import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();
import User from "../database/user.js";

router.get("/auth/signin",async(req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email,password });
    if(!findUser) {
        return res.status(404).json({ message : "User not found" });
    }
    const token = jwt.sign({ userId : findUser._id },process.env.SECRET,{ expiresIn : "1h" });
    res.status(200).json({ message : "User found", Token : token });
});

export default router;