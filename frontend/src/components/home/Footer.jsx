import React from "react";

import {
  FiRotateCcw,
  FiPackage,
  FiTruck,
  FiSmile,
  FiRefreshCw,
  FiFacebook,
  FiInstagram,
} from "react-icons/fi";

import { FaXTwitter, FaYoutube } from "react-icons/fa6";

import "../../styles/home/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* =========================
          TOP BENEFITS
      ========================= */}

      <div className="footer-benefits">
        <div className="footer-benefit">
          <FiRotateCcw />
          <span>Easy Returns*</span>
        </div>

        <div className="footer-benefit">
          <FiPackage />
          <span>Collect in-store</span>
        </div>

        <div className="footer-benefit">
          <FiTruck />
          <span>Express Delivery *</span>
        </div>

        <div className="footer-benefit">
          <FiSmile />
          <span>1 Mn+ happy customers</span>
        </div>

        <div className="footer-benefit">
          <FiRefreshCw />
          <span>We buy back</span>
        </div>
      </div>

      {/* =========================
          FOOTER CONTENT
      ========================= */}

      <div className="footer-content">
        {/* LEFT COLUMN */}

        <div className="footer-left">
          <a href="#download" className="footer-main-link">
            Download the app
          </a>

          <a href="#membership" className="footer-main-link">
            Become a member
          </a>

          {/* SOCIAL ICONS */}

          <div className="footer-socials">
            <a href="#facebook" aria-label="Facebook" className="footer-social">
              <FiFacebook />
            </a>

            <a href="#twitter" aria-label="X" className="footer-social">
              <FaXTwitter />
            </a>

            <a href="#youtube" aria-label="YouTube" className="footer-social">
              <FaYoutube />
            </a>

            <a
              href="#instagram"
              aria-label="Instagram"
              className="footer-social"
            >
              <FiInstagram />
            </a>
          </div>
        </div>

        {/* SERVICES */}

        <div className="footer-column">
          <h3>SERVICES</h3>

          <a href="#schools">Decathlon for Schools</a>

          <a href="#corporates">Decathlon for Corporates</a>

          <a href="#clubs">Decathlon for Sport Clubs</a>

          <a href="#giftcard">Giftcard</a>

          <a href="#affiliate">Affiliate Program</a>

          <a href="#playo">Playo Summer</a>

          <a href="#second-life">Second life</a>

          <a href="#buy-back">Buy back</a>

          <a href="#installation">Installation &amp; assembly</a>
        </div>

        {/* HELP */}

        <div className="footer-column">
          <h3>HELP</h3>

          <a href="#find-store">Find a store</a>

          <a href="#return-policy">Return Policy</a>

          <a href="#shipping-policy">Shipping policy</a>

          <a href="#sitemap">Sitemap</a>

          <a href="#product-recall">Product recall</a>
        </div>

        {/* ABOUT */}

        <div className="footer-column">
          <h3>ABOUT</h3>

          <a href="#about-us">About us</a>

          <a href="#made-in-india">Made In India</a>

          <a href="#social-csr">Social &amp; CSR Initiatives</a>

          <a href="#careers">Careers</a>

          <a href="#blog">Blog</a>
        </div>
      </div>

      {/* =========================
          BOTTOM
      ========================= */}

      <div className="footer-bottom">
        {/* LOGO */}

        <div className="footer-logo">
          <span className="footer-logo-symbol">◉</span>

          <span className="footer-logo-text">DECATHLON</span>
        </div>

        {/* COUNTRY */}

        <div className="footer-country">
          <span className="footer-flag">🇮🇳</span>

          <span>India</span>

          <span className="footer-country-arrow">˅</span>
        </div>

        {/* LINKS */}

        <div className="footer-legal">
          <a href="#terms">Terms and Conditions</a>

          <a href="#privacy">Privacy Policy</a>
        </div>

        {/* COPYRIGHT */}

        <div className="footer-copyright">
          © 2026 Decathlon Sports India Pvt Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
