import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const uploadToCloudinary = (buffer, folder = "decathlon") => {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error("Image buffer is missing"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }

        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const getSingleImageUrl = async (file, folder = "decathlon") => {
  if (!file) return "";

  if (file.buffer) {
    const result = await uploadToCloudinary(file.buffer, folder);

    return result.secure_url;
  }

  if (file.filename) {
    return `/uploads/${file.filename}`;
  }

  return "";
};

export const getMultipleImageUrls = async (files, folder = "decathlon") => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }

  return await Promise.all(
    files.map((file) => getSingleImageUrl(file, folder)),
  );
};

export default uploadToCloudinary;
