import { successResponse } from "../middlewares/successResponse.js";
import User from "../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username)
      return next({
        status: 400,
        message: "Username is required",
      });
    if (!email)
      return next({
        status: 400,
        message: "Email is required",
      });
    if (!password)
      return next({
        status: 400,
        message: "Password is required",
      });

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return next({
        status: 409,
        message: "Email already exists",
      });

    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    return successResponse(
      res,
      {
        username: user.username,
        email: user.email,
        _id: user._id,
      },
      "User created successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email)
      return next({
        status: 400,
        message: "Email is required",
      });
    if (!password)
      return next({
        status: 400,
        message: "Password is required",
      });

    const user = await User.findOne({ email });

    if (!user)
      return next({
        status: 400,
        message: "Email does not exist",
      });

    if (!user.comparePassword(password))
      return next({
        status: 400,
        message: "Invalid password",
      });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(
      res,
      {
        accessToken: accessToken,
        username: user.username,
        email: user.email,
        _id: user._id,
      },
      "Sign in successful",
      200
    );
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) return next({ status: 401, message: "Unauthorized" });

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId);
    if (!user) return next({ status: 401, message: "Unauthorized" });

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(
      res,
      { accessToken: accessToken, ...user },
      "Token refreshed successfully",
      200
    );
  } catch (error) {
    next(error);
  }
};

const signout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if(!user) return next({ status: 401, message: "Unauthorized" });

    user.refreshToken = null;
    await user.save();

    return res
      .status(200)
      .clearCookie("refreshToken")
      .json({
        success: true,
        status: 200,
        data: {
          accessToken: null,
        },
        message: "Sign out successful",
      });
  } catch (error) {
    next(error);
  }
};

export default {
  signup,
  signin,
  refreshToken,
  signout,
};
