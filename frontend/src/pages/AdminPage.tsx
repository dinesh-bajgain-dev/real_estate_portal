import React, { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  Plus,
  Pencil,
  Trash2,
  Bed,
  Bath,
  Maximize,
  MapPin,
  Heart,
  RefreshCw,
  Search,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import {
  adminFetchStats,
  adminFetchProperties,
  adminCreateProperty,
  adminUpdateProperty,
  adminDeleteProperty,
  adminFetchUsers,
  adminDeleteUser,
} from "../api";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../context/AuthContext";
import { ToastContainer } from "../components/Toast";
import PropertyModal from "../components/PropertyModal";
import ConfirmDialog from "../components/ConfirmDialog";
import type { Property, User, AdminStats, PropertyFormData } from "../types";
import axios from "axios";

type Tab = "overview" | "properties" | "users";

const formatPrice = (price: number) =>
  price >= 10_000_000
    ? `NPR ${(price / 1_000_000).toFixed(1)}M`
    : `NPR ${(price / 1_000).toFixed(0)}K`;

const typeColors: Record<string, string> = {
  villa: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  apartment: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  house: "bg-green-500/10 text-green-400 border-green-500/20",
  penthouse: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const AdminPage: React.FC = () => {
  const { toasts, addToast, dismissToast } = useToast();
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal / dialog state
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProperty, setEditingProperty] = useState<
    Property | undefined
  >();
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "property" | "user";
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, p, u] = await Promise.all([
        adminFetchStats(),
        adminFetchProperties(),
        adminFetchUsers(),
      ]);
      setStats(s);
      setProperties(p);
      setUsers(u);
    } catch {
      addToast("Failed to load admin data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleSaveProperty = async (data: PropertyFormData) => {
    try {
      if (modalMode === "create") {
        const newProp = await adminCreateProperty(data);
        setProperties((prev) => [newProp, ...prev]);
        setStats((s) =>
          s ? { ...s, total_properties: s.total_properties + 1 } : s,
        );
        addToast("Property created successfully!", "success");
      } else if (editingProperty) {
        const updated = await adminUpdateProperty(editingProperty.id, data);
        setProperties((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        addToast("Property updated successfully!", "success");
      }
      setShowModal(false);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Save failed."
        : "Save failed.";
      addToast(msg, "error");
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "property") {
        await adminDeleteProperty(deleteTarget.id);
        setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setStats((s) =>
          s ? { ...s, total_properties: s.total_properties - 1 } : s,
        );
        addToast("Property deleted.", "success");
      } else {
        await adminDeleteUser(deleteTarget.id);
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        setStats((s) => (s ? { ...s, total_buyers: s.total_buyers - 1 } : s));
        addToast("User deleted.", "success");
      }
      setDeleteTarget(null);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Delete failed."
        : "Delete failed.";
      addToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Filtered lists ─────────────────────────────────────────────────────────

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()) ||
      p.property_type.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Skeleton loader ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm font-body">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className="flex h-screen overflow-hidden">
        <aside className="w-56 flex-shrink-0 border-r border-stone-800 flex flex-col">
          {/* Brand */}
          <div className="px-5 py-5 border-b border-stone-800">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center">
                <ShieldCheck size={14} className="text-stone-950" />
              </div>
              <span className="font-display text-white text-base font-semibold">
                Admin Panel
              </span>
            </div>
            <p className="text-stone-500 text-xs font-body pl-9">
              EstatePortal
            </p>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {(
              [
                { key: "overview", icon: LayoutDashboard, label: "Overview" },
                { key: "properties", icon: Building2, label: "Properties" },
                { key: "users", icon: Users, label: "Users" },
              ] as const
            ).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setSearch("");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all ${
                  tab === key
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-stone-400 hover:text-white hover:bg-stone-800/60"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          {/* Stats quick glance */}
          {stats && (
            <div className="px-4 pb-5 space-y-2 border-t border-stone-800 pt-4">
              <div className="flex justify-between text-xs font-body">
                <span className="text-stone-500">Properties</span>
                <span className="text-stone-200 font-medium">
                  {stats.total_properties}
                </span>
              </div>
              <div className="flex justify-between text-xs font-body">
                <span className="text-stone-500">Buyers</span>
                <span className="text-stone-200 font-medium">
                  {stats.total_buyers}
                </span>
              </div>
              <div className="flex justify-between text-xs font-body">
                <span className="text-stone-500">Favourites</span>
                <span className="text-stone-200 font-medium">
                  {stats.total_favourites}
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 z-10 bg-stone-950 border-b border-stone-800 px-8 py-4 flex items-center justify-between">
            <h1 className="font-display text-xl text-white capitalize">
              {tab === "overview" ? "Dashboard Overview" : tab}
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3 py-2 text-stone-400 hover:text-white text-xs font-body transition-colors"
              >
                <RefreshCw size={13} /> Refresh
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:text-red-300 text-xs font-body transition-colors border border-red-500/20 rounded-lg hover:bg-red-500/5 shadow-sm"
              >
                <LogOut size={13} /> Logout
              </button>
              {tab === "properties" && (
                <button
                  onClick={() => {
                    setModalMode("create");
                    setEditingProperty(undefined);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-body font-semibold rounded-lg transition-colors"
                >
                  <Plus size={15} /> Add Property
                </button>
              )}
            </div>
          </div>

          <div className="px-8 py-6">
            {/* ── Overview Tab ─────────────────────────────────────────── */}
            {tab === "overview" && stats && (
              <div className="space-y-8">
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-5">
                  {[
                    {
                      label: "Total Properties",
                      value: stats.total_properties,
                      icon: Building2,
                      color: "text-amber-400",
                      bg: "bg-amber-500/10",
                    },
                    {
                      label: "Registered Buyers",
                      value: stats.total_buyers,
                      icon: Users,
                      color: "text-blue-400",
                      bg: "bg-blue-500/10",
                    },
                    {
                      label: "Total Favourites",
                      value: stats.total_favourites,
                      icon: Heart,
                      color: "text-red-400",
                      bg: "bg-red-500/10",
                    },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div
                      key={label}
                      className="bg-stone-900 border border-stone-800 rounded-xl p-5"
                    >
                      <div
                        className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-4`}
                      >
                        <Icon size={18} className={color} />
                      </div>
                      <p className="text-stone-400 text-xs font-body mb-1">
                        {label}
                      </p>
                      <p className="font-display text-3xl text-white">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recent properties */}
                <div>
                  <h2 className="font-display text-lg text-white mb-4">
                    Recent Listings
                  </h2>
                  <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm font-body">
                      <thead>
                        <tr className="border-b border-stone-800">
                          <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs">
                            Property
                          </th>
                          <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs">
                            Type
                          </th>
                          <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs">
                            Price
                          </th>
                          <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs">
                            Saved by
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.slice(0, 5).map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors"
                          >
                            <td className="px-5 py-3 text-white">{p.title}</td>
                            <td className="px-5 py-3">
                              <span
                                className={`px-2 py-0.5 rounded border text-xs capitalize ${typeColors[p.property_type] || "bg-stone-700 text-stone-300 border-stone-600"}`}
                              >
                                {p.property_type}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-amber-400 font-mono text-xs">
                              {formatPrice(p.price)}
                            </td>
                            <td className="px-5 py-3 text-stone-400 flex items-center gap-1">
                              <Heart size={11} className="text-red-400" />{" "}
                              {p.favourite_count ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Properties Tab ───────────────────────────────────────── */}
            {tab === "properties" && (
              <div className="space-y-5">
                {/* Search */}
                <div className="relative max-w-sm">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search properties..."
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>

                <p className="text-stone-500 text-xs font-body">
                  {filteredProperties.length} properties
                </p>

                {/* Properties table */}
                <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="border-b border-stone-800">
                        <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs">
                          Property
                        </th>
                        <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs hidden md:table-cell">
                          Details
                        </th>
                        <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs">
                          Price
                        </th>
                        <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs hidden lg:table-cell">
                          Saved
                        </th>
                        <th className="px-5 py-3 text-stone-400 font-medium text-xs text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProperties.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors group"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.title}
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-stone-700 flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-white font-medium">
                                  {p.title}
                                </p>
                                <p className="text-stone-500 text-xs flex items-center gap-1 mt-0.5">
                                  <MapPin size={10} />
                                  {p.address}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-3 text-stone-400 text-xs">
                              <span
                                className={`px-2 py-0.5 rounded border text-xs capitalize ${typeColors[p.property_type] || "bg-stone-700 text-stone-300 border-stone-600"}`}
                              >
                                {p.property_type}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bed size={11} />
                                {p.bedrooms}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bath size={11} />
                                {p.bathrooms}
                              </span>
                              <span className="flex items-center gap-1">
                                <Maximize size={11} />
                                {p.area_sqft.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-amber-400 font-mono text-xs">
                              {formatPrice(p.price)}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className="text-stone-400 text-xs flex items-center gap-1">
                              <Heart size={11} className="text-red-400" />{" "}
                              {p.favourite_count ?? 0}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProperty(p);
                                  setModalMode("edit");
                                  setShowModal(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs rounded-lg transition-all"
                              >
                                <Pencil size={12} /> Edit
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "property",
                                    id: p.id,
                                    name: p.title,
                                  })
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs rounded-lg transition-all"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredProperties.length === 0 && (
                    <div className="text-center py-16">
                      <Building2
                        size={32}
                        className="text-stone-700 mx-auto mb-3"
                      />
                      <p className="text-stone-500 text-sm">
                        No properties found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Users Tab ────────────────────────────────────────────── */}
            {tab === "users" && (
              <div className="space-y-5">
                <div className="relative max-w-sm">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-lg text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                </div>

                <p className="text-stone-500 text-xs font-body">
                  {filteredUsers.length} users
                </p>

                <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="border-b border-stone-800">
                        <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs">
                          User
                        </th>
                        <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs">
                          Role
                        </th>
                        <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs hidden md:table-cell">
                          Joined
                        </th>
                        <th className="text-left px-5 py-3 text-stone-400 font-medium text-xs">
                          Favourites
                        </th>
                        <th className="px-5 py-3 text-stone-400 font-medium text-xs text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-white font-medium">{u.name}</p>
                              <p className="text-stone-500 text-xs mt-0.5">
                                {u.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-1 rounded border text-xs font-medium ${
                                u.role === "admin"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-stone-700/50 text-stone-300 border-stone-600/50"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-stone-400 text-xs hidden md:table-cell">
                            {u.created_at
                              ? new Date(u.created_at).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-stone-400 text-xs flex items-center gap-1">
                              <Heart size={11} className="text-red-400" />{" "}
                              {u.favourites_count ?? 0}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              {u.role !== "admin" ? (
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "user",
                                      id: u.id,
                                      name: u.name,
                                    })
                                  }
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs rounded-lg transition-all"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              ) : (
                                <span className="text-stone-600 text-xs px-3 py-1.5">
                                  Protected
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-16">
                      <Users
                        size={32}
                        className="text-stone-700 mx-auto mb-3"
                      />
                      <p className="text-stone-500 text-sm">No users found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showModal && (
        <PropertyModal
          mode={modalMode}
          property={editingProperty}
          onSave={handleSaveProperty}
          onClose={() => setShowModal(false)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${deleteTarget.type === "property" ? "Property" : "User"}`}
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.${deleteTarget.type === "property" ? " All associated favourites will also be removed." : ""}`}
          confirmLabel="Delete"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default AdminPage;
