import mongoose from "mongoose";

const homepageSectionSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      type: {
        type: String,
        enum: [
          "category",
          "product",
          "banner",
        ],
        required: true,
      },

      categories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],

      products: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      ],

      banners: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Banner",
        },
      ],

      sortOrder: {
        type: Number,
        default: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

const HomepageSection =
  mongoose.model(
    "HomepageSection",
    homepageSectionSchema
  );

export default HomepageSection;