import express from "express";
import authMiddleware from "../middleware/auth.js";

import User from "../database/index.js";

const router = express.Router();

router.patch("/api/auth/complete-profile",authMiddleware, async(req, res) => {
    const { username, avatar } = req.body;
    const checkUsername = await User.findOne({ username });
    if(checkUsername) {
        return res.status(409).json({ message : "This username already exists" });
    }
    const findUser = await User.findByIdAndUpdate(
        req.userId,
        { username,avatar,isProfileComplete : true },
        { new : true }
    );
    res.status(200).json(findUser);
});

export default router;