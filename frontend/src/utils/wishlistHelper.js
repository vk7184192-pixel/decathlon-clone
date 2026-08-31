import toast from "react-hot-toast";
import api from "../api/axios";

export const toggleWishlist = async (productId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Please login to add items to wishlist");
    return false;
  }

  try {
    const response = await api.post(
      "/wishlist",
      { productId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    toast.success(response.data?.message || "Added to wishlist ❤️");
    return true;
  } catch (error) {
    if (error.response?.data?.message === "Product already in wishlist") {
      try {
        await api.delete(`/wishlist/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Removed from wishlist");
        return false;
      } catch (delErr) {
        toast.info("Product is already in your wishlist");
        return true;
      }
    }
    toast.error(error.response?.data?.message || "Failed to update wishlist");
    return false;
  }
};
