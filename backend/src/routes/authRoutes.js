import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
const router = express.Router();

const generateToken = (userId) => {
 return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
};

router.post("/register", async (req, res) => {
  try {
    console.log(req.body)
    const { email, username, password } = await req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All Fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Passowrd should be at least 6 characters long" });
    }
    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username should be at least 3 characters long" });
    }
    //check if user already exists

    const existingUser = await User.findOne({
      email,
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists " });
    }
    const existingUsername = await User.findOne({
      username,
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists " });
    }

    const user = new User({
      email,
      password,
      username,
      profileImage: "https://api.dicebear.com/9.x/adventurer/svg?seed=Emery",
    });

    const userData = await user.save();
    const token =  generateToken(userData._id);

    res.status(201).json({
      token:token,
      user: {
        _id: userData._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
router.post("/login", async (req, res) => {
try {
  
  const {email,password} = req.body;
  
  if(!email || !password){
    return res.status(400).json({message:"Provide Crediendials"})
  }
  const user = await User.findOne({email});
  if(!user) return res.status(404).json({message:"User not found"});
  
  const isPasswordCorrect = await user.comparePassword(password);
  if(!isPasswordCorrect) return res.status(400).json({message:"Invalid Credentials"});
  
  const token = generateToken(user._id);
  res.status(200).json({
    token:token,
    user: {
      _id: userData._id,
      email: user.email,
      username: user.username,
      profileImage: user.profileImage,
    },
  })
  
} catch (error) {
  console.log(error);
  res.status(500).json("Internal Server Error");

}
});

export default router;
