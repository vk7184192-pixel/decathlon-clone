import React from "react";
import { Route } from "react-router-dom";
import MonsoonEssentials from "../pages/category/MonsoonEssentials";

const CategoryRoutes = (
  <>
    <Route path="/monsoon-essentials" element={<MonsoonEssentials />} />
  </>
);

export default CategoryRoutes;
