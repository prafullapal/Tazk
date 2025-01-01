import { verifyAccessToken } from "../utils/jwt.js";

export const authorize = async (req, res, next) => {
    const authHeader = req.headers["Authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token){
        return next({
            status: 401,
            message: "Access token not found"
        })
    }

    try{
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return next(error)
    }
}