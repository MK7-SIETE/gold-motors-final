import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import Home          from './pages/Home';
import Inventory     from './pages/Inventory';
import CarDetail     from './pages/CarDetail';
import SourceACar    from './pages/SourceACar';
import About         from './pages/About';
import Contact       from './pages/Contact';
import Privacy       from './pages/Privacy';
import Terms         from './pages/Terms';
import NotFound      from './pages/NotFound';
import AdminLogin    from './pages/admin/AdminLogin';
import AdminLayout   from './pages/admin/AdminLayout';
import Dashboard     from './pages/admin/Dashboard';
import CarsManager   from './pages/admin/CarsManager';
import AddEditCar    from './pages/admin/AddEditCar';
import Messages      from './pages/admin/Messages';
import Analytics     from './pages/admin/Analytics';
import DealerNotices from './pages/admin/DealerNotices';
import SuperLogin      from './pages/super/SuperLogin';
import SuperLayout     from './pages/super/SuperLayout';
import SuperDash       from './pages/super/SuperDash';
import SuperTestimonials from './pages/super/SuperTestimonials';
import HeroImages      from './pages/super/HeroImages';
import SuperDealers    from './pages/super/SuperDealers';
import SuperData       from './pages/super/SuperData';
import SuperNewsletter from './pages/super/SuperNewsletter';
import SuperProfile    from './pages/super/SuperProfile';
import SuperHealth     from './pages/super/SuperHealth';
import SuperSecurity   from './pages/super/SuperSecurity';

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}

function DealerGuard() {
  const { dealer } = useAuth();
  if (!dealer?.token) return <Navigate to="/dealer/login" replace />;
  return <AdminLayout />;
}

function SuperGuard() {
  const { superAdmin } = useAuth();
  if (!superAdmin?.token) return <Navigate to="/gm-x9k2-control" replace />;
  return <SuperLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <SiteConfigProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/"              element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/inventory"     element={<PublicLayout><Inventory /></PublicLayout>} />
            <Route path="/inventory/:id" element={<PublicLayout><CarDetail /></PublicLayout>} />
            <Route path="/source-a-car"  element={<PublicLayout><SourceACar /></PublicLayout>} />
            <Route path="/about"         element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact"       element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/privacy"       element={<PublicLayout><Privacy /></PublicLayout>} />
            <Route path="/terms"         element={<PublicLayout><Terms /></PublicLayout>} />

            {/* Dealer panel */}
            <Route path="/dealer/login" element={<AdminLogin />} />
            <Route path="/dealer"       element={<DealerGuard />}>
              <Route index               element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"    element={<Dashboard />} />
              <Route path="cars"         element={<CarsManager />} />
              <Route path="cars/new"     element={<AddEditCar />} />
              <Route path="cars/:id"     element={<AddEditCar />} />
              <Route path="messages"     element={<Messages />} />
              <Route path="notices"      element={<DealerNotices />} />
              <Route path="analytics"    element={<Analytics />} />
            </Route>

            {/* Super admin panel */}
            <Route path="/gm-x9k2-control"       element={<SuperLogin />} />
            <Route path="/gm-x9k2-control/panel" element={<SuperGuard />}>
              <Route index               element={<SuperDash />} />
              <Route path="dealers"      element={<SuperDealers />} />
              <Route path="data"         element={<SuperData />} />
              <Route path="hero-images"  element={<HeroImages />} />
              <Route path="profile"      element={<SuperProfile />} />
              <Route path="reviews" element={<SuperTestimonials />} />
              <Route path="newsletter"   element={<SuperNewsletter />} />
              <Route path="health"       element={<SuperHealth />} />
              <Route path="security"     element={<SuperSecurity />} />
            </Route>

            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
          </Routes>
        </BrowserRouter>
      </SiteConfigProvider>
    </AuthProvider>
  );
}