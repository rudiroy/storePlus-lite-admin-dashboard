import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/other/Home";
import ScrollToTop from "../components/ScrollToTop";
import PrivacyPolicy from "../pages/other/legal/PrivacyPolicy";
import TermsAndConditions from "../pages/other/legal/Termsandconditions/TermsAndConditions";
import AboutUs from "../pages/aboutus/AboutUs";
import ContactUs from "../pages/contactus/ContactUs";
import ClientPage from "../pages/ClientPage";
import ProductPage from "../pages/ProductPage";

import ComingSoon from "../pages/comingsoon/ComingSoon";
import ShopPage from "../pages/ShopPage";
import CartPage from "../pages/CartPage";
import { CartProvider } from "../components/cart/CartProvider";

// Your login pages
import AdminAuth from "../pages/admin/AdminAuth";
import AdminClientPage from "../pages/admin/AdminClientPage";
import AdminCategoriesMgtPage from "../pages/categories/AdminCategoriesMgtPage";
import AdminOrdersMgtPage from "../pages/orders/AdminOrdersMgtPage";

function Router() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsAndConditions />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} /> 
          <Route path="/admin" element={<AdminAuth />} />
          <Route path="/admin-client" element={<AdminClientPage />} />
          <Route path="/admin-categories" element={<AdminCategoriesMgtPage/>} />
          <Route path="/admin-orders" element={<AdminOrdersMgtPage/>} />
          <Route path="/client" element={<ClientPage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          {/* <Route path="/book-time" element={<BookTime />} /> */}
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default Router;
