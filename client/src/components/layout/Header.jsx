import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Search, User, LogOut, MapPin, Menu, X } from 'lucide-react';
import { useAuthContext } from '@/app/providers';
import { NotificationBell } from '../../features/notifications/NotificationBell';

const confirmLogout = (onConfirm) => {
  if (window.confirm('Are you sure you want to log out?')) {
    onConfirm();
  }
};

const POPULAR_CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Chandigarh',
];

export const Header = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityRef = useRef(null);

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (city) params.append('city', city);
    navigate(`/search?${params.toString()}`);
    setMobileMenuOpen(false);
  };

  const handleCitySelect = (c) => {
    setCity(c);
    setCityDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-teal-700 hidden sm:block">RentLens</span>
          </Link>

          {/* ── Search Bar (Desktop) ── */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-4 items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-teal-400 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 transition"
          >
            {/* Search input */}
            <div className="flex-1 flex items-center px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search cameras, lenses, drones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none ml-2"
              />
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200" />

            {/* City input with dropdown */}
            <div className="relative" ref={cityRef}>
              <div className="flex items-center px-3 py-2 gap-1.5 cursor-pointer min-w-[120px]">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onFocus={() => setCityDropdownOpen(true)}
                  className="bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none w-20"
                />
              </div>
              {cityDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                  {POPULAR_CITIES.filter(
                    (c) => !city || c.toLowerCase().startsWith(city.toLowerCase())
                  ).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCitySelect(c)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition"
                    >
                      <MapPin className="w-3.5 h-3.5 inline mr-2 text-gray-400" />
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search button */}
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 flex items-center gap-1.5 text-sm font-medium transition flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:block">Search</span>
            </button>
          </form>

          {/* ── Right Nav ── */}
          <div className="flex items-center gap-2 ml-auto">

            {/* Mobile search button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              onClick={() => navigate('/search')}
            >
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <>
                <NotificationBell />

                <Link
                  to="/items/new"
                  className="hidden sm:flex items-center gap-1 text-sm font-semibold text-teal-600 border border-teal-200 bg-teal-50 hover:bg-teal-100 rounded-lg px-3 py-2 transition"
                >
                  + List Gear
                </Link>

                {/* User dropdown */}
                <div className="relative group cursor-pointer">
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-2 py-1.5 bg-gray-50 hover:bg-gray-100 transition">
                    <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.photoUrl || user.avatar ? (
                        <img
                          src={user.photoUrl || user.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium truncate max-w-[80px] hidden sm:block text-gray-700">
                      {user.name?.split(' ')[0]}
                    </span>
                  </div>

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4 text-gray-400" /> Profile
                    </Link>
                    <Link to="/bookings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      📦 My Bookings
                    </Link>
                    <Link to="/owner/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      📊 Owner Dashboard
                    </Link>
                    <Link to="/favorites" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      ❤️ Favorites
                    </Link>
                    <Link to="/items/new" className="flex items-center gap-2 px-4 py-2.5 text-sm text-teal-600 font-semibold hover:bg-teal-50">
                      + List Gear
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-600 font-semibold hover:bg-purple-50 border-t border-gray-100 mt-1 pt-1">
                        🛡️ Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => confirmLogout(logout)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 border-t border-gray-100 mt-1 pt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-teal-600 px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Search Bar ── */}
        <form
          onSubmit={handleSearch}
          className="md:hidden pb-3 flex gap-2"
        >
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-28">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="City"
              list="mobile-city-options"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none w-14"
            />
            <datalist id="mobile-city-options">
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <button
            type="submit"
            className="bg-teal-600 text-white px-3 py-2 rounded-xl flex-shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {user ? (
            <>
              <div className="flex items-center gap-3 pb-3 mb-2 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              {[
                { to: '/profile', label: '👤 Profile' },
                { to: '/bookings', label: '📦 My Bookings' },
                { to: '/owner/dashboard', label: '📊 Owner Dashboard' },
                { to: '/favorites', label: '❤️ Favorites' },
                { to: '/items/new', label: '+ List Gear' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm text-purple-600 font-semibold hover:bg-purple-50 rounded-lg"
                >
                  🛡️ Admin Panel
                </Link>
              )}
              <button
                onClick={() => confirmLogout(() => { logout(); setMobileMenuOpen(false); })}
                className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                Log in
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-sm text-teal-600 font-semibold hover:bg-teal-50 rounded-lg">
                Sign up free
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
