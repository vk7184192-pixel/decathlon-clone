import React, { useEffect, useState, useRef } from "react";
import {
  FiSearch,
  FiUser,
  FiMapPin,
  FiHelpCircle,
  FiHeart,
  FiShoppingBag,
  FiShoppingCart,
  FiCreditCard,
  FiAward,
  FiMail,
  FiLogOut,
  FiMenu,
  FiMonitor,
  FiMessageSquare,
  FiChevronDown,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import ProductSizeModal from "./ProductSizeModal";
import "../styles/Navbar.css";
import "../styles/ProductSizeModal.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // SEARCH STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // PRODUCT MODAL STATES FOR ADD TO CART FROM SEARCH
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const isOrdersPage = location.pathname.startsWith("/account");

  const getImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://"))) {
      return image;
    }
    const apiBaseUrl = api.defaults.baseURL || "";
    const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");
    if (image.startsWith("/uploads/")) return `${backendUrl}${image}`;
    if (image.startsWith("uploads/")) return `${backendUrl}/${image}`;
    return `${backendUrl}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString("en-IN")}`;
  };

  const loadUser = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("User data error:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const fetchCartCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const response = await api.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const items = response.data.cart?.items || [];
      const count = items.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (error) {
      console.error("Navbar Fetch Cart Error:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadUser();
    fetchCartCount();

    const handleAuthChange = () => {
      loadUser();
      fetchCartCount();
    };

    const handleCartChange = () => {
      fetchCartCount();
    };

    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("cartUpdated", handleCartChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("cartUpdated", handleCartChange);
    };
  }, []);

  // DEBOUNCED SEARCH API CALL
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await api.get(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(response.data.products || []);
        setShowSearchDropdown(true);
      } catch (error) {
        console.error("Search API Error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // OUTSIDE CLICK LISTENER TO CLOSE SEARCH DROPDOWN
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setCartCount(0);

    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    setShowSearchDropdown(false);
  };

  const handleCloseModal = () => {
    if (adding) return;
    setSelectedProduct(null);
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      return;
    }

    const sizes = Array.isArray(selectedProduct.size) ? selectedProduct.size : [];

    if (sizes.length > 0 && !selectedSize) {
      toast.warning("Please select a size");
      return;
    }

    if (!quantity || Number(quantity) < 1) {
      toast.warning("Quantity must be at least 1");
      return;
    }

    try {
      setAdding(true);

      const response = await api.post(
        "/cart",
        {
          productId: selectedProduct._id,
          quantity: Number(quantity),
          size: selectedSize || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(response?.data?.message || "Product added to cart");
      window.dispatchEvent(new Event("cartUpdated"));

      setSelectedProduct(null);
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);
      if (error?.response?.status === 401) {
        toast.error("Please login again");
        return;
      }
      toast.error(error?.response?.data?.message || "Failed to add product to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <header className="navbar-wrapper">
        <div className={`navbar ${isOrdersPage ? "orders-navbar" : ""}`}>
          {/* ORDERS PAGE LEFT MENU */}
          {isOrdersPage && (
            <div className="orders-navbar-menu">
              <FiMenu />
              <span>
                ALL
                <br />
                SPORTS
              </span>
            </div>
          )}

          {/* LOGO */}
          <Link to="/" className="navbar-logo">
            <div className="logo-mark">
              <span></span>
            </div>
            <span className="logo-text">DECATHLON</span>
          </Link>

          {/* SEARCH */}
          <div className="navbar-search" ref={searchContainerRef}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              placeholder={
                isOrdersPage
                  ? 'Search for "Cricket Bat"...'
                  : 'Search for "Running Shoes", "Jackets", "Bags"...'
              }
            />
            {searchQuery ? (
              <FiX className="search-clear-icon" onClick={handleClearSearch} />
            ) : (
              <span className="search-cursor"></span>
            )}

            {/* LIVE SEARCH DROPDOWN RESULTS */}
            {showSearchDropdown && (
              <div className="search-results-dropdown">
                {isSearching ? (
                  <div className="search-loading-state">
                    <div className="search-spinner"></div>
                    <span>Searching products...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="search-empty-state">
                    No products found matching "<strong>{searchQuery}</strong>"
                  </div>
                ) : (
                  <div className="search-results-list">
                    <div className="search-results-count">
                      Found {searchResults.length} product(s)
                    </div>
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        className="search-result-item"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div className="search-result-image">
                          {product.images?.[0] ? (
                            <img
                              src={getImageUrl(product.images[0])}
                              alt={product.name}
                            />
                          ) : (
                            <div className="search-no-img">No Img</div>
                          )}
                        </div>

                        <div className="search-result-info">
                          <span className="search-result-brand">
                            {product.brand || "DECATHLON"}
                          </span>
                          <span className="search-result-name">
                            {product.name}
                          </span>
                          <div className="search-result-price-row">
                            <strong className="search-current-price">
                              {formatPrice(product.discountPrice || product.price)}
                            </strong>
                            {product.price > (product.discountPrice || 0) &&
                              product.discountPrice > 0 && (
                                <span className="search-mrp-price">
                                  MRP {formatPrice(product.price)}
                                </span>
                              )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="search-add-cart-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProduct(product);
                          }}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ORDERS PAGE DELIVERY LOCATION */}
          {isOrdersPage && (
            <div className="orders-delivery-location">
              <span>Delivery Location</span>
              <strong>
                174026 <em>CHANGE</em>
              </strong>
            </div>
          )}

          {/* RIGHT ACTIONS */}
          <nav className="navbar-actions">
            {/* ACCOUNT */}
            <div className="navbar-account">
              <Link
                to={user ? "/profile" : "/login"}
                className="navbar-action account-button"
              >
                <FiUser />
                <span>{user ? "Account" : "Sign In"}</span>
              </Link>

              {user && (
                <div className="account-dropdown">
                  <Link to="/profile" className="account-dropdown-item">
                    <FiUser />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/account/orders-returns?tab=order-returns"
                    className="account-dropdown-item"
                  >
                    <FiShoppingCart />
                    <span>Orders & Returns</span>
                  </Link>

                  <Link to="/wallet" className="account-dropdown-item">
                    <FiCreditCard />
                    <span>Wallet</span>
                  </Link>

                  <Link to="/rewards" className="account-dropdown-item">
                    <FiAward />
                    <span>Sporty Rewards</span>
                  </Link>

                  <Link to="/addresses" className="account-dropdown-item">
                    <FiMail />
                    <span>My Addresses</span>
                  </Link>

                  <button
                    type="button"
                    className="account-dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* MY STORE */}
            <Link to="/stores" className="navbar-action">
              {isOrdersPage ? <FiMonitor /> : <FiMapPin />}
              <span>My Store</span>
            </Link>

            {/* SUPPORT */}
            <Link to="/support" className="navbar-action">
              {isOrdersPage ? <FiMessageSquare /> : <FiHelpCircle />}
              <span>Support</span>
            </Link>

            {/* WISHLIST */}
            <Link to="/wishlist" className="navbar-action">
              <FiHeart />
              <span>Wishlist</span>
            </Link>

            {/* CART */}
            <Link to="/cart" className="navbar-action">
              <div className="cart-icon-wrapper">
                {isOrdersPage ? <FiShoppingCart /> : <FiShoppingBag />}
                {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
              </div>
              <span>Cart</span>
            </Link>
          </nav>
        </div>

        {/* MOBILE DELIVERY LOCATION BAR */}
        {!isOrdersPage && (
          <div className="mobile-delivery-location">
            <FiMapPin className="mobile-loc-pin" />
            <span>
              Delivery to <strong>Bangalore Central, Bangalore, 560001...</strong>
            </span>
            <FiChevronDown className="mobile-loc-arrow" />
          </div>
        )}
      </header>

      {/* PRODUCT SIZE MODAL FROM SEARCH */}
      {selectedProduct && (
        <ProductSizeModal
          product={selectedProduct}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          quantity={quantity}
          setQuantity={setQuantity}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
          adding={adding}
          getImageUrl={getImageUrl}
          formatPrice={formatPrice}
        />
      )}
    </>
  );
};

export default Navbar;
