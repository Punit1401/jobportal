"use client";
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Send, ThumbsUp, ShieldCheck, Loader2 } from 'lucide-react';
import { useSession } from "next-auth/react";

export default function ReviewSystem({ targetId, targetType }) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hover, setHover] = useState(0);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reviews?targetId=${targetId}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.reviews);
                setAvgRating(data.averageRating);
            }
        } catch (error) {
            console.error("Fetch Reviews Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (targetId) fetchReviews();
    }, [targetId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session) return alert("Please login to give a review");
        if (!comment) return alert("Please write a comment");

        setSubmitting(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetId,
                    reviewerId: session.user.id || session.user.email,
                    reviewerName: session.user.name || "Anonymous User",
                    targetType,
                    rating,
                    comment
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message || "Review submitted successfully!");
                setComment("");
                setRating(5);
                fetchReviews();
            }
        } catch (error) {
            alert("Error submitting review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-12">
            
            {/* Header & Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 md:p-10 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm gap-6 md:gap-8">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-600 rounded-[20px] md:rounded-[30px] flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-100 shrink-0">
                        <span className="text-xl md:text-3xl font-black">{avgRating}</span>
                        <div className="flex gap-0.5 mt-0.5 md:mt-1">
                             {[...Array(5)].map((_, i) => (
                                 <Star key={i} size={8} fill={i < Math.round(avgRating) ? "white" : "none"} className={i < Math.round(avgRating) ? "text-white" : "text-indigo-400"} />
                             ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight leading-tight">Trust & Reputation</h3>
                        <p className="text-slate-500 font-bold text-xs md:text-sm">Based on {reviews.length} authentic reviews</p>
                    </div>
                </div>
                <div className="flex -space-x-3 md:-space-x-4">
                    {reviews.slice(0, 5).map((r, i) => (
                        <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] uppercase overflow-hidden">
                            {r.reviewerName?.charAt(0) || "U"}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-10">
                
                {/* Submit Review Form */}
                <div className="w-full">
                    <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm">
                        <h4 className="text-lg md:text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                            <MessageSquare size={20} className="text-indigo-600" />
                            Write a Review
                        </h4>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Your Rating</label>
                                <div className="flex gap-2">
                                    {[...Array(5)].map((_, i) => {
                                        const starValue = i + 1;
                                        return (
                                            <button
                                                type="button"
                                                key={i}
                                                className={`p-1 md:p-2 transition-all transform hover:scale-110 ${starValue <= (hover || rating) ? 'text-amber-400' : 'text-slate-200'}`}
                                                onClick={() => setRating(starValue)}
                                                onMouseEnter={() => setHover(starValue)}
                                                onMouseLeave={() => setHover(0)}
                                            >
                                                <Star size={24} fill={starValue <= (hover || rating) ? "currentColor" : "none"} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block">Share your experience</label>
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows="4"
                                    className="w-full p-4 md:p-5 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 outline-none transition-all resize-none text-sm"
                                    placeholder="What was it like working with them?"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-[20px] md:rounded-[24px] font-black uppercase tracking-widest text-xs md:text-sm hover:bg-black transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Post Review</>}
                            </button>
                            
                            {!session && (
                                <p className="text-center text-[10px] font-black text-rose-500 uppercase tracking-widest mt-4">Please login to submit</p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="w-full space-y-6">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h4 className="text-lg md:text-xl font-black text-slate-900">Recent Testimonials</h4>
                        <span className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 md:px-4 py-1.5 rounded-full flex items-center gap-2">
                            <ShieldCheck size={12} /> Verified Feedback
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-slate-300 font-black animate-pulse">Loading reviews...</div>
                    ) : reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review._id} className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            {review.reviewerName?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <h5 className="font-black text-slate-900 text-sm md:text-base">{review.reviewerName}</h5>
                                            <div className="flex gap-0.5 mt-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} fill={i < review.rating ? "#FBBF24" : "none"} className={i < review.rating ? "text-amber-400" : "text-slate-200"} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-600 font-medium leading-relaxed italic text-sm md:text-lg">"{review.comment}"</p>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 md:py-32 text-center bg-slate-50/50 rounded-[30px] md:rounded-[40px] border-4 border-dashed border-slate-100">
                             <Star size={40} className="mx-auto mb-4 text-slate-200" />
                             <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] md:text-xs">No reviews yet. Be the first to rate!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
