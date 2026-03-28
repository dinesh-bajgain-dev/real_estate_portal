import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FavouritesPage from './pages/FavouritesPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth pages — full screen, no navbar */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin pages — own layout, no shared navbar */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          {/* Buyer pages — with shared navbar */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/favourites" element={<FavouritesPage />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
