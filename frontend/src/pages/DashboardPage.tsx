import React, { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, Home } from 'lucide-react';
import { fetchProperties, addToFavourites, removeFromFavourites } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import PropertyCard from '../components/PropertyCard';
import type { Property } from '../types';

const PROPERTY_TYPES = ['All', 'House', 'Apartment', 'Villa', 'Penthouse'];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProperties();
        setProperties(data);
      } catch {
        addToast('Failed to load properties.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleFavourite = useCallback(async (propertyId: string, isFav: boolean) => {
    try {
      if (isFav) {
        await removeFromFavourites(propertyId);
        addToast('Removed from favourites.', 'success');
      } else {
        await addToFavourites(propertyId);
        addToast('Added to favourites!', 'success');
      }
      // Update local state to reflect the change
      setProperties((prev) =>
        prev.map((p) => p.id === propertyId ? { ...p, is_favourited: !isFav } : p)
      );
    } catch {
      addToast('Could not update favourites. Try again.', 'error');
      throw new Error('Toggle failed'); // let PropertyCard revert its optimistic update
    }
  }, [addToast]);

  const filtered = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || p.property_type === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const favouriteCount = properties.filter((p) => p.is_favourited).length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Page header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
              <p className="font-body text-stone-500 text-sm mb-1">
                Good day, <span className="text-stone-700 font-medium">{user?.name}</span>
              </p>
              <h1 className="font-display text-stone-900 text-3xl">Browse Properties</h1>
            </div>
            <div
              className="flex items-center gap-3 opacity-0 animate-fade-up animation-delay-100"
              style={{ animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg">
                <Home size={15} className="text-stone-500" />
                <span className="font-body text-stone-700 text-sm font-medium">
                  {properties.length} properties
                </span>
              </div>
              {favouriteCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                  <span className="text-red-500 text-sm">♥</span>
                  <span className="font-body text-red-700 text-sm font-medium">
                    {favouriteCount} saved
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search & filter bar */}
          <div
            className="mt-6 flex flex-col sm:flex-row gap-3 opacity-0 animate-fade-up animation-delay-200"
            style={{ animationFillMode: 'forwards' }}
          >
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or location..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg font-body text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <SlidersHorizontal size={14} className="text-stone-400 flex-shrink-0" />
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-body font-medium transition-all ${
                    filter === type
                      ? 'bg-stone-950 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 overflow-hidden animate-pulse">
                <div className="h-52 bg-stone-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-full" />
                  <div className="h-3 bg-stone-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-stone-400 text-2xl mb-2">No properties found</p>
            <p className="font-body text-stone-400 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((property, i) => (
              <PropertyCard
                key={property.id}
                property={property}
                onToggleFavourite={handleToggleFavourite}
                animationDelay={i * 60}
              />
            ))}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default DashboardPage;
