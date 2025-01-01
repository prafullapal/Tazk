import { successResponse } from "../middlewares/successResponse.js";
import User from "../models/user.model.js";
import { generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

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

    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    return successResponse(res, user, "User created successfully", 201);
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username)
      return next({
        status: 400,
        message: "Username is required",
      });
    if (!password)
      return next({
        status: 400,
        message: "Password is required",
      });

    const user = await User.findOne({ username });

    if (!user)
      return next({
        status: 400,
        message: "Username does not exist",
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
      { accessToken: accessToken, ...user },
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

const signout = (req, res, next) => {
  try{
    return res.status(200).clearCookie("refreshToken").json({
      success: true,
      status: 200,
      data: {
        accessToken: null,
      },
      message: "Sign out successful",
    });
  } catch(error){
    next(error);
  }
};

export default {
  signup,
  signin,
  refreshToken,
  signout,
};
