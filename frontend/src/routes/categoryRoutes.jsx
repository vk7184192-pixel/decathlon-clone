import React from "react";
import { Route } from "react-router-dom";
import MonsoonEssentials from "../pages/category/MonsoonEssentials";
import Activewear from "../pages/category/Activewear";
import CategoryProducts from "../pages/category/CategoryProducts";

const CategoryRoutes = (
  <>
    <Route path="/monsoon-essentials" element={<MonsoonEssentials />} />
    <Route path="/activewear" element={<Activewear />} />
    <Route path="/category/activewear" element={<Activewear />} />
    <Route path="/category/:category" element={<CategoryProducts />} />
    <Route path="/c/:category" element={<CategoryProducts />} />
    <Route path="/sports/:category" element={<CategoryProducts />} />
  </>
);

export default CategoryRoutes;
