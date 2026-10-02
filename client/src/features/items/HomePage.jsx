import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Camera, Shield, Star, TrendingUp, ChevronRight, Zap } from 'lucide-react';
import { ItemCard } from '@/components/cards/ItemCard';
import { useItems } from '@/hooks/useItems';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';

const POPULAR_CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Chandigarh',
];

const CATEGORIES = [
  { label: 'DSLR Cameras', icon: '📷', query: 'DSLR' },
  { label: 'Mirrorless', icon: '🎥', query: 'mirrorless' },
  { label: 'Lenses', icon: '🔭', query: 'lens' },
  { label: 'Drones', icon: '🚁', query: 'drone' },
  { label: 'Lighting', icon: '💡', query: 'lighting' },
  { label: 'Tripods', icon: '🗜️', query: 'tripod' },
  { label: 'Audio', icon: '🎙️', query: 'audio' },
  { label: 'Accessories', icon: '🎒', query: 'accessories' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');

  const { data: rawData, isLoading, error } = useItems({ limit: 8 });
  const data = Array.isArray(rawData) ? rawData : [];

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (city) params.append('city', city);
    navigate(`/search?${params.toString()}`);
  };

  const handleCityClick = (c) => {
    navigate(`/search?city=${encodeURIComponent(c)}`);
  };

  const handleCategoryClick = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-teal-500 text-white overflow-hidden"
        style={{ minHeight: '520px' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/5 rounded-full" />

        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm mb-6">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>India's #1 Camera Rental Marketplace</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            Rent the perfect gear
            <br />
            <span className="text-yellow-300">for your next shoot</span>
          </h1>
          <p className="text-lg md:text-xl text-teal-100 max-w-2xl mx-auto mb-10">
            Access thousands of cameras, lenses & accessories from trusted photographers across India.
          </p>

          {/* ── Search Box ── */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-2xl p-2 max-w-3xl mx-auto flex flex-col md:flex-row gap-2"
          >
            {/* What */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="What are you looking for? (e.g. Sony A7IV)"
                className="flex-1 bg-transparent text-gray-800 text-sm outline-none placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* City */}
            <div className="md:w-52 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="City"
                list="city-options"
                className="flex-1 bg-transparent text-gray-800 text-sm outline-none placeholder:text-gray-400"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <datalist id="city-options">
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-xl transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>

          {/* Popular cities */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-teal-200 text-sm">Popular:</span>
            {POPULAR_CITIES.slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => handleCityClick(c)}
                className="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1 rounded-full transition"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 md:grid-cols-3 gap-4 text-center">
          {[
            { label: 'Happy Renters', value: '10,000+', icon: <Star className="w-5 h-5 text-yellow-500" /> },
            { label: 'Gear Listed', value: '5,000+', icon: <Camera className="w-5 h-5 text-teal-500" /> },
            { label: 'Cities Covered', value: '50+', icon: <MapPin className="w-5 h-5 text-blue-500" /> },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              {stat.icon}
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.query)}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl p-4 hover:border-teal-300 hover:shadow-md transition group"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-teal-600 text-center leading-tight">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED GEAR ─────────────────────────────────────── */}
      <section className="py-12 px-4 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Gear</h2>
              <p className="text-gray-500 text-sm mt-1">Top-rated items available near you</p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-1 text-teal-600 font-semibold text-sm hover:underline"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-16">
              Failed to load featured items. Please try again.
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={Camera}
              title="No gear available yet"
              description="Be the first to list your gear and start earning!"
              actionLabel="List an Item"
              onAction={() => navigate('/items/new')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.map((item) => (
                <ItemCard key={item._id || item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY RENTLENS ─────────────────────────────────────── */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Why RentLens?</h2>
          <p className="text-gray-500 mt-2">Everything you need to rent with confidence</p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Shield className="w-8 h-8 text-teal-600" />,
              title: 'Fully Insured',
              desc: 'Every rental is covered. Rent with peace of mind.',
            },
            {
              icon: <Star className="w-8 h-8 text-yellow-500" />,
              title: 'Verified Owners',
              desc: 'All gear owners are verified with trust scores.',
            },
            {
              icon: <TrendingUp className="w-8 h-8 text-blue-500" />,
              title: 'Earn from Gear',
              desc: 'List your unused gear and earn while you sleep.',
            },
          ].map((feat) => (
            <div key={feat.title} className="flex flex-col items-center text-center gap-4 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="font-bold text-gray-900">{feat.title}</h3>
              <p className="text-gray-500 text-sm">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start renting?</h2>
          <p className="text-teal-100 mb-8">
            Join 10,000+ photographers and filmmakers on RentLens.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/search')}
              className="bg-white text-teal-700 font-bold px-8 py-3 rounded-xl hover:bg-teal-50 transition"
            >
              Browse Gear
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="border-2 border-white text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition"
            >
              List Your Gear
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
