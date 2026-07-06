"use client";
import { useEffect, useState } from "react";
import { Loader2, Briefcase, CheckCircle2, Clock, XCircle, FileText, ChevronRight } from "lucide-react";
import UserSidebar from "@/components/UserSidebar"; 

export default function UserStatusPage() {
  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Status Page ની અંદર useEffect માં આટલું બદલો:
useEffect(() => {
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/applications");
      const result = await res.json();
      
      // જો result.data ના હોય તો ખાલી એરે [] સેટ કરો
      const apps = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
      
      setApplications(apps);
      
      setSummary({
        total: apps.length,
        approved: apps.filter(a => a.status?.toLowerCase().includes('app')).length,
        pending: apps.filter(a => a.status?.toLowerCase().includes('pen') || !a.status).length,
        rejected: apps.filter(a => a.status?.toLowerCase().includes('rej')).length,
      });
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchApplications();
}, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />
      <main className={`flex-1 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
        <div className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto">
          
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-10 bg-indigo-600 rounded-full"></div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Candidate Dashboard</p>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">My Journey</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard label="Applied" value={summary.total} icon={FileText} color="text-indigo-600" bgColor="bg-indigo-50" />
            <StatCard label="Approved" value={summary.approved} icon={CheckCircle2} color="text-emerald-600" bgColor="bg-emerald-50" />
            <StatCard label="Pending" value={summary.pending} icon={Clock} color="text-amber-600" bgColor="bg-amber-50" />
            <StatCard label="Rejected" value={summary.rejected} icon={XCircle} color="text-rose-600" bgColor="bg-rose-50" />
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
            {applications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">#</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Details</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {applications.map((app, i) => (
                      <tr key={app._id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-10 py-8 text-center font-black text-slate-200 group-hover:text-indigo-600 italic">
                          {(i + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                               <Briefcase size={22} />
                             </div>
                             <p className="font-black text-slate-800 text-xl">{app.role || "Job Role"}</p>
                           </div>
                        </td>
                        <td className="px-10 py-8"><StatusBadge status={app.status} /></td>
                        <td className="px-10 py-8 text-right font-bold text-slate-500 text-sm">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-GB') : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-32 text-center">
                <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                <h3 className="text-xl font-black text-slate-800 tracking-tight">No Journey Started</h3>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Fixed StatCard - Pass the component itself, not JSX
function StatCard({ label, value, color, bgColor, icon: Icon }) {
  return (
    <div className={`${bgColor} rounded-32px p-8 transition-all hover:-translate-y-1 border border-white/50 shadow-lg relative overflow-hidden group`}>
      <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-150 transition-all duration-700 ${color} rotate-12`}>
        <Icon size={80} /> 
      </div>
      <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm ${color}`}>
        <Icon size={24} />
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-5xl font-black tracking-tighter ${color}`}>{value.toString().padStart(2, '0')}</p>
    </div>
  );
}

function StatusBadge({ status = "" }) {
  const normalized = status?.toLowerCase() || "pending";
  const styles = {
    approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rejected: "bg-rose-50 text-rose-600 border-rose-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <span className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-2 inline-flex items-center gap-2 ${styles[normalized] || styles.pending}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${normalized === 'approved' ? 'bg-emerald-500' : normalized === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
      {normalized}
    </span>
  );
}