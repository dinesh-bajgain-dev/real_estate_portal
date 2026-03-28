import React, { useState } from 'react';
import { Heart, Bed, Bath, Maximize, MapPin } from 'lucide-react';
import type { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onToggleFavourite: (id: string, isFav: boolean) => Promise<void>;
  animationDelay?: number;
}

const formatPrice = (price: number): string => {
  if (price >= 10_000_000) {
    return `NPR ${(price / 1_000_000).toFixed(1)}M`;
  }
  return `NPR ${(price / 1_000).toLocaleString()}K`;
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onToggleFavourite,
  animationDelay = 0,
}) => {
  const [isFav, setIsFav] = useState(property.is_favourited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    const next = !isFav;
    setIsFav(next); // optimistic update

    try {
      await onToggleFavourite(property.id, isFav);
    } catch {
      setIsFav(isFav); // revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const typeLabel: Record<string, string> = {
    villa: 'Villa',
    apartment: 'Apartment',
    house: 'House',
    penthouse: 'Penthouse',
  };

  return (
    <article
      className="group bg-white rounded-xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-xl transition-all duration-300 opacity-0 animate-fade-up"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-stone-100">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-200">
            <span className="text-stone-400 text-sm">No image</span>
          </div>
        )}

        {/* Property type badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-stone-950/80 backdrop-blur-sm text-white text-xs font-body font-medium rounded-full">
            {typeLabel[property.property_type] ?? property.property_type}
          </span>
        </div>

        {/* Favourite button */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            isFav
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-white/90 backdrop-blur-sm text-stone-400 hover:text-red-500'
          } ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110'}`}
        >
          <Heart
            size={16}
            className={isFav ? 'fill-current' : ''}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-stone-900 text-lg leading-tight">{property.title}</h3>
        </div>

        <div className="flex items-center gap-1 text-stone-500 mb-3">
          <MapPin size={12} className="flex-shrink-0" />
          <p className="font-body text-xs truncate">{property.address}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-stone-600 text-xs font-body mb-4 pb-4 border-b border-stone-100">
          <span className="flex items-center gap-1.5">
            <Bed size={13} className="text-stone-400" />
            {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={13} className="text-stone-400" />
            {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize size={13} className="text-stone-400" />
            {property.area_sqft.toLocaleString()} sqft
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs text-stone-400 mb-0.5">Asking price</p>
            <p className="font-display text-stone-900 text-xl font-semibold">{formatPrice(property.price)}</p>
          </div>
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-lg text-xs font-body font-medium transition-all ${
              isFav
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-stone-950 text-white hover:bg-stone-800'
            }`}
          >
            {isFav ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
