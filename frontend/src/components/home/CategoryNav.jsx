import React from "react";
import { Link } from "react-router-dom";
import "../../styles/home/CategoryNav.css";
  
const CategoryNav = () => {
  return (
    <div className="category-nav-wrapper">
      <div className="category-nav">
        <div className="category-links">
          <Link to="/sports">All Sports</Link>
          <Link to="/men">Men</Link>
          <Link to="/women">Women</Link>
          <Link to="/kids">Kids</Link>
        </div>

        <div className="delivery-location">
          <span>Delivery to</span>{" "}
          <Link to="/delivery">
            Bangalore Central, Bangalore, 560001, Karnataka
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;