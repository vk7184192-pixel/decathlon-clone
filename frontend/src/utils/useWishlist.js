import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { toggleWishlist } from "./wishlistHelper";

export const useWishlist = () => {
  const [wishlistIds, setWishlistIds] = useState([]);

  const fetchWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWishlistIds([]);
      return;
    }
    try {
      const response = await api.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const products = response.data?.wishlist?.products || [];
      const ids = products.map((p) => (typeof p === "string" ? p : p._id));
      setWishlistIds(ids);
    } catch (e) {
      console.error("useWishlist fetch error", e);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();

    const handleWishlistUpdated = () => {
      fetchWishlist();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    };
  }, [fetchWishlist]);

  const handleToggle = async (productId) => {
    await toggleWishlist(productId);
    window.dispatchEvent(new Event("wishlistUpdated"));
    fetchWishlist();
  };

  const isWishlisted = (productId) => {
    return wishlistIds.some((id) => String(id) === String(productId));
  };

  return { wishlistIds, isWishlisted, handleToggle };
};
