import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    brand: {
      type: String,
      default: "Decathlon",
      trim: true,
    },

    size: [
      {
        type: String,
        trim: true,
      },
    ],

    color: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
