import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import MenuPage from "./pages/customer/MenuPage";
import TableManagement from "./pages/admin/TableManagement";
import MenuManagement from "./pages/admin/MenuManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import KitchenDisplay from "./pages/admin/KitchenDisplay";
import OrdersManagement from "./pages/admin/OrdersManagement";
import ReservationsManagement from "./pages/admin/ReservationsManagement";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthGuard requireAuth={false}><Auth /></AuthGuard>} />
          <Route path="/admin" element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </AuthGuard>
          } />
          <Route path="/admin/tables" element={
            <AuthGuard allowedRoles={['admin', 'staff']}>
              <TableManagement />
            </AuthGuard>
          } />
          <Route path="/admin/menu" element={
            <AuthGuard allowedRoles={['admin']}>
              <MenuManagement />
            </AuthGuard>
          } />
          <Route path="/admin/staff" element={
            <AuthGuard allowedRoles={['admin']}>
              <StaffManagement />
            </AuthGuard>
          } />
          <Route path="/admin/kitchen" element={
            <AuthGuard allowedRoles={['admin', 'staff']}>
              <KitchenDisplay />
            </AuthGuard>
          } />
          <Route path="/admin/orders" element={
            <AuthGuard allowedRoles={['admin', 'staff']}>
              <OrdersManagement />
            </AuthGuard>
          } />
          <Route path="/admin/reservations" element={
            <AuthGuard allowedRoles={['admin', 'staff']}>
              <ReservationsManagement />
            </AuthGuard>
          } />
          <Route path="/staff" element={
            <AuthGuard allowedRoles={['staff']}>
              <StaffDashboard />
            </AuthGuard>
          } />
          <Route path="/customer" element={
            <AuthGuard allowedRoles={['customer']}>
              <CustomerDashboard />
            </AuthGuard>
          } />
          <Route path="/customer/menu" element={
            <AuthGuard allowedRoles={['customer']}>
              <MenuPage />
            </AuthGuard>
          } />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
