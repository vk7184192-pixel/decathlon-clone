# Decathlon Clone

A full-stack e-commerce application inspired by Decathlon, built with React, Node.js, Express, MongoDB, Stripe, Cloudinary, and Socket.IO.

## Project Overview

The Decathlon Clone provides a complete online shopping experience with separate customer and admin functionality.

Customers can browse products, manage their cart and wishlist, save addresses, choose delivery options, and place orders using Stripe or Cash on Delivery.

Admins can manage products, categories, banners, homepage sections, and orders through the admin panel.

## Features

### Customer

- User Registration
- OTP-based Registration
- OTP-based Login
- Product Listing
- Product Details
- Product Search
- Category Filtering
- Price Filtering
- Product Size Selection
- Wishlist
- Add to Cart
- Update Cart Quantity
- Remove Cart Items
- Address Management
- Delivery Option Selection
- Stripe Payment
- Cash on Delivery
- Order Placement
- Order History
- Real-time Updates

### Admin

- Admin Login
- Admin Authentication
- Product Management
- Add Product
- Edit Product
- Delete Product
- Multiple Product Images
- Category Management
- Banner Management
- Homepage Section Management
- Order Management
- Product Stock Management
- Product Status Management
- Image Upload
- Cloudinary Image Storage

## Technology Stack

### Frontend

- React.js
- React Router
- Axios
- React Icons
- React Hot Toast

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Socket.IO

### Services

- MongoDB Atlas
- Cloudinary
- Stripe
- Vercel

## Project Structure

```text
decathlonClone/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── admin/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   │
│   ├── controllers/
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── utils/
│   │   └── uploadToCloudinary.js
│   │
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── README.md
```
