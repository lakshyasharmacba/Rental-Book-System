import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useInfiniteItems } from '@/hooks/useItems';
import { ItemCard } from '@/components/cards/ItemCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

const CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Chandigarh',
];

const CATEGORIES = [
  'Camera Body', 'Lens', 'Drone', 'Lighting', 'Tripod', 'Audio', 'Accessories',
];

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q:        searchParams.get('q')        || '',
    city:     searchParams.get('city')     || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    category: searchParams.get('category') || '',
  });

  const [inputQ,    setInputQ]    = useState(filters.q);
  const [inputCity, setInputCity] = useState(filters.city);

  const {
    data, isLoading, isError,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteItems(filters);

  const allItems = data?.pages?.flatMap((p) => p.items) ?? [];

  const handleSearch = (e) => {
    e?.preventDefault();
    const next = { ...filters, q: inputQ, city: inputCity };
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
  };

  const handleFilterApply = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilter = (key) => {
    const next = { ...filters, [key]: '' };
    setFilters(next);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
  };

  const activeFilters = Object.entries(filters).filter(([k, v]) => v && k !== 'q' && k !== 'city');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Search Bar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            {/* Query */}
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-100 transition">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search cameras, lenses, drones..."
                value={inputQ}
                onChange={(e) => setInputQ(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
              />
              {inputQ && (
                <button type="button" onClick={() => setInputQ('')}>
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>

            {/* City */}
            <div className="hidden sm:flex w-40 items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-teal-500 transition">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                list="search-cities"
                placeholder="City"
                value={inputCity}
                onChange={(e) => setInputCity(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none w-20"
              />
              <datalist id="search-cities">
                {CITIES.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:block">Search</span>
            </button>

            {/* Filter toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2.5 rounded-xl text-sm transition flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:block">Filters</span>
              {activeFilters.length > 0 && (
                <span className="bg-teal-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </form>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {activeFilters.map(([k, v]) => (
                <span key={k} className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full border border-teal-200">
                  {k === 'minPrice' ? `Min ₹${v}` : k === 'maxPrice' ? `Max ₹${v}` : k === 'category' ? v : v}
                  <button onClick={() => clearFilter(k)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Filter Panel (dropdown) ── */}
        {showFilters && (
          <div className="border-t border-gray-100 bg-white px-4 py-4">
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-500"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">City</label>
                <input
                  type="text"
                  list="filter-cities"
                  placeholder="e.g. Mumbai"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-500"
                />
                <datalist id="filter-cities">
                  {CITIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Min Price/day (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-500"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Max Price/day (₹)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-4 flex gap-2">
              <button
                onClick={handleFilterApply}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setFilters({ q: inputQ, city: inputCity, minPrice: '', maxPrice: '', category: '' });
                  setShowFilters(false);
                }}
                className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Results ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Result count */}
        {!isLoading && !isError && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 text-sm">
              <span className="font-semibold text-gray-900">{allItems.length}</span>
              {hasNextPage ? '+' : ''} results
              {filters.q && <span> for "<strong>{filters.q}</strong>"</span>}
              {filters.city && <span> in <strong>{filters.city}</strong></span>}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 py-20">
            Error loading results. Please try again.
          </div>
        ) : allItems.length === 0 ? (
          <EmptyState
            title="No results found"
            description="Try a different search term or city."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {allItems.map((item) => (
                <ItemCard key={item._id || item.id} item={item} />
              ))}
            </div>

            {hasNextPage && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium px-8 py-3 rounded-xl transition flex items-center gap-2"
                >
                  {isFetchingNextPage ? <Spinner size="sm" /> : <ChevronDown className="w-4 h-4" />}
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
