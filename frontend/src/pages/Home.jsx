import React, { useEffect, useState } from "react";
import "../styles/home/Home.css";
import api from "../api/axios";
import socket from "../socket/socket";

import CouponBanner from "../components/home/CouponBanner";
import PopularCategories from "../components/home/PopularCategories";
import PromoBanner from "../components/home/PromoBanner";
import CategoryShowcase from "../components/home/CategoryShowcase";
import ProductSection from "../components/home/ProductSection";
import SportsCategories from "../components/home/SportsCategories";
import PromoBanner2 from "../components/home/PromoBanner2";
import StormProofSection from "../components/home/StormProofSection";
import RainyDayCollection from "../components/home/RainyDayCollection";
import LovedCategories from "../components/home/LovedCategories";
import OutdoorProducts from "../components/home/OutdoorProducts";
import EquippingChampions from "../components/home/EquippingChampions";
import Footer from "../components/home/Footer";

const Home = () => {
  const [pageSections, setPageSections] = useState([]);

  const fetchHomeSections = async () => {
    try {
      const response = await api.get("/pages/slug/home");
      const secs = response.data?.page?.sections || [];
      setPageSections(secs);
    } catch (error) {
      console.error("Fetch Home Page Builder Sections Error:", error);
    }
  };

  useEffect(() => {
    fetchHomeSections();

    const handleUpdate = (data) => {
      if (data?.slug === "home" || !data?.slug) {
        fetchHomeSections();
      }
    };

    socket.on("homepage_updated", handleUpdate);
    return () => socket.off("homepage_updated", handleUpdate);
  }, []);

  const renderSection = (sec, idx) => {
    const nameLower = (sec.name || "").toLowerCase();

    if (nameLower.includes("coupon")) {
      return <CouponBanner key={sec._id || idx} customBanners={sec.banners} />;
    }
    if (nameLower.includes("popular")) {
      return <PopularCategories key={sec._id || idx} customCategories={sec.categories} title={sec.name} />;
    }
    if (nameLower.includes("promo banner 2") || nameLower.includes("promobanner2")) {
      return <PromoBanner2 key={sec._id || idx} customBanners={sec.banners} />;
    }
    if (nameLower.includes("promo")) {
      return <PromoBanner key={sec._id || idx} customBanners={sec.banners} />;
    }
    if (nameLower.includes("showcase")) {
      return <CategoryShowcase key={sec._id || idx} customCategories={sec.categories} />;
    }
    if (nameLower.includes("product section")) {
      return <ProductSection key={sec._id || idx} customProducts={sec.products} title={sec.name} />;
    }
    if (nameLower.includes("sports")) {
      return <SportsCategories key={sec._id || idx} customCategories={sec.categories} />;
    }
    if (nameLower.includes("storm")) {
      return <StormProofSection key={sec._id || idx} customProducts={sec.products} />;
    }
    if (nameLower.includes("rainy")) {
      return <RainyDayCollection key={sec._id || idx} customCategories={sec.categories} />;
    }
    if (nameLower.includes("loved")) {
      return <LovedCategories key={sec._id || idx} customCategories={sec.categories} />;
    }
    if (nameLower.includes("champions")) {
      return <EquippingChampions key={sec._id || idx} customCategories={sec.categories} />;
    }
    if (nameLower.includes("outdoor")) {
      return <OutdoorProducts key={sec._id || idx} customProducts={sec.products} />;
    }

    // Generic fallbacks based on section type
    if (sec.type === "banner") {
      return <PromoBanner key={sec._id || idx} customBanners={sec.banners} />;
    }
    if (sec.type === "category") {
      return <PopularCategories key={sec._id || idx} customCategories={sec.categories} title={sec.name} />;
    }
    if (sec.type === "product") {
      return <ProductSection key={sec._id || idx} customProducts={sec.products} title={sec.name} />;
    }

    return null;
  };

  const hasDynamicSections = pageSections.length > 0;

  return (
    <main className="home-page">
      <div className="home-container">
        {hasDynamicSections ? (
          pageSections.map((sec, idx) => renderSection(sec, idx))
        ) : (
          <>
            <CouponBanner />
            <PopularCategories />
            <PromoBanner />
            <CategoryShowcase />
            <ProductSection />
            <SportsCategories />
            <PromoBanner2 />
            <StormProofSection />
            <RainyDayCollection />
            <LovedCategories />
            <OutdoorProducts />
            <EquippingChampions />
          </>
        )}
      </div>

      <Footer />
    </main>
  );
};

export default Home;
