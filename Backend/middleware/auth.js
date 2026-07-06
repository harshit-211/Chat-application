
import jwt from "jsonwebtoken";

const authMiddleware = (req,res,next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token,process.env.SECRET);
    req.userId = decoded.userId;
    next();
};

export default authMiddleware;