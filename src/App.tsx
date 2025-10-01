
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
import BrowseEvents from "./pages/BrowseEvents";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ContactTerms from "./pages/ContactTerms";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import './i18n';
import RoleSelection from "./pages/RoleSelection";

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
            <Route path="/event/:eventId" element={<EventDetails />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
