import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
// import Coupon from "../models/Coupon.js";

const createOrder = async (req, res) => {
  try {
    const {
      addressId,
      paymentMethod = "COD",
      deliveryOption = "standard",
      couponCode = "",
    } = req.body;

    // 1. Address required
    if (!addressId) {
      return res.status(400).json({
        message: "Address ID is required",
      });
    }

    // 2. Get cart
    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // 3. Get address
    const address = await Address.findOne({
      _id: addressId,
      user: req.user.id,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    const orderItems = [];
    let subtotal = 0;

    // 4. Check products + stock
    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          message: `${product.name} is currently unavailable`,
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `${product.name} has only ${product.stock} items available`,
        });
      }

      const finalPrice =
        product.discountPrice > 0 ? product.discountPrice : product.price;

      const itemTotal = finalPrice * item.quantity;

      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: finalPrice,
        quantity: item.quantity,
      });
    }

    // 5. Delivery charge
    let deliveryCharge = 0;

    if (deliveryOption === "standard") {
      deliveryCharge = subtotal >= 999 ? 0 : 49;
    } else if (deliveryOption === "pickup") {
      deliveryCharge = 0;
    } else {
      return res.status(400).json({
        message: "Invalid delivery option",
      });
    }

    // 6. Coupon
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return res.status(400).json({
          message: "Invalid coupon",
        });
      }

      if (new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({
          message: "Coupon has expired",
        });
      }

      if (subtotal < coupon.minOrderAmount) {
        return res.status(400).json({
          message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
        });
      }

      if (coupon.discountType === "flat") {
        discount = coupon.discountValue;
      }

      if (coupon.discountType === "percentage") {
        discount = (subtotal * coupon.discountValue) / 100;

        if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      }

      discount = Math.min(discount, subtotal);

      appliedCoupon = coupon.code;
    }

    // 7. Final total
    const totalAmount = subtotal - discount + deliveryCharge;

    // 8. Create order
    const order = await Order.create({
      user: req.user.id,

      orderItems,

      shippingAddress: {
        firstName: address.firstName,
        lastName: address.lastName,
        mobile: address.mobile,
        houseBuilding: address.houseBuilding,
        streetLocality: address.streetLocality,
        landmark: address.landmark,
        pincode: address.pincode,
        cityState: address.cityState,
        addressType: address.addressType,
      },

      subtotal,
      discount,
      deliveryCharge,
      totalAmount,

      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",

      couponCode: appliedCoupon,
      deliveryOption,
    });

    // 9. Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    // 10. Clear cart
    cart.items = [];
    await cart.save();

    // 11. Response
    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("orderItems.product", "name images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user.id,
    }).populate("orderItems.product", "name images brand");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      order.orderStatus !== "pending" &&
      order.orderStatus !== "confirmed"
    ) {
      return res.status(400).json({
        message: "This order cannot be cancelled",
      });
    }

    // Restore product stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
        },
      });
    }

    order.orderStatus = "cancelled";

    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

//Admin Order Management\

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("orderItems.product", "name images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
      "return_requested",
      "returned",
      "failed",
    ];

    if (!status) {
      return res.status(400).json({
        message: "Order status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Update Order Status Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};
export { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };

