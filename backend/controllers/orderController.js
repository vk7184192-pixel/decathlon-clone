import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";

const createOrder = async (req, res) => {
  try {
    const {
      addressId,
      paymentMethod = "COD",
      deliveryOption = "standard",
    } = req.body;

    if (!addressId) {
      return res.status(400).json({
        message: "Address ID is required",
      });
    }

    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

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
        size: item.size || "",
        color: item.color || "",
      });
    }

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

    const discount = 0;

    const totalAmount = subtotal - discount + deliveryCharge;

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
      stripePaymentIntentId: "",
      couponCode: "",
      deliveryOption,
    });

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: {
          stock: -item.quantity,
        },
      });
    }

    cart.items = [];
    await cart.save();

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

const confirmCODOrder = async (req, res) => {
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

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order is already paid",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message: "Order is cancelled",
      });
    }

    order.paymentMethod = "COD";
    order.paymentStatus = "pending";
    order.orderStatus = "confirmed";

    await order.save();

    return res.status(200).json({
      message: "COD order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Confirm COD Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

const confirmOnlineOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = "ONLINE" } = req.body;

    const order = await Order.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.paymentMethod = paymentMethod.toUpperCase();
    order.paymentStatus = paymentMethod.toUpperCase() === "COD" ? "pending" : "paid";
    order.orderStatus = "confirmed";

    await order.save();

    return res.status(200).json({
      message: "Order payment confirmed successfully",
      order,
    });
  } catch (error) {
    console.error("Confirm Online Order Error:", error);

    return res.status(500).json({
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
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
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

    return res.status(200).json({
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
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

    if (order.orderStatus !== "pending" && order.orderStatus !== "confirmed") {
      return res.status(400).json({
        message: "This order cannot be cancelled",
      });
    }

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
        },
      });
    }

    order.orderStatus = "cancelled";

    await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("orderItems.product", "name images")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get All Orders Error:", error);

    return res.status(500).json({
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

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    if (!paymentStatus) {
      return res.status(400).json({
        message: "Payment status is required",
      });
    }

    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.paymentStatus = paymentStatus;

    await order.save();

    return res.status(200).json({
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createOrder,
  confirmCODOrder,
  confirmOnlineOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
};
