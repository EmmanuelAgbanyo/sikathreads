import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { ToastProvider } from './context/ToastContext';
import { StoreService } from './services/storeService';

// Layout components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AnnouncementBar } from './components/AnnouncementBar';
import { CompareTray } from './components/CompareTray';
import { AIWidget } from './components/AIWidget';

// Public pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Collections, CollectionDetail } from './pages/Collections';
import { StyleMatch } from './pages/StyleMatch';
import { SourcingRequestPage } from './pages/SourcingRequestPage';
import { ComparePage } from './pages/ComparePage';
import { SmartFinder } from './pages/SmartFinder';
import { TrackOrder } from './pages/TrackOrder';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { AboutUs } from './pages/AboutUs';
import { ContactUs } from './pages/ContactUs';
import { FAQs, DeliveryPolicy, ReturnsPolicy, PrivacyPolicy, Terms } from './pages/PolicyAndFaqPages';
import { Account } from './pages/Account';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { ProtectedRoute } from './components/ProtectedRoute';

// Admin pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminStyleMatch } from './pages/admin/AdminStyleMatch';
import { AdminSourcing } from './pages/admin/AdminSourcing';
import { AdminEnquiries } from './pages/admin/AdminEnquiries';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Public Page Shell with Header, Announcement Bar, Compare Tray, and Footer
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const content = StoreService.getSiteContent();
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar content={content.announcementBar} />
      <Header />
      <div className="flex-1">{children}</div>
      <CompareTray />
      <AIWidget />
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <RecentlyViewedProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                  {/* Public Storefront Routes */}
                  <Route
                    path="/"
                    element={
                      <PublicLayout>
                        <Home />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/shop"
                    element={
                      <PublicLayout>
                        <Shop />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/finder"
                    element={
                      <PublicLayout>
                        <SmartFinder />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/compare"
                    element={
                      <PublicLayout>
                        <ComparePage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/track-order"
                    element={
                      <PublicLayout>
                        <TrackOrder />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/product/:slug"
                    element={
                      <PublicLayout>
                        <ProductDetail />
                      </PublicLayout>
                    }
                  />
              <Route
                path="/collections"
                element={
                  <PublicLayout>
                    <Collections />
                  </PublicLayout>
                }
              />
              <Route
                path="/collections/:slug"
                element={
                  <PublicLayout>
                    <CollectionDetail />
                  </PublicLayout>
                }
              />
              <Route
                path="/stylematch"
                element={
                  <PublicLayout>
                    <StyleMatch />
                  </PublicLayout>
                }
              />
              <Route
                path="/sourcing"
                element={
                  <PublicLayout>
                    <SourcingRequestPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/cart"
                element={
                  <PublicLayout>
                    <Cart />
                  </PublicLayout>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PublicLayout>
                    <Checkout />
                  </PublicLayout>
                }
              />
              <Route
                path="/order-confirmation/:orderRef"
                element={
                  <PublicLayout>
                    <OrderConfirmation />
                  </PublicLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicLayout>
                    <AboutUs />
                  </PublicLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <PublicLayout>
                    <ContactUs />
                  </PublicLayout>
                }
              />
              <Route
                path="/faqs"
                element={
                  <PublicLayout>
                    <FAQs />
                  </PublicLayout>
                }
              />
              <Route
                path="/delivery-policy"
                element={
                  <PublicLayout>
                    <DeliveryPolicy />
                  </PublicLayout>
                }
              />
              <Route
                path="/returns-policy"
                element={
                  <PublicLayout>
                    <ReturnsPolicy />
                  </PublicLayout>
                }
              />
              <Route
                path="/privacy-policy"
                element={
                  <PublicLayout>
                    <PrivacyPolicy />
                  </PublicLayout>
                }
              />
              <Route
                path="/terms"
                element={
                  <PublicLayout>
                    <Terms />
                  </PublicLayout>
                }
              />
              <Route
                path="/account"
                element={
                  <PublicLayout>
                    <Account />
                  </PublicLayout>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicLayout>
                    <Login />
                  </PublicLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicLayout>
                    <Register />
                  </PublicLayout>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicLayout>
                    <ForgotPassword />
                  </PublicLayout>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicLayout>
                    <ResetPassword />
                  </PublicLayout>
                }
              />
              <Route
                path="/verify-email"
                element={
                  <PublicLayout>
                    <VerifyEmail />
                  </PublicLayout>
                }
              />

              {/* Administrative Operations Suite */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="stylematch" element={<AdminStyleMatch />} />
                <Route path="sourcing" element={<AdminSourcing />} />
                <Route path="enquiries" element={<AdminEnquiries />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </RecentlyViewedProvider>
      </CompareProvider>
    </WishlistProvider>
  </CartProvider>
</AuthProvider>
</ToastProvider>
  );
};
