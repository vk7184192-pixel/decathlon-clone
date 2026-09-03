import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FiHeart, FiPlus, FiMinus } from "react-icons/fi";
import api, { useWishlist } from "../../api/axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/home/Footer";
import "../../styles/category/CategoryProducts.css";

const CATEGORY_NAMES = {
  "running-shoes": "Running Shoes",
  "hiking-backpacks": "Hiking Backpacks",
  "gym-shoes": "Gym Shoes",
  football: "Football",
  cycling: "Cycling",
  swimming: "Swimming",
  monsoon: "Monsoon Essentials",
};

const filters = [
  "Gender",
  "Category",
  "Size",
  "Sport",
  "Brand",
  "Color",
  "Discount",
  "Rating",
  "More Filters",
  "Availability",
];

function CategoryProducts() {
  const { category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isWishlisted, handleToggle } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("relevant");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [openFilters, setOpenFilters] = useState({});
  const [error, setError] = useState("");

  const activeCategoryId =
    location.state?.categoryId ||
    (category && category.match(/^[0-9a-fA-F]{24}$/) ? category : null);

  const categoryName =
    location.state?.categoryName ||
    CATEGORY_NAMES[category] ||
    category?.replaceAll("-", " ") ||
    "Products";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const queryParam = activeCategoryId || categoryName;
        const response = await api.get(
          `/products?category=${encodeURIComponent(queryParam)}&limit=48`,
        );

        const data = response.data;
        const productList = Array.isArray(data)
          ? data
          : data.products || data.data || [];

        setProducts(productList);
      } catch (err) {
        console.error(err);
        setError("Unable to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, activeCategoryId, categoryName]);

  const toggleFilter = (filterName) => {
    setOpenFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  const getImage = (product) => {
    const img =
      product.images?.[0]?.url ||
      product.images?.[0] ||
      product.image ||
      product.imageUrl;

    if (!img) return "https://via.placeholder.com/500x500?text=Product";
    if (
      typeof img === "string" &&
      (img.startsWith("http://") || img.startsWith("https://"))
    ) {
      return img;
    }
    const apiBaseUrl = api.defaults.baseURL || "";
    const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");
    if (typeof img === "string") {
      if (img.startsWith("/uploads/")) return `${backendUrl}${img}`;
      if (img.startsWith("uploads/")) return `${backendUrl}/${img}`;
      return `${backendUrl}${img.startsWith("/") ? "" : "/"}${img}`;
    }
    return "https://via.placeholder.com/500x500?text=Product";
  };

  const getPrice = (product) => {
    return Number(product.price || product.salePrice || 0);
  };

  const getMrp = (product) => {
    return Number(
      product.mrp ||
        product.originalPrice ||
        product.priceBeforeDiscount ||
        getPrice(product),
    );
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const price = getPrice(product);
      return price >= minPrice && price <= maxPrice;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => getPrice(a) - getPrice(b));
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => getPrice(b) - getPrice(a));
    }

    if (sortBy === "rating") {
      result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    return result;
  }, [products, minPrice, maxPrice, sortBy]);

  return (
    <div className="category-page">
      <Navbar />

      {/* HEADER */}
      <div className="category-header">
        <div className="delivery-text">
          Delivery to{" "}
          <span>Bangalore Central, Bangalore, 560001, Karnataka</span>
        </div>

        <div className="breadcrumb">
          <span onClick={() => navigate("/")}>Home</span>
          <b>›</b>
          <span>Sports</span>
          <b>›</b>
          <span>{categoryName}</span>
        </div>

        <h1>{categoryName}</h1>
      </div>

      <div className="category-layout">
        {/* FILTER SIDEBAR */}
        <aside className="filters-sidebar">
          <div className="filter-top">
            <h3>Filters</h3>

            <button
              onClick={() => {
                setMinPrice(0);
                setMaxPrice(20000);
              }}
            >
              Clear all
            </button>
          </div>

          {/* PRICE */}
          <div className="filter-section price-filter">
            <div className="filter-title">
              <span>Price</span>
              <span>−</span>
            </div>

            <p>
              From ₹{minPrice.toLocaleString()} to ₹{maxPrice.toLocaleString()}
            </p>

            <div className="price-range">
              <input
                type="range"
                min="0"
                max="20000"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(Math.min(Number(e.target.value), maxPrice))
                }
              />

              <input
                type="range"
                min="0"
                max="20000"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(Math.max(Number(e.target.value), minPrice))
                }
              />
            </div>

            <div className="price-inputs">
              <div>
                <small>Minimum</small>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
              </div>

              <div>
                <small>Maximum</small>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* OTHER FILTERS */}
          {filters.map((filter) => (
            <div
              className="filter-section filter-row"
              key={filter}
              onClick={() => toggleFilter(filter)}
            >
              <span>{filter}</span>

              {openFilters[filter] ? (
                <FiMinus size={18} />
              ) : (
                <FiPlus size={18} />
              )}
            </div>
          ))}
        </aside>

        {/* PRODUCTS AREA */}
        <main className="products-area">
          <div className="products-toolbar">
            <div className="category-tabs">
              <span>Explore all our collections</span>

              <button onClick={() => navigate("/category/men")}>
                Men {categoryName}
              </button>
              <button onClick={() => navigate("/category/women")}>
                Women {categoryName}
              </button>
              <button onClick={() => navigate("/category/kids")}>
                Kids {categoryName}
              </button>
            </div>

            <div className="products-sort">
              <strong>{filteredProducts.length} items</strong>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevant">Most relevant</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* LOADING */}
          {loading && <div className="loading">Loading products...</div>}

          {/* ERROR */}
          {!loading && error && <div className="error">{error}</div>}

          {/* PRODUCTS */}
          {!loading && !error && (
            <div className="product-grid">
              {filteredProducts.length === 0 ? (
                <div className="no-products">
                  No products found in this category.
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const price = getPrice(product);
                  const mrp = getMrp(product);
                  const discount =
                    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

                  const productId = product._id || product.id;
                  const wishlisted = isWishlisted(productId);

                  return (
                    <div className="product-card" key={productId}>
                      <div
                        className="product-image"
                        onClick={() => navigate(`/product/${productId}`)}
                      >
                        {product.isNew && (
                          <span className="new-badge">New arrival</span>
                        )}

                        {discount > 0 && (
                          <span className="sale-badge">Sale</span>
                        )}

                        <img
                          src={getImage(product)}
                          alt={product.name || "Product"}
                        />
                      </div>

                      <div className="product-info">
                        <h3 onClick={() => navigate(`/product/${productId}`)}>
                          {product.name}
                        </h3>

                        <div className="rating">
                          <span>★★★★★</span>

                          <small>{product.rating || 4.5}</small>

                          <small>
                            {product.reviews
                              ? `${
                                  product.reviews / 1000 >= 1
                                    ? (product.reviews / 1000).toFixed(1) + "k"
                                    : product.reviews
                                }`
                              : "0"}
                          </small>
                        </div>

                        <div className="price">₹{price.toLocaleString()}</div>

                        {mrp > price && (
                          <div className="mrp">MRP ₹{mrp.toLocaleString()}</div>
                        )}

                        <div className="product-actions">
                          <button
                            className={`wishlist-btn ${wishlisted ? "active" : ""}`}
                            onClick={() => handleToggle(productId)}
                            aria-label="Wishlist"
                          >
                            <FiHeart
                              fill={wishlisted ? "#e90036" : "none"}
                              color={wishlisted ? "#e90036" : "currentColor"}
                            />
                          </button>

                          <button
                            className="add-cart-btn"
                            onClick={() => navigate(`/product/${productId}`)}
                          >
                            Add to cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default CategoryProducts;
