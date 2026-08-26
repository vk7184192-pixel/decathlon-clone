import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({
        message: "Name, password and email or phone are required",
      });
    }

    const normalizedEmail = email?.trim().toLowerCase();

    const normalizedPhone = phone?.trim();

    const query = normalizedEmail
      ? { email: normalizedEmail }
      : { phone: normalizedPhone };

    const existingUser = await User.findOne(query);

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),

      email: normalizedEmail || undefined,

      phone: normalizedPhone || undefined,

      password: hashedPassword,

      role: "user",
    });

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register User Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({
        message: "Email or phone and password are required",
      });
    }

    const normalizedEmail = email?.trim().toLowerCase();

    const normalizedPhone = phone?.trim();

    const query = normalizedEmail
      ? { email: normalizedEmail }
      : { phone: normalizedPhone };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email/phone or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email/phone or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login User Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "user",
    })
      .select("-password")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("Get All Users Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export { registerUser, loginUser, getAllUsers };
