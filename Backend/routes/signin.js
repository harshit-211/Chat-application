import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();
import User from "../database/index.js";

router.get("/api/auth/login", async(req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if(!findUser || !await bcrypt.compare(password,findUser.password)) {
        return res.status(404).json({ message : "User doesn't exist" });
    }
    const token = jwt.sign({ userId : findUser._id },process.env.SECRET,{ expiresIn : "24h" });
    res.status(200).json({ Token : token,isProfileComplete : findUser.isProfileComplete });
});

export default router;