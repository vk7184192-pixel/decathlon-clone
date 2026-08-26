import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/Order.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id.toString(),
      },
    });

    res.status(200).json({
      message: "Payment intent created",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({
        message: "Payment Intent ID and Order ID are required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      paymentIntent.metadata.orderId !== order._id.toString()
    ) {
      return res.status(400).json({
        message: "Payment does not belong to this order",
      });
    }

    if (paymentIntent.status === "succeeded") {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";

      await order.save();

      return res.status(200).json({
        message: "Payment verified successfully",
        order,
      });
    }

    order.paymentStatus = "failed";
    await order.save();

    res.status(400).json({
      message: "Payment not successful",
      paymentStatus: paymentIntent.status,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  createPaymentIntent,
  verifyPayment,
};