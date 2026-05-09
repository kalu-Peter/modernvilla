import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CurrencyProvider } from "./context/CurrencyContext";
import PageTransition from "./components/PageTransition";
import WhatsAppFloat from "./components/WhatsAppFloat";

// Lazy-load every page so each is a separate JS chunk loaded on demand
const CrocodileLodge     = lazy(() => import("./CrocodileLodge"));
const Gallery            = lazy(() => import("./Gallery"));
const VillaDetailsPage   = lazy(() => import("./pages/VillaDetailsPage"));
const SearchResultsPage  = lazy(() => import("./pages/SearchResultsPage"));
const ReservationPage    = lazy(() => import("./pages/ReservationPage"));
const AdminLoginPage        = lazy(() => import("./pages/AdminLoginPage"));
const AdminDashboardPage    = lazy(() => import("./pages/AdminDashboardPage"));
const PaymentCallbackPage   = lazy(() => import("./pages/PaymentCallbackPage"));

function App() {
  return (
    <HelmetProvider>
    <CurrencyProvider>
      <Router>
        <Suspense fallback={null}>
          <PageTransition>
            <Routes>
              <Route path="/"                          element={<CrocodileLodge />} />
              <Route path="/gallery"                   element={<Gallery />} />
              <Route path="/villa/:villaId"            element={<VillaDetailsPage />} />
              <Route path="/search"                    element={<SearchResultsPage />} />
              <Route path="/reservation"               element={<ReservationPage />} />
              <Route path="/admin"              element={<AdminLoginPage />} />
              <Route path="/admin/dashboard"   element={<AdminDashboardPage />} />
              <Route path="/payment-callback"  element={<PaymentCallbackPage />} />
            </Routes>
          </PageTransition>
        </Suspense>
        <WhatsAppFloat />
      </Router>
    </CurrencyProvider>
    </HelmetProvider>
  );
}

export default App;
