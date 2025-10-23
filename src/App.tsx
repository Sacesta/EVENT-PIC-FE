
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import SupplierRegister from "./pages/SupplierRegister";
import SupplierLogin from "./pages/SupplierLogin";
import ProducerRegister from "./pages/ProducerRegister";
import ProducerLogin from "./pages/ProducerLogin";
import ProducerDashboard from "./pages/ProducerDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventChat from "./pages/EventChat";
import EventDetails from "./pages/EventDetails";
import PublicEventDetails from "./pages/PublicEventDetails";
import BrowseEvents from "./pages/BrowseEvents";
import ScanQR from "./pages/ScanQR";
import QRScanResult from "./pages/QRScanResult";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ContactTerms from "./pages/ContactTerms";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import './i18n';
import RoleSelection from "./pages/RoleSelection";
import BroadSuppliers from "./pages/BroadSuppliers";
import SupplierDetails from "./components/SupplierDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Gdpr from "./pages/Gdpr";
import Help from "./pages/Help";
import Faq from "./pages/Faq";
import Community from "./pages/Community";
import Status from "./pages/Status";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Role Selection Routes */}
            <Route path="/signin" element={<RoleSelection />} />
            <Route path="/signup" element={<RoleSelection />} />
            
            {/* Role-specific Authentication Routes */}
            <Route path="/supplier-login" element={<SupplierLogin />} />
            <Route path="/supplier-register" element={<SupplierRegister />} />
            <Route path="/producer-login" element={<ProducerLogin />} />
            <Route path="/producer-register" element={<ProducerRegister />} />
            
            <Route path="/producer-dashboard" element={<ProducerDashboard />} />
            <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/browse-events" element={<BrowseEvents />} />
             <Route path="/supplier/:supplierId" element={<SupplierDetails />} />
            <Route path="/browse-supplier" element={<BroadSuppliers />} />
            <Route path="/event/:eventId" element={<PublicEventDetails />} />
            <Route path="/event/:eventId/manage" element={<EventDetails />} />
            <Route path="/scan-qr/:eventId" element={<ScanQR />} />
            <Route path="/qr-result/:qrCode" element={<QRScanResult />} />
            <Route path="/event-chat/:eventId" element={<EventChat />} />
            <Route path="/event-chat/select" element={<EventChat />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contact-terms" element={<ContactTerms />} />
            
            {/* Create Event Routes */}
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/create-event/step/:step" element={<CreateEvent />} />
            
            {/* Edit Event Routes */}
            <Route path="/edit-event/:eventId" element={<EditEvent />} />
            <Route path="/edit-event/:eventId/step/:step" element={<EditEvent />} />

            {/* Information Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/gdpr" element={<Gdpr />} />
            <Route path="/help" element={<Help />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/community" element={<Community />} />
            <Route path="/status" element={<Status />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
