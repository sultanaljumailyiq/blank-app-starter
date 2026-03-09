import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { StoreLayout } from './layouts/StoreLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ArticleDetailPage } from './pages/public/ArticleDetailPage';
import { DiagnosisDetailPage } from './pages/public/DiagnosisDetailPage';
import { SmartDiagnosisPage } from './pages/public/SmartDiagnosisPage';

// Emergency Pages
import { DentalEmergencyPage } from './pages/emergency/DentalEmergencyPage';
import { FirstAidGuidePage } from './pages/emergency/FirstAidGuidePage';
import { EmergencyCentersPage } from './pages/emergency/EmergencyCentersPage';
import { BookingPage } from './pages/public/BookingPage';

// Welcome Pages
import { DoctorWelcomePage } from './pages/welcome/DoctorWelcomePage';
import { SupplierWelcomePage } from './pages/welcome/SupplierWelcomePage';
import { LabWelcomePage } from './pages/welcome/LabWelcomePage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { PrivacyPolicyPage } from './pages/auth/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/auth/TermsOfServicePage';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorOverviewPage } from './pages/doctor/DoctorOverviewPage';
import { DoctorClinicsPage } from './pages/doctor/DoctorClinicsPage';
import { DoctorTasksPage } from './pages/doctor/DoctorTasksPage';
import { DoctorMessagesPage } from './pages/doctor/DoctorMessagesPage';
import { DoctorNotificationsPage } from './pages/doctor/DoctorNotificationsPage';
import { UpdatesPage } from './pages/doctor/UpdatesPage';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage';
import AIAnalysisPage from './pages/doctor/ai/AIAnalysisPage';


import { ClinicDashboard } from './pages/doctor/clinic/ClinicDashboard';
import { ClinicPatientProfile } from './pages/doctor/clinic/ClinicPatientProfile';
import { NewLabOrder } from './pages/doctor/clinic/NewLabOrder';



import { ClinicActivityPage } from './pages/doctor/activities/ClinicActivityPage';
import { UpgradePlanPage } from './pages/doctor/subscription/UpgradePlanPage';

// Supplier Pages
import { SupplierDashboard } from './pages/supplier/SupplierDashboard';

