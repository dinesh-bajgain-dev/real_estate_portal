import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { Property, PropertyFormData } from '../types';

interface PropertyModalProps {
  mode: 'create' | 'edit';
  property?: Property;
  onSave: (data: PropertyFormData) => Promise<void>;
  onClose: () => void;
}

const EMPTY_FORM: PropertyFormData = {
  title: '',
  address: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  area_sqft: '',
  image_url: '',
  property_type: 'apartment',
};

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'penthouse'];

const PropertyModal: React.FC<PropertyModalProps> = ({ mode, property, onSave, onClose }) => {
  const [form, setForm] = useState<PropertyFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<PropertyFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && property) {
      setForm({
        title: property.title,
        address: property.address,
        price: String(property.price),
        bedrooms: String(property.bedrooms),
        bathrooms: String(property.bathrooms),
        area_sqft: String(property.area_sqft),
        image_url: property.image_url || '',
        property_type: property.property_type,
      });
    }
  }, [mode, property]);

  const validate = (): boolean => {
    const errs: Partial<PropertyFormData> = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.address.trim()) errs.address = 'Address is required.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) errs.price = 'Valid price required.';
    if (!form.bedrooms || isNaN(Number(form.bedrooms))) errs.bedrooms = 'Required.';
    if (!form.bathrooms || isNaN(Number(form.bathrooms))) errs.bathrooms = 'Required.';
    if (!form.area_sqft || isNaN(Number(form.area_sqft)) || Number(form.area_sqft) <= 0) errs.area_sqft = 'Required.';
    if (form.image_url && !/^https?:\/\/.+/.test(form.image_url)) errs.image_url = 'Must be a valid URL.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await onSave(form);
    } finally {
      setIsLoading(false);
    }
  };

  const field = (
    label: string,
    key: keyof PropertyFormData,
    opts?: { type?: string; placeholder?: string; }
  ) => (
    <div>
      <label className="block text-stone-300 text-xs font-body mb-1.5">{label}</label>
      <input
        type={opts?.type || 'text'}
        value={form[key]}
        onChange={(e) => {
          setForm((p) => ({ ...p, [key]: e.target.value }));
          if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
        }}
        placeholder={opts?.placeholder}
        className={`w-full px-3 py-2.5 bg-stone-800 border rounded-lg text-white text-sm font-body placeholder-stone-500
          focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
          ${errors[key] ? 'border-red-500' : 'border-stone-700'}`}
      />
      {errors[key] && <p className="mt-1 text-red-400 text-xs">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-up shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900 border-b border-stone-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-white text-xl">
              {mode === 'create' ? 'Add New Property' : 'Edit Property'}
            </h2>
            <p className="text-stone-400 text-xs font-body mt-0.5">
              {mode === 'create' ? 'Fill in the details below to list a new property.' : 'Update the property details.'}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field('Property title', 'title', { placeholder: 'e.g. Sunlit Villa' })}
          {field('Full address', 'address', { placeholder: 'e.g. 14 Crescent Ave, Kathmandu' })}

          {/* Price + Type */}
          <div className="grid grid-cols-2 gap-4">
            {field('Price (NPR)', 'price', { type: 'number', placeholder: '12500000' })}
            <div>
              <label className="block text-stone-300 text-xs font-body mb-1.5">Property type</label>
              <select
                value={form.property_type}
                onChange={(e) => setForm((p) => ({ ...p, property_type: e.target.value }))}
                className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Beds / Baths / Area */}
          <div className="grid grid-cols-3 gap-4">
            {field('Bedrooms', 'bedrooms', { type: 'number', placeholder: '3' })}
            {field('Bathrooms', 'bathrooms', { type: 'number', placeholder: '2' })}
            {field('Area (sqft)', 'area_sqft', { type: 'number', placeholder: '1200' })}
          </div>

          {/* Image URL */}
          {field('Image URL (optional)', 'image_url', { placeholder: 'https://images.unsplash.com/...' })}

          {/* Preview image */}
          {form.image_url && /^https?:\/\/.+/.test(form.image_url) && (
            <div className="rounded-lg overflow-hidden h-40 bg-stone-800">
              <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-stone-400 hover:text-white text-sm font-body transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 text-sm font-body font-semibold rounded-lg transition-colors"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {mode === 'create' ? 'Create Property' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyModal;
