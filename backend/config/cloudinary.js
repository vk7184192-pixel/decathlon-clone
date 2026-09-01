import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "k08sqqki",
  api_key: process.env.CLOUDINARY_API_KEY || "847339812224877",
  api_secret: process.env.CLOUDINARY_API_SECRET || "ZpB9ghG7fAhahHTONpAFnlb1vFQ",
});

export default cloudinary;