// Community & Jobs Pages
import { CommunityPage } from './pages/community/CommunityPage';
import { CourseDetailPage } from './pages/community/CourseDetailPage';
import { WebinarDetailPage } from './pages/community/WebinarDetailPage';
import { GroupDetailPage } from './pages/community/GroupDetailPage';
import { UserProfilePage } from './pages/community/UserProfilePage';
import { ResourceDetailPage } from './pages/community/ResourceDetailPage';
import { ModelDetailPage } from './pages/community/ModelDetailPage';
import { MyLearningPage } from './pages/community/MyLearningPage';
import { SavedPage } from './pages/community/SavedPage';
import { NotificationsPage } from './pages/community/NotificationsPage';
import { PostDetailPage } from './pages/community/PostDetailPage';
import { StorePage } from './pages/store/StorePage';
import { ProductDetailPage } from './pages/store/ProductDetailPage';
import { SupplierProfilePage } from './pages/store/SupplierProfilePage';
import { CartPage } from './pages/store/CartPage';
import { OrdersPage } from './pages/store/OrdersPage';
import FavoritesPage from './pages/store/FavoritesPage';
import { AddressesPage } from './pages/store/AddressesPage';
import DealsPage from './pages/store/DealsPage';
import BrandsPage from './pages/store/BrandsPage';
import { BrandDetailPage } from './pages/store/BrandDetailPage';
import { CategoriesPage } from './pages/store/CategoriesPage';
import MessagesPage from './pages/store/MessagesPage';
import SuppliersPage from './pages/store/SuppliersPage';
import { AllCategoriesPage } from './pages/store/AllCategoriesPage';
import StoreMenuPage from './pages/store/StoreMenuPage';
import StoreOrderDetailPage from './pages/store/StoreOrderDetailPage';
import StoreSupportPage from './pages/store/StoreSupportPage';
import StoreMessagesPage from './pages/store/StoreMessagesPage';
import FeaturedPage from './pages/store/FeaturedPage';
import { ProductsPage } from './pages/store/ProductsPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { JobDetailPage } from './pages/jobs/JobDetailPage';
import { MyApplicationsPage } from './pages/jobs/MyApplicationsPage';
import { ProfessionalProfilePage } from './pages/jobs/ProfessionalProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Laboratory Pages
import { LaboratoryDashboard } from './pages/laboratory/LaboratoryDashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    // Special handling: 'staff' can access 'doctor' routes
    if (requiredRole === 'doctor' && (user?.role === 'doctor' || user?.role === 'staff')) {
      return <>{children}</>;
    }

    if (user?.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes Wrapped in MainLayout (Header + Bottom Nav) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/article/:id" element={<ArticleDetailPage />} />
          <Route path="/diagnosis/ai" element={<SmartDiagnosisPage />} />
          <Route path="/smart" element={<DiagnosisDetailPage />} />
          <Route path="/diagnosis/:id" element={<DiagnosisDetailPage />} />
          <Route path="/booking" element={<BookingPage />} />

          {/* Emergency Routes */}
          <Route path="/emergency/dental" element={<DentalEmergencyPage />} />
          <Route path="/emergency/first-aid" element={<FirstAidGuidePage />} />
          <Route path="/emergency/centers" element={<EmergencyCentersPage />} />

          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/course/:id" element={<CourseDetailPage />} />
          <Route path="/community/webinar/:id" element={<WebinarDetailPage />} />

          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/jobs/applications" element={<MyApplicationsPage />} />
          <Route path="/jobs/profile" element={<ProfessionalProfilePage />} />

          {/* User & Community Detail Routes */}
          <Route path="/community/group/:id" element={<GroupDetailPage />} />
          <Route path="/community/user/:id" element={<UserProfilePage />} />
          <Route path="/community/post/:id" element={<PostDetailPage />} />
          <Route path="/community/resource/:id" element={<ResourceDetailPage />} />
          <Route path="/community/model/:id" element={<ModelDetailPage />} />
          <Route path="/community/learning" element={<MyLearningPage />} />
          <Route path="/community/saved" element={<SavedPage />} />
          <Route path="/community/notifications" element={<NotificationsPage />} />
          <Route path="/community/messages" element={<DoctorMessagesPage />} />

          {/* Welcome Pages */}
          <Route path="/doctor-welcome" element={<DoctorWelcomePage />} />
          <Route path="/supplier-welcome" element={<SupplierWelcomePage />} />
          <Route path="/lab-welcome" element={<LabWelcomePage />} />

          {/* Admin Routes (Protected, Wrapped in MainLayout) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Store Routes with Unified Header */}
        <Route path="/store" element={<StoreLayout />}>
          <Route index element={<StorePage />} />
          <Route path="product/:productId" element={<ProductDetailPage />} />
          <Route path="supplier/:supplierId" element={<SupplierProfilePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<StoreOrderDetailPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="brand/:brandId" element={<BrandDetailPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="all-categories" element={<AllCategoriesPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="menu" element={<StoreMenuPage />} />
          <Route path="messages" element={<StoreMessagesPage />} />
          <Route path="support" element={<StoreSupportPage />} />
          <Route path="featured" element={<FeaturedPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories/:category" element={<ProductsPage />} />
          <Route path="categories/:category/:subCategory" element={<ProductsPage />} />
        </Route>

        {/* Auth Routes (No Header) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />

        {/* Doctor Routes (Protected, No Public Header) */}
        <Route path="/doctor" element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<DoctorOverviewPage />} />
          <Route path="clinics" element={<DoctorClinicsPage />} />
          <Route path="tasks" element={<DoctorTasksPage />} />
          <Route path="messages" element={<DoctorMessagesPage />} />
          <Route path="notifications" element={<DoctorNotificationsPage />} />
          <Route path="updates" element={<UpdatesPage />} />
          <Route path="updates" element={<UpdatesPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
          <Route path="ai" element={<AIAnalysisPage />} />

          {/* Integrated Public Pages for Doctor */}
          <Route path="home" element={<HomePage />} />
          <Route path="community" element={<CommunityPage />} />

          <Route path="jobs" element={<JobsPage hideHeader={true} />} />
        </Route>

        <Route
          path="/doctor/clinic/:clinicId"
          element={
            <ProtectedRoute requiredRole="doctor">
              <ClinicDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/clinic/:clinicId/patient/:patientId"
          element={
            <ProtectedRoute requiredRole="doctor">
              <ClinicPatientProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/clinic/:clinicId/new-lab-order"
          element={
            <ProtectedRoute requiredRole="doctor">
              <NewLabOrder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/clinic/:clinicId/activity"
          element={
            <ProtectedRoute requiredRole="doctor">
              <ClinicActivityPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/doctor/subscription/upgrade"
          element={
            <ProtectedRoute requiredRole="doctor">
              <UpgradePlanPage />
            </ProtectedRoute>
          }
        />

        {/* Supplier Routes (Protected, No Header) */}
        <Route
          path="/supplier/*"
          element={
            <ProtectedRoute requiredRole="supplier">
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />

        {/* Laboratory Routes (Protected, No Header) */}
        <Route
          path="/laboratory/*"
          element={
            <ProtectedRoute requiredRole="laboratory">
              <LaboratoryDashboard />
            </ProtectedRoute>
          }
        />



        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

import { StoreProvider } from './context/StoreContext';
import { CommunityProvider } from './contexts/CommunityContext';
import { PlatformProvider } from './contexts/PlatformContext';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StoreProvider>
          <CommunityProvider>
            <PlatformProvider>
              <AppContent />
            </PlatformProvider>
          </CommunityProvider>
        </StoreProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
