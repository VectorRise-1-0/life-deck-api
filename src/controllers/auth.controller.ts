import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import { signAccessToken } from "../utils/token.util";

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    const accessToken = signAccessToken(user);

    res.status(201).json({
      message: "User registered",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = signAccessToken(user);

    res.json({
      message: "Logged in",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
