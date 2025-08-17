import express from "express";
import Book from "../models/Book";
import cloudinary from "../lib/cloudinary";
import protectRoute from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
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
      user: req.user._id,
    });

    await newBook.save();

    res.status(201).json(newBook);
    //save to database
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get all books
//pagination
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");
    const total = await Book.countDocuments();
    res.send({
      books,
      currentPage: page,
      totalBooks: total,
      totalPage: Math.ceil(total / limit),
    });
    //save to database
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    //check if user is creator of the book

    if (book.user.toString() != req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //delete image from cloudinary
    if ((book.image && book.image.includes("cloudinary"))) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log(error.message);
      }
    }
    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/user",protectRoute,async(req,res)=>{
  try {
    const books = await Book.find({user:req.user._id}).sort({createdAt:-1});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });

  }
})


export default router;
