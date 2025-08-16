import express from "express";
import Book from "../models/Book";
import cloudinary from "../lib/cloudinary";
import protectRoute from "../middleware/auth.middleware.js"
const router = express.Router();

router.post("/", protectRoute,async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;
    if (!image || !title || !caption || !rating)
      return res.status(400).json({ message: " PLease Provide all fields " });

    //upload the image o cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
    //   user: req.user._id,
    });

    await newBook.save();

    res.status(201).json(newBook);
    //save to database
  } catch (error) {
    res.status(500).json({message:error.message})
  }
});
//Om he about page ch ani last page ch  animation reload kelay var yetay tar te scroll kelay var direct yayla pahije

export default router;
