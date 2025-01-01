import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, username: user.username },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m", algorithm: "HS256" }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, username: user.username },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d", algorithm: "HS256" }
  );
};

export const verifyAccessToken = (token) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
