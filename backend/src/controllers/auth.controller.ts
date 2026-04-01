import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import pool from "../db/pool";

const SALT_ROUNDS = 12; // bcrypt cost factor — high enough to be secure, not too slow

/**
 * POST /api/auth/register
 * Creates a new user account with a hashed password.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  // 1. Validate inputs (rules defined in routes)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { name, email, password } = req.body;

  try {
    // 2. Check for duplicate email
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (existing.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    // 3. Hash the password — NEVER store plain text
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Insert user
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase(), hashedPassword],
    );

    const user = rows[0];

    // 5. Issue JWT immediately so the user is logged in after registration
    const secret: string = process.env.JWT_SECRET || "default-secret-key";
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as any,
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

/**
 * POST /api/auth/login
 * Verifies credentials and returns a JWT.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const { rows } = await pool.query(
      "SELECT id, name, email, password, role FROM users WHERE email = $1",
      [email.toLowerCase()],
    );

    // 2. Use a generic error message to avoid leaking whether an email exists (security best practice)
    if (rows.length === 0) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
      return;
    }

    const user = rows[0];

    // 3. Compare submitted password against stored hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
      return;
    }

    // 4. Sign and return JWT
    const secret: string = process.env.JWT_SECRET || "default-secret-key";
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as any,
    );

    res.json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [req.user!.id],
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
