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
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiGrid,
  FiEdit2,
} from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api, {
  isTokenExpired,
  handleAutoLogout,
  useWishlist,
} from "../api/axios";
import ProductSizeModal from "./ProductSizeModal";
import "../styles/Navbar.css";
import "../styles/ProductSizeModal.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isWishlisted, handleToggle: toggleWishlistIcon } = useWishlist();

  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // DECATHLON SEARCH MODAL STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
  const [popularProducts, setPopularProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [popularSlideIndex, setPopularSlideIndex] = useState(0);
  const [topProductsSlideIndex, setTopProductsSlideIndex] = useState(0);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("decathlon_recent_searches");
      return saved ? JSON.parse(saved) : ["Bags"];
    } catch {
      return ["Bags"];
    }
  });

  const trendingSearches = [
    "Rain coats",
    "Shoes for men",
    "Cycles",
    "Bags",
    "Jackets",
    "Yoga mat",
    "Track pants",
    "Tent",
    "Football",
  ];

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
    if (
      typeof image === "string" &&
      (image.startsWith("http://") || image.startsWith("https://"))
    ) {
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
      if (isTokenExpired(token)) {
        handleAutoLogout();
        setUser(null);
        return;
      }
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

  // FETCH POPULAR PRODUCTS FOR SEARCH MODAL
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await api.get("/products?limit=10");
        setPopularProducts(response.data.products || []);
      } catch (error) {
        console.error("Fetch Popular Search Products Error:", error);
      }
    };
    fetchPopular();
  }, []);

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
      setSearchResults({ products: [], categories: [] });
      setTopProductsSlideIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await api.get(
          `/products?search=${encodeURIComponent(searchQuery.trim())}`
        );
        setSearchResults({
          products: response.data.products || [],
          categories: response.data.categories || [],
        });
        setTopProductsSlideIndex(0);
      } catch (error) {
        console.error("Search API Error:", error);
        setSearchResults({ products: [], categories: [] });
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // OUTSIDE CLICK LISTENER TO CLOSE SEARCH MODAL
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
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
    setSearchResults({ products: [], categories: [] });
  };

  const handleSelectKeyword = (term) => {
    setSearchQuery(term);
    setIsSearchFocused(true);

    // SAVE TO RECENT SEARCHES
    setRecentSearches((prev) => {
      const updated = [term, ...prev.filter((t) => t !== term)].slice(0, 5);
      try {
        localStorage.setItem("decathlon_recent_searches", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelectProduct = (product) => {
    setIsSearchFocused(false);
    navigate(`/product/${product._id}`);
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
        }
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

  // SUGGESTIONS LIST DERIVED FROM SEARCH OR QUERY
  const suggestedQueries = searchQuery.trim()
    ? [
        searchQuery.trim(),
        `Trekking ${searchQuery.trim()}`,
        `Gym ${searchQuery.trim()}`,
        `Hiking ${searchQuery.trim()}`,
        `Duffle ${searchQuery.trim()}`,
        `Waterproof ${searchQuery.trim()} Cover`,
      ]
    : [];

  const popularVisibleCount = 3;
  const maxPopularSlide = Math.max(popularProducts.length - popularVisibleCount, 0);

  const topProductsVisibleCount = 3;
  const maxTopProductsSlide = Math.max(
    (searchResults.products?.length || 0) - topProductsVisibleCount,
    0
  );

  return (
    <>
      {/* SCREEN BACKDROP OVERLAY WHEN SEARCH IS ACTIVE */}
      {isSearchFocused && (
        <div
          className="search-modal-backdrop"
          onClick={() => setIsSearchFocused(false)}
        />
      )}

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

          {/* SEARCH BAR CONTAINER */}
          <div
            className={`navbar-search ${isSearchFocused ? "search-active" : ""}`}
            ref={searchContainerRef}
          >
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={
                isOrdersPage
                  ? 'Search for "Cricket Bat"...'
                  : "Search for 60+ sports and 6,000+ products"
              }
            />
            {searchQuery ? (
              <FiX className="search-clear-icon" onClick={handleClearSearch} />
            ) : (
              <span className="search-cursor"></span>
            )}

            {/* DECATHLON SEARCH MODAL POPOVER */}
            {isSearchFocused && (
              <div className="decathlon-search-modal">
                {/* 1. WHEN SEARCH QUERY IS EMPTY */}
                {!searchQuery.trim() && (
                  <div className="search-modal-content">
                    {/* RECENT SEARCHES */}
                    {recentSearches.length > 0 && (
                      <div className="search-modal-section">
                        <div className="search-modal-section-title">
                          <span>Recent searches</span>
                          <FiEdit2 className="search-edit-icon" />
                        </div>
                        <div className="search-recent-grid">
                          {recentSearches.map((term, idx) => (
                            <div
                              key={idx}
                              className="search-recent-card"
                              onClick={() => handleSelectKeyword(term)}
                            >
                              <div className="search-recent-img">
                                {popularProducts[idx]?.images?.[0] ? (
                                  <img
                                    src={getImageUrl(popularProducts[idx].images[0])}
                                    alt={term}
                                  />
                                ) : (
                                  <FiGrid />
                                )}
                              </div>
                              <span>{term}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TRENDING SEARCHES */}
                    <div className="search-modal-section">
                      <div className="search-modal-section-title">
                        <span>Trending searches</span>
                      </div>
                      <div className="search-trending-pills">
                        {trendingSearches.map((term, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="trending-pill-btn"
                            onClick={() => handleSelectKeyword(term)}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* MOST POPULAR CAROUSEL */}
                    {popularProducts.length > 0 && (
                      <div className="search-modal-section">
                        <div className="search-modal-section-header">
                          <h3>Most Popular</h3>
                          <div className="search-slider-arrows">
                            <button
                              type="button"
                              onClick={() =>
                                setPopularSlideIndex((prev) => Math.max(prev - 1, 0))
                              }
                              disabled={popularSlideIndex === 0}
                            >
                              <FiChevronLeft />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setPopularSlideIndex((prev) =>
                                  Math.min(prev + 1, maxPopularSlide)
                                )
                              }
                              disabled={popularSlideIndex === maxPopularSlide}
                            >
                              <FiChevronRight />
                            </button>
                          </div>
                        </div>

                        <div className="search-slider-viewport">
                          <div
                            className="search-slider-track"
                            style={{
                              transform: `translateX(-${popularSlideIndex * 33.33}%)`,
                            }}
                          >
                            {popularProducts.map((prod) => (
                              <div
                                key={prod._id}
                                className="search-product-card"
                                onClick={() => handleSelectProduct(prod)}
                              >
                                <div className="search-product-img-wrapper">
                                  {prod.discountPrice > 0 && (
                                    <span className="search-badge sale">Sale</span>
                                  )}
                                  {prod.images?.[0] ? (
                                    <img
                                      src={getImageUrl(prod.images[0])}
                                      alt={prod.name}
                                    />
                                  ) : (
                                    <div className="search-card-no-img">No Img</div>
                                  )}
                                </div>

                                <div className="search-product-details">
                                  <div className="search-product-title">
                                    <strong>{prod.brand || "DECATHLON"}</strong>{" "}
                                    {prod.name}
                                  </div>
                                  <div className="search-product-rating">
                                    <span className="stars">★★★★★</span>
                                    <span className="count">{prod.reviews || "4.3k"}</span>
                                  </div>
                                  <div className="search-product-price-row">
                                    <strong className="current-price">
                                      {formatPrice(prod.discountPrice || prod.price)}
                                    </strong>
                                    {prod.price > (prod.discountPrice || 0) &&
                                      prod.discountPrice > 0 && (
                                        <span className="mrp-price">
                                          MRP {formatPrice(prod.price)}
                                        </span>
                                      )}
                                  </div>
                                  <div className="search-product-actions">
                                    <button
                                      type="button"
                                      className={`search-wishlist-btn ${
                                        isWishlisted(prod._id) ? "active" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleWishlistIcon(prod._id);
                                      }}
                                    >
                                      {isWishlisted(prod._id) ? "♥" : "♡"}
                                    </button>
                                    <button
                                      type="button"
                                      className="search-add-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectProduct(prod);
                                      }}
                                    >
                                      Add to cart
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. WHEN SEARCH QUERY HAS TYPED TEXT */}
                {searchQuery.trim() && (
                  <div className="search-modal-content">
                    {/* SUGGESTED CATEGORIES & KEYWORDS */}
                    <div className="search-modal-section">
                      <div className="search-modal-section-title">
                        <span>Suggested</span>
                      </div>
                      <div className="search-suggestions-list">
                        {suggestedQueries.map((item, idx) => (
                          <div
                            key={idx}
                            className="suggestion-row"
                            onClick={() => handleSelectKeyword(item)}
                          >
                            <FiGrid className="suggestion-icon" />
                            <span>{item}</span>
                          </div>
                        ))}
                        <div
                          className="suggestion-row all-results-row"
                          onClick={() => handleSelectKeyword(searchQuery)}
                        >
                          <FiSearch className="suggestion-icon" />
                          <span>All results for "{searchQuery}"</span>
                        </div>
                      </div>
                    </div>

                    {/* TOP PRODUCTS CAROUSEL */}
                    <div className="search-modal-section">
                      <div className="search-modal-section-header">
                        <h3>Top products</h3>
                        {searchResults.products?.length > topProductsVisibleCount && (
                          <div className="search-slider-arrows">
                            <button
                              type="button"
                              onClick={() =>
                                setTopProductsSlideIndex((prev) =>
                                  Math.max(prev - 1, 0)
                                )
                              }
                              disabled={topProductsSlideIndex === 0}
                            >
                              <FiChevronLeft />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setTopProductsSlideIndex((prev) =>
                                  Math.min(prev + 1, maxTopProductsSlide)
                                )
                              }
                              disabled={
                                topProductsSlideIndex === maxTopProductsSlide
                              }
                            >
                              <FiChevronRight />
                            </button>
                          </div>
                        )}
                      </div>

                      {isSearching ? (
                        <div className="search-loading-state">
                          <div className="search-spinner"></div>
                          <span>Fetching products...</span>
                        </div>
                      ) : searchResults.products?.length === 0 ? (
                        <div className="search-empty-state">
                          No matching products found for "<strong>{searchQuery}</strong>"
                        </div>
                      ) : (
                        <div className="search-slider-viewport">
                          <div
                            className="search-slider-track"
                            style={{
                              transform: `translateX(-${
                                topProductsSlideIndex * 33.33
                              }%)`,
                            }}
                          >
                            {searchResults.products.map((prod) => (
                              <div
                                key={prod._id}
                                className="search-product-card"
                                onClick={() => handleSelectProduct(prod)}
                              >
                                <div className="search-product-img-wrapper">
                                  {prod.discountPrice > 0 ? (
                                    <span className="search-badge sale">
                                      Sale
                                    </span>
                                  ) : (
                                    <span className="search-badge price-drop">
                                      Price drop
                                    </span>
                                  )}
                                  {prod.images?.[0] ? (
                                    <img
                                      src={getImageUrl(prod.images[0])}
                                      alt={prod.name}
                                    />
                                  ) : (
                                    <div className="search-card-no-img">
                                      No Img
                                    </div>
                                  )}
                                </div>

                                <div className="search-product-details">
                                  <div className="search-product-title">
                                    <strong>{prod.brand || "QUECHUA"}</strong>{" "}
                                    {prod.name}
                                  </div>

                                  <div className="search-product-rating">
                                    <span className="stars">★★★★★</span>
                                    <span className="count">
                                      {prod.reviews || "570"}
                                    </span>
                                  </div>

                                  <div className="search-product-price-row">
                                    <strong className="current-price">
                                      {formatPrice(
                                        prod.discountPrice || prod.price
                                      )}
                                    </strong>
                                    {prod.discountPrice > 0 && prod.price > prod.discountPrice && (
                                      <span className="discount-off">
                                        {Math.round(
                                          ((prod.price - prod.discountPrice) /
                                            prod.price) *
                                            100
                                        )}
                                        % off
                                      </span>
                                    )}
                                  </div>

                                  {prod.price > (prod.discountPrice || 0) &&
                                    prod.discountPrice > 0 && (
                                      <div className="mrp-subtext">
                                        MRP {formatPrice(prod.price)}
                                      </div>
                                    )}

                                  <div className="search-product-actions">
                                    <button
                                      type="button"
                                      className={`search-wishlist-btn ${
                                        isWishlisted(prod._id) ? "active" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleWishlistIcon(prod._id);
                                      }}
                                    >
                                      {isWishlisted(prod._id) ? "♥" : "♡"}
                                    </button>
                                    <button
                                      type="button"
                                      className="search-add-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectProduct(prod);
                                      }}
                                    >
                                      Add to cart
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="explore-all-link">
                        <span onClick={() => handleSelectKeyword(searchQuery)}>
                          Explore all products matching "{searchQuery}"
                        </span>
                      </div>
                    </div>
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
                {cartCount > 0 && (
                  <span className="cart-count-badge">{cartCount}</span>
                )}
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
              Delivery to{" "}
              <strong>Bangalore Central, Bangalore, 560001...</strong>
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
