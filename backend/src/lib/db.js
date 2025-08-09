import mongoose from "mongoose";

export const connectDB = async () => {
  try {

    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected...");
  } catch (error) {
    console.log(error.message);
    process.exit(1); //exit with failure 
  }
};
