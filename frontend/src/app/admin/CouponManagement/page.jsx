"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Ticket, X, Calendar, Users, Info } from "lucide-react";

export default function CouponManagement() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const initialFormState = {
        code: "",
        discountType: "Percentage",
        description: "",
        discountValue: "",
        maxRedemptions: "",
        expiryDate: "",
        isActive: true
    };

    const [formData, setFormData] = useState(initialFormState);

    // Fetch Coupons from API
    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/coupons");
            const data = await res.json();
            if (data.success) setCoupons(data.coupons || []);
        } catch (err) {
            console.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const openModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon._id);
            setFormData(coupon);
        } else {
            setEditingCoupon(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingCoupon ? "PUT" : "POST";
            const res = await fetch("/api/admin/coupons", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingCoupon ? { ...formData, id: editingCoupon } : formData),
            });

            // આ ચેક ઉમેરો
            if (!res.ok) {
                const errorText = await res.text();
                console.error("Server Error:", errorText);
                alert("કૂપન સેવ કરવામાં પ્રોબ્લેમ છે!");
                return;
            }

            const result = await res.json();
            if (result.success) {
                setIsModalOpen(false);
                fetchCoupons();
            }
        } catch (err) {
            console.error("Client Error:", err);
        }
    };

    const deleteCoupon = async (id) => {
        if (confirm("Are you sure you want to delete this coupon?")) {
            const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchCoupons();
        }
    };

    return (
        <div className="p-8 bg-[#F9FAFB] min-h-screen font-sans">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Coupon Management</h1>
                    <p className="text-slate-500 text-sm">Create and manage promotional discount codes</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all font-semibold"
                >
                    <Plus size={20} /> Create New Coupon
                </button>
            </div>

            {/* Coupons List Table/Cards */}
            {loading ? (
                <div className="text-center py-20 text-slate-400 font-medium">Loading coupons...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => (
                        <div key={coupon._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-indigo-50 text-[#4F46E5] px-3 py-1 rounded-lg font-bold tracking-wider text-sm border border-indigo-100 uppercase">
                                    {coupon.code}
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${coupon.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800">
                                {coupon.discountType === "Percentage" ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Flat Off`}
                            </h3>
                            <p className="text-slate-500 text-xs mt-1 line-clamp-2">{coupon.description || "No description provided."}</p>

                            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span>Exp: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                    <Users size={14} className="text-slate-400" />
                                    <span>Used: {coupon.maxRedemptions || "∞"}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button onClick={() => openModal(coupon)} className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-1 border border-slate-200"><Edit size={14} /> Edit</button>
                                <button onClick={() => deleteCoupon(coupon._id)} className="flex-1 py-2 rounded-lg border border-rose-100 text-rose-500 text-xs font-bold hover:bg-rose-50 transition-all flex items-center justify-center gap-1"><Trash2 size={14} /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE/EDIT MODAL (સ્ક્રીનશોટ મુજબ) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative border border-white/20">
                        {/* Close Icon */}
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all">
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-slate-800 mb-8">{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Coupon Code */}
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-2">Coupon Code</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. SUMMER50"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium uppercase placeholder:text-slate-300"
                                    />
                                </div>
                                {/* Discount Type */}
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-2">Discount Type</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    >
                                        <option value="Percentage">Percentage</option>
                                        <option value="Fixed">Fixed Amount</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-2">Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Briefly describe what this coupon provides..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-300"
                                ></textarea>
                            </div>

                            {/* Discount Value */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-2">Discount Value</label>
                                <input
                                    type="text"
                                    placeholder="e.g., 20 for 20%"
                                    required
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-300"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Max Redemptions */}
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-2">Max Redemptions</label>
                                    <input
                                        type="number"
                                        placeholder="Leave blank for unlimited"
                                        value={formData.maxRedemptions}
                                        onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium placeholder:text-slate-300"
                                    />
                                </div>
                                {/* Expires At */}
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 block mb-2">Expires At</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-500"
                                    />
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-100"
                                >
                                    Save Coupon
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}