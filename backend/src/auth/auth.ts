import { CookieOptions, Request, Response, Router } from "express";
import passport from "passport";
import { v4 as uuidv4 } from "uuid";
import prisma from "../db";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { verifyToken } from "./verifyToken";
import bcrypt from "bcrypt";

dotenv.config();

const router = Router();
const secret = process.env.JWT_SECRET;
const CLIENT_URL = "http://localhost:5173/home";    

interface UserDetails {
  id: string;
  username: string;
  name: string;
  profile: string;
  email: string;
  rating: number;
  token?: string;
  isGuest: boolean;
}

interface userjwtClaims {
  userId: string;
  username: string;
  name: string;
  profile: string;
  email: string;
  rating: number;
  token?: string;
  isGuest?: boolean;
}

// ✅ Cookie config helper
function getCookieOptions():CookieOptions {
  return {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };
}

// checkAuth
router.get("/checkAuth", verifyToken, async (req: Request, res: Response) => {
  try {
    if (!secret) throw new Error("JWT_SECRET not defined");

    const userId = req.userId as string;
    const userDb = await prisma.user.findFirst({ where: { id: userId } });

    if (!userDb) {
     res.status(400).json({ success: true, message: "User not found" });
    return
  }

    const token = jwt.sign(
      { userId, name: userDb.name, rating: userDb.rating, profile: userDb.profile },
      secret
    );

    const UserDetails: UserDetails = {
      id: userDb.id,
      username: userDb.username!,
      profile: userDb.profile!,
      name: userDb.name!,
      email: userDb.email!,
      rating: userDb.rating,
      token,
      isGuest: false,
    };

    res.status(200).json({ UserDetails, isAuthanticated: true });
  } catch (error) {
    console.log("Error in checkAuth", error);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

// login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!secret) throw new Error("JWT_SECRET not defined");

  if (!email || !password) {
   res.status(400).json({ success: false, message: "Email and password required." });
  return
}

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
     res.status(401).json({ success: false, message: "User not found." });
    return
  }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
     res.status(401).json({ success: false, message: "Incorrect password." });
    return
  }

    const token = jwt.sign(
      { userId: user.id, name: user.name, rating: user.rating, profile: user.profile },
      secret,
      { expiresIn: "1d" }
    );

    const userDetails: UserDetails = {
      id: user.id,
      username: user.username!,
      name: user.name!,
      email: user.email!,
      profile: user.profile!,
      rating: user.rating,
      token,
      isGuest: false,
    };

    res.cookie("token", token, getCookieOptions()); // ✅ updated
    res.json(userDetails);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Google OAuth - login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth - callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login/failed" }),
  (req, res) => {
    const user = req.user as UserDetails;
    console.log("user in backend: ", user);

    if (!secret) throw new Error("JWT_SECRET not defined");

    const token = jwt.sign(
      { userId: user.id, name: user.name, rating: user.rating, profile: user.profile },
      secret,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, getCookieOptions()); // ✅ updated
    res.redirect(CLIENT_URL);
  }
);

// Email signup
router.post("/signUp", async (req: Request, res: Response) => {
  try {
    const bodyData = req.body;
    if (!secret) throw new Error("JWT_SECRET not defined");

    if (!bodyData.email || !bodyData.password || !bodyData.username) {
     res.status(400).json({ message: "Email, username, and password are required." });
    return
  }

    const existingUser = await prisma.user.findUnique({ where: { email: bodyData.email } });
    if (existingUser) {
     res.status(409).json({ message: "User with this email already exists." });
    return
  }

    const hashedPassword = await bcrypt.hash(bodyData.password, 10);
    let guestUUID = "guest-" + uuidv4();

    const user = await prisma.user.create({
      data: {
        username: bodyData.username,
        email: bodyData.email,
        profile: bodyData.profile,
        name: bodyData.username || guestUUID,
        rating: 500,
        password: hashedPassword,
        provider: "EMAIL",
      },
    });

    const token = jwt.sign(
      { userId: user.id, name: user.name, rating: user.rating, profile: user.profile },
      secret,
      { expiresIn: "1d" }
    );

    const UserDetails: UserDetails = {
      id: user.id,
      username: user.username!,
      name: user.name!,
      profile: user.profile!,
      email: user.email!,
      rating: user.rating,
      token,
      isGuest: false,
    };

    res.cookie("token", token, getCookieOptions()); // ✅ updated
    res.json(UserDetails);
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Something went wrong during sign up." });
  }
});

// Guest sign up
router.post("/signUpGuest", async (req: Request, res: Response) => {
  const bodyData = req.body;
  let guestUUID = "guest-" + uuidv4();

  const user = await prisma.user.create({
    data: {
      username: guestUUID,
      email: guestUUID + "@chess100x.com",
      rating: 500,
      name: bodyData.name || guestUUID,
      provider: "GUEST",
    },
  });

  if (!secret) throw new Error("JWT_SECRET not defined");

  const token = jwt.sign(
    { userId: user.id, name: user.name, rating: user.rating, profile: user.profile },
    secret
  );

  const UserDetails: UserDetails = {
    id: user.id,
    username: user.username!,
    name: user.name!,
    profile: user.profile!,
    email: user.email!,
    rating: user.rating,
    token,
    isGuest: false,
  };

  res.cookie("token", token, getCookieOptions()); // ✅ updated
  res.json(UserDetails);
});

// Google login failure route
router.get("/login/failed", (req: Request, res: Response) => {
  res.status(401).json({ success: false, message: "failure" }).redirect("/");
});

// logout
router.post("/logout", (req:Request, res:Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
});


export default router;
