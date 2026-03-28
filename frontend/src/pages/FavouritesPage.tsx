import React, { useEffect, useState, useCallback } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchFavourites, addToFavourites, removeFromFavourites } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import PropertyCard from '../components/PropertyCard';
import type { Property } from '../types';

const FavouritesPage: React.FC = () => {
  const { user } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();

  const [favourites, setFavourites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchFavourites();
        setFavourites(data);
      } catch {
        addToast('Failed to load favourites.', 'error');
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
        // Remove from list immediately — this page only shows favourited properties
        setFavourites((prev) => prev.filter((p) => p.id !== propertyId));
        addToast('Removed from favourites.', 'success');
      } else {
        await addToFavourites(propertyId);
        setFavourites((prev) =>
          prev.map((p) => p.id === propertyId ? { ...p, is_favourited: true } : p)
        );
        addToast('Added to favourites!', 'success');
      }
    } catch {
      addToast('Could not update favourites. Try again.', 'error');
      throw new Error('Toggle failed');
    }
  }, [addToast]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
            <p className="font-body text-stone-500 text-sm mb-1">
              <span className="text-stone-700 font-medium">{user?.name}</span> · {user?.role}
            </p>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-stone-900 text-3xl">My Favourites</h1>
              {!isLoading && (
                <span className="px-3 py-1 bg-red-50 border border-red-100 text-red-600 text-sm font-body font-medium rounded-full flex items-center gap-1.5">
                  <Heart size={12} className="fill-current" />
                  {favourites.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 overflow-hidden animate-pulse">
                <div className="h-52 bg-stone-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : favourites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <Heart size={32} className="text-stone-300" />
            </div>
            <h2 className="font-display text-stone-700 text-2xl mb-2">No favourites yet</h2>
            <p className="font-body text-stone-400 text-sm mb-8 max-w-xs">
              Browse properties and click the heart icon to save ones you love.
            </p>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3 bg-stone-950 hover:bg-stone-800 text-white font-body font-medium text-sm rounded-lg transition-colors"
            >
              Browse Properties <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            <p className="font-body text-stone-500 text-sm mb-6">
              You have saved {favourites.length} propert{favourites.length === 1 ? 'y' : 'ies'}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favourites.map((property, i) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onToggleFavourite={handleToggleFavourite}
                  animationDelay={i * 60}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default FavouritesPage;
