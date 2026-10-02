import { Link } from 'react-router-dom';
import { Camera, Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RentLens</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              India's trusted peer-to-peer marketplace for photographers and filmmakers. 
              Rent premium gear at affordable prices.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: <Instagram className="w-4 h-4" />, href: '#', label: 'Instagram' },
                { icon: <Twitter className="w-4 h-4" />, href: '#', label: 'Twitter' },
                { icon: <Facebook className="w-4 h-4" />, href: '#', label: 'Facebook' },
                { icon: <Youtube className="w-4 h-4" />, href: '#', label: 'YouTube' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 bg-gray-800 hover:bg-teal-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/search', label: 'Browse All Gear' },
                { to: '/search?q=camera', label: 'Cameras' },
                { to: '/search?q=lens', label: 'Lenses' },
                { to: '/search?q=drone', label: 'Drones' },
                { to: '/search?q=lighting', label: 'Lighting' },
                { to: '/search?q=audio', label: 'Audio Equipment' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/signup', label: 'Create Account' },
                { to: '/login', label: 'Sign In' },
                { to: '/items/new', label: 'List Your Gear' },
                { to: '/bookings', label: 'My Bookings' },
                { to: '/owner/dashboard', label: 'Owner Dashboard' },
                { to: '/favorites', label: 'My Favorites' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm mb-6">
              {[
                { to: '/support', label: 'Help Center' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/support', label: 'Report an Issue' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span>support@rentlens.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span>+91 900 000 0001</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span>Delhi, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© {year} RentLens. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <span className="text-red-400">❤️</span>
            <span>in India</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-teal-400 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-teal-400 transition-colors">Privacy</Link>
            <Link to="/support" className="hover:text-teal-400 transition-colors">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
