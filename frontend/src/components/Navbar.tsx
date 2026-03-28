import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, LogOut, User, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path: string) => location.pathname === path;
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 bg-stone-950 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
            <Home size={16} className="text-stone-950" />
          </div>
          <span className="font-display text-white text-lg font-semibold tracking-tight">
            Estate<span className="text-amber-400">Portal</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {isAdmin ? (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-body font-medium transition-colors ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                }`}
              >
                <ShieldCheck size={15} /> Admin Panel
              </Link>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-body font-medium transition-colors ${
                    isActive('/dashboard') ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                  }`}
                >
                  <Home size={15} /> Properties
                </Link>
                <Link
                  to="/favourites"
                  className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-body font-medium transition-colors ${
                    isActive('/favourites') ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'
                  }`}
                >
                  <Heart size={15} /> My Favourites
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isAdmin ? 'bg-amber-500' : 'bg-stone-600'}`}>
                  {isAdmin ? <ShieldCheck size={12} className="text-stone-950" /> : <User size={12} className="text-white" />}
                </div>
                <div className="text-right">
                  <p className="text-white text-xs font-medium font-body leading-none">{user?.name}</p>
                  <p className={`text-[10px] font-body capitalize mt-0.5 ${isAdmin ? 'text-amber-400' : 'text-stone-500'}`}>{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-stone-400 hover:text-red-400 text-sm font-body transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-stone-300 hover:text-white text-sm font-body transition-colors">Sign in</Link>
              <Link to="/register" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-body font-medium rounded transition-colors">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-stone-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-stone-950 px-6 py-4 flex flex-col gap-2 animate-fade-in">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 pb-3 border-b border-stone-800 mb-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-amber-500' : 'bg-stone-600'}`}>
                  {isAdmin ? <ShieldCheck size={14} className="text-stone-950" /> : <User size={14} className="text-white" />}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{user?.name}</p>
                  <p className={`text-xs capitalize ${isAdmin ? 'text-amber-400' : 'text-stone-500'}`}>{user?.role}</p>
                </div>
              </div>
              {isAdmin ? (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-amber-400 text-sm">
                  <ShieldCheck size={15} /> Admin Panel
                </Link>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-stone-300 hover:text-white text-sm">
                    <Home size={15} /> Properties
                  </Link>
                  <Link to="/favourites" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-stone-300 hover:text-white text-sm">
                    <Heart size={15} /> My Favourites
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 py-2 text-red-400 text-sm mt-1">
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 text-stone-300 text-sm">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="py-2 text-amber-400 text-sm font-medium">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
