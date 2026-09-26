const mongoose = require("mongoose");
const User = require("../models/User");
const DriverProfile = require("../models/DriverProfile");
const { hashPassword, comparePassword, signToken } = require("../services/authService");
const { sendSuccess, sendError } = require("../services/apiResponse");

function buildAuthPayload(user, token) {
  return {
    token,
    user: user.toJSON(),
  };
}

async function register(req, res, next) {
  try {
    const {
      fullName,
      name,
      email,
      phone,
      password,
      role,
      vehicleMake,
      vehicleModel,
      vehicleColor,
      plateNumber,
    } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Phone";
      const error = new Error(`${field} already exists`);
      error.status = 409;
      throw error;
    }

    if (role === "driver") {
      const existingPlate = await DriverProfile.findOne({ plateNumber });
      if (existingPlate) {
        const error = new Error("Plate number already exists");
        error.status = 409;
        throw error;
      }
    }

    const createdUser = await User.create({
      fullName: fullName || name,
      email,
      phone,
      password: await hashPassword(password),
      role,
    });

    try {
      if (role === "driver") {
        await DriverProfile.create({
          userId: createdUser._id,
          vehicleMake,
          vehicleModel,
          vehicleColor,
          plateNumber,
        });
      }
    } catch (profileError) {
      await User.deleteOne({ _id: createdUser._id });
      throw profileError;
    }

    const token = signToken(createdUser);
    return sendSuccess(res, "Registration successful", buildAuthPayload(createdUser, token), 201);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) return sendError(res, "Invalid credentials", 401);

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) return sendError(res, "Invalid credentials", 401);

    const token = signToken(user);
    return sendSuccess(res, "Login successful", buildAuthPayload(user, token));
  } catch (error) {
    return next(error);
  }
}

async function getMe(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return sendError(res, "Invalid user identifier", 400);
    }

    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, "User not found", 404);

    return sendSuccess(res, "Current user retrieved", { user: user.toJSON() });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, signup: register, login, getMe };
