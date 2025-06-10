import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserManagementPage from './pages/UserManagementPage';
import AdminRoute from './components/AdminRoute';
import PurchaseManagerRoute from './components/PurchaseManagerRoute';
import PurchaseEntryPage from './pages/PurchaseEntryPage';
import KitchenStaffRoute from './components/KitchenStaffRoute';
import UsageEntryPage from './pages/UsageEntryPage';
import LiveStockPage from './pages/LiveStockPage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import UsageHistoryPage from './pages/UsageHistoryPage';
import AuditLogPage from './pages/AuditLogPage';
import Navbar from './components/Navbar';
import './App.css';

// A layout component that includes the Navbar for protected pages
function AppLayout() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Outlet /> {/* Nested routes will render here */}
      </main>
    </div>
  );
}

// Component to guard routes that require authentication
function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return currentUser ? <AppLayout /> : <Navigate to="/login" replace />;
}

// Component to guard routes for guests (e.g., login, signup)
function GuestRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return !currentUser ? <Outlet /> : <Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Guest routes (Login, Signup) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* Protected routes (all pages requiring login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/stock" element={<LiveStockPage />} />
            
            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/audit" element={<AuditLogPage />} />
            </Route>
            
            <Route element={<PurchaseManagerRoute />}>
              <Route path="/purchase/new" element={<PurchaseEntryPage />} />
              <Route path="/purchase/history" element={<PurchaseHistoryPage />} />
            </Route>

            <Route element={<KitchenStaffRoute />}>
              <Route path="/usage/new" element={<UsageEntryPage />} />
              <Route path="/usage/history" element={<UsageHistoryPage />} />
            </Route>
          </Route>

          {/* Fallback for any other route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

