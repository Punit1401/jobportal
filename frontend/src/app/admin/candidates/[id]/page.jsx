"use client";
import { useEffect, useState } from "react";

export default function CandidateView({ params }) {
  const { id } = params;
  const [cand, setCand] = useState(null);

  useEffect(()=>{
    fetch(`/api/candidates/${id}`).then(r=>r.json()).then(setCand).catch(console.error);
  },[id]);

  if (!cand) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">{cand.name || cand.fullName}</h1>
      <p><strong>Email:</strong> {cand.email}</p>
      <p><strong>Phone:</strong> {cand.phone}</p>
      <p><strong>City:</strong> {cand.city}</p>
      <p><strong>Profession:</strong> {cand.profession}</p>
      <p className="mt-3"><strong>Skills:</strong> {(cand.skills||[]).join(", ")}</p>
      <p className="mt-4"><strong>Resume:</strong> {cand.resumeUrl ? <a href={cand.resumeUrl} target="_blank" className="text-blue-600">Open</a> : "—"}</p>
    </div>
  );
}
