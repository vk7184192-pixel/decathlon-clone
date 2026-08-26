import Product from "../models/Product.js";

import {
  emitHomepageUpdate,
} from "../socket/socketManager.js";

/*
========================================
CREATE PRODUCT
========================================
*/

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      stock,
      brand,
      size,
      color,
    } = req.body;

    if (
      !name ||
      !description ||
      !price ||
      !category
    ) {
      return res.status(400).json({
        message:
          "Name, description, price and category are required",
      });
    }

    const images = req.files
      ? req.files.map(
          (file) =>
            `/uploads/${file.filename}`
        )
      : [];

    const product =
      await Product.create({
        name,
        description,
        price,
        discountPrice,
        category,
        images,
        stock,
        brand,
        size,
        color,
      });

    /*
    ========================================
    REALTIME UPDATE
    ========================================
    */

    emitHomepageUpdate(
      "product_created",
      {
        productId:
          product._id,
        categoryId:
          product.category,
      }
    );

    res.status(201).json({
      message:
        "Product created successfully",

      product,
    });
  } catch (error) {
    console.error(
      "Create Product Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


/*
========================================
GET PRODUCTS
========================================
*/

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      size,
      color,
      sort,
      page = 1,
      limit = 12,
      admin,
    } = req.query;

    const filter = {};

    /*
    CUSTOMER ONLY ACTIVE PRODUCTS
    ADMIN CAN SEE ALL PRODUCTS
    */

    if (admin !== "true") {
      filter.isActive = true;
    }

    /*
    SEARCH
    */

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    /*
    CATEGORY
    */

    if (category) {
      filter.category = category;
    }

    /*
    BRAND
    */

    if (brand) {
      filter.brand = {
        $regex: brand,
        $options: "i",
      };
    }

    /*
    SIZE
    */

    if (size) {
      filter.size = size;
    }

    /*
    COLOR
    */

    if (color) {
      filter.color = color;
    }

    /*
    PRICE
    */

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte =
          Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte =
          Number(maxPrice);
      }
    }

    /*
    PAGINATION
    */

    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );

    const limitNumber =
      Math.max(
        Number(limit) || 12,
        1
      );

    const skip =
      (pageNumber - 1) *
      limitNumber;

    /*
    SORT
    */

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "price_low") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price_high") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    if (sort === "name_asc") {
      sortOption = {
        name: 1,
      };
    }

    if (sort === "name_desc") {
      sortOption = {
        name: -1,
      };
    }

    /*
    TOTAL PRODUCTS
    */

    const totalProducts =
      await Product.countDocuments(
        filter
      );

    /*
    PRODUCTS
    */

    const products =
      await Product.find(filter)
        .populate(
          "category",
          "name image"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber);

    /*
    TOTAL PAGES
    */

    const totalPages =
      Math.ceil(
        totalProducts /
          limitNumber
      );

    res.status(200).json({
      totalProducts,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
      products,
    });
  } catch (error) {
    console.error(
      "Get Products Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


/*
========================================
GET PRODUCT BY ID
========================================
*/

const getProductById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const product =
      await Product.findById(id)
        .populate(
          "category",
          "name image"
        );

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    res.status(200).json({
      product,
    });
  } catch (error) {
    console.error(
      "Get Product Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


/*
========================================
UPDATE PRODUCT
========================================
*/

const updateProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    const {
      name,
      description,
      price,
      discountPrice,
      category,
      stock,
      brand,
      size,
      color,
      isActive,
      existingImages,
    } = req.body;

    /*
    KEEP OLD CATEGORY
    FOR REALTIME EVENT
    */

    const oldCategory =
      product.category;

    /*
    UPDATE BASIC FIELDS
    */

    if (name !== undefined) {
      product.name = name;
    }

    if (
      description !== undefined
    ) {
      product.description =
        description;
    }

    if (price !== undefined) {
      product.price = price;
    }

    if (
      discountPrice !== undefined
    ) {
      product.discountPrice =
        discountPrice;
    }

    if (category !== undefined) {
      product.category = category;
    }

    if (stock !== undefined) {
      product.stock = stock;
    }

    if (brand !== undefined) {
      product.brand = brand;
    }

    if (size !== undefined) {
      product.size = size;
    }

    if (color !== undefined) {
      product.color = color;
    }

    if (isActive !== undefined) {
      product.isActive =
        isActive === true ||
        isActive === "true";
    }

    /*
    EXISTING IMAGES
    */

    let remainingImages =
      product.images || [];

    if (
      existingImages !==
      undefined
    ) {
      try {
        remainingImages =
          JSON.parse(
            existingImages
          );

        if (
          !Array.isArray(
            remainingImages
          )
        ) {
          remainingImages = [];
        }
      } catch (error) {
        return res.status(400).json({
          message:
            "Invalid existingImages data",
        });
      }
    }

    /*
    NEW IMAGES
    */

    if (
      req.files &&
      req.files.length > 0
    ) {
      const newImages =
        req.files.map(
          (file) =>
            `/uploads/${file.filename}`
        );

      remainingImages = [
        ...remainingImages,
        ...newImages,
      ];
    }

    product.images =
      remainingImages;

    await product.save();

    /*
    ========================================
    REALTIME UPDATE
    ========================================
    */

    emitHomepageUpdate(
      "product_updated",
      {
        productId:
          product._id,

        categoryId:
          product.category,

        oldCategoryId:
          oldCategory,

        isActive:
          product.isActive,
      }
    );

    res.status(200).json({
      message:
        "Product updated successfully",

      product,
    });
  } catch (error) {
    console.error(
      "Update Product Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


/*
========================================
DELETE PRODUCT
========================================
*/

const deleteProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message:
          "Product not found",
      });
    }

    const categoryId =
      product.category;

    await Product.findByIdAndDelete(
      id
    );

    /*
    ========================================
    REALTIME UPDATE
    ========================================
    */

    emitHomepageUpdate(
      "product_deleted",
      {
        productId: id,
        categoryId,
      }
    );

    res.status(200).json({
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Product Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};