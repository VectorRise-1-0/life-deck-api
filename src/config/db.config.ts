import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) throw new Error("MONGO_URI isn't defined");

  try {
    await mongoose.connect(mongoURI);
    console.log("Database connected");
  } catch (error) {
    console.error("Connection failed", error);
    process.exit(1);
  }
};
